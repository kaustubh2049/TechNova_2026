/**
 * Inverse Distance Weighted (IDW) Interpolation Service
 *
 * Estimates live groundwater level at any location using nearby DWLR stations.
 * Uses spatial interpolation based on distance-weighted averaging.
 *
 * Reference: Standard technique in hydrology and geospatial analysis
 */

interface StationWithDistance {
  latitude: number;
  longitude: number;
  currentLevel: number;
  distance: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate live groundwater level using Inverse Distance Weighted (IDW) interpolation
 *
 * Formula:
 * L(x) = Σ(Li / di^p) / Σ(1 / di^p)
 *
 * Where:
 * - L(x) = estimated live groundwater level at target location
 * - Li = most recent groundwater level at station i
 * - di = distance between station i and target location
 * - p = distance decay parameter (typically 2)
 *
 * @param targetLat - Target location latitude
 * @param targetLon - Target location longitude
 * @param stations - Array of nearby stations with their data
 * @param maxStations - Maximum number of nearest stations to use (default: 5)
 * @param power - Distance decay parameter (default: 2)
 * @returns Estimated live groundwater level in meters
 */
export function calculateLiveWaterLevel(
  targetLat: number,
  targetLon: number,
  stations: Array<{
    latitude: number;
    longitude: number;
    currentLevel: number;
  }>,
  maxStations: number = 5,
  power: number = 2,
): number {
  if (!stations || stations.length === 0) {
    return 0;
  }

  // Calculate distances and sort by proximity
  const stationsWithDistance: StationWithDistance[] = stations
    .map((station) => ({
      ...station,
      distance: calculateDistance(
        targetLat,
        targetLon,
        station.latitude,
        station.longitude,
      ),
    }))
    .filter((s) => s.distance > 0) // Exclude exact location matches
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxStations); // Take only nearest stations

  if (stationsWithDistance.length === 0) {
    // If no valid stations, return average of all
    return (
      stations.reduce((sum, s) => sum + s.currentLevel, 0) / stations.length
    );
  }

  // Apply IDW formula
  let weightedSum = 0;
  let weightSum = 0;

  for (const station of stationsWithDistance) {
    const weight = 1 / Math.pow(station.distance, power);
    weightedSum += station.currentLevel * weight;
    weightSum += weight;
  }

  const liveLevel = weightedSum / weightSum;

  return parseFloat(liveLevel.toFixed(2));
}

/**
 * Get interpolation confidence level based on station distribution
 * @param nearestDistance - Distance to nearest station (km)
 * @param stationCount - Number of stations used
 * @returns Confidence level: 'high', 'medium', or 'low'
 */
export function getInterpolationConfidence(
  nearestDistance: number,
  stationCount: number,
): "high" | "medium" | "low" {
  if (nearestDistance < 5 && stationCount >= 5) return "high";
  if (nearestDistance < 15 && stationCount >= 3) return "medium";
  return "low";
}

/**
 * Calculate trend based on recent station readings
 * @param currentLevel - Current interpolated level
 * @param previousLevel - Previous interpolated level (if available)
 * @returns Trend percentage
 */
export function calculateTrend(
  currentLevel: number,
  previousLevel: number,
): number {
  if (!previousLevel || previousLevel === 0) return 0;
  const change = currentLevel - previousLevel;
  const percentage = (change / Math.abs(previousLevel)) * 100;
  return parseFloat(percentage.toFixed(1));
}
