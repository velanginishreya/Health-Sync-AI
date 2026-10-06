@echo off
cd /d "%~dp0"

echo ============================================
echo   Health Sync AI - First-time Setup
echo ============================================
echo.

echo [1/3] Installing backend dependencies...
pip install -r backend\requirements.txt
if errorlevel 1 (
    echo.
    echo Backend dependency install FAILED. Make sure Python and pip are installed and on PATH.
    pause
    exit /b 1
)

echo.
echo [2/3] Seeding the database with demo accounts...
python scripts\seed_database.py

echo.
echo [3/3] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo ============================================
echo   Setup complete! Double-click start.bat to run the app.
echo ============================================
pause
