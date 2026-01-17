-- =====================================================
-- FIXED GROUNDWATER ALERTS - SQL TRIGGERS
-- =====================================================
-- IMPORTANT: Run this in Supabase SQL Editor
-- This version matches your actual table structure:
--   Table: district_data
--   Column: Water_Level (with capital L)
--   Column: WLCODE (uppercase)
-- =====================================================

-- Step 1: Create/Update Alerts Table
-- =====================================================
DROP TABLE IF EXISTS groundwater_alerts;

CREATE TABLE groundwater_alerts (
    id BIGSERIAL PRIMARY KEY,
    wlcode TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    water_level FLOAT,
    triggered_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX idx_groundwater_alerts_wlcode ON groundwater_alerts(wlcode);
CREATE INDEX idx_groundwater_alerts_triggered_at ON groundwater_alerts(triggered_at);
CREATE INDEX idx_groundwater_alerts_severity ON groundwater_alerts(severity);

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
            'CRITICAL: Groundwater level dropped below 1.0m threshold. Immediate action required.',
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
-- Triggers if water level drops > 0.3m in last hour
-- =====================================================

CREATE OR REPLACE FUNCTION check_rapid_decline()
RETURNS TRIGGER AS $$
DECLARE
    previous_level FLOAT;
    decline_amount FLOAT;
BEGIN
    -- Get water level from ~1 hour ago (6 readings at 10-min intervals)
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
                format('WARNING: Rapid groundwater decline of %.2fm detected in the last hour. Monitor closely.', decline_amount),
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
            format('NOTICE: Water level at %.2fm is approaching critical threshold. Consider conservation measures.', NEW."Water_Level"),
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

SELECT 'Alerts table created successfully' as status;

SELECT 'Triggers installed: ' || count(*) as trigger_count
FROM information_schema.triggers 
WHERE trigger_name LIKE '%level%trigger' OR trigger_name LIKE '%decline%';

-- =====================================================
-- TEST: Insert a test record to verify triggers work
-- =====================================================
-- Uncomment to test:
-- INSERT INTO district_data ("WLCODE", "Water_Level", timestamp)
-- VALUES ('TEST001', 0.5, now());
-- 
-- SELECT * FROM groundwater_alerts ORDER BY triggered_at DESC LIMIT 5;
