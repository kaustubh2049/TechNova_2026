import { AnalyticsCard } from "@/components/analytics-card";
import { TrendChart } from "@/components/trend-chart";
import {
  DatabaseReading,
  StationsProvider,
  useStations,
} from "@/providers/stations-provider";
import { useRouter } from "expo-router";
import {
  BarChart3,
  Download,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AnalyticsScreenContent() {
  const { stations, getAnalytics, getStationReadings } = useStations();
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "6m" | "1y" | "2y"
  >("6m");
  const [averageChartData, setAverageChartData] = useState<
    { x: number; y: number; label: string }[]
  >([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const analytics = getAnalytics();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const timeframeOptions = [
    { key: "6m" as const, label: "6 Months" },
    { key: "1y" as const, label: "1 Year" },
    { key: "2y" as const, label: "2 Years" },
  ];

  // Fetch readings for nearby stations and calculate averages
  useEffect(() => {
    const fetchAverageData = async () => {
      if (analytics.nearbyStations.length === 0) {
        setIsLoadingChart(false);
        return;
      }

      try {
        setIsLoadingChart(true);

        // Fetch readings for all nearby stations
        const allReadingsPromises = analytics.nearbyStations.map((station) =>
          getStationReadings(
            station.latitude,
            station.longitude,
            selectedTimeframe
          )
        );

        const allStationReadings = await Promise.all(allReadingsPromises);

        // Calculate reading counts based on timeframe
        const readingCounts = {
          "6m": 12,
          "1y": 24,
          "2y": 48,
        };
        const maxReadings = readingCounts[selectedTimeframe];

        // Create averaged data points
        const averagedData: { x: number; y: number; label: string }[] = [];

        for (let i = 0; i < maxReadings; i++) {
          const readingsAtIndex: number[] = [];

          // Get water level at index i from each station (if exists)
          allStationReadings.forEach((stationReadings) => {
            if (stationReadings[i] && stationReadings[i].Water_Level) {
              readingsAtIndex.push(stationReadings[i].Water_Level);
            }
          });

          // Calculate average if we have readings
          if (readingsAtIndex.length > 0) {
            const avgLevel =
              readingsAtIndex.reduce((sum, level) => sum + level, 0) /
              readingsAtIndex.length;
            averagedData.push({
              x: i,
              y: avgLevel,
              label: `R${i + 1}`,
            });
          }
        }

        setAverageChartData(averagedData);
      } catch (error) {
        console.error("Error fetching average chart data:", error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchAverageData();
  }, [analytics.nearbyStations, selectedTimeframe, getStationReadings]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>Groundwater insights</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Download size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          {timeframeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.timeframeButton,
                selectedTimeframe === option.key &&
                  styles.timeframeButtonActive,
              ]}
              onPress={() => setSelectedTimeframe(option.key)}
            >
              <Text
                style={[
                  styles.timeframeButtonText,
                  selectedTimeframe === option.key &&
                    styles.timeframeButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <AnalyticsCard
            title="Nearby Stations"
            value={analytics.nearbyStationCount.toString()}
            icon={<MapPin size={20} color="#0891b2" />}
            trend={{ value: analytics.nearbyStationCount, isPositive: true }}
            backgroundColor="#e0f2fe"
          />
          <AnalyticsCard
            title="Avg Water Level"
            value={`${analytics.avgWaterLevel.toFixed(1)}m`}
            icon={<TrendingDown size={20} color="#dc2626" />}
            trend={{ value: 2.3, isPositive: false }}
            backgroundColor="#fef2f2"
          />
          <AnalyticsCard
            title="Recharge Events"
            value={analytics.rechargeEvents.toString()}
            icon={<TrendingUp size={20} color="#059669" />}
            trend={{ value: analytics.rechargeEvents, isPositive: true }}
            backgroundColor="#f0fdf4"
          />
          <AnalyticsCard
            title="Critical Stations"
            value={analytics.criticalStations.toString()}
            icon={<TrendingDown size={20} color="#ea580c" />}
            trend={{ value: analytics.criticalStations, isPositive: false }}
            backgroundColor="#fff7ed"
          />
        </View>

        {/* Trend Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Nearby Stations Trend</Text>
            <Text style={styles.chartSubtitle}>
              Average water level across {analytics.nearbyStationCount} nearest
              stations
            </Text>
          </View>
          {isLoadingChart ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading chart data...</Text>
            </View>
          ) : (
            <TrendChart
              timeframe={selectedTimeframe}
              customData={averageChartData}
              showNearbyStations={true}
            />
          )}
        </View>

        {/* Regional Analysis */}
        <View style={styles.regionalContainer}>
          <Text style={styles.sectionTitle}>Regional Analysis</Text>
          <View style={styles.regionalGrid}>
            {analytics.regionalData.map((region) => (
              <View key={region.state} style={styles.regionalCard}>
                <View style={styles.regionalCardContent}>
                  <Text style={styles.regionalState}>{region.state}</Text>
                  <Text style={styles.regionalValue}>
                    {region.avgLevel.toFixed(1)}m
                  </Text>
                  <View
                    style={[
                      styles.regionalStatus,
                      {
                        backgroundColor:
                          region.status === "critical"
                            ? "#fef2f2"
                            : region.status === "warning"
                            ? "#fff7ed"
                            : "#f0fdf4",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.regionalStatusText,
                        {
                          color:
                            region.status === "critical"
                              ? "#dc2626"
                              : region.status === "warning"
                              ? "#ea580c"
                              : "#059669",
                        },
                      ]}
                    >
                      {region.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function AnalyticsScreen() {
  return (
    <StationsProvider>
      <AnalyticsScreenContent />
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  timeframeContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  timeframeButtonActive: {
    backgroundColor: "#0891b2",
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  timeframeButtonTextActive: {
    color: "white",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: "space-between",
  },
  chartContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  chartSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
  },
  regionalContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  regionalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  regionalCard: {
    width: "48%",
    marginBottom: 16,
  },
  regionalCardContent: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  regionalState: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  regionalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 8,
    textAlign: "center",
  },
  regionalStatus: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  regionalStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
