import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FarmerHeader, AiFab } from "@/components/FarmerHeader";
import { CloudRain, Calendar, Clock, Droplets } from "lucide-react-native";

export default function IrrigationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: "Irrigation Plan", headerBackTitle: "Home" }} />
      <FarmerHeader />
      <AiFab />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Main Action Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Calendar size={32} color="#fff" />
          </View>
          <Text style={styles.mainTitle}>Next Irrigation</Text>
          <Text style={styles.mainDate}>In 6 Days</Text>
          <Text style={styles.mainSubtitle}>Scheduled for Oct 24, 2024</Text>
        </View>

        {/* Details Grid */}
        <View style={styles.grid}>
          <View style={styles.detailCard}>
            <Droplets size={24} color="#0ea5e9" />
            <Text style={styles.detailLabel}>Water Quantity</Text>
            <Text style={styles.detailValue}>12,000 L</Text>
            <Text style={styles.detailSub}>per acre</Text>
          </View>
          <View style={styles.detailCard}>
            <Clock size={24} color="#0ea5e9" />
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>4 Hours</Text>
            <Text style={styles.detailSub}>Drip System</Text>
          </View>
        </View>

        {/* Tips Section */}
        <Text style={styles.sectionTitle}>Water Saving Tips</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💧 Irrigate in the early morning or late evening to reduce evaporation loss.
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            🌾 Use mulch around plants to retain soil moisture for longer periods.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
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
  mainCard: {
    backgroundColor: "#0ea5e9",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  mainTitle: {
    color: "#e0f2fe",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  mainDate: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  mainSubtitle: {
    color: "#bae6fd",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  detailCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 2,
  },
  detailLabel: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "bold",
  },
  detailSub: {
    color: "#94a3b8",
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  tipText: {
    color: "#0c4a6e",
    fontSize: 14,
    lineHeight: 20,
  },
});
