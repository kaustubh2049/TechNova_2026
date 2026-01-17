import { supabase } from "@/lib/supabase";

export interface StationReading {
  date: string;
  waterLevel: number;
}

export interface NearbyStation {
  wlcode: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  distance: number; // km
  status: 'safe' | 'warning' | 'critical';
  currentWaterLevel: number;
  readings: StationReading[];
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determine station status based on water level
 */
function getStationStatus(waterLevel: number): 'safe' | 'warning' | 'critical' {
  if (waterLevel < 3) return 'safe';
  if (waterLevel < 5) return 'warning';
  return 'critical';
}

/**
 * Parse date string DD-MM-YYYY to Date object
 */
function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Fetch nearest stations with their water level readings
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @param limit - Number of stations to return (default 15)
 * @param timeRange - '6m' | '1y' | '2y' - Number of readings to fetch
 */
export async function fetchNearbyStationsWithReadings(
  userLat: number,
  userLon: number,
  limit: number = 15,
  timeRange: '6m' | '1y' | '2y' = '1y'
): Promise<NearbyStation[]> {
  try {
    console.log(`Fetching stations near ${userLat}, ${userLon} with ${timeRange} data...`);

    // Determine how many readings to fetch based on time range
    const readingsCount = timeRange === '6m' ? 16 : timeRange === '1y' ? 32 : 65;

    // First, fetch station names from st_map_data table
    const { data: stationNamesData, error: namesError } = await supabase
      .from("st_map_data")
      .select("WLCODE, Area_Name");

    if (namesError) {
      console.error("Error fetching station names:", namesError);
    }

    // Create a map of WLCODE -> Area_Name
    const nameMap: Map<string, string> = new Map();
    if (stationNamesData) {
      for (const row of stationNamesData) {
        if (row.WLCODE && row.Area_Name) {
          nameMap.set(row.WLCODE, row.Area_Name);
        }
      }
    }
    console.log(`Loaded ${nameMap.size} station names from st_map_data`);

    // Now get station readings from district_data
    const { data: stationsData, error: stationsError } = await supabase
      .from("district_data")
      .select("WLCODE, LAT, LON, district, state, Water_Level, Date")
      .order("P_no", { ascending: true });

    if (stationsError) {
      console.error("Error fetching stations:", stationsError);
      return [];
    }

    if (!stationsData || stationsData.length === 0) {
      console.log("No stations found");
      return [];
    }

    // Group by WLCODE and get unique stations with their readings
    const stationMap: Map<string, {
      wlcode: string;
      lat: number;
      lon: number;
      district: string;
      state: string;
      areaName: string;
      readings: { date: string; waterLevel: number }[];
    }> = new Map();

    for (const row of stationsData) {
      const wlcode = row.WLCODE;
      if (!wlcode) continue;

      const lat = Number(row.LAT);
      const lon = Number(row.LON);
      
      if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) continue;

      if (!stationMap.has(wlcode)) {
        stationMap.set(wlcode, {
          wlcode,
          lat,
          lon,
          district: row.district || 'Unknown',
          state: row.state || 'Unknown',
          areaName: nameMap.get(wlcode) || '', // Get name from st_map_data
          readings: []
        });
      }

      const station = stationMap.get(wlcode)!;
      station.readings.push({
        date: row.Date || '',
        waterLevel: Number(row.Water_Level) || 0
      });
    }

    console.log(`Found ${stationMap.size} unique stations`);

    // Calculate distance for each station and sort
    const stationsWithDistance = Array.from(stationMap.values()).map(station => ({
      ...station,
      distance: calculateDistance(userLat, userLon, station.lat, station.lon)
    }));

    // Sort by distance and take nearest `limit` stations
    stationsWithDistance.sort((a, b) => a.distance - b.distance);
    const nearestStations = stationsWithDistance.slice(0, limit);

    console.log(`Returning ${nearestStations.length} nearest stations`);

    // Format result
    const result: NearbyStation[] = nearestStations.map(station => {
      // Sort readings by date (newest first) and limit
      const sortedReadings = station.readings
        .filter(r => r.date && r.waterLevel)
        .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
        .slice(0, readingsCount);

      const latestLevel = sortedReadings.length > 0 ? sortedReadings[0].waterLevel : 0;

      // Use Area_Name if available, otherwise fallback to district
      const displayName = station.areaName || station.district || station.wlcode;

      return {
        wlcode: station.wlcode,
        name: displayName,
        district: station.district,
        state: station.state,
        latitude: station.lat,
        longitude: station.lon,
        distance: Math.round(station.distance * 10) / 10, // Round to 1 decimal
        status: getStationStatus(latestLevel),
        currentWaterLevel: latestLevel,
        readings: sortedReadings.map(r => ({
          date: r.date,
          waterLevel: r.waterLevel
        })).reverse() // Oldest first for chart
      };
    });

    return result;
  } catch (err) {
    console.error("Error in fetchNearbyStationsWithReadings:", err);
    return [];
  }
}

/**
 * Fetch readings for a specific station
 */
export async function fetchStationReadings(
  wlcode: string,
  timeRange: '6m' | '1y' | '2y' = '1y'
): Promise<StationReading[]> {
  try {
    const readingsCount = timeRange === '6m' ? 16 : timeRange === '1y' ? 32 : 65;

    const { data, error } = await supabase
      .from("district_data")
      .select("Date, Water_Level")
      .eq("WLCODE", wlcode)
      .order("P_no", { ascending: true })
      .limit(readingsCount);

    if (error) {
      console.error(`Error fetching readings for ${wlcode}:`, error);
      return [];
    }

    return (data || [])
      .filter(r => r.Date && r.Water_Level)
      .map(r => ({
        date: r.Date,
        waterLevel: Number(r.Water_Level)
      }));
  } catch (err) {
    console.error(`Error in fetchStationReadings for ${wlcode}:`, err);
    return [];
  }
}
