-- =====================================================
-- SCENARIO CONFIGURATION TABLE
-- =====================================================
-- Run this in Supabase SQL Editor
-- Allows dynamic scenario switching without code changes
-- =====================================================

-- Step 1: Create Configuration Table
-- =====================================================
CREATE TABLE IF NOT EXISTS simulation_config (
    id INT PRIMARY KEY,
    scenario TEXT NOT NULL CHECK (scenario IN ('normal', 'drought', 'over_extraction', 'recharge')),
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default configuration
INSERT INTO simulation_config (id, scenario, description)
VALUES (1, 'normal', 'Normal groundwater fluctuations')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Step 2: Create Station-Specific Scenarios (Optional)
-- =====================================================
-- Allows different scenarios for different stations
-- =====================================================

CREATE TABLE IF NOT EXISTS station_scenarios (
    wlcode TEXT PRIMARY KEY,
    scenario TEXT NOT NULL CHECK (scenario IN ('normal', 'drought', 'over_extraction', 'recharge')),
    start_level FLOAT,
    lat FLOAT,
    lon FLOAT,
    district TEXT,
    state TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert example stations with different scenarios
INSERT INTO station_scenarios (wlcode, scenario, start_level, lat, lon, district, state)
VALUES 
    ('W06744', 'normal', 3.0, 25.3176, 82.9739, 'Varanasi', 'Uttar Pradesh'),
    ('W06745', 'drought', 2.5, 25.4358, 81.8463, 'Prayagraj', 'Uttar Pradesh'),
    ('W06746', 'recharge', 4.2, 25.5881, 83.5690, 'Ghazipur', 'Uttar Pradesh'),
    ('W06747', 'over_extraction', 1.8, 25.1460, 82.5690, 'Mirzapur', 'Uttar Pradesh')
ON CONFLICT (wlcode) DO UPDATE SET
    scenario = EXCLUDED.scenario,
    updated_at = now();

-- =====================================================
-- Step 3: Create Update Function with Timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_simulation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_simulation_config_timestamp
BEFORE UPDATE ON simulation_config
FOR EACH ROW
EXECUTE FUNCTION update_simulation_timestamp();

CREATE TRIGGER update_station_scenarios_timestamp
BEFORE UPDATE ON station_scenarios
FOR EACH ROW
EXECUTE FUNCTION update_simulation_timestamp();

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Change global scenario
-- UPDATE simulation_config SET scenario = 'drought' WHERE id = 1;

-- Change specific station scenario
-- UPDATE station_scenarios SET scenario = 'recharge' WHERE wlcode = 'W06744';

-- View current configuration
-- SELECT * FROM simulation_config;

-- View all station scenarios
-- SELECT * FROM station_scenarios ORDER BY wlcode;

-- Add new station
-- INSERT INTO station_scenarios (wlcode, scenario, start_level, lat, lon, district, state)
-- VALUES ('W06748', 'normal', 3.5, 25.5000, 83.0000, 'Varanasi', 'Uttar Pradesh');
