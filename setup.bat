@echo off
REM Initial Setup Script for Gym Application
REM This script sets up all dependencies and configurations

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              GYM APPLICATION - Initial Setup                   ║
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

echo ✓ Node.js found: %NODEJS_VERSION%
echo ✓ Python found
echo.

echo Installing root dependencies...
echo.
npm install

echo.
echo Installing frontend dependencies...
echo.
cd gym-frontend
npm install
cd ..

echo.
echo Installing backend dependencies...
echo.
cd backend

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python packages
echo Installing Python packages from requirements.txt...
pip install -r requirements.txt

REM Run Django migrations
echo.
echo Running Django migrations...
python manage.py migrate

cd ..

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   Setup Complete! ✓                            ║
echo ║                                                                ║
echo ║  To start the application, run:                              ║
echo ║    npm run dev                                               ║
echo ║  or                                                          ║
echo ║    ./start.bat  (Windows)                                    ║
echo ║    ./start.sh   (Unix/Mac)                                   ║
echo ║                                                                ║
echo ║  Backend: http://127.0.0.1:8000/                            ║
echo ║  Frontend: http://localhost:5174/                           ║
echo ║  API: http://127.0.0.1:8000/api/                            ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause
