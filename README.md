# 🌱 AgriTech - Smart Farming & Agriculture Management Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-v19.x-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v8.x-purple.svg)](https://vite.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.3-brightgreen.svg)](https://www.mongodb.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

**AgriTech** is a complete, production-ready MERN-stack smart farming and precision agriculture SaaS platform built for individual project evaluation. It equips farmers, certified agronomists, and agricultural administrators with real-time crop intelligence, automated soil chemistry analysis, live meteorological spray advisories, regional pest surveillance, and a direct Mandi marketplace.

---

## 🌾 Key Platform Modules & Features

1. **🌿 Green-and-White Visual Identity & SaaS Shell**
   - Clean, modern agriculture theme utilizing custom CSS tokens (`#15803d`, `#f0fdf4`, `#22c55e`).
   - Responsive sidebar, statistical KPI metric cards, and mobile-friendly layouts.

2. **🔐 Role-Based Authentication & Security**
   - Secure authentication powered by JSON Web Tokens (JWT) and Bcrypt salted hashing.
   - Three distinct operational roles: `Farmer`, `Agricultural Expert / Agronomist`, and `System Admin`.
   - Automatic session persistence with protected routes and auto-logout upon token expiration.

3. **🗺️ Farm Land Parcel Management**
   - Register and manage agricultural land parcels with GPS coordinates, acreage, and operational status.
   - Configure soil types (*Alluvial, Loamy, Black Cotton, Clay, Silt, Peaty*) and irrigation systems (*Drip, Sprinkler, Flood, Tubewell*).
   - Real-time crop count and soil test linkages per farm.

4. **🌾 Crop Lifecycle Progression & Yield Forecasting**
   - Phenological stage tracker: *Germination → Vegetative → Flowering → Grain Filling → Maturity → Harvested*.
   - Crop health status tags (*Excellent, Good, Moderate, Needs Attention, Pest Affected*).
   - Projected harvest dates with estimated vs. actual yield metrics in Quintals, Tons, or Bags.

5. **🌦️ Live Meteorological Telemetry & Agricultural Spray Advisories**
   - Live integration with the Open-Meteo Global API (no API key required).
   - Clear distinction between live meteorological feeds and calibrated demo data.
   - Automated agronomic advisory engine:
     - **Spray Window**: Calculates foliar spray safety based on wind drift speed and precipitation risk.
     - **Irrigation Guidance**: Advises delaying irrigation if substantial rainfall is imminent.
     - **Pathogen Sporulation Risk**: Monitors fungal spore triggers based on relative humidity and temperature.
   - 7-Day agricultural weather outlook.

6. **🧪 Soil Health Intelligence & N-P-K Fertilizer Calculator**
   - Record laboratory soil test reports (Nitrogen, Phosphorus, Potassium, pH, Organic Carbon, Electrical Conductivity).
   - Automated fertilizer dose calculator: dynamically calculates recommended dosages for **Urea**, **DAP**, **Muriate of Potash (MOP)**, and **Zinc Sulphate (21%)** per acre.
   - Scientific soil remediation advice based on pH level (Lime for acidic soil, Gypsum for alkaline soil).

7. **🐛 Regional Pest & Disease Early Warning (IPM)**
   - Surveillance feed for plant pathogens (Fungal, Insect, Bacterial, Viral, Weed).
   - Severity tags (*Critical Outbreak, High, Moderate, Low*) with symptom descriptions.
   - Chemical and biological control measures verified by certified plant pathologists.
   - Outbreak reporting workflow.

8. **🛒 Agricultural Mandi & Supplies Marketplace**
   - Direct commerce for farm harvests, certified seeds, bio-fertilizers, and smart equipment.
   - Real-time stock decrement upon order confirmation.
   - Integrated shopping cart with address details and payment preferences (*Cash on Delivery, Direct UPI Demo, Kisan Credit Card*).

9. **📦 Order Ledger & Consignment Tracking**
   - Comprehensive order history with fulfillment status (*Confirmed, Dispatched, Delivered*).
   - Itemized receipts with seller contact and delivery estimates.

