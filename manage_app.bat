1@echo off
cd /d "%~dp0"

:MENU
cls
echo ==============================================
echo       Dream Job Coach AI - Manager
echo ==============================================
echo 1. Start App (Permanent)
echo 2. Stop App
echo 3. Restart App
echo 4. View Logs
echo 5. Check Status
echo 6. Exit
echo ==============================================
set /p choice="Enter Logs: "

if "%choice%"=="1" goto START
if "%choice%"=="2" goto STOP
if "%choice%"=="3" goto RESTART
if "%choice%"=="4" goto LOGS
if "%choice%"=="5" goto STATUS
if "%choice%"=="6" goto LIST

:START
echo Starting...
call pm2 start server/server.js --name career-ai-backend
call pm2 start node_modules/vite/bin/vite.js --name career-ai-frontend -- dev --host
call pm2 save
pause
goto MENU

:STOP
echo Stopping...
call pm2 stop all
pause
goto MENU

:RESTART
echo Restarting...
call pm2 restart all
pause
goto MENU

:LOGS
echo Press Ctrl+C to exit logs...
call pm2 logs
pause
goto MENU

:STATUS
call pm2 status
pause
goto MENU

:LIST
exit
