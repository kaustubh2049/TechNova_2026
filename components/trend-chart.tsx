import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

interface TrendChartProps {
  timeframe: "6m" | "1y" | "2y";
  customData?: { x: number; y: number; label: string }[];
  showNearbyStations?: boolean;
}

export function TrendChart({
  timeframe,
  customData,
  showNearbyStations = false,
}: TrendChartProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 120;
  const chartHeight = 180;

  const generateMockData = () => {
    const points = timeframe === "6m" ? 26 : timeframe === "1y" ? 12 : 24; // 6months=26 weeks, 1year=12 months, 2years=24 months
    const data = [];
    let baseValue = 15;

    for (let i = 0; i < points; i++) {
      baseValue += (Math.random() - 0.5) * 2;
      data.push({
        x: i,
        y: Math.max(5, Math.min(25, baseValue)),
        label: timeframe === "6m" ? `W${i + 1}` : `M${i + 1}`, // 6months=weeks, 1year/2year=months
      });
    }
    return data;
  };

  // Use custom data if provided, otherwise generate mock data
  const data =
    customData && customData.length > 0 ? customData : generateMockData();

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {showNearbyStations
            ? "No nearby station data available"
            : "No data available"}
        </Text>
      </View>
    );
  }
  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const yRange = Math.max(maxY - minY, 1); // Ensure minimum range of 1

  const getScaledX = (x: number) =>
    (x / Math.max(data.length - 1, 1)) * chartWidth + 60;
  const getScaledY = (y: number) =>
    chartHeight - ((y - minY) / yRange) * chartHeight + 10;

  const pathData = data
    .map((point, index) => {
      const x = getScaledX(point.x);
      const y = getScaledY(point.y);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  return (
    <View style={styles.container}>
      {/* Y-axis title */}
      <View style={styles.yAxisTitle}>
        <Text style={styles.yAxisTitleText}>Water Level (m)</Text>
      </View>

      <View style={styles.chartWrapper}>
        <Svg
          width={chartWidth + 80}
          height={chartHeight + 60}
          style={styles.chart}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = ratio * chartHeight + 10;
            return (
              <Line
                key={ratio}
                x1={60}
                y1={y}
                x2={chartWidth + 60}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
            );
          })}

          {/* Y-axis */}
          <Line
            x1={60}
            y1={10}
            x2={60}
            y2={chartHeight + 10}
            stroke="#e2e8f0"
            strokeWidth={2}
          />

          {/* X-axis */}
          <Line
            x1={60}
            y1={chartHeight + 10}
            x2={chartWidth + 60}
            y2={chartHeight + 10}
            stroke="#e2e8f0"
            strokeWidth={2}
          />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = ratio * chartHeight + 10;
            const value = maxY - ratio * yRange;
            return (
              <SvgText
                key={ratio}
                x={55}
                y={y + 3}
                fontSize={12}
                fill="#64748b"
                textAnchor="end"
              >
                {value.toFixed(1)}
              </SvgText>
            );
          })}

          {/* Chart line */}
          <Path
            d={pathData}
            stroke="#0891b2"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => (
            <Circle
              key={index}
              cx={getScaledX(point.x)}
              cy={getScaledY(point.y)}
              r={4}
              fill="#0891b2"
              stroke="white"
              strokeWidth={2}
            />
          ))}

          {/* X-axis labels */}
          {data
            .filter((_, index) => {
              const step = Math.ceil(data.length / 5);
              return index % step === 0 || index === data.length - 1;
            })
            .map((point, index) => (
              <SvgText
                key={index}
                x={getScaledX(point.x)}
                y={chartHeight + 30}
                fontSize={11}
                fill="#64748b"
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            ))}

          {/* X-axis title */}
          <SvgText
            x={chartWidth / 2 + 60}
            y={chartHeight + 50}
            fontSize={12}
            fill="#64748b"
            textAnchor="middle"
          >
            Reading Timeline
          </SvgText>
        </Svg>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendLine} />
          <Text style={styles.legendText}>
            Average Water Level (m below ground)
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  yAxisTitle: {
    position: "absolute",
    left: 15,
    top: "45%",
    transform: [{ rotate: "-90deg" }],
    zIndex: 1,
  },
  yAxisTitleText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  emptyContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    marginLeft: 30,
  },
  legend: {
    marginTop: 16,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendLine: {
    width: 20,
    height: 2,
    backgroundColor: "#0891b2",
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
  },
});
