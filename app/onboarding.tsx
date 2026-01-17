import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RoleType = "planner" | "researcher";

export default function OnboardingScreen() {
    const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
    const [currentStep] = useState(3); // Step 4 (0-indexed as 3)
    const totalSteps = 5;

    const handleGetStarted = () => {
        if (selectedRole) {
            // Navigate to signup with selected role
            router.push("/signup");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#fafafa", "#f5f5f5"]}
                style={styles.gradient}
            >
                {/* Page Indicators */}
                <View style={styles.indicatorContainer}>
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === currentStep && styles.indicatorActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Headline */}
                    <View style={styles.headlineContainer}>
                        <Text style={styles.headline}>Who are you?</Text>
                        <Text style={styles.subheadline}>
                            Select your primary role to customize your dashboard experience.
                        </Text>
                    </View>

                    {/* Role Cards */}
                    <View style={styles.cardsContainer}>
                        {/* Water Resource Planner Card */}
                        <TouchableOpacity
                            style={[
                                styles.card,
                                selectedRole === "planner" && styles.cardSelected,
                            ]}
                            onPress={() => setSelectedRole("planner")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardContent}>
                                {/* Icon Container */}
                                <View
                                    style={[
                                        styles.iconContainer,
                                        selectedRole === "planner" && styles.iconContainerSelected,
                                    ]}
                                >
                                    <View style={styles.iconPattern} />
                                    <View style={styles.iconWrapper}>
                                        <Ionicons
                                            name="map"
                                            size={48}
                                            color={selectedRole === "planner" ? "#13526c" : "#13526c"}
                                        />
                                        <View style={styles.iconBadge}>
                                            <Ionicons name="warning" size={16} color="#ff9500" />
                                        </View>
                                    </View>
                                </View>

                                {/* Text Content */}
                                <View style={styles.textContent}>
                                    <Text style={styles.cardTitle}>Water Resource Planner</Text>
                                    <Text style={styles.cardDescription}>
                                        Plan and manage water resources effectively.
                                    </Text>
                                </View>

                                {/* Radio Button */}
                                <View style={styles.radioContainer}>
                                    <View
                                        style={[
                                            styles.radioButton,
                                            selectedRole === "planner" && styles.radioButtonSelected,
                                        ]}
                                    >
                                        {selectedRole === "planner" && (
                                            <Ionicons name="checkmark" size={14} color="#fff" />
                                        )}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Groundwater Researcher Card */}
                        <TouchableOpacity
                            style={[
                                styles.card,
                                selectedRole === "researcher" && styles.cardSelected,
                            ]}
                            onPress={() => setSelectedRole("researcher")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardContent}>
                                {/* Icon Container */}
                                <View
                                    style={[
                                        styles.iconContainer,
                                        selectedRole === "researcher" && styles.iconContainerSelectedResearcher,
                                    ]}
                                >
                                    {selectedRole === "researcher" && (
                                        <View style={styles.glowCircle} />
                                    )}
                                    <View style={styles.iconWrapper}>
                                        <Ionicons
                                            name="analytics"
                                            size={48}
                                            color={selectedRole === "researcher" ? "#13526c" : "#13526c"}
                                        />
                                        <View style={styles.iconBadgeResearcher}>
                                            <Ionicons name="server" size={16} color="#13526c" />
                                        </View>
                                    </View>
                                </View>

                                {/* Text Content */}
                                <View style={styles.textContent}>
                                    <Text style={[
                                        styles.cardTitle,
                                        selectedRole === "researcher" && styles.cardTitleSelected
                                    ]}>
                                        Groundwater Researcher
                                    </Text>
                                    <Text style={[
                                        styles.cardDescription,
                                        selectedRole === "researcher" && styles.cardDescriptionSelected
                                    ]}>
                                        Analyze data and track groundwater trends.
                                    </Text>
                                </View>

                                {/* Radio Button */}
                                <View style={styles.radioContainer}>
                                    <View
                                        style={[
                                            styles.radioButton,
                                            selectedRole === "researcher" && styles.radioButtonSelected,
                                        ]}
                                    >
                                        {selectedRole === "researcher" && (
                                            <Ionicons name="checkmark" size={14} color="#fff" />
                                        )}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.spacer} />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.quoteContainer}>
                        <Text style={styles.quote}>
                            "Turning groundwater data into decisions that protect the future."
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.getStartedButton,
                            !selectedRole && styles.getStartedButtonDisabled,
                        ]}
                        onPress={handleGetStarted}
                        disabled={!selectedRole}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.getStartedButtonText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.safeAreaPadding} />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fafafa",
    },
    gradient: {
        flex: 1,
    },

    // Page Indicators
    indicatorContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 24,
        paddingHorizontal: 24,
    },
    indicator: {
        height: 6,
        width: 32,
        borderRadius: 3,
        backgroundColor: "#dce2e5",
    },
    indicatorActive: {
        backgroundColor: "#13526c",
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },

    // Headline
    headlineContainer: {
        marginBottom: 32,
    },
    headline: {
        fontSize: 36,
        fontWeight: "700",
        color: "#13526c",
        lineHeight: 40,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subheadline: {
        fontSize: 16,
        color: "#64748b",
        lineHeight: 24,
    },

    // Cards
    cardsContainer: {
        gap: 20,
    },
    card: {
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
    cardSelected: {
        backgroundColor: "#f0fdfc",
        borderColor: "#3BCDC7",
        borderWidth: 2,
        shadowColor: "#3BCDC7",
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
        transform: [{ scale: 1.02 }],
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "stretch",
        height: 128,
    },

    // Icon Container
    iconContainer: {
        width: 112,
        backgroundColor: "#F0F5F8",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
    },
    iconContainerSelected: {
        backgroundColor: "#F0F5F8",
    },
    iconContainerSelectedResearcher: {
        backgroundColor: "#e0f7f6",
    },
    iconPattern: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundColor: "#13526c",
    },
    glowCircle: {
        position: "absolute",
        bottom: -16,
        left: -16,
        width: 80,
        height: 80,
        backgroundColor: "#3BCDC7",
        opacity: 0.2,
        borderRadius: 40,
    },
    iconWrapper: {
        position: "relative",
        zIndex: 10,
    },
    iconBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 2,
        borderWidth: 2,
        borderColor: "#fff",
    },
    iconBadgeResearcher: {
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    // Text Content
    textContent: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#121617",
        lineHeight: 22,
        marginBottom: 4,
    },
    cardTitleSelected: {
        color: "#13526c",
    },
    cardDescription: {
        fontSize: 14,
        color: "#64748b",
        lineHeight: 20,
    },
    cardDescriptionSelected: {
        color: "#475569",
    },

    // Radio Button
    radioContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingRight: 16,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#cbd5e1",
        alignItems: "center",
        justifyContent: "center",
    },
    radioButtonSelected: {
        backgroundColor: "#3BCDC7",
        borderColor: "#3BCDC7",
    },

    // Spacer
    spacer: {
        height: 32,
    },

    // Footer
    footer: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 24,
        backgroundColor: "#fafafa",
    },
    quoteContainer: {
        marginBottom: 24,
        paddingHorizontal: 16,
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
        shadowColor: "#13526c",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    getStartedButtonDisabled: {
        opacity: 0.5,
    },
    getStartedButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    safeAreaPadding: {
        height: 16,
    },
});