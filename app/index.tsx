import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type OnboardingSlide = {
  id: string;
  title: string;
  titleHighlight?: string;
  description: string;
  type: "problem" | "solution" | "impact" | "role";
};

const slides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Groundwater is disappearing —",
    titleHighlight: "silently.",
    description:
      "Most monitoring systems rely on data that is months old. In a rapidly changing climate, yesterday's measurements aren't enough to protect tomorrow's resources.",
    type: "problem",
  },
  {
    id: "2",
    title: "Real-Time",
    titleHighlight: "Groundwater Intelligence",
    description: "Make data-driven decisions with live field insights.",
    type: "solution",
  },
  {
    id: "3",
    title: "From Data to",
    titleHighlight: "Action",
    description:
      "Our system translates complex hydrological parameters into three distinct action zones for instant decision making.",
    type: "impact",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Navigate to login after last slide
      router.replace("/login");
    }
  };

  const handleSkip = () => {
    router.replace("/login");
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    if (item.type === "problem") {
      return <ProblemSlide item={item} />;
    } else if (item.type === "solution") {
      return <SolutionSlide item={item} />;
    } else {
      return <ImpactSlide item={item} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#f9fafa", "#f5f5f5"]} style={styles.gradient}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
        />

        {/* Footer */}
        <View style={styles.footer}>
          {/* Page Indicators */}
          <View style={styles.indicatorContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex
                    ? styles.indicatorActive
                    : styles.indicatorInactive,
                ]}
              />
            ))}
          </View>

          {/* Next/Get Started Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Problem Awareness Slide
function ProblemSlide({ item }: { item: OnboardingSlide }) {
  return (
    <View style={styles.slide}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <View style={styles.gridPattern} />
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
          }}
          style={styles.waterImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(249, 250, 250, 0.9)", "#f9fafa"]}
          style={styles.imageGradient}
        />
        <View style={styles.criticalBadge}>
          <Ionicons name="warning" size={14} color="#ef4444" />
          <Text style={styles.criticalText}>DEPTH: CRITICAL</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          {item.title}{" "}
          <Text style={styles.titleHighlight}>{item.titleHighlight}</Text>
        </Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

// Solution Introduction Slide
function SolutionSlide({ item }: { item: OnboardingSlide }) {
  return (
    <View style={styles.slide}>
      {/* Visual Container with Map */}
      <View style={styles.solutionVisual}>
        <View style={styles.mapContainer}>
          {/* Animated Pins */}
          <View style={[styles.pin, { top: "30%", left: "40%" }]}>
            <View style={styles.pinDot} />
            <View style={[styles.pinRipple, { animationDelay: "0s" }]} />
          </View>
          <View style={[styles.pin, { top: "50%", left: "65%" }]}>
            <View style={styles.pinDot} />
            <View style={[styles.pinRipple, { animationDelay: "0.5s" }]} />
          </View>
          <View style={[styles.pin, { top: "45%", left: "25%" }]}>
            <View style={styles.pinDot} />
            <View style={[styles.pinRipple, { animationDelay: "1s" }]} />
          </View>

          {/* Analytics Card */}
          <View style={styles.analyticsCard}>
            <View style={styles.analyticsHeader}>
              <Text style={styles.analyticsLabel}>WATER LEVEL TREND</Text>
              <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={12} color="#00a388" />
                <Text style={styles.trendText}>+2.4%</Text>
              </View>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="analytics" size={40} color="#00a388" opacity={0.3} />
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          {item.title}{" "}
          <Text style={styles.titleHighlightGreen}>{item.titleHighlight}</Text>
        </Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Features */}
        <View style={styles.featuresList}>
          <FeatureItem
            icon="sensors"
            title="Live Monitoring"
            description="Track water levels and quality metrics as they happen in the field."
          />
          <FeatureItem
            icon="show-chart"
            title="Historical Trends"
            description="Analyze seasonal patterns and long-term aquifer behaviors easily."
          />
          <FeatureItem
            icon="notifications"
            title="Early Warnings"
            description="Get instant alerts before critical thresholds are breached."
          />
        </View>
      </View>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={24} color="#00a388" />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Impact and Trust Slide
