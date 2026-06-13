# FishLodger: Project Analysis & Feature Overview

**FishLodger** is a high-performance Progressive Web App (PWA) designed for the Lucena Fish Port Complex. It serves as a centralized hub for monitoring market operations, tracking fish supply chains, and providing AI-driven market predictions.

---

## 1. Core Architecture & Tech Stack
*   **Backend**: Django (REST Framework) with a custom User model (Admin, Retailer, Staff).
*   **Frontend**: React (SPAs) featuring a modern "Industrial" dark-themed UI.
*   **Intelligence**: `Scikit-Learn` (Random Forest Regressor) for AI forecasting.
*   **Data Visualization**: `Recharts` for interactive analytics.
*   **Mapping**: `React-Leaflet` for real-time geographic vessel tracking.
*   **Offline Support**: `Dexie.js` (IndexedDB) for offline data caching and synchronization.

---

## 2. Key Functional Features

### 📊 Dashboard & Live Intel
*   **Real-time Operational Overview**: At-a-glance metrics for total fish species, active retailers, and market sentiment (Bullish/Bearish/Stable).
*   **Automated Market Alerts**: The system identifies and alerts users to anomalies such as 50%+ supply drops or extreme weather conditions.
*   **Live Activity Feed**: Real-time updates on price changes and deliveries, synchronized via WebSockets.

### 🧠 AI & Predictive Analytics
*   **7-Day Price Forecasting**: Uses a Random Forest model to predict future prices based on historical trends, seasonal patterns, and calendar data.
*   **Correlation Mapping**: Scatter-plot analysis showing the inverse relationship between supply volume and market price.
*   **Seasonality Tracking**: Monthly average volume charts to identify peak and lean periods for specific fish species.
*   **Comparative Pricing**: side-by-side performance tracking of multiple fish species over a 7-day window.

### 🚢 Live Supply Chain Monitoring
*   **Interactive Vessel Map**: Tracks the real-time position of boats (`SupplySources`) and their origin fishing grounds.
*   **ETA Calculation**: Uses the **Haversine formula** to calculate the distance and estimated arrival time (ETA) for vessels approaching the port.
*   **Supply Bubble Markers**: Visualizes the volume of fish coming from different regions (e.g., at-sea, in-transit, or docked).

### 📝 Data Management & Offline Capability
*   **Offline-First Data Entry**: Designed for the port environment where connectivity may be unstable. Staff can record prices and quantities locally; the app automatically syncs data to the server when connection is restored.
*   **Inventory Control**: Specialized management for retailers to track their current stock levels, units (kg), and stall availability.

### 📄 Automated Reporting & Communication
*   **Daily Market Bulletin**: One-click PDF generation (via `ReportLab`) that compiles the day's prices, retailer info, and market summaries for distribution.
*   **Lucena Weather Integration**: Real-time weather monitoring (OpenWeather API) with automated system-wide notifications for high wind or heat alerts.
*   **Bulletin Board**: Categorized advisories (Information, Urgent, Weather) for all port stakeholders.

---

## 3. Role-Based Access Control (RBAC)
*   **Admin**: Full system control, user management, and advanced reporting.
*   **Staff**: Responsible for data entry, price monitoring, and generating market bulletins.
*   **Retailer**: Manages stall inventory, views personal analytics, and receives delivery notifications.

---

## 4. System Highlights
*   **Offline-First PWA**: Integrated local caching with **Dexie.js** and **IndexedDB** to allow offline transactions that automatically sync back to the Django backend once online.
*   **GIS Live Vessel Tracking Map**: Built using **React-Leaflet** and calculated Estimated Time of Arrival (ETA) coordinates using the **Haversine formula** on the backend.
*   **AI-Driven Forecasting**: Used a Python-based **Random Forest Regressor** (Scikit-Learn) to provide accurate 7-day price predictions based on seasonal patterns.
*   **Automated Bulletin Engine**: Generated professional PDF bulletins instantly with Python's **ReportLab** library.
*   **WebSockets for Alerts**: Utilized **Django Channels** and **Daphne** to push live weather warning alerts (e.g., wind speed alerts, heat alerts) directly to stakeholders.
*   **High-Contrast Dark Mode**: Designed a custom **"Command Center" UI** specifically optimized for outdoor and night readability.
*   **Scalability**: Optimized queries and caching (Django Cache) for handling high-volume market data.
*   **Actionable Insights**: Transitions from raw data (price lists) to actionable intelligence (forecasting and sentiment analysis).
