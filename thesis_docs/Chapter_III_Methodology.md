# Chapter III: Methodology

This chapter discusses the methodology used in developing the FishLedger system. It outlines the research design, the software development lifecycle, requirements analysis, data gathering procedures, and the technical design of the system, including its database architecture and quality standards.

## 3.1 Research Design
The researchers employed a **Descriptive and Developmental** research design. 
- **Descriptive Research**: Used to document and analyze the current manual processes, price fluctuations, and supply patterns at the Lucena Fish Port Complex.
- **Developmental Research**: Focused on the systematic design, development, and evaluation of FishLedger: A Progressive Web App Fish Market Monitoring System with Retailer Information, Supply Source Identification, Automated Report Generation, and Predictive Analytics for Lucena Fish Port Complex, to solve identified inefficiencies in market monitoring.

## 3.2 Software Development Lifecycle (SDLC)
The **Agile Methodology** was adopted for the development of FishLedger. This iterative approach allowed the proponents to deliver functional modules incrementally and refine features based on stakeholder feedback.

*(Figure 1. Agile SDLC Model for FishLedger)*
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
*(Figure 2. Use Case Diagram for FishLedger)*

The Use Case Diagram for FishLedger defines the functional boundaries of the system and the interactions between its five primary actors. Each actor is assigned specific permissions and access levels to ensure data integrity and operational efficiency within the Lucena Fish Port.

1.  **Admin (System Administrator):**
    *   **User Management:** Responsible for the CRUD (Create, Read, Update, Delete) operations of all user accounts and role assignments.
    *   **System Configuration:** Manages the master list of fish species, fishing locations, and retailer stall assignments.
    *   **Bulletin Management:** Authorizes the posting of official port advisories and weather warnings to the digital bulletin board.
    *   **System Audit:** Monitors system-wide logs and manages the generation of high-level analytical reports.

2.  **Retailer (Fish Vendor):**
    *   **Price and Inventory Entry:** Records daily market prices and updates real-time stock quantities for their specific stall.
    *   **Offline Data Entry:** Utilizes local caching to record data during periods of unstable connectivity, with automatic synchronization to the main server.
    *   **Personal Dashboard:** Accesses historical price trends and inventory analytics specific to their business performance.

3.  **Staff (Market Administrator):**
    *   **Data Verification:** Assists in the collection and verification of price data from multiple retailers to ensure accuracy.
    *   **Logistics Monitoring:** Monitors the live tracking map to coordinate port resources based on incoming vessel arrivals.
    *   **Report Generation:** Generates and distributes the automated "Daily Market Bulletin" in PDF format.

4.  **Guest / Consumer (General Public):**
    *   **Price Inquiry:** Accesses real-time market prices for various fish species across the port.
    *   **Forecast Consumption:** Views AI-driven 7-day price predictions to make informed purchasing decisions.
    *   **Information Access:** Reads port advisories and downloads the latest PDF bulletins for market transparency.

5.  **Supplier (Port Supplier / Vessel Owner):**
    *   **Logistics Updates:** Updates the current status (At Sea, In Transit, Docked) and GPS coordinates of their fishing vessel.
    *   **ETA Coordination:** Communicates estimated times of arrival (ETA) to facilitate smoother docking and delivery processes.

### 3.8.2 Context Diagram
*(Figure 3. Context Diagram)*
This diagram shows the FishLedger system at the center, receiving data inputs from external entities (Retailers, Suppliers, Weather API) and providing outputs (Forecasts, PDF Bulletins, Map Visualizations) to the end-users.

### 3.8.3 Data Flow Diagram (DFD)
*(Figure 4. Data Flow Diagram Level 0)*

### 3.8.4 Entity Relationship Diagram (ERD)
*(Figure 5. Entity Relationship Diagram)*
The ERD defines the structural relationship between core entities: Users, Fish, Retailers, FishPrices, SupplySources (Vessels), FishingLocations, and Predictions. It ensures data integrity and supports complex queries for analytics.

## 3.9 Database Structure and Schema
*(Figure 6. Database Schema)*

The Database Schema illustrated in Figure 6 represents the relational architecture of the FishLedger system. It is specifically optimized to handle multi-dimensional data, including time-series market prices, geospatial coordinates for vessel tracking, and AI-driven forecasting results. To ensure data integrity and operational efficiency, the schema follows these principles:

1.  **Normalization (3NF):** The database is designed in Third Normal Form (3NF) to eliminate data redundancy and ensure that every non-key attribute is functionally dependent only on the primary key.
2.  **Relational Integrity:** Strong foreign key constraints maintain the links between core entities such as Fish, Retailers, and Supply Sources, allowing for complex analytical queries.
3.  **Data Scalability:** The structure is built to support the rapid growth of historical price logs, which are essential for the system's predictive regression models.

