import { AlertCard } from "@/components/alert-card";
import { StationsProvider, useStations } from "@/providers/stations-provider";
import { Bell, Filter, MapPin, RefreshCw } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AlertsScreenContent() {
  const { alerts, userLocation, nearbyStations } = useStations();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "critical" | "warning" | "info"
  >("all");
  const insets = useSafeAreaInsets();

  const filteredAlerts = alerts.filter(
    (alert) => selectedFilter === "all" || alert.type === selectedFilter
  );

  const filterOptions = [
    { key: "all" as const, label: "All", count: alerts.length },
    {
      key: "critical" as const,
      label: "Critical",
      count: alerts.filter((a) => a.type === "critical").length,
    },
    {
      key: "warning" as const,
      label: "Warning",
      count: alerts.filter((a) => a.type === "warning").length,
    },
    {
      key: "info" as const,
      label: "Info",
      count: alerts.filter((a) => a.type === "info").length,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Location-Based Alerts</Text>
          <View style={styles.locationInfo}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.headerSubtitle}>
              {userLocation
                ? `${filteredAlerts.length} alerts from ${nearbyStations.length} nearby stations`
                : `${filteredAlerts.length} general alerts`}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <RefreshCw size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollView}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedFilter === option.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === option.key &&
                    styles.filterButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
              {option.count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    selectedFilter === option.key && styles.filterBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      selectedFilter === option.key &&
                        styles.filterBadgeTextActive,
                    ]}
                  >
                    {option.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Alerts List */}
      <ScrollView
        style={styles.alertsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#cbd5e1" />
            <Text style={styles.emptyStateTitle}>No alerts in your area</Text>
            <Text style={styles.emptyStateSubtitle}>
              {userLocation
                ? "All nearby groundwater stations are operating normally"
                : "Enable location to see area-specific alerts"}
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

export default function AlertsScreen() {
  return (
    <StationsProvider>
      <AlertsScreenContent />
    </StationsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterScrollView: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterButtonActive: {
    backgroundColor: "#0891b2",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  filterButtonTextActive: {
    color: "white",
  },
  filterBadge: {
    marginLeft: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  filterBadgeTextActive: {
    color: "white",
  },
  alertsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
  },
});
