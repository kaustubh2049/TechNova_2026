# Advanced DWLR Simulator - Complete Setup Guide

## 🎯 Overview

This advanced setup includes:
1. **Automatic SQL Triggers** - Real-time alert generation
2. **Multi-Station Simulation** - Simulate all stations at once
3. **Dynamic Scenario Control** - Change scenarios without code

---

## 📋 Prerequisites

- Python 3.8+ installed
- Supabase project set up
- Access to Supabase SQL Editor

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run SQL Scripts in Supabase

**Go to:** https://supabase.com/dashboard → Your Project → SQL Editor

**Run in order:**

1. **`01_alerts_triggers.sql`** - Creates alerts table & triggers
   ```sql
   -- Copy paste content from scripts/sql/01_alerts_triggers.sql
   ```

2. **`02_scenario_config.sql`** - Creates configuration tables
   ```sql
   -- Copy paste content from scripts/sql/02_scenario_config.sql
   ```

**Verify:**
```sql
SELECT * FROM groundwater_alerts LIMIT 5;
SELECT * FROM simulation_config;
SELECT * FROM station_scenarios;
```

### Step 2: Install Python Dependencies

```bash
cd d:\TechNova_2026\scripts
pip install -r requirements.txt
```

### Step 3: Run Multi-Station Simulator

```bash
python multi_station_simulator.py
```

---

## 📊 Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                   React Native App                      │
│          (Change scenario via UI - optional)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (simulation_config)               │
│         scenario: 'normal' | 'drought' | etc.           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Python Multi-Station Simulator                │
│        (Runs every 10 minutes automatically)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               district_data table                       │
│           (New water level readings)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              SQL Triggers (Automatic)                   │
│     check_critical_level() | check_rapid_decline()     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            groundwater_alerts table                     │
│              (Auto-generated alerts)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   React Native App                      │
│              (Display alerts to users)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎮 Usage Examples

### View Alerts in Supabase

```sql
-- All alerts
SELECT * FROM groundwater_alerts 
ORDER BY triggered_at DESC 
LIMIT 10;

-- Critical alerts only
SELECT * FROM groundwater_alerts 
WHERE severity = 'HIGH' 
  AND acknowledged = false;

-- Alerts for specific station
SELECT * FROM groundwater_alerts 
WHERE wlcode = 'W06744' 
ORDER BY triggered_at DESC;
```

### Change Global Scenario

```sql
-- Switch to drought mode
UPDATE simulation_config 
SET scenario = 'drought' 
WHERE id = 1;

-- Switch to recharge mode (monsoon)
UPDATE simulation_config 
SET scenario = 'recharge' 
WHERE id = 1;
```

### Change Individual Station Scenario

```sql
-- Make W06744 simulate drought
UPDATE station_scenarios 
SET scenario = 'drought' 
WHERE wlcode = 'W06744';

-- Make W06745 simulate recharge
UPDATE station_scenarios 
SET scenario = 'recharge' 
WHERE wlcode = 'W06745';
```

### Run Different Simulators

```bash
# Single station (old method)
python dwlr_simulator.py

# All stations (new method)
python multi_station_simulator.py

# Continuous mode (all stations, every 10 min)
.\run_multi_continuous.bat
```

---

## 🔔 Alert Types

| Alert Type | Trigger Condition | Severity | Auto-Generated |
|-----------|-------------------|----------|----------------|
| `CRITICAL_LEVEL` | Water < 1.0m | HIGH | ✅ SQL Trigger |
| `RAPID_DECLINE` | Drop > 0.3m in 1 hour | MEDIUM | ✅ SQL Trigger |
| `LOW_LEVEL_WARNING` | Water 1.0m - 2.0m | LOW | ✅ SQL Trigger |

---

## 🎬 Demo Script for Judges

### Demo 1: Real-Time Alerts

```bash
# 1. Set station to critical scenario
UPDATE station_scenarios SET scenario = 'over_extraction' WHERE wlcode = 'W06744';

# 2. Run simulator
python multi_station_simulator.py

# 3. Check alerts (should see RAPID_DECLINE)
SELECT * FROM groundwater_alerts WHERE wlcode = 'W06744' ORDER BY triggered_at DESC;

# 4. Show in app
# → Navigate to station W06744
# → See alert banner
```

### Demo 2: Multi-Scenario Simulation

```bash
# 1. Configure 4 different scenarios
UPDATE station_scenarios SET scenario = 'normal' WHERE wlcode = 'W06744';
UPDATE station_scenarios SET scenario = 'drought' WHERE wlcode = 'W06745';
UPDATE station_scenarios SET scenario = 'recharge' WHERE wlcode = 'W06746';
UPDATE station_scenarios SET scenario = 'over_extraction' WHERE wlcode = 'W06747';

# 2. Run multi-station simulator
python multi_station_simulator.py

# 3. Open app and show:
# → W06744: Stable levels (green)
# → W06745: Declining (yellow)
# → W06746: Rising (green/blue)
# → W06747: Critical (red)
```

