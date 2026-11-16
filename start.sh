#!/bin/bash
# Gym Application Startup Script (Unix/Linux/Mac)
# This script starts both backend and frontend servers automatically

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         GYM APPLICATION - Integrated Development Server        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH"
    echo "Please install Python from https://www.python.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo "✓ Python found: $(python --version)"
echo ""
echo "Starting integrated development servers..."
echo ""
echo "📍 Backend will run on: http://127.0.0.1:8000/"
echo "📍 Frontend will run on: http://localhost:5174/"
echo "📍 API will be at: http://127.0.0.1:8000/api/"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Run both servers concurrently
npm run dev
