@echo off
echo Starting Docker Web Desktop Application...
echo.

call :ensure_bridge

REM Environment variables used by backend/frontend startup
set NODE_ENV=development
set PORT=3000
set VITE_API_BASE_URL=http://localhost:%PORT%

echo Environment:
echo NODE_ENV=%NODE_ENV%
echo PORT=%PORT%
echo VITE_API_BASE_URL=%VITE_API_BASE_URL%
echo.

echo Starting Backend Server...
start "Backend Server" cmd /c "cd backend && npm install && npm start"


echo Waiting for backend to start...


echo Starting Frontend Development Server...
start "Frontend Server" cmd /c "cd frontend && npm install && npm run dev"


echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: Will be available shortly at the URL shown in the frontend terminal
echo.
echo Press any key to exit...
 
rem pause > nul

goto :eof

:ensure_bridge
set "BRIDGE_URL=http://127.0.0.1:3334/health"
set "BRIDGE_SCRIPT=%~dp0scripts\start-wsl-host-bridge.ps1"

powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing '%BRIDGE_URL%' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
	echo WSL host bridge already running.
	goto :eof
)

echo Starting WSL host bridge...
start "WSL Host Bridge" powershell -NoProfile -ExecutionPolicy Bypass -File "%BRIDGE_SCRIPT%"

for /L %%i in (1,1,10) do (
	powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing '%BRIDGE_URL%' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
	if not errorlevel 1 (
		echo WSL host bridge is ready.
		goto :eof
	)
	timeout /t 1 /nobreak >nul
)

echo Warning: WSL host bridge did not respond in time. WSL2 operations may fail.
goto :eof