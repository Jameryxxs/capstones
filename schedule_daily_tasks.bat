@echo off
echo =======================================================
echo FishLedger AI Daily Automation Script
echo =======================================================
echo.
echo Activating Virtual Environment...
call venv\Scripts\activate.bat

echo.
echo [1/2] Running Enhanced Machine Learning Forecasts...
cd backend
python manage.py train_models

echo.
echo [2/2] Generating Daily Market Bulletin with AI Insights...
python generate_bulletin.py

echo.
echo =======================================================
echo Daily Automation Complete!
echo =======================================================
pause
