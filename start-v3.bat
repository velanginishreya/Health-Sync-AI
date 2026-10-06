@echo off
setlocal
title Health Sync AI - Launcher v3
cd /d "%~dp0"

echo ============================================================
echo   Health Sync AI - version 3 launcher
echo ============================================================
echo.
echo   This makes sure the app is running, then opens your browser at:
echo.
echo       http://localhost:5173/v3
echo.
echo   Backend API: http://127.0.0.1:8000
echo   To stop everything afterwards, run stop-all.bat
echo ============================================================
echo.

where python >nul 2>nul
if errorlevel 1 goto no_python

where node >nul 2>nul
if errorlevel 1 goto no_node

if exist "frontend\node_modules" goto have_modules
echo First run: installing the website packages.
echo This happens only once and takes about a minute. Please wait...
echo.
pushd frontend
call npm install
set NPM_RESULT=%errorlevel%
popd
if not "%NPM_RESULT%"=="0" goto install_failed
echo.
:have_modules

echo Checking whether the app is already running...
call :check_port 8000
if not errorlevel 1 goto api_running
echo   Starting the backend window...
start "Health Sync AI - API" /D "%~dp0" cmd /k "python -m uvicorn app.main:app --reload --app-dir backend"
goto api_done
:api_running
echo   Backend is already running on port 8000. Skipping.
:api_done

call :check_port 5173
if not errorlevel 1 goto web_running
echo   Starting the website window...
start "Health Sync AI - Web" /D "%~dp0frontend" cmd /k "npm run dev -- --port 5173 --strictPort"
goto web_done
:web_running
echo   Website is already running on port 5173. Skipping.
:web_done

echo.
echo Waiting for the app to answer at http://localhost:5173/v3 ...
echo The first start can take up to a minute. Please wait...
echo.

set WAIT_TRIES=0
:wait_loop
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5173/v3' -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto app_ready
set /a WAIT_TRIES+=1
if %WAIT_TRIES% GEQ 12 goto app_timeout
timeout /t 1 /nobreak >nul 2>nul
goto wait_loop

:app_ready
echo The app is ready. Opening your browser now...
start "" "http://localhost:5173/v3"
echo.
echo Done. The app is open at:
echo.
echo       http://localhost:5173/v3
echo.
echo To stop everything, run stop-all.bat
echo.
echo This launcher window will close by itself in a few seconds.
timeout /t 8 /nobreak >nul 2>nul
exit /b 0

:app_timeout
echo.
echo The app did not answer within about a minute.
echo Please look at the windows titled "Health Sync AI - Web" and
echo "Health Sync AI - API" for an error message, close this window
echo and double-click this launcher again.
echo.
pause
exit /b 1

:no_python
echo.
echo Python was not found on this computer.
echo This app needs Python 3 to run its server part.
echo Install it from https://www.python.org/downloads/ and tick
echo "Add python.exe to PATH" in the installer, then run this again.
echo.
pause
exit /b 1

:no_node
echo.
echo Node.js was not found on this computer.
echo This app needs Node.js to run its website part.
echo Install the LTS version from https://nodejs.org/ then run this again.
echo.
pause
exit /b 1

:install_failed
echo.
echo Installing the website packages failed. Please check your
echo internet connection, then double-click this launcher again.
echo.
pause
exit /b 1

:check_port
powershell -NoProfile -Command "$ok=$false; foreach ($ip in @([Net.IPAddress]::IPv6Loopback, [Net.IPAddress]::Loopback)) { try { $c=New-Object Net.Sockets.TcpClient($ip.AddressFamily); $c.Connect($ip, %1); $ok=$true; $c.Close() } catch {} }; if ($ok) { exit 0 } else { exit 1 }" >nul 2>nul
if errorlevel 1 exit /b 1
exit /b 0
