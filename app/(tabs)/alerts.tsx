import { StationMap } from "@/components/station-map";
import { useStations } from "@/providers/stations-provider";
import { LinearGradient } from 'expo-linear-gradient';
import {
    Bell,
    ChartBar,
    MapPin,
    TrendingUp
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MapViewContent() {
  const { stations, userLocation } = useStations();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("Godavari Basin, IN");
  const [selectedMode, setSelectedMode] = useState<'heatmap' | 'correlation'>('heatmap');

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF7EA', '#FFE2AF']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#3F9AAE', '#79C9C5']}
            style={styles.headerIcon}
          >
            <MapPin size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Agro-Weather</Text>
            <Text style={styles.headerSubtitle}>PRO ANALYTICS</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifButton}>
            <Bell size={20} color="#64748b" />
          </TouchableOpacity>
          <LinearGradient
            colors={['#3F9AAE', '#79C9C5']}
            style={styles.analyticsButton}
          >
            <ChartBar size={20} color="#fff" />
          </LinearGradient>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MapPin size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search basin or region..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <LinearGradient
          colors={['#3F9AAE', '#79C9C5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.filterActive}
        >
          <MapPin size={18} color="#fff" />
          <Text style={styles.filterActiveText}>Rainfall</Text>
        </LinearGradient>
        <TouchableOpacity style={styles.filterPill}>
          <Text style={styles.filterPillText}>Soil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterPill}>
          <Text style={styles.filterPillText}>Suitability</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Map Container */}
        <View style={styles.mapContainer}>
          <StationMap 
            stations={stations}
            userLocation={userLocation}
            onStationPress={(station) => console.log('Station pressed:', station.name)}
            style={{ flex: 1 }}
          />

          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            <View style={styles.modeTabs}>
              <TouchableOpacity 
                style={[styles.modeTab, selectedMode === 'heatmap' && styles.modeTabActive]}
                onPress={() => setSelectedMode('heatmap')}
              >
                <Text style={[styles.modeTabText, selectedMode === 'heatmap' && styles.modeTabTextActive]}>
                  Heatmap
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeTab, selectedMode === 'correlation' && styles.modeTabActive]}
                onPress={() => setSelectedMode('correlation')}
              >
                <Text style={[styles.modeTabText, selectedMode === 'correlation' && styles.modeTabTextActive]}>
                  Correlation
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Regional Analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Regional Analysis</Text>
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonText}>POST-MONSOON</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>SUITABILITY SCORE</Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: '#3F9AAE' }]}>84</Text>
                <Text style={styles.statUnit}>/100</Text>
              </View>
              <View style={styles.statFooter}>
                <TrendingUp size={16} color="#3F9AAE" />
                <Text style={[styles.statFooterText, { color: '#3F9AAE' }]}>Optimal Yield</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>DWLR IMPACT</Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: '#F96E5B' }]}>+1.2</Text>
                <Text style={styles.statUnit}>m</Text>
              </View>
              <View style={styles.statFooter}>
                <TrendingUp size={16} color="#F96E5B" />
                <Text style={[styles.statFooterText, { color: '#F96E5B' }]}>Strong Recovery</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hydrological Cycle */}
        <View style={styles.cycleCard}>
          <View style={styles.cycleGlow1} />
          <View style={styles.cycleGlow2} />
          
          <View style={styles.cycleContent}>
            <View style={styles.cycleHeader}>
              <Text style={styles.cycleLabel}>HYDROLOGICAL CYCLE</Text>
              <Text style={styles.cycleSeries}>2024 Series</Text>
            </View>

            <View style={styles.cycleMonths}>
              <Text style={styles.cycleMonth}>JAN</Text>
              <Text style={[styles.cycleMonth, styles.cycleMonthActive]}>AUG</Text>
              <Text style={styles.cycleMonth}>DEC</Text>
            </View>

            <View style={styles.cycleTrack}>
              <LinearGradient
                colors={['#3F9AAE', '#F96E5B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cycleProgress}
              />
              <View style={styles.cycleMarker} />
            </View>

            <Text style={styles.cycleFooter}>PEAK RESOURCE WINDOW</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}


export default function MapView() {
  return <MapViewContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3F9AAE",
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterContent: {
    gap: 8,
    paddingBottom: 16,
  },
  filterActive: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  filterActiveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  filterPill: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    position: "relative",
    height: 380,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mapCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3F9AAE",
    marginTop: 8,
  },
  mapControls: {
    position: "absolute",
    top: 16,
    right: 16,
    gap: 8,
  },
  zoomControls: {
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
  },
  zoomButton: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  locationButton: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  legend: {
    position: "absolute",
    bottom: 16,
    left: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    width: 176,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  legendTitle: {
    fontSize: 9,
    fontWeight: "900",
    color: "#64748b",
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: "center",
  },
  legendBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: "#FFE2AF",
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  modeSelector: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 80,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    padding: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: "#3F9AAE",
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  modeTabTextActive: {
    color: "#fff",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  seasonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "rgba(249, 110, 91, 0.2)",
    borderRadius: 12,
  },
  seasonText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#F96E5B",
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  statFooterText: {
    fontSize: 11,
    fontWeight: "800",
  },
  cycleCard: {
    position: "relative",
    backgroundColor: "#1F2937",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#374151",
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  cycleGlow1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 160,
    height: 160,
    backgroundColor: "rgba(63, 154, 174, 0.3)",
    borderRadius: 80,
    opacity: 0.6,
  },
  cycleGlow2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 128,
    height: 128,
    backgroundColor: "rgba(249, 110, 91, 0.2)",
    borderRadius: 64,
    opacity: 0.6,
  },
  cycleContent: {
    position: "relative",
    zIndex: 1,
  },
  cycleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cycleLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
  },
  cycleSeries: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cycleMonths: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  cycleMonth: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
  },
  cycleMonthActive: {
    color: "#F96E5B",
    fontSize: 10,
    fontWeight: "900",
  },
  cycleTrack: {
    position: "relative",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  cycleProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "66%",
    borderRadius: 4,
  },
  cycleMarker: {
    position: "absolute",
    left: "66%",
    top: "50%",
    marginTop: -12,
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#F96E5B",
    borderRadius: 12,
    shadowColor: "#F96E5B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  cycleFooter: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 20,
  },
});
