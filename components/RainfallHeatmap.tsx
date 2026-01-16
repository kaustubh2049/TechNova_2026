import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  fetchRainfallHeatmapData,
  ProcessedRainfallData,
  getRainfallLegend,
  getRainfallStats,
} from "@/services/rainfall-heatmap-service";
import { Info, MapPin, CloudRain } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

interface RainfallHeatmapProps {
  userLocation?: { latitude: number; longitude: number } | null;
}

export function RainfallHeatmap({ userLocation }: RainfallHeatmapProps) {
  const [rainfallData, setRainfallData] = useState<ProcessedRainfallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] =
    useState<ProcessedRainfallData | null>(null);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    loadRainfallData();
  }, []);

  const loadRainfallData = async () => {
    try {
      setLoading(true);
      const data = await fetchRainfallHeatmapData();
      setRainfallData(data);
    } catch (error) {
      console.error("Failed to load rainfall data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = getRainfallStats(rainfallData);
  const legendData = getRainfallLegend();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading rainfall data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Statistics Header */}
      <View style={styles.statsHeader}>
        <TouchableOpacity
          style={styles.statsToggle}
          onPress={() => setShowStats(!showStats)}
        >
          <Info size={20} color="#007AFF" />
          <Text style={styles.statsTitle}>Rainfall Statistics</Text>
        </TouchableOpacity>
      </View>

      {showStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Districts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.average}mm</Text>
              <Text style={styles.statLabel}>Avg Rainfall</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.highRainfallDistricts}
              </Text>
              <Text style={styles.statLabel}>High Rainfall Areas</Text>
            </View>
          </View>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Rainfall Scale</Text>
        <View style={styles.legendItems}>
          {legendData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Rainfall Data List */}
      <ScrollView
        style={styles.dataContainer}
        showsVerticalScrollIndicator={false}
      >
        {rainfallData.map((district, index) => (
          <TouchableOpacity
            key={`${district.sr}-${index}`}
            style={[
              styles.districtCard,
              selectedDistrict?.district === district.district &&
                styles.selectedCard,
            ]}
            onPress={() =>
              setSelectedDistrict(
                selectedDistrict?.district === district.district
                  ? null
                  : district
              )
            }
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.rainfallIndicator,
                  { backgroundColor: district.color },
                ]}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.districtName}>{district.district}</Text>
                <Text style={styles.stateName}>{district.state}</Text>
              </View>
              <View style={styles.rainfallValue}>
                <CloudRain size={20} color="#007AFF" />
                <Text style={styles.rainfallText}>
                  {district.period_actual_mm}mm
                </Text>
              </View>
            </View>

            {selectedDistrict?.district === district.district && (
              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {district.latitude.toFixed(4)},{" "}
                    {district.longitude.toFixed(4)}
                  </Text>
                </View>
                <Text style={styles.categoryText}>
                  Category: {district.category}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748b",
  },
  statsHeader: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  statsToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  statsContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  legendContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginTop: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  dataContainer: {
    flex: 1,
    padding: 15,
  },
  districtCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  rainfallIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  districtName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  stateName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  rainfallValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  rainfallText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 5,
  },
  cardDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
