import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as Location from "expo-location";
import { FarmerHeader, AiFab } from "@/components/FarmerHeader";
import { Sprout, AlertCircle, CheckCircle2 } from "lucide-react-native";

export default function SoilReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [district, setDistrict] = useState("");
  const [region, setRegion] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soilResult, setSoilResult] = useState<any | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const mapStatusToLevel = (status: string | undefined): "good" | "medium" | "low" => {
    const s = (status || "").toLowerCase();
    if (s === "good" || s === "optimal") return "good";
    if (s === "high") return "medium";
    return "low";
  };

  const useCurrentLocation = async () => {
    try {
      setError(null);
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission is required to use your current location.");
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lon } = loc.coords;
      setLatitude(lat.toFixed(4));
      setLongitude(lon.toFixed(4));

      // Run reverse geocoding in the background; coordinates are already available
      (async () => {
        try {
          const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (geo[0]) {
            const g = geo[0];
            if (!district) setDistrict(g.subregion || g.city || g.district || "");
            if (!region) setRegion(g.region || g.country || "");
          }
        } catch {
          // ignore reverse geocode errors
        }
      })();
    } catch {
      setError("Failed to get current location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  };

  const analyzeSoil = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!latitude || !longitude) {
        setError("Please provide latitude and longitude or use your current location.");
        return;
      }

      const response = await fetch("http://192.168.0.103:5001/soil-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district,
          region,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Soil analysis failed with status ${response.status}`);
      }

      const data = await response.json();
      setSoilResult(data);
    } catch (e: any) {
      setError(e?.message || "Failed to analyze soil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerTitle: "Soil Health", headerBackTitle: "Home" }} />
      <FarmerHeader />
      <AiFab />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Analyze your field soil</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="District (optional)"
              placeholderTextColor="#94a3b8"
              value={district}
              onChangeText={setDistrict}
            />
            <TextInput
              style={styles.input}
              placeholder="Region (optional)"
              placeholderTextColor="#94a3b8"
              value={region}
              onChangeText={setRegion}
            />
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={latitude}
              onChangeText={setLatitude}
            />
            <TextInput
              style={styles.input}
              placeholder="Longitude"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={longitude}
              onChangeText={setLongitude}
            />
          </View>
          <TouchableOpacity
            style={[styles.analyzeButton, { backgroundColor: "#6366f1", marginTop: 4 }]}
            onPress={useCurrentLocation}
            disabled={loading || locationLoading}
          >
            <Text style={styles.analyzeButtonText}>
              {locationLoading ? "Getting location..." : "Use My Location"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={analyzeSoil}
            disabled={loading}
          >
            <Text style={styles.analyzeButtonText}>
              {loading ? "Analyzing soil..." : "Analyze Soil"}
            </Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {soilResult && (
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: "#22c55e", marginTop: 8 }]}
              onPress={() =>
                router.push({
                  pathname: "/farmer/details/soil-health",
                  params: { soilResult: JSON.stringify(soilResult) },
                })
              }
            >
              <Text style={styles.analyzeButtonText}>View Detailed Soil Health</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Overall Score - only show after analysis */}
        {soilResult && (
          <View style={styles.scoreCard}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{soilResult.score}</Text>
              <Text style={styles.scoreTotal}>/100</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>Soil Fertility Score</Text>
              <Text style={styles.scoreSubtitle}>
                {`N: ${soilResult.statuses.N}, P: ${soilResult.statuses.P}, K: ${soilResult.statuses.K}, pH: ${soilResult.statuses.pH}`}
              </Text>
            </View>
          </View>
        )}

        {/* Nutrient Grid */}
        <Text style={styles.sectionTitle}>Nutrient Status</Text>
        <View style={styles.grid}>
          <NutrientCard
            name="Nitrogen (N)"
            value={soilResult ? `${soilResult.N} (${soilResult.statuses.N})` : "Low"}
            status={soilResult ? mapStatusToLevel(soilResult.statuses.N) : "low"}
          />
          <NutrientCard
            name="Phosphorus (P)"
            value={soilResult ? `${soilResult.P} (${soilResult.statuses.P})` : "Good"}
            status={soilResult ? mapStatusToLevel(soilResult.statuses.P) : "good"}
          />
          <NutrientCard
            name="Potassium (K)"
            value={soilResult ? `${soilResult.K} (${soilResult.statuses.K})` : "High"}
            status={soilResult ? mapStatusToLevel(soilResult.statuses.K) : "good"}
          />
          <NutrientCard
            name="pH Level"
            value={soilResult ? `${soilResult.pH} (${soilResult.statuses.pH})` : "6.5"}
            status={soilResult ? mapStatusToLevel(soilResult.statuses.pH) : "good"}
          />
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Fertilizer Schedule</Text>
        <View style={styles.recommendationCard}>
          <View style={styles.recItem}>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>15</Text>
              <Text style={styles.monthText}>OCT</Text>
            </View>
            <View style={styles.recContent}>
              <Text style={styles.recTitle}>Urea Application</Text>
              <Text style={styles.recDesc}>Apply 25kg/acre to boost Nitrogen levels.</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.recItem}>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>01</Text>
              <Text style={styles.monthText}>NOV</Text>
            </View>
            <View style={styles.recContent}>
              <Text style={styles.recTitle}>Compost Mix</Text>
              <Text style={styles.recDesc}>Add organic compost for better soil texture.</Text>
            </View>
          </View>
        </View>

        {soilResult?.crop_recommendations && soilResult.crop_recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Best Crops for Your Soil</Text>
            <View style={styles.cropList}>
              {soilResult.crop_recommendations.slice(0, 3).map((item: any, index: number) => (
                <View key={index} style={styles.cropCard}>
                  <Text style={styles.cropName}>{item.name}</Text>
                  <Text style={styles.cropScore}>{item.score.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function NutrientCard({ name, value, status }: { name: string; value: string; status: "good" | "medium" | "low" }) {
  const colors = {
    good: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    medium: { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
    low: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  };
  const color = colors[status];

  return (
    <View style={[styles.nutrientCard, { borderColor: color.border, backgroundColor: color.bg }]}>
      <Text style={[styles.nutrientName, { color: color.text }]}>{name}</Text>
      <Text style={[styles.nutrientValue, { color: color.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  analyzeButton: {
    marginTop: 8,
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  analyzeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: "#b91c1c",
  },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    elevation: 2,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#0ea5e9",
    marginRight: 20,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0ea5e9",
  },
  scoreTotal: {
    fontSize: 12,
    color: "#64748b",
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  nutrientCard: {
    width: "31%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  nutrientName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  recommendationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  recItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateBox: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 16,
    width: 60,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  monthText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  recDesc: {
    fontSize: 13,
    color: "#64748b",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16,
  },
  cropList: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cropCard: {
    flexBasis: "48%",
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  cropName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 4,
  },
  cropScore: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "500",
  },
});
