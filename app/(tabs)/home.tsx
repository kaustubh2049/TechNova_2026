import { StationCard } from "@/components/station-card";
import { StationMap } from "@/components/station-map";
import { useStations } from "@/providers/stations-provider";
import { router } from "expo-router";
import { Bell, Droplet, Info, MapPin, RefreshCw } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>DWLR Stations</Text>
          <View style={styles.locationContainer}>
            {isLoadingLocation ? (
              <View style={styles.locationStatus}>
                <ActivityIndicator size="small" color="#0891b2" />
                <Text style={styles.locationText}>Getting location...</Text>
              </View>
            ) : userLocation ? (
              <View style={styles.locationStatus}>
                <MapPin size={14} color="#059669" />
                <Text style={styles.locationText}>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.locationStatus} 
                onPress={requestLocationPermission}
              >
                <MapPin size={14} color="#dc2626" />
                <Text style={[styles.locationText, { color: '#dc2626' }]}>
                  {locationError || 'Tap to enable location'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={requestLocationPermission}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size={20} color="#0891b2" />
            ) : (
              <RefreshCw size={20} color="#0891b2" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Bell size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

    

      {/* Live Location Estimated Groundwater Level */}
      <View style={styles.estimateContainer}>
        <View style={styles.estimateCard}>
          <View style={styles.estimateHeader}>
            <View style={styles.estimateIconWrap}>
              <Droplet size={18} color="#0ea5e9" />
            </View>
            <Text style={styles.estimateTitle}>Estimated Groundwater Level</Text>
            {userLocation && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            )}
          </View>

          <View style={styles.estimateValueRow}>
            {estimatedLevel != null ? (
              <>
                <Text style={styles.estimateValue}>{estimatedLevel.toFixed(2)}</Text>
                <Text style={styles.estimateUnit}>m</Text>
              </>
            ) : (
              <Text style={styles.estimatePlaceholder}>
                {userLocation ? '—' : 'Location needed to estimate'}
              </Text>
            )}
          </View>

          {userLocation ? (
            <View style={styles.estimateInfoRow}>
              <Info size={14} color="#075985" />
              <Text style={styles.estimateSubtext}>Based on nearby stations (IDW)</Text>
            </View>
          ) : (
            <View style={styles.estimateActions}>
              <TouchableOpacity style={styles.enableButton} onPress={requestLocationPermission}>
                <MapPin size={16} color="#ffffff" />
                <Text style={styles.enableButtonText}>Enable Location</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <StationMap
          stations={filteredStations}
          userLocation={userLocation}
          onStationPress={(station) => router.push(`/station/${station.id}`)}
        />
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, isBottomSheetExpanded && styles.bottomSheetExpanded]}>
        <TouchableOpacity
          style={styles.bottomSheetHandle}
          onPress={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
        >
          <View style={styles.handle} />
        </TouchableOpacity>

        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>
            {userLocation ? 'Nearby Stations' : 'Featured Stations'}
          </Text>
          <Text style={styles.bottomSheetCount}>
            {nearbyStations.length} stations
            {userLocation && ' • Sorted by distance'}
          </Text>
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
          style={styles.stationsList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </View>
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
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  locationContainer: {
    marginTop: 4,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  filterButton: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    flex: 1,
  },
  estimateContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#ffffff",
  },
  estimateCard: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bae6fd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  estimateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  estimateIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  estimateTitle: {
    fontSize: 14,
    color: "#0369a1",
    marginBottom: 6,
    fontWeight: "600",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "600",
  },
  estimateValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0ea5e9",
  },
  estimateUnit: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0ea5e9",
    marginLeft: 6,
    marginBottom: 2,
  },
  estimatePlaceholder: {
    fontSize: 14,
    color: "#075985",
    opacity: 0.9,
  },
  estimateInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  estimateSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: "#075985",
    marginLeft: 6,
  },
  estimateActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  enableButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  enableButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 14,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    height: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 50,
  },
  bottomSheetExpanded: {
    height: "60%",
    zIndex: 60,
  },
  bottomSheetHandle: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#cbd5e1",
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  bottomSheetCount: {
    fontSize: 14,
    color: "#64748b",
  },
  stationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
});