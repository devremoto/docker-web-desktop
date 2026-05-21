@echo off
REM Full uninstall for test reset
REM Removes Docker infra, Node.js (Windows + WSL), Ubuntu distro(s), and WSL optional features.

setlocal enabledelayedexpansion
cd /d "%~dp0"

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Administrator privileges required.
    echo Right-click and run as administrator.
    pause
    exit /b 1
)

echo [1/6] Running Docker infra uninstall first...
call "%~dp0unistall.bat"
if %errorlevel% neq 0 (
    echo WARNING: Docker infra uninstall reported errors. Continuing full uninstall.
)

echo.
echo [2/6] Removing Node.js from Windows (winget if available)...
where winget >nul 2>&1
if %errorLevel% equ 0 (
    winget uninstall OpenJS.NodeJS.LTS --accept-source-agreements >nul 2>&1
    winget uninstall OpenJS.NodeJS --accept-source-agreements >nul 2>&1
)

echo.
echo [3/6] Removing Node.js from WSL distro(s) where available...
set "D1=%DOCKER_WSL_DISTRO%"
if not "%D1%"=="" call :REMOVE_NODE_FROM_WSL "%D1%"
call :REMOVE_NODE_FROM_WSL "Ubuntu-22.04"
call :REMOVE_NODE_FROM_WSL "Ubuntu"

echo.
echo [4/6] Unregistering Ubuntu distributions used by setup...
for %%D in ("Ubuntu-22.04" "Ubuntu") do (
    wsl -l -q | findstr /i /x "%%~D" >nul
    if !errorLevel! equ 0 (
        echo Unregistering %%~D...
        wsl --unregister %%~D
    )
)

echo.
echo [5/6] Disabling WSL optional features...
dism.exe /online /disable-feature /featurename:VirtualMachinePlatform /norestart >nul 2>&1
dism.exe /online /disable-feature /featurename:Microsoft-Windows-Subsystem-Linux /norestart >nul 2>&1

echo.
echo [6/6] Final cleanup complete.
echo Full uninstall finished.
echo A system restart is recommended to complete feature removal.
pause
exit /b 0

:REMOVE_NODE_FROM_WSL
set "TARGET=%~1"
if "%TARGET%"=="" exit /b 0
wsl -l -q | findstr /i /x "%TARGET%" >nul
if %errorlevel% equ 0 (
    echo Removing Node.js in WSL distro %TARGET%...
    wsl -d "%TARGET%" -u root -- bash -lc "apt-get purge -y nodejs npm || true; apt-get autoremove -y --purge || true"
)
exit /b 0
