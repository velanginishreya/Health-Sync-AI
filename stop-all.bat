@echo off
setlocal
title Health Sync AI - Stop All
cd /d "%~dp0"

echo ============================================================
echo   Health Sync AI - stop everything
echo ============================================================
echo.
echo   This closes only the two windows that the launchers opened:
echo.
echo       Health Sync AI - API   (the backend)
echo       Health Sync AI - Web   (the website)
echo.
echo   All other programs are left alone. Note: if your PC opens
echo   these windows as tabs inside Windows Terminal, that whole
echo   Windows Terminal window is closed too.
echo.

set STOPPED=0

echo Stopping the backend window, if it is open...
taskkill /FI "WINDOWTITLE eq Health Sync AI - API*" /T /F | findstr /C:"PID"
if not errorlevel 1 set STOPPED=1

echo.
echo Stopping the website window, if it is open...
taskkill /FI "WINDOWTITLE eq Health Sync AI - Web*" /T /F | findstr /C:"PID"
if not errorlevel 1 set STOPPED=1
echo.

if "%STOPPED%"=="1" goto stopped_something
echo No Health Sync AI windows were open, so nothing was stopped.
echo The app was either already closed or was started some other way.
goto all_done

:stopped_something
echo Done. The Health Sync AI windows have been closed.

:all_done
echo.
echo This window closes by itself in a few seconds.
timeout /t 8 /nobreak >nul 2>nul
exit /b 0
