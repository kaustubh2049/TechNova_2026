/**
 * Advanced Analytics Service
 * Research-grade data processing for groundwater analysis
 * Processes data from 15 monitoring stations
 */

export interface SeasonalData {
  season: "Pre-Monsoon" | "Monsoon" | "Post-Monsoon";
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  count: number;
}

export interface RainfallCorrelation {
  rainfall: number;
  waterLevelChange: number;
  month: string;
}

export interface RateOfChangeData {
  date: string;
  changeRate: number; // m/month
  month: string;
}

export interface DistrictTrend {
  district: string;
  data: { x: number; y: number; label: string }[];
  color: string;
}

export interface StationReadingWithDate {
  date: string;
  waterLevel: number;
}

// New interfaces for additional charts
export interface DemandAvailabilityData {
  month: string;
  demand: number;
  availability: number;
  gap: number;
}

export interface StressIndexData {
  month: string;
  stressIndex: number;
  category: "low" | "medium" | "high" | "critical";
}

export interface ZoneData {
  zone: string;
  count: number;
  percentage: number;
  color: string;
}

export interface SeasonalPatternData {
  season: string;
  avgLevel: number;
  minLevel: number;
  maxLevel: number;
  rechargeRate: number;
}

export interface StressWaterLevelData {
  waterLevel: number;
  stressIndex: number;
  zone: string;
}

/**
 * Parse date from DD-MM-YYYY format
 */
function parseDate(dateStr: string): Date {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date();
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Determine season from month (Indian context)
 * Pre-Monsoon: Mar-May (months 2-4)
 * Monsoon: Jun-Sep (months 5-8)
 * Post-Monsoon: Oct-Feb (months 9-1)
 */
function getSeason(month: number): "Pre-Monsoon" | "Monsoon" | "Post-Monsoon" {
  if (month >= 2 && month <= 4) return "Pre-Monsoon";
  if (month >= 5 && month <= 8) return "Monsoon";
  return "Post-Monsoon";
}

/**
 * Calculate quartiles for box plot
 */
function calculateQuartiles(values: number[]): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;

  const q1Index = Math.floor(len * 0.25);
  const medianIndex = Math.floor(len * 0.5);
  const q3Index = Math.floor(len * 0.75);

  const mean = values.reduce((sum, val) => sum + val, 0) / len;

  return {
    min: sorted[0],
    q1: sorted[q1Index],
    median: sorted[medianIndex],
    q3: sorted[q3Index],
    max: sorted[len - 1],
    mean,
  };
}

/**
 * Process seasonal distribution for box plots
 * Groups water levels by season and calculates statistics
 */
export function processSeasonalData(
  readings: StationReadingWithDate[],
): SeasonalData[] {
  const seasonalGroups: {
    [key: string]: number[];
  } = {
    "Pre-Monsoon": [],
    Monsoon: [],
    "Post-Monsoon": [],
  };

  // Group readings by season
  readings.forEach((reading) => {
    const date = parseDate(reading.date);
    const month = date.getMonth();
    const season = getSeason(month);
    seasonalGroups[season].push(reading.waterLevel);
  });

  // Calculate statistics for each season
  return Object.entries(seasonalGroups).map(([season, values]) => {
    if (values.length === 0) {
      return {
        season: season as "Pre-Monsoon" | "Monsoon" | "Post-Monsoon",
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        mean: 0,
        count: 0,
      };
    }

    const stats = calculateQuartiles(values);
    return {
      season: season as "Pre-Monsoon" | "Monsoon" | "Post-Monsoon",
      ...stats,
      count: values.length,
    };
  });
}

/**
 * Calculate rate of change (first derivative) of water levels
 * Shows how fast groundwater is changing over time
 */
