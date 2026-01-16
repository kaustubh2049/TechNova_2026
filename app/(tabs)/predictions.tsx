import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { predictGroundwater, type PredictionResult } from '../../services/predictionService';

type RiskStatus = 'Safe' | 'Watch' | 'Alert' | 'Critical';

const getRiskStatus = (level: number): { status: RiskStatus; color: string } => {
  // Example bands – adjust thresholds to match your domain
  if (level < 10) {
    return { status: 'Safe', color: '#16a34a' }; // green
  } else if (level < 20) {
    return { status: 'Watch', color: '#f59e0b' }; // amber
  } else if (level < 25) {
    return { status: 'Alert', color: '#ea580c' }; // orange
  } else {
    return { status: 'Critical', color: '#b91c1c' }; // red
  }
};

const buildRecommendations = (
  status: RiskStatus,
  trend: PredictionResult['trend'],
  currentLevel: number,
  futureLevel: number,
  horizonYears: number
): string[] => {
  const recs: string[] = [];

  // Generic interpretation of trend
  if (trend === 'increasing') {
    recs.push(
      'Groundwater level is improving compared to the last observation. Maintain current conservation measures.'
    );
  } else if (trend === 'decreasing') {
    recs.push(
      'Groundwater level is declining. Consider additional recharge structures and stricter extraction control.'
    );
  } else {
    recs.push(
      'Groundwater level is relatively stable. Continue monitoring to detect early signs of stress.'
    );
  }

  // Risk-based advice
  if (status === 'Safe') {
    recs.push(
      'Current conditions are within a safe range, but periodic monitoring is still recommended.'
    );
  } else if (status === 'Watch') {
    recs.push(
      'Levels are entering a watch zone. Plan for demand management and awareness campaigns in sensitive areas.'
    );
  } else if (status === 'Alert') {
    recs.push(
      'Alert level reached. Prioritize recharge interventions and review large groundwater-dependent usages.'
    );
  } else if (status === 'Critical') {
    recs.push(
      'Critical stress detected. Consider immediate restrictions on new extractions and promote alternative sources.'
    );
  }

  // Forecast-based advice
  const delta = futureLevel - currentLevel;
  if (Math.abs(delta) > 0.5) {
    const direction = delta > 0 ? 'rise' : 'drop';
    recs.push(
      `Model projection suggests a ${direction} of about ${Math.abs(
        delta
      ).toFixed(1)} m over the next ${horizonYears} years. Use this horizon for long-term planning.`
    );
  }

  return recs.slice(0, 3); // keep top 2–3 points
};

