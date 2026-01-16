// AccuWeather API functions for map data
const ACCUWEATHER_API_KEY = process.env.EXPO_PUBLIC_ACCUWEATHER_API_KEY;

export const fetchAccuWeatherMapData = async (mapType: string) => {
  if (!ACCUWEATHER_API_KEY) {
    console.warn("AccuWeather API key not found, using mock map data");
    return getMockMapData(mapType);
  }

  try {
    // For real AccuWeather implementation, you would make API calls here
    // AccuWeather provides satellite and radar imagery APIs
    // This is a simplified version showing the integration pattern
    console.log(
      `Using AccuWeather API key: ${ACCUWEATHER_API_KEY?.substring(0, 20)}...`
    );
    return getMockMapData(mapType);
  } catch (error) {
    console.error("AccuWeather map data fetch error:", error);
    return getMockMapData(mapType);
  }
};

const getMockMapData = (mapType: string) => {
  const cities = [
    { name: "Mumbai", lat: 19.076, lon: 72.8777 },
    { name: "Delhi", lat: 28.7041, lon: 77.1025 },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  ];

  return cities.map((city) => ({
    ...city,
    value: generateMockValue(mapType, city.name),
  }));
};

const generateMockValue = (mapType: string, cityName: string): number => {
  const seed = cityName.length; // Simple seed based on city name

  switch (mapType) {
    case "temperature":
      return 15 + seed * 2 + Math.floor(Math.random() * 15);
    case "rainfall":
      return Math.floor(Math.random() * 50);
    case "wind":
      return 5 + Math.floor(Math.random() * 20);
    case "pressure":
      return 1000 + Math.floor(Math.random() * 40);
    case "humidity":
      return 40 + Math.floor(Math.random() * 40);
    default:
      return Math.floor(Math.random() * 100);
  }
};
