import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
  Text as SvgText,
} from "react-native-svg";

interface StressIndexData {
  month: string;
  stressIndex: number;
  category: "low" | "medium" | "high" | "critical";
}

interface StressIndexChartProps {
  data: StressIndexData[];
}

export function StressIndexChart({ data }: StressIndexChartProps) {
  const width = Dimensions.get("window").width - 80;
  const height = 280;
  const padding = { top: 40, right: 20, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Groundwater Stress Index</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxStress = 1.0; // Stress index from 0 to 1

  const scaleY = (value: number) => {
    return chartHeight - (value / maxStress) * chartHeight;
  };

  const scaleX = (index: number) => {
    return (index / (data.length - 1)) * chartWidth;
  };

  const getStressColor = (index: number) => {
    if (index < 0.3) return "#10b981"; // Low - Green
    if (index < 0.5) return "#f59e0b"; // Medium - Orange
    if (index < 0.7) return "#ef4444"; // High - Red
    return "#991b1b"; // Critical - Dark Red
  };

  // Generate line path
  const linePath = data
    .map((d, i) => {
      const x = scaleX(i);
      const y = scaleY(d.stressIndex);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Generate area path
  const areaPath =
    linePath + ` L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groundwater Stress Index Trend</Text>
      <Text style={styles.subtitle}>
        Monthly stress levels based on extraction vs recharge
      </Text>

      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
          </SvgLinearGradient>
        </Defs>

        {/* Stress level zones */}
        <Rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight * 0.3}
          fill="#fef2f2"
          opacity={0.5}
        />
        <Rect
          x={padding.left}
          y={padding.top + chartHeight * 0.3}
          width={chartWidth}
          height={chartHeight * 0.2}
          fill="#fff7ed"
          opacity={0.5}
        />
        <Rect
          x={padding.left}
          y={padding.top + chartHeight * 0.5}
          width={chartWidth}
          height={chartHeight * 0.5}
          fill="#f0fdf4"
          opacity={0.5}
        />

        {/* Zone labels */}
        <SvgText
          x={width - padding.right - 5}
          y={padding.top + 15}
          fontSize="10"
          fill="#991b1b"
          textAnchor="end"
          fontWeight="600"
        >
          CRITICAL
        </SvgText>
        <SvgText
          x={width - padding.right - 5}
          y={padding.top + chartHeight * 0.4}
          fontSize="10"
          fill="#ea580c"
          textAnchor="end"
          fontWeight="600"
        >
          HIGH
        </SvgText>
        <SvgText
          x={width - padding.right - 5}
          y={padding.top + chartHeight * 0.75}
          fontSize="10"
          fill="#059669"
          textAnchor="end"
          fontWeight="600"
        >
          LOW
        </SvgText>

        {/* Y-axis labels */}
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

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % 2 === 0 || i === data.length - 1) {
            const x = padding.left + scaleX(i);
            return (
              <SvgText
                key={i}
                x={x}
                y={height - padding.bottom + 20}
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {d.month}
              </SvgText>
            );
          }
          return null;
        })}

        {/* Area fill */}
        <Path
          d={areaPath}
          fill="url(#stressGradient)"
          transform={`translate(${padding.left}, ${padding.top})`}
        />

        {/* Stress line */}
        <Path
          d={linePath}
          fill="none"
          stroke="#0891b2"
          strokeWidth="3"
          transform={`translate(${padding.left}, ${padding.top})`}
        />

        {/* Data points with color coding */}
        {data.map((d, i) => {
          const x = padding.left + scaleX(i);
          const y = padding.top + scaleY(d.stressIndex);
          const color = getStressColor(d.stressIndex);

          return (
            <React.Fragment key={i}>
              <Circle
                cx={x}
                cy={y}
                r="5"
                fill="white"
                stroke={color}
                strokeWidth="2"
              />
              <Circle cx={x} cy={y} r="3" fill={color} />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current Index</Text>
          <Text
            style={[
              styles.statValue,
              { color: getStressColor(data[data.length - 1].stressIndex) },
            ]}
          >
            {data[data.length - 1].stressIndex.toFixed(3)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Status</Text>
          <Text
            style={[
              styles.statValue,
              { color: getStressColor(data[data.length - 1].stressIndex) },
            ]}
          >
            {data[data.length - 1].category.toUpperCase()}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Index</Text>
          <Text style={styles.statValue}>
            {(
              data.reduce((sum, d) => sum + d.stressIndex, 0) / data.length
            ).toFixed(3)}
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
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0891b2",
  },
});
