import { Alert } from 'react-native';

export interface PredictionParams {
  lat: number;
  lon: number;
  month: number;
  rainfall: number;
}

export interface PredictionResult {
  predictedLevel: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendations?: string[];
}

// 1) CHANGE THIS to point to your running backend
// If phone and PC are on same Wi‑Fi, use your PC's IPv4 from `ipconfig`:

// If you prefer ngrok, use:
const API_BASE_URL = 'https://keshia-unscrubbed-fretfully.ngrok-free.dev';

export const predictGroundwater = async (
  params: PredictionParams
): Promise<PredictionResult> => {
  try {
    const body = {
      state: 'MP',
      district: 'Seoni',
      LAT: params.lat,
      LON: params.lon,
      SITE_TYPE: 'Bore Well',
      WLCODE: 'TEST-001',
      Date: `2024-${String(params.month).padStart(2, '0')}-01`, // YYYY-MM-DD
      Season: 'Pre-Monsoon',
      Rainfall_monthly: Math.round(params.rainfall),
      Rainfall_seasonal: Math.round(params.rainfall),
      Annual_Ground_Water_Draft_Total: 1000.0,
      Annual_Replenishable_Groundwater_Resource: 1500.0,
      Net_Ground_Water_Availability: 500.0,
      Stage_of_development: 0.7,
      Stage_of_development_calc: 0.7,
      Exploitation_Ratio: 0.8,
      Water_Level_Lag1: 5.0,
    };

    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json(); // { predicted_level: number }
    const predictedLevel = data.predicted_level as number;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (predictedLevel > body.Water_Level_Lag1) trend = 'increasing';
    else if (predictedLevel < body.Water_Level_Lag1) trend = 'decreasing';

    return {
      predictedLevel,
      confidence: 0.85,
      trend,
      recommendations: [
        'Consider reducing water usage during peak hours',
        'Monitor water levels weekly during dry season',
      ],
    };
  } catch (error) {
    console.error('Prediction error:', error);
    Alert.alert('Error', 'Failed to get prediction from server.');
    throw error;
  }
};


