# DWLR Groundwater Simulator

Generates realistic 10-minute interval groundwater readings for the TechNova app.

## Features

✅ **10-minute aligned timestamps** - No gaps, no overlaps
✅ **Automatic backfilling** - Recovers from system downtime
✅ **Multiple scenarios** - Normal, drought, over-extraction, recharge
✅ **Dual storage** - Local CSV backup + Supabase cloud
✅ **Realistic simulation** - Based on actual groundwater behavior

## Setup

### 1. Install Python Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### 2. Configure Environment

Make sure your `.env` file in the project root has:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Edit Configuration (Optional)

Open `dwlr_simulator.py` and modify:

```python
SCENARIO = "normal"   # Change to: drought | over_extraction | recharge
WLCODE = "W06744"     # Change to your station code
```

## Usage

### Run Once

```bash
python dwlr_simulator.py
```

### Run Continuously (Every 10 minutes)

**Windows (PowerShell):**
```powershell
while ($true) { python dwlr_simulator.py; Start-Sleep -Seconds 600 }
```

**Linux/Mac:**
```bash
while true; do python dwlr_simulator.py; sleep 600; done
```

## Scenarios

| Scenario | Description | Water Level Change |
|----------|-------------|-------------------|
| `normal` | Natural fluctuations | ±0.01 m per 10min |
| `drought` | Declining trend | -0.03 to -0.06 m |
| `over_extraction` | Rapid decline | -0.06 to -0.10 m |
| `recharge` | Rising trend (monsoon) | +0.05 to +0.10 m |

## How It Works

1. **Connects to Supabase** and fetches the latest reading
2. **Calculates missing slots** from last reading to now
3. **Simulates realistic values** based on scenario
4. **Saves locally** to `simulated_readings.csv`
5. **Inserts to Supabase** `district_data` table

## Demo Flow

```bash
# 1. Run once → Initial data
python dwlr_simulator.py

# 2. Wait 30-60 minutes (simulate downtime)

# 3. Run again → Backfilled automatically
python dwlr_simulator.py

# 4. Open app → See updated charts & alerts
```

## Output Structure

Data is inserted into `district_data` table:

```sql
{
  "P_no": 1001,
  "WLCODE": "W06744",
  "timestamp": "2026-01-17T14:00:00+00:00",
  "Water_Level": 3.015,
  "LAT": 25.3176,
  "LON": 82.9739,
  "scenario": "normal",
  "SITE_TYPE": "DWLR Station",
  "District": "Varanasi",
  "State": "Uttar Pradesh"
}
```

## Troubleshooting

### "No module named 'supabase'"
```bash
pip install supabase python-dotenv
```

### "SUPABASE_URL is empty"
Make sure `.env` file exists in project root with correct values.

### "Error inserting to Supabase"
Check your Supabase permissions and table schema.

## Multi-Station Simulation

To simulate multiple stations:

```bash
# Station 1
WLCODE="W06744" python dwlr_simulator.py

# Station 2
WLCODE="W06745" python dwlr_simulator.py
```

## Production Deployment

### Option 1: Cron Job (Linux)
```bash
*/10 * * * * cd /path/to/TechNova_2026/scripts && python dwlr_simulator.py
```

### Option 2: GitHub Actions
See `.github/workflows/dwlr-simulator.yml` (if needed)

### Option 3: Cloud Function
Deploy as serverless function on Vercel/AWS Lambda

---

**Built for TechNova 2026 Hackathon** 🚀
