@echo off

echo Starting Frontend Development Server...
start "Frontend Server" cmd /c "cd frontend && npm install && npm run dev"

