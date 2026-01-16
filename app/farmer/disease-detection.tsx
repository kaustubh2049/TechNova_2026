import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Keyboard, Platform, Image, Linking, Alert, Share, Modal } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stack } from "expo-router";
import { Camera, Upload, AlertTriangle, CheckCircle, Zap, MapPin, ExternalLink, Leaf } from "lucide-react-native";
import { FarmerHeader, AiFab } from "@/components/FarmerHeader";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { analyzeImageHybrid, imageUriToBase64, fallbackColorAnalysis } from "@/app/services/geminiService";

export default function DiseaseDetectionScreen() {
  const [result, setResult] = useState<null | any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    const show = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hide = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const s = Keyboard.addListener(show, (e: any) => setKeyboardPadding(e.endCoordinates?.height || 0));
    const h = Keyboard.addListener(hide, () => setKeyboardPadding(0));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showDiseaseInfo, setShowDiseaseInfo] = useState(false);

  const getRiskLabel = (severity: string) => {
    const sev = (severity || "").toLowerCase();
    if (sev === "severe" || sev === "high") return "🔴 High Risk";
    if (sev === "moderate") return "🟠 Medium Risk";
    if (sev === "mild" || sev === "low") return "🟢 Low Risk";
    return "🟡 Moderate Risk";
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem("plant_scan_history");
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };
    loadHistory();
  }, []);

  const saveToHistory = async (entry: any) => {
    try {
      const newHistory = [entry, ...history].slice(0, 10);
      setHistory(newHistory);
      await AsyncStorage.setItem("plant_scan_history", JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history", error);
    }
  };

  const handleShareResult = async () => {
    if (!result) return;
    try {
      const message = `Disease: ${result.disease}\nSeverity: ${result.severity}\n\nPossible Causes:\n- ${result.causes.join("\n- ")}\n\nRecommended Treatment:\n- ${result.remedies.join("\n- ")}`;
      // Prefer sharing the image with the result if possible
      if (result.imageUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(result.imageUri, {
          dialogTitle: "Share plant diagnosis",
          mimeType: "image/jpeg",
        });
        // Some apps don't accept caption programmatically; show the text so user can copy if needed
        Alert.alert("Shared image", "Image shared. If you also need the text, you can copy this:", [
          {
            text: "Copy text",
            onPress: () => {
              // Fallback: also open system share for text only
              Share.share({ message });
            },
          },
          { text: "OK" },
        ]);
      } else {
        // Fallback to text-only share
        await Share.share({ message });
      }
    } catch (error) {
      console.error("Error sharing result", error);
    }
  };

  const handleSetReminder = async () => {
    if (!result) return;
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Enable notifications to set treatment reminders.");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Treatment Reminder",
          body: `Re-check and treat your plant for ${result.disease}.`,
        },
        // 7 days from now (in seconds) – easier and TS-safe than passing Date
        trigger: { seconds: 7 * 24 * 60 * 60 } as any,
      });

      Alert.alert("Reminder set", "We will remind you in 7 days to check this plant again.");
    } catch (error) {
      console.error("Error setting reminder", error);
      Alert.alert("Error", "Could not schedule reminder. Please try again.");
    }
  };

  const handleFindRemediesNearby = async () => {
    try {
      console.log("📍 Finding remedies nearby...");

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "We need location access to find remedies nearby. Please enable location in settings.",
          [
            { text: "Cancel", onPress: () => console.log("Location denied") },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      console.log(`📍 Location: ${latitude}, ${longitude}`);

      // Search for agricultural stores/pesticide shops nearby
      const searchQueries = [
        `agricultural store near ${latitude},${longitude}`,
        `pesticide shop near ${latitude},${longitude}`,
        `farm supply store near ${latitude},${longitude}`,
      ];

      // Create Google Maps search URL
      const mapsUrl = `https://www.google.com/maps/search/agricultural+store+or+pesticide+shop/@${latitude},${longitude},15z`;

      console.log("🗺️ Opening Google Maps...");
      const canOpen = await Linking.canOpenURL(mapsUrl);

      if (canOpen) {
        await Linking.openURL(mapsUrl);
        Alert.alert(
          "🗺️ Finding Remedies",
          `Searching for agricultural stores and pesticide shops near you.\n\nDiseases to treat: ${result.disease}\n\nLook for:\n• Fungicides (if fungal disease)\n• Pesticides\n• Organic treatments\n• Fertilizers`,
          [{ text: "OK", onPress: () => console.log("Maps opened") }]
        );
      } else {
        // Fallback: Show alert with search suggestions
        Alert.alert(
          "🛒 Where to Buy Remedies",
          `Search for these near you:\n\n1. Agricultural Stores\n2. Pesticide Shops\n3. Farm Supply Centers\n4. Garden Centers\n\nFor: ${result.disease}\n\nLocation: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          [
            {
              text: "Search Online",
              onPress: () => {
                const searchUrl = `https://www.google.com/search?q=agricultural+store+near+me`;
                Linking.openURL(searchUrl);
              },
            },
            { text: "Cancel", onPress: () => console.log("Cancelled") },
          ]
        );
      }
    } catch (error) {
      console.error("❌ Error finding remedies:", error);
      Alert.alert(
        "Error",
        "Could not access location. Please enable location services and try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleScan = async () => {
    try {
      setAnalyzing(true);
      setResult(null);

      // Pick an image from gallery
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (picked.canceled || !picked.assets?.[0]?.uri) {
        setAnalyzing(false);
        return;
      }

      const uri = picked.assets[0].uri;
      setSelectedImage(uri);

      console.log("📷 Converting image to base64...");
      const base64Image = await imageUriToBase64(uri);

      const filename = uri.split("/").pop() ?? "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";

      console.log(`🖼️ Image format detected: ${mimeType}`);

      // Analyze with HYBRID system (Local Model + Gemini AI)
      const analysisResult = await analyzeImageHybrid(base64Image, uri, mimeType);

      // Map result to UI format
      const mapped = {
        disease: analysisResult.disease,
        severity: analysisResult.severity,
        confidence: `${analysisResult.confidence}%`,
        causes: analysisResult.treatment,
        remedies: analysisResult.prevention,
        imageUri: uri,
        timestamp: new Date().toISOString(),
      };
      setResult(mapped);
      await saveToHistory(mapped);
    } catch (e) {
      console.error("❌ Disease scan error", e);
      // Fallback to basic analysis
      const fallback = fallbackColorAnalysis();
      const mapped = {
        disease: fallback.disease,
        severity: fallback.severity,
        confidence: `${fallback.confidence}%`,
        causes: fallback.treatment,
        remedies: fallback.prevention,
        imageUri: selectedImage,
        timestamp: new Date().toISOString(),
      };
      setResult(mapped);
      await saveToHistory(mapped);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerTitle: "Scan Crop", headerBackTitle: "Home" }} />
      <FarmerHeader />
      <AiFab />
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + keyboardPadding + insets.bottom },
          ]}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconBg}>
                <Leaf size={28} color="#3BC47E" />
              </View>
              <Text style={styles.heroTitle}>AI Plant Doctor</Text>
              <Text style={styles.heroSubtitle}>Advanced Disease Detection</Text>
            </View>
          </View>
          <View style={{ flexDirection: isLandscape ? "row" : "column", gap: 16 }}>
            {/* Upload Area */}
            <View style={[styles.uploadCard, isLandscape && { flex: 1 }]}> 
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              ) : (
                <>
                  <View style={styles.iconContainer}>
                    <Camera size={48} color="#1A73E8" />
                  </View>
                  <Text style={styles.uploadTitle}>Capture or Upload</Text>
                  <Text style={styles.uploadSubtitle}>Position the affected leaf clearly. Good lighting helps accuracy.</Text>
                </>
              )}

              {/* Crop Overlay - Only show when no image selected */}
              {!selectedImage && (
                <View style={[styles.overlayContainer, isLandscape ? styles.overlayLandscape : styles.overlayPortrait]}>
                  <View style={styles.overlayFrame}>
                    <View style={styles.gridVertical}>
                      <View style={styles.gridCellV} />
                      <View style={[styles.gridCellV, styles.gridDividerV]} />
                      <View style={[styles.gridCellV, styles.gridDividerV]} />
                    </View>
                    <View style={styles.gridHorizontal}>
                      <View style={styles.gridCellH} />
                      <View style={[styles.gridCellH, styles.gridDividerH]} />
                      <View style={[styles.gridCellH, styles.gridDividerH]} />
                    </View>
                  </View>
                  <Text style={styles.overlayHint}>Place the affected area inside the frame</Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton} onPress={handleScan} disabled={analyzing}>
                  <Camera size={20} color="#fff" />
                  <Text style={styles.buttonText}>{analyzing ? "Analyzing..." : "Camera"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleScan} disabled={analyzing}>
                  <Upload size={20} color="#1A73E8" />
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Result Section */}
            {result && !analyzing && (
              <View style={[styles.resultContainer, isLandscape && { flex: 1 }]}> 
                <Text style={styles.sectionTitle}>Analysis Report</Text>
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <View style={styles.headerLeft}>
                      <Text style={styles.label}>Detected Disease</Text>
                      <TouchableOpacity onPress={() => setShowDiseaseInfo(true)} activeOpacity={0.7}>
                        <Text style={styles.diseaseName}>{result.disease}</Text>
                      </TouchableOpacity>
                      <Text style={styles.riskText}>{getRiskLabel(result.severity)}</Text>
                    </View>
                    <View style={[styles.severityBadge, result.severity === 'High' ? styles.bgRed : styles.bgYellow]}>
                      <AlertTriangle size={14} color={result.severity === 'High' ? "#991b1b" : "#854d0e"} />
                      <Text style={[styles.severityText, result.severity === 'High' ? styles.textRed : styles.textYellow]}>
                        {result.severity} Severity
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.section}>
                    <Text style={styles.subTitle}>Possible Causes</Text>
                    {result.causes.map((cause: string, index: number) => (
                      <View key={index} style={styles.listItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.listText}>{cause}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.section}>
                    <Text style={styles.subTitle}>Recommended Treatment</Text>
                    {result.remedies.map((remedy: string, index: number) => (
                      <View key={index} style={styles.listItem}>
                        <CheckCircle size={16} color="#16a34a" style={{ marginTop: 2 }} />
                        <Text style={styles.listText}>{remedy}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.smallActionButton, styles.shareButton]}
                      onPress={handleShareResult}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.smallActionText}>Share Result</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.smallActionButton, styles.reminderButton]}
                      onPress={handleSetReminder}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.smallActionText}>Set Reminder</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={styles.buyButton}
                    onPress={handleFindRemediesNearby}
                    activeOpacity={0.7}
                  >
                    <MapPin size={18} color="#fff" />
                    <Text style={styles.buyButtonText}>Find Remedies Nearby</Text>
                    <ExternalLink size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      {/* Disease Info Modal */}
      <Modal
        visible={showDiseaseInfo && !!result}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDiseaseInfo(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{result?.disease}</Text>
            <Text style={styles.modalRisk}>{getRiskLabel(result?.severity)}</Text>
            <Text style={styles.modalSectionTitle}>About this disease</Text>
            <Text style={styles.modalText}>
              This disease can impact yield and overall plant health. Follow the possible causes and
              recommended treatment carefully. For severe or spreading symptoms, consider consulting a
              local agricultural expert.
            </Text>
            <Text style={styles.modalSectionTitle}>Current severity</Text>
            <Text style={styles.modalText}>Severity reported as: {result?.severity}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDiseaseInfo(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  heroSection: {
    marginBottom: 28,
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
  },
  heroIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(59, 196, 126, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  uploadCard: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(26, 115, 232, 0.2)",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  overlayContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  overlayPortrait: { aspectRatio: 3/4 },
  overlayLandscape: { aspectRatio: 16/9 },
  overlayFrame: {
    flex: 1,
    width: "100%",
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: "dashed",
    borderColor: "#0ea5e9",
    backgroundColor: "#f8fafc",
    position: "relative",
    overflow: "hidden",
  },
  gridVertical: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
  },
  gridCellV: { flex: 1 },
  gridDividerV: { borderRightWidth: 1, borderColor: "#93c5fd" },
  gridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "column",
  },
  gridCellH: { flex: 1 },
  gridDividerH: { borderBottomWidth: 1, borderColor: "#93c5fd" },
  overlayHint: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "400",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#1A73E8",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    shadowColor: "#1A73E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "rgba(26, 115, 232, 0.1)",
    borderWidth: 1.5,
    borderColor: "#1A73E8",
  },
  secondaryButtonText: {
    color: "#1A73E8",
  },
  resultContainer: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 24,
    padding: 20,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#E85C5C",
    borderWidth: 1,
    borderColor: "rgba(232, 92, 92, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
  },
  riskText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
  },
  bgRed: { backgroundColor: "rgba(232, 92, 92, 0.1)", borderColor: "#E85C5C" },
  bgYellow: { backgroundColor: "rgba(251, 191, 36, 0.1)", borderColor: "#FBBF24" },
  textRed: { color: "#E85C5C" },
  textYellow: { color: "#D97706" },
  severityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  smallActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
  },
  shareButton: {
    backgroundColor: "rgba(26, 115, 232, 0.08)",
    borderColor: "#1A73E8",
  },
  reminderButton: {
    backgroundColor: "rgba(59, 196, 126, 0.08)",
    borderColor: "#3BC47E",
  },
  smallActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94a3b8",
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  buyButton: {
    backgroundColor: "#3BC47E",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    flexDirection: "row",
    gap: 10,
    shadowColor: "#3BC47E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  selectedImage: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    resizeMode: "cover",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  modalRisk: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginTop: 8,
    marginBottom: 4,
  },
  modalText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: "#1A73E8",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#1A73E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
