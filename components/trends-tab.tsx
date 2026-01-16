import {
  DatabaseReading,
  Station,
  useStations,
} from "@/providers/stations-provider";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface TrendsTabProps {
  station: Station;
}

export function TrendsTab({ station }: TrendsTabProps) {
  const { getStationReadings } = useStations();
  const [readings6m, setReadings6m] = useState<DatabaseReading[]>([]);
  const [readings1y, setReadings1y] = useState<DatabaseReading[]>([]);
  const [readings2y, setReadings2y] = useState<DatabaseReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch readings for all timeframes
  useEffect(() => {
    const fetchAllReadings = async () => {
      try {
        setIsLoading(true);
        const [data6m, data1y, data2y] = await Promise.all([
          getStationReadings(station.latitude, station.longitude, "6m"),
          getStationReadings(station.latitude, station.longitude, "1y"),
          getStationReadings(station.latitude, station.longitude, "2y"),
        ]);

        setReadings6m(data6m);
        setReadings1y(data1y);
        setReadings2y(data2y);
      } catch (error) {
        console.error("Error fetching trend data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllReadings();
  }, [station.latitude, station.longitude, getStationReadings]);

  const calculateTrendFromReadings = (readings: DatabaseReading[]) => {
    if (readings.length < 2) {
      return {
        value: 0,
        direction: "stable" as const,
        description: "Insufficient data",
      };
    }

    // Sort by P_no (ascending = latest to oldest)
    const sortedReadings = [...readings].sort((a, b) => a.P_no - b.P_no);
    const latest = sortedReadings[0]; // Lowest P_no = latest
    const oldest = sortedReadings[sortedReadings.length - 1]; // Highest P_no = oldest

    const change = latest.Water_Level - oldest.Water_Level;
    const threshold = 0.1; // 10cm threshold for stability

    let direction: "rising" | "falling" | "stable";
    let description: string;

    if (change > threshold) {
      direction = "rising";
      description = `Water level increased by ${change.toFixed(2)}m`;
    } else if (change < -threshold) {
      direction = "falling";
      description = `Water level decreased by ${Math.abs(change).toFixed(2)}m`;
    } else {
      direction = "stable";
      description = "Water level remains stable";
    }

    return {
      value: Math.abs(change),
      direction,
      description,
    };
  };

  const calculateStatistics = (readings: DatabaseReading[]) => {
    if (readings.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        variability: 0,
      };
    }

    const levels = readings.map((r) => r.Water_Level);
    const min = Math.min(...levels);
    const max = Math.max(...levels);
    const average =
      levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const variability = max - min;

    return { min, max, average, variability };
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading trend analysis...</Text>
      </View>
    );
  }

  const trend6m = calculateTrendFromReadings(readings6m);
  const trend1y = calculateTrendFromReadings(readings1y);
  const trend2y = calculateTrendFromReadings(readings2y);
  const stats6m = calculateStatistics(readings6m);
  const stats1y = calculateStatistics(readings1y);
  const stats2y = calculateStatistics(readings2y);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "rising":
        return <TrendingUp size={16} color="#059669" />;
      case "falling":
        return <TrendingDown size={16} color="#dc2626" />;
      default:
        return null;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "rising":
        return "#059669";
      case "falling":
        return "#dc2626";
      default:
        return "#64748b";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.trendCard}>
        <Text style={styles.cardTitle}>6-Month Trend</Text>
        <View style={styles.trendRow}>
          {getTrendIcon(trend6m.direction)}
          <Text
            style={[
              styles.trendValue,
              { color: getTrendColor(trend6m.direction) },
            ]}
          >
            {trend6m.direction === "stable"
              ? "Stable"
              : `${trend6m.value.toFixed(2)}m ${trend6m.direction}`}
          </Text>
        </View>
        <Text style={styles.trendDescription}>{trend6m.description}</Text>
        <Text style={styles.dataCount}>
          Based on {readings6m.length} readings
        </Text>
      </View>

      <View style={styles.trendCard}>
        <Text style={styles.cardTitle}>1-Year Trend</Text>
        <View style={styles.trendRow}>
          {getTrendIcon(trend1y.direction)}
          <Text
            style={[
              styles.trendValue,
              { color: getTrendColor(trend1y.direction) },
            ]}
          >
            {trend1y.direction === "stable"
              ? "Stable"
              : `${trend1y.value.toFixed(2)}m ${trend1y.direction}`}
          </Text>
        </View>
        <Text style={styles.trendDescription}>{trend1y.description}</Text>
        <Text style={styles.dataCount}>
          Based on {readings1y.length} readings
        </Text>
      </View>

      <View style={styles.trendCard}>
        <Text style={styles.cardTitle}>2-Year Trend</Text>
        <View style={styles.trendRow}>
          {getTrendIcon(trend2y.direction)}
          <Text
            style={[
              styles.trendValue,
              { color: getTrendColor(trend2y.direction) },
            ]}
          >
            {trend2y.direction === "stable"
              ? "Stable"
              : `${trend2y.value.toFixed(2)}m ${trend2y.direction}`}
          </Text>
        </View>
        <Text style={styles.trendDescription}>{trend2y.description}</Text>
        <Text style={styles.dataCount}>
          Based on {readings2y.length} readings
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min Level (6m)</Text>
          <Text style={styles.statValue}>
            {stats6m.min > 0 ? stats6m.min.toFixed(2) : "-"}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max Level (6m)</Text>
          <Text style={styles.statValue}>
            {stats6m.max > 0 ? stats6m.max.toFixed(2) : "-"}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average Level (6m)</Text>
          <Text style={styles.statValue}>
            {stats6m.average > 0 ? stats6m.average.toFixed(2) : "-"}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Variability (6m)</Text>
          <Text style={styles.statValue}>
            {stats6m.variability > 0 ? stats6m.variability.toFixed(2) : "-"}m
          </Text>
        </View>
      </View>

      {/* 1-Year Statistics */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min Level (1y)</Text>
          <Text style={styles.statValue}>
            {stats1y.min > 0 ? stats1y.min.toFixed(2) : "-"}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max Level (1y)</Text>
          <Text style={styles.statValue}>
            {stats1y.max > 0 ? stats1y.max.toFixed(2) : "-"}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average Level (1y)</Text>
          <Text style={styles.statValue}>
            {stats1y.average > 0 ? stats1y.average.toFixed(2) : "-"}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Variability (1y)</Text>
          <Text style={styles.statValue}>
            {stats1y.variability > 0 ? stats1y.variability.toFixed(2) : "-"}m
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    padding: 20,
  },
  dataCount: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    fontStyle: "italic",
  },
  trendCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  trendValue: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  trendDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0891b2",
  },
});
