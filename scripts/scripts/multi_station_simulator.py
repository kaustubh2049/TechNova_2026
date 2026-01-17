"""
Enhanced Multi-Station DWLR Simulator with Database-Driven Scenarios
====================================================================
Features:
- Fetches scenarios from Supabase (simulation_config / station_scenarios)
- Simulates all configured stations
- Auto-backfills missing data
- Generates realistic water levels
"""

from supabase import create_client
from datetime import datetime, timedelta
import random
import os
import json
from dotenv import load_dotenv

load_dotenv()

# ================= CONFIG =================
SUPABASE_URL = os.getenv("EXPO_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "")

# Fallback to app.json
if not SUPABASE_URL or not SUPABASE_KEY:
    try:
        app_json_path = os.path.join(os.path.dirname(__file__), "..", "app.json")
        with open(app_json_path, "r") as f:
            app_config = json.load(f)
            SUPABASE_URL = app_config["expo"]["extra"]["supabaseUrl"]
            SUPABASE_KEY = app_config["expo"]["extra"]["supabaseAnonKey"]
    except Exception as e:
        print(f"❌ Error: Could not load Supabase credentials")
        exit(1)

TABLE_NAME = "district_data"
INTERVAL_MINUTES = 10
# =========================================

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def round_down_to_10_minutes(dt):
    """Round datetime down to nearest 10-minute mark"""
    rounded_minute = (dt.minute // 10) * 10
    return dt.replace(minute=rounded_minute, second=0, microsecond=0)


def generate_missing_slots(last_ts, current_ts):
    """Generate all missing 10-minute slots"""
    slots = []
    next_ts = last_ts + timedelta(minutes=INTERVAL_MINUTES)
    while next_ts <= current_ts:
        slots.append(next_ts)
        next_ts += timedelta(minutes=INTERVAL_MINUTES)
    return slots


def fetch_global_scenario():
    """Fetch global scenario from simulation_config table"""
    try:
        response = (
            supabase.table("simulation_config")
            .select("scenario")
            .eq("id", 1)
            .single()
            .execute()
        )
        return response.data["scenario"] if response.data else "normal"
    except Exception as e:
        print(f"⚠️  Could not fetch global scenario, using 'normal': {e}")
        return "normal"


def fetch_all_stations():
    """Fetch all stations from station_scenarios table"""
    try:
        response = (
            supabase.table("station_scenarios")
            .select("*")
            .execute()
        )
        if response.data:
            return response.data
        else:
            print("ℹ️  No stations found in station_scenarios table")
            return []
    except Exception as e:
        print(f"⚠️  Could not fetch stations: {e}")
        # Fallback to default stations
        return [
            {
                "wlcode": "W06744",
                "scenario": "normal",
                "start_level": 3.0,
                "lat": 25.3176,
                "lon": 82.9739,
                "district": "Varanasi",
                "state": "Uttar Pradesh"
            }
        ]


def fetch_last_record_per_station(wlcode):
    """Fetch most recent reading for a specific station"""
    try:
        response = (
            supabase.table(TABLE_NAME)
            .select("timestamp, Water_Level")
            .eq("WLCODE", wlcode)
            .order("timestamp", desc=True)
            .limit(1)
            .execute()
        )

        if response.data and len(response.data) > 0:
            ts_str = response.data[0].get("timestamp", "")
            ts_str = ts_str.replace('Z', '+00:00')
            ts = datetime.fromisoformat(ts_str)
            wl = float(response.data[0].get("Water_Level", 3.0))
            return ts, wl
        else:
            return None, None
    except Exception as e:
        print(f"   ⚠️  Error fetching last record: {e}")
        return None, None


def simulate_water_level(previous, scenario):
    """Simulate water level based on scenario"""
    scenarios_config = {
        "normal": (-0.01, 0.01),
        "drought": (-0.06, -0.03),
        "over_extraction": (-0.10, -0.06),
        "recharge": (0.05, 0.10)
    }
    
    min_delta, max_delta = scenarios_config.get(scenario, (0, 0))
    delta = random.uniform(min_delta, max_delta)
    new_value = max(previous + delta, 0.1)
    return round(new_value, 3)


def insert_to_supabase(timestamp, water_level, station_config, p_no):
    """Insert reading into Supabase"""
    try:
        supabase.table(TABLE_NAME).insert({
            "P_no": p_no,
            "WLCODE": station_config["wlcode"],
            "timestamp": timestamp.isoformat(),
            "Water_Level": water_level,
            "LAT": station_config.get("lat", 0),
            "LON": station_config.get("lon", 0),
            "scenario": station_config.get("scenario", "normal"),
            "SITE_TYPE": "DWLR Station",
            "District": station_config.get("district", ""),
            "State": station_config.get("state", "")
        }).execute()
        return True
    except Exception as e:
        print(f"   ✗ Error inserting: {e}")
        return False


def run_multi_station_simulator():
    """Simulate all configured stations"""
    print("\n" + "=" * 70)
    print("  MULTI-STATION DWLR SIMULATOR")
    print("=" * 70)
    
    # Fetch global scenario
    global_scenario = fetch_global_scenario()
    print(f"\n🌍 Global Scenario: {global_scenario.upper()}")
    
    # Fetch all stations
    stations = fetch_all_stations()
    print(f"📍 Stations to simulate: {len(stations)}\n")
    
    if not stations:
        print("❌ No stations configured. Please run SQL script 02_scenario_config.sql")
        return
    
    now = round_down_to_10_minutes(datetime.utcnow())
    print(f"⏰ Current time: {now.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Get next P_no
    try:
        response = supabase.table(TABLE_NAME).select("P_no").order("P_no", desc=True).limit(1).execute()
        p_no = (response.data[0]["P_no"] + 1) if response.data else 1
    except:
        p_no = 1
    
    total_inserted = 0
    
    for idx, station in enumerate(stations, 1):
        wlcode = station["wlcode"]
        scenario = station.get("scenario", global_scenario)
        
        print(f"[{idx}/{len(stations)}] {wlcode}")
        print(f"   Scenario: {scenario}")
        
        # Fetch last reading
        last_ts, last_wl = fetch_last_record_per_station(wlcode)
        
        if last_ts is None:
            # Initialize new station
            last_ts = now - timedelta(hours=1)
            last_wl = station.get("start_level", random.uniform(2.0, 5.0))
            print(f"   ℹ️  Initializing: {last_wl:.3f}m")
        else:
            print(f"   Last: {last_ts.strftime('%H:%M')} → {last_wl:.3f}m")
        
        # Generate missing slots
        missing_slots = generate_missing_slots(last_ts, now)
        
        if not missing_slots:
            print(f"   ✓ Up to date\n")
            continue
        
        print(f"   Backfilling {len(missing_slots)} intervals...")
        
        current_level = last_wl
        success_count = 0
        
        for ts in missing_slots:
            current_level = simulate_water_level(current_level, scenario)
            if insert_to_supabase(ts, current_level, station, p_no):
                success_count += 1
                total_inserted += 1
            p_no += 1
        
        change = current_level - last_wl
        symbol = "📈" if change > 0 else "📉" if change < 0 else "➡️"
        print(f"   {last_wl:.3f}m → {current_level:.3f}m {symbol} ({change:+.3f}m)")
        print(f"   ✓ Inserted {success_count}/{len(missing_slots)} readings\n")
    
    print("=" * 70)
    print(f"✅ SIMULATION COMPLETE")
    print(f"   Total readings inserted: {total_inserted}")
    print(f"   Stations updated: {len(stations)}")
    print("=" * 70)
    print()


if __name__ == "__main__":
    try:
        run_multi_station_simulator()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
