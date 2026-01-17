# ✅ SIMULATOR IS WORKING!

## Quick Reference

### Run Simulator Once
```bash
cd c:\Users\Kaustubh\Downloads\TechNova_2026\scripts\scripts
python multi_station_simulator.py
```

### Run Continuously (Every 10 minutes)
```bash
cd c:\Users\Kaustubh\Downloads\TechNova_2026\scripts\scripts
# PowerShell:
while($true) { python multi_station_simulator.py; Start-Sleep 600 }
```

## Next Steps

### 1. Run SQL Scripts in Supabase
Go to Supabase Dashboard → SQL Editor and run:

**Script 1:** `scripts/scripts/sql/01_alerts_triggers.sql`
**Script 2:** `scripts/scripts/sql/02_scenario_config.sql`

### 2. Check Alerts
After running simulator, check:
```sql
SELECT * FROM groundwater_alerts ORDER BY triggered_at DESC LIMIT 10;
```

### 3. Change Scenarios
```sql
-- Make a station show critical behavior
UPDATE station_scenarios SET scenario = 'over_extraction' WHERE wlcode = 'W06744';

-- Then run simulator again
```

## ✅ Status
- [x] `.env` file created
- [x] Simulator working
- [ ] SQL triggers (need to run in Supabase)
- [ ] Station scenarios table (need to run in Supabase)
- [ ] UI integration (next step)