## 3.10 Data Dictionary

The Data Dictionary provides a granular breakdown of the system's database entities, serving as a technical reference for the attributes, data types, and functional roles of each field. This ensures that the data structure is consistent across the development lifecycle and supports the system's requirements for data integrity and precision. Below are the primary tables used in the FishLedger system:

### Table 1: User (Custom User Model)
| Field | Type | Description |
| :--- | :--- | :--- |
| username | Char(150) | Unique login identifier. |
| role | Choice | Admin, Retailer, Staff, Guest, or Supplier. |
| phone_number | Char(20) | Contact for SMS notifications. |

### Table 2: Fish
| Field | Type | Description |
| :--- | :--- | :--- |
| fish_name | Char(255) | Common name of species. |
| category | Choice | Freshwater or Saltwater. |
| average_price | Decimal | Baseline market price. |

### Table 3: SupplySource (Vessel Tracking)
This table tracks the movement and status of fishing vessels supplying the port, enabling real-time GIS visualization.
| Field | Type | Description |
| :--- | :--- | :--- |
| boat_name | Char(255) | Name of the fishing vessel. |
| fishing_location | FK | Origin of the supply (links to Table 6). |
| current_lat | Decimal | Current latitude for GPS tracking. |
| current_lng | Decimal | Current longitude for GPS tracking. |
| status | Choice | At Sea, In Transit, or Docked. |

### Table 4: Retailer
This table stores the profiles of individual fish vendors, linking their business information to their authenticated system accounts.
| Field | Type | Description |
| :--- | :--- | :--- |
| user | OneToOne | Link to the Custom User model (Table 1). |
| business_name | Char(255) | Registered name of the fish stall/business. |
| stall_number | Char(50) | Physical location identifier within the port. |
| status | Char(50) | Current account status (Active/Inactive). |

### Table 5: FishPrice
The core transactional table used to log daily market prices, serving as the primary dataset for the forecasting engine.
| Field | Type | Description |
| :--- | :--- | :--- |
| fish | FK | Link to the Fish species (Table 2). |
| retailer | FK | Link to the Retailer (Table 4). |
| price_per_kilo | Decimal | The current market price recorded in PHP. |
| market_date | Date | The specific date of the price entry. |

### Table 6: FishingLocation
Stores the geographic origins of the fish supply, providing context for supply chain analytics.
| Field | Type | Description |
| :--- | :--- | :--- |
| location_name | Char(255) | Name of the fishing ground or port of origin. |
| latitude | Decimal | Geographic latitude of the location. |
| longitude | Decimal | Geographic longitude of the location. |

### Table 7: Prediction
Stores the output of the Linear Regression model, including future price estimations and confidence levels.
| Field | Type | Description |
| :--- | :--- | :--- |
| fish | FK | Link to the Fish species (Table 2). |
| predicted_price | Decimal | Estimated price for the target date. |
| confidence_score | Decimal | Statistical accuracy level of the prediction (0-100%). |
| prediction_date | Date | The future date the prediction applies to. |

## 3.11 Development and Testing

The development of FishLedger utilized a modern, decoupled architectural approach to ensure system scalability and high performance in a real-time environment. The backend was engineered using **Python 3.10 and the Django REST Framework (DRF)**, providing a robust and secure foundation for data management, role-based authentication, and the execution of the Linear Regression forecasting models. This environment was chosen for its mature ecosystem and its ability to handle complex relational data with high security standards. On the frontend, the system was built using **React 18 and Node.js**, leveraging a component-based architecture to deliver a highly responsive Progressive Web Application (PWA). Communication between the two layers was facilitated through asynchronous API calls via **Axios**, ensuring that market data and vessel coordinates are updated in real-time without requiring full page reloads, which is critical for the port's operational efficiency.

To ensure the technical integrity and functional suitability of the system, a rigorous three-tier testing methodology was implemented. The process began with **Unit Testing**, where individual components, such as the price calculation logic and the forecasting model’s data preprocessing steps, were validated in isolation to eliminate logical errors at the code level. This was followed by **Integration Testing**, which focused on the seamless data exchange between the Django API and the React frontend. During this phase, the researchers verified that API endpoints correctly handled requests and that the GIS-based vessel tracking map rendered geospatial data accurately. Finally, **User Acceptance Testing (UAT)** was conducted with actual stakeholders from the Lucena Fish Port, including market administrators and retailers. This final phase ensured that the system’s features, such as the automated Daily Bulletin and the price entry interface, met the practical needs of the users and adhered to the ISO 25010 standards for usability and functional appropriateness.

