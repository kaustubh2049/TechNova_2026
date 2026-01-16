import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlertTriangle,
  Droplets,
  CloudRain,
  Volume2,
  Bell,
} from "lucide-react-native";
import { PageHeader } from "@/components/ui/PageHeader";
import { FarmerHeader, AiFab } from "@/components/FarmerHeader";
import { Card } from "@/components/ui/Card";
import { useStations } from "@/providers/stations-provider";

export default function AlertsScreen() {
  const { alerts, userLocation, nearbyStations } = useStations();

  return (
    <SafeAreaView style={styles.container}>
      <FarmerHeader />
      <AiFab />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PageHeader
          title="Alerts & Notifications"
          subtitle={`${alerts.length} alerts from ${nearbyStations.length} nearby stations`}
          rightElement={
            <TouchableOpacity style={styles.voiceButton}>
              <Volume2 size={20} color="#0ea5e9" />
              <Text style={styles.voiceText}>Read Aloud</Text>
            </TouchableOpacity>
          }
        />

        {alerts.length === 0 ? (
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
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              type={
                alert.type === "critical"
                  ? "danger"
                  : alert.type === "warning"
                  ? "warning"
                  : "info"
              }
              title={alert.title}
              desc={alert.description}
              time={new Date(alert.timestamp).toLocaleString()}
              icon={
                alert.type === "critical"
                  ? AlertTriangle
                  : alert.type === "warning"
                  ? Droplets
                  : CloudRain
              }
            />
          ))
        )}

        {/* Keep one static example for demo if no dynamic alerts */}
        {alerts.length === 0 && (
          <>
            <AlertCard
              type="info"
              title="System Ready"
              desc="Your groundwater monitoring system is active and ready to provide alerts."
              time="Now"
              icon={Droplets}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AlertCard({ type, title, desc, time, icon: Icon }: any) {
  const colors = {
    warning: {
      bg: "#fffbeb",
      border: "#fcd34d",
      icon: "#d97706",
      text: "#92400e",
    },
    danger: {
      bg: "#fef2f2",
      border: "#fca5a5",
      icon: "#dc2626",
      text: "#991b1b",
    },
    info: {
      bg: "#eff6ff",
      border: "#93c5fd",
      icon: "#2563eb",
      text: "#1e40af",
    },
  };
  const color = colors[type as keyof typeof colors];

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: color.bg, borderColor: color.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: color.bg }]}>
          <Icon size={24} color={color.icon} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.cardTitle, { color: color.text }]}>{title}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>
      <Text style={[styles.cardDesc, { color: color.text }]}>{desc}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 20,
  },

  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  voiceText: {
    color: "#0ea5e9",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
