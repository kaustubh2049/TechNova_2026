import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FarmerHeader, AiFab } from "@/components/FarmerHeader";
import { Landmark, TrendingUp, ExternalLink } from "lucide-react-native";

export default function SchemesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: "Schemes & Market", headerBackTitle: "Home" }} />
      <FarmerHeader />
      <AiFab />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Market Prices */}
        <Text style={styles.sectionTitle}>Live Mandi Prices</Text>
        <View style={styles.marketCard}>
          <View style={styles.marketHeader}>
            <TrendingUp size={20} color="#16a34a" />
            <Text style={styles.marketTitle}>Pune APMC</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.cropName}>Soybean</Text>
            <Text style={styles.priceValue}>₹5,400/q</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.cropName}>Onion</Text>
            <Text style={styles.priceValue}>₹2,200/q</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.cropName}>Wheat</Text>
            <Text style={styles.priceValue}>₹2,800/q</Text>
          </View>
        </View>

        {/* Govt Schemes */}
        <Text style={styles.sectionTitle}>Government Schemes</Text>
        
        <SchemeCard
          title="PM-KUSUM Yojana"
          desc="Subsidies for solar pumps and renewable energy plants on farm land."
          tag="Solar Pump"
        />
        <SchemeCard
          title="Pradhan Mantri Fasal Bima Yojana"
          desc="Crop insurance scheme to provide financial support to farmers suffering crop loss."
          tag="Insurance"
        />
        <SchemeCard
          title="Soil Health Card Scheme"
          desc="Get soil nutrient status and fertilizer recommendations."
          tag="Soil Health"
        />

      </ScrollView>
    </SafeAreaView>
  );
}

function SchemeCard({ title, desc, tag }: { title: string; desc: string; tag: string }) {
  return (
    <TouchableOpacity style={styles.schemeCard} activeOpacity={0.8}>
      <View style={styles.schemeHeader}>
        <View style={styles.iconBox}>
          <Landmark size={20} color="#d97706" />
        </View>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      </View>
      <Text style={styles.schemeTitle}>{title}</Text>
      <Text style={styles.schemeDesc}>{desc}</Text>
      <View style={styles.linkRow}>
        <Text style={styles.linkText}>View Details</Text>
        <ExternalLink size={14} color="#0ea5e9" />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    marginTop: 8,
  },
  marketCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 24,
  },
  marketHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  marketTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  cropName: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16a34a",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 8,
  },
  schemeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginBottom: 16,
  },
  schemeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fffbeb",
    justifyContent: "center",
    alignItems: "center",
  },
  tagBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center",
  },
  tagText: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  schemeDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 16,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0ea5e9",
  },
});
