// Rainfall Heatmap Service - Fetches and processes rainfall data from Supabase
import { supabase } from "@/lib/supabase";

export interface RainfallData {
  sr: number;
  state: string;
  district: string;
  period_actual_mm: number;
  latitude: number;
  longitude: number;
}

export interface ProcessedRainfallData extends RainfallData {
  color: string;
  opacity: number;
  category: string;
}

// Get color based on rainfall amount using your specified ranges
export const getRainfallColor = (
  rainfall: number
): { color: string; opacity: number; category: string } => {
  if (rainfall >= 250) {
    return {
      color: "#0f172a", // Very dark blue (like in your image)
      opacity: 0.9,
      category: "Over 250 mm",
    };
  } else if (rainfall >= 150) {
    return {
      color: "#1e40af", // Dark blue
      opacity: 0.8,
      category: "150-250 mm",
    };
  } else if (rainfall >= 100) {
    return {
      color: "#3b82f6", // Medium blue
      opacity: 0.7,
      category: "100-150 mm",
    };
  } else if (rainfall >= 60) {
    return {
      color: "#60a5fa", // Light blue
      opacity: 0.6,
      category: "60-100 mm",
    };
  } else if (rainfall >= 40) {
    return {
      color: "#93c5fd", // Very light blue
      opacity: 0.5,
      category: "40-60 mm",
    };
  } else if (rainfall >= 20) {
    return {
      color: "#fde68a", // Light yellow (like in your image)
      opacity: 0.4,
      category: "20-40 mm",
    };
  } else {
    return {
      color: "#fef3c7", // Very light beige/cream
      opacity: 0.3,
      category: "Below 20 mm",
    };
  }
};

// Fetch rainfall data from Supabase
export const fetchRainfallHeatmapData = async (): Promise<
  ProcessedRainfallData[]
> => {
  try {
    const { data, error } = await supabase
      .from("rainfall_heatmap")
      .select("sr, State, District, Period_Actual_mm, Latitude, Longitude")
      .order("Period_Actual_mm", { ascending: false });

    if (error) {
      console.error("Error fetching rainfall data:", error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Process the data and add color information
    const processedData: ProcessedRainfallData[] = data.map((item) => {
      const colorInfo = getRainfallColor(item.Period_Actual_mm || 0);

      return {
        sr: item.sr,
        state: item.State || "",
        district: item.District || "",
        period_actual_mm: item.Period_Actual_mm || 0,
        latitude: item.Latitude || 0,
        longitude: item.Longitude || 0,
        color: colorInfo.color,
        opacity: colorInfo.opacity,
        category: colorInfo.category,
      };
    });

    console.log(`Fetched ${processedData.length} rainfall data points`);
    return processedData;
  } catch (error) {
    console.error("Failed to fetch rainfall heatmap data:", error);
    throw error;
  }
};

// Get legend data for the rainfall visualization
export const getRainfallLegend = () => [
  {
    color: "#fbbf24",
    label: "0-50 mm",
    description: "Very Low (Drought Prone)",
  },
  {
    color: "#60a5fa",
    label: "50-100 mm",
    description: "Low (Irrigation Needed)",
  },
  { color: "#3b82f6", label: "100-150 mm", description: "Moderate" },
  { color: "#2563eb", label: "150-250 mm", description: "High" },
  { color: "#1e3a8a", label: "250+ mm", description: "Very High (Abundant)" },
];

// Calculate radius for district coverage on map
export const calculateDistrictRadius = (rainfall: number): number => {
  // Base radius between 5-25 km based on rainfall intensity
  const baseRadius = 8000; // 8km base
  const maxRadius = 25000; // 25km max
  const rainfallFactor = Math.min(rainfall / 300, 1); // Normalize to 0-1

  return baseRadius + rainfallFactor * (maxRadius - baseRadius);
};

// Get statistics for the current rainfall data
export const getRainfallStats = (data: ProcessedRainfallData[]) => {
  if (data.length === 0) {
    return {
      total: 0,
      average: 0,
      max: 0,
      min: 0,
      highRainfallDistricts: 0,
    };
  }

  const rainfallValues = data.map((d) => d.period_actual_mm);
  const total = data.length;
  const sum = rainfallValues.reduce((acc, val) => acc + val, 0);
  const average = sum / total;
  const max = Math.max(...rainfallValues);
  const min = Math.min(...rainfallValues);
  const highRainfallDistricts = data.filter(
    (d) => d.period_actual_mm >= 150
  ).length;

  return {
    total,
    average: Math.round(average * 10) / 10,
    max,
    min,
    highRainfallDistricts,
  };
};
