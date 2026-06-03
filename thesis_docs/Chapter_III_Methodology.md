# Chapter III: Methodology

This chapter discusses the methodology used in developing the FishLodger system. It outlines the research design, the software development lifecycle, requirements analysis, data gathering procedures, and the technical design of the system, including its database architecture and quality standards.

## 3.1 Research Design
The researchers employed a **Descriptive and Developmental** research design. 
- **Descriptive Research**: Used to document and analyze the current manual processes, price fluctuations, and supply patterns at the Lucena Fish Port Complex.
- **Developmental Research**: Focused on the systematic design, development, and evaluation of the FishLodger Progressive Web Application (PWA) to solve identified inefficiencies in market monitoring.

## 3.2 Software Development Lifecycle (SDLC)
The **Agile Methodology** was adopted for the development of FishLodger. This iterative approach allowed the proponents to deliver functional modules incrementally and refine features based on stakeholder feedback.

*(Figure 1. Agile SDLC Model for FishLodger)*
The figure illustrates the iterative cycle of planning, designing, building, and testing used to ensure the system meets the evolving needs of the Lucena Fish Port. Each iteration or "sprint" resulted in a functional component, such as the price entry module or the forecasting engine.

1. **Requirements Analysis**: Identification of core problems such as delayed price reporting and lack of supply visualization.
2. **System Design**: Creation of the system architecture, database schema, and UI/UX wireframes.
3. **Sprints/Development**: Coding the backend (Django) and frontend (React) in two-week cycles.
4. **Testing**: Continuous integration and testing of modules like the AI forecasting engine and the Live Tracking Map.
5. **Review and Deployment**: Final evaluation against ISO 25010 standards before deployment as a PWA.

## 3.3 Requirements Analysis

### 3.3.1 Functional Requirements
1. **User Management**: Secure role-based access for Admins, Retailers, and Staff using JWT authentication.
2. **Fish Price Monitoring**: Real-time recording and tracking of market prices across different retailers and species.
3. **AI Price Forecasting**: A 7-day predictive analysis using Random Forest Regressor models based on historical trends.
4. **Live Supply Tracking**: A geographic visualization (GIS) of fishing vessels in transit, including their current GPS coordinates and arrival status.
5. **Automated PDF Generation**: Daily generation of the "Market Bulletin" summarizing port activities.
6. **Bulletin Board**: An advisory system for weather warnings and port announcements.

### 3.3.2 Non-Functional Requirements
1. **Security**: Implementation of industry-standard JWT for API security and data encryption.
2. **Usability**: A responsive, mobile-first PWA interface optimized for field use in a busy port environment.
3. **Performance**: API response times under 500ms and forecasting generation in under 2 seconds.
4. **Availability**: The system must be accessible 24/7 across various devices (Android, iOS, Windows).

### 3.3.3 Requirements Documentation
Formal documentation was maintained through a Software Requirements Specification (SRS) document, detailing every interaction between the user roles (Admin, Retailer, Staff) and the system modules. This ensured that all technical implementations aligned with the port's operational goals.

## 3.4 Data Gathering Procedure
The researchers followed a systematic three-stage data collection process:
1. **Interviews**: Structured interviews with Lucena Fish Port administrators to understand administrative workflows and identify pain points in current reporting.
2. **Observation**: On-site observation of the current manual price recording and bulletin distribution process to identify bottlenecks.
3. **Document Analysis**: Reviewing historical paper logs of fish deliveries and price bulletins to use as training data for the AI model and to design the digital database schema.

## 3.5 Respondents of the Study
The primary respondents included:
- **Ten (10) Market Administrators**: To evaluate system management and reporting features.
- **Twenty (20) Retailers**: To test the ease of price entry and inventory management.
- **Fifteen (15) Frequent Port Consumers**: To evaluate the accuracy and accessibility of the price forecasts and bulletins.

## 3.6 Statistical Treatment
The following statistical tools were used to analyze the collected data:
- **Arithmetic Mean**: Used for calculating average market prices for the Daily Bulletin.
- **Random Forest Regression**: Used for predictive analytics to handle non-linear price and supply relationships with high accuracy.
- **Percentage**: Used to analyze the results of the ISO 25010 usability and quality surveys.

