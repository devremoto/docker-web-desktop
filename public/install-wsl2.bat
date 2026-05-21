@echo off
REM WSL2 + Docker Installation Script for Windows (Batch Version)
REM This script automates WSL2 setup and Docker Engine + Docker Compose installation inside WSL
REM Must be run as Administrator

setlocal enabledelayedexpansion

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ======================================
    echo ERROR: Administrator privileges required!
    echo ======================================
    echo.
    echo This script must be run as Administrator.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ======================================
echo    WSL2 + Node.js + Docker Script
echo ======================================
echo.

set WSL_DISTRO=Ubuntu-22.04

REM Check if Node.js is installed and install if missing
echo [1/10] Checking Node.js installation...
where node >nul 2>&1
if %errorLevel% equ 0 (
    for /f "delims=" %%v in ('node -v 2^>nul') do set NODE_VERSION=%%v
    echo [OK] Node.js is installed (!NODE_VERSION!)
) else (
    echo Node.js was not found. Installing Node.js LTS...
    where winget >nul 2>&1
    if %errorLevel% equ 0 (
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
        if %errorLevel% equ 0 (
            where node >nul 2>&1
            if %errorLevel% equ 0 (
                for /f "delims=" %%v in ('node -v 2^>nul') do set NODE_VERSION=%%v
                echo [OK] Node.js installed successfully (!NODE_VERSION!)
            ) else (
                echo WARNING: Node.js install completed but node command is not yet in PATH.
                echo Close and reopen your terminal after this script finishes.
            )
        ) else (
            echo WARNING: Failed to install Node.js with winget.
            echo Please install Node.js LTS manually: https://nodejs.org/
        )
    ) else (
        echo WARNING: winget is not available on this system.
        echo Please install Node.js LTS manually: https://nodejs.org/
    )
)
echo.

REM Check Windows version
echo [2/10] Checking Windows version...
for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v CurrentBuild ^| findstr CurrentBuild') do set BUILD=%%a

if %BUILD% LSS 18362 (
    echo ERROR: WSL2 requires Windows 10 version 1903 or higher ^(Build 18362+^)
    echo Your version: Build %BUILD%
    echo.
    pause
    exit /b 1
)

echo [OK] Windows version is compatible (Build %BUILD%)
echo.

REM Check if WSL is already installed
echo [3/10] Checking current WSL installation...
where wsl >nul 2>&1
if %errorLevel% equ 0 (
    echo WSL is already installed. Checking status...
    wsl --status 2>nul
    echo.
    echo This script will ensure WSL2 is properly configured.
) else (
    echo WSL not detected. Will perform fresh installation.
)
echo.

REM Enable WSL and Virtual Machine Platform features
echo [4/10] Enabling WSL and Virtual Machine Platform features...
echo This may take a few minutes...
echo.

echo Enabling Windows Subsystem for Linux...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
set "DISM_WSL_EXIT=%errorLevel%"
if not "%DISM_WSL_EXIT%"=="0" if not "%DISM_WSL_EXIT%"=="3010" (
    echo ERROR: Failed to enable WSL feature
    echo DISM exit code: %DISM_WSL_EXIT%
    pause
    exit /b 1
)
if "%DISM_WSL_EXIT%"=="3010" (
    echo [INFO] WSL feature enabled, reboot required to finalize changes.
)

echo Enabling Virtual Machine Platform...
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
set "DISM_VMP_EXIT=%errorLevel%"
if not "%DISM_VMP_EXIT%"=="0" if not "%DISM_VMP_EXIT%"=="3010" (
    echo ERROR: Failed to enable Virtual Machine Platform
    echo DISM exit code: %DISM_VMP_EXIT%
    pause
    exit /b 1
)
if "%DISM_VMP_EXIT%"=="3010" (
    echo [INFO] Virtual Machine Platform enabled, reboot required to finalize changes.
)

echo [OK] Features enabled successfully
echo.

REM Download and install WSL2 kernel update
echo [5/10] Downloading WSL2 Linux kernel update...
set KERNEL_URL=https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
set KERNEL_FILE=%TEMP%\wsl_update_x64.msi

echo Downloading from: %KERNEL_URL%
powershell -Command "& {Invoke-WebRequest -Uri '%KERNEL_URL%' -OutFile '%KERNEL_FILE%' -UseBasicParsing}" >nul 2>&1

if %errorLevel% equ 0 (
    echo [OK] Download completed
    echo.
    echo Installing WSL2 kernel update...
    msiexec /i "%KERNEL_FILE%" /quiet /norestart
    if %errorLevel% equ 0 (
        echo [OK] WSL2 kernel installed
    ) else (
        echo WARNING: Kernel installation may have failed
        echo You can download it manually from: https://aka.ms/wsl2kernel
    )
    del "%KERNEL_FILE%" >nul 2>&1
) else (
    echo WARNING: Kernel download failed
    echo You can download it manually from: https://aka.ms/wsl2kernel
)
echo.

REM Set WSL2 as default version
echo [6/10] Setting WSL2 as default version...
wsl --set-default-version 2 >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] WSL2 set as default version
) else (
    echo WARNING: Could not set WSL2 as default
    echo You may need to run: wsl --set-default-version 2
)
echo.

REM Install Ubuntu distribution
echo [7/10] Installing Ubuntu Linux distribution...
echo This will download and install Ubuntu 22.04 LTS...
echo.

