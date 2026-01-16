import { StationCard } from "@/components/station-card";
import { StationMap } from "@/components/station-map";
import { useStations } from "@/providers/stations-provider";
import { router } from "expo-router";
import { Droplet, Info, Layers, CloudRain, Thermometer, Leaf, ChevronDown, Radio, X } from "lucide-react-native";
import { FarmerHeader, AiFab } from "@/components/FarmerHeader";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Modal,
  SafeAreaView
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from 'expo-location';
import { fetchWeather, WeatherData } from "@/services/weather-service";

const { width } = Dimensions.get("window");

type MapLayer = "groundwater" | "rainfall" | "soil" | "crop";

function MapScreenContent() {
  const { 
    stations, 
    nearbyStations, 
    userLocation, 
    isLoadingLocation, 
    locationError, 
    requestLocationPermission,
    estimatedLevel,
  } = useStations();
  const [activeLayer, setActiveLayer] = useState<MapLayer>("groundwater");
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState<boolean>(false);
  const [isFullPageMap, setIsFullPageMap] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>("Locating...");
  const insets = useSafeAreaInsets();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (userLocation) {
      fetchWeather(userLocation.latitude, userLocation.longitude).then(setWeather);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocation) {
      (async () => {
        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          });
          if (address) {
            const name = [address.city, address.region, address.country].filter(Boolean).join(", ");
            setLocationName(name || "Unknown Location");
          }
        } catch (e) {
          setLocationName(`${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`);
        }
      })();
    } else if (locationError) {
      setLocationName("Location Unavailable");
    } else {
      setLocationName("Locating...");
    }
  }, [userLocation, locationError]);

  

  const renderSummaryCard = (
    title: string,
    value: string,
    subtext: string,
    icon: any,
    color: string,
    bgColors: readonly [string, string, ...string[]],
    onPress?: () => void,
  ) => (
    <TouchableOpacity activeOpacity={onPress ? 0.7 : 1} onPress={onPress}>
      <LinearGradient
        colors={bgColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        {/* Background accent */}
        <View style={styles.cardAccent} />
        
        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.summaryCardHeader}>
            <View style={styles.iconContainer}>
              {icon}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.summaryCardTitle}>{title}</Text>
            </View>
          </View>
          
          <View style={styles.valueContainer}>
            <Text style={styles.summaryCardValue}>{value}</Text>
          </View>
          
          <Text style={styles.summaryCardSubtext}>{subtext}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Full-Page Map Modal */}
      <Modal
        visible={isFullPageMap}
        animationType="slide"
        onRequestClose={() => setIsFullPageMap(false)}
      >
        <SafeAreaView style={styles.fullPageMapContainer}>
          <View style={styles.fullMapHeader}>
            <Text style={styles.fullMapTitle}>Live Monitoring Map</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsFullPageMap(false)}
            >
              <X size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, position: 'relative' }}>
            <StationMap
              stations={stations}
              userLocation={userLocation}
              onStationPress={(station) => router.push(`/station/${station.id}`)}
            />

            {/* Layer Control FAB */}
            <View style={styles.layerControlContainer}>
              {isLayerMenuOpen && (
                <View style={styles.layerMenu}>
                  <Text style={styles.layerMenuTitle}>Map Layers</Text>
                  
                  <TouchableOpacity 
                    style={[styles.layerOption, activeLayer === 'groundwater' && styles.layerOptionActive]}
                    onPress={() => { setActiveLayer('groundwater'); setIsLayerMenuOpen(false); }}
                  >
                    <Droplet size={16} color={activeLayer === 'groundwater' ? "#0ea5e9" : "#64748b"} />
                    <Text style={[styles.layerOptionText, activeLayer === 'groundwater' && styles.layerOptionTextActive]}>Groundwater</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.layerOption, activeLayer === 'rainfall' && styles.layerOptionActive]}
                    onPress={() => { setActiveLayer('rainfall'); setIsLayerMenuOpen(false); }}
                  >
                    <CloudRain size={16} color={activeLayer === 'rainfall' ? "#0ea5e9" : "#64748b"} />
                    <Text style={[styles.layerOptionText, activeLayer === 'rainfall' && styles.layerOptionTextActive]}>Rainfall Heatmap</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.layerOption, activeLayer === 'soil' && styles.layerOptionActive]}
                    onPress={() => { setActiveLayer('soil'); setIsLayerMenuOpen(false); }}
                  >
                    <Leaf size={16} color={activeLayer === 'soil' ? "#0ea5e9" : "#64748b"} />
                    <Text style={[styles.layerOptionText, activeLayer === 'soil' && styles.layerOptionTextActive]}>Soil Moisture</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.layerFab}
                onPress={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              >
                <Layers size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Main Screen */}
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <FarmerHeader />
        <AiFab />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.summaryContent}
            >
              {/* Groundwater Card */}
              {renderSummaryCard(
                "Groundwater",
                estimatedLevel ? `${estimatedLevel.toFixed(1)}m` : "--",
                "Current Level",
                <Droplet size={20} color="#fff" />,
                "#0ea5e9",
                ["#3b82f6", "#2563eb"]
              )}

              {/* Weather Card */}
              {renderSummaryCard(
                "Weather",
                weather ? `${weather.current.temp}°C` : "--",
                weather ? `${weather.current.condition} • ${weather.current.humidity}% Hum` : "Loading...",
                <CloudRain size={20} color="#ffffffff" />,
                "#f59e0b",
                ["#ce8e1eff", "#d97706"],
                () => router.push("/farmer/weather")
              )}

              {/* Soil Health Card */}
              {renderSummaryCard(
                "Soil Health",
                "Good",
                "Nitrogen: Optimal",
                <Leaf size={20} color="#fff" />,
                "#22c55e",
                ["#22c55e", "#16a34a"],
                () => router.push("/farmer/soil-report")
              )}
            </ScrollView>
          </View>

          {/* Map Section */}
          <TouchableOpacity 
            style={styles.mapContainer}
            onPress={() => setIsFullPageMap(true)}
            activeOpacity={0.8}
          >
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>Live Monitoring Map</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.pulsingDot} />
                <Text style={styles.liveText}>Live Updates</Text>
              </View>
            </View>

            <View style={{ flex: 1, position: 'relative' }}>
              <StationMap
                stations={stations}
                userLocation={userLocation}
                onStationPress={(station) => router.push(`/station/${station.id}`)}
              />
            </View>
          </TouchableOpacity>

          {/* Nearby Insights */}
          <View style={styles.bottomSheetInline}>
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetTitleRow}>
                <View style={styles.insightIconBg}>
                  <Radio size={16} color="#0ea5e9" />
                </View>
                <View>
                  <Text style={styles.bottomSheetTitle}>Nearby Insights</Text>
                  <Text style={styles.bottomSheetSubtitle}>
                    {nearbyStations.length} stations • 50km radius
                  </Text>
                </View>
              </View>
            </View>

            <FlatList
              data={nearbyStations}
              keyExtractor={(station) => station.id}
              renderItem={({ item: station }) => (
                <StationCard
                  station={station}
                  onPress={() => router.push(`/station/${station.id}`)}
                />
              )}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