### Demo 3: Backfilling After Downtime

```bash
# 1. Stop simulator for 30-60 minutes

# 2. Run again
python multi_station_simulator.py
# → Shows "Backfilling X intervals..."

# 3. Show in app
# → Charts have no gaps
# → Data is continuous
```

---

## 📱 React Native Integration

### Fetch Alerts in App

Add to `providers/stations-provider.tsx`:

```typescript
const fetchStationAlerts = async (wlcode: string) => {
  const { data, error } = await supabase
    .from('groundwater_alerts')
    .select('*')
    .eq('wlcode', wlcode)
    .eq('acknowledged', false)
    .order('triggered_at', { ascending: false })
    .limit(5);
  
  if (error) console.error(error);
  return data || [];
};
```

### Display Alerts in Station Details

```typescript
const alerts = await fetchStationAlerts(station.id);

{alerts.map(alert => (
  <View style={styles.alertBanner} key={alert.id}>
    <Text style={styles.alertTitle}>{alert.alert_type}</Text>
    <Text style={styles.alertMessage}>{alert.message}</Text>
  </View>
))}
```

---

## 🔄 Continuous Operation

### Windows (PowerShell)

```powershell
# Run forever
while ($true) { 
    python multi_station_simulator.py
    Start-Sleep -Seconds 600 
}
```

### Linux/Mac

```bash
# Run forever
while true; do 
    python multi_station_simulator.py
    sleep 600
done
```

### crontab (Linux/Mac)

```bash
# Every 10 minutes
*/10 * * * * cd /path/to/TechNova_2026/scripts && python multi_station_simulator.py
```

---

## 🎯 Configuration Options

### Scenario Effects

| Scenario | Water Level Change | Alert Probability |
|----------|-------------------|-------------------|
| `normal` | ±0.01m / 10min | Very Low |
| `drought` | -0.03 to -0.06m | Medium |
| `over_extraction` | -0.06 to -0.10m | **High** |
| `recharge` | +0.05 to +0.10m | Low |

### Add New Stations

```sql
INSERT INTO station_scenarios (wlcode, scenario, start_level, lat, lon, district, state)
VALUES ('W06748', 'normal', 3.5, 25.5000, 83.0000, 'Varanasi', 'UP');
```

---

## 🐛 Troubleshooting

### No Alerts Generated

**Check:**
1. Are triggers installed? `SELECT * FROM information_schema.triggers;`
2. Is water level below threshold? `SELECT "Water_Level" FROM district_data WHERE "WLCODE" = 'W06744' ORDER BY timestamp DESC LIMIT 1;`

### Simulator Not Reading Scenarios

**Fix:**
```bash
# Verify tables exist
SELECT * FROM simulation_config;
SELECT * FROM station_scenarios;

# If missing, run: scripts/sql/02_scenario_config.sql
```

### Connection Errors

**Fix:**
```bash
# Check .env file exists
cat .env | grep SUPABASE

# Or verify app.json
cat app.json | grep supabase
```

---

## 📊 Monitoring

### View Simulation Stats

```sql
-- Total readings per station (last 24 hours)
SELECT "WLCODE", COUNT(*) as readings
FROM district_data
WHERE timestamp > now() - interval '24 hours'
GROUP BY "WLCODE"
ORDER BY readings DESC;

-- Alert statistics
SELECT alert_type, severity, COUNT(*) as count
FROM groundwater_alerts
GROUP BY alert_type, severity
ORDER BY count DESC;

-- Station current status
SELECT s."WLCODE", s.scenario, d."Water_Level", d.timestamp
FROM station_scenarios s
LEFT JOIN LATERAL (
    SELECT "Water_Level", timestamp
    FROM district_data
    WHERE "WLCODE" = s.wlcode
    ORDER BY timestamp DESC
    LIMIT 1
) d ON true;
```

---

## 🏆 Hackathon Demo Tips

1. **Start with clean data** - Delete old test data
2. **Set varied scenarios** - Show all 4 types
3. **Trigger alerts live** - Use over_extraction scenario
4. **Show auto-backfill** - Stop for 30min, restart
5. **Explain architecture** - Show SQL triggers, Python, React flow

---

## 🎁 Next Enhancements

- [ ] Push notifications for critical alerts
- [ ] Forecast-based predictive alerts
- [ ] Alert deduplication (prevent spam)
- [ ] Custom threshold configuration per station
- [ ] Historical alert analytics dashboard
- [ ] GitHub Actions for automated deployment

---

**Built for TechNova 2026** 🚀
