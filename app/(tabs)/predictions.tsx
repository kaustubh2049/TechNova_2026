import { useStations } from "@/providers/stations-provider";
import { NearbyStation } from "@/services/station-explorer-service";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowRight,
  MapPin,
  Navigation,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const Y_AXIS_WIDTH = 40; // Space for Y-axis labels
const CHART_WIDTH = SCREEN_WIDTH - 100 - Y_AXIS_WIDTH;
const CHART_HEIGHT = 100;

type TimeRange = "6m" | "1y" | "2y";

function StationExplorerContent() {
  const {
    userLocation,
    isLoadingLocation,
    requestLocationPermission,
    nearbyStations: contextNearbyStations,
    getStationReadings,
    isLoadingStations,
  } = useStations();
  const insets = useSafeAreaInsets();
  const [stations, setStations] = useState<NearbyStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("1y");
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  // Request location on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Fetch stations when location or time range changes
  useEffect(() => {
    loadStations();
  }, [timeRange, userLocation, contextNearbyStations]);

  const loadStations = async () => {
    setLoading(true);

    let lat: number;
    let lon: number;

    if (userLocation && userLocation.latitude && userLocation.longitude) {
      lat = userLocation.latitude;
      lon = userLocation.longitude;
      console.log(`📍 Using LIVE location: ${lat}, ${lon}`);
    } else {
      // Default to Mumbai if no location
      lat = 19.076;
      lon = 72.8777;
      console.log(`📍 Using DEFAULT location (Mumbai): ${lat}, ${lon}`);
    }

    setCurrentLocation({ lat, lon });

    // Use the 10 nearest stations from context provider instead of fetching separately
    console.log(
      `🎯 Using ${contextNearbyStations.length} nearest stations from provider`,
    );

    // Convert context stations to NearbyStation format with readings
    const stationsWithReadings: NearbyStation[] = await Promise.all(
      contextNearbyStations.map(async (station) => {
        console.log(`📊 Fetching readings for ${station.name} (${station.id})`);
        const readings = await getStationReadings(
          station.latitude,
          station.longitude,
          timeRange,
        );

        console.log(
          `📈 Got ${readings.length} readings for ${station.name}:`,
          readings.slice(0, 3).map((r) => `${r.date}: ${r.level}m`),
        );

        return {
          wlcode: station.id,
          name: station.name,
          district: station.district,
          state: station.state,
          latitude: station.latitude,
          longitude: station.longitude,
          distance: station.distance || 0,
          currentWaterLevel: station.currentLevel,
          status: station.status === "normal" ? "safe" : station.status,
          readings: readings.map((r) => ({
            date: r.date,
            waterLevel: r.level,
          })),
        };
      }),
    );

    console.log(`✅ Loaded ${stationsWithReadings.length} stations with data`);
    setStations(stationsWithReadings);
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    requestLocationPermission(); // Re-request location
    loadStations();
  };

  // Generate SVG path for line chart
  // Helper to get consistent axis range
  const getChartAxisData = (
    readings: { date: string; waterLevel: number }[],
  ) => {
    if (readings.length === 0) return { min: 0, max: 10, ticks: [5] };
    // Filter out invalid readings
    const validLevels = readings
      .map((r) => r.waterLevel)
      .filter(
        (level) =>
          typeof level === "number" && !isNaN(level) && isFinite(level),
      );

    if (validLevels.length === 0) return { min: 0, max: 10, ticks: [5] };

    const rawMin = Math.min(...validLevels);
    const rawMax = Math.max(...validLevels);
    const padding = (rawMax - rawMin) * 0.1 || 0.5;

    // Round for nicer labels
    const min = Math.floor((rawMin - padding) * 10) / 10;
    const max = Math.ceil((rawMax + padding) * 10) / 10;
    const mid = (min + max) / 2;

    return { min, max, ticks: [max, mid, min] }; // Top to bottom order
  };

  // Generate SVG path for line chart
  const generateChartPath = (
    readings: { date: string; waterLevel: number }[],
    min: number,
    max: number,
  ) => {
    if (readings.length < 2) return "";
    // Filter out invalid readings
    const validReadings = readings.filter(
      (r) =>
        typeof r.waterLevel === "number" &&
        !isNaN(r.waterLevel) &&
        isFinite(r.waterLevel),
    );
    if (validReadings.length < 2) return "";

    const range = max - min || 1;

    const points = validReadings.map((reading, index) => {
      // Shift x by Y_AXIS_WIDTH
      const x =
        Y_AXIS_WIDTH + (index / (validReadings.length - 1)) * CHART_WIDTH;
      // Invert y (SVG coords: 0 is top)
      const y = ((max - reading.waterLevel) / range) * CHART_HEIGHT;
      return { x: isFinite(x) ? x : 0, y: isFinite(y) ? y : 0 };
    });

    return points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, "");
  };

  // Generate area fill path
  const generateAreaPath = (
    readings: { date: string; waterLevel: number }[],
    min: number,
    max: number,
  ) => {
    if (readings.length < 2) return "";
    const linePath = generateChartPath(readings, min, max);
    if (!linePath) return "";
    // Close the path at the bottom
    return `${linePath} L ${Y_AXIS_WIDTH + CHART_WIDTH} ${CHART_HEIGHT} L ${Y_AXIS_WIDTH} ${CHART_HEIGHT} Z`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "#79C9C5";
      case "warning":
        return "#F59E0B";
      case "critical":
        return "#F96E5B";
      default:
        return "#9CA3AF";
    }
  };

  const getTrend = (readings: { date: string; waterLevel: number }[]) => {
    if (readings.length < 2) return { direction: "up", value: 0 };
    // Filter valid readings
    const validReadings = readings.filter(
      (r) =>
        typeof r.waterLevel === "number" &&
        !isNaN(r.waterLevel) &&
        isFinite(r.waterLevel),
    );
    if (validReadings.length < 2) return { direction: "up", value: 0 };

    const first = validReadings[0].waterLevel;
    const last = validReadings[validReadings.length - 1].waterLevel;
    if (first === 0) return { direction: "up", value: 0 };
    const change = ((last - first) / first) * 100;
    return {
      direction: change >= 0 ? "up" : "down",
      value: Math.abs(change).toFixed(1),
    };
  };

  const timeRangeLabels = {
    "6m": "6 Months",
    "1y": "1 Year",
    "2y": "2 Years",
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#FFF7EA", "#FFE2AF"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <MapPin size={24} color="#3F9AAE" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Station Explorer</Text>
              <Text style={styles.headerSubtitle}>NEARBY STATIONS</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <RefreshCw size={20} color="#3F9AAE" />
          </TouchableOpacity>
        </View>

        {/* Time Range Toggle */}
        <View style={styles.timeRangeContainer}>
          {(["6m", "1y", "2y"] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {timeRangeLabels[range]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Distance Info */}
        <View style={styles.distanceInfo}>
          <Navigation size={14} color="#64748b" />
          <Text style={styles.distanceText}>
            {stations.length === 0
              ? "Locating nearest stations..."
              : `${stations.length} nearest stations sorted by distance`}
          </Text>
        </View>

        {/* Location Badge */}
        {currentLocation &&
          typeof currentLocation.lat === "number" &&
          typeof currentLocation.lon === "number" && (
            <View style={styles.locationBadge}>
              <MapPin size={12} color="#3F9AAE" />
              <Text style={styles.locationBadgeText}>
                Your Location: {currentLocation.lat.toFixed(4)}°N,{" "}
                {currentLocation.lon.toFixed(4)}°E
              </Text>
            </View>
          )}
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F9AAE" />
          <Text style={styles.loadingText}>Loading nearby stations...</Text>
        </View>
      ) : (
        /* Station List */
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {stations.map((station, index) => {
            const trend = getTrend(station.readings);
            const axisData = getChartAxisData(station.readings);
            const statusColor = getStatusColor(station.status);

            return (
              <TouchableOpacity
                key={station.wlcode}
                style={styles.stationCard}
                onPress={() => router.push(`/station/${station.wlcode}`)}
                activeOpacity={0.9}
              >
                {/* Rank Badge */}
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>

                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(station.status) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              station.status === "warning" ? "#1A1A1A" : "#fff",
                          },
                        ]}
                      >
                        {station.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.stationCode}>{station.wlcode}</Text>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceBadgeText}>
                        {station.distance.toFixed(2)} km
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <Text style={styles.stationValue}>
                      {station.currentWaterLevel.toFixed(2)}
                      <Text style={styles.stationUnit}>m</Text>
                    </Text>
                    <View
                      style={[
                        styles.trendBadge,
                        {
                          backgroundColor:
                            trend.direction === "up" ? "#F96E5B" : "#79C9C5",
                        },
                      ]}
                    >
                      {trend.direction === "up" ? (
                        <TrendingUp size={12} color="#fff" />
                      ) : (
                        <TrendingDown size={12} color="#fff" />
                      )}
                      <Text style={styles.trendText}>
                        {trend.direction === "up" ? "+" : "-"}
                        {trend.value}%
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.stationName}>{station.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={12} color="#79C9C5" />
                  <Text style={styles.locationText}>
                    {station.district}, {station.state}
                  </Text>
                </View>

                {/* Water Level Chart */}
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>WATER LEVEL TREND (m)</Text>
                  {station.readings && station.readings.length >= 2 ? (
                    <Svg width={SCREEN_WIDTH - 80} height={CHART_HEIGHT + 20}>
                      {/* Y-Axis Lines & Labels */}
                      {axisData.ticks.map((tick, i) => {
                        const y =
                          ((axisData.max - tick) /
                            (axisData.max - axisData.min)) *
                          CHART_HEIGHT;
                        return (
                          <React.Fragment key={i}>
                            <SvgText
                              x={Y_AXIS_WIDTH - 8}
                              y={y + 4}
                              fill="#9CA3AF"
                              fontSize="9"
                              fontWeight="600"
                              textAnchor="end"
                            >
                              {tick.toFixed(1)}
                            </SvgText>
                            <Line
                              x1={Y_AXIS_WIDTH}
                              y1={y}
                              x2={CHART_WIDTH + Y_AXIS_WIDTH}
                              y2={y}
                              stroke="#E5E7EB"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                          </React.Fragment>
                        );
                      })}

                      {/* Area fill */}
                      <Path
                        d={generateAreaPath(
                          station.readings,
                          axisData.min,
                          axisData.max,
                        )}
                        fill={`${statusColor}15`}
                      />
                      {/* Line */}
                      <Path
                        d={generateChartPath(
                          station.readings,
                          axisData.min,
                          axisData.max,
                        )}
                        stroke={statusColor}
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* End point */}
                      {station.readings.length > 0 && (
                        <Circle
                          cx={Y_AXIS_WIDTH + CHART_WIDTH}
                          cy={
                            ((axisData.max -
                              station.readings[station.readings.length - 1]
                                .waterLevel) /
                              (axisData.max - axisData.min)) *
                            CHART_HEIGHT
                          }
                          r="5"
                          fill={statusColor}
                        />
                      )}
                    </Svg>
                  ) : (
                    <View style={styles.noDataContainer}>
                      <Text style={styles.noDataText}>
                        {station.readings
                          ? `Only ${station.readings.length} data points (need 2+)`
                          : "No data available"}
                      </Text>
                    </View>
                  )}

                  {/* Chart Labels */}
                  <View
                    style={[styles.chartLabels, { paddingLeft: Y_AXIS_WIDTH }]}
                  >
                    <Text style={styles.chartLabel}>
                      {timeRange === "6m"
                        ? "JUL 2025"
                        : timeRange === "1y"
                          ? "JAN 2025"
                          : "APR 2023"}
                    </Text>
                    <Text style={styles.chartLabel}>NOW</Text>
                  </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.readingsInfo}>
                    <Text style={styles.readingsCount}>
                      {station.readings.length}
                    </Text>
                    <Text style={styles.readingsLabel}>data points</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.analysisButton}
                    onPress={() => router.push(`/station/${station.wlcode}`)}
                  >
                    <Text style={styles.analysisButtonText}>View Details</Text>
                    <ArrowRight size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

export default function StationExplorer() {
  return <StationExplorerContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE2AF",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(63, 154, 174, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1.5,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(63, 154, 174, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  timeRangeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  timeRangeButtonActive: {
    backgroundColor: "#3F9AAE",
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  timeRangeTextActive: {
    color: "#fff",
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(63, 154, 174, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  locationBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3F9AAE",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stationCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(121, 201, 197, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3F9AAE",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  stationCode: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  distanceBadge: {
    backgroundColor: "rgba(63, 154, 174, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3F9AAE",
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  stationValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: -1,
  },
  stationUnit: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  stationName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  chartContainer: {
    backgroundColor: "rgba(255, 226, 175, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 226, 175, 0.3)",
  },
  chartTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  noDataContainer: {
    height: CHART_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readingsInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  readingsCount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#3F9AAE",
  },
  readingsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  analysisButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3F9AAE",
    paddingLeft: 20,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
});
