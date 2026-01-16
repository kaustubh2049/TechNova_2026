import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { UserCog, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UserType = "farmer" | "analyst";

export default function SelectUserType() {
  const selectUserType = (type: UserType) => {
    router.push({
      pathname: "/signup",
      params: { userType: type },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>
            Choose how you want to use the app
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => selectUserType("farmer")}
            >
              <View style={styles.iconContainer}>
                <User size={40} color="#3b5998" />
              </View>
              <Text style={styles.buttonText}>I'm a Farmer</Text>
              <Text style={styles.buttonSubtext}>
                Access farming tools and resources
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => selectUserType("analyst")}
            >
              <View style={styles.iconContainer}>
                <UserCog size={40} color="#3b5998" />
              </View>
              <Text style={styles.buttonText}>I'm an Analyst</Text>
              <Text style={styles.buttonSubtext}>
                Access analytics and data tools
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonsContainer: {
    gap: 20,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59, 89, 152, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3b5998",
    marginBottom: 5,
  },
  buttonSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
