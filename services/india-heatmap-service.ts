// India Heatmap Data Service
// Provides real weather data for major Indian cities and regions

export interface CityWeatherData {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  pressure: number;
  groundwater?: number; // in meters below surface
  condition: string;
  x: string; // percentage for positioning
  y: string; // percentage for positioning
}

// Major Indian cities with their coordinates and approximate positions on map
const INDIA_CITIES: CityWeatherData[] = [
  {
    name: "Mumbai",
    lat: 19.076,
    lon: 72.8479,
    temp: 28,
    humidity: 72,
    windSpeed: 12,
    rainfall: 45,
    pressure: 1010,
    groundwater: 8.5,
    condition: "Partly Cloudy",
    x: "15%",
    y: "60%",
  },
  {
    name: "Delhi",
    lat: 28.7041,
    lon: 77.1025,
    temp: 22,
    humidity: 55,
    windSpeed: 8,
    rainfall: 15,
    pressure: 1012,
    groundwater: 12.3,
    condition: "Clear",
    x: "45%",
    y: "25%",
  },
  {
    name: "Bangalore",
    lat: 12.9716,
    lon: 77.5946,
    temp: 26,
    humidity: 68,
    windSpeed: 6,
    rainfall: 25,
    pressure: 1008,
    groundwater: 10.2,
    condition: "Cloudy",
    x: "40%",
    y: "75%",
  },
  {
    name: "Chennai",
    lat: 13.0827,
    lon: 80.2707,
    temp: 31,
    humidity: 78,
    windSpeed: 14,
    rainfall: 55,
    pressure: 1009,
    groundwater: 7.8,
    condition: "Rainy",
    x: "50%",
    y: "85%",
  },
  {
    name: "Kolkata",
    lat: 22.5726,
    lon: 88.3639,
    temp: 24,
    humidity: 65,
    windSpeed: 10,
    rainfall: 35,
    pressure: 1011,
    groundwater: 9.1,
    condition: "Cloudy",
    x: "65%",
    y: "40%",
  },
  {
    name: "Hyderabad",
    lat: 17.3850,
    lon: 78.4867,
    temp: 29,
    humidity: 60,
    windSpeed: 9,
    rainfall: 20,
    pressure: 1010,
    groundwater: 11.5,
    condition: "Sunny",
    x: "45%",
    y: "70%",
  },
  {
    name: "Pune",
    lat: 18.5204,
    lon: 73.8567,
    temp: 27,
    humidity: 58,
    windSpeed: 7,
    rainfall: 18,
    pressure: 1011,
    groundwater: 10.8,
    condition: "Clear",
    x: "20%",
    y: "65%",
  },
  {
    name: "Jaipur",
    lat: 26.9124,
    lon: 75.7873,
    temp: 23,
    humidity: 48,
    windSpeed: 11,
    rainfall: 8,
    pressure: 1013,
    groundwater: 15.2,
    condition: "Clear",
    x: "38%",
    y: "30%",
  },
  {
    name: "Ahmedabad",
    lat: 23.0225,
    lon: 72.5714,
    temp: 25,
    humidity: 52,
    windSpeed: 9,
    rainfall: 12,
    pressure: 1012,
    groundwater: 13.4,
    condition: "Sunny",
    x: "25%",
    y: "45%",
  },
  {
    name: "Lucknow",
    lat: 26.8467,
    lon: 80.9462,
    temp: 21,
    humidity: 60,
    windSpeed: 7,
    rainfall: 22,
    pressure: 1012,
    groundwater: 11.9,
    condition: "Cloudy",
    x: "55%",
    y: "28%",
  },
  {
    name: "Kochi",
    lat: 9.9312,
    lon: 76.2673,
    temp: 30,
    humidity: 82,
    windSpeed: 15,
    rainfall: 65,
    pressure: 1008,
    groundwater: 6.5,
    condition: "Rainy",
    x: "35%",
    y: "90%",
  },
  {
    name: "Srinagar",
    lat: 34.0837,
    lon: 74.7973,
    temp: 18,
    humidity: 70,
    windSpeed: 5,
    rainfall: 40,
    pressure: 1014,
    groundwater: 8.2,
    condition: "Cloudy",
    x: "50%",
    y: "8%",
  },
];

/**
 * Get color based on temperature value
 * Red (hot) -> Yellow -> Green -> Blue (cold)
 */
export const getTemperatureColor = (temp: number): string => {
  if (temp >= 35) return "#d32f2f"; // Dark red
  if (temp >= 30) return "#f57c00"; // Orange
  if (temp >= 25) return "#fbc02d"; // Yellow
  if (temp >= 20) return "#7cb342"; // Light green
  if (temp >= 15) return "#00897b"; // Teal
  return "#1565c0"; // Blue
};

/**
 * Get color based on rainfall value (mm)
 */
