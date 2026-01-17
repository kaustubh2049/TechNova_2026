# 🚀 MAKE DATA DYNAMIC - STEP BY STEP

## 🎯 YOUR GOAL
When you run the simulator:
1. New water level data appears in Supabase
2. SQL triggers automatically create alerts
3. Your app shows these alerts in real-time

---

## ⚡ QUICK START (3 STEPS)

### STEP 1: Run Fixed SQL Triggers in Supabase
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy ALL contents from: `scripts/scripts/sql/01_alerts_triggers_FIXED.sql`
3. Paste in SQL Editor → Click **RUN**
4. You should see: "Alerts table created successfully"

### STEP 2: Open Command Prompt in scripts folder
```cmd
cd c:\Users\Kaustubh\Downloads\TechNova_2026\scripts\scripts
```

### STEP 3: Run the Multi-Station Continuous Simulator
```cmd
run_multi_continuous.bat
```

---

## ✅ THAT'S IT!

Now:
- Every 10 minutes, new data is inserted
- SQL triggers auto-generate alerts
- Your app shows the alerts on the Early Warning Alerts page
- Bell icon → Alerts appear!

---

## 📊 HOW IT WORKS

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATIC FLOW                           │
└─────────────────────────────────────────────────────────────┘

1. run_multi_continuous.bat (runs every 10 min)
              ↓
2. multi_station_simulator.py
              ↓
3. Inserts new readings into → district_data table
              ↓
4. SQL Triggers (automatic!) detect:
   • Water < 1.0m → CRITICAL alert
   • Drop > 0.3m/hour → RAPID_DECLINE alert
   • Water 1-2m → LOW_LEVEL warning
              ↓
5. Alerts inserted into → groundwater_alerts table
              ↓
6. React Native App (refreshes every 30s)
              ↓
7. Early Warning Alerts page shows alerts!
```

---

## 🎬 DEMO FOR JUDGES

### Force an Alert (for testing):
Run this in Supabase SQL Editor:
```sql
-- This will create a CRITICAL alert
INSERT INTO district_data ("WLCODE", "Water_Level", timestamp, "District", "State")
VALUES ('DEMO001', 0.5, now(), 'Demo District', 'Demo State');

-- Check the alert was created
SELECT * FROM groundwater_alerts ORDER BY triggered_at DESC LIMIT 5;
```

### Clear Test Alerts:
```sql
DELETE FROM groundwater_alerts WHERE wlcode = 'DEMO001';
DELETE FROM district_data WHERE "WLCODE" = 'DEMO001';
```

---

## 🔧 CHANGE SIMULATION SCENARIO

To make water levels drop faster (for demo):

**In Supabase SQL Editor:**
```sql
-- Set all stations to over_extraction (fast decline)
UPDATE station_scenarios SET scenario = 'over_extraction';

-- Or set to recharge (rising levels)
UPDATE station_scenarios SET scenario = 'recharge';

-- Or back to normal
UPDATE station_scenarios SET scenario = 'normal';
```

The next simulator run will use the new scenario!

---

## 📱 SEE ALERTS IN APP

1. Open your app
2. Go to Home screen
3. Click 🔔 Bell icon (top right)
4. See the **Early Warning Alerts** page!

Alerts refresh every 30 seconds automatically.

---

## 🛑 TROUBLESHOOTING

### "No alerts appearing"
- Make sure you ran the FIXED SQL script (01_alerts_triggers_FIXED.sql)
- Check if simulator is running: you should see "Inserted X readings" 
- Force a test alert with the SQL above

### "Simulator not running"
- Make sure you're in the right folder: `scripts/scripts`
- Try: `python multi_station_simulator.py` directly

### "Error: Could not load Supabase credentials"
- Check `.env` file exists in `scripts/scripts` folder
- It should contain:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
  ```

---

## ✅ CHECKLIST

- [ ] SQL triggers installed (run 01_alerts_triggers_FIXED.sql)
- [ ] `.env` file exists in scripts/scripts folder
- [ ] `run_multi_continuous.bat` is running
- [ ] App shows alerts on Bell icon page
- [ ] Tested with forced alert

---

**Your dynamic data pipeline is ready!** 🎉