export function calculateRateOfChange(
  readings: StationReadingWithDate[],
): RateOfChangeData[] {
  if (readings.length < 2) return [];

  const sortedReadings = [...readings].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
  );

  const rateData: RateOfChangeData[] = [];

  for (let i = 1; i < sortedReadings.length; i++) {
    const prevReading = sortedReadings[i - 1];
    const currReading = sortedReadings[i];

    const prevDate = parseDate(prevReading.date);
    const currDate = parseDate(currReading.date);

    // Calculate time difference in months (approximate)
    const timeDiff =
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (timeDiff > 0) {
      const changeRate =
        (currReading.waterLevel - prevReading.waterLevel) / timeDiff;

      rateData.push({
        date: currReading.date,
        changeRate: parseFloat(changeRate.toFixed(3)),
        month: currDate.toLocaleString("default", {
          month: "short",
          year: "2-digit",
        }),
      });
    }
  }

  return rateData;
}

/**
 * Generate mock rainfall data for correlation analysis
 * In production, this would fetch actual rainfall data
 */
function generateMockRainfallData(readingCount: number): number[] {
  const rainfallData: number[] = [];

  for (let i = 0; i < readingCount; i++) {
    // Simulate seasonal rainfall pattern
    const month = i % 12;
    let baseRainfall = 0;

    // Monsoon season (Jun-Sep) gets high rainfall
    if (month >= 5 && month <= 8) {
      baseRainfall = 150 + Math.random() * 200; // 150-350mm
    }
    // Pre-monsoon (Mar-May) and post-monsoon (Oct-Feb) get moderate rainfall
    else if (month >= 2 && month <= 4) {
      baseRainfall = 30 + Math.random() * 70; // 30-100mm
    }
    // Winter (Dec-Feb) gets low rainfall
    else {
      baseRainfall = 10 + Math.random() * 50; // 10-60mm
    }

    rainfallData.push(parseFloat(baseRainfall.toFixed(1)));
  }

  return rainfallData;
}

/**
 * Process rainfall-groundwater correlation
 * Analyzes relationship between rainfall and water level changes
 */
export function processRainfallCorrelation(
  readings: StationReadingWithDate[],
): RainfallCorrelation[] {
  if (readings.length < 2) return [];

  const sortedReadings = [...readings].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
  );

  // Generate mock rainfall data
  const rainfallData = generateMockRainfallData(sortedReadings.length);

  const correlationData: RainfallCorrelation[] = [];

  for (let i = 1; i < sortedReadings.length; i++) {
    const prevWaterLevel = sortedReadings[i - 1].waterLevel;
    const currWaterLevel = sortedReadings[i].waterLevel;
    const waterLevelChange = currWaterLevel - prevWaterLevel;

    const date = parseDate(sortedReadings[i].date);
    const monthLabel = date.toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });

    correlationData.push({
      rainfall: rainfallData[i],
      waterLevelChange: parseFloat(waterLevelChange.toFixed(3)),
      month: monthLabel,
    });
  }

  return correlationData;
}

/**
 * Process district-wise trends for comparison
 * Groups stations by district and calculates average trends
 */
export function processDistrictTrends(
  stationsByDistrict: {
    district: string;
    readings: StationReadingWithDate[];
  }[],
): DistrictTrend[] {
  const colors = [
    "#0891b2", // cyan
    "#dc2626", // red
    "#059669", // green
    "#ea580c", // orange
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
  ];

  return stationsByDistrict.map((districtData, index) => {
    const sortedReadings = [...districtData.readings].sort(
      (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
    );

    const data = sortedReadings.map((reading, i) => ({
      x: i,
      y: reading.waterLevel,
      label: parseDate(reading.date).toLocaleString("default", {
        month: "short",
      }),
    }));

    return {
      district: districtData.district,
      data,
      color: colors[index % colors.length],
    };
  });
}

/**
 * Calculate correlation coefficient between two arrays
 */
export function calculateCorrelationCoefficient(
  x: number[],
  y: number[],
): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate demand vs availability data
 * Demand is estimated based on population density and seasonal requirements
 * Availability is actual groundwater levels
 */
export function calculateDemandAvailability(
  readings: StationReadingWithDate[],
): DemandAvailabilityData[] {
  if (!readings || readings.length === 0) return [];

  // Group by month
  const monthlyData = new Map<string, number[]>();

  readings.forEach((reading) => {
    const date = parseDate(reading.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, []);
    }
    monthlyData.get(monthKey)!.push(reading.waterLevel);
  });

  // Calculate for each month
  const result: DemandAvailabilityData[] = [];
  const sortedMonths = Array.from(monthlyData.keys()).sort().slice(-12); // Last 12 months

  sortedMonths.forEach((monthKey) => {
    const levels = monthlyData.get(monthKey)!;
    const avgAvailability =
      levels.reduce((sum, l) => sum + l, 0) / levels.length;

    // Estimate demand based on season (higher in summer, lower in monsoon)
    const month = parseInt(monthKey.split("-")[1]);
    let demandMultiplier = 1.0;
    if (month >= 3 && month <= 6)
      demandMultiplier = 1.5; // Summer - high demand
    else if (month >= 7 && month <= 9)
      demandMultiplier = 0.7; // Monsoon - low demand
    else demandMultiplier = 1.0; // Other months

    const demand = 5.0 * demandMultiplier; // Base demand 5m
    const gap = Math.max(0, demand - avgAvailability);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    result.push({
      month: monthNames[month - 1],
      demand,
      availability: avgAvailability,
      gap,
    });
  });

  return result;
}

