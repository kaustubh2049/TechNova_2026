import { supabase } from "@/lib/supabase";
import * as Location from "expo-location";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Platform } from "react-native";

export interface DatabaseReading {
  P_no: number;
  WLCODE: string;
  SITE_TYPE: string;
  LAT: number;
  LON: number;
  Water_Level: number;
}

export interface Station {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  currentLevel: number;
  status: "normal" | "warning" | "critical";
  batteryLevel: number;
  signalStrength: number;
  availabilityIndex: number;
  lastUpdated: string;
  aquiferType: string;
  specificYield: number;
  installationDate: string;
  depth: number;
  oxygenLevel?: number;
  temperature?: number;
  week?: number | string;
  distance?: number; // Distance in kilometers from user location
  recentReadings: {
    timestamp: string;
    level: number;
    temperature?: number;
  }[];
  rechargeData: {
    date: string;
    amount: number;
  }[];
}

export interface Alert {
  id: string;
  stationId: string;
  stationName: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const mockStations: Station[] = [
  {
    id: "DWLR_001",
    name: "Patna Central",
    district: "Patna",
    state: "Bihar",
    latitude: 25.5941,
    longitude: 85.1376,
    currentLevel: 12.45,
    status: "normal",
    batteryLevel: 85,
    signalStrength: 78,
    availabilityIndex: 0.75,
    lastUpdated: "2024-01-15T10:30:00Z",
    aquiferType: "Alluvial",
    specificYield: 0.15,
    installationDate: "2023-03-15",
    depth: 45.0,
    recentReadings: [
      { timestamp: "2024-01-15T10:30:00Z", level: 12.45, temperature: 24.5 },
      { timestamp: "2024-01-15T09:30:00Z", level: 12.48, temperature: 24.2 },
      { timestamp: "2024-01-15T08:30:00Z", level: 12.52, temperature: 23.8 },
      { timestamp: "2024-01-15T07:30:00Z", level: 12.55, temperature: 23.5 },
      { timestamp: "2024-01-15T06:30:00Z", level: 12.58, temperature: 23.2 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 15.2 },
      { date: "2024-01-11", amount: 8.7 },
      { date: "2024-01-12", amount: 22.1 },
      { date: "2024-01-13", amount: 5.3 },
      { date: "2024-01-14", amount: 18.9 },
    ],
  },
  {
    id: "DWLR_002",
    name: "Gaya North",
    district: "Gaya",
    state: "Bihar",
    latitude: 24.7914,
    longitude: 85.0002,
    currentLevel: 18.72,
    status: "warning",
    batteryLevel: 45,
    signalStrength: 65,
    availabilityIndex: 0.45,
    lastUpdated: "2024-01-15T10:25:00Z",
    aquiferType: "Hard Rock",
    specificYield: 0.08,
    installationDate: "2023-05-20",
    depth: 38.5,
    recentReadings: [
      { timestamp: "2024-01-15T10:25:00Z", level: 18.72, temperature: 25.1 },
      { timestamp: "2024-01-15T09:25:00Z", level: 18.69, temperature: 24.8 },
      { timestamp: "2024-01-15T08:25:00Z", level: 18.65, temperature: 24.5 },
      { timestamp: "2024-01-15T07:25:00Z", level: 18.62, temperature: 24.2 },
      { timestamp: "2024-01-15T06:25:00Z", level: 18.58, temperature: 23.9 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 3.2 },
      { date: "2024-01-11", amount: 1.7 },
      { date: "2024-01-12", amount: 7.1 },
      { date: "2024-01-13", amount: 2.3 },
      { date: "2024-01-14", amount: 4.9 },
    ],
  },
  {
    id: "DWLR_003",
    name: "Muzaffarpur East",
    district: "Muzaffarpur",
    state: "Bihar",
    latitude: 26.1209,
    longitude: 85.3647,
    currentLevel: 25.89,
    status: "critical",
    batteryLevel: 25,
    signalStrength: 42,
    availabilityIndex: 0.25,
    lastUpdated: "2024-01-15T10:20:00Z",
    aquiferType: "Alluvial",
    specificYield: 0.12,
    installationDate: "2023-02-10",
    depth: 42.0,
    recentReadings: [
      { timestamp: "2024-01-15T10:20:00Z", level: 25.89, temperature: 26.2 },
      { timestamp: "2024-01-15T09:20:00Z", level: 25.85, temperature: 25.9 },
      { timestamp: "2024-01-15T08:20:00Z", level: 25.82, temperature: 25.6 },
      { timestamp: "2024-01-15T07:20:00Z", level: 25.78, temperature: 25.3 },
      { timestamp: "2024-01-15T06:20:00Z", level: 25.75, temperature: 25.0 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 1.2 },
      { date: "2024-01-11", amount: 0.7 },
      { date: "2024-01-12", amount: 2.1 },
      { date: "2024-01-13", amount: 0.3 },
      { date: "2024-01-14", amount: 1.9 },
    ],
  },
  {
    id: "DWLR_004",
    name: "Darbhanga Central",
    district: "Darbhanga",
    state: "Bihar",
    latitude: 26.1542,
    longitude: 85.8918,
    currentLevel: 8.34,
    status: "normal",
    batteryLevel: 92,
    signalStrength: 88,
    availabilityIndex: 0.85,
    lastUpdated: "2024-01-15T10:35:00Z",
    aquiferType: "Alluvial",
    specificYield: 0.18,
    installationDate: "2023-04-05",
    depth: 35.0,
    recentReadings: [
      { timestamp: "2024-01-15T10:35:00Z", level: 8.34, temperature: 23.8 },
      { timestamp: "2024-01-15T09:35:00Z", level: 8.31, temperature: 23.5 },
      { timestamp: "2024-01-15T08:35:00Z", level: 8.28, temperature: 23.2 },
      { timestamp: "2024-01-15T07:35:00Z", level: 8.25, temperature: 22.9 },
      { timestamp: "2024-01-15T06:35:00Z", level: 8.22, temperature: 22.6 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 25.2 },
      { date: "2024-01-11", amount: 18.7 },
      { date: "2024-01-12", amount: 32.1 },
      { date: "2024-01-13", amount: 15.3 },
      { date: "2024-01-14", amount: 28.9 },
    ],
  },
  {
    id: "DWLR_005",
    name: "Bhagalpur South",
    district: "Bhagalpur",
    state: "Bihar",
    latitude: 25.2425,
    longitude: 86.9842,
    currentLevel: 15.67,
    status: "warning",
    batteryLevel: 58,
    signalStrength: 72,
    availabilityIndex: 0.55,
    lastUpdated: "2024-01-15T10:28:00Z",
    aquiferType: "Hard Rock",
    specificYield: 0.1,
    installationDate: "2023-06-12",
    depth: 40.5,
    recentReadings: [
      { timestamp: "2024-01-15T10:28:00Z", level: 15.67, temperature: 24.9 },
      { timestamp: "2024-01-15T09:28:00Z", level: 15.64, temperature: 24.6 },
      { timestamp: "2024-01-15T08:28:00Z", level: 15.61, temperature: 24.3 },
      { timestamp: "2024-01-15T07:28:00Z", level: 15.58, temperature: 24.0 },
      { timestamp: "2024-01-15T06:28:00Z", level: 15.55, temperature: 23.7 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 8.2 },
      { date: "2024-01-11", amount: 5.7 },
      { date: "2024-01-12", amount: 12.1 },
      { date: "2024-01-13", amount: 3.3 },
      { date: "2024-01-14", amount: 9.9 },
    ],
  },
];

const mockAlerts: Alert[] = [
  {
    id: "alert_001",
    stationId: "DWLR_001",
    stationName: "Colaba",
    type: "critical",
    title: "Critical Water Level Drop",
    message:
      "Water level has dropped below critical threshold of 2m. Immediate action required to avoid shortages.",
    timestamp: "2025-09-11T09:45:00Z",
    isRead: false,
  },
  {
    id: "alert_002",
    stationId: "DWLR_002",
    stationName: "Worli",
    type: "critical",
    title: "Sensor Failure Detected",
    message:
      "One or more sensors have stopped responding at this station. Please inspect and service immediately.",
    timestamp: "2025-09-11T08:55:00Z",
    isRead: false,
  },
  {
    id: "alert_003",
    stationId: "DWLR_003",
    stationName: "Bandra West",
    type: "info",
    title: "Recharge Event Detected",
    message:
      "Groundwater recharge observed after heavy rainfall across Western Suburbs.",
    timestamp: "2025-09-11T07:15:00Z",
    isRead: true,
  },
  {
    id: "alert_004",
    stationId: "DWLR_004",
    stationName: "Andheri East",
    type: "warning",
    title: "Declining Trend Alert",
    message:
      "Water level showing consistent declining trend over the past 10 days.",
    timestamp: "2025-09-10T16:20:00Z",
    isRead: false,
  },
];

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Returns distance in kilometers
};

