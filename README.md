# 🐟 FishLedger: A Progressive Web App Fish Market Monitoring System with Retailer Information, Supply Source Identification, Automated Report Generation, and Predictive Analytics for Lucena Fish Port Complex

A Progressive Web App Up-to-Date Fish Market Monitoring System with Retailer Information, Supply Source Identification, Automated Report Generation, and Predictive Analytics for **Lucena Fish Port Complex**.

## ✨ Key Technical Highlights

*   **Offline-First PWA**: Integrated local caching with **Dexie.js** and **IndexedDB** to allow offline transactions that automatically sync back to the Django backend once online.
*   **GIS Live Vessel Tracking Map**: Built using **React-Leaflet** and calculated Estimated Time of Arrival (ETA) coordinates using the **Haversine formula** on the backend.
*   **AI-Driven Forecasting**: Used a Python-based **Random Forest Regressor** (Scikit-Learn) to provide accurate 7-day price predictions based on seasonal patterns.
*   **Automated Bulletin Engine**: Generated professional PDF bulletins instantly with Python's **ReportLab** library.
*   **WebSockets for Alerts**: Utilized **Django Channels** and **Daphne** to push live weather warning alerts (e.g., wind speed alerts, heat alerts) directly to stakeholders.
*   **High-Contrast Dark Mode**: Designed a custom **"Command Center" UI** specifically optimized for outdoor and night readability.

## 🚀 How to Run the Project

### 1. Prerequisites
*   **Python 3.10+**
*   **Node.js & npm**
*   **Git**

---

### 2. Backend Setup (Django)
1.  **Open a terminal** in the project root (`THESIS/`).
2.  **Activate the Virtual Environment**:
    *   Windows: `venv\Scripts\activate`
    *   Mac/Linux: `source venv/bin/activate`
3.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```
4.  **Run Migrations**:
    ```bash
    python manage.py migrate
    ```
5.  **Start the Server**:
    ```bash
    python manage.py runserver 0.0.0.0:8000
    ```
    *   The API will be live at: `http://192.168.18.167:8000/` (Local IP)
    *   Admin Panel: `http://192.168.18.167:8000/admin/`

---

### 3. Frontend Setup (React)
1.  **Open a NEW terminal** in the project root (`THESIS/`).
2.  **Navigate to the frontend folder**:
    ```bash
    cd frontend
    ```
3.  **Install Dependencies** (only needed once):
    ```bash
    npm install
    ```
4.  **Start the React App**:
    ```bash
    npm start
    ```
    *   The app will open at: `http://localhost:3000`
    *   **Mobile Testing**: Access via `http://192.168.18.167:3000` on your phone.

---

### 4. Special Features verification
*   **Predictive Analytics**: Go to the "Analytics" tab, select a fish, and generate a forecast.
*   **Market Bulletins**: Go to the "Reports" tab to download the PDF.
*   **Supply Map**: Go to the "Supply" tab to view fishing grounds in Lucena.

---

## 🛠 Tech Stack
*   **Backend**: Django, Django Rest Framework, SimpleJWT, Scikit-Learn (AI), ReportLab (PDF).
*   **Frontend**: React.js, Recharts (Visualization), Leaflet (Maps).
*   **Database**: SQLite (Development).
