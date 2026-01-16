// Wind Speed Service - Fetches and processes wind speed data
import { supabase } from "@/lib/supabase";

export interface WindSpeedData {
  id: string;
  latitude: number;
  longitude: number;
  windSpeed: number; // km/h
  windDirection: number; // degrees
  gustSpeed?: number; // km/h
  location: string;
  timestamp: string;
}

export interface ProcessedWindData extends WindSpeedData {
  color: string;
  opacity: number;
  category: string;
  intensity: string;
}

// Get color and properties based on wind speed (km/h)
export const getWindSpeedColor = (
  windSpeed: number
): { color: string; opacity: number; category: string; intensity: string } => {
  if (windSpeed >= 75) {
    return {
      color: "#7c2d12", // Dark red - Dangerous winds
      opacity: 0.9,
      category: "75+ km/h",
      intensity: "Dangerous",
    };
  } else if (windSpeed >= 50) {
    return {
      color: "#dc2626", // Red - Very strong winds
      opacity: 0.8,
      category: "50-75 km/h",
      intensity: "Very Strong",
    };
  } else if (windSpeed >= 35) {
    return {
      color: "#ea580c", // Orange - Strong winds
      opacity: 0.7,
      category: "35-50 km/h",
      intensity: "Strong",
    };
  } else if (windSpeed >= 25) {
    return {
      color: "#f59e0b", // Amber - Moderate winds
      opacity: 0.6,
      category: "25-35 km/h",
      intensity: "Moderate",
    };
  } else if (windSpeed >= 15) {
    return {
      color: "#84cc16", // Green - Light winds
      opacity: 0.5,
      category: "15-25 km/h",
      intensity: "Light",
    };
  } else if (windSpeed >= 5) {
    return {
      color: "#06b6d4", // Cyan - Very light winds
      opacity: 0.4,
      category: "5-15 km/h",
      intensity: "Very Light",
    };
  } else {
    return {
      color: "#64748b", // Gray - Calm
      opacity: 0.3,
      category: "Below 5 km/h",
      intensity: "Calm",
    };
  }
};

