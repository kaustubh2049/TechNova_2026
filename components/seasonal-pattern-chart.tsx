import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

interface SeasonalPatternData {
  season: string;
  avgLevel: number;
  minLevel: number;
  maxLevel: number;
  rechargeRate: number;
}

interface SeasonalPatternChartProps {
  data: SeasonalPatternData[];
}

export function SeasonalPatternChart({ data }: SeasonalPatternChartProps) {
  const width = Dimensions.get("window").width - 80;
  const height = 300;
  const padding = { top: 40, right: 20, bottom: 80, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Seasonal Water Pattern</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.maxLevel));
  const minValue = Math.min(...data.map((d) => d.minLevel));
  const range = maxValue - minValue;

  const scaleY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };

  const barWidth = chartWidth / data.length - 20;

  const getSeasonColor = (season: string) => {
    if (season.includes("Monsoon")) return "#3b82f6";
    if (season.includes("Post-Monsoon")) return "#10b981";
    if (season.includes("Winter")) return "#8b5cf6";
    return "#f59e0b"; // Summer
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seasonal Groundwater Pattern</Text>
      <Text style={styles.subtitle}>
        Water level variations across seasons with recharge rates
      </Text>

      <Svg width={width} height={height}>
        {/* Y-axis */}
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* X-axis */}
        <Line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
          const value = minValue + range * tick;
          const y = padding.top + chartHeight * (1 - tick);
          return (
            <React.Fragment key={i}>
              <Line
                x1={padding.left - 5}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <SvgText
                x={padding.left - 10}
                y={y + 4}
                fontSize="10"
                fill="#64748b"
                textAnchor="end"
              >
                {value.toFixed(1)}m
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Bars and labels */}
        {data.map((item, index) => {
          const x = padding.left + (index * chartWidth) / data.length + 10;
          const avgY = scaleY(item.avgLevel);
          const minY = scaleY(item.minLevel);
          const maxY = scaleY(item.maxLevel);
          const barHeight = minY - maxY;
          const color = getSeasonColor(item.season);

          return (
            <React.Fragment key={index}>
              {/* Min-Max range bar (lighter) */}
              <Rect
                x={x}
                y={padding.top + maxY}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity={0.3}
                rx={4}
              />

              {/* Average bar (darker) */}
              <Rect
                x={x + barWidth * 0.25}
                y={padding.top + avgY - 3}
                width={barWidth * 0.5}
                height={6}
                fill={color}
                rx={3}
              />

              {/* Season label */}
              <SvgText
                x={x + barWidth / 2}
                y={padding.top + chartHeight + 20}
                fontSize="11"
                fontWeight="600"
                fill="#1e293b"
                textAnchor="middle"
              >
                {item.season.split(" ")[0]}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={padding.top + chartHeight + 35}
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {item.avgLevel.toFixed(1)}m
              </SvgText>

              {/* Recharge rate indicator */}
              <SvgText
                x={x + barWidth / 2}
                y={padding.top + chartHeight + 50}
                fontSize="9"
                fill={item.rechargeRate > 0 ? "#10b981" : "#ef4444"}
                textAnchor="middle"
                fontWeight="600"
              >
                {item.rechargeRate > 0 ? "↑" : "↓"}{" "}
                {Math.abs(item.rechargeRate).toFixed(1)}%
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendBox,
              { backgroundColor: "#3b82f6", opacity: 0.3 },
            ]}
          />
          <Text style={styles.legendText}>Min-Max Range</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: "#3b82f6" }]} />
          <Text style={styles.legendText}>Average Level</Text>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Seasonal Insights</Text>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Best Season:</Text>
          <Text style={styles.insightValue}>
            {
              data.reduce(
                (max, d) => (d.avgLevel > max.avgLevel ? d : max),
                data[0],
              ).season
            }
          </Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Stress Season:</Text>
          <Text style={styles.insightValue}>
            {
              data.reduce(
                (min, d) => (d.avgLevel < min.avgLevel ? d : min),
                data[0],
              ).season
            }
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
  },
  emptyState: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendBox: {
    width: 20,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendBar: {
    width: 20,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
  },
  insightsContainer: {
    marginTop: 16,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  insightValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0891b2",
  },
});
