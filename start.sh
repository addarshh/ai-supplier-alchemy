#!/bin/bash

echo "Starting AI Supplier Analysis Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "Error: Backend directory not found. Please ensure the backend folder exists."
    exit 1
fi

echo "Setting up Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
python3 -m pip install -r requirements.txt

echo "Starting backend server..."
source venv/bin/activate && python3 app.py &
BACKEND_PID=$!

echo "Backend server started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

echo "Starting frontend development server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo "Frontend server started with PID: $FRONTEND_PID"

echo ""
echo "=========================================="
echo "AI Supplier Analysis is starting up..."
echo "=========================================="
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 