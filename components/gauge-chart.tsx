import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface GaugeChartProps {
    score: number; // 0-100
    size?: number;
}

export function GaugeChart({ score, size = 200 }: GaugeChartProps) {
    // Clamp score between 0 and 100
    const clampedScore = Math.max(0, Math.min(100, score));

    // Calculate angle for the score (180 degrees = half circle)
    const angle = (clampedScore / 100) * 180;

    // Determine status based on score
    const getStatus = (score: number): { label: string; color: string } => {
        if (score >= 70) return { label: "Optimal", color: "#79C9C5" };
        if (score >= 40) return { label: "Moderate", color: "#F96E5B" };
        return { label: "Critical", color: "#dc2626" };
    };

    const status = getStatus(clampedScore);

    // SVG path for the gauge background (semi-circle)
    const radius = size / 2 - 20;
    const centerX = size / 2;
    const centerY = size / 2 + 10;
    const strokeWidth = 16;

    // Create arc path
    const createArcPath = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(centerX, centerY, radius, endAngle);
        const end = polarToCartesian(centerX, centerY, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    };

    return (
        <View style={styles.container}>
            <View style={[styles.glowContainer, { width: size * 1.3, height: size * 0.65 }]}>
                <View style={[styles.glow, { backgroundColor: `${status.color}33` }]} />
            </View>

            <Svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
                <Defs>
                    <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#F96E5B" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#F9C74F" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#79C9C5" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Background arc */}
                <Path
                    d={createArcPath(0, 180)}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />

                {/* Filled arc based on score */}
                <Path
                    d={createArcPath(0, angle)}
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />

                {/* Indicator dot */}
                {angle > 0 && (
                    <Circle
                        cx={polarToCartesian(centerX, centerY, radius, angle).x}
                        cy={polarToCartesian(centerX, centerY, radius, angle).y}
                        r={8}
                        fill={status.color}
                        stroke="white"
                        strokeWidth={3}
                    />
                )}
            </Svg>

            <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{Math.round(clampedScore)}</Text>
                <Text style={[styles.statusText, { color: status.color }]}>
                    {status.label.toUpperCase()}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    glowContainer: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 0,
    },
    glow: {
        width: "100%",
        height: "100%",
        borderRadius: 9999,
        opacity: 0.3,
        shadowColor: "#79C9C5",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 60,
    },
    scoreContainer: {
        position: "absolute",
        bottom: 20,
        alignItems: "center",
        zIndex: 10,
    },
    scoreText: {
        fontSize: 56,
        fontWeight: "800",
        color: "#1A1D1E",
        lineHeight: 56,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
        marginTop: 8,
    },
});
