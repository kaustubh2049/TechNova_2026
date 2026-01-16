import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import {
  CityWeatherData,
  getTemperatureColor,
  getRainfallColor,
  getWindColor,
  getHumidityColor,
  getGroundwaterColor,
} from "@/services/india-heatmap-service";

interface WeatherHeatmapProps {
  data: CityWeatherData[];
  selectedLayer: string;
  loading: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}

const getColorForLayer = (city: CityWeatherData, layer: string): string => {
  switch (layer) {
    case "temperature":
      return getTemperatureColor(city.temp);
    case "rainfall":
      return getRainfallColor(city.rainfall);
    case "wind":
      return getWindColor(city.windSpeed);
    case "humidity":
      return getHumidityColor(city.humidity);
    case "groundwater":
      return getGroundwaterColor(city.groundwater || 10);
    default:
      return "#999";
  }
};

const getValueForLayer = (city: CityWeatherData, layer: string): string => {
  switch (layer) {
    case "temperature":
      return `${Math.round(city.temp)}°C`;
    case "rainfall":
      return `${Math.round(city.rainfall)} mm`;
    case "wind":
      return `${Math.round(city.windSpeed)} km/h`;
    case "humidity":
      return `${city.humidity}%`;
    case "groundwater":
      return `${city.groundwater?.toFixed(1) || "N/A"} m`;
    default:
      return "";
  }
};

export const WeatherHeatmap = ({
  data,
  selectedLayer,
  loading,
  userLocation,
}: WeatherHeatmapProps) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* India Map Background with City Markers */}
      <View style={styles.mapBackground}>
        <Text style={styles.mapTitle}>India Weather Heatmap</Text>
        
        {/* City Points Grid */}
        <View style={styles.citiesGrid}>
          {data.map((city, index) => {
            const color = getColorForLayer(city, selectedLayer);
            const value = getValueForLayer(city, selectedLayer);

            return (
              <TouchableOpacity
                key={`${city.name}-${index}`}
                style={[
                  styles.cityPoint,
                  { left: typeof city.x === 'number' ? city.x : parseInt(city.x), top: typeof city.y === 'number' ? city.y : parseInt(city.y) },
                ]}
              >
                <View
                  style={[
                    styles.cityDot,
                    {
                      backgroundColor: color,
                      borderColor: color,
                    },
                  ]}
                />
                <View style={styles.cityLabel}>
                  <Text style={styles.cityName}>{city.name}</Text>
                  <Text style={styles.cityValue}>{value}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* User Location */}
          {userLocation && (
            <View
              style={[
                styles.cityPoint,
                { left: "50%", top: "50%", marginLeft: -12 },
              ]}
            >
              <View style={styles.userLocationMarker}>
                <View style={styles.userLocationDot} />
              </View>
              <View style={styles.cityLabel}>
                <Text style={styles.cityName}>Your Location</Text>
              </View>
            </View>
          )}
        </View>

        {/* Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>
            © OpenStreetMap contributors
          </Text>
        </View>
      </View>

      {/* Cities List Below Map */}
      <ScrollView
        style={styles.citiesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.citiesListContent}
      >
        <Text style={styles.listTitle}>Weather Data by City</Text>
        {data.map((city, index) => {
          const color = getColorForLayer(city, selectedLayer);
          const value = getValueForLayer(city, selectedLayer);

          return (
            <View key={`list-${city.name}-${index}`} style={styles.listItem}>
              <View
                style={[
                  styles.listDot,
                  { backgroundColor: color },
                ]}
              />
              <View style={styles.listContent}>
                <Text style={styles.listCityName}>{city.name}</Text>
                <Text style={styles.listCityValue}>{value}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 14,
  },
  mapBackground: {
    height: 300,
    backgroundColor: "#e8f0f8",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#d0dce6",
  },
  mapTitle: {
    position: "absolute",
    top: 12,
    left: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  citiesGrid: {
    flex: 1,
    position: "relative",
  },
  cityPoint: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  cityDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  cityLabel: {
    marginTop: 6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cityName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0f172a",
  },
  cityValue: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10b981",
  },
  userLocationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
  attribution: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: "#64748b",
  },
  citiesList: {
    flex: 1,
    marginTop: 12,
  },
  citiesListContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    marginBottom: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  listDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listCityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  listCityValue: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
});
