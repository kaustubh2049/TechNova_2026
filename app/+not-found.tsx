import { Link, Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";

export default function NotFoundScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is logged in, redirect to appropriate screen
    if (user) {
      if (user.userType === "farmer") {
        router.replace("/farmer");
      } else {
        // For analysts, redirect to the home tab
        router.replace("/(tabs)/home");
      }
    }
  }, [user, router]);

  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>
          The page you're looking for doesn't exist.
        </Text>

        <View style={styles.buttonContainer}>
          {user ? (
            // If user is logged in, show a button to go to their dashboard
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (user.userType === "farmer") {
                  router.replace("/farmer");
                } else {
                  router.replace("/(tabs)/home");
                }
              }}
            >
              <Text style={styles.buttonText}>
                Go to {user.userType === "farmer" ? "Farmer" : "Analyst"}{" "}
                Dashboard
              </Text>
            </TouchableOpacity>
          ) : (
            // If user is not logged in, show login/signup options
            <>
              <Link href="/login" style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
              </Link>
              <Link
                href="/select-user-type"
                style={[styles.button, styles.secondaryButton]}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Create Account
                </Text>
              </Link>
            </>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  secondaryButtonText: {
    color: "#2196F3",
  },
});
