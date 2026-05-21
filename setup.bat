@echo off
REM One-click setup for standalone WSL2 + Docker + Compose environment
REM Runs the main installer script from public\install-wsl2.bat

setlocal
cd /d "%~dp0"

if not exist "public\install-wsl2.bat" (
    echo ERROR: Could not find public\install-wsl2.bat
    pause
    exit /b 1
)

echo Running standalone setup installer...
call "public\install-wsl2.bat"
set EXIT_CODE=%errorlevel%

if %EXIT_CODE% neq 0 (
    echo.
    echo Setup finished with errors. Exit code: %EXIT_CODE%
    pause
    exit /b %EXIT_CODE%
)

echo.
echo Setup completed.
echo Open a NEW terminal to use docker and docker-compose commands from Windows.
pause
exit /b 0
