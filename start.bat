@echo off
title Pasha-DevPilot Launcher
color 0B
echo ===================================================================
echo               PASHA-DEVPILOT - 1-CLICK LAUNCHER
echo ===================================================================
echo.
echo [1/3] Starting FastAPI Backend on http://localhost:8000...
cd /d "%~dp0"
start "Pasha-DevPilot - Backend (Port 8000)" cmd /k "cd /d "%~dp0" && python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir apps/api --reload-dir packages/agent_core"

echo [2/3] Starting Next.js Frontend on http://localhost:3000...
start "Pasha-DevPilot - Frontend (Port 3000)" cmd /k "cd /d "%~dp0apps\web" && npm run dev"

echo [3/3] Waiting for servers to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo Launching Pasha-DevPilot in your default browser...
start http://localhost:3000

echo.
echo ===================================================================
echo   Pasha-DevPilot Successfully Launched!
echo.
echo   - Web App UI:       http://localhost:3000
echo   - Swagger API Docs: http://localhost:8000/docs
echo.
echo   Note: Backend aur Frontend alag windows mein chal rahe hain.
echo   Band karne ke liye un windows ko close kar dein ya stop.bat chalayein.
echo ===================================================================
echo.
pause
