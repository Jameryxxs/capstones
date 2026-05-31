# Chapter III: Methodology

This chapter presents the research design, software development lifecycle, and the technical specifications of the FishLodger system.

## Research Design
The researchers utilized a descriptive and developmental research design. It is descriptive as it aims to document the current fish price trends and developmental as it involves the creation of a Progressive Web Application (PWA) for the Lucena Fish Port Complex.

## Software Development Lifecycle (SDLC)
The **Agile Methodology** was adopted for this study. This iterative approach allowed the proponents to build, test, and refine features like the AI forecasting and PDF generation based on continuous feedback.

### 1. Requirements Analysis
Gathering specific data needs from the Lucena Fish Port Complex, including fish varieties, price fluctuations, and retailer information.

### 2. Design
Creating the UI/UX wireframes, database schema, and system architecture (Context Diagrams, DFD, and ERD).

### 3. Development
Coding the backend using Django and the frontend using React. Integrating the Linear Regression model for price prediction.

### 4. Testing
Conducting unit testing and system integration testing to ensure the accuracy of the forecasting engine and the reliability of the PWA.

### 5. Deployment
Deploying the system as a PWA to ensure accessibility across mobile and desktop devices.

---

## Functional Requirements
1. **User Authentication:** Secure login and registration for Admins, Retailers, and Staff using JWT.
2. **Fish Price Monitoring:** Real-time tracking of fish prices per kilo across different retailers.
3. **AI Price Forecasting:** 7-day price prediction using Linear Regression analytics.
4. **Supply Management:** Tracking fish delivery sources, fishing locations, and boat arrivals.
5. **PDF Bulletin Generation:** Automated generation of Daily Market Bulletins using ReportLab.
6. **Data Visualization:** Interactive charts and maps for monitoring market trends.

## Non-Functional Requirements
1. **Security:** Implementation of JWT for API security and role-based access control (RBAC).
2. **Usability:** A mobile-first, responsive PWA interface for ease of use by fish port personnel.
3. **Performance:** The forecasting engine must process predictions in under 2 seconds.
4. **Portability:** The system must run on any modern web browser and be installable on Android/iOS.

---

## Data Dictionary

### Table 1: User Table
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | Integer (PK) | Unique identifier for the user. |
| username | String | Login name. |
| role | String | User role: Admin, Retailer, or Staff. |
| phone_number| String | Contact information. |
| created_at | DateTime | Account creation timestamp. |

### Table 2: Fish Table
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | Integer (PK) | Unique identifier for the fish species. |
| fish_name | String | Common name of the fish. |
| category | String | Freshwater or Saltwater. |
| average_price| Decimal | Baseline price. |
| status | String | Availability status (e.g., Available). |

### Table 3: FishPrice Table (Monitoring)
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| id | Integer (PK) | Unique identifier for the price record. |
| fish_id | Integer (FK) | Reference to the Fish table. |
| retailer_id | Integer (FK) | Reference to the Retailer table. |
| price_per_kilo| Decimal | Current market price. |
| market_date | Date | Date of the recorded price. |

*(Note: More tables like Retailer, SupplySource, and Prediction follow a similar structure based on the database schema.)*
