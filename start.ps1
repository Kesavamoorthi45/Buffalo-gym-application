#!/usr/bin/env pwsh
# Gym Application Startup Script (PowerShell)
# This script starts both backend and frontend servers automatically

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         GYM APPLICATION - Integrated Development Server        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeCheck = node --version 2>$null
if (-not $?) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
$pythonCheck = python --version 2>$null
if (-not $?) {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Node.js found: $nodeCheck" -ForegroundColor Green
Write-Host "✓ Python found: $(python --version)" -ForegroundColor Green
Write-Host ""
Write-Host "Starting integrated development servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 Backend: http://127.0.0.1:8000/" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:5174/" -ForegroundColor Cyan
Write-Host "📍 API: http://127.0.0.1:8000/api/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Run both servers concurrently
npm run dev

Read-Host "Press Enter to exit"