10. **💬 Expert Agronomist Consultations**
    - Farmers can initiate advisory tickets by crop and category.
    - Interactive threaded discussion between farmers and senior agronomists.
    - Priority classification (*Urgent / Outbreak, High Priority, Normal*).

11. **👑 Administrator Dashboard & Governance**
    - Platform-wide statistics: total users, active farms, crops cultivated, total orders, and GMV revenue volume.
    - User directory management: promote/demote user roles and manage access.
    - Real-time infrastructure telemetry (Node Express, MongoDB 8.3, Open-Meteo).

---

## 🧑‍🌾 Pre-Seeded Demo Accounts for Evaluation

The database includes realistic agricultural records and three pre-configured accounts:

| Role | Email Address | Password | Profile Description |
| :--- | :--- | :--- | :--- |
| **👨‍🌾 Farmer** | `farmer@agritech.com` | `farmer123` | Gurpreet Singh — 2 Farms (36.5 Acres), Wheat, Mustard, Paddy |
| **🔬 Agronomist** | `expert@agritech.com` | `expert123` | Dr. Anita Deshmukh — Plant Pathologist & Soil Specialist |
| **👑 Admin** | `admin@agritech.com` | `admin123` | Dev Admin — Platform Governance & System Telemetry |

> **Tip**: You can use the **1-Click Quick Demo Login buttons** on the Landing Page or Login Page to instantly test without typing.

---

## 📁 Project Architecture & Folder Structure

```
Agritech/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic via Mongoose
│   ├── controllers/
│   │   ├── adminController.js    # System stats & user management
│   │   ├── authController.js     # User registration, login & profile
│   │   ├── consultationController.js # Agronomist advisory threads
│   │   ├── cropController.js     # Crop lifecycles & yield tracking
│   │   ├── farmController.js     # Farm parcel CRUD
│   │   ├── marketController.js   # Products, cart & orders
│   │   ├── pestController.js     # Pest & disease alerts
│   │   ├── soilController.js     # NPK diagnostics & fertilizer math
│   │   └── weatherController.js  # Open-Meteo live API integration
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization
│   │   └── errorHandler.js       # Centralized error handling
│   ├── models/
│   │   ├── Consultation.js       # Advisory ticket schema
│   │   ├── Crop.js               # Crop & yield schema
│   │   ├── Farm.js               # Farm land parcel schema
│   │   ├── Order.js              # Marketplace order schema
│   │   ├── PestAlert.js          # Pest outbreak schema
│   │   ├── Product.js            # Marketplace product schema
│   │   ├── SoilTest.js           # Soil chemistry & NPK schema
│   │   └── User.js               # User accounts with bcrypt hashing
│   ├── routes/                   # Express REST route handlers
│   ├── seed/
│   │   └── seeder.js             # Realistic database seed script
│   ├── test_all_endpoints.js     # Automated API & DB verification script
│   ├── .env.example              # Environment variable template
│   ├── .env                      # Local environment configuration
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, Footer, StatCard, LoadingSpinner
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & helper methods
│   │   ├── pages/                # Landing, Login, Dashboard, Farms, Crops, Weather, Soil, etc.
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptors
│   │   ├── App.jsx               # Route definitions & protected layouts
│   │   ├── index.css             # AgriTech green-and-white design system
│   │   └── main.jsx              # React DOM mounting
│   ├── index.html                # HTML entry point with metadata
│   ├── package.json              # Frontend dependencies (React, Bootstrap, Axios)
│   └── vite.config.js            # Vite configuration with proxy to port 5000
├── package.json                  # Root orchestration scripts
└── README.md                     # Comprehensive documentation
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Step 1: Clone or Navigate to the Project
```bash
cd Agritech
```

### Step 2: Install Dependencies
Run the installation command from the project root:
```bash
npm run install:all
```
*(Or install manually in both folders: `cd backend && npm install`, then `cd ../frontend && npm install`)*

### Step 3: Configure Environment Variables
A default `.env` file is already created in `backend/.env`. You can customize it as needed:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/agritech
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
OPEN_METEO_API_URL=https://api.open-meteo.com/v1/forecast
```

