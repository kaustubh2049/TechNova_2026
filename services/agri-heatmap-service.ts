// Agricultural Heatmap Data Service
// Provides agricultural data for major Indian cities and farming regions

export interface AgriCityData {
  state: string;
  city: string;
  lat: number;
  lon: number;
  rainfall: number; // mm per year
  soilType: string;
  avgTemp: number; // Celsius
  altitude: number; // meters
  x: string; // percentage for positioning on map
  y: string; // percentage for positioning on map
}

// Comprehensive agricultural data for Indian cities
export const INDIA_AGRI_DATA: AgriCityData[] = [
  // --- MAHARASHTRA (Detailed) ---
  {
    state: "Maharashtra",
    city: "Mumbai",
    lat: 19.076,
    lon: 72.8777,
    rainfall: 2400,
    soilType: "Coastal Alluvial",
    avgTemp: 27.2,
    altitude: 14,
    x: "16.5%",
    y: "68.5%",
  },
  {
    state: "Maharashtra",
    city: "Ratnagiri",
    lat: 16.9902,
    lon: 73.312,
    rainfall: 3000,
    soilType: "Laterite (Red)",
    avgTemp: 26.5,
    altitude: 11,
    x: "18.3%",
    y: "76.3%",
  },
  {
    state: "Maharashtra",
    city: "Pune",
    lat: 18.5204,
    lon: 73.8567,
    rainfall: 722,
    soilType: "Medium Black",
    avgTemp: 25.0,
    altitude: 560,
    x: "20.1%",
    y: "70.4%",
  },
  {
    state: "Maharashtra",
    city: "Nashik",
    lat: 19.9975,
    lon: 73.7898,
    rainfall: 690,
    soilType: "Coarse Shallow",
    avgTemp: 24.5,
    altitude: 584,
    x: "19.9%",
    y: "65.1%",
  },
  {
    state: "Maharashtra",
    city: "Nagpur",
    lat: 21.1458,
    lon: 79.0882,
    rainfall: 1160,
    soilType: "Deep Black Cotton",
    avgTemp: 28.0,
    altitude: 310,
    x: "38.0%",
    y: "59.8%",
  },

  // --- REST OF INDIA (Key Agricultural Hubs) ---
  {
    state: "Punjab",
    city: "Amritsar",
    lat: 31.634,
    lon: 74.8723,
    rainfall: 780,
    soilType: "Alluvial",
    avgTemp: 24.2,
    altitude: 234,
    x: "23.5%",
    y: "12.5%",
  },
  {
    state: "Haryana",
    city: "Ambala",
    lat: 30.3782,
    lon: 76.7767,
    rainfall: 1000,
    soilType: "Alluvial",
    avgTemp: 24.5,
    altitude: 276,
    x: "30.1%",
    y: "17.1%",
  },
  {
    state: "Uttar Pradesh",
    city: "Lucknow",
    lat: 26.8467,
    lon: 80.9462,
    rainfall: 900,
    soilType: "Alluvial",
    avgTemp: 26.2,
    altitude: 123,
    x: "44.6%",
    y: "30.1%",
  },
  {
    state: "Rajasthan",
    city: "Jaipur",
    lat: 26.9124,
    lon: 75.7873,
    rainfall: 600,
    soilType: "Desert/Sierozem",
    avgTemp: 28.0,
    altitude: 431,
    x: "26.7%",
    y: "29.9%",
  },
  {
    state: "Gujarat",
    city: "Ahmedabad",
    lat: 23.0225,
    lon: 72.5714,
    rainfall: 800,
    soilType: "Black Cotton",
    avgTemp: 29.0,
    altitude: 53,
    x: "15.8%",
    y: "44.4%",
  },
  {
    state: "West Bengal",
    city: "Kolkata",
    lat: 22.5726,
    lon: 88.3639,
    rainfall: 1600,
    soilType: "Alluvial",
    avgTemp: 27.0,
    altitude: 9,
    x: "70.1%",
    y: "46.1%",
  },
  {
    state: "Karnataka",
    city: "Bangalore",
    lat: 12.9716,
    lon: 77.5946,
    rainfall: 900,
    soilType: "Red Loam",
    avgTemp: 24.0,
    altitude: 920,
    x: "32.9%",
    y: "81.6%",
  },
  {
    state: "Tamil Nadu",
    city: "Chennai",
    lat: 13.0827,
    lon: 80.2707,
    rainfall: 1400,
    soilType: "Coastal Alluvial",
    avgTemp: 30.0,
    altitude: 7,
    x: "42.1%",
    y: "81.2%",
  },
  {
    state: "Kerala",
    city: "Thiruvananthapuram",
    lat: 8.5241,
    lon: 76.9366,
    rainfall: 1700,
    soilType: "Laterite",
    avgTemp: 28.0,
    altitude: 8,
    x: "30.8%",
    y: "98.1%",
  },
  {
    state: "Andhra Pradesh",
    city: "Visakhapatnam",
    lat: 17.6868,
    lon: 83.2185,
    rainfall: 1100,
    soilType: "Red Loam",
    avgTemp: 29.0,
    altitude: 45,
    x: "52.5%",
    y: "72.7%",
  },
];

// Color calculation functions for different agricultural parameters
export const getAgriRainfallColor = (rainfall: number): string => {
  if (rainfall >= 2500) return "#1e3a8a"; // Deep blue - very high
  if (rainfall >= 1800) return "#3b82f6"; // Blue - high
  if (rainfall >= 1200) return "#60a5fa"; // Light blue - moderate high
  if (rainfall >= 800) return "#93c5fd"; // Pale blue - moderate
  if (rainfall >= 500) return "#fbbf24"; // Yellow - low moderate
  return "#dc2626"; // Red - very low (drought prone)
};

