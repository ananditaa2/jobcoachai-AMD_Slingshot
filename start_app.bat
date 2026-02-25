@echo off
cd /d "%~dp0"

echo ==============================================
echo       Starting Dream Job Coach AI
echo ==============================================

echo [1/2] Launching Backend Server...
start "CareerAI Backend" cmd /k "cd server && node server.js"

timeout /t 3 >nul

echo [2/2] Launching Frontend App...
start "CareerAI Frontend" cmd /k "npm run dev"

echo.
echo ==============================================
echo        App Started Successfully!
echo ==============================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080 (or similar)
echo.
echo Keep these windows OPEN to keep the site running.
echo.
pause
