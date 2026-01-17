@echo off
REM Advanced DWLR Simulator - Complete Setup
REM ==========================================

echo.
echo ========================================================
echo  ADVANCED DWLR SIMULATOR - QUICK SETUP
echo  TechNova 2026
echo ========================================================
echo.

echo This will set up:
echo   [1] SQL Triggers for Automatic Alerts
echo   [2] Scenario Configuration Tables  
echo   [3] Multi-Station Simulation
echo.
pause

echo.
echo ========================================================
echo  STEP 1: Database Setup
echo ========================================================
echo.
echo Please run the following SQL scripts in Supabase:
echo.
echo   1. Open: https://supabase.com/dashboard
echo   2. Go to: SQL Editor
echo   3. Run: scripts/sql/01_alerts_triggers.sql
echo   4. Run: scripts/sql/02_scenario_config.sql
echo.
echo Press any key when done...
pause >nul

echo.
echo ========================================================
echo  STEP 2: Python Dependencies
echo ========================================================
echo.

pip install -r requirements.txt --quiet

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed
echo.

echo ========================================================
echo  STEP 3: Test Multi-Station Simulator
echo ========================================================
echo.
echo Running initial simulation...
echo.

python multi_station_simulator.py

if errorlevel 1 (
    echo.
    echo ERROR: Simulation failed
    echo.
    echo Troubleshooting:
    echo   - Check if SQL scripts were run in Supabase
    echo   - Verify .env file exists with Supabase credentials
    echo   - Check internet connection
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo  ✅ SETUP COMPLETE!
echo ========================================================
echo.
echo Next steps:
echo.
echo   [1] View alerts: SELECT * FROM groundwater_alerts;
echo   [2] Change scenario: UPDATE simulation_config SET scenario = 'drought';
echo   [3] Run continuous: .\run_multi_continuous.bat
echo   [4] Open app: npx expo start
echo.
echo For detailed documentation, see: ADVANCED_SETUP.md
echo.
pause
