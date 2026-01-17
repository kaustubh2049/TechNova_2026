import { GaugeChart } from "@/components/gauge-chart";
import { useStations } from "@/providers/stations-provider";
import { fetchStationAlerts, getAlertColor, getAlertIcon, GroundwaterAlert } from "@/services/alerts-service";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, RefreshCw, Settings, Share2, TrendingDown } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg";

function StationDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStationById, getStationHealthScore } = useStations();
  const [selectedTab, setSelectedTab] = useState<
    "trends" | "recharge" | "forecast" | "metadata"
  >("forecast");
  const [stationAlerts, setStationAlerts] = useState<GroundwaterAlert[]>([]);

  // Fetch station-specific alerts from database
  useEffect(() => {
    if (id) {
      fetchStationAlerts(id, 5).then(setStationAlerts);
    }
  }, [id]);

  console.log("=== Station Details Page ===");
  console.log("Station ID from params:", id);

  const station = getStationById(id!);

  console.log("Station found:", station ? "YES" : "NO");
  if (station) {
    console.log("Station details:", {
      id: station.id,
      name: station.name,
      lat: station.latitude,
      lon: station.longitude,
      level: station.currentLevel,
    });
  }

  if (!station) {
    console.log("ERROR: Station not found for ID:", id);
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={styles.errorText}>Station not found</Text>
          <Text style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            ID: {id}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 20, padding: 12, backgroundColor: "#3F9AAE", borderRadius: 8 }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const healthScore = getStationHealthScore(station);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "#059669";
      case "warning":
        return "#ea580c";
      case "critical":
        return "#F96E5B";
      default:
        return "#64748b";
    }
  };

  const formatCoordinates = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? "N" : "S";
    const lonDir = lon >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  };

  const getTimeSinceUpdate = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const tabs = [
    { key: "trends" as const, label: "Trends" },
    { key: "recharge" as const, label: "Recharge" },
    { key: "forecast" as const, label: "Forecast" },
    { key: "metadata" as const, label: "Metadata" },
  ];

  // Calculate trend percentage
  const calculateTrend = () => {
    if (station.recentReadings.length < 2) return 1.2;
    const oldest = station.recentReadings[0].level;
    const newest = station.recentReadings[station.recentReadings.length - 1].level;
    return ((newest - oldest) / oldest * 100);
  };

  const trendPercent = calculateTrend();
  const signalDbm = -100 + (station.signalStrength * 0.5);
  const solarVoltage = (station.batteryLevel / 100) * 14 + 10;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={18} color="#1A1D1E" />
          </TouchableOpacity>
          <View>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.coordinates}>
              {formatCoordinates(station.latitude, station.longitude)}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 size={18} color="#3F9AAE" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={18} color="#3F9AAE" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Gauge Chart Section */}
        <View style={styles.gaugeSection}>
          <View style={styles.gaugeGlow} />
          <GaugeChart score={healthScore} size={256} />
          <View style={styles.gaugeInfo}>
            <Text style={styles.gaugeLabel}>Groundwater Health Score</Text>
            <View style={styles.refreshInfo}>
              <RefreshCw size={10} color="#94a3b8" />
              <Text style={styles.gaugeTimestamp}>
                Refreshed {getTimeSinceUpdate(station.lastUpdated)} via IRNSS
              </Text>
            </View>
          </View>
        </View>

        {/* Alert Banner - Shows database alerts OR status-based alerts */}
        {(stationAlerts.length > 0 || station.status === "warning" || station.status === "critical") && (
          <View style={styles.alertContainer}>
            {stationAlerts.length > 0 ? (
              // Show latest database alert
              <View style={[styles.alertBanner, { borderLeftColor: getAlertColor(stationAlerts[0].severity) }]}>
                <View style={styles.alertIcon}>
                  <Text style={{ fontSize: 24 }}>{getAlertIcon(stationAlerts[0].alert_type)}</Text>
                </View>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: getAlertColor(stationAlerts[0].severity) }]}>
                    {stationAlerts[0].alert_type.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.alertMessage}>
                    {stationAlerts[0].message}
                  </Text>
                  <Text style={styles.alertTime}>
                    {new Date(stationAlerts[0].triggered_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ) : (
              // Fallback to status-based alert
              <View style={[styles.alertBanner, { borderLeftColor: getStatusColor(station.status) }]}>
                <View style={styles.alertIcon}>
                  <TrendingDown size={20} color={getStatusColor(station.status)} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: getStatusColor(station.status) }]}>
                    Rapid Decline Warning
                  </Text>
                  <Text style={styles.alertMessage}>
                    Water level has dropped {Math.abs(station.currentLevel).toFixed(1)}m below seasonal norms. Predicted depletion risk in 45 days.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  selectedTab === tab.key && styles.tabActive,
                ]}
                onPress={() => setSelectedTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Water Level Card */}
        <View style={styles.cardContainer}>
          <View style={styles.waterLevelCard}>
            <View style={styles.waterLevelHeader}>
              <View>
                <Text style={styles.waterLevelLabel}>DWLR WATER LEVEL (M)</Text>
                <View style={styles.waterLevelValueRow}>
                  <Text style={styles.waterLevelValue}>
                    {station.currentLevel.toFixed(2)}m
                  </Text>
                  <View style={styles.trendBadge}>
                    <TrendingDown size={12} color="#F96E5B" />
                    <Text style={styles.trendText}>{Math.abs(trendPercent).toFixed(1)}%</Text>
                  </View>
                </View>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE FEED</Text>
              </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
              <Svg width="100%" height={192} viewBox="0 0 400 150" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="grad-hist" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#3F9AAE" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="#3F9AAE" stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                <Path
                  d="M0 120 C 50 110, 80 130, 120 100 C 160 70, 200 80, 240 110 L 240 150 L 0 150 Z"
                  fill="url(#grad-hist)"
                />
                <Path
                  d="M0 120 C 50 110, 80 130, 120 100 C 160 70, 200 80, 240 110"
                  fill="none"
                  stroke="#3F9AAE"
                  strokeWidth="2.5"
                />
                <Path
                  d="M240 110 C 280 140, 320 145, 400 148"
                  fill="none"
                  stroke="#F96E5B"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                />
                <Circle cx="240" cy="110" r="4" fill="#3F9AAE" />
                <SvgText x="225" y="95" fontSize="9" fontWeight="bold" fill="#94a3b8">
                  TODAY
                </SvgText>
              </Svg>

              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>MAY</Text>
                <Text style={styles.chartLabel}>JUN</Text>
                <Text style={styles.chartLabel}>JUL</Text>
                <Text style={[styles.chartLabel, styles.chartLabelActive]}>AUG</Text>
                <Text style={[styles.chartLabel, styles.chartLabelItalic]}>SEP (EST)</Text>
                <Text style={[styles.chartLabel, styles.chartLabelItalic]}>OCT (EST)</Text>
              </View>
            </View>

            {/* Forecast Metrics */}
            <View style={styles.forecastMetrics}>
              <View style={styles.forecastCard}>
                <Text style={styles.forecastLabel}>30-DAY FORECAST</Text>
                <Text style={styles.forecastValue}>
                  {(station.currentLevel * 1.19).toFixed(2)}m (-19%)
                </Text>
              </View>
              <View style={styles.forecastCard}>
                <Text style={styles.forecastLabel}>CONFIDENCE</Text>
                <Text style={styles.forecastValueNormal}>± 0.15m (95%)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hardware Status */}
        <Text style={styles.sectionTitle}>HARDWARE STATUS</Text>
        <View style={styles.hardwareGrid}>
          <View style={styles.hardwareCard}>
            <Text style={styles.hardwareIcon}>🌡️</Text>
            <Text style={styles.hardwareLabel}>AMBIENT TEMP</Text>
            <Text style={styles.hardwareValue}>
              {station.temperature ? `${station.temperature.toFixed(1)}°C` : "28.4°C"}
            </Text>
          </View>

          <View style={styles.hardwareCard}>
            <Text style={styles.hardwareIcon}>☀️</Text>
            <Text style={styles.hardwareLabel}>SOLAR POWER</Text>
            <Text style={styles.hardwareValue}>{solarVoltage.toFixed(1)}V</Text>
          </View>

          <View style={styles.hardwareCard}>
            <Text style={styles.hardwareIcon}>📡</Text>
            <Text style={styles.hardwareLabel}>SIGNAL (DBM)</Text>
            <Text style={styles.hardwareValue}>{signalDbm.toFixed(0)} dBm</Text>
          </View>

          <View style={styles.hardwareCard}>
            <Text style={styles.hardwareIcon}>🌊</Text>
            <Text style={styles.hardwareLabel}>MAX DEPTH</Text>
            <Text style={styles.hardwareValue}>
              {station.depth > 0 ? `${station.depth.toFixed(1)}m` : "120.0m"}
            </Text>
          </View>
        </View>

        {/* Research Insight Card */}
        <View style={styles.insightCardContainer}>
          <View style={styles.insightCard}>
            <View style={styles.insightBackground}>
              <Text style={styles.insightBackgroundIcon}>💡</Text>
            </View>
            <View style={styles.insightHeader}>
              <Text style={styles.insightHeaderIcon}>🧠</Text>
              <Text style={styles.insightTitle}>Research Insight</Text>
            </View>
            <Text style={styles.insightText}>
              Current groundwater levels are {Math.abs(station.currentLevel).toFixed(1)}m below the 10-year rolling average.
              This correlates with the 15% reduction in monsoon rainfall recorded at the nearest station (BNS-01).
            </Text>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>DOWNLOAD ANALYSIS REPORT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function StationDetailScreen() {
  return <StationDetailContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF6F6",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F96E5B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(12px)",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },
  stationName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1D1E",
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  coordinates: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3F9AAE",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  content: {
    flex: 1,
  },
  gaugeSection: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    position: "relative",
  },
  gaugeGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 256,
    height: 256,
    backgroundColor: "rgba(121, 201, 197, 0.2)",
    borderRadius: 128,
    transform: [{ translateX: -128 }, { translateY: -64 }],
    opacity: 0.6,
  },
  gaugeInfo: {
    alignItems: "center",
    marginTop: 16,
    zIndex: 10,
  },
  gaugeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  refreshInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  gaugeTimestamp: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94a3b8",
  },
  alertContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  alertBanner: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
    fontWeight: "500",
  },
  alertTime: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 8,
  },
  tabsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 8,
    position: "sticky",
    top: 73,
    zIndex: 40,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 32,
  },
  tab: {
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#F96E5B",
  },
  tabText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.5,
  },
  tabTextActive: {
    color: "#F96E5B",
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  waterLevelCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  waterLevelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  waterLevelLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.5,
  },
  waterLevelValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  waterLevelValue: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1A1D1E",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F96E5B",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(249, 110, 91, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F96E5B",
  },
  liveText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#F96E5B",
  },
  chartContainer: {
    marginTop: 24,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  chartLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#D1D5DB",
  },
  chartLabelActive: {
    color: "#F96E5B",
  },
  chartLabelItalic: {
    fontStyle: "italic",
  },
  forecastMetrics: {
    flexDirection: "row",
    gap: 16,
    marginTop: 32,
  },
  forecastCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  forecastLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F96E5B",
    marginTop: 4,
  },
  forecastValueNormal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D1E",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 2,
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  hardwareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  hardwareCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(4px)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(63, 154, 174, 0.2)",
  },
  hardwareIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  hardwareLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 8,
  },
  hardwareValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1D1E",
  },
  insightCardContainer: {
    paddingHorizontal: 16,
    marginTop: 32,
    paddingBottom: 20,
  },
  insightCard: {
    backgroundColor: "#3F9AAE",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  insightBackground: {
    position: "absolute",
    right: -24,
    bottom: -24,
    opacity: 0.1,
  },
  insightBackgroundIcon: {
    fontSize: 140,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  insightHeaderIcon: {
    fontSize: 18,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  insightText: {
    fontSize: 12,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginBottom: 24,
  },
  downloadButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3F9AAE",
    letterSpacing: 1.5,
  },
});
