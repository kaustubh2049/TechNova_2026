import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

interface ZoneData {
  zone: string;
  count: number;
  percentage: number;
  color: string;
}

interface ZoneClassificationChartProps {
  data: ZoneData[];
}

export function ZoneClassificationChart({
  data,
}: ZoneClassificationChartProps) {
  const width = Dimensions.get("window").width - 80;

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Zone Classification</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  let startAngle = -90;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groundwater Zone Classification</Text>
      <Text style={styles.subtitle}>
        Distribution of stations by water stress zones
      </Text>

      <View style={styles.chartContainer}>
        {/* Donut Chart */}
        <Svg width={200} height={200}>
          {data.map((item, index) => {
            const angle = (item.count / total) * 360;
            const endAngle = startAngle + angle;

            const startX = 100 + 70 * Math.cos((startAngle * Math.PI) / 180);
            const startY = 100 + 70 * Math.sin((startAngle * Math.PI) / 180);
            const endX = 100 + 70 * Math.cos((endAngle * Math.PI) / 180);
            const endY = 100 + 70 * Math.sin((endAngle * Math.PI) / 180);

            const largeArc = angle > 180 ? 1 : 0;
            const pathData = [
              `M 100 100`,
              `L ${startX} ${startY}`,
              `A 70 70 0 ${largeArc} 1 ${endX} ${endY}`,
              `Z`,
            ].join(" ");

            const result = (
              <React.Fragment key={index}>
                <Path d={pathData} fill={item.color} opacity={0.8} />
              </React.Fragment>
            );

            startAngle = endAngle;
            return result;
          })}

          {/* Center circle for donut effect */}
          <Circle cx="100" cy="100" r="45" fill="white" />

          {/* Center text */}
          <SvgText
            x="100"
            y="95"
            fontSize="24"
            fontWeight="700"
            fill="#1e293b"
            textAnchor="middle"
          >
            {total}
          </SvgText>
          <SvgText
            x="100"
            y="110"
            fontSize="12"
            fill="#64748b"
            textAnchor="middle"
          >
            Stations
          </SvgText>
        </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendLabel}>{item.zone}</Text>
                <Text style={styles.legendValue}>
                  {item.count} ({item.percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Zone descriptions */}
      <View style={styles.descriptionsContainer}>
        <View style={[styles.descriptionCard, { borderLeftColor: "#10b981" }]}>
          <Text style={styles.descriptionTitle}>Safe Zone</Text>
          <Text style={styles.descriptionText}>
            Water level {">"} 5m, sustainable extraction
          </Text>
        </View>
        <View style={[styles.descriptionCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={styles.descriptionTitle}>Moderate Zone</Text>
          <Text style={styles.descriptionText}>
            Water level 3-5m, monitor extraction
          </Text>
        </View>
        <View style={[styles.descriptionCard, { borderLeftColor: "#ef4444" }]}>
          <Text style={styles.descriptionTitle}>Stressed Zone</Text>
          <Text style={styles.descriptionText}>
            Water level 1-3m, reduce extraction
          </Text>
        </View>
        <View style={[styles.descriptionCard, { borderLeftColor: "#991b1b" }]}>
          <Text style={styles.descriptionTitle}>Critical Zone</Text>
          <Text style={styles.descriptionText}>
            Water level {"<"} 1m, immediate action needed
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
  chartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  legend: {
    flex: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  legendValue: {
    fontSize: 12,
    color: "#64748b",
  },
  descriptionsContainer: {
    gap: 8,
  },
  descriptionCard: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  descriptionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 12,
    color: "#64748b",
  },
});
