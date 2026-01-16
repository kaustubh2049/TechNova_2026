import { useAuth, UserType } from "@/providers/auth-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
        colors={["#f0f9ff", "#e0f2fe", "#0891b2"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/icon.jpg")}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  marginBottom: 8,
                }}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>JAL NIVIKARAN</Text>
              <Text style={styles.tagline}>जल संरक्षण, जीवन का आधार</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Welcome Back</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signupLink}
                onPress={() => router.push("/signup")}
              >
                <Text style={styles.signupText}>
                  Don&apos;t have an account?{" "}
                  <Text style={styles.signupTextBold}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mapIcon: {
    marginLeft: -8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#f8fafc",
  },
  loginButton: {
    backgroundColor: "#0891b2",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  signupLink: {
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#64748b",
  },
  signupTextBold: {
    color: "#0891b2",
    fontWeight: "600",
  },
});
