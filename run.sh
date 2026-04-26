#!/bin/bash
# Smart IGRS Analyzer - Run Script for Linux/Mac

echo ""
echo "========================================="
echo " Smart IGRS Analyzer - Flask Server"
echo "========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed!"
    echo "Please install Python 3.8+ from https://www.python.org"
    exit 1
fi

echo "[1/3] Checking Python..."
python3 --version

echo ""
echo "[2/3] Installing dependencies..."
pip3 install -q -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    exit 1
fi

echo ""
echo "[3/3] Starting Flask server..."
echo ""
echo "Server akan berjalan di: http://localhost:5000"
echo "Tekan Ctrl+C untuk menghentikan server"
echo ""

python3 app.py
