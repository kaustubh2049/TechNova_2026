import { Station } from "@/providers/stations-provider";
import { Calendar, Database, MapPin, Ruler } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MetadataTabProps {
  station: Station;
}

export function MetadataTab({ station }: MetadataTabProps) {
  const MetadataItem = ({ 
    icon, 
    label, 
    value 
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <View style={styles.metadataItem}>
      <View style={styles.metadataIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.metadataText}>
        <Text style={styles.metadataLabel}>{label}</Text>
        <Text style={styles.metadataValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Station Information</Text>
        <View style={styles.metadataGrid}>
          <MetadataItem
            icon={<MapPin size={20} color="#0891b2" />}
            label="Location"
            value={`${station.district}, ${station.state}`}
          />
          <MetadataItem
            icon={<Calendar size={20} color="#0891b2" />}
            label="Installation Date"
            value={new Date(station.installationDate).toLocaleDateString()}
          />
          <MetadataItem
            icon={<Ruler size={20} color="#0891b2" />}
            label="Total Depth"
            value={`${station.depth.toFixed(1)} m`}
          />
          <MetadataItem
            icon={<Database size={20} color="#0891b2" />}
            label="Station ID"
            value={station.id}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aquifer Properties</Text>
        <View style={styles.metadataGrid}>
          <MetadataItem
            icon={<Database size={20} color="#059669" />}
            label="Aquifer Type"
            value={station.aquiferType}
          />
          <MetadataItem
            icon={<Ruler size={20} color="#059669" />}
            label="Specific Yield (Sy)"
            value={station.specificYield.toString()}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coordinates</Text>
        <View style={styles.coordinatesCard}>
          <View style={styles.coordinateItem}>
            <Text style={styles.coordinateLabel}>Latitude</Text>
            <Text style={styles.coordinateValue}>{station.latitude.toFixed(6)}°</Text>
          </View>
          <View style={styles.coordinateItem}>
            <Text style={styles.coordinateLabel}>Longitude</Text>
            <Text style={styles.coordinateValue}>{station.longitude.toFixed(6)}°</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technical Specifications</Text>
        <View style={styles.specsCard}>
          <Text style={styles.specsText}>
            This DWLR (Data Water Level Recorder) station is equipped with pressure transducer sensors 
            for continuous water level monitoring. Data is transmitted via GSM/GPRS network to the 
            central monitoring system.
          </Text>
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Measurement Range</Text>
              <Text style={styles.specValue}>0-50 m</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Accuracy</Text>
              <Text style={styles.specValue}>±0.1%</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Resolution</Text>
              <Text style={styles.specValue}>1 mm</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Data Interval</Text>
              <Text style={styles.specValue}>1 hour</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  metadataGrid: {
    gap: 12,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metadataIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metadataText: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  coordinatesCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  coordinateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  coordinateLabel: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    fontFamily: "monospace",
  },
  specsCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  specsText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  specLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  specValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0891b2",
  },
});