### Step 4: Seed the Database
Populate the database with realistic demo data (users, farms, crops, soil tests, pest alerts, products):
```bash
npm run seed
```

### Step 5: Start the Application

**Option A: Start both services concurrently**
```bash
npm run server   # Starts backend on http://localhost:5000
npm run client   # Starts frontend on http://localhost:5173
```

**Option B: Separate terminals**
1. **Backend**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Automated Testing & Verification

To verify that all 12 backend REST APIs, authentication tokens, and MongoDB collections are working properly, run:
```bash
cd backend
node test_all_endpoints.js
```

---

## 📡 REST API Reference

| Module | Method | Endpoint | Access | Description |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user (farmer/expert/admin) |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| **Auth** | `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |
| **Auth** | `PUT` | `/api/auth/profile` | Private | Update profile details / password |
| **Farms** | `GET` | `/api/farms` | Private | List user's farms with crop stats |
| **Farms** | `POST` | `/api/farms` | Private | Register a new farm land parcel |
| **Farms** | `PUT` | `/api/farms/:id` | Private | Update farm acreage, soil, or irrigation |
| **Farms** | `DELETE` | `/api/farms/:id` | Private | Remove farm and associated crops |
| **Crops** | `GET` | `/api/crops` | Private | List cultivated crops with filter options |
| **Crops** | `POST` | `/api/crops` | Private | Record newly planted crop variety |
| **Crops** | `PUT` | `/api/crops/:id` | Private | Update crop stage, health, or yield |
| **Crops** | `DELETE` | `/api/crops/:id` | Private | Delete crop record |
| **Soil** | `GET` | `/api/soil` | Private | Retrieve soil test history |
| **Soil** | `POST` | `/api/soil` | Private | Enter lab test & calculate NPK dosage |
| **Soil** | `DELETE` | `/api/soil/:id` | Private | Remove soil test record |
| **Weather** | `GET` | `/api/weather` | Public | Live Open-Meteo forecast & spray advice |
| **Pests** | `GET` | `/api/pests` | Public | Regional pest & disease warnings |
| **Pests** | `POST` | `/api/pests` | Private | Report pest outbreak in agro-region |
| **Market** | `GET` | `/api/market/products` | Public | Search & browse agricultural marketplace |
| **Market** | `POST` | `/api/market/products` | Private | List produce or equipment for sale |
| **Market** | `POST` | `/api/market/orders` | Private | Place order with cart items & address |
| **Market** | `GET` | `/api/market/orders` | Private | Retrieve user's order history |
| **Advisory** | `GET` | `/api/consultations` | Private | List agronomist consultation threads |
| **Advisory** | `POST` | `/api/consultations` | Private | Submit advisory question to experts |
| **Advisory** | `POST` | `/api/consultations/:id/reply` | Private | Threaded reply between farmer & expert |
| **Admin** | `GET` | `/api/admin/stats` | Admin | Platform overview metrics & GMV |
| **Admin** | `GET` | `/api/admin/users` | Admin | Complete platform user directory |
| **Admin** | `PUT` | `/api/admin/users/:id/role` | Admin | Change user role permissions |
| **Admin** | `DELETE`| `/api/admin/users/:id` | Admin | Delete user account |

---

## 🚀 Production Deployment Guidance

### 1. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and allowlist your deployment IP (or `0.0.0.0/0`).
3. Set `MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/agritech?retryWrites=true&w=majority` in production environment variables.

### 2. Backend Deployment (Render / Railway / Heroku)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `MONGO_URI=<your_atlas_uri>`
  - `JWT_SECRET=<strong_secret_key>`
  - `CLIENT_URL=https://your-frontend-domain.vercel.app`

### 3. Frontend Deployment (Vercel / Netlify)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Configure rewrite in `vercel.json` for single-page app routing:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 🛡️ License & Academic Integrity

This project is submitted for individual academic and technical project assessment. Developed using the MERN stack with modern responsive design principles.
