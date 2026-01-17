"""
DWLR Groundwater Level Simulator
=================================
Generates realistic 10-minute interval groundwater readings for Supabase.
Handles backfilling, multiple scenarios, and system downtime recovery.
"""

from supabase import create_client
from datetime import datetime, timedelta
import random
import csv
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ================= CONFIG =================
SUPABASE_URL = os.getenv("EXPO_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY", "")

# Fallback to app.json if .env not found
if not SUPABASE_URL or not SUPABASE_KEY:
    try:
        import json
        app_json_path = os.path.join(os.path.dirname(__file__), "..", "app.json")
        with open(app_json_path, "r") as f:
            app_config = json.load(f)
            SUPABASE_URL = app_config["expo"]["extra"]["supabaseUrl"]
            SUPABASE_KEY = app_config["expo"]["extra"]["supabaseAnonKey"]
            print("ℹ️  Using credentials from app.json")
    except Exception as e:
        print(f"❌ Error: Could not load Supabase credentials from .env or app.json")
        print(f"   {e}")
        exit(1)

TABLE_NAME = "district_data"
LOCAL_BACKUP_FILE = "simulated_readings.csv"

INTERVAL_MINUTES = 10
SCENARIO = "normal"   # normal | drought | over_extraction | recharge
WLCODE = "W06744"     # station you want to simulate
# =========================================

print(f"Initializing DWLR Simulator for {WLCODE}...")
print(f"Supabase URL: {SUPABASE_URL[:30]}...")
print(f"Table: {TABLE_NAME}")
print(f"Scenario: {SCENARIO}")
print("-" * 50)

# Connect to Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def round_down_to_10_minutes(dt):
    """Round datetime down to nearest 10-minute mark"""
    rounded_minute = (dt.minute // 10) * 10
    return dt.replace(minute=rounded_minute, second=0, microsecond=0)


def generate_missing_slots(last_ts, current_ts):
    """Generate all missing 10-minute slots between two timestamps"""
    slots = []
    next_ts = last_ts + timedelta(minutes=INTERVAL_MINUTES)
    while next_ts <= current_ts:
        slots.append(next_ts)
        next_ts += timedelta(minutes=INTERVAL_MINUTES)
    return slots


def fetch_last_record():
    """Fetch the most recent reading from Supabase"""
    try:
        response = (
            supabase
            .table(TABLE_NAME)
            .select("timestamp, Water_Level")
            .eq("WLCODE", WLCODE)
            .order("timestamp", desc=True)
            .limit(1)
            .execute()
        )

        if response.data and len(response.data) > 0:
            # Handle timestamp from Supabase
            ts_str = response.data[0].get("timestamp")
            if ts_str:
                # Remove timezone info if present
                ts_str = ts_str.replace('Z', '+00:00')
                ts = datetime.fromisoformat(ts_str)
            else:
                ts = None
            
            wl = float(response.data[0].get("Water_Level", 3.0))
            return ts, wl
        else:
            return None, None
    except Exception as e:
        print(f"Error fetching last record: {e}")
        return None, None


def simulate_water_level(previous, scenario):
    """
    Simulate realistic water level changes based on scenario
    
    Args:
        previous: Previous water level in meters
        scenario: One of 'normal', 'drought', 'over_extraction', 'recharge'
    
    Returns:
        New water level in meters
    """
    if scenario == "normal":
        # Small natural fluctuations
        delta = random.uniform(-0.01, 0.01)

    elif scenario == "drought":
        # Declining trend
        delta = random.uniform(-0.03, -0.06)

    elif scenario == "over_extraction":
        # Rapid decline
        delta = random.uniform(-0.06, -0.10)

    elif scenario == "recharge":
        # Rising trend (monsoon/artificial recharge)
        delta = random.uniform(0.05, 0.10)

    else:
        delta = 0

    # Ensure water level stays positive and realistic
    new_value = max(previous + delta, 0.1)
    return round(new_value, 3)


def save_locally(timestamp, water_level):
    """Save reading to local CSV backup"""
    file_exists = os.path.isfile(LOCAL_BACKUP_FILE)

    with open(LOCAL_BACKUP_FILE, mode="a", newline="") as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(["WLCODE", "timestamp", "water_level", "scenario"])
        writer.writerow([WLCODE, timestamp.isoformat(), water_level, SCENARIO])


def insert_to_supabase(timestamp, water_level, p_no):
    """Insert reading into Supabase"""
    try:
        supabase.table(TABLE_NAME).insert({
            "P_no": p_no,
            "WLCODE": WLCODE,
            "timestamp": timestamp.isoformat(),
            "Water_Level": water_level,
            "LAT": 25.3176,  # Example coordinates
            "LON": 82.9739,
            "scenario": SCENARIO,
            "SITE_TYPE": "DWLR Station",
            "District": "Varanasi",
            "State": "Uttar Pradesh"
        }).execute()
        return True
    except Exception as e:
        print(f"Error inserting to Supabase: {e}")
        return False


def run_simulator():
    """Main simulation loop"""
    print("\n🚀 Starting DWLR Simulator...\n")

    # Fetch last recorded data
    last_ts, last_wl = fetch_last_record()

    if last_ts is None:
        print("ℹ️  No existing data found. Initializing...")
        last_ts = round_down_to_10_minutes(datetime.utcnow() - timedelta(hours=1))
        last_wl = 3.0  # Safe starting value (3 meters)
        print(f"   Starting from: {last_ts}")
        print(f"   Initial level: {last_wl} m")
    else:
        print(f"✓ Last record found:")
        print(f"   Timestamp: {last_ts}")
        print(f"   Water Level: {last_wl} m")

    # Get current time (rounded)
    now = round_down_to_10_minutes(datetime.utcnow())
    print(f"\n⏰ Current time (rounded): {now}")

    # Generate missing time slots
    missing_slots = generate_missing_slots(last_ts, now)

    if not missing_slots:
        print("\n✓ No missing data. System is up to date.")
        return

    print(f"\n📊 Backfilling {len(missing_slots)} intervals...\n")

    current_level = last_wl
    success_count = 0
    
    # Get starting P_no
    try:
        response = supabase.table(TABLE_NAME).select("P_no").order("P_no", desc=True).limit(1).execute()
        if response.data:
            p_no = response.data[0]["P_no"] + 1
        else:
            p_no = 1
    except:
        p_no = 1

    for i, ts in enumerate(missing_slots, 1):
        current_level = simulate_water_level(current_level, SCENARIO)

        # Save locally
        save_locally(ts, current_level)
        
        # Insert to Supabase
        if insert_to_supabase(ts, current_level, p_no):
            success_count += 1
            print(f"   [{i}/{len(missing_slots)}] {ts.strftime('%Y-%m-%d %H:%M:%S')} → {current_level:.3f} m ✓")
        else:
            print(f"   [{i}/{len(missing_slots)}] {ts.strftime('%Y-%m-%d %H:%M:%S')} → {current_level:.3f} m ✗")
        
        p_no += 1

    print(f"\n{'='*50}")
    print(f"✓ Simulation complete!")
    print(f"  Total slots: {len(missing_slots)}")
    print(f"  Successful: {success_count}")
    print(f"  Failed: {len(missing_slots) - success_count}")
    print(f"  Final water level: {current_level:.3f} m")
    print(f"  Local backup: {LOCAL_BACKUP_FILE}")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    try:
        run_simulator()
    except KeyboardInterrupt:
        print("\n\n⚠️  Simulation interrupted by user.")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
