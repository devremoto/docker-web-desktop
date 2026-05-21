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

set "DISTRO=%DOCKER_WSL_DISTRO%"
if "%DISTRO%"=="" set "DISTRO=Ubuntu-22.04"
set "SHIM_DIR=%ProgramData%\docker-wsl\bin"
set "LEGACY_SHIM_DIR=%windir%\System32"

echo Using target distro: %DISTRO%
echo.

echo [1/5] Removing Docker packages inside WSL distro (if available)...
wsl -l -q | findstr /i /x "%DISTRO%" >nul
if !errorlevel! neq 0 (
    echo Distro %DISTRO% not found. Trying Ubuntu fallback...
    set "DISTRO=Ubuntu"
    wsl -l -q | findstr /i /x "%DISTRO%" >nul
)

if !errorlevel! equ 0 (
    wsl -d "%DISTRO%" -u root -- bash -lc "set -e; service docker stop >/dev/null 2>&1 || true; apt-get purge -y docker.io docker-compose-v2 docker-compose containerd runc docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin || true; apt-get autoremove -y --purge || true; rm -rf /var/lib/docker /var/lib/containerd /etc/docker /etc/apt/keyrings/docker.gpg /etc/apt/sources.list.d/docker.list"
    if !errorlevel! equ 0 (
        echo [OK] Docker packages removed from WSL distro %DISTRO%.
    ) else (
        echo WARNING: Could not fully remove Docker packages from %DISTRO%.
    )
) else (
    echo WARNING: No target Ubuntu distro found. Skipping WSL package removal.
)

echo.
echo [2/5] Removing Windows docker shims...
if exist "%SHIM_DIR%\docker.cmd" del /f /q "%SHIM_DIR%\docker.cmd" >nul 2>&1
if exist "%SHIM_DIR%\docker-compose.cmd" del /f /q "%SHIM_DIR%\docker-compose.cmd" >nul 2>&1
if exist "%SHIM_DIR%" rd /s /q "%SHIM_DIR%" >nul 2>&1

if exist "%LEGACY_SHIM_DIR%\docker.bat" del /f /q "%LEGACY_SHIM_DIR%\docker.bat" >nul 2>&1
if exist "%LEGACY_SHIM_DIR%\docker-compose.bat" del /f /q "%LEGACY_SHIM_DIR%\docker-compose.bat" >nul 2>&1
if exist "%LEGACY_SHIM_DIR%\docker.cmd" del /f /q "%LEGACY_SHIM_DIR%\docker.cmd" >nul 2>&1
if exist "%LEGACY_SHIM_DIR%\docker-compose.cmd" del /f /q "%LEGACY_SHIM_DIR%\docker-compose.cmd" >nul 2>&1
echo [OK] Shim cleanup done.

echo.
echo [3/5] Removing environment variable DOCKER_WSL_DISTRO...
reg delete "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v DOCKER_WSL_DISTRO /f >nul 2>&1
reg delete "HKCU\Environment" /v DOCKER_WSL_DISTRO /f >nul 2>&1
echo [OK] DOCKER_WSL_DISTRO removed (if it existed).

echo.
echo [4/5] Removing shim directory from PATH...
powershell -NoProfile -Command "$dir='%ProgramData%\\docker-wsl\\bin'; foreach($scope in @('Machine','User')){ $p=[Environment]::GetEnvironmentVariable('Path',$scope); if($p){ $parts=@($p -split ';' | Where-Object { $_ -and ($_.TrimEnd('\\') -ine $dir.TrimEnd('\\'))}); [Environment]::SetEnvironmentVariable('Path',($parts -join ';'),$scope)}}"
echo [OK] PATH cleanup done.

echo.
echo [5/5] Validation checks...
where docker >nul 2>&1
if !errorlevel! equ 0 (
    echo WARNING: docker command still resolves in this terminal.
    echo This may be from Docker Desktop or stale terminal environment cache.
) else (
    echo [OK] docker command no longer resolves in this terminal session.
)

echo.
echo Docker infrastructure uninstall completed.
echo Open a NEW terminal so PATH/env updates take effect.
pause
exit /b 0
