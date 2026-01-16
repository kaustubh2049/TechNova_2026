export interface WeatherData {
  current: {
    temp: number;
    condition: string;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    visibility: number;
    feelsLike: number;
    dewPoint: number;
    uvIndex: number;
    sunrise: number;
    sunset: number;
    city: string;
  };
  forecast: Array<{
    dt: number;
    temp: number;
    temp_min: number;
    temp_max: number;
    condition: string;
    icon: string;
    date: string;
    humidity: number;
    windSpeed: number;
  }>;
}

const API_KEY =
  process.env.EXPO_PUBLIC_WEATHER_KEY || "d85450b8a3dc4ad78c7140734250312";
const BASE_URL = "https://api.weatherapi.com/v1";

export const fetchWeather = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  try {
    // Single call to WeatherAPI forecast endpoint (includes current + forecast)
    const res = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=no`
    );
    const data = await res.json();

    if (!res.ok || (data && data.error)) {
      console.warn(
        "WeatherAPI error:",
        data?.error?.code,
        data?.error?.message || res.statusText
      );
      return getMockWeatherData();
    }

    const current = data.current;
    const location = data.location;
    const forecastDays: any[] = data.forecast?.forecastday ?? [];

    const dewPoint =
      typeof current.dewpoint_c === "number"
        ? Math.round(current.dewpoint_c)
        : Math.round(
            current.temp_c - (100 - current.humidity) / 5 // fallback approximation
          );

    // Parse sunrise/sunset from first forecast day if available
    let sunriseEpoch = 0;
    let sunsetEpoch = 0;
    if (forecastDays.length > 0) {
      const first = forecastDays[0];
      const dateStr = first.date; // yyyy-MM-dd
      const sunriseStr: string | undefined = first.astro?.sunrise; // "06:15 AM"
      const sunsetStr: string | undefined = first.astro?.sunset;

      const toEpoch = (timeStr?: string) => {
        if (!dateStr || !timeStr) return 0;
        const d = new Date(`${dateStr} ${timeStr}`);
        return isNaN(d.getTime()) ? 0 : Math.floor(d.getTime() / 1000);
      };

      sunriseEpoch = toEpoch(sunriseStr);
      sunsetEpoch = toEpoch(sunsetStr);
    }

    return {
      current: {
        temp: Math.round(current.temp_c),
        condition: current.condition?.text ?? "",
        description: current.condition?.text ?? "",
        icon: current.condition?.icon ?? "",
        humidity: current.humidity,
        windSpeed: current.wind_kph, // kph
        windDirection: current.wind_degree,
        pressure: current.pressure_mb,
        visibility: current.vis_km,
        feelsLike: Math.round(current.feelslike_c),
        dewPoint,
        uvIndex: current.uv ?? 0,
        sunrise: sunriseEpoch,
        sunset: sunsetEpoch,
        city: location?.name ?? "",
      },
      forecast: forecastDays.slice(0, 5).map((fd: any) => ({
        dt: fd.date_epoch,
        temp: Math.round(fd.day?.avgtemp_c ?? fd.day?.maxtemp_c ?? 0),
        temp_min: Math.round(fd.day?.mintemp_c ?? 0),
        temp_max: Math.round(fd.day?.maxtemp_c ?? 0),
        condition: fd.day?.condition?.text ?? "",
        icon: fd.day?.condition?.icon ?? "",
        date: new Date(fd.date).toLocaleDateString(undefined, {
          weekday: "short",
        }),
        humidity: fd.day?.avghumidity ?? 0,
        windSpeed: fd.day?.maxwind_kph ?? 0,
      })),
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    // Fallback to mock data on any error to keep UI functional
    return getMockWeatherData();
  }
};

const getMockWeatherData = (): WeatherData => {
  return {
    current: {
      temp: 28,
      condition: "Clear",
      description: "clear sky",
      icon: "01d",
      humidity: 45,
      windSpeed: 5.2,
      windDirection: 180,
      pressure: 1013,
      visibility: 10,
      feelsLike: 30,
      dewPoint: 18,
      uvIndex: 6,
      sunrise: 1694400000,
      sunset: 1694445000,
      city: "Demo Location (API Error)",
    },
    forecast: [
      {
        dt: 1694486400,
        temp: 29,
        temp_min: 22,
        temp_max: 29,
        condition: "Clouds",
        icon: "02d",
        date: "Tue",
        humidity: 50,
        windSpeed: 4.5,
      },
      {
        dt: 1694572800,
        temp: 27,
        temp_min: 21,
        temp_max: 27,
        condition: "Rain",
        icon: "10d",
        date: "Wed",
        humidity: 75,
        windSpeed: 6.2,
      },
      {
        dt: 1694659200,
        temp: 26,
        temp_min: 20,
        temp_max: 26,
        condition: "Rain",
        icon: "10d",
        date: "Thu",
        humidity: 80,
        windSpeed: 7.1,
      },
      {
        dt: 1694745600,
        temp: 28,
        temp_min: 21,
        temp_max: 28,
        condition: "Clear",
        icon: "01d",
        date: "Fri",
        humidity: 40,
        windSpeed: 3.8,
      },
      {
        dt: 1694832000,
        temp: 29,
        temp_min: 22,
        temp_max: 29,
        condition: "Clouds",
        icon: "03d",
        date: "Sat",
        humidity: 55,
        windSpeed: 5.0,
      },
    ],
  };
};
