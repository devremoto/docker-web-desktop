@echo off
setlocal enabledelayedexpansion

:: Docker Web Desktop - Deployment Script for Windows

echo.
echo 🐳 Docker Web Desktop - Deployment Script
echo ===========================================

:: Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

:: Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
    exit /b 1
)

:: Parse command
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=start

if "%COMMAND%"=="start" goto start
if "%COMMAND%"=="dev" goto dev
if "%COMMAND%"=="stop" goto stop
if "%COMMAND%"=="restart" goto restart
if "%COMMAND%"=="logs" goto logs
if "%COMMAND%"=="clean" goto clean
if "%COMMAND%"=="build" goto build
if "%COMMAND%"=="status" goto status
if "%COMMAND%"=="help" goto help
if "%COMMAND%"=="-h" goto help
if "%COMMAND%"=="--help" goto help

echo ❌ Unknown command: %COMMAND%
echo.
goto help

:start
echo 🚀 Starting Docker Web Desktop in production mode...
call :ensure_bridge
docker-compose up -d --build
if errorlevel 0 (
    echo ✅ Application started successfully!
    echo 🌐 Frontend: http://localhost
    echo 🔧 Backend API: http://localhost:3000
)
goto end

:dev
echo 🚀 Starting Docker Web Desktop in development mode...
call :ensure_bridge
docker-compose -f docker-compose.dev.yml up --build
goto end

:stop
echo 🛑 Stopping Docker Web Desktop...
docker-compose down
docker-compose -f docker-compose.dev.yml down >nul 2>&1
echo ✅ Application stopped successfully!
goto end

:restart
echo 🔄 Restarting Docker Web Desktop...
call :ensure_bridge
docker-compose down
docker-compose up -d --build
if errorlevel 0 (
    echo ✅ Application restarted successfully!
)
goto end

:ensure_bridge
set "BRIDGE_URL=http://127.0.0.1:3334/health"
set "BRIDGE_SCRIPT=%~dp0scripts\start-wsl-host-bridge.ps1"

powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing '%BRIDGE_URL%' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
    echo ✅ WSL host bridge already running.
    goto :eof
)

echo 🔌 Starting WSL host bridge...
start "WSL Host Bridge" powershell -NoProfile -ExecutionPolicy Bypass -File "%BRIDGE_SCRIPT%"

set "BRIDGE_READY=0"
for /L %%i in (1,1,10) do (
    powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing '%BRIDGE_URL%' -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if not errorlevel 1 (
        set "BRIDGE_READY=1"
        goto bridge_ready
    )
    timeout /t 1 /nobreak >nul
)

:bridge_ready
if "%BRIDGE_READY%"=="1" (
    echo ✅ WSL host bridge is ready.
) else (
    echo ⚠️ WSL host bridge did not respond in time. WSL2 operations may fail.
)
goto :eof

:logs
echo 📋 Showing application logs...
docker-compose logs -f
goto end

:clean
echo 🧹 Cleaning up Docker Web Desktop...
docker-compose down -v --rmi all --remove-orphans
docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans >nul 2>&1
echo ✅ Cleanup completed!
goto end

:build
echo 🔨 Building Docker images...
docker-compose build --no-cache
if errorlevel 0 (
    echo ✅ Images built successfully!
)
goto end

:status
echo 📊 Container status:
docker-compose ps
echo.
echo 📊 Development container status:
docker-compose -f docker-compose.dev.yml ps >nul 2>&1 || echo No development containers running
goto end

:help
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   start     Start the application in production mode
echo   dev       Start the application in development mode
echo   stop      Stop the application
echo   restart   Restart the application
echo   logs      Show application logs
echo   clean     Stop and remove all containers, networks, and volumes
echo   build     Build all Docker images
echo   status    Show status of all containers
echo.
echo Examples:
echo   %0 start
echo   %0 dev
echo   %0 logs
goto end

:end
echo.