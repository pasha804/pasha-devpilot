@echo off
title Pasha-DevPilot Stopper
color 0C
echo ===================================================================
echo               PASHA-DEVPILOT - 1-CLICK STOPPER
echo ===================================================================
echo.
echo Stopping Frontend and Backend services...

:: Stop process on port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating Backend PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

:: Stop process on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Terminating Frontend PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

:: Kill any residual node processes spawned by dev server
taskkill /f /im node.exe >nul 2>&1

echo.
echo ===================================================================
echo   All Pasha-DevPilot services have been stopped.
echo ===================================================================
echo.
pause