export default function PredictionsScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<number[]>([]);
  const [horizonYears, setHorizonYears] = useState<5 | 10>(5);

  const handleRunPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      // Temporary demo values. Later we can wire this to selected station / user input.
      const prediction = await predictGroundwater({
        lat: 22.1,
        lon: 80.55,
        month: 5,
        rainfall: 50,
      });

      setResult(prediction);
      setRecentPredictions((prev) => {
        const updated = [...prev, prediction.predictedLevel];
        return updated.slice(-6);
      });
    } catch (e) {
      setError('Failed to fetch prediction. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const maxPrediction =
    recentPredictions.length > 0 ? Math.max(...recentPredictions) : null;

  const buildYearProjection = () => {
    if (!result) return null;

    const currentYear = new Date().getFullYear();
    const centerLevel = result.predictedLevel;

    let yearlyChange = 0;
    if (result.trend === 'increasing') {
      yearlyChange = 0.15; // meters per year (illustrative)
    } else if (result.trend === 'decreasing') {
      yearlyChange = -0.15;
    }

    const years: number[] = [];
    const levels: number[] = [];

    for (let offset = 0; offset <= horizonYears; offset++) {
      years.push(currentYear + offset);
      levels.push(centerLevel + yearlyChange * offset);
    }

    return { years, levels };
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Groundwater Prediction</Text>
        <Text style={styles.subtitle}>
          Run the model to get a predicted groundwater level for the demo
          location.
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRunPrediction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Run Prediction</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {result &&
          (() => {
            const { status, color } = getRiskStatus(result.predictedLevel);

            return (
              <View style={styles.resultCard}>
                <View style={styles.resultHeaderRow}>
                  <Text style={styles.resultLabel}>Predicted Water Level</Text>
                  <View
                    style={[
                      styles.riskChip,
                      { backgroundColor: color + '20' },
                    ]}
                  >
                    <View
                      style={[styles.riskDot, { backgroundColor: color }]}
                    />
                    <Text style={[styles.riskChipText, { color }]}>{status}</Text>
                  </View>
                </View>

                <Text style={styles.resultValue}>
                  {result.predictedLevel.toFixed(2)} m bgl
                </Text>
                <Text style={styles.resultMeta}>Trend: {result.trend}</Text>
              </View>
            );
          })()}
      </View>

      <View style={styles.graphSection}>
        <View style={styles.horizonHeader}>
          <Text style={styles.graphTitle}>
            {horizonYears}-Year Projection (Illustrative)
          </Text>
          <View style={styles.horizonToggleContainer}>
            <TouchableOpacity
              style={[
                styles.horizonButton,
                horizonYears === 5 && styles.horizonButtonActive,
              ]}
              onPress={() => setHorizonYears(5)}
            >
              <Text
                style={[
                  styles.horizonButtonText,
                  horizonYears === 5 && styles.horizonButtonTextActive,
                ]}
              >
                5 yrs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.horizonButton,
                horizonYears === 10 && styles.horizonButtonActive,
              ]}
              onPress={() => setHorizonYears(10)}
            >
              <Text
                style={[
                  styles.horizonButtonText,
                  horizonYears === 10 && styles.horizonButtonTextActive,
                ]}
              >
                10 yrs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {!result ? (
          <Text style={styles.graphPlaceholder}>
            Run a prediction to see projected groundwater levels over the next
            few years.
          </Text>
        ) : (
          (() => {
            const projection = buildYearProjection();
            if (!projection) {
              return (
                <Text style={styles.graphPlaceholder}>
                  Not enough data to build projection.
                </Text>
              );
            }

            const futureLevel =
              projection.levels[projection.levels.length - 1] ??
              result.predictedLevel;

            return (
              <>
                <LineChart
                  data={{
                    labels: projection.years.map((year, index) =>
                      horizonYears === 5 ||
                      index === 0 ||
                      index === projection.years.length - 1
                        ? String(year)
                        : ''
                    ),
                    datasets: [
                      {
                        data: projection.levels,
                      },
                    ],
                  }}
                  width={Dimensions.get('window').width - 48}
                  height={220}
                  yAxisSuffix=" m"
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(100, 116, 139, ${opacity})`,
                    propsForDots: {
                      r: '3',
                      strokeWidth: '1',
                      stroke: '#0ea5e9',
                    },
                  }}
                  bezier
                  style={styles.lineChart}
                />

                <Text style={styles.projectionSummary}>
                  Current year {new Date().getFullYear()}: ~
                  {result.predictedLevel.toFixed(2)} m · In {horizonYears} years:
                  ~{futureLevel.toFixed(2)} m
                </Text>
              </>
            );
          })()
        )}
      </View>

      {/* Smart recommendations */}
      {result &&
        (() => {
          const projection = buildYearProjection();
          const { status } = getRiskStatus(result.predictedLevel);
          const futureLevel =
            projection && projection.levels.length > 0
              ? projection.levels[projection.levels.length - 1]
              : result.predictedLevel;

          const recs = buildRecommendations(
            status,
            result.trend,
            result.predictedLevel,
            futureLevel,
            horizonYears
          );

          return (
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              {recs.map((text, index) => (
                <View key={index} style={styles.recommendationRow}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>{text}</Text>
                </View>
              ))}
            </View>
          );
        })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  headerSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#475569',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 16,
    color: '#b91c1c',
    textAlign: 'center',
  },
  resultCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    minWidth: '80%',
  },
  resultLabel: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 14,
    color: '#1e293b',
  },
  graphSection: {
    marginTop: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  graphPlaceholder: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  horizonHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  horizonToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    padding: 2,
  },
  horizonButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  horizonButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  horizonButtonText: {
    fontSize: 12,
    color: '#0f172a',
  },
  horizonButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  lineChart: {
    marginTop: 8,
    borderRadius: 16,
  },
  projectionSummary: {
    marginTop: 8,
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  resultHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  riskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 4,
  },
  riskChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationsCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  recommendationBullet: {
    fontSize: 12,
    color: '#0f172a',
    marginRight: 6,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
  },
});