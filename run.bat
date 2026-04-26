@echo off
REM Smart IGRS Analyzer - Run Script for Windows

echo.
echo =========================================
echo  Smart IGRS Analyzer - Flask Server
echo =========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    echo Please install Python 3.8+ from https://www.python.org
    pause
    exit /b 1
)

echo [1/3] Checking Python...
python --version

echo.
echo [2/3] Installing dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Flask server...
echo.
echo Server akan berjalan di: http://localhost:5000
echo Tekan Ctrl+C untuk menghentikan server
echo.

python app.py

pause
