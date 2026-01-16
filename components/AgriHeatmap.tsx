import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Droplets, Mountain, Sprout, Map, Info } from "lucide-react-native";
import {
  INDIA_AGRI_DATA,
  AgriCityData,
  getAgriRainfallColor,
  getSoilTypeColor,
  getAltitudeColor,
  getCropSuitabilityColor,
  getAgriInsights,
  getAgriLegendData,
} from "@/services/agri-heatmap-service";
import { IndiaMapSVG } from "./IndiaMapSVG";

const { width, height } = Dimensions.get("window");

interface AgriHeatmapProps {
  onCityPress?: (city: AgriCityData) => void;
}

type HeatmapParameter = "rainfall" | "soil" | "altitude" | "suitability";

export function AgriHeatmap({ onCityPress }: AgriHeatmapProps) {
  const [selectedParameter, setSelectedParameter] =
    useState<HeatmapParameter>("rainfall");
  const [selectedCity, setSelectedCity] = useState<AgriCityData | null>(null);

  const getColorForParameter = (city: AgriCityData): string => {
    switch (selectedParameter) {
      case "rainfall":
        return getAgriRainfallColor(city.rainfall);
      case "soil":
        return getSoilTypeColor(city.soilType);
      case "altitude":
        return getAltitudeColor(city.altitude);
      case "suitability":
        return getCropSuitabilityColor(
          city.rainfall,
          city.avgTemp,
          city.soilType
        );
      default:
        return "#6b7280";
    }
  };

  const getParameterValue = (city: AgriCityData): string => {
    switch (selectedParameter) {
      case "rainfall":
        return `${city.rainfall}mm`;
      case "soil":
        return city.soilType;
      case "altitude":
        return `${city.altitude}m`;
      case "suitability":
        return "Mixed Crops";
      default:
        return "";
    }
  };

  const handleCityPress = (city: AgriCityData) => {
    setSelectedCity(city);
    onCityPress?.(city);
  };

  const parameterButtons = [
    {
      key: "rainfall" as const,
      label: "Rainfall",
      icon: Droplets,
      color: "#3b82f6",
    },
    {
      key: "soil" as const,
      label: "Soil Type",
      icon: Sprout,
      color: "#16a34a",
    },
    {
      key: "altitude" as const,
      label: "Altitude",
      icon: Mountain,
      color: "#7c3aed",
    },
    {
      key: "suitability" as const,
      label: "Crop Suitability",
      icon: Map,
      color: "#f59e0b",
    },
  ];

  const legendData = getAgriLegendData(selectedParameter);

  return (
    <View style={styles.container}>
      {/* Parameter Selection */}
      <View style={styles.parameterSelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.parameterScroll}
        >
          {parameterButtons.map((param) => (
            <TouchableOpacity
              key={param.key}
              style={[
                styles.parameterButton,
                selectedParameter === param.key && {
                  backgroundColor: param.color,
                  shadowColor: param.color,
                  shadowOpacity: 0.3,
                },
              ]}
              onPress={() => setSelectedParameter(param.key)}
              activeOpacity={0.8}
            >
              <param.icon
                size={18}
                color={selectedParameter === param.key ? "#fff" : param.color}
              />
              <Text
                style={[
                  styles.parameterText,
                  selectedParameter === param.key && styles.parameterTextActive,
                ]}
              >
                {param.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {/* India Map Outline with Background Image */}
        <View style={styles.mapOutline}>
          {/* Map Background with Grid Pattern for India outline */}
          <View style={styles.indiaMapBackground}>
            {/* Create a simplified India shape using CSS-like styling */}
            <View style={styles.indiaShape} />
            <View style={styles.gujaratPeninsula} />
            <View style={styles.southernTip} />
          </View>

          {/* Render cities as colored dots */}
          {INDIA_AGRI_DATA.map((city, index) => {
            // Convert percentage strings to actual pixel values
            const mapWidth = width - 32; // Account for container padding
            const mapHeight = 300;
            const leftPercent = parseFloat(city.x.replace("%", ""));
            const topPercent = parseFloat(city.y.replace("%", ""));
            const leftPixels = (leftPercent / 100) * mapWidth;
            const topPixels = (topPercent / 100) * mapHeight;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cityDot,
                  {
                    left: leftPixels,
                    top: topPixels,
                    backgroundColor: getColorForParameter(city),
                    transform:
                      selectedCity?.city === city.city
                        ? [{ scale: 1.5 }]
                        : [{ scale: 1 }],
                  },
                ]}
                onPress={() => handleCityPress(city)}
                activeOpacity={0.7}
              />
            );
          })}
        </View>

        {/* Legend */}
        {legendData.length > 0 && (
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Legend</Text>
            <ScrollView style={styles.legendScroll}>
              {legendData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Selected City Info */}
      {selectedCity && (
        <View style={styles.cityInfo}>
          <View style={styles.cityInfoHeader}>
            <View>
              <Text style={styles.cityName}>{selectedCity.city}</Text>
              <Text style={styles.stateName}>{selectedCity.state}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedCity(null)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cityDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rainfall:</Text>
              <Text style={styles.detailValue}>
                {selectedCity.rainfall}mm/year
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Soil Type:</Text>
              <Text style={styles.detailValue}>{selectedCity.soilType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Avg Temp:</Text>
              <Text style={styles.detailValue}>{selectedCity.avgTemp}°C</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Altitude:</Text>
              <Text style={styles.detailValue}>{selectedCity.altitude}m</Text>
            </View>
          </View>

          {/* Agricultural Insights */}
          <View style={styles.insights}>
            <Text style={styles.insightsTitle}>
              <Info size={14} color="#0ea5e9" /> Agricultural Insights
            </Text>
            {getAgriInsights(selectedCity).map((insight, index) => (
              <Text key={index} style={styles.insightText}>
                {insight}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  parameterSelector: {
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  parameterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  parameterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  parameterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  parameterTextActive: {
    color: "#fff",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapOutline: {
    flex: 1,
    position: "relative",
    backgroundColor: "#f8fafc",
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  cityDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  legend: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    maxWidth: 180,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  legendScroll: {
    maxHeight: 120,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  legendLabel: {
    fontSize: 10,
    color: "#475569",
    flex: 1,
  },
  cityInfo: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cityInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cityName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  stateName: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
  },
  cityDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
  insights: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  insightsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0ea5e9",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 4,
    paddingLeft: 8,
  },
  indiaMapBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
  indiaShape: {
    position: "absolute",
    left: "20%",
    top: "10%",
    width: "60%",
    height: "75%",
    backgroundColor: "#cbd5e1",
    borderRadius: 20,
    transform: [{ rotate: "5deg" }],
  },
  gujaratPeninsula: {
    position: "absolute",
    left: "15%",
    top: "35%",
    width: "12%",
    height: "20%",
    backgroundColor: "#cbd5e1",
    borderRadius: 8,
    transform: [{ rotate: "-10deg" }],
  },
  southernTip: {
    position: "absolute",
    left: "35%",
    top: "75%",
    width: "8%",
    height: "15%",
    backgroundColor: "#cbd5e1",
    borderRadius: 15,
  },
});
