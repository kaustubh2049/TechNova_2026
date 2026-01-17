import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

interface DemandAvailabilityData {
  month: string;
  demand: number;
  availability: number;
  gap: number;
}

interface DemandAvailabilityChartProps {
  data: DemandAvailabilityData[];
}

export function DemandAvailabilityChart({
  data,
}: DemandAvailabilityChartProps) {
  const width = Dimensions.get("window").width - 80;
  const height = 280;
  const padding = { top: 40, right: 20, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Demand vs Availability</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.demand, d.availability)),
  );

  const scaleY = (value: number) => {
    return chartHeight - (value / maxValue) * chartHeight;
  };

  const scaleX = (index: number) => {
    return (index / (data.length - 1)) * chartWidth;
  };

  // Generate demand line path
  const demandPath = data
    .map((d, i) => {
      const x = scaleX(i);
      const y = scaleY(d.demand);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Generate availability line path
  const availabilityPath = data
    .map((d, i) => {
      const x = scaleX(i);
      const y = scaleY(d.availability);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groundwater Demand vs Availability</Text>
      <Text style={styles.subtitle}>
        Monthly comparison of water requirements and supply
      </Text>

      <Svg width={width} height={height}>
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
          const y = padding.top + chartHeight * (1 - tick);
          const value = (maxValue * tick).toFixed(1);
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
                {value}m
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

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((tick, i) => {
          const y = padding.top + chartHeight * (1 - tick);
          return (
            <Line
              key={i}
              x1={padding.left}
              y1={y}
              x2={padding.left + chartWidth}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Demand line (red) */}
        <Path
          d={demandPath}
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          transform={`translate(${padding.left}, ${padding.top})`}
        />

        {/* Availability line (green) */}
        <Path
          d={availabilityPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          transform={`translate(${padding.left}, ${padding.top})`}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding.left + scaleX(i);
          const demandY = padding.top + scaleY(d.demand);
          const availY = padding.top + scaleY(d.availability);

          return (
            <React.Fragment key={i}>
              {/* Demand point */}
              <Circle cx={x} cy={demandY} r="4" fill="#ef4444" />
              {/* Availability point */}
              <Circle cx={x} cy={availY} r="4" fill="#10b981" />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Demand</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>Availability</Text>
        </View>
      </View>

      {/* Gap indicator */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Gap</Text>
          <Text style={[styles.statValue, { color: "#ef4444" }]}>
            {(data.reduce((sum, d) => sum + d.gap, 0) / data.length).toFixed(2)}
            m
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Max Deficit</Text>
          <Text style={[styles.statValue, { color: "#ef4444" }]}>
            {Math.max(...data.map((d) => d.gap)).toFixed(2)}m
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
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});
