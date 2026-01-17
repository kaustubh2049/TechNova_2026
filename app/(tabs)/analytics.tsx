import { AnalyticsCard } from "@/components/analytics-card";
import { DemandAvailabilityChart } from "@/components/demand-availability-chart";
import { RainfallCorrelationChart } from "@/components/rainfall-correlation-chart";
import { RateOfChangeChart } from "@/components/rate-of-change-chart";
import { SeasonalBoxPlot } from "@/components/seasonal-box-plot";
import { SeasonalPatternChart } from "@/components/seasonal-pattern-chart";
import { StressIndexChart } from "@/components/stress-index-chart";
import { StressWaterLevelChart } from "@/components/stress-water-level-chart";
import { TrendChart } from "@/components/trend-chart";
import { ZoneClassificationChart } from "@/components/zone-classification-chart";
import { StationsProvider, useStations } from "@/providers/stations-provider";
import {
  aggregateStationReadings,
  calculateDemandAvailability,
  calculateRateOfChange,
  calculateSeasonalPattern,
  calculateStressIndex,
  calculateStressWaterLevel,
  classifyZones,
  DemandAvailabilityData,
  DistrictTrend,
  processDistrictTrends,
  processRainfallCorrelation,
  processSeasonalData,
  RainfallCorrelation,
  RateOfChangeData,
  SeasonalData,
  SeasonalPatternData,
  StressIndexData,
  StressWaterLevelData,
  ZoneData,
} from "@/services/advanced-analytics-service";
import { fetchNearbyStationsWithReadings } from "@/services/station-explorer-service";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Activity,
  Download,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  >("1y");
  const [averageChartData, setAverageChartData] = useState<
    { x: number; y: number; label: string }[]
  >([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  // Advanced analytics state
  const [seasonalData, setSeasonalData] = useState<SeasonalData[]>([]);
  const [rainfallCorrelation, setRainfallCorrelation] = useState<
    RainfallCorrelation[]
  >([]);
  const [rateOfChangeData, setRateOfChangeData] = useState<RateOfChangeData[]>(
    [],
  );
  const [districtTrends, setDistrictTrends] = useState<DistrictTrend[]>([]);

  // New analytics state
  const [demandAvailability, setDemandAvailability] = useState<
    DemandAvailabilityData[]
  >([]);
  const [stressIndex, setStressIndex] = useState<StressIndexData[]>([]);
  const [zoneClassification, setZoneClassification] = useState<ZoneData[]>([]);
  const [seasonalPattern, setSeasonalPattern] = useState<SeasonalPatternData[]>(
    [],
  );
  const [stressWaterLevel, setStressWaterLevel] = useState<
    StressWaterLevelData[]
  >([]);

  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  const analytics = getAnalytics();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const timeframeOptions = [
    { key: "6m" as const, label: "6 Months" },
    { key: "1y" as const, label: "1 Year" },
    { key: "2y" as const, label: "2 Years" },
  ];

  // Fetch advanced analytics data from 15 stations
  useEffect(() => {
    const fetchAdvancedAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);

        // Get user location (use Patna as default)
        const userLat = 25.5941;
        const userLon = 85.1376;

        // Fetch 15 nearest stations with their readings
        const nearbyStations = await fetchNearbyStationsWithReadings(
          userLat,
          userLon,
          15,
          selectedTimeframe,
        );

        if (nearbyStations.length === 0) {
          setIsLoadingAnalytics(false);
          return;
        }

        // Aggregate all station readings
        const allReadings = nearbyStations.map((station) =>
          station.readings.map((r) => ({
            date: r.date,
            waterLevel: r.waterLevel,
          })),
        );

        const aggregatedReadings = aggregateStationReadings(allReadings);

        // Process seasonal data
        const seasonal = processSeasonalData(aggregatedReadings);
        setSeasonalData(seasonal);

        // Process rainfall correlation
        const rainfall = processRainfallCorrelation(aggregatedReadings);
        setRainfallCorrelation(rainfall);

        // Calculate rate of change
        const rateChange = calculateRateOfChange(aggregatedReadings);
        setRateOfChangeData(rateChange);

        // Group stations by district for comparison
        const districtGroups = new Map<string, typeof aggregatedReadings>();
        nearbyStations.forEach((station) => {
          const district = station.district;
          if (!districtGroups.has(district)) {
            districtGroups.set(district, []);
          }
          station.readings.forEach((r) => {
            districtGroups.get(district)!.push({
              date: r.date,
              waterLevel: r.waterLevel,
            });
          });
        });

        // Calculate new analytics
        // 1. Demand vs Availability
        const demandAvail = calculateDemandAvailability(aggregatedReadings);
        setDemandAvailability(demandAvail);

        // 2. Stress Index
        const stress = calculateStressIndex(aggregatedReadings);
        setStressIndex(stress);

        // 3. Zone Classification
        const zones = classifyZones(allReadings);
        setZoneClassification(zones);

        // 4. Seasonal Pattern
        const seasonalPatternData =
          calculateSeasonalPattern(aggregatedReadings);
        setSeasonalPattern(seasonalPatternData);

        // 5. Stress vs Water Level
        const stressLevel = calculateStressWaterLevel(allReadings);
        setStressWaterLevel(stressLevel);

        // Take top 5 districts with most data
        const districtArray = Array.from(districtGroups.entries())
          .map(([district, readings]) => ({ district, readings }))
          .sort((a, b) => b.readings.length - a.readings.length)
          .slice(0, 5);

        const districtComparison = processDistrictTrends(districtArray);
        setDistrictTrends(districtComparison);
      } catch (error) {
        console.error("Error fetching advanced analytics:", error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAdvancedAnalytics();
  }, [selectedTimeframe]);

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
            selectedTimeframe,
          ),
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
    <LinearGradient
      colors={["#FFFFFF", "#FFF7EA", "#FFE2AF"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
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
            icon={
              analytics.waterLevelTrend.isPositive ? (
                <TrendingUp size={20} color="#059669" />
              ) : (
                <TrendingDown size={20} color="#dc2626" />
              )
            }
            trend={analytics.waterLevelTrend}
            backgroundColor={
              analytics.waterLevelTrend.isPositive ? "#f0fdf4" : "#fef2f2"
            }
          />
          <AnalyticsCard
            title="Recharge Events"
            value={analytics.rechargeEvents.toString()}
            icon={
              analytics.rechargeEventsTrend.isPositive ? (
                <TrendingUp size={20} color="#059669" />
              ) : (
                <TrendingDown size={20} color="#dc2626" />
              )
            }
            trend={analytics.rechargeEventsTrend}
            backgroundColor={
              analytics.rechargeEventsTrend.isPositive ? "#f0fdf4" : "#fef2f2"
            }
          />
          <AnalyticsCard
            title="Critical Stations"
            value={analytics.criticalStations.toString()}
            icon={
              analytics.criticalStationsTrend.isPositive ? (
                <TrendingUp size={20} color="#059669" />
              ) : (
                <TrendingDown size={20} color="#dc2626" />
              )
            }
            trend={analytics.criticalStationsTrend}
            backgroundColor={
              analytics.criticalStationsTrend.isPositive ? "#f0fdf4" : "#fef2f2"
            }
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

        {/* Research-Grade Analytics Section */}
        <View style={styles.sectionHeader}>
          <Activity size={24} color="#0891b2" />
          <Text style={styles.sectionHeaderText}>Research-Grade Analysis</Text>
        </View>

        {isLoadingAnalytics ? (
          <View style={styles.loadingAnalyticsContainer}>
            <ActivityIndicator size="large" color="#0891b2" />
            <Text style={styles.loadingAnalyticsText}>
              Processing data from 15 monitoring stations...
            </Text>
          </View>
        ) : (
          <>
            {/* Demand vs Availability */}
            <View style={styles.advancedChartWrapper}>
              <DemandAvailabilityChart data={demandAvailability} />
            </View>

            {/* Stress Index Trend */}
            <View style={styles.advancedChartWrapper}>
              <StressIndexChart data={stressIndex} />
            </View>

            {/* Zone Classification */}
            <View style={styles.advancedChartWrapper}>
              <ZoneClassificationChart data={zoneClassification} />
            </View>

            {/* Seasonal Water Pattern */}
            <View style={styles.advancedChartWrapper}>
              <SeasonalPatternChart data={seasonalPattern} />
            </View>

            {/* Stress vs Water Level */}
            <View style={styles.advancedChartWrapper}>
              <StressWaterLevelChart data={stressWaterLevel} />
            </View>

            {/* Seasonal Variability */}
            <View style={styles.advancedChartWrapper}>
              <SeasonalBoxPlot data={seasonalData} />
            </View>

            {/* Rate of Change Analysis */}
            <View style={styles.advancedChartWrapper}>
              <RateOfChangeChart data={rateOfChangeData} />
            </View>

            {/* Rainfall-Groundwater Correlation */}
            <View style={styles.advancedChartWrapper}>
              <RainfallCorrelationChart data={rainfallCorrelation} />
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#e0f2fe",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0891b2",
    marginLeft: 12,
  },
  advancedChartWrapper: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  loadingAnalyticsContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingAnalyticsText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 12,
    textAlign: "center",
  },
});
