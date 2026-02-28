@echo off
cd /d "%~dp0"
echo ==============================================
echo       Dream Job Coach AI - Quick Start
echo ==============================================
echo Starting Backend Server on Port 5000...
start "Backend API Server" cmd /k "cd server && node server.js"

echo Starting Frontend Server on Port 8090...
start "Frontend Web Server" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows!
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:8090
echo.
echo To stop them later, just close those two black terminal windows.
pause
