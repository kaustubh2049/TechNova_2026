import {
  DatabaseReading,
  Station,
  useStations,
} from "@/providers/stations-provider";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

interface WaterLevelChartProps {
  station: Station;
  timeframe: "6m" | "1y" | "2y";
}

export function WaterLevelChart({ station, timeframe }: WaterLevelChartProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 120;
  const chartHeight = 180;
  const { getStationReadings } = useStations();
  const [readings, setReadings] = useState<DatabaseReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch readings when station or timeframe changes
  useEffect(() => {
    const fetchReadings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(
          `Fetching readings for station ${station.name} at ${station.latitude}, ${station.longitude}`
        );

        const data = await getStationReadings(
          station.latitude,
          station.longitude,
          timeframe
        );
        setReadings(data);
        console.log(
          `Fetched ${data.length} readings for ${timeframe} timeframe`
        );
      } catch (err) {
        console.error("Error fetching readings:", err);
        setError("Failed to load chart data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadings();
  }, [station.latitude, station.longitude, timeframe, getStationReadings]);

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading chart data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error}</Text>
      </View>
    );
  }

  // Convert database readings to chart data points
  const data = readings.map((reading, index) => ({
    x: index,
    y: reading.Water_Level,
    p_no: reading.P_no,
  }));

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No data available for this timeframe
        </Text>
      </View>
    );
  }

  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const yRange = Math.max(maxY - minY, 1);

  // Avoid division by zero when there is only a single data point
  const xDenominator = Math.max(data.length - 1, 1);
  const getScaledX = (x: number) => (x / xDenominator) * chartWidth + 50;
  const getScaledY = (y: number) =>
    chartHeight - ((y - minY) / yRange) * chartHeight + 10;

  // Create smooth curve for 2-year view, regular line for others
  const createPath = () => {
    if (data.length === 1) {
      const x = getScaledX(0);
      const y = getScaledY(data[0].y);
      return `M ${x - 0.001} ${y} L ${x + 0.001} ${y}`;
    }

    if (timeframe === "2y" && data.length > 3) {
      // Create smooth Bezier curve for 2-year view
      let path = `M ${getScaledX(data[0].x)} ${getScaledY(data[0].y)}`;

      for (let i = 1; i < data.length; i++) {
        const current = data[i];
        const prev = data[i - 1];
        const next = data[i + 1] || current;

        const currentX = getScaledX(current.x);
        const currentY = getScaledY(current.y);
        const prevX = getScaledX(prev.x);
        const prevY = getScaledY(prev.y);
        const nextX = getScaledX(next.x);
        const nextY = getScaledY(next.y);

        // Calculate control points for smooth curve
        const tension = 0.3;
        const cp1x = prevX + (currentX - prevX) * tension;
        const cp1y = prevY + (currentY - prevY) * tension;
        const cp2x = currentX - (nextX - prevX) * tension * 0.3;
        const cp2y = currentY - (nextY - prevY) * tension * 0.3;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentX} ${currentY}`;
      }
      return path;
    } else {
      // Regular line chart for other timeframes
      return data
        .map((point, index) => {
          const x = getScaledX(point.x);
          const y = getScaledY(point.y);
          return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        })
        .join(" ");
    }
  };
  const pathData = createPath();

  return (
    <View style={styles.container}>
      {/* Y-axis title */}
      <View style={styles.yAxisTitle}>
        <Text style={styles.yAxisTitleText}>Water Level (m)</Text>
      </View>

      <Svg
        width={chartWidth + 60}
        height={chartHeight + 60}
        style={styles.chart}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = ratio * chartHeight;
          return (
            <Line
              key={ratio}
              x1={50}
              y1={y + 10}
              x2={chartWidth + 50}
              y2={y + 10}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          );
        })}

        {/* Y-axis */}
        <Line
          x1={50}
          y1={10}
          x2={50}
          y2={chartHeight + 10}
          stroke="#e2e8f0"
          strokeWidth={2}
        />

        {/* X-axis */}
        <Line
          x1={50}
          y1={chartHeight + 10}
          x2={chartWidth + 50}
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
              x={45}
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
          stroke={timeframe === "2y" ? "#0891b2" : "#0891b2"}
          strokeWidth={timeframe === "2y" ? 2 : 3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points - smaller for 2y view to reduce clutter */}
        {data.map((point, index) => (
          <Circle
            key={index}
            cx={getScaledX(point.x)}
            cy={getScaledY(point.y)}
            r={timeframe === "2y" ? 2 : 4}
            fill="#0891b2"
            stroke="white"
            strokeWidth={timeframe === "2y" ? 1 : 2}
          />
        ))}

        {/* X-axis labels */}
        {data
          .filter((_, index) => {
            // Show fewer labels for readability
            const step =
              timeframe === "2y"
                ? Math.ceil(data.length / 4)
                : timeframe === "1y"
                ? Math.ceil(data.length / 6)
                : Math.ceil(data.length / 4);
            return index % step === 0 || index === data.length - 1;
          })
          .map((point, index) => {
            const labelText =
              timeframe === "6m"
                ? `R${point.p_no}`
                : timeframe === "1y"
                ? `R${point.p_no}`
                : `R${point.p_no}`; // Reading number for all timeframes

            return (
              <SvgText
                key={index}
                x={getScaledX(point.x)}
                y={chartHeight + 30}
                fontSize={10}
                fill="#64748b"
                textAnchor="middle"
              >
                {labelText}
              </SvgText>
            );
          })}

        {/* X-axis title */}
        <SvgText
          x={chartWidth / 2 + 50}
          y={chartHeight + 50}
          fontSize={12}
          fill="#64748b"
          textAnchor="middle"
        >
          Reading Number (Latest → Oldest)
        </SvgText>
      </Svg>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Current: {station.currentLevel.toFixed(2)}m • Trend:{" "}
          {data.length > 1
            ? data[data.length - 1].y > data[0].y
              ? "Rising"
              : "Falling"
            : "Stable"}
        </Text>
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
    left: 10,
    top: "50%",
    transform: [{ rotate: "-90deg" }],
    zIndex: 1,
  },
  yAxisTitleText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  chart: {
    marginLeft: 20,
  },
  emptyContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
  info: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
});
