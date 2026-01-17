import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

interface StressWaterLevelData {
  waterLevel: number;
  stressIndex: number;
  zone: string;
}

interface StressWaterLevelChartProps {
  data: StressWaterLevelData[];
}

export function StressWaterLevelChart({ data }: StressWaterLevelChartProps) {
  const width = Dimensions.get("window").width - 80;
  const height = 320;
  const padding = { top: 40, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Stress vs Water Level</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxWaterLevel = Math.max(...data.map((d) => d.waterLevel));
  const maxStress = 1.0;

  const scaleX = (value: number) => {
    return (value / maxWaterLevel) * chartWidth;
  };

  const scaleY = (value: number) => {
    return chartHeight - (value / maxStress) * chartHeight;
  };

  const getZoneColor = (zone: string) => {
    if (zone.toLowerCase().includes("safe")) return "#10b981";
    if (zone.toLowerCase().includes("moderate")) return "#f59e0b";
    if (zone.toLowerCase().includes("stressed")) return "#ef4444";
    return "#991b1b";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stress Index vs Water Level Correlation</Text>
      <Text style={styles.subtitle}>
        Scatter plot showing relationship between water depth and stress
      </Text>

      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((tick, i) => {
          const y = padding.top + chartHeight * (1 - tick);
          const x = padding.left + chartWidth * tick;
          return (
            <React.Fragment key={i}>
              <Line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <Line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={padding.top + chartHeight}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            </React.Fragment>
          );
        })}

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

        {/* Y-axis labels (Stress Index) */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
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
                {tick.toFixed(2)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Y-axis title */}
        <SvgText
          x={15}
          y={padding.top + chartHeight / 2}
          fontSize="12"
          fontWeight="600"
          fill="#1e293b"
          textAnchor="middle"
          transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
        >
          Stress Index →
        </SvgText>

        {/* X-axis labels (Water Level) */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
          const x = padding.left + chartWidth * tick;
          const value = (maxWaterLevel * tick).toFixed(1);
          return (
            <React.Fragment key={i}>
              <Line
                x1={x}
                y1={padding.top + chartHeight}
                x2={x}
                y2={padding.top + chartHeight + 5}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <SvgText
                x={x}
                y={padding.top + chartHeight + 20}
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {value}m
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X-axis title */}
        <SvgText
          x={padding.left + chartWidth / 2}
          y={height - 15}
          fontSize="12"
          fontWeight="600"
          fill="#1e293b"
          textAnchor="middle"
        >
          ← Water Level (depth below surface)
        </SvgText>

        {/* Scatter points */}
        {data.map((point, index) => {
          const x = padding.left + scaleX(point.waterLevel);
          const y = padding.top + scaleY(point.stressIndex);
          const color = getZoneColor(point.zone);

          return (
            <React.Fragment key={index}>
              <Circle cx={x} cy={y} r="6" fill={color} opacity={0.6} />
              <Circle cx={x} cy={y} r="3" fill={color} />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>Safe</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Stressed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#991b1b" }]} />
          <Text style={styles.legendText}>Critical</Text>
        </View>
      </View>

      {/* Correlation info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          • Inverse correlation: Higher water levels → Lower stress
        </Text>
        <Text style={styles.infoText}>
          • Critical threshold: Water level {"<"} 2m = High stress
        </Text>
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
    gap: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  infoCard: {
    marginTop: 16,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  infoText: {
    fontSize: 12,
    color: "#1e40af",
    marginBottom: 4,
  },
});
