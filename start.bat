@echo off
REM Gym Application Startup Script (Windows)
REM This script starts both backend and frontend servers automatically

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         GYM APPLICATION - Integrated Development Server        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo ✓ Node.js found
echo ✓ Python found
echo.
echo Starting integrated development servers...
echo.
echo Backend will run on: http://127.0.0.1:8000/
echo Frontend will run on: http://localhost:5174/
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Run both servers concurrently
npm run dev

pause
