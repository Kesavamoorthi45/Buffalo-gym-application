#!/bin/bash
# Initial Setup Script for Gym Application (Unix/Linux/Mac)
# This script sets up all dependencies and configurations

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              GYM APPLICATION - Initial Setup                   ║"
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

echo "Installing root dependencies..."
echo ""
npm install

echo ""
echo "Installing frontend dependencies..."
echo ""
cd gym-frontend
npm install
cd ..

echo ""
echo "Installing backend dependencies..."
echo ""
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d venv ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python packages
echo "Installing Python packages from requirements.txt..."
pip install -r requirements.txt

# Run Django migrations
echo ""
echo "Running Django migrations..."
python manage.py migrate

cd ..

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   Setup Complete! ✓                            ║"
echo "║                                                                ║"
echo "║  To start the application, run:                              ║"
echo "║    npm run dev                                               ║"
echo "║  or                                                          ║"
echo "║    ./start.sh   (Unix/Mac)                                   ║"
echo "║                                                                ║"
echo "║  Backend: http://127.0.0.1:8000/                            ║"
echo "║  Frontend: http://localhost:5174/                           ║"
echo "║  API: http://127.0.0.1:8000/api/                            ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