REM Check if Ubuntu is already installed
wsl --list --quiet 2>&1 | findstr /i "Ubuntu" >nul
if %errorLevel% equ 0 (
    echo Ubuntu is already installed:
    wsl --list --verbose
    echo.
    echo Skipping Ubuntu installation.
) else (
    echo Installing Ubuntu 22.04...
    wsl --install -d Ubuntu-22.04
    if %errorLevel% equ 0 (
        echo [OK] Ubuntu installation initiated
    ) else (
        echo WARNING: Ubuntu installation may require manual setup
        echo You can install Ubuntu from Microsoft Store or run: wsl --install -d Ubuntu-22.04
    )
)
echo.

REM Install Docker Engine + Compose inside WSL
echo [8/10] Installing Docker Engine and Docker Compose inside WSL...
echo.
echo Ensuring target distro is available...
wsl --list --quiet 2>&1 | findstr /i /x "%WSL_DISTRO%" >nul
if %errorLevel% neq 0 (
    wsl --list --quiet 2>&1 | findstr /i /x "Ubuntu" >nul
    if %errorLevel% equ 0 (
        set WSL_DISTRO=Ubuntu
        echo [OK] Using distro: !WSL_DISTRO!
    ) else (
        echo WARNING: Ubuntu distro not ready yet.
        echo Run Ubuntu once after reboot, then run this script again to finish Docker setup.
        goto :POST_DOCKER
    )
)

echo Running installation commands inside !WSL_DISTRO! as root...
wsl -d !WSL_DISTRO! -u root -- bash -lc "set -e; export DEBIAN_FRONTEND=noninteractive; apt-get update; apt-get install -y docker.io docker-compose-v2 || apt-get install -y docker.io docker-compose; service docker start; TARGET_USER=$(awk -F: '$3==1000 {print $1; exit}' /etc/passwd); if [ -n \"$TARGET_USER\" ]; then usermod -aG docker \"$TARGET_USER\" || true; fi"
if %errorLevel% neq 0 (
    echo WARNING: Could not install Docker inside WSL in this run.
    echo This usually means reboot and first Ubuntu launch are still required.
    goto :POST_DOCKER
)

echo [OK] Docker packages installed inside WSL
echo.

REM Verify Docker and Compose inside WSL
echo [9/10] Verifying Docker and Docker Compose in WSL...
wsl -d !WSL_DISTRO! -u root -- bash -lc "set -e; service docker start >/dev/null 2>&1 || true; docker --version; if docker compose version >/dev/null 2>&1; then docker compose version; elif command -v docker-compose >/dev/null 2>&1; then docker-compose --version; else echo 'Docker Compose not found'; exit 1; fi"
if %errorLevel% equ 0 (
    echo [OK] Docker and Docker Compose are available in WSL (!WSL_DISTRO!).
) else (
    echo WARNING: Docker or Docker Compose verification failed inside WSL.
    echo Open WSL and run:
    echo   docker --version
    echo   docker compose version
)

REM Create Windows docker shims for standalone WSL Docker usage
echo [10/10] Creating Windows docker shims for WSL Docker...
set SHIM_DIR=%ProgramData%\docker-wsl\bin
if not exist "%SHIM_DIR%" mkdir "%SHIM_DIR%"

(
    echo @echo off
    echo set "DISTRO=%%DOCKER_WSL_DISTRO%%"
    echo if "%%DISTRO%%"=="" set "DISTRO=!WSL_DISTRO!"
    echo wsl -d "%%DISTRO%%" -- docker %%*
) > "%SHIM_DIR%\docker.cmd"

(
    echo @echo off
    echo set "DISTRO=%%DOCKER_WSL_DISTRO%%"
    echo if "%%DISTRO%%"=="" set "DISTRO=!WSL_DISTRO!"
    echo wsl -d "%%DISTRO%%" -- sh -lc "if docker compose version ^> /dev/null 2^>^&1; then docker compose \"$@\"; elif command -v docker-compose ^> /dev/null 2^>^&1; then docker-compose \"$@\"; else echo Docker Compose not found inside WSL ^>^&2; exit 1; fi" -- %%*
) > "%SHIM_DIR%\docker-compose.cmd"

setx /M DOCKER_WSL_DISTRO !WSL_DISTRO! >nul
powershell -NoProfile -Command "$dir='%SHIM_DIR%'; $p=[Environment]::GetEnvironmentVariable('Path','Machine'); if(-not (($p -split ';') -contains $dir)){ [Environment]::SetEnvironmentVariable('Path',($p.TrimEnd(';') + ';' + $dir),'Machine') }"

echo [OK] Shim commands created in: %SHIM_DIR%
echo [OK] DOCKER_WSL_DISTRO set to: !WSL_DISTRO!
echo NOTE: Open a new terminal to use docker/docker-compose directly from Windows.

:POST_DOCKER
echo.

REM Completion message
echo ======================================
echo    Installation Completed!
echo ======================================
echo.
echo IMPORTANT: A system restart may be required to complete WSL setup.
echo.
echo Next Steps:
echo 1. Restart your computer if prompted
echo 2. Launch Ubuntu once and complete initial Linux user setup
echo 3. In WSL run: docker --version
echo 4. In WSL run: docker compose version
echo 5. Example compose usage in WSL:
echo    cd /path/to/project
echo    docker compose up -d
echo    docker compose ps
echo    docker compose logs -f
echo 6. From a new Windows terminal, you can run directly:
echo    docker --version
echo    docker-compose version
echo.

REM Ask for restart
set /p RESTART="Would you like to restart now? (Y/N): "
if /i "%RESTART%"=="Y" (
    echo Restarting in 5 seconds...
    timeout /t 5 /nobreak >nul
    shutdown /r /t 0
) else (
    echo.
    echo Please remember to restart your computer manually to complete the installation.
    echo.
    pause
)
