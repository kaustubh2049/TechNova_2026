import { StationMap } from "@/components/station-map";
import { useStations } from "@/providers/stations-provider";
import { Stack, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import React from "react";
import {
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FullMapScreen() {
  const { stations, userLocation } = useStations();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <StatusBar barStyle="dark-content" />

      {/* Full Screen Map */}
      <View style={styles.mapWrapper}>
        <StationMap
          stations={stations}
          userLocation={userLocation}
          onStationPress={(station) => console.log("Station pressed:", station.name)}
          style={styles.map}
        />
      </View>

      {/* Close Button */}
      <View style={[styles.closeButtonContainer, { top: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0f2fe",
  },
  mapWrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  closeButtonContainer: {
    position: "absolute",
    right: 16,
    zIndex: 1000,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
});
