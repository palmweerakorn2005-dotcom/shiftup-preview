@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo.
  echo Python 3 not found. Install Python or run any static file server in this folder.
  echo.
  pause
  exit /b 1
)

start "ShiftUp Preview Server" /min cmd /c "python -m http.server 4173 --bind 127.0.0.1"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4173/"

echo.
echo ShiftUp preview: http://127.0.0.1:4173/
echo Close the "ShiftUp Preview Server" window when finished.
echo.
pause
