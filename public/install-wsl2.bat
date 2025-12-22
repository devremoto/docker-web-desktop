@echo off
REM WSL2 Installation Script for Windows (Batch Version)
REM This script automates the installation of WSL2 on Windows 10/11
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
echo    WSL2 Installation Script
echo ======================================
echo.

REM Check Windows version
echo [1/6] Checking Windows version...
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
echo [2/6] Checking current WSL installation...
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
echo [3/6] Enabling WSL and Virtual Machine Platform features...
echo This may take a few minutes...
echo.

echo Enabling Windows Subsystem for Linux...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
if %errorLevel% neq 0 (
    echo ERROR: Failed to enable WSL feature
    pause
    exit /b 1
)

echo Enabling Virtual Machine Platform...
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
if %errorLevel% neq 0 (
    echo ERROR: Failed to enable Virtual Machine Platform
    pause
    exit /b 1
)

echo [OK] Features enabled successfully
echo.

REM Download and install WSL2 kernel update
echo [4/6] Downloading WSL2 Linux kernel update...
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
echo [5/6] Setting WSL2 as default version...
wsl --set-default-version 2 >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] WSL2 set as default version
) else (
    echo WARNING: Could not set WSL2 as default
    echo You may need to run: wsl --set-default-version 2
)
echo.

REM Install Ubuntu distribution
echo [6/6] Installing Ubuntu Linux distribution...
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

REM Completion message
echo ======================================
echo    Installation Completed!
echo ======================================
echo.
echo IMPORTANT: A system restart is required to complete the installation.
echo.
echo Next Steps:
echo 1. Restart your computer
echo 2. After restart, launch Ubuntu from the Start Menu
echo 3. Complete the Ubuntu setup (create username and password)
echo 4. Verify installation by running: wsl --list --verbose
echo 5. You can then proceed to install Docker Desktop or Docker Engine
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
