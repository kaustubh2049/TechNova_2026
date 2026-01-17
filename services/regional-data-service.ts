import { supabase } from "@/lib/supabase";

export interface RegionalData {
  id: string;
  region_name: string;
  avg_water_level: number;
  status: "normal" | "warning" | "critical";
  statusColor: string;
  statusText: string;
}

/**
 * Fetches regional analysis data from Supabase
 * Each region shows average water level and status
 * Table: regional_data
 * Columns: District, Average_Water_Level
 */
export async function fetchRegionalData(): Promise<RegionalData[]> {
  try {
    const { data, error } = await supabase
      .from("regional_data")
      .select("*")
      .order("District", { ascending: true });

    if (error) {
      console.error("Error fetching regional data:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("No regional data found");
      return [];
    }

    console.log("Fetched regional data from Supabase:", data);

    // Map and classify regional data
    const regionalData: RegionalData[] = data.map((row: any) => {
      const avgLevel = Number(row.Average_Water_Level ?? 0);
      const districtName = String(row.District || "Unknown District");
      
      // Classification for regional data (matching individual DWLR stations):
      // SAFE (green): < 3m
      // SEMI-CRITICAL (orange): 3-5m  
      // CRITICAL (red): > 5m
      let status: "normal" | "warning" | "critical" = "normal";
      let statusColor = "#22c55e"; // Green
      let statusText = "SAFE";

      if (avgLevel > 5) {
        status = "critical";
        statusColor = "#F96E5B"; // Red
        statusText = "CRITICAL";
      } else if (avgLevel >= 3) {
        status = "warning";
        statusColor = "#F59E0B"; // Orange
        statusText = "SEMI-CRITICAL";
      }

      console.log(`District: ${districtName}, Avg Water Level: ${avgLevel}m, Status: ${statusText}`);

      return {
        id: String(row.id || districtName),
        region_name: districtName,
        avg_water_level: avgLevel,
        status,
        statusColor,
        statusText,
      };
    });

    console.log(`Loaded ${regionalData.length} regional data entries`);
    return regionalData;
  } catch (err) {
    console.error("Failed to fetch regional data:", err);
    return [];
  }
}
