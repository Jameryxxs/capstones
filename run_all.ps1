# FishLodger One-Click Startup Script

# 1. Start Backend (Django + Daphne)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ..\venv\Scripts\activate; python manage.py runserver" -WindowStyle Normal

# 2. Start Frontend (React)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "FISH_LODGER: SYSTEM_STARTUP_INITIATED" -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "----------------------------------------------------" -ForegroundColor Cyan
