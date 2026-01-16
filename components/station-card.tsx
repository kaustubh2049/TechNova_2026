import { Station } from "@/providers/stations-provider";
import { MapPin, TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StationCardProps {
  station: Station & { distance?: number };
  onPress: () => void;
}

export function StationCard({ station, onPress }: StationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "#059669";
      case "warning": return "#ea580c";
      case "critical": return "#dc2626";
      default: return "#64748b";
    }
  };

  const getTrendIcon = () => {
    const recentReadings = station.recentReadings.slice(-2);
    if (recentReadings.length < 2) return null;
    
    const trend = recentReadings[1].level - recentReadings[0].level;
    return trend > 0 ? (
      <TrendingUp size={16} color="#059669" />
    ) : (
      <TrendingDown size={16} color="#dc2626" />
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{station.name}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.stationLocation}>{station.district}, {station.state}</Text>
            {station.distance !== undefined && (
              <View style={styles.distanceContainer}>
                <MapPin size={10} color="#64748b" />
                <Text style={styles.distanceText}>
                  {station.distance < 1 
                    ? `${(station.distance * 1000).toFixed(0)}m` 
                    : `${station.distance.toFixed(1)}km`}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(station.status) }]}>
          <Text style={styles.statusText}>{station.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Water Level</Text>
          <View style={styles.metricValue}>
            <Text style={styles.metricNumber}>{station.currentLevel.toFixed(1)}m</Text>
            {getTrendIcon()}
          </View>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Availability</Text>
          <Text style={[styles.metricNumber, { color: getStatusColor(station.status) }]}>
            {(station.availabilityIndex * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          Updated {new Date(station.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  stationLocation: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 10,
    color: "#64748b",
    marginLeft: 2,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  metricValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0891b2",
    marginRight: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  lastUpdated: {
    fontSize: 10,
    color: "#94a3b8",
  },
});