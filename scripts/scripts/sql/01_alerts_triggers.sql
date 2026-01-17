-- =====================================================
-- GROUNDWATER ALERTS - SQL TRIGGERS
-- =====================================================
-- Run this in Supabase SQL Editor
-- Creates automatic alert generation on data insert
-- =====================================================

-- Step 1: Create Alerts Table
-- =====================================================
CREATE TABLE IF NOT EXISTS groundwater_alerts (
    id BIGSERIAL PRIMARY KEY,
    wlcode TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    water_level FLOAT,
    triggered_at TIMESTAMPTZ DEFAULT now(),
    acknowledged BOOLEAN DEFAULT false
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_groundwater_alerts_wlcode ON groundwater_alerts(wlcode);
CREATE INDEX IF NOT EXISTS idx_groundwater_alerts_triggered_at ON groundwater_alerts(triggered_at);
CREATE INDEX IF NOT EXISTS idx_groundwater_alerts_severity ON groundwater_alerts(severity);

-- =====================================================
-- Step 2: Critical Level Alert Trigger
-- =====================================================
-- Triggers when water level drops below 1.0m
-- =====================================================

CREATE OR REPLACE FUNCTION check_critical_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."Water_Level" < 1.0 THEN
        INSERT INTO groundwater_alerts (
            wlcode, 
            alert_type, 
            severity, 
            message,
            water_level
        )
        VALUES (
            NEW."WLCODE",
            'CRITICAL_LEVEL',
            'HIGH',
            'Groundwater level dropped below critical threshold (1.0m)',
            NEW."Water_Level"
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS critical_level_trigger ON district_data;

-- Create trigger
CREATE TRIGGER critical_level_trigger
AFTER INSERT ON district_data
FOR EACH ROW
EXECUTE FUNCTION check_critical_level();

-- =====================================================
-- Step 3: Rapid Decline Alert Trigger
-- =====================================================
-- Triggers if water level drops > 0.3m in last hour (6 readings)
-- =====================================================

CREATE OR REPLACE FUNCTION check_rapid_decline()
RETURNS TRIGGER AS $$
DECLARE
    previous_level FLOAT;
    decline_amount FLOAT;
BEGIN
    -- Get water level from 6 readings ago (1 hour)
    SELECT "Water_Level"
    INTO previous_level
    FROM district_data
    WHERE "WLCODE" = NEW."WLCODE"
      AND timestamp < NEW.timestamp
    ORDER BY timestamp DESC
    OFFSET 5 LIMIT 1;

    -- Check if decline is significant
    IF previous_level IS NOT NULL THEN
        decline_amount := previous_level - NEW."Water_Level";
        
        IF decline_amount > 0.3 THEN
            INSERT INTO groundwater_alerts (
                wlcode, 
                alert_type, 
                severity, 
                message,
                water_level
            )
            VALUES (
                NEW."WLCODE",
                'RAPID_DECLINE',
                'MEDIUM',
                format('Rapid groundwater decline detected: %.2fm drop in last hour', decline_amount),
                NEW."Water_Level"
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS rapid_decline_trigger ON district_data;

-- Create trigger
CREATE TRIGGER rapid_decline_trigger
AFTER INSERT ON district_data
FOR EACH ROW
EXECUTE FUNCTION check_rapid_decline();

-- =====================================================
-- Step 4: Low Level Warning Trigger
-- =====================================================
-- Triggers when water level is between 1.0m and 2.0m
-- =====================================================

CREATE OR REPLACE FUNCTION check_low_level_warning()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."Water_Level" >= 1.0 AND NEW."Water_Level" < 2.0 THEN
        INSERT INTO groundwater_alerts (
            wlcode, 
            alert_type, 
            severity, 
            message,
            water_level
        )
        VALUES (
            NEW."WLCODE",
            'LOW_LEVEL_WARNING',
            'LOW',
            format('Water level approaching critical threshold: %.2fm', NEW."Water_Level"),
            NEW."Water_Level"
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS low_level_trigger ON district_data;

-- Create trigger
CREATE TRIGGER low_level_trigger
AFTER INSERT ON district_data
FOR EACH ROW
EXECUTE FUNCTION check_low_level_warning();

-- =====================================================
-- Step 5: Verify Installation
-- =====================================================
-- Run this to check if everything is set up correctly
-- =====================================================

SELECT 'Alerts table created' as status 
FROM information_schema.tables 
WHERE table_name = 'groundwater_alerts';

SELECT 'Triggers installed: ' || count(*) as status
FROM information_schema.triggers 
WHERE trigger_name LIKE '%_level_%trigger';

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- View all alerts
-- SELECT * FROM groundwater_alerts ORDER BY triggered_at DESC LIMIT 10;

-- View alerts for specific station
-- SELECT * FROM groundwater_alerts WHERE wlcode = 'W06744' ORDER BY triggered_at DESC;

-- View unacknowledged critical alerts
-- SELECT * FROM groundwater_alerts WHERE severity = 'HIGH' AND acknowledged = false;

-- Acknowledge an alert
-- UPDATE groundwater_alerts SET acknowledged = true WHERE id = 1;

-- Clear old alerts (optional - run periodically)
-- DELETE FROM groundwater_alerts WHERE triggered_at < now() - interval '30 days';
