/**
 * Rate of Change Chart (First Derivative)
 * Shows how fast groundwater is changing over time
 * Critical for identifying rapid depletion or recharge events
 */

import { RateOfChangeData } from "@/services/advanced-analytics-service";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

interface RateOfChangeChartProps {
  data: RateOfChangeData[];
}

export function RateOfChangeChart({ data }: RateOfChangeChartProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 80;
  const chartHeight = 240;
  const padding = { top: 20, right: 20, bottom: 50, left: 60 };

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No rate of change data available</Text>
      </View>
    );
  }

  // Find range for Y-axis
  const maxRate = Math.max(...data.map((d) => d.changeRate));
  const minRate = Math.min(...data.map((d) => d.changeRate));
  const rateRange = Math.max(maxRate - minRate, 0.1);

  // Scale functions
  const getX = (index: number) =>
    padding.left +
    (index / Math.max(data.length - 1, 1)) *
      (chartWidth - padding.left - padding.right);

  const getY = (rate: number) =>
    padding.top + chartHeight - ((rate - minRate) / rateRange) * chartHeight;

  // Zero line position
  const zeroY = getY(0);

  // Y-axis labels
  const yAxisSteps = 6;
  const yLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = minRate + (rateRange * i) / yAxisSteps;
    return value.toFixed(3);
  });

  // Sample X-axis labels (show every nth point to avoid crowding)
  const labelInterval = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data.filter((_, i) => i % labelInterval === 0);

  // Create bar path
  const bars = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.changeRate);
    const barWidth =
      ((chartWidth - padding.left - padding.right) / data.length) * 0.7;

    const isPositive = point.changeRate > 0;
    const barHeight = Math.abs(y - zeroY);
    const barY = isPositive ? y : zeroY;

    return {
      x: x - barWidth / 2,
      y: barY,
      width: barWidth,
      height: barHeight,
      color: isPositive ? "#10b981" : "#ef4444",
      value: point.changeRate,
      label: point.month,
    };
  });

  // Calculate statistics
  const avgRate = data.reduce((sum, d) => sum + d.changeRate, 0) / data.length;
  const positiveMonths = data.filter((d) => d.changeRate > 0).length;
  const negativeMonths = data.filter((d) => d.changeRate < 0).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate of Change Analysis</Text>
      <Text style={styles.subtitle}>
        Groundwater depletion/recharge velocity (m/month)
      </Text>

      {/* Statistics */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{avgRate.toFixed(3)}</Text>
          <Text style={styles.statLabel}>Avg Rate</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#f0fdf4" }]}>
          <Text style={[styles.statValue, { color: "#10b981" }]}>
            {positiveMonths}
          </Text>
          <Text style={styles.statLabel}>Recharge</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#fef2f2" }]}>
          <Text style={[styles.statValue, { color: "#ef4444" }]}>
            {negativeMonths}
          </Text>
          <Text style={styles.statLabel}>Depletion</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Svg
          width={chartWidth}
          height={chartHeight + padding.top + padding.bottom}
        >
          {/* Grid lines */}
          {yLabels.map((label, i) => {
            const y = getY(parseFloat(label));
            const isZeroLine = Math.abs(parseFloat(label)) < 0.001;

            return (
              <React.Fragment key={`grid-${i}`}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={isZeroLine ? "#94a3b8" : "#e5e7eb"}
                  strokeWidth={isZeroLine ? 2 : 1}
                />
                <SvgText
                  x={padding.left - 10}
                  y={y + 4}
                  fontSize={10}
                  fill={isZeroLine ? "#1e293b" : "#64748b"}
                  textAnchor="end"
                  fontWeight={isZeroLine ? "600" : "400"}
                >
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Y-axis */}
          <Line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight + padding.top}
            stroke="#94a3b8"
            strokeWidth={2}
          />

          {/* X-axis */}
          <Line
            x1={padding.left}
            y1={chartHeight + padding.top}
            x2={chartWidth - padding.right}
            y2={chartHeight + padding.top}
            stroke="#94a3b8"
            strokeWidth={2}
          />

          {/* Bars */}
          {bars.map((bar, index) => (
            <Rect
              key={index}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              opacity={0.8}
            />
          ))}

          {/* X-axis labels */}
          {xLabels.map((point, i) => {
            const index = data.indexOf(point);
            const x = getX(index);
            return (
              <SvgText
                key={`x-label-${i}`}
                x={x}
                y={chartHeight + padding.top + 20}
                fontSize={9}
                fill="#64748b"
                textAnchor="middle"
                transform={`rotate(-45, ${x}, ${chartHeight + padding.top + 20})`}
              >
                {point.month}
              </SvgText>
            );
          })}

          {/* Axis titles */}
          <SvgText
            x={(chartWidth + padding.left - padding.right) / 2}
            y={chartHeight + padding.top + 45}
            fontSize={11}
            fill="#475569"
            textAnchor="middle"
            fontWeight="600"
          >
            Time Period
          </SvgText>

          <SvgText
            x={15}
            y={chartHeight / 2 + padding.top}
            fontSize={11}
            fill="#475569"
            textAnchor="middle"
            fontWeight="600"
            transform={`rotate(-90, 15, ${chartHeight / 2 + padding.top})`}
          >
            Change Rate (m/month)
          </SvgText>
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>Recharge (positive Δ)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Depletion (negative Δ)</Text>
        </View>
      </View>

      {/* Interpretation */}
      <View style={styles.interpretation}>
        <Text style={styles.interpretationTitle}>⚡ Research Insight</Text>
        <Text style={styles.interpretationText}>
          {avgRate > 0.05
            ? "🟢 Net positive rate indicates groundwater recovery. Recharge exceeds extraction."
            : avgRate < -0.05
              ? "🔴 Net negative rate signals over-extraction. Groundwater declining faster than natural recharge."
              : "🟡 Near-equilibrium state. Extraction roughly matches recharge, but monitor for sustainability."}
        </Text>
        <Text style={styles.interpretationText}>
          Rapid changes (peaks/troughs) indicate monsoon response or irrigation
          pumping cycles.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendBar: {
    width: 16,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#475569",
  },
  interpretation: {
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  interpretationTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
  },
  interpretationText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 4,
  },
});
