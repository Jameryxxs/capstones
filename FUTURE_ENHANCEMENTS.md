# FishLedger: Future Enhancements & System Roadmap

This document outlines proposed future upgrades and enhancements for the **FishLedger** system. These features are designed to further improve the operational efficiency, analytical accuracy, and overall monitoring capabilities of the Lucena Fish Port Complex in future iterations of the project.

---

## 1. Advanced Predictive Analytics Enhancements

The current predictive model utilizes Linear Regression. To achieve enterprise-grade accuracy, the following enhancements are recommended:

*   **Algorithm Upgrade (Non-linear Forecasting):** Transition from Linear Regression to **Random Forest Regression** or **Facebook Prophet**. These algorithms are significantly better at capturing complex market behaviors, such as seasonality (e.g., higher prices during Holy Week) and sudden supply shocks.
*   **Multivariate Forecasting (External Data Integration):** Enhance the AI model by feeding it external variables rather than just historical prices. Integrating the existing `weather_automation_service` to factor in **Typhoons/Weather Conditions** and connecting to a **Fuel Price API** will drastically improve the realism and accuracy of the predictions.
*   **Confidence Intervals (Prediction Bands):** Instead of generating a single predicted price point (e.g., ₱180), the system will generate a mathematically sound prediction range (e.g., "₱175 - ₱185 with 90% confidence").
*   **Automated Anomaly Detection:** Implement an AI-driven early warning system. If the AI detects a predicted price spike of >20% within a 3-day window, it will automatically trigger a "High Volatility Warning" on the Dashboard for port administrators.
*   **Continuous Learning Pipeline:** Develop a CRON job/background task that automatically retrains the machine learning model every week using the newly entered staff data, ensuring the AI becomes smarter and more accurate over time.

---

## 2. Real-Time Tracking & Hardware Integration

*   **Physical GPS Integration (IoT):** Currently, vessel locations are simulated or manually updated. A future upgrade would involve integrating actual physical IoT GPS trackers placed on the fishing vessels, transmitting live coordinates directly to the backend via satellite or cellular networks.
*   **Geofencing Alerts:** Establish a digital "Geofence" around the Lucena Fish Port. When a tracked vessel enters a 5km radius of the port, the system automatically alerts the docking staff and retailers to prepare for arrival.

---

## 3. Communication & Notification Upgrades

*   **SMS & Email Gateway Integration:** Integrate third-party APIs (like Twilio or Semaphore) to send critical market alerts (e.g., sudden port closures, extreme weather warnings) directly to the mobile phones of registered retailers and suppliers via SMS.
*   **Automated Report Distribution:** Currently, Daily Market Bulletins are downloaded manually. This can be upgraded so the system automatically emails the generated PDF report to key stakeholders every day at 5:00 PM.

---

## 4. Frontend & PWA Optimizations

*   **Full Offline Support:** Enhance the Progressive Web App (PWA) service workers to allow retailers to input data even when the internet connection at the docks is lost. The data will cache locally and automatically sync to the Django backend once the connection is restored.
*   **Multi-language Support (Localization):** Implement a localization toggle allowing users to seamlessly switch the entire interface between English and Tagalog, ensuring better usability for all port workers.