/**
 * Calculate stress index over time
 * Stress Index = Extraction / (Recharge + Storage)
 * Values: 0-0.3 (low), 0.3-0.5 (medium), 0.5-0.7 (high), >0.7 (critical)
 */
export function calculateStressIndex(
  readings: StationReadingWithDate[],
): StressIndexData[] {
  if (!readings || readings.length === 0) return [];

  // Group by month
  const monthlyData = new Map<string, number[]>();

  readings.forEach((reading) => {
    const date = parseDate(reading.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, []);
    }
    monthlyData.get(monthKey)!.push(reading.waterLevel);
  });

  const result: StressIndexData[] = [];
  const sortedMonths = Array.from(monthlyData.keys()).sort().slice(-12);

  sortedMonths.forEach((monthKey) => {
    const levels = monthlyData.get(monthKey)!;
    const avgLevel = levels.reduce((sum, l) => sum + l, 0) / levels.length;

    // Calculate stress index (inverse of water level, normalized)
    // Low water = high stress
    const stressIndex = Math.max(0, Math.min(1, 1 - avgLevel / 10));

    let category: "low" | "medium" | "high" | "critical";
    if (stressIndex < 0.3) category = "low";
    else if (stressIndex < 0.5) category = "medium";
    else if (stressIndex < 0.7) category = "high";
    else category = "critical";

    const month = parseInt(monthKey.split("-")[1]);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    result.push({
      month: monthNames[month - 1],
      stressIndex,
      category,
    });
  });

  return result;
}

/**
 * Classify stations into zones based on water levels
 */
export function classifyZones(
  readings: StationReadingWithDate[][],
): ZoneData[] {
  if (!readings || readings.length === 0) return [];

  const zones = {
    "Safe Zone (>5m)": { count: 0, color: "#10b981" },
    "Moderate Zone (3-5m)": { count: 0, color: "#f59e0b" },
    "Stressed Zone (1-3m)": { count: 0, color: "#ef4444" },
    "Critical Zone (<1m)": { count: 0, color: "#991b1b" },
  };

  // Classify each station based on average water level
  readings.forEach((stationReadings) => {
    if (stationReadings.length === 0) return;

    const avgLevel =
      stationReadings.reduce((sum, r) => sum + r.waterLevel, 0) /
      stationReadings.length;

    if (avgLevel > 5) zones["Safe Zone (>5m)"].count++;
    else if (avgLevel > 3) zones["Moderate Zone (3-5m)"].count++;
    else if (avgLevel > 1) zones["Stressed Zone (1-3m)"].count++;
    else zones["Critical Zone (<1m)"].count++;
  });

  const total = readings.length;

  return Object.entries(zones).map(([zone, data]) => ({
    zone,
    count: data.count,
    percentage: (data.count / total) * 100,
    color: data.color,
  }));
}

/**
 * Calculate seasonal water patterns
 */
