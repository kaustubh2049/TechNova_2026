# DWLR Metrics Calculation Documentation

This document explains how the **Suitability Score** and **Average Water Level** metrics are dynamically calculated based on real-time DWLR (Digital Water Level Recorder) station data.

---

## 📊 Suitability Score (0-100)

### Overview
The Suitability Score indicates the overall groundwater health and agricultural suitability in your region based on nearby DWLR station readings.

### Calculation Method

#### Step 1: Station Classification
First, we categorize the nearest 10 DWLR stations based on their water levels:

| Category | Water Level Range | Status Code |
|----------|------------------|-------------|
| **Safe** | < 2.5 meters | `normal` |
| **Semi-Critical** | 2.5 - 5 meters | `warning` |
| **Critical** | > 5 meters | `critical` |

#### Step 2: Calculate Ratios
```
safeRatio = (Number of Safe Stations) / (Total Stations)
criticalRatio = (Number of Critical Stations) / (Total Stations)
warningRatio = (Number of Semi-Critical Stations) / (Total Stations)
```

#### Step 3: Apply Scoring Formula
```
Base Score = safeRatio × 100

Penalties:
- Critical Penalty = criticalRatio × 30
- Warning Penalty = warningRatio × 15

Suitability Score = Base Score - Critical Penalty - Warning Penalty
```

The final score is clamped between **0 and 100**.

#### Step 4: Determine Status
| Score Range | Status | Color | Meaning |
|-------------|--------|-------|---------|
| **75 - 100** | Optimal Yield | Blue (#3F9AAE) | Excellent groundwater conditions, ideal for agriculture |
| **50 - 74** | Moderate | Yellow (#eab308) | Acceptable conditions with some concerns |
| **0 - 49** | Poor | Red (#F96E5B) | Critical groundwater stress, agricultural risk |

### Example Calculation

**Scenario:** Region with 10 DWLR stations
- 6 stations = Safe (< 2.5m)
- 3 stations = Semi-Critical (2.5-5m)
- 1 station = Critical (> 5m)

```
safeRatio = 6/10 = 0.6
warningRatio = 3/10 = 0.3
criticalRatio = 1/10 = 0.1

Base Score = 0.6 × 100 = 60
Critical Penalty = 0.1 × 30 = 3
Warning Penalty = 0.3 × 15 = 4.5

Suitability Score = 60 - 3 - 4.5 = 52.5 ≈ 53
Status: Moderate (Yellow)
```

---

## 💧 Average Water Level

### Overview
The Average Water Level metric shows the mean groundwater depth across nearby DWLR stations, indicating current water availability and stress levels.

### Calculation Method

#### Step 1: Calculate Average
```
Sum of all water levels from nearest 10 stations
Average Water Level = ───────────────────────────────────────
                      Number of stations (10)
```

The result is rounded to **1 decimal place** (e.g., 3.4m).

#### Step 2: Determine Trend Classification

| Average Level Range | Trend Status | Color | Indicator |
|---------------------|--------------|-------|-----------|
| **< 2.5m** | Strong Recovery | Green (#22c55e) | Safe groundwater levels |
| **2.5 - 5m** | Moderate Levels | Yellow (#eab308) | Moderate water stress |
| **> 5m** | Critical Levels | Red (#F96E5B) | Severe water stress |

### Example Calculation

**Scenario:** 10 DWLR stations with water levels:
```
Station 1: 2.1m
Station 2: 3.5m
Station 3: 1.8m
Station 4: 4.2m
Station 5: 2.9m
Station 6: 3.7m
Station 7: 2.3m
Station 8: 5.1m
Station 9: 3.0m
Station 10: 2.8m
```

```
Sum = 2.1 + 3.5 + 1.8 + 4.2 + 2.9 + 3.7 + 2.3 + 5.1 + 3.0 + 2.8 = 31.4m

Average Water Level = 31.4 / 10 = 3.14m ≈ 3.1m

Since 2.5m < 3.1m < 5m:
Trend Status: Moderate Levels (Yellow)
```

---

## 🎯 Data Source

### Supabase Table: `st_map_data`

**Required Columns:**
- `Latitude` - GPS latitude coordinate
- `Longitude` - GPS longitude coordinate
- `water_level` - Current water level in meters
- `st_code` - DWLR station identifier code
- `full_address_generated` - Station location address

### Station Selection Logic
1. Fetch all stations from `st_map_data` table
2. Filter stations with valid coordinates (non-zero latitude/longitude)
3. If user location is available:
   - Calculate distance from user to each station
   - Sort by distance (nearest first)
   - Select the **nearest 10 stations** for calculations
4. If no user location:
   - Use the first 10 stations from the database

---

## 🔄 Update Frequency

Both metrics are **calculated in real-time** whenever:
- The app loads the Map screen
- Station data is refreshed from Supabase
- User location changes significantly

---

## 📍 Location-Based Analysis

The metrics are **location-aware**:
- Calculations use the **10 nearest DWLR stations** to your current position
- For "Mahim, Mumbai" (default location), the system finds the 10 closest stations to those coordinates
- As you move to different locations, the metrics automatically recalculate using nearby stations

---

## 🛠️ Implementation

The calculation logic is implemented in:
```
app/(tabs)/alerts.tsx
Function: calculateMetrics()
Lines: 27-93
```

### Code Reference
```typescript
const calculateMetrics = () => {
  // Filter nearest 10 stations
  const nearbyStations = stations.slice(0, 10);
  
  // Count station statuses
  const safeStations = nearbyStations.filter(s => s.status === "normal").length;
  const criticalStations = nearbyStations.filter(s => s.status === "critical").length;
  const warningStations = nearbyStations.filter(s => s.status === "warning").length;
  
  // Calculate suitability score
  const safeRatio = safeStations / nearbyStations.length;
  const criticalPenalty = (criticalStations / nearbyStations.length) * 30;
  const warningPenalty = (warningStations / nearbyStations.length) * 15;
  let suitabilityScore = Math.round((safeRatio * 100) - criticalPenalty - warningPenalty);
  
  // Calculate average water level
  const avgWaterLevel = nearbyStations.reduce((sum, s) => sum + s.currentLevel, 0) / nearbyStations.length;
  
  return { suitabilityScore, avgWaterLevel, ... };
};
```

---

## ⚠️ Edge Cases

### No Station Data
If no stations are available:
- Suitability Score = **0**
- Average Water Level = **0.0m**
- Status = **"No Data"**
- Color = **Gray (#9CA3AF)**

### Insufficient Stations
If fewer than 10 stations are available, the calculation uses all available stations instead.

---

## 📈 Future Enhancements

Potential improvements to the metrics:
1. **Historical Trend Analysis** - Compare current levels with past months
2. **Seasonal Adjustments** - Apply different scoring during monsoon vs dry seasons
3. **Weighted Scoring** - Give more weight to critical stations closer to user
4. **Rainfall Integration** - Factor in recent rainfall data
5. **Soil Type Consideration** - Adjust scores based on regional soil permeability

---

## 📞 Support

For questions about metric calculations or data sources:
- Check the codebase: `app/(tabs)/alerts.tsx`
- Review station provider: `providers/stations-provider.tsx`
- Verify database schema: Supabase `st_map_data` table

---

*Last Updated: January 17, 2026*
