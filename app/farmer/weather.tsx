import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  CloudRain,
  Sun,
  Wind,
  Droplets,
  CloudSun,
  Cloud,
  CloudLightning,
  Snowflake,
  CloudFog,
  MapPin,
  Eye,
  Gauge,
  Thermometer,
  Sunrise,
  Sunset,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useStations } from "@/providers/stations-provider";
import { fetchWeather, WeatherData } from "@/services/weather-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { FarmerHeader } from "@/components/FarmerHeader";

const { width } = Dimensions.get("window");

const getWeatherIcon = (condition: string, size: number = 24) => {
  const color = "#fff";

  switch (condition?.toLowerCase()) {
    case "clear":
      return <Sun size={size} color={color} />;
    case "clouds":
    case "few clouds":
    case "scattered clouds":
      return <CloudSun size={size} color={color} />;
    case "broken clouds":
    case "overcast clouds":
      return <Cloud size={size} color={color} />;
    case "rain":
    case "light rain":
    case "moderate rain":
    case "heavy intensity rain":
    case "shower rain":
      return <CloudRain size={size} color={color} />;
    case "thunderstorm":
      return <CloudLightning size={size} color={color} />;
    case "snow":
      return <Snowflake size={size} color={color} />;
    case "mist":
    case "fog":
      return <CloudFog size={size} color={color} />;
    default:
      return <Sun size={size} color={color} />;
  }
};

