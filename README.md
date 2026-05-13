# 🐟 FishLodger: PWA Fish Market Monitoring System

A Progressive Web App Up-to-Date Fish Market Monitoring System with Retailer Information, Supply Source Identification, Automated Report Generation, and Predictive Analytics for **Lucena Fish Port Complex**.

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
    python manage.py runserver
    ```
    *   The API will be live at: `http://127.0.0.1:8000/`
    *   Admin Panel: `http://127.0.0.1:8000/admin/` (Login: `admin` / `admin123`)

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
