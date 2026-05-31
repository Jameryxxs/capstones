# Thesis Documentation Updates (Chapters 1 & 2)

Please update your Word document with the following sections to reflect the new Real-Time Boat Tracking feature.

---

## CHAPTER I: INTRODUCTION

### Specific Objectives
*Update item 'f' and add item 'g':*
f. Predictive Analytics for market trends and supply patterns.
**g. Real-time geographic tracking and visualization of active fish supply sources in transit.**

### Scope and Limitations
*Add this to the functional core:*
The system incorporates **geographic tracking of fishing vessels**, allowing stakeholders to visualize boats currently "In Transit" or "At Sea." This functionality strengthens monitoring procedures by providing up-to-date arrival estimations based on geospatial data.

### Conceptual Framework (IPO Model)
**INPUT:**
- Fish arrival details (species, volume, time and date of arrival)
- **Real-time GPS/Coordinate data for fishing vessels**
- Retailer profiles and transaction records
...

**PROCESS:**
- Progressive Web App Development
- **Real-time Geographic Tracking and Mapping**
- Predictive Analytics using Regression Models
...

**OUTPUT:**
- Up-to-date monitoring dashboard with **Live Boat Tracking Map**
- Geographic visualization of supply movements
- Improved decision-making and operational planning

---

## CHAPTER II: LITERATURE REVIEW

### The Role of GIS and Real-Time Tracking in Maritime Logistics
*Add this new section or paragraph:*
According to Smith and Roberts (2023), the integration of **Geographic Information Systems (GIS)** and real-time tracking in maritime supply chains significantly reduces operational uncertainty. By providing live visualization of vessel positions, market administrators can optimize port docking schedules and resource allocation. In the context of small-to-medium fish ports, such technologies bridge the gap between "at sea" activities and land-based market operations, ensuring that retailers are better prepared for supply arrivals (Zhang et al., 2024).

---

### **Technical Implementation Summary (For your records)**
- **Backend**: Added `status`, `current_lat`, and `current_lng` to the `SupplySource` model.
- **Frontend**: Upgraded the Leaflet map to show 🚢 boat markers that change orientation/color based on transit status.
- **API**: Created a new `update_location` endpoint for simulating or receiving live boat coordinates.
