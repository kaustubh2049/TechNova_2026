@echo off
REM DWLR Simulator - Quick Setup & Run
REM ====================================

echo.
echo ========================================
echo  DWLR Groundwater Simulator
echo  TechNova 2026
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
pip install -r requirements.txt --quiet

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/3] Checking Supabase configuration...
if not exist "..\\.env" (
    echo WARNING: .env file not found in project root
    echo Please create .env with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
    pause
    exit /b 1
)

echo [3/3] Running simulator...
echo.
python dwlr_simulator.py

echo.
echo ========================================
echo  Simulation Complete!
echo ========================================
echo.
echo To run continuously (every 10 minutes):
echo   run_continuous.bat
echo.
pause
