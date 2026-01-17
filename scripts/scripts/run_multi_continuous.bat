@echo off
REM Multi-Station DWLR Simulator - Continuous Mode
REM Runs every 10 minutes automatically
REM ============================================

echo.
echo ========================================
echo  MULTI-STATION DWLR SIMULATOR
echo  Continuous Mode (Every 10 minutes)
echo  Press Ctrl+C to stop
echo ========================================
echo.

:loop
echo.
echo [%date% %time%] Running multi-station simulation...
python multi_station_simulator.py

if errorlevel 1 (
    echo.
    echo ERROR: Simulation failed
    echo Waiting 30 seconds before retry...
    timeout /t 30 /nobreak
    goto loop
)

echo.
echo Waiting 10 minutes for next run...
echo (Press Ctrl+C to stop)

timeout /t 600 /nobreak

goto loop
