/**
 * Rainfall-Groundwater Correlation Scatter Plot
 * Shows relationship between monthly rainfall and water level changes
 * Helps identify recharge efficiency and aquifer response
 */

import {
  RainfallCorrelation,
  calculateCorrelationCoefficient,
} from "@/services/advanced-analytics-service";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

interface RainfallCorrelationChartProps {
  data: RainfallCorrelation[];
}

export function RainfallCorrelationChart({
  data,
}: RainfallCorrelationChartProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 80;
  const chartHeight = 240;
  const padding = { top: 20, right: 20, bottom: 50, left: 60 };

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No correlation data available</Text>
      </View>
    );
  }

  // Extract data arrays for correlation calculation
  const rainfallValues = data.map((d) => d.rainfall);
  const waterLevelChanges = data.map((d) => d.waterLevelChange);
  const correlationCoef = calculateCorrelationCoefficient(
    rainfallValues,
    waterLevelChanges,
  );

  // Find ranges
  const maxRainfall = Math.max(...rainfallValues);
  const minRainfall = Math.min(...rainfallValues);
  const maxChange = Math.max(...waterLevelChanges);
  const minChange = Math.min(...waterLevelChanges);

  const rainfallRange = Math.max(maxRainfall - minRainfall, 1);
  const changeRange = Math.max(maxChange - minChange, 1);

  // Scale functions
  const getX = (rainfall: number) =>
    padding.left +
    ((rainfall - minRainfall) / rainfallRange) *
      (chartWidth - padding.left - padding.right);

  const getY = (change: number) =>
    padding.top +
    chartHeight -
    ((change - minChange) / changeRange) * chartHeight;

  // Axis labels
  const xAxisSteps = 5;
  const xLabels = Array.from({ length: xAxisSteps + 1 }, (_, i) => {
    const value = minRainfall + (rainfallRange * i) / xAxisSteps;
    return Math.round(value);
  });

  const yAxisSteps = 5;
  const yLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = minChange + (changeRange * i) / yAxisSteps;
    return value.toFixed(2);
  });

  // Determine point colors based on quadrant
  const getPointColor = (change: number) => {
    if (change > 0) return "#10b981"; // green for positive change
    return "#ef4444"; // red for negative change
  };

  // Calculate trend line (simple linear regression)
  const meanRainfall =
    rainfallValues.reduce((a, b) => a + b, 0) / rainfallValues.length;
  const meanChange =
    waterLevelChanges.reduce((a, b) => a + b, 0) / waterLevelChanges.length;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < rainfallValues.length; i++) {
    numerator +=
      (rainfallValues[i] - meanRainfall) * (waterLevelChanges[i] - meanChange);
    denominator += Math.pow(rainfallValues[i] - meanRainfall, 2);
  }
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanChange - slope * meanRainfall;

  const trendLineStart = {
    x: getX(minRainfall),
    y: getY(slope * minRainfall + intercept),
  };
  const trendLineEnd = {
    x: getX(maxRainfall),
    y: getY(slope * maxRainfall + intercept),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rainfall-Groundwater Relationship</Text>
      <Text style={styles.subtitle}>
        Correlation between monthly rainfall and water level change
      </Text>

      {/* Correlation badge */}
      <View style={styles.correlationBadge}>
        <Text style={styles.correlationLabel}>Correlation (r)</Text>
        <Text
          style={[
            styles.correlationValue,
            {
              color:
                Math.abs(correlationCoef) > 0.7
                  ? "#059669"
                  : Math.abs(correlationCoef) > 0.4
                    ? "#f59e0b"
                    : "#dc2626",
            },
          ]}
        >
          {correlationCoef.toFixed(3)}
        </Text>
        <Text style={styles.correlationInterpretation}>
          {Math.abs(correlationCoef) > 0.7
            ? "Strong"
            : Math.abs(correlationCoef) > 0.4
              ? "Moderate"
              : "Weak"}{" "}
          correlation
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg
          width={chartWidth}
          height={chartHeight + padding.top + padding.bottom}
        >
          {/* Grid lines */}
          {yLabels.map((label, i) => {
            const y = getY(parseFloat(label));
            return (
              <Line
                key={`y-grid-${i}`}
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            );
          })}

          {xLabels.map((label, i) => {
            const x = getX(label);
            return (
              <Line
                key={`x-grid-${i}`}
                x1={x}
                y1={padding.top}
                x2={x}
                y2={chartHeight + padding.top}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            );
          })}

          {/* Axes */}
          <Line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight + padding.top}
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <Line
            x1={padding.left}
            y1={chartHeight + padding.top}
            x2={chartWidth - padding.right}
            y2={chartHeight + padding.top}
            stroke="#94a3b8"
            strokeWidth={2}
          />

          {/* X-axis labels */}
          {xLabels.map((label, i) => {
            const x = getX(label);
            return (
              <SvgText
                key={`x-label-${i}`}
                x={x}
                y={chartHeight + padding.top + 20}
                fontSize={10}
                fill="#64748b"
                textAnchor="middle"
              >
                {label}
              </SvgText>
            );
          })}

          {/* Y-axis labels */}
          {yLabels.map((label, i) => {
            const y = getY(parseFloat(label));
            return (
              <SvgText
                key={`y-label-${i}`}
                x={padding.left - 10}
                y={y + 4}
                fontSize={10}
                fill="#64748b"
                textAnchor="end"
              >
                {label}
              </SvgText>
            );
          })}

          {/* Trend line */}
          <Line
            x1={trendLineStart.x}
            y1={trendLineStart.y}
            x2={trendLineEnd.x}
            y2={trendLineEnd.y}
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5,5"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const cx = getX(point.rainfall);
            const cy = getY(point.waterLevelChange);
            const color = getPointColor(point.waterLevelChange);

            return (
              <Circle
                key={index}
                cx={cx}
                cy={cy}
                r={5}
                fill={color}
                fillOpacity={0.7}
                stroke={color}
                strokeWidth={2}
              />
            );
          })}

          {/* Axis titles */}
          <SvgText
            x={(chartWidth + padding.left - padding.right) / 2}
            y={chartHeight + padding.top + 40}
            fontSize={11}
            fill="#475569"
            textAnchor="middle"
            fontWeight="600"
          >
            Monthly Rainfall (mm)
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
            Water Level Change (m)
          </SvgText>
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>Recharge (increase)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Depletion (decrease)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendLine} />
          <Text style={styles.legendText}>Trend line</Text>
        </View>
      </View>

      {/* Interpretation */}
      <View style={styles.interpretation}>
        <Text style={styles.interpretationTitle}>🔬 Research Insight</Text>
        <Text style={styles.interpretationText}>
          {Math.abs(correlationCoef) > 0.7
            ? "Strong positive correlation indicates efficient rainfall recharge. Aquifer likely has good permeability (alluvial/shallow aquifer)."
            : Math.abs(correlationCoef) > 0.4
              ? "Moderate correlation suggests partial rainfall infiltration. Mixed aquifer conditions or delayed recharge response."
              : "Weak correlation indicates poor rainfall-groundwater coupling. Likely hard rock aquifer or high extraction offsetting recharge."}
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
    marginBottom: 12,
  },
  correlationBadge: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  correlationLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  correlationValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  correlationInterpretation: {
    fontSize: 12,
    color: "#64748b",
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
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLine: {
    width: 20,
    height: 2,
    backgroundColor: "#6366f1",
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#475569",
  },
  interpretation: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#0284c7",
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
  },
});
