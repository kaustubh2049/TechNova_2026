import { useStations } from "@/providers/stations-provider";
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function StationExplorerContent() {
  const { stations, getAnalytics } = useStations();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const analytics = getAnalytics();

  // Sample station data with status
  const stationData = stations.slice(0, 10).map((station, index) => ({
    ...station,
    status: index % 3 === 0 ? 'critical' : index % 3 === 1 ? 'safe' : 'warning',
    value: `${(Math.random() * 50).toFixed(2)}`,
    trend: index % 2 === 0 ? 'up' : 'down',
    trendValue: `${(Math.random() * 2).toFixed(2)}`,
  }));

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF7EA', '#FFE2AF']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <MapPin size={24} color="#3F9AAE" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Station Explorer</Text>
              <Text style={styles.headerSubtitle}>GLOBAL NETWORK</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Search size={20} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <SlidersHorizontal size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity style={styles.filterActive}>
            <Text style={styles.filterActiveText}>All Regions</Text>
            <ChevronDown size={14} color="#3F9AAE" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterPillText}>Critical</Text>
            <View style={[styles.statusDot, { backgroundColor: '#F96E5B' }]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterPillText}>Safe</Text>
            <View style={[styles.statusDot, { backgroundColor: '#79C9C5' }]} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Station List */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {stationData.map((station, index) => (
          <View key={station.id} style={styles.stationCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: station.status === 'critical' ? '#F96E5B' : 
                                    station.status === 'safe' ? '#79C9C5' : '#FFE2AF' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: station.status === 'warning' ? '#1A1A1A' : '#fff' }
                  ]}>
                    {station.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.stationCode}>ST-{station.id}</Text>
              </View>
              <View style={styles.cardHeaderRight}>
                <Text style={styles.stationValue}>{station.value}<Text style={styles.stationUnit}>m</Text></Text>
                <View style={[
                  styles.trendBadge,
                  { backgroundColor: station.trend === 'up' ? '#79C9C5' : '#F96E5B' }
                ]}>
                  {station.trend === 'up' ? 
                    <TrendingUp size={12} color="#fff" /> : 
                    <TrendingDown size={12} color="#fff" />
                  }
                  <Text style={styles.trendText}>
                    {station.trend === 'up' ? '+' : '-'}{station.trendValue}/mo
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.stationName}>{station.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color="#79C9C5" />
              <Text style={styles.locationText}>{station.district}</Text>
            </View>

            {/* Sparkline */}
            <View style={styles.sparklineContainer}>
              <View style={styles.sparkline}>
                {[30, 35, 40, 45, 55, 65, 75, 85, 90, 100].map((height, i) => (
                  <View 
                    key={i}
                    style={[
                      styles.sparklineBar,
                      { 
                        height: `${height}%`,
                        backgroundColor: i >= 6 ? 
                          (station.status === 'critical' ? 'rgba(249, 110, 91, 0.7)' : 'rgba(121, 201, 197, 0.7)') :
                          'rgba(121, 201, 197, 0.4)'
                      }
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.analystsRow}>
                <View style={styles.analysts}>
                  <View style={[styles.analystAvatar, { backgroundColor: '#3F9AAE' }]}>
                    <Text style={styles.analystInitial}>A</Text>
                  </View>
                  <View style={[styles.analystAvatar, { backgroundColor: '#79C9C5', marginLeft: -12 }]}>
                    <Text style={styles.analystInitial}>B</Text>
                  </View>
                </View>
                <Text style={styles.analystsLabel}>Analyst Assigned</Text>
              </View>
              <TouchableOpacity style={styles.analysisButton}>
                <Text style={styles.analysisButtonText}>Analysis</Text>
                <ArrowRight size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

export default function StationExplorer() {
  return <StationExplorerContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE2AF", // Sunset cream
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(63, 154, 174, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  filterScroll: {
    marginTop: 4,
  },
  filterContent: {
    gap: 12,
    paddingRight: 24,
  },
  filterActive: {
    flexDirection: "row",
    height: 32,
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterActiveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#3F9AAE",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  filterPill: {
    flexDirection: "row",
    height: 32,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(63, 154, 174, 0.4)",
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stationCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(121, 201, 197, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  stationCode: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  stationValue: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: -1,
  },
  stationUnit: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  stationName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  sparklineContainer: {
    backgroundColor: "rgba(255, 226, 175, 0.3)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 226, 175, 0.4)",
  },
  sparkline: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 96,
    gap: 4,
  },
  sparklineBar: {
    flex: 1,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  analystsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  analysts: {
    flexDirection: "row",
  },
  analystAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analystInitial: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  analystsLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  analysisButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3F9AAE",
    paddingLeft: 24,
    paddingRight: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#3F9AAE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});