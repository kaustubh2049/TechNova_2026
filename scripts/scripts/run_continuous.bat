@echo off
REM DWLR Simulator - Continuous Mode
REM Runs every 10 minutes automatically
REM ====================================

echo.
echo ========================================
echo  DWLR Continuous Simulator
echo  Press Ctrl+C to stop
echo ========================================
echo.

:loop
echo.
echo [%date% %time%] Running simulation...
python dwlr_simulator.py

echo.
echo Waiting 10 minutes for next run...
echo (Press Ctrl+C to stop)

timeout /t 600 /nobreak

goto loop
