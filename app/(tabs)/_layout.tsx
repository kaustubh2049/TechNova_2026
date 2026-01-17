import { Tabs } from "expo-router";
import { ChartBar, Layers, LayoutDashboard, MapPin } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3F9AAE", // Ocean blue
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.05)",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 20,
          height: 70,
          position: "relative",
          marginBottom: 0,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 4,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => <ChartBar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="predictions"
        options={{
          title: "Stations",
          tabBarIcon: ({ color, size }) => <Layers size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => <MapPin size={22} color={color} />,
        }}
      />
      
      {/* Hidden tabs - keeping functionality but not showing in nav */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar - accessible via avatar click
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}