export default function MapScreen() {
  return (
    <MapScreenContent />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fbff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  userNameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  summaryContainer: {
    marginBottom: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
    paddingBottom: 16,
    paddingTop: 12,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
    zIndex: 10,
  },
  summaryContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    width: width * 0.42,
    padding: 18,
    borderRadius: 24,
    height: 170,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardAccent: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 1,
  },
  summaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    marginRight: 12,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  titleContainer: {
    flex: 1,
  },
  summaryCardTitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
  },
  valueContainer: {
    marginBottom: 6,
  },
  summaryCardValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    letterSpacing: -0.8,
  },
  summaryCardSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    lineHeight: 16,
  },
  mapContainer: {
    height: 300,
    margin: 12,
    marginBottom: 12,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.4)",
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1e293b",
    letterSpacing: -0.4,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(240, 253, 244, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(134, 239, 172, 0.6)",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#22c55e",
    marginRight: 7,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803d",
  },
  layerControlContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    alignItems: "flex-end",
  },
  layerFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  layerMenu: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
    width: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  layerMenuTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
    paddingHorizontal: 8,
    textTransform: "uppercase",
  },
  layerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  layerOptionActive: {
    backgroundColor: "#e0f2fe",
  },
  layerOptionText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  layerOptionTextActive: {
    color: "#0ea5e9",
    fontWeight: "600",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
    paddingTop: 8,
    height: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 50,
  },
  bottomSheetExpanded: {
    height: "75%",
    zIndex: 60,
  },
  bottomSheetHandle: {
    alignItems: "center",
    paddingVertical: 10,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: "rgba(203, 213, 225, 0.6)",
    borderRadius: 2.5,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "rgba(226, 232, 240, 0.4)",
  },
  bottomSheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  insightIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(224, 242, 254, 0.8)",
    borderWidth: 1.5,
    borderColor: "rgba(186, 230, 253, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1e293b",
    letterSpacing: -0.4,
  },
  bottomSheetSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
    fontWeight: "600",
  },
  expandButton: {
    padding: 8,
  },
  stationsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  fullPageMapContainer: {
    flex: 1,
    backgroundColor: "#f8fbff",
  },
  fullMapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  fullMapTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1e293b",
    letterSpacing: -0.4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomSheetInline: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(255,255,255,0.8)",
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 20,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
});
