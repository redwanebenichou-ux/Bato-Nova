@echo off
echo Starting BATI Nova Server...
set NODE_ENV=production
start /B node server.js
timeout /t 3 /nobreak >nul
start http://localhost:5000
start http://localhost:5000/admin
echo.
echo Server is running at:
echo   Site:  http://localhost:5000
echo   Admin: http://localhost:5000/admin
echo.
echo Close this window to stop the server.
pause
taskkill /f /im node.exe >nul 2>&1