export const getSoilTypeColor = (soilType: string): string => {
  if (soilType.includes("Black") || soilType.includes("Cotton"))
    return "#374151"; // Dark gray - black soil
  if (soilType.includes("Red") || soilType.includes("Laterite"))
    return "#dc2626"; // Red - red soil
  if (soilType.includes("Alluvial")) return "#16a34a"; // Green - alluvial
  if (soilType.includes("Desert") || soilType.includes("Sierozem"))
    return "#f59e0b"; // Orange - desert
  if (soilType.includes("Mountain") || soilType.includes("Forest"))
    return "#059669"; // Teal - mountain/forest
  if (soilType.includes("Coastal")) return "#0ea5e9"; // Sky blue - coastal
  return "#6b7280"; // Gray - other
};

export const getAltitudeColor = (altitude: number): string => {
  if (altitude >= 1500) return "#7c3aed"; // Purple - very high
  if (altitude >= 800) return "#a855f7"; // Light purple - high
  if (altitude >= 400) return "#c084fc"; // Pale purple - moderate high
  if (altitude >= 100) return "#ddd6fe"; // Very light purple - moderate
  return "#10b981"; // Green - low (plains)
};

export const getCropSuitabilityColor = (
  rainfall: number,
  temp: number,
  soilType: string
): string => {
  // Rice - needs high water
  if (rainfall >= 1200 && temp >= 25 && soilType.includes("Alluvial"))
    return "#16a34a";

  // Wheat - temperate, moderate water
  if (rainfall >= 400 && rainfall <= 1000 && temp >= 15 && temp <= 25)
    return "#f59e0b";

  // Cotton - black soil, moderate water
  if (soilType.includes("Black") && rainfall >= 500 && rainfall <= 1200)
    return "#8b5cf6";

  // Sugarcane - high water, warm
  if (rainfall >= 1000 && temp >= 26) return "#06b6d4";

  // Pulses - moderate conditions
  if (rainfall >= 400 && rainfall <= 800) return "#84cc16";

  return "#6b7280"; // Default - mixed/other crops
};

// Get agricultural insights for a region
export const getAgriInsights = (data: AgriCityData): string[] => {
  const insights: string[] = [];

  // Rainfall insights
  if (data.rainfall >= 2000) {
    insights.push("🌧️ Excellent for paddy cultivation");
  } else if (data.rainfall <= 600) {
    insights.push("🌵 Requires irrigation for most crops");
  }

  // Soil insights
  if (data.soilType.includes("Black")) {
    insights.push("🌱 Ideal for cotton and sugarcane");
  } else if (data.soilType.includes("Alluvial")) {
    insights.push("🌾 Perfect for cereal crops");
  } else if (data.soilType.includes("Red")) {
    insights.push("🥜 Suitable for cash crops");
  }

  // Temperature insights
  if (data.avgTemp >= 28) {
    insights.push("☀️ Hot climate - heat-resistant varieties");
  } else if (data.avgTemp <= 20) {
    insights.push("❄️ Cool climate - temperate crops");
  }

  // Altitude insights
  if (data.altitude >= 1000) {
    insights.push("🏔️ High altitude - specialty crops");
  }

  return insights;
};

// Get legend data for different agricultural parameters
export const getAgriLegendData = (
  parameter: "rainfall" | "soil" | "altitude" | "suitability"
) => {
  switch (parameter) {
    case "rainfall":
      return [
        {
          color: "#dc2626",
          label: "< 500mm (Drought Prone)",
          range: "Very Low",
        },
        {
          color: "#fbbf24",
          label: "500-800mm (Irrigation Needed)",
          range: "Low",
        },
        { color: "#93c5fd", label: "800-1200mm (Moderate)", range: "Moderate" },
        { color: "#60a5fa", label: "1200-1800mm (Good)", range: "High" },
        {
          color: "#3b82f6",
          label: "1800-2500mm (Excellent)",
          range: "Very High",
        },
        {
          color: "#1e3a8a",
          label: "> 2500mm (Abundant)",
          range: "Exceptional",
        },
      ];

    case "soil":
      return [
        {
          color: "#374151",
          label: "Black Cotton Soil",
          range: "Cotton/Sugarcane",
        },
        { color: "#dc2626", label: "Red/Laterite Soil", range: "Cash Crops" },
        { color: "#16a34a", label: "Alluvial Soil", range: "Cereals" },
        { color: "#f59e0b", label: "Desert Soil", range: "Drought Resistant" },
        {
          color: "#059669",
          label: "Mountain/Forest",
          range: "Specialty Crops",
        },
        { color: "#0ea5e9", label: "Coastal Soil", range: "Coconut/Spices" },
      ];

    case "altitude":
      return [
        { color: "#10b981", label: "< 100m (Plains)", range: "All Crops" },
        {
          color: "#ddd6fe",
          label: "100-400m (Low Hills)",
          range: "Most Crops",
        },
        { color: "#c084fc", label: "400-800m (Hills)", range: "Some Crops" },
        {
          color: "#a855f7",
          label: "800-1500m (High Hills)",
          range: "Limited Crops",
        },
        {
          color: "#7c3aed",
          label: "> 1500m (Mountains)",
          range: "Specialty Only",
        },
      ];

    default:
      return [];
  }
};

export default {
  INDIA_AGRI_DATA,
  getAgriRainfallColor,
  getSoilTypeColor,
  getAltitudeColor,
  getCropSuitabilityColor,
  getAgriInsights,
  getAgriLegendData,
};
