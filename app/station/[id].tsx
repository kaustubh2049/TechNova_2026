import { MetadataTab } from "@/components/metadata-tab";
import { RechargeTab } from "@/components/recharge-tab";
import { TrendsTab } from "@/components/trends-tab";
import { WaterLevelChart } from "@/components/water-level-chart";
import { useStations } from "@/providers/stations-provider";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function StationDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStationById } = useStations();
  const [selectedTab, setSelectedTab] = useState<
    "trends" | "recharge" | "metadata"
  >("trends");
  const [chartTimeframe, setChartTimeframe] = useState<"6m" | "1y" | "2y">(
    "6m"
  );

  const station = getStationById(id!);

  if (!station) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Station not found</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "#059669";
      case "warning":
        return "#ea580c";
      case "critical":
        return "#dc2626";
      default:
        return "#64748b";
    }
  };

  const tabs = [
    { key: "trends" as const, label: "Trends" },
    { key: "recharge" as const, label: "Recharge" },
    { key: "metadata" as const, label: "Metadata" },
  ];

  const timeframeOptions = [
    { key: "6m" as const, label: "6M" },
    { key: "1y" as const, label: "1Y" },
    { key: "2y" as const, label: "2Y" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.stationLocation}>
            {station.district}, {station.state}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Water Level Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Water Level</Text>
            <View style={styles.timeframeSelector}>
              {timeframeOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.timeframeButton,
                    chartTimeframe === option.key &&
                      styles.timeframeButtonActive,
                  ]}
                  onPress={() => setChartTimeframe(option.key)}
                >
                  <Text
                    style={[
                      styles.timeframeButtonText,
                      chartTimeframe === option.key &&
                        styles.timeframeButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <WaterLevelChart station={station} timeframe={chartTimeframe} />
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Latest Water Level</Text>
            <Text style={styles.metricValue}>
              {station.currentLevel.toFixed(2)}m
            </Text>
            <Text style={styles.metricSubtext}>below ground level</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(station.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {station.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
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
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {selectedTab === "trends" && <TrendsTab station={station} />}
            {selectedTab === "recharge" && <RechargeTab station={station} />}
            {selectedTab === "metadata" && <MetadataTab station={station} />}
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
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  stationLocation: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  statusText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  timeframeSelector: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeframeButtonActive: {
    backgroundColor: "#0891b2",
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  timeframeButtonTextActive: {
    color: "white",
  },
  metricsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0891b2",
    textAlign: "center",
  },
  metricSubtext: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  tabsContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#0891b2",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#0891b2",
    fontWeight: "600",
  },
  tabContent: {
    padding: 20,
  },
});
