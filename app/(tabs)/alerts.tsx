import { StationMap } from "@/components/station-map";
import { useStations } from "@/providers/stations-provider";
import { fetchGroundwaterAlerts, getAlertColor, getAlertIcon, GroundwaterAlert } from "@/services/alerts-service";
import { fetchRegionalData, RegionalData } from "@/services/regional-data-service";
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from "expo-router";
import {
  Bell,
  ChartBar,
  MapPin
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MapViewContent() {
  const { stations, userLocation } = useStations();
  const insets = useSafeAreaInsets();
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [alerts, setAlerts] = useState<GroundwaterAlert[]>([]);

  // Fetch regional data on mount
  useEffect(() => {
    const loadRegionalData = async () => {
      const data = await fetchRegionalData();
      setRegionalData(data);
    };
    loadRegionalData();
  }, []);

  // Fetch alerts on mount and refresh every 30 seconds
  useEffect(() => {
    const loadAlerts = async () => {
      const alertsData = await fetchGroundwaterAlerts(5, true);
      setAlerts(alertsData);
    };
    
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Refresh every 30s
    
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic metrics based on stations data
  const calculateMetrics = () => {
    if (!stations || stations.length === 0) {
      return {
        suitabilityScore: 0,
        suitabilityStatus: "No Data",
        suitabilityColor: "#9CA3AF",
        dwlrImpact: 0,
        dwlrTrend: "No Data",
        dwlrColor: "#9CA3AF",
        waterStressIndex: 0,
        waterStressLevel: "No Data",
        waterStressColor: "#9CA3AF",
        safeCount: 0,
        warningCount: 0,
        criticalCount: 0,
        totalStations: 0,
        criticalStations: [],
      };
    }

    // Filter nearby stations (you can adjust radius if needed)
    const nearbyStations = stations.slice(0, 10); // Use nearest 10 stations

    // Calculate Suitability Score (0-100)
    // Based on: % of safe stations + inverse of average water level
    const safeStations = nearbyStations.filter(s => s.status === "normal").length;
    const criticalStations = nearbyStations.filter(s => s.status === "critical").length;
    const warningStations = nearbyStations.filter(s => s.status === "warning").length;
    
    const safeRatio = safeStations / nearbyStations.length;
    const criticalPenalty = (criticalStations / nearbyStations.length) * 30;
    const warningPenalty = (warningStations / nearbyStations.length) * 15;
    
    let suitabilityScore = Math.round((safeRatio * 100) - criticalPenalty - warningPenalty);
    suitabilityScore = Math.max(0, Math.min(100, suitabilityScore)); // Clamp 0-100

    let suitabilityStatus = "Poor";
    let suitabilityColor = "#F96E5B"; // Red
    if (suitabilityScore >= 75) {
      suitabilityStatus = "Optimal Yield";
      suitabilityColor = "#3F9AAE"; // Blue
    } else if (suitabilityScore >= 50) {
      suitabilityStatus = "Moderate";
      suitabilityColor = "#eab308"; // Yellow
    }

    // Calculate DWLR Impact (average water level)
    const avgWaterLevel = nearbyStations.reduce((sum, s) => sum + s.currentLevel, 0) / nearbyStations.length;
    const dwlrImpact = parseFloat(avgWaterLevel.toFixed(1));

    let dwlrTrend = "Stable";
    let dwlrColor = "#eab308"; // Yellow for stable
    
    // Determine trend based on average level
    if (avgWaterLevel < 2.5) {
      dwlrTrend = "Strong Recovery";
      dwlrColor = "#22c55e"; // Green
    } else if (avgWaterLevel > 5) {
      dwlrTrend = "Critical Levels";
      dwlrColor = "#F96E5B"; // Red
    } else {
      dwlrTrend = "Moderate Levels";
      dwlrColor = "#eab308"; // Yellow
    }

    // Calculate Water Stress Index (0-100)
    // Higher values = more stress
    const baseStress = (avgWaterLevel / 10) * 100;
    const criticalImpact = (criticalStations / nearbyStations.length) * 40;
    const safeBonus = (safeStations / nearbyStations.length) * -20;
    
    let waterStressIndex = Math.round(baseStress + criticalImpact + safeBonus);
    waterStressIndex = Math.max(0, Math.min(100, waterStressIndex));

    let waterStressLevel = "High Stress";
    let waterStressColor = "#F96E5B"; // Red
    if (waterStressIndex <= 30) {
      waterStressLevel = "Low Stress";
      waterStressColor = "#22c55e"; // Green
    } else if (waterStressIndex <= 60) {
      waterStressLevel = "Moderate Stress";
      waterStressColor = "#eab308"; // Yellow
    }

    // Find ALL critical stations in the nearby area
    const criticalStationsList = nearbyStations.filter(s => s.status === "critical");

    return {
      suitabilityScore,
      suitabilityStatus,
      suitabilityColor,
      dwlrImpact,
      dwlrTrend,
      dwlrColor,
      waterStressIndex,
      waterStressLevel,
      waterStressColor,
      safeCount: safeStations,
      warningCount: warningStations,
      criticalCount: criticalStations,
      totalStations: nearbyStations.length,
      criticalStations: criticalStationsList, // Return ALL critical stations
    };
  };

  const metrics = calculateMetrics();

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF7EA', '#FFE2AF']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#3F9AAE', '#79C9C5']}
            style={styles.headerIcon}
          >
            <MapPin size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Agro-Weather</Text>
            <Text style={styles.headerSubtitle}>PRO ANALYTICS</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifButton}>
            <Bell size={20} color="#64748b" />
          </TouchableOpacity>
          <LinearGradient
            colors={['#3F9AAE', '#79C9C5']}
            style={styles.analyticsButton}
          >
            <ChartBar size={20} color="#fff" />
          </LinearGradient>
        </View>
      </View>

      {/* Location Display */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MapPin size={20} color="#3F9AAE" />
          <Text style={styles.locationText}>Mahim, Mumbai</Text>
        </View>
      </View>

      {/* Filter Pills */}
      {/* Map Container - Moved up by removing filters */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Map Container */}
        <Link href="/full-map" asChild>
          <TouchableOpacity style={styles.mapContainer}>
            <StationMap 
              stations={stations}
              userLocation={userLocation}
              onStationPress={(station) => console.log('Station pressed:', station.name)}
              style={{ flex: 1 }}
            />
          </TouchableOpacity>
        </Link>

        {/* Station Status Summary Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Station Overview</Text>
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonText}>{metrics.totalStations} STATIONS</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.summaryLabel}>Safe</Text>
                <Text style={styles.summaryValue}>{metrics.safeCount}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={[styles.statusDot, { backgroundColor: '#eab308' }]} />
                <Text style={styles.summaryLabel}>Semi-Critical</Text>
                <Text style={styles.summaryValue}>{metrics.warningCount}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={[styles.statusDot, { backgroundColor: '#F96E5B' }]} />
                <Text style={styles.summaryLabel}>Critical</Text>
                <Text style={styles.summaryValue}>{metrics.criticalCount}</Text>
              </View>
            </View>
            <Text style={styles.summaryFooter}>Based on nearest 10 DWLR stations</Text>
          </View>
        </View>

        {/* Groundwater Alerts - Real-time from Simulator */}
        {alerts && alerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Alerts</Text>
              <View style={[styles.seasonBadge, { backgroundColor: 'rgba(249, 110, 91, 0.15)' }]}>
                <Text style={[styles.seasonText, { color: '#F96E5B' }]}>{alerts.length} ACTIVE</Text>
              </View>
            </View>

            <View style={styles.activealertsList}>
              {alerts.map((alert) => (
                <View key={alert.id} style={[
                  styles.activeAlertCard,
                  { borderLeftColor: getAlertColor(alert.severity) }
                ]}>
                  <View style={styles.activeAlertHeader}>
                    <Text style={styles.activeAlertIcon}>{getAlertIcon(alert.alert_type)}</Text>
                    <View style={styles.activeAlertTitleContainer}>
                      <Text style={styles.activeAlertStation}>{alert.wlcode}</Text>
                      <View style={[
                        styles.activeAlertSeverityBadge,
                        { backgroundColor: `${getAlertColor(alert.severity)}20` }
                      ]}>
                        <Text style={[
                          styles.activeAlertSeverityText,
                          { color: getAlertColor(alert.severity) }
                        ]}>
                          {alert.severity}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.activeAlertMessage}>{alert.message}</Text>
                  <View style={styles.activeAlertFooter}>
                    <Text style={styles.activeAlertLevel}>Level: {alert.water_level.toFixed(2)}m</Text>
                    <Text style={styles.activeAlertTime}>
                      {new Date(alert.triggered_at).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Critical Stations Alerts */}
        {metrics.criticalStations && metrics.criticalStations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.alertsContainer}>
              <View style={styles.alertsHeader}>
                <View style={styles.alertsHeaderLeft}>
                  <Text style={styles.alertsHeaderIcon}>⚠️</Text>
                  <View>
                    <Text style={styles.alertsTitle}>CRITICAL STATIONS</Text>
                    <Text style={styles.alertsSubtitle}>
                      {metrics.criticalStations.length} {metrics.criticalStations.length === 1 ? 'station' : 'stations'} require attention
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.alertsList}>
                {metrics.criticalStations.map((station, index) => (
                  <View key={station.id} style={styles.alertItem}>
                    <View style={styles.alertItemHeader}>
                      <View style={styles.alertItemNumber}>
                        <Text style={styles.alertItemNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.alertItemContent}>
                        <Text style={styles.alertItemName} numberOfLines={2}>{station.name}</Text>
                        <View style={styles.alertItemDetails}>
                          <View style={styles.alertItemBadge}>
                            <Text style={styles.alertItemBadgeText}>
                              {station.currentLevel.toFixed(1)}m
                            </Text>
                          </View>
                          <Text style={styles.alertItemStatus}>CRITICAL</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Regional Analysis - Fetched from Supabase */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Regional Analysis</Text>
          </View>

          {regionalData.length > 0 ? (
            <View style={styles.regionalGrid}>
              {regionalData.map((region) => (
                <View key={region.id} style={styles.regionalCard}>
                  <Text style={styles.regionalName}>{region.region_name}</Text>
                  <Text style={styles.regionalValue}>{region.avg_water_level.toFixed(1)}m</Text>
                  <View style={[styles.regionalStatus, { backgroundColor: `${region.statusColor}15` }]}>
                    <Text style={[styles.regionalStatusText, { color: region.statusColor }]}>
                      {region.statusText}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading regional data...</Text>
            </View>
          )}
        </View>

        {/* Water Stress Index */}
        <View style={styles.section}>
          <View style={styles.stressCard}>
            <View style={styles.stressHeader}>
              <Text style={styles.stressTitle}>💧 Water Stress Index</Text>
              <View style={[styles.stressBadge, { backgroundColor: `${metrics.waterStressColor}20` }]}>
                <Text style={[styles.stressBadgeText, { color: metrics.waterStressColor }]}>
                  {metrics.waterStressLevel}
                </Text>
              </View>
            </View>
            
            <View style={styles.stressValueContainer}>
              <Text style={[styles.stressValue, { color: metrics.waterStressColor }]}>
                {metrics.waterStressIndex}
              </Text>
              <Text style={styles.stressMaxValue}>/100</Text>
            </View>

            <View style={styles.stressBar}>
              <View 
                style={[
                  styles.stressProgress, 
                  { 
                    width: `${metrics.waterStressIndex}%`,
                    backgroundColor: metrics.waterStressColor 
                  }
                ]} 
              />
            </View>

            <View style={styles.stressLegend}>
              <View style={styles.stressLegendItem}>
                <View style={[styles.stressLegendDot, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.stressLegendText}>0-30 Low</Text>
              </View>
              <View style={styles.stressLegendItem}>
                <View style={[styles.stressLegendDot, { backgroundColor: '#eab308' }]} />
                <Text style={styles.stressLegendText}>31-60 Moderate</Text>
              </View>
              <View style={styles.stressLegendItem}>
                <View style={[styles.stressLegendDot, { backgroundColor: '#F96E5B' }]} />
                <Text style={styles.stressLegendText}>61-100 High</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}


export default function MapView() {
  return <MapViewContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3F9AAE",
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterContent: {
    gap: 8,
    paddingBottom: 16,
  },
  filterActive: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  filterActiveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  filterPill: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    position: "relative",
    height: 380,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mapCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3F9AAE",
    marginTop: 8,
  },
  mapControls: {
    position: "absolute",
    top: 16,
    right: 16,
    gap: 8,
  },
  zoomControls: {
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
  },
  zoomButton: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  locationButton: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  legend: {
    position: "absolute",
    bottom: 16,
    left: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    width: 176,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  legendTitle: {
    fontSize: 9,
    fontWeight: "900",
    color: "#64748b",
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: "center",
  },
  legendBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: "#FFE2AF",
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  modeSelector: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 80,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    padding: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: "#3F9AAE",
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  modeTabTextActive: {
    color: "#fff",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  seasonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "rgba(249, 110, 91, 0.2)",
    borderRadius: 12,
  },
  seasonText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#F96E5B",
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  statFooterText: {
    fontSize: 11,
    fontWeight: "800",
  },
  cycleCard: {
    position: "relative",
    backgroundColor: "#1F2937",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#374151",
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  cycleGlow1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 160,
    height: 160,
    backgroundColor: "rgba(63, 154, 174, 0.3)",
    borderRadius: 80,
    opacity: 0.6,
  },
  cycleGlow2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 128,
    height: 128,
    backgroundColor: "rgba(249, 110, 91, 0.2)",
    borderRadius: 64,
    opacity: 0.6,
  },
  cycleContent: {
    position: "relative",
    zIndex: 1,
  },
  cycleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cycleLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
  },
  cycleSeries: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cycleMonths: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  cycleMonth: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
  },
  cycleMonthActive: {
    color: "#F96E5B",
    fontSize: 10,
    fontWeight: "900",
  },
  cycleTrack: {
    position: "relative",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  cycleProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "66%",
    borderRadius: 4,
  },
  cycleMarker: {
    position: "absolute",
    left: "66%",
    top: "50%",
    marginTop: -12,
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#F96E5B",
    borderRadius: 12,
    shadowColor: "#F96E5B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  cycleFooter: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 20,
  },
  // Station Summary Card Styles
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1A1A1A",
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#E5E7EB",
  },
  summaryFooter: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },
  // NEW Critical Stations Alert Styles
  alertsContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(249, 110, 91, 0.2)",
    shadowColor: "#F96E5B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  alertsHeader: {
    backgroundColor: "rgba(249, 110, 91, 0.08)",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(249, 110, 91, 0.15)",
  },
  alertsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  alertsHeaderIcon: {
    fontSize: 32,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F96E5B",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  alertsSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  alertsList: {
    padding: 16,
    gap: 12,
  },
  alertItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alertItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  alertItemNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(249, 110, 91, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(249, 110, 91, 0.25)",
  },
  alertItemNumberText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F96E5B",
  },
  alertItemContent: {
    flex: 1,
    gap: 8,
  },
  alertItemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 20,
  },
  alertItemDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertItemBadge: {
    backgroundColor: "rgba(249, 110, 91, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  alertItemBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F96E5B",
  },
  alertItemStatus: {
    fontSize: 11,
    fontWeight: "800",
    color: "#F96E5B",
    letterSpacing: 1,
  },
  // Old alert card styles (keeping for reference, can remove if not needed)
  alertCard: {
    backgroundColor: "rgba(249, 110, 91, 0.1)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: "rgba(249, 110, 91, 0.3)",
    shadowColor: "#F96E5B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  alertIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(249, 110, 91, 0.2)",
    borderRadius: 24,
  },
  alertIconText: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#F96E5B",
    letterSpacing: 1,
    marginBottom: 6,
  },
  alertStationName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  alertDetails: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  // Enhanced Stat Card Styles
  statHeader: {
    marginBottom: 12,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statSubtext: {
    fontSize: 9,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 4,
    fontStyle: "italic",
  },
  // Water Stress Index Styles
  stressCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  stressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  stressTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  stressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stressBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  stressValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  stressValue: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -2,
  },
  stressMaxValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9CA3AF",
    marginLeft: 4,
  },
  stressBar: {
    height: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  stressProgress: {
    height: "100%",
    borderRadius: 6,
  },
  stressLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stressLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stressLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stressLegendText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
  },
  // Regional Analysis Grid Styles
  regionalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  regionalCard: {
    width: "47%", // 2 cards per row with gap
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    minHeight: 160,
    justifyContent: "space-between",
  },
  regionalName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
  },
  regionalValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#3B82F6",
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  regionalStatus: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  regionalStatusText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  // Active Alerts Styles
  activealertsList: {
    gap: 12,
  },
  activeAlertCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activeAlertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  activeAlertIcon: {
    fontSize: 24,
  },
  activeAlertTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeAlertStation: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  activeAlertSeverityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeAlertSeverityText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  activeAlertMessage: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 10,
  },
  activeAlertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeAlertLevel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },
  activeAlertTime: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
});
