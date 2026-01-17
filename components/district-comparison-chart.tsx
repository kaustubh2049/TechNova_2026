/**
 * District Comparison Chart
 * Multi-line chart comparing groundwater trends across districts
 * Helps identify regional patterns and localized stress
 */

import { DistrictTrend } from "@/services/advanced-analytics-service";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

interface DistrictComparisonChartProps {
  data: DistrictTrend[];
}

export function DistrictComparisonChart({
  data,
}: DistrictComparisonChartProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 80;
  const chartHeight = 260;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No district comparison data available
        </Text>
      </View>
    );
  }

  // Find global min/max across all districts
  const allValues = data.flatMap((district) =>
    district.data.map((point) => point.y),
  );
  const maxY = Math.max(...allValues);
  const minY = Math.min(...allValues);
  const yRange = Math.max(maxY - minY, 1);

  // Find max data points across all districts
  const maxDataPoints = Math.max(...data.map((d) => d.data.length));

  // Scale functions
  const getX = (index: number) =>
    padding.left +
    (index / Math.max(maxDataPoints - 1, 1)) *
      (chartWidth - padding.left - padding.right);

  const getY = (value: number) =>
    padding.top + chartHeight - ((value - minY) / yRange) * chartHeight;

  // Y-axis labels
  const yAxisSteps = 5;
  const yLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = minY + (yRange * i) / yAxisSteps;
    return value.toFixed(1);
  });

  // X-axis labels (sample from first district)
  const labelInterval = Math.max(1, Math.floor(maxDataPoints / 6));
  const sampleDistrict = data[0];
  const xLabels = sampleDistrict.data.filter((_, i) => i % labelInterval === 0);

  // Generate path for each district
  const districtPaths = data.map((district) => {
    const pathData = district.data
      .map((point, index) => {
        const x = getX(index);
        const y = getY(point.y);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");

    return {
      path: pathData,
      color: district.color,
      district: district.district,
      data: district.data,
    };
  });

  // Calculate trend statistics for each district
  const districtStats = data.map((district) => {
    const values = district.data.map((d) => d.y);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const percentChange = (change / firstValue) * 100;

    return {
      district: district.district,
      color: district.color,
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(1),
      trend: change > 0 ? "rising" : change < 0 ? "falling" : "stable",
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>District-wise Trend Comparison</Text>
      <Text style={styles.subtitle}>
        Groundwater level trends across {data.length} districts
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <Svg
            width={Math.max(chartWidth, 500)}
            height={chartHeight + padding.top + padding.bottom}
          >
            {/* Grid lines */}
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

            {/* District trend lines */}
            {districtPaths.map((districtPath, index) => (
              <React.Fragment key={index}>
                {/* Line */}
                <Path
                  d={districtPath.path}
                  stroke={districtPath.color}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {districtPath.data.map((point, pointIndex) => {
                  // Only show points at intervals to reduce clutter
                  if (
                    pointIndex % 3 !== 0 &&
                    pointIndex !== districtPath.data.length - 1
                  ) {
                    return null;
                  }

                  const cx = getX(pointIndex);
                  const cy = getY(point.y);

                  return (
                    <Circle
                      key={`${index}-${pointIndex}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="white"
                      stroke={districtPath.color}
                      strokeWidth={2}
                    />
                  );
                })}
              </React.Fragment>
            ))}

            {/* X-axis labels */}
            {xLabels.map((point, i) => {
              const index = sampleDistrict.data.indexOf(point);
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
                  {point.label}
                </SvgText>
              );
            })}

            {/* Axis titles */}
            <SvgText
              x={(chartWidth + padding.left - padding.right) / 2}
              y={chartHeight + padding.top + 55}
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
              Water Level (m)
            </SvgText>
          </Svg>
        </View>
      </ScrollView>

      {/* District Legend & Stats */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Districts & Trends</Text>
        {districtStats.map((stat, index) => (
          <View key={index} style={styles.districtStatRow}>
            <View style={styles.districtInfo}>
              <View
                style={[styles.districtLine, { backgroundColor: stat.color }]}
              />
              <Text style={styles.districtName}>{stat.district}</Text>
            </View>
            <View style={styles.districtChange}>
              <Text
                style={[
                  styles.changeValue,
                  {
                    color:
                      stat.trend === "rising"
                        ? "#10b981"
                        : stat.trend === "falling"
                          ? "#ef4444"
                          : "#64748b",
                  },
                ]}
              >
                {stat.change > 0 ? "+" : ""}
                {stat.change}m
              </Text>
              <Text style={styles.changePercent}>
                ({stat.percentChange > 0 ? "+" : ""}
                {stat.percentChange}%)
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Interpretation */}
      <View style={styles.interpretation}>
        <Text style={styles.interpretationTitle}>🗺️ Spatial Analysis</Text>
        <Text style={styles.interpretationText}>
          {districtStats.filter((s) => s.trend === "falling").length >
          districtStats.length / 2
            ? "Majority of districts show declining trends, indicating widespread over-extraction. Regional policy intervention needed."
            : districtStats.filter((s) => s.trend === "rising").length >
                districtStats.length / 2
              ? "Most districts show rising trends, suggesting effective recharge or reduced extraction. Sustainable management in place."
              : "Mixed trends across districts. Localized stress areas require targeted interventions. Some regions sustainable, others critical."}
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
  legendContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  districtStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  districtInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  districtLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  districtName: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  districtChange: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeValue: {
    fontSize: 14,
    fontWeight: "700",
    marginRight: 4,
  },
  changePercent: {
    fontSize: 11,
    color: "#64748b",
  },
  interpretation: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
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
