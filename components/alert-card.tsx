import { Alert } from "@/providers/stations-provider";
import { AlertTriangle, Bell, Info } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case "critical":
        return <AlertTriangle size={20} color="#dc2626" />;
      case "warning":
        return <Bell size={20} color="#ea580c" />;
      case "info":
        return <Info size={20} color="#0891b2" />;
      default:
        return <Info size={20} color="#64748b" />;
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case "critical":
        return "#fef2f2";
      case "warning":
        return "#fff7ed";
      case "info":
        return "#f0f9ff";
      default:
        return "#f8fafc";
    }
  };

  const getBorderColor = () => {
    switch (alert.type) {
      case "critical":
        return "#fecaca";
      case "warning":
        return "#fed7aa";
      case "info":
        return "#bae6fd";
      default:
        return "#e2e8f0";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity style={styles.container}>
      <View style={[
        styles.card,
        { 
          backgroundColor: getAlertColor(),
          borderColor: getBorderColor(),
        }
      ]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {getAlertIcon()}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.stationName}>{alert.stationName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(alert.timestamp)}</Text>
          </View>
          {!alert.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{alert.title}</Text>
          <Text style={styles.message}>{alert.message}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  timestamp: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0891b2",
  },
  content: {
    paddingLeft: 52,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
});