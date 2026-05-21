@echo off
REM Docker infrastructure uninstall only (keeps WSL and Node.js)
REM Removes Docker packages from WSL, docker wrappers, and related env/path entries.

setlocal enabledelayedexpansion
cd /d "%~dp0"

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Administrator privileges required.
    echo Right-click and run as administrator.
    pause
    exit /b 1
)

set DISTRO=%DOCKER_WSL_DISTRO%
if "%DISTRO%"=="" set DISTRO=Ubuntu-22.04

echo Using target distro: %DISTRO%
echo.

echo [1/4] Removing Docker packages inside WSL distro (if available)...
wsl -l -q | findstr /i /x "%DISTRO%" >nul
if %errorLevel% neq 0 (
    echo Distro %DISTRO% not found. Trying Ubuntu fallback...
    set DISTRO=Ubuntu
    wsl -l -q | findstr /i /x "%DISTRO%" >nul
)

if %errorLevel% equ 0 (
    wsl -d %DISTRO% -u root -- bash -lc "set -e; service docker stop >/dev/null 2>&1 || true; apt-get purge -y docker.io docker-compose-v2 docker-compose containerd runc || true; apt-get autoremove -y --purge || true; rm -rf /var/lib/docker /var/lib/containerd /etc/docker /etc/apt/keyrings/docker.gpg /etc/apt/sources.list.d/docker.list"
    if %errorLevel% equ 0 (
        echo [OK] Docker packages removed from WSL distro %DISTRO%.
    ) else (
        echo WARNING: Could not fully remove Docker packages from %DISTRO%.
    )
) else (
    echo WARNING: No target Ubuntu distro found. Skipping WSL package removal.
)

echo.
echo [2/4] Removing Windows docker shims...
set SHIM_DIR=%ProgramData%\docker-wsl\bin
if exist "%SHIM_DIR%\docker.cmd" del /f /q "%SHIM_DIR%\docker.cmd" >nul 2>&1
if exist "%SHIM_DIR%\docker-compose.cmd" del /f /q "%SHIM_DIR%\docker-compose.cmd" >nul 2>&1
if exist "%SHIM_DIR%" rd "%SHIM_DIR%" >nul 2>&1
echo [OK] Shim cleanup done.

echo.
echo [3/4] Removing machine environment variable DOCKER_WSL_DISTRO...
reg delete "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v DOCKER_WSL_DISTRO /f >nul 2>&1
echo [OK] DOCKER_WSL_DISTRO removed (if it existed).

echo.
echo [4/4] Removing shim directory from machine PATH...
powershell -NoProfile -Command "$dir='%ProgramData%\\docker-wsl\\bin'; $p=[Environment]::GetEnvironmentVariable('Path','Machine'); if($p){$parts=@($p -split ';' | Where-Object {$_ -and ($_ -ne $dir)}); [Environment]::SetEnvironmentVariable('Path',($parts -join ';'),'Machine')}"
echo [OK] PATH cleanup done.

echo.
echo Docker infrastructure uninstall completed.
echo Open a NEW terminal so PATH/env updates take effect.
pause
exit /b 0