const getMapGradient = (layer: string): [string, string, ...string[]] => {
  switch (layer) {
    case "temperature":
      return ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
    case "rainfall":
      return ["#e0f2fe", "#0ea5e9", "#1e40af", "#1e3a8a"];
    case "wind":
      return ["#f1f5f9", "#64748b", "#334155", "#0f172a"];
    case "pressure":
      return ["#faf5ff", "#c4b5fd", "#8b5cf6", "#6d28d9"];
    case "humidity":
      return ["#ecfeff", "#67e8f9", "#06b6d4", "#0891b2"];
    case "soil":
      return ["#f7fee7", "#bef264", "#84cc16", "#65a30d"];
    default:
      return ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  }
};

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const { userLocation, requestLocationPermission, isLoadingLocation } =
    useStations();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) {
      loadWeather(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  const loadWeather = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeather(lat, lon);
      setWeather(data);
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error("Weather error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (isLoadingLocation || (loading && !weather)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Fetching weather data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No location state
  if (!userLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Location access is needed for weather.
          </Text>
          <TouchableOpacity
            onPress={requestLocationPermission}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              userLocation &&
              loadWeather(userLocation.latitude, userLocation.longitude)
            }
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main weather display
  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <FarmerHeader />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <PageHeader
          title="Weather"
          subtitle={weather?.current.city || "Current Location"}
        />

        {/* Main Weather Card */}
        <LinearGradient
          colors={["#0ea5e9", "#0284c7"]}
          style={styles.mainWeatherCard}
        >
          <View style={styles.currentWeatherHeader}>
            <View style={styles.temperatureSection}>
              <Text style={styles.mainTemperature}>
                {weather?.current.temp || "--"}°
              </Text>
              <Text style={styles.conditionText}>
                {weather?.current.condition || "Loading..."}
              </Text>
            </View>
            <View style={styles.weatherIconSection}>
              {getWeatherIcon(weather?.current.condition || "Clear", 80)}
            </View>
          </View>

          <View style={styles.weatherDetailsGrid}>
            <View style={styles.detailItem}>
              <Wind size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>
                {weather?.current.windSpeed || 0} km/h
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Droplets size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>
                {weather?.current.humidity || 0}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Compact upcoming forecast strip (Google Weather-style) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Next Days</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyContainer}
          >
            {weather?.forecast.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>{item.date}</Text>
                {getWeatherIcon(item.condition, 32)}
                <Text style={styles.hourlyTemp}>{item.temp}°</Text>
                <Text style={styles.hourlyHumidity}>{item.humidity}%</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 7-Day style Forecast list */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          {weather?.forecast.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.dailyItem}>
              <Text style={styles.dailyDay}>{item.date}</Text>
              <View style={styles.dailyIconTemp}>
                {getWeatherIcon(item.condition, 28)}
                <Text style={styles.dailyCondition}>{item.condition}</Text>
              </View>
              <View style={styles.dailyTempRange}>
                <Text style={styles.dailyTempMax}>{item.temp_max}°</Text>
                <Text style={styles.dailyTempMin}>{item.temp_min}°</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weather Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Eye size={20} color="#64748b" />
              <Text style={styles.detailTitle}>Visibility</Text>
            </View>
            <Text style={styles.detailValueNew}>
              {weather?.current.visibility || 10} km
            </Text>
            <Text style={styles.detailSubtext}>Clear visibility</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Gauge size={20} color="#64748b" />
              <Text style={styles.detailTitle}>Pressure</Text>
            </View>
            <Text style={styles.detailValueNew}>
              {weather?.current.pressure || 1013} mb
            </Text>
            <Text style={styles.detailSubtext}>Normal pressure</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Thermometer size={20} color="#64748b" />
              <Text style={styles.detailTitle}>Feels Like</Text>
            </View>
            <Text style={styles.detailValueNew}>
              {weather?.current.feelsLike || weather?.current.temp}°
            </Text>
            <Text style={styles.detailSubtext}>Similar to actual</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Sun size={20} color="#64748b" />
              <Text style={styles.detailTitle}>UV Index</Text>
            </View>
            <Text style={styles.detailValueNew}>
              {weather?.current.uvIndex || 6}
            </Text>
            <Text style={styles.detailSubtext}>Moderate</Text>
          </View>
        </View>

        {/* Sun & Moon Card */}
        <View style={styles.sunMoonCard}>
          <View style={styles.sunMoonHeader}>
            <Text style={styles.sunMoonTitle}>Sun & Moon</Text>
          </View>
          <View style={styles.sunMoonContent}>
            <View style={styles.sunMoonItem}>
              <Sunrise size={24} color="#f59e0b" />
              <Text style={styles.sunMoonLabel}>Sunrise</Text>
              <Text style={styles.sunMoonTime}>
                {weather?.current.sunrise
                  ? new Date(weather.current.sunrise * 1000).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )
                  : "6:30 AM"}
              </Text>
            </View>
            <View style={styles.sunMoonItem}>
              <Sunset size={24} color="#ef4444" />
              <Text style={styles.sunMoonLabel}>Sunset</Text>
              <Text style={styles.sunMoonTime}>
                {weather?.current.sunset
                  ? new Date(weather.current.sunset * 1000).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )
                  : "6:30 PM"}
              </Text>
            </View>
          </View>
        </View>

        {/* Simple weather information */}
        <Text style={styles.simpleText}>Weather screen is now working! 🌤️</Text>
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
    flex: 1,
    paddingBottom: 80,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  locationText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  mainWeatherCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  currentWeatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  temperatureSection: {
    flex: 1,
  },
  mainTemperature: {
    fontSize: 72,
    fontWeight: "300",
    color: "#fff",
    lineHeight: 80,
  },
  conditionText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    textTransform: "capitalize",
  },
  weatherIconSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  weatherDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  simpleText: {
    textAlign: "center",
    fontSize: 18,
    color: "#22c55e",
    fontWeight: "600",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  // Section styles
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },

  // Hourly forecast styles
  hourlyContainer: {
    paddingHorizontal: 4,
  },

  hourlyItem: {
    alignItems: "center",
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    minWidth: 70,
  },

  hourlyTime: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 8,
  },

  hourlyTemp: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 8,
  },

  hourlyHumidity: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },

  // Daily forecast styles
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  dailyDay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    width: 80,
  },

  dailyIconTemp: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 16,
  },

  dailyCondition: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },

  dailyTempRange: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
  },

  dailyTempMax: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  dailyTempMin: {
    fontSize: 16,
    color: "#64748b",
    marginLeft: 8,
  },

  // Details grid styles
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },

  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  detailTitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginLeft: 8,
  },

  detailValueNew: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },

  detailSubtext: {
    fontSize: 12,
    color: "#64748b",
  },

  // Sun & Moon styles
  sunMoonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  sunMoonHeader: {
    marginBottom: 16,
  },

  sunMoonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },

  sunMoonContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  sunMoonItem: {
    alignItems: "center",
  },

  sunMoonLabel: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    marginBottom: 4,
  },

  sunMoonTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },

  // Weather maps styles
  weatherMapsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  mapHeader: {
    marginBottom: 20,
  },

  mapTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  mapTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 8,
  },

  mapSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },

  layerSelector: {
    paddingHorizontal: 4,
    marginBottom: 16,
  },

  layerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 25,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  layerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 6,
  },

  legendContainer: {
    marginVertical: 12,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },

  legendScroll: {
    paddingHorizontal: 4,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },

  legendLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },

  mapContainer: {
    height: 380,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f4f8",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },

  mapOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  mapOverlayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  fullPageMapContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  fullMapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },

  fullMapTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },

  closeMapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  dataInfoContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },

  dataInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },

  dataInfoText: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 4,
  },

  // Wind info card styles
  windInfoCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },

  windInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  windInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    marginLeft: 8,
  },

  windInfoText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
});