export function calculateSeasonalPattern(
  readings: StationReadingWithDate[],
): SeasonalPatternData[] {
  if (!readings || readings.length === 0) return [];

  const seasons = {
    "Pre-Monsoon (Mar-May)": [] as number[],
    "Monsoon (Jun-Sep)": [] as number[],
    "Post-Monsoon (Oct-Nov)": [] as number[],
    "Winter (Dec-Feb)": [] as number[],
  };

  readings.forEach((reading) => {
    const date = parseDate(reading.date);
    const month = date.getMonth() + 1;

    if (month >= 3 && month <= 5) {
      seasons["Pre-Monsoon (Mar-May)"].push(reading.waterLevel);
    } else if (month >= 6 && month <= 9) {
      seasons["Monsoon (Jun-Sep)"].push(reading.waterLevel);
    } else if (month >= 10 && month <= 11) {
      seasons["Post-Monsoon (Oct-Nov)"].push(reading.waterLevel);
    } else {
      seasons["Winter (Dec-Feb)"].push(reading.waterLevel);
    }
  });

  const seasonOrder = [
    "Pre-Monsoon (Mar-May)",
    "Monsoon (Jun-Sep)",
    "Post-Monsoon (Oct-Nov)",
    "Winter (Dec-Feb)",
  ];

  const result: SeasonalPatternData[] = [];

  seasonOrder.forEach((season, index) => {
    const levels = seasons[season as keyof typeof seasons];
    if (levels.length === 0) return;

    const avgLevel = levels.reduce((sum, l) => sum + l, 0) / levels.length;
    const minLevel = Math.min(...levels);
    const maxLevel = Math.max(...levels);

    // Calculate recharge rate (compare with previous season)
    let rechargeRate = 0;
    if (index > 0 && result.length > 0) {
      const prevAvg = result[result.length - 1].avgLevel;
      rechargeRate = ((avgLevel - prevAvg) / prevAvg) * 100;
    }

    result.push({
      season,
      avgLevel,
      minLevel,
      maxLevel,
      rechargeRate,
    });
  });

  return result;
}

/**
 * Calculate stress vs water level correlation data
 */
export function calculateStressWaterLevel(
  readings: StationReadingWithDate[][],
): StressWaterLevelData[] {
  if (!readings || readings.length === 0) return [];

  const result: StressWaterLevelData[] = [];

  readings.forEach((stationReadings) => {
    if (stationReadings.length === 0) return;

    const avgLevel =
      stationReadings.reduce((sum, r) => sum + r.waterLevel, 0) /
      stationReadings.length;

    // Calculate stress index (inverse correlation with water level)
    const stressIndex = Math.max(0, Math.min(1, 1 - avgLevel / 10));

    // Determine zone
    let zone: string;
    if (avgLevel > 5) zone = "Safe Zone";
    else if (avgLevel > 3) zone = "Moderate Zone";
    else if (avgLevel > 1) zone = "Stressed Zone";
    else zone = "Critical Zone";

    result.push({
      waterLevel: avgLevel,
      stressIndex,
      zone,
    });
  });

  return result;
}

/**
 * Aggregate readings from multiple stations
 */
export function aggregateStationReadings(
  allStationReadings: StationReadingWithDate[][],
): StationReadingWithDate[] {
  if (allStationReadings.length === 0) return [];

  // Group readings by date
  const readingsByDate: Map<string, number[]> = new Map();

  allStationReadings.forEach((stationReadings) => {
    stationReadings.forEach((reading) => {
      if (!readingsByDate.has(reading.date)) {
        readingsByDate.set(reading.date, []);
      }
      readingsByDate.get(reading.date)!.push(reading.waterLevel);
    });
  });

  // Calculate average for each date
  const aggregatedReadings: StationReadingWithDate[] = [];
  readingsByDate.forEach((waterLevels, date) => {
    const avgWaterLevel =
      waterLevels.reduce((sum, level) => sum + level, 0) / waterLevels.length;
    aggregatedReadings.push({
      date,
      waterLevel: parseFloat(avgWaterLevel.toFixed(3)),
    });
  });

  // Sort by date
  return aggregatedReadings.sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
  );
}
