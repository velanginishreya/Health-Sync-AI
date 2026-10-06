@echo off
cd /d "%~dp0"

echo Starting Health Sync AI...
echo   Backend:  http://127.0.0.1:8000
echo   Frontend: http://localhost:5173
echo.
echo Two new windows will open. Keep them open while using the app.
echo Close them (or press Ctrl+C in each) to stop the servers.
echo.

start "Health Sync AI - Backend" cmd /k "python -m uvicorn app.main:app --reload --app-dir backend"

timeout /t 3 /nobreak >nul

start "Health Sync AI - Frontend" cmd /k "cd frontend && npm run dev"

echo Done. Open http://localhost:5173 in your browser.
pause
