import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FarmerHeader, AiFab } from "@/components/FarmerHeader";

export default function WeatherSimple() {
  return (
    <SafeAreaView style={styles.container}>
      <FarmerHeader />
      <AiFab />
      <View style={styles.content}>
        <Text style={styles.title}>Weather</Text>
        <Text style={styles.subtitle}>Weather screen is working!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
  },
});