// Convert wind direction degrees to compass direction
export const getWindDirection = (degrees: number): string => {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Generate mock wind speed data for demonstration
// In a real app, this would fetch from zoom.earth API or similar service
export const fetchWindSpeedData = async (): Promise<ProcessedWindData[]> => {
  try {
    // Mock data covering major Indian cities and agricultural regions
    const mockWindData: WindSpeedData[] = [
      // Northern India
      {
        id: "1",
        latitude: 28.6139,
        longitude: 77.209,
        windSpeed: 12,
        windDirection: 45,
        location: "Delhi",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        latitude: 30.7333,
        longitude: 76.7794,
        windSpeed: 18,
        windDirection: 180,
        location: "Chandigarh",
        timestamp: new Date().toISOString(),
      },
      {
        id: "3",
        latitude: 26.9124,
        longitude: 75.7873,
        windSpeed: 22,
        windDirection: 270,
        location: "Jaipur",
        timestamp: new Date().toISOString(),
      },
      {
        id: "4",
        latitude: 25.5941,
        longitude: 85.1376,
        windSpeed: 8,
        windDirection: 90,
        location: "Patna",
        timestamp: new Date().toISOString(),
      },

      // Western India
      {
        id: "5",
        latitude: 19.076,
        longitude: 72.8777,
        windSpeed: 28,
        windDirection: 225,
        location: "Mumbai",
        timestamp: new Date().toISOString(),
      },
      {
        id: "6",
        latitude: 23.0225,
        longitude: 72.5714,
        windSpeed: 35,
        windDirection: 315,
        location: "Ahmedabad",
        timestamp: new Date().toISOString(),
      },
      {
        id: "7",
        latitude: 18.5204,
        longitude: 73.8567,
        windSpeed: 16,
        windDirection: 135,
        location: "Pune",
        timestamp: new Date().toISOString(),
      },

      // Southern India
      {
        id: "8",
        latitude: 12.9716,
        longitude: 77.5946,
        windSpeed: 14,
        windDirection: 60,
        location: "Bangalore",
        timestamp: new Date().toISOString(),
      },
      {
        id: "9",
        latitude: 13.0827,
        longitude: 80.2707,
        windSpeed: 32,
        windDirection: 180,
        location: "Chennai",
        timestamp: new Date().toISOString(),
      },
      {
        id: "10",
        latitude: 8.5241,
        longitude: 76.9366,
        windSpeed: 24,
        windDirection: 270,
        location: "Trivandrum",
        timestamp: new Date().toISOString(),
      },
      {
        id: "11",
        latitude: 17.385,
        longitude: 78.4867,
        windSpeed: 19,
        windDirection: 45,
        location: "Hyderabad",
        timestamp: new Date().toISOString(),
      },

      // Eastern India
      {
        id: "12",
        latitude: 22.5726,
        longitude: 88.3639,
        windSpeed: 26,
        windDirection: 90,
        location: "Kolkata",
        timestamp: new Date().toISOString(),
      },
      {
        id: "13",
        latitude: 20.2961,
        longitude: 85.8245,
        windSpeed: 42,
        windDirection: 135,
        location: "Bhubaneswar",
        timestamp: new Date().toISOString(),
      },

      // Central India
      {
        id: "14",
        latitude: 23.2599,
        longitude: 77.4126,
        windSpeed: 15,
        windDirection: 225,
        location: "Bhopal",
        timestamp: new Date().toISOString(),
      },
      {
        id: "15",
        latitude: 21.1458,
        longitude: 79.0882,
        windSpeed: 20,
        windDirection: 315,
        location: "Nagpur",
        timestamp: new Date().toISOString(),
      },

      // Agricultural regions
      {
        id: "16",
        latitude: 29.9457,
        longitude: 76.8154,
        windSpeed: 11,
        windDirection: 180,
        location: "Rohtak",
        timestamp: new Date().toISOString(),
      },
      {
        id: "17",
        latitude: 30.3398,
        longitude: 76.3869,
        windSpeed: 17,
        windDirection: 270,
        location: "Patiala",
        timestamp: new Date().toISOString(),
      },
      {
        id: "18",
        latitude: 26.4499,
        longitude: 80.3319,
        windSpeed: 9,
        windDirection: 45,
        location: "Kanpur",
        timestamp: new Date().toISOString(),
      },
      {
        id: "19",
        latitude: 19.9975,
        longitude: 73.7898,
        windSpeed: 29,
        windDirection: 135,
        location: "Nashik",
        timestamp: new Date().toISOString(),
      },
      {
        id: "20",
        latitude: 11.0168,
        longitude: 76.9558,
        windSpeed: 21,
        windDirection: 225,
        location: "Coimbatore",
        timestamp: new Date().toISOString(),
      },
    ];

    // Process the data with colors and categories
    const processedData: ProcessedWindData[] = mockWindData.map((item) => {
      const windProps = getWindSpeedColor(item.windSpeed);
      return {
        ...item,
        ...windProps,
      };
    });

    return processedData;
  } catch (error) {
    console.error("Error fetching wind speed data:", error);
    throw error;
  }
};

// Fetch real-time wind data (placeholder for future zoom.earth integration)
export const fetchRealTimeWindData = async (): Promise<ProcessedWindData[]> => {
  // This would integrate with zoom.earth API in a real implementation
  // For now, return mock data with some randomization to simulate real-time updates
  const baseData = await fetchWindSpeedData();

  return baseData.map((item) => {
    // Add some randomization to simulate real-time changes
    const speedVariation = (Math.random() - 0.5) * 10;
    const newSpeed = Math.max(0, item.windSpeed + speedVariation);
    const directionVariation = (Math.random() - 0.5) * 60;
    const newDirection = (item.windDirection + directionVariation + 360) % 360;

    const windProps = getWindSpeedColor(newSpeed);

    return {
      ...item,
      windSpeed: Math.round(newSpeed),
      windDirection: Math.round(newDirection),
      ...windProps,
      timestamp: new Date().toISOString(),
    };
  });
};
