import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FarmerHeader, AiFab } from "@/components/FarmerHeader";
import { Droplets, IndianRupee, ChevronRight } from "lucide-react-native";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function CropRecommendationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: "Crop Advisor", headerBackTitle: "Home" }} />
      <FarmerHeader />
      <AiFab />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PageHeader
          title="Recommended Crops"
          subtitle="Based on your soil & water availability"
        />

        {/* Crop Cards */}
        <CropCard
          name="Soybean"
          match="98% Match"
          water="Low Water"
          income="₹48,000/acre"
          color="#16a34a"
        />
        <CropCard
          name="Cotton"
          match="85% Match"
          water="Medium Water"
          income="₹62,000/acre"
          color="#ea580c"
        />
        <CropCard
          name="Wheat"
          match="70% Match"
          water="High Water"
          income="₹35,000/acre"
          color="#ca8a04"
        />

      </ScrollView>
    </SafeAreaView>
  );
}

function CropCard({ name, match, water, income, color }: { name: string; match: string; water: string; income: string; color: string }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={[styles.colorStrip, { backgroundColor: color }]} />
      <Card style={[styles.cardContent, { padding: 16, borderWidth: 0, elevation: 0, shadowOpacity: 0 }]}> 
        <View style={styles.cardHeader}>
          <Text style={styles.cropName}>{name}</Text>
          <View style={[styles.matchBadge, { backgroundColor: color + "20" }]}> 
            <Text style={[styles.matchText, { color: color }]}>{match}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Droplets size={16} color="#64748b" />
            <Text style={styles.statText}>{water}</Text>
          </View>
          <View style={styles.statItem}>
            <IndianRupee size={16} color="#64748b" />
            <Text style={styles.statText}>{income}</Text>
          </View>
        </View>
      </Card>
      <View style={styles.arrowContainer}>
        <ChevronRight size={20} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  colorStrip: {
    width: 6,
    height: "100%",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  arrowContainer: {
    justifyContent: "center",
    paddingRight: 16,
  },
});
