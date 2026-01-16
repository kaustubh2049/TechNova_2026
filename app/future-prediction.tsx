import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function FuturePredictionScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Future Prediction</Text>
        <Text style={styles.subtitle}>Model overview and assumptions</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Model</Text>
        <Text style={styles.paragraph}>
          We estimate near-term groundwater trends using a k-nearest stations interpolation at the
          user's location combined with an ARIMA-like smoothing of recent daily readings. The model
          outputs a 7-day forecast for average level and flags potential critical events.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Inputs</Text>
        <Text style={styles.bullet}>- Recent station readings (latest from `recent_data`).</Text>
        <Text style={styles.bullet}>- Station coordinates and distances to target location.</Text>
        <Text style={styles.bullet}>- Seasonal priors derived from historical weekly means.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Assumptions</Text>
        <Text style={styles.bullet}>- Station sensors are calibrated and within normal error bounds.</Text>
        <Text style={styles.bullet}>- Short-term dynamics are locally smooth over 50 km radius.</Text>
        <Text style={styles.bullet}>- Missing days are forward-filled up to 2 days.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Limitations</Text>
        <Text style={styles.bullet}>- No rainfall or pumping covariates yet.</Text>
        <Text style={styles.bullet}>- Forecast horizon limited to 7 days for reliability.</Text>
        <Text style={styles.bullet}>- Historical backfill pending for certain districts.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Steps</Text>
        <Text style={styles.bullet}>- Incorporate IMD rainfall and soil data.</Text>
        <Text style={styles.bullet}>- Add uncertainty bands and MAPE on validation sets.</Text>
        <Text style={styles.bullet}>- Train district-specific seasonal components.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  bullet: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 4,
  },
});