## 3.12 Description of the Prototype
*(Figure 7. Prototype: Landing Page and Dashboard)*

The FishLedger prototype, as shown in Figure 7, is a high-fidelity Progressive Web Application (PWA) designed to provide a seamless user experience across mobile and desktop platforms. The interface is built using a modern "Command Center" aesthetic, prioritizing high-contrast data visualization and real-time responsiveness. Key features of the prototype include:

1.  **Unified Dashboard:** A centralized "Command Center" that utilizes dynamic charts (via Recharts) to visualize price trends, supply fluctuations, and market health at a glance.
2.  **Live Monitoring Map:** An interactive Leaflet-based geographic information system (GIS) that tracks fishing vessels in real-time, displaying their transit status and estimated arrival through intuitive map markers.
3.  **Role-Based Interface:** The UI adapts dynamically to the logged-in user; for instance, retailers are presented with a streamlined mobile interface for rapid price entry, while administrators have access to comprehensive system audits and report generation tools.
4.  **Responsive Design:** Developed with a mobile-first approach, ensuring that the PWA remains fully functional in the low-bandwidth, high-activity environment of the Lucena Fish Port.

Beyond its visual layout, the prototype integrates the system's predictive engine into a user-centric information architecture designed for high-stakes decision-making. The forecasting module is presented through specialized "Trend Boxes" that display 7-day price estimations alongside a confidence score, allowing users to anticipate market shifts with statistical backing. Furthermore, the prototype adheres to PWA standards by incorporating service workers and local caching mechanisms; this ensures that even in areas of the port with unstable internet connectivity, retailers can still access cached price data and queue their updates for synchronization once a connection is restored. The use of a high-contrast, dark-themed interface was specifically chosen to enhance readability in the varied lighting conditions of the Lucena Fish Port, ranging from early morning pre-dawn hours to direct afternoon sunlight, thereby optimizing the system’s overall operability and functional suitability for field personnel.

## 3.13 Deployment Diagram
*(Figure 8. Deployment Diagram)*
This diagram visualizes the implementation of the system, showing the interaction between the Cloud Server (hosting the Django API and Database) and the various Client Nodes (Smartphones, Tablets, and Desktops) accessing the PWA.

## 3.14 ISO 25010 Quality Standards

The FishLedger system was rigorously evaluated against the ISO 25010 Software Quality Model to ensure it meets international standards for software excellence. The evaluation focused on the following key characteristics:

1. **Functional Suitability**:
   - **Functional Completeness**: Every requirement identified during the analysis phase—including price monitoring, AI forecasting, and vessel tracking—was fully implemented and verified.
   - **Functional Appropriateness**: The system's features, such as the automated generation of the "Market Bulletin," were confirmed to be directly relevant to the operational workflows of the Lucena Fish Port.

2. **Usability**:
   - **Learnability**: The interface was designed with a minimalist aesthetic, allowing users with varying technical backgrounds to navigate the system with less than 30 minutes of training.
   - **Operability**: Evaluated through field tests, ensuring that the PWA provides intuitive feedback and error messages, particularly during rapid data entry by retailers.

3. **Performance Efficiency**:
   - **Time Behavior**: API response times for standard price lookups were maintained under 500ms, while the generation of 7-day price forecasts was optimized to complete in under 2 seconds.
   - **Resource Utilization**: The system was engineered to be lightweight, ensuring that the PWA consumes minimal device memory and battery, making it suitable for long-term field use.

4. **Compatibility**:
   - **Co-existence**: The system was tested to ensure it can operate alongside other mobile and desktop applications without resource conflicts.
   - **Interoperability**: The use of a RESTful API architecture ensures that FishLedger can seamlessly exchange data with external services, such as weather APIs and global positioning systems.

5. **Security**:
   - **Confidentiality**: Implementation of industry-standard JSON Web Tokens (JWT) and encrypted database storage ensures that sensitive user data and transaction records are protected from unauthorized access.
   - **Accountability**: The system maintains detailed audit logs of all price updates and data modifications, allowing administrators to trace any discrepancies to a specific user and timestamp.

6. **Maintainability**:
   - **Modularity**: The decoupled architecture between the Django backend and React frontend allows for independent updates to each layer without disrupting the entire system.
   - **Analyzability**: The codebase follows strict documentation and naming conventions, facilitating rapid diagnosis and resolution of technical issues during the post-deployment phase.




