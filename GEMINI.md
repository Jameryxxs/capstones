# FishLedger Project Instructions

## Project Overview
**FishLedger: A Progressive Web App Fish Market Monitoring System with Retailer Information, Supply Source Identification, Automated Report Generation, and Predictive Analytics for Lucena Fish Port Complex**

## Architecture
- **Backend**: Django (Lucena/backend)
  - Custom User Model (Admin, Retailer, Staff)
  - Models for Fish, Retailers, Prices, Supply, etc.
  - JWT Auth for secure API access.
  - AI Forecasting: `LinearRegression` for price prediction.
  - PDF Generation: `reportlab` for Daily Market Bulletins.
- **Frontend**: React (Lucena/frontend)
  - Multi-page routing with `react-router-dom`.
  - Data Visualization with `recharts`.
  - Mapping with `react-leaflet`.

## API Endpoints
- `auth/login/`, `auth/register/`
- `fish/`, `retailers/`, `fish-prices/`
- `dashboard-stats/`: Real-time analytics data.
- `forecast/<id>/`: 7-day AI price prediction.
- `bulletin/`: PDF report download.

## Running the Project
1. **Backend**: `venv/Scripts/activate` -> `cd backend` -> `python manage.py runserver`
2. **Frontend**: `cd frontend` -> `npm start`

## Default Admin
- **User**: `admin`
- **Pass**: `admin123`
