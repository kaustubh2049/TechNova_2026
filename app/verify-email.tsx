import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyEmailScreen() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resend = async () => {
    if (!email) {
      Alert.alert("Enter email", "Please enter the email you used to sign up.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      Alert.alert("Email sent", "Check your inbox for the confirmation link.");
    } catch (e: any) {
      Alert.alert("Failed to resend", e?.message || "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We sent a confirmation link to your email. Click it to activate your account.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.button} onPress={resend} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? "Sending..." : "Resend confirmation email"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.backToLogin}>Back to sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f8fafc" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#475569", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: "#f8fafc", marginBottom: 12 },
  button: { backgroundColor: "#0891b2", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 8 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  backToLogin: { textAlign: "center", color: "#0891b2", marginTop: 8 },
});


