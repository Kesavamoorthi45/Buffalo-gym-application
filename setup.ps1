#!/usr/bin/env pwsh
# Initial Setup Script for Gym Application (PowerShell)
# This script sets up all dependencies and configurations

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              GYM APPLICATION - Initial Setup                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeVersion = node --version 2>$null
if (-not $?) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
$pythonVersion = python --version 2>$null
if (-not $?) {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
Write-Host ""

Write-Host "Installing root dependencies..." -ForegroundColor Yellow
Write-Host ""
npm install

Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Write-Host ""
Push-Location gym-frontend
npm install
Pop-Location

Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Write-Host ""
Push-Location backend

# Create virtual environment if it doesn't exist
if (-not (Test-Path venv)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Install Python packages
Write-Host "Installing Python packages from requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt

# Run Django migrations
Write-Host ""
Write-Host "Running Django migrations..." -ForegroundColor Yellow
python manage.py migrate

Pop-Location

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   Setup Complete! ✓                            ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║  To start the application, run:                              ║" -ForegroundColor Cyan
Write-Host "║    npm run dev                                               ║" -ForegroundColor Yellow
Write-Host "║  or                                                          ║" -ForegroundColor Cyan
Write-Host "║    ./start.ps1  (PowerShell)                                 ║" -ForegroundColor Yellow
Write-Host "║    ./start.bat  (Command Prompt)                             ║" -ForegroundColor Yellow
Write-Host "║    ./start.sh   (Unix/Mac)                                   ║" -ForegroundColor Yellow
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║  Backend: http://127.0.0.1:8000/                            ║" -ForegroundColor Cyan
Write-Host "║  Frontend: http://localhost:5174/                           ║" -ForegroundColor Cyan
Write-Host "║  API: http://127.0.0.1:8000/api/                            ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
