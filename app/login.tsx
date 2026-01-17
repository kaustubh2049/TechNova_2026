import { useAuth } from "@/providers/auth-provider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

type RoleType = "planner" | "researcher";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, user } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // The auth provider will update the user state, which we'll use to redirect
    } catch (e: any) {
      const message = e?.message || "Invalid credentials";
      if (message.toLowerCase().includes("confirm")) {
        Alert.alert(
          "Email not confirmed",
          "Please verify your email, then sign in."
        );
        router.replace("/verify-email");
        setIsLoading(false);
        return;
      }
      Alert.alert("Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to the appropriate dashboard based on user type
  React.useEffect(() => {
    if (user) {
      const userType = user.userType || "analyst";
      if (userType === "farmer") {
        router.replace("/farmer");
      } else {
        // For analysts, redirect to the home tab
        router.replace("/(tabs)/home");
      }
    }
  }, [user, router]);

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
              <Text style={styles.headerTitle}>Groundwater Evaluation System</Text>
              <Text style={styles.headerSubtitle}>GOVERNMENT SECURE ACCESS</Text>

              {/* Signup Button */}
              <TouchableOpacity
                style={styles.signupHeaderButton}
                onPress={() => router.push("/signup")}
                activeOpacity={0.7}
              >
                <Text style={styles.signupHeaderButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Main Card */}
            <View style={styles.card}>


              {/* Login Form Section */}
              <View style={styles.formSection}>
                {/* Government ID */}
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
                      autoComplete="off"
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
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isLoading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? "Signing In..." : "Secure Login"}
                  </Text>
                  <Ionicons name="log-in-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Trouble logging in?{" "}
                <Text style={styles.footerLink}>Contact IT Support</Text>
              </Text>
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#94a3b8" />
                <Text style={styles.securityText}>AUTHORIZED PERSONNEL ONLY</Text>
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
  signupHeaderButton: {
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
  signupHeaderButtonText: {
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
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0b3b5b",
  },

  // Login Button
  loginButton: {
    backgroundColor: "#0b3b5b",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#0b3b5b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },

  // Footer Styles
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
  },
  footerLink: {
    color: "#0b3b5b",
    fontWeight: "700",
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
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