## 3.7 Ethical Considerations
The researchers strictly adhered to **Republic Act No. 10173 (Data Privacy Act of 2012)**. 
- **Informed Consent**: All participants were informed of the study's purpose and provided written consent.
- **Data Privacy**: Personal identifiers like emails and phone numbers were encrypted.
- **Objectivity**: The researchers maintained neutrality during data gathering and analysis.

## 3.8 Design of Software, Systems, and Processes

### 3.8.1 Use Case Diagram
*(Figure 2. Use Case Diagram for FishLodger)*
The diagram illustrates the roles of the three primary actors. The Admin manages users and system-wide settings; the Retailer manages their own prices and inventory; and the Staff/Public actor accesses the live monitoring dashboard and forecasts.

### 3.8.2 Context Diagram
*(Figure 3. Context Diagram)*
This diagram shows the FishLodger system at the center, receiving data inputs from external entities (Retailers, Suppliers, Weather API) and providing outputs (Forecasts, PDF Bulletins, Map Visualizations) to the end-users.

### 3.8.3 Data Flow Diagram (DFD)
*(Figure 4. Data Flow Diagram Level 0)*

### 3.8.4 Entity Relationship Diagram (ERD)
*(Figure 5. Entity Relationship Diagram)*
The ERD defines the structural relationship between core entities: Users, Fish, Retailers, FishPrices, SupplySources (Vessels), FishingLocations, and Predictions. It ensures data integrity and supports complex queries for analytics.

## 3.9 Database Structure and Schema
The system utilizes a relational database management system (RDBMS) designed to handle time-series price data and geospatial vessel coordinates. Each table is normalized to the Third Normal Form (3NF) to minimize redundancy and maximize efficiency.

## 3.10 Data Dictionary

### Table 1: User (Custom User Model)
| Field | Type | Description |
| :--- | :--- | :--- |
| username | Char(150) | Unique login identifier. |
| role | Choice | Admin, Retailer, or Staff. |
| phone_number | Char(20) | Contact for SMS notifications. |

### Table 2: Fish
| Field | Type | Description |
| :--- | :--- | :--- |
| fish_name | Char(255) | Common name of species. |
| category | Choice | Freshwater or Saltwater. |
| average_price | Decimal | Baseline market price. |

### Table 3: SupplySource (Vessel Tracking)
| Field | Type | Description |
| :--- | :--- | :--- |
| boat_name | Char(255) | Name of the fishing vessel. |
| fishing_location | FK | Origin of the supply. |
| current_lat | Decimal | Current latitude for GPS tracking. |
| current_lng | Decimal | Current longitude for GPS tracking. |
| status | Choice | At Sea, In Transit, or Docked. |

## 3.11 Development and Testing
The system was developed using a modern decoupled architecture:
- **Backend Environment**: Python 3.10 with Django REST Framework (DRF).
- **Frontend Environment**: Node.js with React 18, utilizing Axios for API communication.
- **Testing Methods**:
  - **Unit Testing**: Validation of individual API endpoints and model logic.
  - **Integration Testing**: Ensuring seamless data exchange between the backend and the React frontend.
  - **User Acceptance Testing (UAT)**: Conducting tests with actual fish port personnel to verify functional appropriateness.

## 3.12 Description of the Prototype
The prototype is a high-fidelity Progressive Web Application. It includes a dark-themed "Command Center" dashboard with real-time charts, a Leaflet-based map showing vessel movements, and a dedicated mobile interface for retailers to update prices instantly.

## 3.13 Deployment Diagram
*(Figure 6. Deployment Diagram)*
This diagram visualizes the implementation of the system, showing the interaction between the Cloud Server (hosting the Django API and Database) and the various Client Nodes (Smartphones, Tablets, and Desktops) accessing the PWA.

## 3.14 ISO 25010 Quality Standards
The system was evaluated against the following ISO 25010 sub-characteristics:
1. **Functional Suitability**:
   - **Functional Completeness**: Every requirement identified in the analysis was fully implemented.
   - **Functional Appropriateness**: The features like AI forecasting were confirmed to be directly relevant to the port's needs.
2. **Usability**: Evaluated through learnability and operability tests, ensuring that users with varying technical skills can navigate the system with minimal training.
