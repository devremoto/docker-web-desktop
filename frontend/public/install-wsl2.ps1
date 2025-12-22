# WSL2 Installation Script for Windows
# This script automates the installation of WSL2 on Windows 10/11
# Must be run as Administrator

# Color codes for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Test-Administrator {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if running as Administrator
if (-not (Test-Administrator)) {
    Write-ColorOutput $Red "ERROR: This script must be run as Administrator!"
    Write-ColorOutput $Yellow "Please right-click PowerShell and select 'Run as Administrator'"
    pause
    exit 1
}

Write-ColorOutput $Cyan "======================================"
Write-ColorOutput $Cyan "   WSL2 Installation Script"
Write-ColorOutput $Cyan "======================================"
Write-Output ""

# Check Windows version
Write-ColorOutput $Cyan "[1/6] Checking Windows version..."
$osVersion = [System.Environment]::OSVersion.Version
if ($osVersion.Build -lt 18362) {
    Write-ColorOutput $Red "ERROR: WSL2 requires Windows 10 version 1903 or higher (Build 18362+)"
    Write-ColorOutput $Yellow "Your version: Build $($osVersion.Build)"
    pause
    exit 1
}
Write-ColorOutput $Green "✓ Windows version is compatible (Build $($osVersion.Build))"
Write-Output ""

# Check if WSL is already installed
Write-ColorOutput $Cyan "[2/6] Checking current WSL installation..."
$wslInstalled = Get-Command wsl -ErrorAction SilentlyContinue
if ($wslInstalled) {
    Write-ColorOutput $Yellow "WSL is already installed. Checking version..."
    try {
        $wslVersion = wsl --status 2>&1
        Write-Output $wslVersion
        Write-ColorOutput $Yellow "This script will ensure WSL2 is properly configured."
        Write-Output ""
    }
    catch {
        Write-ColorOutput $Yellow "WSL command available but status check failed."
    }
}
else {
    Write-ColorOutput $Yellow "WSL not detected. Will perform fresh installation."
}
Write-Output ""

# Enable WSL and Virtual Machine Platform features
Write-ColorOutput $Cyan "[3/6] Enabling WSL and Virtual Machine Platform features..."
Write-ColorOutput $Yellow "This may take a few minutes..."

try {
    # Enable WSL
    Write-Output "Enabling Windows Subsystem for Linux..."
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
    
    # Enable Virtual Machine Platform
    Write-Output "Enabling Virtual Machine Platform..."
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
    
    Write-ColorOutput $Green "✓ Features enabled successfully"
}
catch {
    Write-ColorOutput $Red "ERROR: Failed to enable features - $_"
    pause
    exit 1
}
Write-Output ""

# Download and install WSL2 kernel update
Write-ColorOutput $Cyan "[4/6] Downloading WSL2 Linux kernel update..."
$kernelUrl = "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi"
$kernelInstaller = "$env:TEMP\wsl_update_x64.msi"

try {
    Write-Output "Downloading from: $kernelUrl"
    Invoke-WebRequest -Uri $kernelUrl -OutFile $kernelInstaller -UseBasicParsing
    Write-ColorOutput $Green "✓ Download completed"
    
    Write-Output "Installing WSL2 kernel update..."
    Start-Process msiexec.exe -Wait -ArgumentList "/i $kernelInstaller /quiet /norestart"
    Write-ColorOutput $Green "✓ WSL2 kernel installed"
    
    # Cleanup
    Remove-Item $kernelInstaller -ErrorAction SilentlyContinue
}
catch {
    Write-ColorOutput $Yellow "Warning: Kernel update download/install failed - $_"
    Write-ColorOutput $Yellow "You may need to download it manually from: https://aka.ms/wsl2kernel"
}
Write-Output ""

# Set WSL2 as default version
Write-ColorOutput $Cyan "[5/6] Setting WSL2 as default version..."
try {
    wsl --set-default-version 2
    Write-ColorOutput $Green "✓ WSL2 set as default version"
}
catch {
    Write-ColorOutput $Yellow "Warning: Could not set WSL2 as default - $_"
}
Write-Output ""

# Install Ubuntu distribution
Write-ColorOutput $Cyan "[6/6] Installing Ubuntu Linux distribution..."
Write-ColorOutput $Yellow "This will download and install Ubuntu 22.04 LTS..."

try {
    # Check if Ubuntu is already installed
    $ubuntuInstalled = wsl --list --quiet 2>&1 | Select-String -Pattern "Ubuntu"
    
    if ($ubuntuInstalled) {
        Write-ColorOutput $Yellow "Ubuntu is already installed:"
        wsl --list --verbose
        Write-Output ""
        Write-ColorOutput $Yellow "Skipping Ubuntu installation."
    }
    else {
        Write-Output "Installing Ubuntu 22.04..."
        wsl --install -d Ubuntu-22.04
        Write-ColorOutput $Green "✓ Ubuntu installation initiated"
    }
}
catch {
    Write-ColorOutput $Yellow "Warning: Ubuntu installation may require manual setup - $_"
    Write-ColorOutput $Yellow "You can install Ubuntu from Microsoft Store or run: wsl --install -d Ubuntu-22.04"
}
Write-Output ""

# Completion message
Write-ColorOutput $Green "======================================"
Write-ColorOutput $Green "   Installation Completed!"
Write-ColorOutput $Green "======================================"
Write-Output ""

Write-ColorOutput $Yellow "IMPORTANT: A system restart is required to complete the installation."
Write-Output ""
Write-ColorOutput $Cyan "Next Steps:"
Write-Output "1. Restart your computer"
Write-Output "2. After restart, launch Ubuntu from the Start Menu"
Write-Output "3. Complete the Ubuntu setup (create username and password)"
Write-Output "4. Verify installation by running: wsl --list --verbose"
Write-Output "5. You can then proceed to install Docker Desktop or Docker Engine"
Write-Output ""

Write-ColorOutput $Yellow "Would you like to restart now? (Y/N)"
$restart = Read-Host
if ($restart -eq "Y" -or $restart -eq "y") {
    Write-ColorOutput $Green "Restarting in 5 seconds..."
    Start-Sleep -Seconds 5
    Restart-Computer -Force
}
else {
    Write-ColorOutput $Yellow "Please remember to restart your computer manually to complete the installation."
    Write-Output ""
    pause
}