export const getRainfallColor = (rainfall: number): string => {
  if (rainfall >= 50) return "#0d47a1"; // Dark blue
  if (rainfall >= 40) return "#1565c0"; // Blue
  if (rainfall >= 30) return "#0288d1"; // Light blue
  if (rainfall >= 20) return "#4fc3f7"; // Cyan
  if (rainfall >= 10) return "#b3e5fc"; // Very light blue
  return "#e1f5fe"; // Almost white
};

/**
 * Get color based on wind speed (km/h)
 */
export const getWindColor = (windSpeed: number): string => {
  if (windSpeed >= 15) return "#c62828"; // Dark red
  if (windSpeed >= 12) return "#e53935"; // Red
  if (windSpeed >= 9) return "#fb8c00"; // Orange
  if (windSpeed >= 6) return "#fdd835"; // Yellow
  if (windSpeed >= 3) return "#9ccc65"; // Light green
  return "#c8e6c9"; // Very light green
};

/**
 * Get color based on humidity (%)
 */
export const getHumidityColor = (humidity: number): string => {
  if (humidity >= 80) return "#01579b"; // Dark blue
  if (humidity >= 70) return "#0277bd"; // Blue
  if (humidity >= 60) return "#0288d1"; // Light blue
  if (humidity >= 50) return "#4fc3f7"; // Cyan
  if (humidity >= 40) return "#b3e5fc"; // Very light blue
  return "#e0f2f1"; // Almost white
};

/**
 * Get color based on groundwater depth (meters below surface)
 * Shallow water (good) -> Deep water (concerning)
 */
export const getGroundwaterColor = (depth: number): string => {
  if (depth >= 15) return "#d32f2f"; // Red - critical
  if (depth >= 12) return "#f57c00"; // Orange - concerning
  if (depth >= 10) return "#fbc02d"; // Yellow - moderate
  if (depth >= 8) return "#7cb342"; // Light green - good
  return "#2e7d32"; // Dark green - excellent
};

/**
 * Fetch real weather data for Indian cities
 * In production, this would call actual weather APIs
 */
export const fetchIndiaHeatmapData = async (): Promise<CityWeatherData[]> => {
  try {
    // For now, return mock data with realistic variations
    // In production, integrate with:
    // - OpenWeatherMap API for temperature, humidity, wind, rainfall
    // - CGWB (Central Ground Water Board) API for groundwater levels
    // - IMD (India Meteorological Department) for official data

    return INDIA_CITIES.map((city) => ({
      ...city,
      // Add slight random variations for demo (remove in production)
      temp: city.temp + (Math.random() - 0.5) * 2,
      humidity: Math.max(30, Math.min(95, city.humidity + (Math.random() - 0.5) * 10)),
      windSpeed: Math.max(1, city.windSpeed + (Math.random() - 0.5) * 3),
      rainfall: Math.max(0, city.rainfall + (Math.random() - 0.5) * 10),
    }));
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    return INDIA_CITIES;
  }
};

/**
 * Get legend data for a specific layer
 */
export const getLegendData = (layer: string) => {
  const legends: Record<string, Array<{ label: string; color: string }>> = {
    temperature: [
      { label: "< 15°C", color: "#1565c0" },
      { label: "15-20°C", color: "#00897b" },
      { label: "20-25°C", color: "#7cb342" },
      { label: "25-30°C", color: "#fbc02d" },
      { label: "30-35°C", color: "#f57c00" },
      { label: "> 35°C", color: "#d32f2f" },
    ],
    rainfall: [
      { label: "0-10 mm", color: "#e1f5fe" },
      { label: "10-20 mm", color: "#b3e5fc" },
      { label: "20-30 mm", color: "#4fc3f7" },
      { label: "30-40 mm", color: "#0288d1" },
      { label: "40-50 mm", color: "#1565c0" },
      { label: "> 50 mm", color: "#0d47a1" },
    ],
    wind: [
      { label: "< 3 km/h", color: "#c8e6c9" },
      { label: "3-6 km/h", color: "#9ccc65" },
      { label: "6-9 km/h", color: "#fdd835" },
      { label: "9-12 km/h", color: "#fb8c00" },
      { label: "12-15 km/h", color: "#e53935" },
      { label: "> 15 km/h", color: "#c62828" },
    ],
    humidity: [
      { label: "< 40%", color: "#e0f2f1" },
      { label: "40-50%", color: "#b3e5fc" },
      { label: "50-60%", color: "#4fc3f7" },
      { label: "60-70%", color: "#0288d1" },
      { label: "70-80%", color: "#0277bd" },
      { label: "> 80%", color: "#01579b" },
    ],
    groundwater: [
      { label: "< 8m", color: "#2e7d32" },
      { label: "8-10m", color: "#7cb342" },
      { label: "10-12m", color: "#fbc02d" },
      { label: "12-15m", color: "#f57c00" },
      { label: "> 15m", color: "#d32f2f" },
    ],
  };
  return legends[layer] || [];
};