function ImpactSlide({ item }: { item: OnboardingSlide }) {
  return (
    <View style={styles.slide}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {item.title}{" "}
          <Text style={styles.titleHighlightBlue}>{item.titleHighlight}</Text>
        </Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <View style={styles.trustIcon}>
            <Ionicons name="shield-checkmark" size={18} color="#1c4b59" />
          </View>
          <View>
            <Text style={styles.trustLabel}>CONFIDENCE SCORE</Text>
            <Text style={styles.trustValue}>99.8% Verified Accuracy</Text>
          </View>
        </View>

        {/* Action Zones */}
        <View style={styles.zonesContainer}>
          <ZoneCard
            color="#10b981"
            icon="water-outline"
            title="Safe Zone"
            description="Sustainable water levels. No immediate intervention required."
            level="LEVEL > 20m • PH 6.5-8.5"
          />
          <ZoneCard
            color="#f59e0b"
            icon="warning-outline"
            title="Semi-Critical"
            description="Declining levels detected. Monitor usage closely."
            level="LEVEL 10-20m • TDS > 500"
          />
          <ZoneCard
            color="#ef4444"
            icon="alert-circle-outline"
            title="Critical"
            description="Resource depletion imminent. Immediate action required."
            level="LEVEL < 10m • SALINITY HIGH"
          />
        </View>
      </View>
    </View>
  );
}

function ZoneCard({
  color,
  icon,
  title,
  description,
  level,
}: {
  color: string;
  icon: string;
  title: string;
  description: string;
  level: string;
}) {
  return (
    <View style={styles.zoneCard}>
      <View style={[styles.zoneIndicator, { backgroundColor: color }]} />
      <View style={styles.zoneContent}>
        <View style={styles.zoneHeader}>
          <View style={styles.zoneStatus}>
            <View style={[styles.zoneDot, { backgroundColor: color }]} />
            <Text style={styles.zoneTitle}>{title}</Text>
          </View>
          <View style={[styles.zoneIconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
        </View>
        <Text style={styles.zoneDescription}>{description}</Text>
        <Text style={styles.zoneLevel}>{level}</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafa",
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#006b6b",
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  // Problem Slide
  heroContainer: {
    width: "100%",
    aspectRatio: 4 / 5,
    marginTop: 80,
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    position: "relative",
  },
  gridPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: "#006b6b",
  },
  waterImage: {
    width: "100%",
    height: "70%",
    position: "absolute",
    bottom: 0,
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  criticalBadge: {
    position: "absolute",
    bottom: 24,
    left: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  criticalText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    fontFamily: "monospace",
  },

  // Solution Slide
  solutionVisual: {
    width: "100%",
    aspectRatio: 4 / 3,
    marginTop: 80,
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  pin: {
    position: "absolute",
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00a388",
    zIndex: 10,
  },
  pinRipple: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#66E0D7",
    opacity: 0.6,
  },
  analyticsCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 12,
  },
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  analyticsLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00a38815",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00a388",
  },
  chartPlaceholder: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#121617",
    lineHeight: 36,
    marginBottom: 16,
  },
  titleHighlight: {
    color: "#006b6b",
  },
  titleHighlightGreen: {
    color: "#00a388",
  },
  titleHighlightBlue: {
    color: "#1c4b59",
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
    marginBottom: 24,
  },

  // Features
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#00a38815",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121617",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },

  // Impact Slide
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1c4b5915",
    alignItems: "center",
    justifyContent: "center",
  },
  trustLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  trustValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c4b59",
  },
  zonesContainer: {
    gap: 16,
  },
  zoneCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
  },
  zoneIndicator: {
    width: 6,
  },
  zoneContent: {
    flex: 1,
    padding: 16,
  },
  zoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  zoneStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121617",
  },
  zoneIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 12,
  },
  zoneLevel: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#94a3b8",
  },

  // Role Slide
  roleCards: {
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#13526c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  roleCardSelected: {
    backgroundColor: "#f0fdfc",
    borderColor: "#3BCDC7",
    borderWidth: 2,
  },
  roleCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F0F5F8",
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconContainerSelected: {
    backgroundColor: "#e0f7f6",
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121617",
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: "#64748b",
  },
  roleRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  roleRadioSelected: {
    backgroundColor: "#3BCDC7",
    borderColor: "#3BCDC7",
  },
  quoteContainer: {
    marginBottom: 24,
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: "#13526c",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  getStartedButtonDisabled: {
    opacity: 0.5,
  },
  getStartedButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: "#006b6b",
  },
  indicatorInactive: {
    width: 6,
    backgroundColor: "#cbd5e1",
  },
  nextButton: {
    backgroundColor: "#006b6b",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});