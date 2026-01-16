import { Station } from "@/providers/stations-provider";
import { Droplets } from "lucide-react-native";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

interface RechargeTabProps {
  station: Station;
}

export function RechargeTab({ station }: RechargeTabProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 120;
  const chartHeight = 120;

  const maxRecharge = Math.max(...station.rechargeData.map((d) => d.amount), 1);
  const totalRecharge = station.rechargeData.reduce(
    (sum, d) => sum + d.amount,
    0
  );
  const avgRecharge = totalRecharge / Math.max(station.rechargeData.length, 1);

  // Calculate water level changes for demonstration
  const waterLevelChanges =
    station.recentReadings.length >= 2
      ? station.recentReadings
          .slice(1)
          .map((reading, index) => {
            const prevReading = station.recentReadings[index];
            return {
              date: reading.timestamp.split("T")[0],
              deltaH: reading.level - prevReading.level,
              calculated:
                station.specificYield *
                Math.max(0, reading.level - prevReading.level) *
                1000,
            };
          })
          .filter((change) => change.deltaH > 0)
      : [];

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Droplets size={24} color="#0891b2" />
          <Text style={styles.summaryTitle}>Recharge Summary</Text>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total (5 days)</Text>
            <Text style={styles.summaryValue}>
              {totalRecharge.toFixed(1)} mm
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average</Text>
            <Text style={styles.summaryValue}>{avgRecharge.toFixed(1)} mm</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Peak Day</Text>
            <Text style={styles.summaryValue}>{maxRecharge.toFixed(1)} mm</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Daily Recharge (mm)</Text>
        <Svg width={chartWidth} height={chartHeight + 40} style={styles.chart}>
          {station.rechargeData.map((item, index) => {
            const barWidth =
              (chartWidth - 40) / station.rechargeData.length - 8;
            const barHeight =
              (item.amount / Math.max(maxRecharge, 1)) * chartHeight;
            const x = 20 + index * (barWidth + 8);
            const y = chartHeight - barHeight;

            return (
              <React.Fragment key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#0891b2"
                  rx={2}
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 15}
                  fontSize={10}
                  fill="#64748b"
                  textAnchor="middle"
                >
                  {new Date(item.date).getDate()}
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize={9}
                  fill="#1e293b"
                  textAnchor="middle"
                >
                  {item.amount.toFixed(1)}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <View style={styles.methodCard}>
        <Text style={styles.methodTitle}>Calculation Method</Text>
        <Text style={styles.methodText}>
          Recharge is calculated using the Water Table Fluctuation (WTF) method:
        </Text>
        <Text style={styles.methodFormula}>R = Sy × ΔH</Text>
        <View style={styles.methodParams}>
          <Text style={styles.methodParam}>R = Groundwater recharge (mm)</Text>
          <Text style={styles.methodParam}>
            Sy = Specific yield ({station.specificYield})
          </Text>
          <Text style={styles.methodParam}>ΔH = Water level rise (m)</Text>
        </View>

        {waterLevelChanges.length > 0 && (
          <View style={styles.calculationDetails}>
            <Text style={styles.calculationTitle}>Recent Calculations:</Text>
            {waterLevelChanges.slice(0, 3).map((change, index) => (
              <View key={index} style={styles.calculationRow}>
                <Text style={styles.calculationText}>
                  {change.date}: ΔH = {change.deltaH.toFixed(3)}m
                </Text>
                <Text style={styles.calculationResult}>
                  R = {station.specificYield} × {change.deltaH.toFixed(3)} ={" "}
                  {change.calculated.toFixed(1)} mm
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0891b2",
  },
  chartCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  chart: {
    alignSelf: "center",
  },
  methodCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  methodText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 16,
  },
  methodFormula: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0891b2",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "monospace",
  },
  methodParams: {
    gap: 4,
  },
  methodParam: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "monospace",
  },
  calculationDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  calculationTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  calculationRow: {
    marginBottom: 6,
  },
  calculationText: {
    fontSize: 10,
    color: "#64748b",
    fontFamily: "monospace",
  },
  calculationResult: {
    fontSize: 10,
    color: "#0891b2",
    fontFamily: "monospace",
    fontWeight: "600",
  },
});
