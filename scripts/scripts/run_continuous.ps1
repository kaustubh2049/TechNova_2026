# Multi-Station DWLR Simulator - Continuous Mode (PowerShell)
# Runs every 10 minutes automatically
# Press Ctrl+C to stop

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " MULTI-STATION DWLR SIMULATOR" -ForegroundColor Yellow
Write-Host " Continuous Mode (Every 10 minutes)" -ForegroundColor Green
Write-Host " Press Ctrl+C to stop" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "c:\Users\Kaustubh\Downloads\TechNova_2026\scripts\scripts"

while ($true) {
    Write-Host ""
    Write-Host "[$(Get-Date)] Running multi-station simulation..." -ForegroundColor Green
    python multi_station_simulator.py
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: Simulation failed" -ForegroundColor Red
        Write-Host "Waiting 30 seconds before retry..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        continue
    }
    
    Write-Host ""
    Write-Host "✅ Simulation complete. Waiting 10 minutes for next run..." -ForegroundColor Green
    Write-Host "(Press Ctrl+C to stop)" -ForegroundColor Yellow
    
    Start-Sleep -Seconds 600
}
