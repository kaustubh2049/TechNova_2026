import { useAuth } from "@/providers/auth-provider";
import { useStations } from "@/providers/stations-provider";
import {
  calculateLiveWaterLevel,
  getInterpolationConfidence,
} from "@/services/idw-interpolation-service";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle,
  ChevronRight,
  MapPin,
  Radio,
  Scale,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function HomeScreenContent() {
  const { stations, getAnalytics, alerts, userLocation } = useStations();
  const { user } = useAuth();
  const analytics = getAnalytics();
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Get current date
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get user display name from auth
  const displayName = user?.name || user?.email?.split("@")[0] || "Researcher";

  // Hardcoded location as requested
  const locationName = "Mahim, Mumbai";

  // Calculate live water level using IDW interpolation
  const liveWaterLevel = useMemo(() => {
    if (!userLocation || stations.length === 0) {
      return analytics.avgWaterLevel;
    }

    const nearbyStations = analytics.nearbyStations.slice(0, 5).map((s) => ({
      latitude: s.latitude,
      longitude: s.longitude,
      currentLevel: s.currentLevel,
    }));

    if (nearbyStations.length === 0) {
      return analytics.avgWaterLevel;
    }

    return calculateLiveWaterLevel(
      userLocation.latitude,
      userLocation.longitude,
      nearbyStations,
      5,
      2,
    );
  }, [
    userLocation,
    analytics.nearbyStations,
    analytics.avgWaterLevel,
    stations,
  ]);

  const interpolationConfidence = useMemo(() => {
    if (analytics.nearbyStations.length === 0) return "low";
    const nearest = analytics.nearbyStations[0];
    return getInterpolationConfidence(
      nearest.distance || 100,
      Math.min(analytics.nearbyStations.length, 5),
    );
  }, [analytics.nearbyStations]);

  const criticalStations = analytics.criticalStations;
  const totalStations = stations.length;
  const rechargeEvents = analytics.rechargeEvents;
  const statewideChange = analytics.statewideChange;

  // Calculate forecast risk
  const forecastRisk =
    criticalStations > 5 ? "High" : criticalStations > 2 ? "Moderate" : "Low";

  // Last sync time
  const lastSyncMinutes = analytics.lastSyncMinutes;

  // Get functional recent anomalies from alerts
  const recentAnomalies = useMemo(() => {
    return alerts
      .filter((a) => a.type === "critical" || a.type === "warning")
      .slice(0, 2)
      .map((alert) => ({
        id: alert.id,
        stationId: alert.stationId,
        stationName: alert.stationName,
        type: alert.type,
        title: alert.title,
        timestamp: alert.timestamp,
      }));
  }, [alerts]);

  return (
    <LinearGradient
      colors={["#FFFFFF", "#FFF7EA", "#FFE2AF"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/(tabs)/settings")}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>
              {getGreeting()}, {displayName}
            </Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color="#64748b" />
              <Text style={styles.locationText}>{locationName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/early-alerts")}
            activeOpacity={0.7}
          >
            <Bell size={22} color="#64748b" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Daily Insight Banner */}
        <Animated.View
          style={[
            styles.dailyBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.bannerHeader}>
            <MapPin size={20} color="#3F9AAE" />
            <Text style={styles.bannerTitle}>Daily Insight</Text>
          </View>
          <Text style={styles.bannerDescription}>
            Groundwater levels are stable overall. {criticalStations} critical
            zones show recharge lagging 12% behind seasonal expectations in your
            region.
          </Text>
          <TouchableOpacity
            style={styles.bannerAction}
            onPress={() => router.push("/(tabs)/analytics")}
            activeOpacity={0.8}
          >
            <Text style={styles.bannerActionText}>View Analysis</Text>
            <ArrowRight size={14} color="#3F9AAE" />
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          style={[
            styles.statsGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Live Water Level - Full Width */}
          <View style={styles.statCardFull}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconBg,
                  { backgroundColor: "rgba(121, 201, 197, 0.1)" },
                ]}
              >
                <Radio size={18} color="#79C9C5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>LIVE WATER LEVEL</Text>
                <Text style={styles.statSubLabel}>
                  IDW Interpolated •{" "}
                  {interpolationConfidence === "high"
                    ? "✓ High"
                    : interpolationConfidence === "medium"
                      ? "~ Medium"
                      : "○ Low"}{" "}
                  Confidence
                </Text>
              </View>
            </View>
            <View style={styles.statBottomFull}>
              <View>
                <Text style={styles.statValueLarge}>
                  {liveWaterLevel.toFixed(2)}m
                </Text>
                <Text style={styles.statDescription}>
                  Based on {Math.min(analytics.nearbyStations.length, 5)}{" "}
                  nearest stations
                </Text>
              </View>
              <View style={styles.liveIndicator}>
                <View style={styles.livePulse} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          </View>

          {/* Recharge */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconBg,
                  { backgroundColor: "rgba(255, 226, 175, 0.3)" },
                ]}
              >
                <Zap size={18} color="#9CA3AF" />
              </View>
              <Text style={styles.statLabel}>RECHARGE</Text>
            </View>
            <View style={styles.statBottom}>
              <Text style={styles.statValue}>
                +{analytics.rechargePercentage}%
              </Text>
              <View style={styles.statTrend}>
                <CheckCircle size={12} color="#3F9AAE" />
                <Text style={[styles.statTrendText, { color: "#3F9AAE" }]}>
                  {analytics.rechargePercentage > 30
                    ? "Optimal zone"
                    : "Needs attention"}
                </Text>
              </View>
            </View>
          </View>

          {/* Supply Gap */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBg, { backgroundColor: "#F9FAFB" }]}>
                <Scale size={18} color="#9CA3AF" />
              </View>
              <Text style={styles.statLabel}>SUPPLY GAP</Text>
            </View>
            <View style={styles.statBottom}>
              <Text style={styles.statValue}>{analytics.supplyGap}%</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(analytics.supplyGap, 100)}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Key Vital Signs */}
        <Text style={styles.sectionTitle}>KEY VITAL SIGNS</Text>
        <Animated.View
          style={[
            styles.vitalsGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Critical Stations */}
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>CRITICAL STATIONS</Text>
            <View style={[styles.vitalIconBg, { backgroundColor: "#FEE2E2" }]}>
              <AlertTriangle size={28} color="#F96E5B" />
            </View>
            <Text style={[styles.vitalValue, { color: "#F96E5B" }]}>
              {criticalStations.toString().padStart(2, "0")}{" "}
              <Text style={styles.vitalTotal}>/ {totalStations}</Text>
            </Text>
            <Text style={styles.vitalSubtext}>Requires Attention</Text>
          </View>

          {/* Statewide Change */}
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>STATEWIDE CHANGE (30d)</Text>
            <View
              style={[
                styles.vitalIconBg,
                {
                  backgroundColor: statewideChange >= 0 ? "#DCFCE7" : "#E0F2FE",
                },
              ]}
            >
              {statewideChange >= 0 ? (
                <TrendingUp size={28} color="#10b981" />
              ) : (
                <TrendingDown size={28} color="#79C9C5" />
              )}
            </View>
            <Text
              style={[
                styles.vitalValue,
                { color: statewideChange >= 0 ? "#10b981" : "#79C9C5" },
              ]}
            >
              {statewideChange >= 0 ? "+" : ""}
              {statewideChange.toFixed(2)}m
            </Text>
            <Text style={styles.vitalSubtext}>
              {statewideChange >= 0
                ? "Rising Levels"
                : statewideChange < -1
                  ? "Significant Decline"
                  : "Slight Decline"}
            </Text>
          </View>

          {/* Forecast Risk */}
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>FORECAST RISK (90 Day)</Text>
            <View style={[styles.vitalIconBg, { backgroundColor: "#FEF3C7" }]}>
              <AlertTriangle size={28} color="#F59E0B" />
            </View>
            <Text style={[styles.vitalValue, { color: "#F59E0B" }]}>
              {forecastRisk}
            </Text>
            <Text style={styles.vitalSubtext}>Based on current usage</Text>
          </View>

          {/* Data Freshness */}
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>DATA FRESHNESS</Text>
            <View style={[styles.vitalIconBg, { backgroundColor: "#DBEAFE" }]}>
              <CheckCircle size={28} color="#3F9AAE" />
            </View>
            <Text style={[styles.vitalValue, { color: "#3F9AAE" }]}>Live</Text>
            <Text style={styles.vitalSubtext}>
              Last sync: {lastSyncMinutes} mins ago
            </Text>
          </View>
        </Animated.View>

        {/* Main Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>MAIN ACTIONS</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/analytics")}
            activeOpacity={0.95}
          >
            <View style={styles.actionButtonLeft}>
              <TrendingUp size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Historical Trends</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/predictions")}
            activeOpacity={0.95}
          >
            <View style={styles.actionButtonLeft}>
              <MapPin size={24} color="#fff" />
              <Text style={styles.actionButtonText}>DWLR Stations</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Recent Anomalies */}
        <View style={styles.anomaliesSection}>
          <View style={styles.anomaliesHeader}>
            <Text style={styles.sectionTitle}>RECENT ANOMALIES</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/alerts")}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentAnomalies.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle size={32} color="#10b981" />
              <Text style={styles.emptyStateText}>No recent anomalies</Text>
            </View>
          ) : (
            <View style={styles.anomaliesList}>
              {recentAnomalies.map((anomaly, index) => {
                const timeAgo = Math.floor(
                  (Date.now() - new Date(anomaly.timestamp).getTime()) /
                    (1000 * 60 * 60),
                );

                return (
                  <View key={anomaly.id} style={styles.anomalyCard}>
                    <View style={styles.anomalyIconBg}>
                      <MapPin size={24} color="#79C9C5" />
                    </View>
                    <View style={styles.anomalyContent}>
                      <Text style={styles.anomalyId}>
                        DWLR #{anomaly.stationId}
                      </Text>
                      <Text style={styles.anomalyStation}>
                        {anomaly.stationName}
                      </Text>
                    </View>
                    <View style={styles.anomalyRight}>
                      <Text
                        style={[
                          styles.anomalyValue,
                          {
                            color:
                              anomaly.type === "critical"
                                ? "#F96E5B"
                                : "#3F9AAE",
                          },
                        ]}
                      >
                        {anomaly.type === "critical" ? "-0.85m" : "+0.12m"}
                      </Text>
                      <Text style={styles.anomalyTime}>{timeAgo}h ago</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Critical Alert Banner - At Bottom */}
        <Animated.View
          style={[
            styles.alertBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.alertIconLarge}>
            <AlertTriangle size={60} color="rgba(255,255,255,0.1)" />
          </View>
          <View style={styles.alertContent}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={14} color="#fff" />
              <Text style={styles.alertBadge}>CRITICAL ALERT</Text>
            </View>
            <Text style={styles.alertTitle}>Abnormal Decline Detected</Text>
            <Text style={styles.alertDescription}>
              {criticalStations} stations in the Northern Basin show a -1.2m
              deviation. Recharge potential is failing to meet current demand.
            </Text>
            <TouchableOpacity style={styles.alertButton} activeOpacity={0.8}>
              <Text style={styles.alertButtonText}>Analyze Anomalies</Text>
              <ArrowRight size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

export default function HomeScreen() {
  return <HomeScreenContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE2AF", // Sunset cream
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3F9AAE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerDate: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F96E5B",
    borderWidth: 2,
    borderColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  // Daily Insight Banner
  dailyBanner: {
    backgroundColor: "#3F9AAE", // Ocean blue - darker than seafoam
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  bannerDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 21,
    marginBottom: 16,
    fontWeight: "500",
  },
  bannerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  bannerActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3F9AAE",
  },
  // Key Vitals Grid
  vitalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  vitalCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 16,
    textAlign: "center",
  },
  vitalIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  vitalValue: {
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 30,
    marginBottom: 6,
    textAlign: "center",
  },
  vitalTotal: {
    fontSize: 18,
    fontWeight: "400",
    color: "#9CA3AF",
  },
  vitalSubtext: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
  // Critical Alert Banner
  alertBanner: {
    position: "relative",
    backgroundColor: "#F96E5B",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#F96E5B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  alertIconLarge: {
    position: "absolute",
    top: 0,
    right: 16,
    opacity: 1,
  },
  alertContent: {
    position: "relative",
    zIndex: 10,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  alertBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1.5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 21,
    marginBottom: 16,
  },
  alertButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  alertButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    minHeight: 140,
    justifyContent: "space-between",
  },
  statCardFull: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderLeftWidth: 4,
    borderLeftColor: "#79C9C5",
    shadowColor: "#79C9C5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statSubLabel: {
    fontSize: 9,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  statBottom: {
    gap: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -1,
  },
  statValueLarge: {
    fontSize: 38,
    fontWeight: "900",
    color: "#79C9C5",
    letterSpacing: -1,
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  statBottomFull: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 12,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(121, 201, 197, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#79C9C5",
    letterSpacing: 1,
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statTrendText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F96E5B",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3F9AAE",
    borderRadius: 4,
  },
  // Actions Section
  actionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3F9AAE",
    borderRadius: 24,
    paddingHorizontal: 24,
    height: 64,
    marginBottom: 12,
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  actionButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  // Anomalies Section
  anomaliesSection: {
    marginBottom: 24,
  },
  anomaliesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  seeAllButton: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3F9AAE",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  anomaliesList: {
    gap: 12,
  },
  anomalyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  anomalyIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(121, 201, 197, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  anomalyContent: {
    flex: 1,
  },
  anomalyId: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: -0.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  anomalyStation: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  anomalyRight: {
    alignItems: "flex-end",
  },
  anomalyValue: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 16,
    marginBottom: 4,
  },
  anomalyTime: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
});
