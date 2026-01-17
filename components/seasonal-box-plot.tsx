/**
 * Seasonal Box Plot Component
 * Shows groundwater variability across Pre-Monsoon, Monsoon, and Post-Monsoon seasons
 * Uses box-and-whisker plots to display min, Q1, median, Q3, max
 */

import { SeasonalData } from "@/services/advanced-analytics-service";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";

interface SeasonalBoxPlotProps {
  data: SeasonalData[];
}

export function SeasonalBoxPlot({ data }: SeasonalBoxPlotProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 80;
  const chartHeight = 240;
  const padding = { top: 20, right: 20, bottom: 50, left: 60 };

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No seasonal data available</Text>
      </View>
    );
  }

  // Find global min and max for Y-axis scaling
  const allValues = data.flatMap((d) => [d.min, d.max]);
  const globalMin = Math.min(...allValues);
  const globalMax = Math.max(...allValues);
  const yRange = Math.max(globalMax - globalMin, 1);

  // Scale functions
  const getY = (value: number) =>
    padding.top + chartHeight - ((value - globalMin) / yRange) * chartHeight;

  const boxWidth =
    (chartWidth - padding.left - padding.right) / (data.length * 2);
  const boxSpacing = boxWidth * 2;

  // Y-axis labels
  const yAxisSteps = 5;
  const yLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = globalMin + (yRange * i) / yAxisSteps;
    return value.toFixed(1);
  });

  // Season colors
  const seasonColors: { [key: string]: string } = {
    "Pre-Monsoon": "#fbbf24", // amber
    Monsoon: "#3b82f6", // blue
    "Post-Monsoon": "#10b981", // green
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seasonal Variability Analysis</Text>
      <Text style={styles.subtitle}>
        Box plots showing groundwater distribution by season
      </Text>

      <View style={styles.chartContainer}>
        <Svg
          width={chartWidth}
          height={chartHeight + padding.top + padding.bottom}
        >
          {/* Y-axis grid lines */}
          {yLabels.map((label, i) => {
            const y = getY(parseFloat(label));
            return (
              <React.Fragment key={`grid-${i}`}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <SvgText
                  x={padding.left - 10}
                  y={y + 4}
                  fontSize={10}
                  fill="#64748b"
                  textAnchor="end"
                >
                  {label}m
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Y-axis line */}
          <Line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight + padding.top}
            stroke="#94a3b8"
            strokeWidth={2}
          />

          {/* X-axis line */}
          <Line
            x1={padding.left}
            y1={chartHeight + padding.top}
            x2={chartWidth - padding.right}
            y2={chartHeight + padding.top}
            stroke="#94a3b8"
            strokeWidth={2}
          />

          {/* Box plots */}
          {data.map((seasonData, index) => {
            const centerX = padding.left + boxSpacing * index + boxSpacing / 2;
            const color = seasonColors[seasonData.season] || "#6b7280";

            // Y positions
            const yMin = getY(seasonData.min);
            const yQ1 = getY(seasonData.q1);
            const yMedian = getY(seasonData.median);
            const yQ3 = getY(seasonData.q3);
            const yMax = getY(seasonData.max);
            const yMean = getY(seasonData.mean);

            return (
              <React.Fragment key={seasonData.season}>
                {/* Whisker line (min to max) */}
                <Line
                  x1={centerX}
                  y1={yMax}
                  x2={centerX}
                  y2={yMin}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="4,2"
                />

                {/* Min whisker cap */}
                <Line
                  x1={centerX - boxWidth / 4}
                  y1={yMin}
                  x2={centerX + boxWidth / 4}
                  y2={yMin}
                  stroke={color}
                  strokeWidth={2}
                />

                {/* Max whisker cap */}
                <Line
                  x1={centerX - boxWidth / 4}
                  y1={yMax}
                  x2={centerX + boxWidth / 4}
                  y2={yMax}
                  stroke={color}
                  strokeWidth={2}
                />

                {/* IQR box (Q1 to Q3) */}
                <Rect
                  x={centerX - boxWidth / 2}
                  y={yQ3}
                  width={boxWidth}
                  height={yQ1 - yQ3}
                  fill={`${color}40`}
                  stroke={color}
                  strokeWidth={2}
                />

                {/* Median line */}
                <Line
                  x1={centerX - boxWidth / 2}
                  y1={yMedian}
                  x2={centerX + boxWidth / 2}
                  y2={yMedian}
                  stroke={color}
                  strokeWidth={3}
                />

                {/* Mean point (circle) */}
                <Circle
                  cx={centerX}
                  cy={yMean}
                  r={4}
                  fill="white"
                  stroke={color}
                  strokeWidth={2}
                />

                {/* Season label */}
                <SvgText
                  x={centerX}
                  y={chartHeight + padding.top + 20}
                  fontSize={11}
                  fill="#1e293b"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {seasonData.season}
                </SvgText>

                {/* Count label */}
                <SvgText
                  x={centerX}
                  y={chartHeight + padding.top + 35}
                  fontSize={9}
                  fill="#64748b"
                  textAnchor="middle"
                >
                  (n={seasonData.count})
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Y-axis label */}
          <SvgText
            x={15}
            y={chartHeight / 2 + padding.top}
            fontSize={11}
            fill="#475569"
            textAnchor="middle"
            fontWeight="600"
            transform={`rotate(-90, 15, ${chartHeight / 2 + padding.top})`}
          >
            Water Level (m)
          </SvgText>
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { borderColor: "#fbbf24" }]} />
          <Text style={styles.legendText}>Pre-Monsoon (Mar-May)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { borderColor: "#3b82f6" }]} />
          <Text style={styles.legendText}>Monsoon (Jun-Sep)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { borderColor: "#10b981" }]} />
          <Text style={styles.legendText}>Post-Monsoon (Oct-Feb)</Text>
        </View>
      </View>

      {/* Interpretation */}
      <View style={styles.interpretation}>
        <Text style={styles.interpretationTitle}>📊 Interpretation</Text>
        <Text style={styles.interpretationText}>
          Box plots show the median (thick line), interquartile range (box), and
          extremes (whiskers). The circle indicates the mean. Higher variability
          during monsoon indicates strong seasonal recharge patterns.
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
  legendBox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: "#ffffff",
  },
  legendText: {
    fontSize: 11,
    color: "#475569",
  },
  interpretation: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
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
