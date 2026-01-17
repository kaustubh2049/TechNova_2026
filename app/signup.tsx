import { useAuth } from "@/providers/auth-provider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UserType = "farmer" | "analyst";
type RoleType = "planner" | "researcher";

export default function SignupScreen() {
  const params = useLocalSearchParams<{ userType?: UserType }>();
  const userType: UserType = params.userType || "analyst"; // Default to analyst
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("planner");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signup } = useAuth();

  // No need to redirect if userType is missing since we have a default

  const handleSignup = async () => {
    if (!name || !email || !organization || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup(
        email,
        password,
        name,
        organization,
        userType
      );
      if (result?.needsVerification) {
        Alert.alert(
          "Verify your email",
          "We sent you a confirmation link. Please verify, then sign in."
        );
        router.replace({
          pathname: "/verify-email",
          params: { userType },
        });
        return;
      }
      // Redirect to the appropriate dashboard based on user type
      if (userType === "farmer") {
        router.replace("/farmer");
      } else {
        // For analysts, redirect to the home tab
        router.replace("/(tabs)/home");
      }
    } catch (e: any) {
      const message = e?.message || "Please try again";
      Alert.alert("Signup Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#f9fafb", "#e0f2fe", "#bae6fd"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header / Branding */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="water" size={36} color="#0b3b5b" />
              </View>
              <Text style={styles.headerTitle}>Create Your Account</Text>
              <Text style={styles.headerSubtitle}>JOIN THE GROUNDWATER NETWORK</Text>

              {/* Login Link Button */}
              <TouchableOpacity
                style={styles.loginHeaderButton}
                onPress={() => router.push("/login")}
                activeOpacity={0.7}
              >
                <Text style={styles.loginHeaderButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Main Card */}
            <View style={styles.card}>
              {/* Role Selection */}
              <View style={styles.roleSection}>
                <Text style={styles.sectionTitle}>Select your role</Text>

                {/* Water Resource Planner */}
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === "planner" && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole("planner")}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleContent}>
                    <View
                      style={[
                        styles.roleIcon,
                        selectedRole === "planner" && styles.roleIconSelected,
                      ]}
                    >
                      <Ionicons
                        name="map"
                        size={20}
                        color={selectedRole === "planner" ? "#fff" : "#64748b"}
                      />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text
                        style={[
                          styles.roleTitle,
                          selectedRole === "planner" && styles.roleTitleSelected,
                        ]}
                      >
                        Water Resource Planner
                      </Text>
                      <Text style={styles.roleDescription}>
                        Strategic resource management
                      </Text>
                    </View>
                  </View>
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
                </TouchableOpacity>

                {/* Groundwater Researcher */}
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === "researcher" && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole("researcher")}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleContent}>
                    <View
                      style={[
                        styles.roleIcon,
                        selectedRole === "researcher" && styles.roleIconSelected,
                      ]}
                    >
                      <Ionicons
                        name="flask"
                        size={20}
                        color={selectedRole === "researcher" ? "#fff" : "#64748b"}
                      />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text
                        style={[
                          styles.roleTitle,
                          selectedRole === "researcher" && styles.roleTitleSelected,
                        ]}
                      >
                        Groundwater Researcher
                      </Text>
                      <Text style={styles.roleDescription}>
                        Data analysis and field study
                      </Text>
                    </View>
                  </View>
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
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Form Fields */}
              <View style={styles.formSection}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#94a3b8"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#94a3b8"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Organization */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Organization</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your organization"
                      placeholderTextColor="#94a3b8"
                      value={organization}
                      onChangeText={setOrganization}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Create a password"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoComplete="password"
                    />
                  </View>
                </View>

                {/* Create Account Button */}
                <TouchableOpacity
                  style={[
                    styles.signupButton,
                    isLoading && styles.signupButtonDisabled,
                  ]}
                  onPress={handleSignup}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signupButtonText}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>

                {/* Login Link */}
                <TouchableOpacity
                  style={styles.loginLink}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                    <Text style={styles.loginTextBold}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#94a3b8" />
                <Text style={styles.securityText}>SECURE REGISTRATION</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  // Header Styles
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(11, 59, 91, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#0b3b5b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0b3b5b",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  loginHeaderButton: {
    position: "absolute",
    top: 16,
    right: 20,
    backgroundColor: "#0b3b5b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#0b3b5b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginHeaderButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Card Styles
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },

  // Role Selection Styles
  roleSection: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0b3b5b",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  roleButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButtonSelected: {
    backgroundColor: "rgba(11, 59, 91, 0.05)",
    borderColor: "#0b3b5b",
    borderWidth: 2,
  },
  roleContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  roleIconSelected: {
    backgroundColor: "#0b3b5b",
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  roleTitleSelected: {
    color: "#0b3b5b",
    fontWeight: "700",
  },
  roleDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioButtonSelected: {
    backgroundColor: "#0b3b5b",
    borderColor: "#0b3b5b",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },

  // Form Styles
  formSection: {
    padding: 20,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0b3b5b",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e293b",
  },
  passwordInput: {
    paddingRight: 40,
  },

  // Signup Button
  signupButton: {
    backgroundColor: "#0b3b5b",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#0b3b5b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },

  // Login Link
  loginLink: {
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#64748b",
  },
  loginTextBold: {
    color: "#0b3b5b",
    fontWeight: "600",
  },

  // Footer Styles
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.5,
  },
  securityText: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    letterSpacing: 1.2,
    marginLeft: 6,
  },
});
