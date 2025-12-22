@echo off
echo Starting Docker Web Desktop Application...
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