// Calculate groundwater recharge using Water Table Fluctuation (WTF) method
// R = Sy × ΔH
const calculateGroundwaterRecharge = (
  station: Station
): { date: string; amount: number; deltaH: number }[] => {
  const { recentReadings, specificYield } = station;
  if (recentReadings.length < 2) return [];

  const rechargeEvents: { date: string; amount: number; deltaH: number }[] = [];

  // Sort readings by timestamp
  const sortedReadings = [...recentReadings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate recharge for each consecutive pair of readings
  for (let i = 1; i < sortedReadings.length; i++) {
    const prevReading = sortedReadings[i - 1];
    const currentReading = sortedReadings[i];

    // Calculate water level change (ΔH in meters)
    const deltaH = currentReading.level - prevReading.level;

    // Only consider positive changes as recharge events
    if (deltaH > 0) {
      // Apply WTF formula: R = Sy × ΔH
      // Convert from meters to millimeters (×1000)
      const recharge = specificYield * deltaH * 1000;

      rechargeEvents.push({
        date: currentReading.timestamp.split("T")[0], // Extract date
        amount: recharge,
        deltaH: deltaH,
      });
    }
  }

  return rechargeEvents;
};

// Process station data to include calculated recharge
const processStationWithRecharge = (station: Station): Station => {
  // For stations from database with minimal data, we need to create some sample readings
  // to demonstrate the recharge calculation
  let processedStation = { ...station };

  // Ensure minimum specific yield for calculations
  if (processedStation.specificYield <= 0) {
    processedStation.specificYield = 0.15; // Default for alluvial aquifers
  }

  // Update status based on current water level (only if we have meaningful water level data)
  const getStatusFromWaterLevel = (level: number): Station["status"] => {
    // NEW CLASSIFICATION LOGIC (matching fetchStations):
    // Safe: < 2.5 M
    // Semi-critical: 2.5 M to 5 M
    // Critical: > 5 M
    if (level > 5) return "critical"; // Critical water level (red)
    if (level >= 2.5 && level <= 5) return "warning"; // Semi-critical water level (yellow)
    return "normal"; // Safe water level (green)
  };

  // Only update status if we have meaningful water level data (> 0)
  // Preserve original status for pinpoint stations with currentLevel: 0
  if (processedStation.currentLevel > 0) {
    processedStation.status = getStatusFromWaterLevel(
      processedStation.currentLevel
    );
  }
  // Otherwise, keep the original status from the pinpoint mapping

  if (processedStation.recentReadings.length < 2) {
    // Generate sample historical readings for demonstration with realistic water level changes
    const now = new Date();
    const sampleReadings = [];
    const baseLevel = station.currentLevel;

    for (let i = 4; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // i days ago
      // Create realistic water level fluctuations including recharge events
      let levelChange = 0;

      // Simulate recharge events on some days
      if (i === 3 || i === 1) {
        levelChange = 0.05 + Math.random() * 0.1; // 5-15cm rise (recharge)
      } else {
        levelChange = -0.02 + Math.random() * 0.04; // -2 to +2cm normal variation
      }

      const level = Math.max(0, baseLevel - i * 0.01 + levelChange);

      sampleReadings.push({
        timestamp: timestamp.toISOString(),
        level: level,
        temperature: 24 + Math.random() * 4, // 24-28°C
      });
    }

    processedStation.recentReadings = sampleReadings;
  }

  // Calculate actual recharge using WTF method
  const calculatedRecharge = calculateGroundwaterRecharge(processedStation);

  // Debug log
  console.log(
    `Station ${processedStation.name}: Sy=${processedStation.specificYield}, Readings=${processedStation.recentReadings.length}, Calculated Recharge Events=${calculatedRecharge.length}`
  );

  // If we have calculated recharge events, use them; otherwise keep existing data
  if (calculatedRecharge.length > 0) {
    processedStation.rechargeData = calculatedRecharge.map((event) => ({
      date: event.date,
      amount: event.amount,
    }));
    console.log(
      `Station ${processedStation.name} recharge data:`,
      processedStation.rechargeData
    );
  } else if (processedStation.rechargeData.length === 0) {
    // Fallback: create minimal recharge data for display
    processedStation.rechargeData = [
      {
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        amount: 0,
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        amount: 0,
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        amount: 0,
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        amount: 0,
      },
      { date: new Date().toISOString().split("T")[0], amount: 0 },
    ];
  }

  return processedStation;
};

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Context type definition
interface StationsContextType {
  stations: Station[];
  alerts: Alert[];
  nearbyStations: Station[];
  estimatedLevel: number | null;
  userLocation: LocationData | null;
  locationPermission: Location.LocationPermissionResponse | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  isLoadingStations: boolean;
  stationsError: string | null;
  getStationById: (id: string) => Station | undefined;
  getStationReadings: (
    latitude: number,
    longitude: number,
    timeframe: "6m" | "1y" | "2y"
  ) => Promise<DatabaseReading[]>;
  getAnalytics: () => {
    nearbyStationCount: number;
    avgWaterLevel: number;
    rechargeEvents: number;
    criticalStations: number;
    nearbyStations: Station[];
    regionalData: any
  };
  getStationHealthScore: (station: Station) => number;
  requestLocationPermission: () => Promise<void>;
}

// Create context
const StationsContext = createContext<StationsContextType | undefined>(
  undefined
);

// Custom hook to use context
export const useStations = () => {
  const context = useContext(StationsContext);
  if (context === undefined) {
    throw new Error("useStations must be used within a StationsProvider");
  }
  return context;
};

// Provider component
export const StationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stations, setStations] = useState<Station[]>(mockStations);
  const [dynamicAlerts, setDynamicAlerts] = useState<Alert[]>([]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] =
    useState<Location.LocationPermissionResponse | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState<boolean>(false);
  const [stationsError, setStationsError] = useState<string | null>(null);
  const [mumbaiStationsFromDB, setMumbaiStationsFromDB] = useState<Station[]>([]);

  // Map Supabase row to Station shape
  const getWeekNumber = (dateStr?: string): number | undefined => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const dayOfYear =
      Math.floor((d.getTime() - oneJan.getTime()) / 86400000) + 1;
    return Math.ceil(dayOfYear / 7);
  };

  const mapRowToStation = (row: any): Station => {
    const waterLevel = Number(
      row.water_level ?? row.waterlevel ?? row.Water_Level_m ?? 0
    );

    // Determine status based on water level ranges
    const getStatusFromWaterLevel = (level: number): Station["status"] => {
      if (level > 20) return "critical"; // High water level (critical)
      if (level >= 15 && level <= 20) return "warning"; // Moderate water level (warning/yellow)
      return "normal"; // Normal water level (green)
    };

    const status = getStatusFromWaterLevel(waterLevel);

    // Debug log for status assignment
    console.log(
      `Station mapping: ${row.name ?? row.station_id ?? row.Area_Name ?? "Unknown"
      } - Water Level: ${waterLevel}m - Status: ${status}`
    );

    return {
      id: String(
        row.id ??
        row.station_id ??
        row.Station_ID ??
        row.P_Key ??
        row.pkey ??
        row.P_Key
      ),
      name: (row.name ??
        row.station_id ??
        row.Station_ID ??
        `Station ${row.id ?? row.P_Key}`) as string,
      district: row.district ?? "",
      state: row.state ?? "",
      latitude: Number(row.latitude ?? row.Latitude ?? row.lat),
      longitude: Number(row.longitude ?? row.Longitude ?? row.lon),
      currentLevel: waterLevel,
      status: status,
      batteryLevel: 100,
      signalStrength: 100,
      availabilityIndex: 1,
      lastUpdated:
        row.date ?? row.Date
          ? new Date(row.date ?? row.Date).toISOString()
          : new Date().toISOString(),
      aquiferType: row.aquifer_type ?? "Alluvial",
      specificYield: Number(row.specific_yield ?? 0.15), // Default 0.15 for alluvial aquifers
      installationDate:
        row.installation_date ?? new Date().toISOString().slice(0, 10),
      depth: Number(row.depth ?? 0),
      oxygenLevel:
        row.Dissolved_Oxygen_mg_L != null
          ? Number(row.Dissolved_Oxygen_mg_L)
          : row.oxygen_level != null
            ? Number(row.oxygen_level)
            : row.oxygen != null
              ? Number(row.oxygen)
              : undefined,
      temperature:
        row.Temperature_C != null
          ? Number(row.Temperature_C)
          : row.temperature != null
            ? Number(row.temperature)
            : undefined,
      week: row.week ?? getWeekNumber(row.date ?? row.Date),
      recentReadings: [
        {
          timestamp:
            row.date ?? row.Date
              ? new Date(row.date ?? row.Date).toISOString()
              : new Date().toISOString(),
          level: Number(
            row.water_level ?? row.waterlevel ?? row.Water_Level_m ?? 0
          ),
          temperature: Number(row.temperature ?? row.Temperature_C ?? 0),
        },
      ],
      rechargeData: [],
    };
  };

  // Map from Map_pinpoints2.0 row to Station
  const mapPinpointRowToStation = (row: any): Station => {
    const statusMap: Record<string, Station["status"]> = {
      Light: "normal",
      Moderate: "warning",
      Heavy: "critical",
      None: "normal",
    };

    const lat = parseFloat(String(row.Latitude ?? row.latitude ?? ""));
    const lon = parseFloat(String(row.Longitude ?? row.longitude ?? ""));
    const dwlrStatus = String(row.DWLR_Status ?? "").trim();
    const status = statusMap[dwlrStatus] ?? "normal";

    // Debug log for pinpoint status assignment
    console.log(
      `Pinpoint mapping: ${row.Area_Name ?? "Unknown"
      } - DWLR_Status: '${dwlrStatus}' - Status: ${status}`
    );

    return {
      id: String(row.Serial_No ?? row.id ?? row.P_Key ?? Math.random()),
      name: String(
        row.Area_Name ?? row.name ?? `Station ${row.Serial_No ?? row.id ?? ""}`
      ),
      district: "",
      state: "",
      latitude: isFinite(lat) ? lat : 0,
      longitude: isFinite(lon) ? lon : 0,
      currentLevel: 0,
      status: status,
      batteryLevel: 100,
      signalStrength: 100,
      availabilityIndex: 1,
      lastUpdated: new Date().toISOString(),
      aquiferType: "Alluvial",
      specificYield: 0.15, // Default specific yield
      installationDate: new Date().toISOString().slice(0, 10),
      depth: 0,
      oxygenLevel: undefined,
      temperature: undefined,
      week: undefined,
      recentReadings: [],
      rechargeData: [],
    };
  };

  // Fetch stations from Supabase using st_map_data table
  const fetchStations = useCallback(async (userLat?: number, userLon?: number) => {
    console.log("fetchStations called - attempting to fetch from st_map_data");
    console.log("User location:", userLat, userLon);

    // Check if supabase is configured
    console.log("Supabase client available:", !!supabase);

    try {
      setIsLoadingStations(true);
      setStationsError(null);

      // Test basic connection first
      console.log("Testing Supabase connection...");
      const { data: testData, error: testError } = await supabase
        .from("st_map_data")
        .select("count", { count: "exact", head: true });

      if (testError) {
        console.log("Connection test failed:", testError);
        throw testError;
      }

      console.log("Connection successful, total rows:", testData);

      // Fetch station data from st_map_data table
      console.log("Fetching actual data from st_map_data...");

      // Get all stations - fetch all columns to see what's available
      const { data: allStationData, error: stationErr } = await supabase
        .from("st_map_data")
        .select("*"); // Select all columns

      if (stationErr) {
        console.log("Fetch error:", stationErr);
        throw stationErr;
      }

      console.log("Raw st_map_data from Supabase:", allStationData?.length || 0, "records");
      console.log("First row example (all columns):", allStationData?.[0]);

      // Log all available column names
      if (allStationData && allStationData.length > 0) {
        console.log("Available columns:", Object.keys(allStationData[0]));
      }

      // Filter out stations with invalid coordinates
      let stationsArray = (allStationData ?? []).filter((row: any) => {
        const lat = Number(row.Latitude);
        const lon = Number(row.Longitude);
        return Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0;
      });

      console.log(`Found ${stationsArray.length} valid stations with coordinates`);

      if (userLat !== undefined && userLon !== undefined) {
        // Calculate distance for each station
        stationsArray = stationsArray.map((row: any) => ({
          ...row,
          distance: calculateDistance(
            userLat,
            userLon,
            Number(row.Latitude),
            Number(row.Longitude)
          ),
        }));

        // Sort by distance (nearest first) but show ALL stations on map
        stationsArray.sort((a: any, b: any) => a.distance - b.distance);
        console.log(`Showing all ${stationsArray.length} stations sorted by distance`);
      } else {
        // No user location, show all stations
        console.log(`Showing all ${stationsArray.length} stations`);
      }

      // Map st_map_data rows to Station objects
      const mappedStations: Station[] = stationsArray.map((row: any) => {
        const lat = Number(row.Latitude);
        const lon = Number(row.Longitude);
        const level = Number(row.water_level ?? 0);
        const dateStr = new Date().toISOString();

        // NEW CLASSIFICATION LOGIC:
        // Safe: < 2.5 M
        // Semi-critical: 2.5 M to 5 M
        // Critical: > 5 M
        let status: Station["status"] = "normal";
        if (level > 5) {
          status = "critical";
        } else if (level >= 2.5 && level <= 5) {
          status = "warning"; // Semi-critical maps to "warning"
        } else {
          status = "normal"; // Safe maps to "normal"
        }

        // Build station name from available fields
        // Use st_code as primary identifier, and full_address_generated for name
        const stationCode = row.st_code || row.station_code || "";
        const address = row.full_address_generated || row.address || "";
        
        let stationName = address || row.name || row.station_name || stationCode || "DWLR Station";
        
        // Add station code to name if available
        if (stationCode && !stationName.includes(stationCode)) {
          stationName = `${stationName} (${stationCode})`;
        }
        
        // Get station ID - use st_code as primary ID
        const stationId = stationCode || row.id || row.station_id || Math.random().toString();

        const district = row.district || "";
        const state = row.state || "";

        console.log(`Mapped station: ${stationId} -> ${stationName} (Lat: ${lat}, Lon: ${lon}, Water Level: ${level}m, Status: ${status})`);

        return {
          id: String(stationId),
          name: stationName,
          district: district,
          state: state,
          latitude: Number.isFinite(lat) ? lat : 0,
          longitude: Number.isFinite(lon) ? lon : 0,
          currentLevel: Number.isFinite(level) ? level : 0,
          status: status,
          batteryLevel: 75 + Math.random() * 25, // Random 75-100%
          signalStrength: 60 + Math.random() * 40, // Random 60-100%
          availabilityIndex: 0.7 + Math.random() * 0.3, // Random 0.7-1.0
          lastUpdated: dateStr,
          aquiferType: "Alluvial",
          specificYield: 0.15,
          installationDate: new Date().toISOString().slice(0, 10),
          depth: 30 + Math.random() * 90, // Random 30-120m
          oxygenLevel: undefined,
          temperature: 24 + Math.random() * 6, // Random 24-30°C
          week: undefined,
          recentReadings: [
            {
              timestamp: dateStr,
              level: Number.isFinite(level) ? level : 0,
              temperature: 24 + Math.random() * 6,
            },
          ],
          rechargeData: [],
        };
      });


      console.log(
        "st_map_data rows:",
        allStationData?.length ?? 0,
        "mapped(valid):",
        mappedStations.length
      );

      if (mappedStations.length === 0) {
        console.log("No valid stations found, using mock data instead");
        const processedMockStations = mockStations
          .slice(0, 10)
          .map(processStationWithRecharge);
        setStations(processedMockStations);
      } else {
        const processedStations = mappedStations.map(
          processStationWithRecharge
        );
        setStations(processedStations);
        console.log(`Successfully loaded ${processedStations.length} stations`);
      }
    } catch (err: any) {
      console.log("Supabase fetch error:", err);
      setStationsError(err?.message || "Failed to load stations");
      // Fallback to mock stations if database fails
      console.log("Falling back to mock stations");
      const processedMockStations = mockStations
        .slice(0, 10)
        .map(processStationWithRecharge);
      setStations(processedMockStations);
    } finally {
      setIsLoadingStations(false);
    }
  }, []);


  // Request location permission and get current location
  const requestLocationPermission = useCallback(async () => {
    try {
      setIsLoadingLocation(true);
      setLocationError(null);

      // Check if location services are available on web
      if (Platform.OS === "web") {
        if (!navigator.geolocation) {
          setLocationError("Geolocation is not supported by this browser");
          setIsLoadingLocation(false);
          return;
        }

        // Use web geolocation API
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            setIsLoadingLocation(false);
          },
          (error) => {
            console.log("Web geolocation error:", error);
            setLocationError("Failed to get location: " + error.message);
            setIsLoadingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
        return;
      }

      // For mobile platforms, use expo-location
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission({ status } as Location.LocationPermissionResponse);

      if (status !== "granted") {
        setLocationError("Location permission denied");
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      });
      setIsLoadingLocation(false);
    } catch (error) {
      console.log("Location error:", error);
      setLocationError("Failed to get location");
      setIsLoadingLocation(false);
    }
  }, []);

  // Hardcoded WLCODEs for Mumbai area stations (nearest to Mahim)
  const MUMBAI_STATION_WLCODES = [
    "W06968",
    "W06969",
    "W17200",
    "W17199",
    "W17201",
    "W17202",
    "W06759",
    "W06745",
    "W06752",
    "W06744",
  ];

  // Fetch Mumbai stations from district_data by WLCODE
  const fetchMumbaiStationsFromDB = useCallback(async () => {
    try {
      console.log("Fetching Mumbai stations from district_data...");
      
      // First, get station names from st_map_data
      const { data: stationNamesData, error: namesError } = await supabase
        .from("st_map_data")
        .select("WLCODE, Area_Name")
        .in("WLCODE", MUMBAI_STATION_WLCODES);

      const nameMap: Map<string, string> = new Map();
      if (stationNamesData) {
        for (const row of stationNamesData) {
          if (row.WLCODE && row.Area_Name) {
            nameMap.set(row.WLCODE, row.Area_Name);
          }
        }
      }

      // Fetch latest readings for each WLCODE from district_data
      const stationsPromises = MUMBAI_STATION_WLCODES.map(async (wlcode) => {
        const { data, error } = await supabase
          .from("district_data")
          .select("WLCODE, LAT, LON, district, state, Water_Level, Date, P_no")
          .eq("WLCODE", wlcode)
          .order("P_no", { ascending: true })
          .limit(1); // Get latest reading (lowest P_no)

        if (error || !data || data.length === 0) {
          console.log(`No data found for ${wlcode}`);
          return null;
        }

        const row = data[0];
        const lat = Number(row.LAT);
        const lon = Number(row.LON);
        const waterLevel = Number(row.Water_Level) || 0;
        const date = row.Date || new Date().toISOString();

        if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
          console.log(`Invalid coordinates for ${wlcode}`);
          return null;
        }

        // Determine status based on water level
        let status: Station["status"] = "normal";
        if (waterLevel > 5) {
          status = "critical";
        } else if (waterLevel >= 2.5 && waterLevel <= 5) {
          status = "warning";
        }

        const stationName = nameMap.get(wlcode) || row.district || wlcode;

        return {
          id: wlcode,
          name: stationName,
          district: row.district || "Mumbai",
          state: row.state || "Maharashtra",
          latitude: lat,
          longitude: lon,
          currentLevel: waterLevel,
          status: status,
          batteryLevel: 85 + Math.random() * 15, // Random 85-100%
          signalStrength: 80 + Math.random() * 20, // Random 80-100%
          availabilityIndex: 0.8 + Math.random() * 0.2, // Random 0.8-1.0
          lastUpdated: date,
          aquiferType: "Alluvial",
          specificYield: 0.15,
          installationDate: new Date().toISOString().slice(0, 10),
          depth: 30 + Math.random() * 90, // Random 30-120m
          oxygenLevel: undefined,
          temperature: 24 + Math.random() * 6, // Random 24-30°C
          week: undefined,
          recentReadings: [
            {
              timestamp: date,
              level: waterLevel,
              temperature: 24 + Math.random() * 6,
            },
          ],
          rechargeData: [],
        } as Station;
      });

      const fetchedStations = (await Promise.all(stationsPromises)).filter(
        (s): s is Station => s !== null
      );

      // Process stations with recharge data for consistency
      const processedStations = fetchedStations.map(processStationWithRecharge);

      console.log(`Fetched ${processedStations.length} Mumbai stations from database`);
      setMumbaiStationsFromDB(processedStations);
      return processedStations;
    } catch (error) {
      console.error("Error fetching Mumbai stations:", error);
      setMumbaiStationsFromDB([]);
      return [];
    }
  }, []);

  // Mumbai area stations near Mahim (hardcoded for accurate nearby stations) - FALLBACK
  const mumbaiStationsNearMahim: Station[] = [
    {
      id: "MUMBAI_001",
      name: "Mahim DWLR Station",
      district: "Mumbai",
      state: "Maharashtra",
      latitude: 19.0400,
      longitude: 72.8400,
      currentLevel: 8.5,
      status: "normal",
      batteryLevel: 95,
      signalStrength: 90,
      availabilityIndex: 0.92,
      lastUpdated: new Date().toISOString(),
      aquiferType: "Alluvial",
      specificYield: 0.15,
      installationDate: "2023-01-15",
      depth: 35.0,
      recentReadings: [
        { timestamp: new Date().toISOString(), level: 8.5, temperature: 26.5 },
      ],
      rechargeData: [],
    },
    {
      id: "MUMBAI_002",
      name: "Bandra DWLR Station",
      district: "Mumbai",
      state: "Maharashtra",
      latitude: 19.0600,
      longitude: 72.8300,
      currentLevel: 9.2,
      status: "normal",
      batteryLevel: 88,
      signalStrength: 85,
      availabilityIndex: 0.88,
      lastUpdated: new Date().toISOString(),
      aquiferType: "Alluvial",
      specificYield: 0.15,
      installationDate: "2023-02-20",
      depth: 38.0,
      recentReadings: [
        { timestamp: new Date().toISOString(), level: 9.2, temperature: 26.8 },
      ],
      rechargeData: [],
    },
    {
      id: "MUMBAI_003",
      name: "Worli DWLR Station",
      district: "Mumbai",
      state: "Maharashtra",
      latitude: 19.0200,
      longitude: 72.8200,
      currentLevel: 7.8,
      status: "normal",
      batteryLevel: 92,
      signalStrength: 88,
      availabilityIndex: 0.90,
      lastUpdated: new Date().toISOString(),
      aquiferType: "Alluvial",
      specificYield: 0.15,
      installationDate: "2023-03-10",
      depth: 32.0,
      recentReadings: [
        { timestamp: new Date().toISOString(), level: 7.8, temperature: 26.2 },
      ],
      rechargeData: [],
    },
    {
      id: "MUMBAI_004",
      name: "Dadar DWLR Station",
      district: "Mumbai",
      state: "Maharashtra",
      latitude: 19.0180,
      longitude: 72.8450,
      currentLevel: 8.9,
      status: "normal",
      batteryLevel: 90,
      signalStrength: 87,
      availabilityIndex: 0.89,
      lastUpdated: new Date().toISOString(),
      aquiferType: "Alluvial",
      specificYield: 0.15,
      installationDate: "2023-01-25",
      depth: 36.0,
      recentReadings: [
        { timestamp: new Date().toISOString(), level: 8.9, temperature: 26.6 },
      ],
      rechargeData: [],
    },
    {
      id: "MUMBAI_005",
      name: "Prabhadevi DWLR Station",
      district: "Mumbai",
      state: "Maharashtra",
      latitude: 19.0150,
      longitude: 72.8350,
      currentLevel: 9.5,
      status: "normal",
      batteryLevel: 93,
      signalStrength: 91,
      availabilityIndex: 0.91,
      lastUpdated: new Date().toISOString(),
      aquiferType: "Alluvial",
      specificYield: 0.15,
      installationDate: "2023-02-15",
      depth: 34.0,
      recentReadings: [
        { timestamp: new Date().toISOString(), level: 9.5, temperature: 26.7 },
      ],
      rechargeData: [],
    },
    {
      id: "MUMBAI_006",
      name: "Matunga DWLR Station",
      district: "Mumbai",
      state: "Maharashtra",
      latitude: 19.0300,
      longitude: 72.8500,
      currentLevel: 8.2,
      status: "normal",
      batteryLevel: 87,
      signalStrength: 84,
      availabilityIndex: 0.86,
      lastUpdated: new Date().toISOString(),
      aquiferType: "Alluvial",
      specificYield: 0.15,
      installationDate: "2023-03-05",
      depth: 33.0,
      recentReadings: [
        { timestamp: new Date().toISOString(), level: 8.2, temperature: 26.4 },
      ],
      rechargeData: [],
    },
  ];

  // Check if user is in Mumbai area (Mahim coordinates: ~19.04, 72.84)
  const isInMumbaiArea = (lat: number, lon: number): boolean => {
    // Mumbai area bounds: roughly 18.9 to 19.2 lat, 72.7 to 73.0 lon
    return lat >= 18.9 && lat <= 19.2 && lon >= 72.7 && lon <= 73.0;
  };

  // Fetch Mumbai stations on mount and when location changes
  useEffect(() => {
    // Always fetch Mumbai stations (they'll be shown if user is in Mumbai area)
    console.log("📍 Fetching Mumbai stations from database...");
    fetchMumbaiStationsFromDB();
  }, [fetchMumbaiStationsFromDB]);

  // Get nearby stations based on user location (within a radius if possible)
  const nearbyStations = useMemo(() => {
    console.log("🔄 Calculating nearby stations...", {
      hasUserLocation: !!userLocation,
      mumbaiStationsCount: mumbaiStationsFromDB.length,
      userLocation: userLocation ? { lat: userLocation.latitude, lon: userLocation.longitude } : null,
    });

    // Priority 1: If we have Mumbai stations from DB, show them (when in Mumbai area or as fallback)
    if (mumbaiStationsFromDB.length > 0) {
      const orderedStations = MUMBAI_STATION_WLCODES.map((wlcode) => {
        return mumbaiStationsFromDB.find((s) => s.id === wlcode);
      }).filter((s): s is Station => s !== undefined);

      if (orderedStations.length > 0) {
        // Check if user is in Mumbai area OR show them anyway (for testing)
        const userLat = userLocation?.latitude;
        const userLon = userLocation?.longitude;
        const inMumbai = userLat && userLon && isInMumbaiArea(userLat, userLon);
        
        if (inMumbai || !userLocation) {
          console.log(`📍 Showing ${orderedStations.length} Mumbai stations from database`, {
            inMumbaiArea: inMumbai,
            stations: orderedStations.map((s) => ({ wlcode: s.id, name: s.name })),
          });
          return orderedStations.slice(0, 10);
        }
      }
    }

    // Priority 2: If user is in Mumbai area but no DB stations yet, use fallback
    if (userLocation) {
      const userLat = userLocation.latitude;
      const userLon = userLocation.longitude;
      
      if (isInMumbaiArea(userLat, userLon)) {
        console.log("📍 User in Mumbai area, using fallback stations");
        return mumbaiStationsNearMahim.slice(0, 10);
      }
    }

    if (!userLocation) {
      // Return first 4 stations if no location available
      return stations.slice(0, 4);
    }

    const RADIUS_KM = 50; // configurable nearby radius
    const userLat = userLocation.latitude;
    const userLon = userLocation.longitude;

    // For other locations, use regular calculation
    // Filter out stations with invalid coordinates
    const validStations = stations.filter(
      (s) =>
        Number.isFinite(s.latitude) &&
        Number.isFinite(s.longitude) &&
        s.latitude !== 0 &&
        s.longitude !== 0
    );

    if (validStations.length === 0) {
      console.log("No valid stations with coordinates found");
      return stations.slice(0, 4);
    }

    // Calculate distances for all stations
    const stationsWithDistance = validStations.map((station) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        station.latitude,
        station.longitude
      );
      return {
        ...station,
        distance,
      };
    });

    // Filter within radius, else fallback to closest 6
    const withinRadius = stationsWithDistance.filter(
      (s) => s.distance <= RADIUS_KM
    );
    const sorted = (
      withinRadius.length > 0 ? withinRadius : stationsWithDistance
    ).sort((a, b) => a.distance - b.distance);

    const result = sorted.slice(0, 6);
    
    // Debug logging
    console.log(`Nearby stations calculation:`, {
      userLocation: { lat: userLat, lon: userLon },
      totalStations: stations.length,
      validStations: validStations.length,
      withinRadius: withinRadius.length,
      resultCount: result.length,
      distances: result.map((s) => ({ name: s.name, distance: s.distance.toFixed(2) + "km" })),
    });

    return result;
  }, [stations, userLocation, mumbaiStationsFromDB]);

  // Generate location-based alerts
  const generateLocationBasedAlerts = useCallback(
    (stations: Station[], location: LocationData | null): Alert[] => {
      const alerts: Alert[] = [];
      const now = new Date();

      if (!stations || stations.length === 0) return alerts;

      // If no location, use first few stations for demo alerts
      const stationsToAnalyze = location
        ? stations.filter((station) => {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            station.latitude,
            station.longitude
          );
          return distance <= 50; // Within 50km
        })
        : stations.slice(0, 4); // Use first 4 stations if no location

      stationsToAnalyze.forEach((station, index) => {
        let distance = 0;
        if (location) {
          distance = calculateDistance(
            location.latitude,
            location.longitude,
            station.latitude,
            station.longitude
          );
        }

        const distanceText = location
          ? `${distance.toFixed(1)}km away`
          : "in your region";

        // Generate different types of alerts based on water level
        if (station.currentLevel > 20) {
          alerts.push({
            id: `alert-${station.id}-${index}`,
            stationId: station.id,
            stationName: station.name,
            type: "critical",
            title: "High Water Level Alert",
            message: `Water level at ${station.name} is ${station.currentLevel}m (${distanceText})`,
            timestamp: new Date(
              now.getTime() - Math.random() * 2 * 60 * 60 * 1000
            ).toISOString(),
            isRead: false,
          });
        } else if (station.currentLevel >= 15 && station.currentLevel <= 20) {
          alerts.push({
            id: `alert-${station.id}-${index}`,
            stationId: station.id,
            stationName: station.name,
            type: "warning",
            title: "Moderate Water Level",
            message: `Water level declining at ${station.name}: ${station.currentLevel}m (${distanceText})`,
            timestamp: new Date(
              now.getTime() - Math.random() * 4 * 60 * 60 * 1000
            ).toISOString(),
            isRead: false,
          });
        } else if (station.currentLevel < 10) {
          alerts.push({
            id: `alert-${station.id}-${index}`,
            stationId: station.id,
            stationName: station.name,
            type: "info",
            title: "Good Recharge Detected",
            message: `Positive recharge at ${station.name}: ${station.currentLevel}m (${distanceText})`,
            timestamp: new Date(
              now.getTime() - Math.random() * 6 * 60 * 60 * 1000
            ).toISOString(),
            isRead: false,
          });
        }
      });

      // Limit to avoid overwhelming user
      return alerts.slice(0, 8);
    },
    []
  );

  // Generate dynamic alerts when nearby stations or location changes
  useEffect(() => {
    const newAlerts = generateLocationBasedAlerts(nearbyStations, userLocation);
    setDynamicAlerts(newAlerts);
  }, [nearbyStations, userLocation, generateLocationBasedAlerts]);

  // Estimated groundwater level at user's live location via IDW (k-nearest)
  const estimatedLevel = useMemo(() => {
    if (!userLocation) return null;
    const candidates = stations.filter(
      (s) =>
        Number.isFinite(s.currentLevel) &&
        Number.isFinite(s.latitude) &&
        Number.isFinite(s.longitude)
    );
    if (candidates.length === 0) return null;

    // Compute distances
    const withDistance = candidates.map((s) => ({
      station: s,
      distanceKm: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        s.latitude,
        s.longitude
      ),
    }));

    // If any station is exactly at user's location, return its level
    const atSameSpot = withDistance.find((x) => x.distanceKm === 0);
    if (atSameSpot) return atSameSpot.station.currentLevel;

    // Use k nearest
    const K = 5;
    const P = 1; // IDW power
    const MIN_DIST = 0.001; // km safeguard
    const nearest = withDistance
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, K);

    let numerator = 0;
    let denominator = 0;
    for (const item of nearest) {
      const d = Math.max(item.distanceKm, MIN_DIST);
      const w = 1 / Math.pow(d, P);
      numerator += item.station.currentLevel * w;
      denominator += w;
    }
    if (denominator === 0) return null;
    return numerator / denominator;
  }, [stations, userLocation]);

  // Auto-request location on mount
  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  // Load stations on mount and refetch when user location changes
  useEffect(() => {
    if (userLocation) {
      fetchStations(userLocation.latitude, userLocation.longitude);
    } else {
      fetchStations();
    }
  }, [fetchStations, userLocation]);

  const getStationById = useCallback(
    (id: string) => {
      return stations.find((station) => station.id === id);
    },
    [stations]
  );

  // Fetch water level readings for a specific station from district_data table
  const getStationReadings = useCallback(
    async (
      latitude: number,
      longitude: number,
      timeframe: "6m" | "1y" | "2y"
    ): Promise<DatabaseReading[]> => {
      try {
        console.log(
          `Fetching readings for station at ${latitude}, ${longitude} with timeframe ${timeframe}`
        );

        // Determine how many readings to fetch based on timeframe
        const readingCounts = {
          "6m": 12,
          "1y": 24,
          "2y": 48,
        };
        const limit = readingCounts[timeframe];

        // Query district_data table with tolerance for LAT/LON matching
        const tolerance = 0.001; // Small tolerance for coordinate matching
        const { data, error } = await supabase
          .from("district_data")
          .select("P_no, WLCODE, SITE_TYPE, LAT, LON, Water_Level")
          .gte("LAT", latitude - tolerance)
          .lte("LAT", latitude + tolerance)
          .gte("LON", longitude - tolerance)
          .lte("LON", longitude + tolerance)
          .order("P_no", { ascending: true }) // Lower P_no = latest reading
          .limit(limit);

        if (error) {
          console.error("Error fetching station readings:", error);
          return [];
        }

        console.log(`Found ${data?.length || 0} readings for station`);
        return (data as DatabaseReading[]) || [];
      } catch (err) {
        console.error("Error in getStationReadings:", err);
        return [];
      }
    },
    []
  );

  // Calculate groundwater health score (0-100) based on multiple factors
  const getStationHealthScore = useCallback((station: Station): number => {
    let score = 50; // Start with neutral score

    // Factor 1: Water level status (40 points)
    if (station.status === "normal") {
      score += 40;
    } else if (station.status === "warning") {
      score += 20;
    } else if (station.status === "critical") {
      score += 0;
    }

    // Factor 2: Trend analysis (30 points)
    if (station.recentReadings.length >= 2) {
      const oldest = station.recentReadings[0].level;
      const newest = station.recentReadings[station.recentReadings.length - 1].level;
      const trend = newest - oldest;

      if (trend > 0) {
        // Positive trend (water level rising) is good
        score += 30;
      } else if (trend > -0.5) {
        // Slight decline is acceptable
        score += 15;
      } else {
        // Significant decline is concerning
        score += 0;
      }
    }

    // Factor 3: Battery level (10 points)
    if (station.batteryLevel >= 80) {
      score += 10;
    } else if (station.batteryLevel >= 50) {
      score += 5;
    }

    // Factor 4: Signal strength (10 points)
    if (station.signalStrength >= 70) {
      score += 10;
    } else if (station.signalStrength >= 40) {
      score += 5;
    }

    // Factor 5: Availability index (10 points)
    score += station.availabilityIndex * 10;

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }, []);

  const getAnalytics = useCallback(() => {
    // Use nearby stations instead of all stations for proximity-based analytics
    const relevantStations =
      nearbyStations.length > 0 ? nearbyStations : stations.slice(0, 6);

    const avgWaterLevel =
      relevantStations.length > 0
        ? relevantStations.reduce(
          (sum, station) => sum + station.currentLevel,
          0
        ) / relevantStations.length
        : 0;

    // Calculate recharge events from nearby stations (mock for now, can be enhanced)
    const rechargeEvents = relevantStations.filter(
      (station) =>
        station.recentReadings.length > 1 &&
        station.recentReadings[station.recentReadings.length - 1].level >
        station.recentReadings[0].level
    ).length;

    // Count critical stations from nearby stations
    const criticalStations = relevantStations.filter(
      (station) => station.status === "critical"
    ).length;

    const regionalData = [
      { state: "Pune", avgLevel: 16.2, status: "warning" as const },
      { state: "Thane", avgLevel: 22.8, status: "critical" as const },
      { state: "Mira Bhyandar", avgLevel: 11.5, status: "normal" as const },
      { state: "Nagpur", avgLevel: 18.9, status: "warning" as const },
    ];

    return {
      nearbyStationCount: relevantStations.length,
      avgWaterLevel,
      rechargeEvents,
      criticalStations,
      nearbyStations: relevantStations,
      regionalData,
    };
  }, [stations, nearbyStations]);

  const contextValue = useMemo(
    () => ({
      stations,
      alerts: dynamicAlerts,
      nearbyStations,
      estimatedLevel,
      userLocation,
      locationPermission,
      isLoadingLocation,
      locationError,
      isLoadingStations,
      stationsError,
      getStationById,
      getStationReadings,
      getAnalytics,
      getStationHealthScore,
      requestLocationPermission,
    }),
    [
      stations,
      dynamicAlerts,
      nearbyStations,
      estimatedLevel,
      userLocation,
      locationPermission,
      isLoadingLocation,
      locationError,
      isLoadingStations,
      stationsError,
      getStationById,
      getStationReadings,
      getAnalytics,
      getStationHealthScore,
      requestLocationPermission,
    ]
  );

  return (
    <StationsContext.Provider value={contextValue}>
      {children}
    </StationsContext.Provider>
  );
};
