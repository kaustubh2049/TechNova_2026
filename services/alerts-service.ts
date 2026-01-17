import { supabase } from "@/lib/supabase";

export interface GroundwaterAlert {
  id: number;
  wlcode: string;
  alert_type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  water_level: number;
  triggered_at: string;
  acknowledged: boolean;
}

/**
 * Fetches groundwater alerts from Supabase
 * @param limit - Number of alerts to fetch
 * @param onlyUnacknowledged - Filter for unacknowledged alerts only
 */
export async function fetchGroundwaterAlerts(
  limit: number = 10,
  onlyUnacknowledged: boolean = true
): Promise<GroundwaterAlert[]> {
  try {
    let query = supabase
      .from("groundwater_alerts")
      .select("*")
      .order("triggered_at", { ascending: false })
      .limit(limit);

    if (onlyUnacknowledged) {
      query = query.eq("acknowledged", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching groundwater alerts:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Failed to fetch groundwater alerts:", err);
    return [];
  }
}

/**
 * Fetches alerts for a specific station
 */
export async function fetchStationAlerts(
  wlcode: string,
  limit: number = 5
): Promise<GroundwaterAlert[]> {
  try {
    const { data, error } = await supabase
      .from("groundwater_alerts")
      .select("*")
      .eq("wlcode", wlcode)
      .eq("acknowledged", false)
      .order("triggered_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error(`Error fetching alerts for ${wlcode}:`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`Failed to fetch alerts for ${wlcode}:`, err);
    return [];
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("groundwater_alerts")
      .update({ acknowledged: true })
      .eq("id", alertId);

    if (error) {
      console.error("Error acknowledging alert:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to acknowledge alert:", err);
    return false;
  }
}

/**
 * Get alert color based on severity
 */
export function getAlertColor(severity: string): string {
  switch (severity) {
    case "HIGH":
      return "#F96E5B"; // Red
    case "MEDIUM":
      return "#F59E0B"; // Orange
    case "LOW":
      return "#eab308"; // Yellow
    default:
      return "#9CA3AF"; // Gray
  }
}

/**
 * Get alert icon based on type
 */
export function getAlertIcon(alertType: string): string {
  switch (alertType) {
    case "CRITICAL_LEVEL":
      return "🚨";
    case "RAPID_DECLINE":
      return "📉";
    case "LOW_LEVEL_WARNING":
      return "⚠️";
    default:
      return "ℹ️";
  }
}
