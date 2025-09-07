#!/bin/bash

echo "Starting Flask WebSocket Server for Google Docs Clone..."
echo "Make sure Next.js is running on port 3000"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements if they haven't been installed
if [ ! -f "venv/installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch venv/installed
fi

echo "Starting Flask server on http://localhost:5001"
# Start Flask server
python app.py