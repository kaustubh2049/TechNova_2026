import { fetchGroundwaterAlerts, getAlertColor, getAlertIcon, GroundwaterAlert } from "@/services/alerts-service";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import {
    ArrowLeft,
    Bell,
    ChevronRight,
    MapPin,
    TrendingDown
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AlertsScreenContent() {
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<GroundwaterAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch alerts
  const loadAlerts = async () => {
    const alertsData = await fetchGroundwaterAlerts(50, true);
    setAlerts(alertsData);
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  // Get severity stats
  const highAlerts = alerts.filter(a => a.severity === "HIGH").length;
  const mediumAlerts = alerts.filter(a => a.severity === "MEDIUM").length;
  const lowAlerts = alerts.filter(a => a.severity === "LOW").length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['#F96E5B', '#F87A6A']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Bell size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Early Warning Alerts</Text>
            <Text style={styles.headerSubtitle}>Critical Groundwater Monitoring</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: '#F96E5B' }]}>
          <Text style={styles.statValue}>{highAlerts}</Text>
          <Text style={styles.statLabel}>HIGH</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.statValue}>{mediumAlerts}</Text>
          <Text style={styles.statLabel}>MEDIUM</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#eab308' }]}>
          <Text style={styles.statValue}>{lowAlerts}</Text>
          <Text style={styles.statLabel}>LOW</Text>
        </View>
      </View>

      {/* Alerts List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Bell size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Active Alerts</Text>
            <Text style={styles.emptyText}>
              All groundwater levels are stable. You'll be notified when critical conditions are detected.
            </Text>
          </View>
        ) : (
          <View style={styles.alertsList}>
            <Text style={styles.sectionTitle}>
              {alerts.length} ACTIVE ALERT{alerts.length !== 1 ? 'S' : ''}
            </Text>
            
            {alerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  { borderLeftColor: getAlertColor(alert.severity) }
                ]}
                activeOpacity={0.9}
                onPress={() => {
                  // Navigate to map and focus on this station
                  router.push('/(tabs)/map');
                }}
              >
                <View style={styles.alertHeader}>
                  <Text style={styles.alertIcon}>{getAlertIcon(alert.alert_type)}</Text>
                  <View style={styles.alertHeaderRight}>
                    <View style={styles.alertTitleRow}>
                      <Text style={styles.alertStation}>{alert.wlcode}</Text>
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: `${getAlertColor(alert.severity)}20` }
                      ]}>
                        <Text style={[
                          styles.severityText,
                          { color: getAlertColor(alert.severity) }
                        ]}>
                          {alert.severity}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.alertType}>
                      {alert.alert_type.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.alertMessage}>{alert.message}</Text>

                <View style={styles.alertFooter}>
                  <View style={styles.alertDetail}>
                    <TrendingDown size={14} color="#64748b" />
                    <Text style={styles.alertDetailText}>
                      {alert.water_level.toFixed(2)}m water level
                    </Text>
                  </View>
                  <Text style={styles.alertTime}>
                    {new Date(alert.triggered_at).toLocaleString()}
                  </Text>
                </View>

                <TouchableOpacity style={styles.viewLocationButton}>
                  <MapPin size={14} color="#3F9AAE" />
                  <Text style={styles.viewLocationText}>View on Map</Text>
                  <ChevronRight size={14} color="#3F9AAE" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function AlertsScreen() {
  return <AlertsScreenContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  alertsList: {
    gap: 16,
  },
  alertCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 32,
  },
  alertHeaderRight: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  alertStation: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  alertType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "capitalize",
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 20,
    marginBottom: 16,
  },
  alertFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 12,
  },
  alertDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertDetailText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  alertTime: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  viewLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(63, 154, 174, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  viewLocationText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3F9AAE",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 21,
  },
});
