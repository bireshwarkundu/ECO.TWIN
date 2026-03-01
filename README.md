# 🏙️ EcoTwin: Urban Planner

EcoTwin is a full-stack Web Application designed as a predictive Digital Twin platform for urban environments (e.g., Bidhannagar/Sector V). It focuses on tracking, predicting, and exploring environmental metrics like CO2, PM2.5, NO2, and Traffic Density.

This project strictly adheres to the **Neo-Brutalism** design philosophy, featuring stark contrasts, hard solid shadows, clashing colors, and retro-web aesthetics.

---

## ✨ Features
- **Real-Time Dashboard:** View live environmental metrics and active urban policies.
- **Historical Archive:** Explore deep data through various charts (Trends, Heatmaps, Calendars, Wind Roses) powered by Recharts and Nivo.
- **AI Models & Simulation Sandbox:** Interactive sliders to simulate policy changes (e.g., modifying traffic volume, green cover) with a simulated outcome predictor.
- **72-Hour Forecaster:** Predictive Line Chart to visualize historically tracked data versus AI-predicted futures.
- **Strict Neo-Brutalist UI:** 100% custom styling via Tailwind CSS. No rounded corners, thick `border-4 border-black` boundaries everywhere, and solid pixel-offset drop shadows.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 powered by [Vite](https://vitejs.dev/)
- **Styling:** Tailwind CSS (v4)
- **Routing:** React Router v6
- **Data Visualization:**
  - `recharts` (Line, Bar, Radar charts)
  - `@nivo/heatmap` & `@nivo/calendar` (Grid-based matrices)
- **Icons:** `lucide-react`
- **Fonts:** Space Grotesk (Headers), Roboto Mono (Data/Body)

### Backend
- **Framework:** Node.js with Express.js
- **Database:** MongoDB (using Mongoose)
- **Utilities:** `cors`, `dotenv`, `axios`

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/bireshwarkundu/ECO.TWIN.git
cd ECO.TWIN
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory with your MongoDB string:
  ```env
  PORT=5001
  MONGO_URI=your_mongodb_connection_string
  ```
- Start the backend server:
  ```bash
  node server.js
  ```
  *(Server will run on `http://localhost:5001`)*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
- Start the Vite development server:
  ```bash
  npm run dev
  ```
  *(App will run on `http://localhost:5173`)*

---

## 📁 Project Structure

```text
ECO.TWIN/
│
├── backend/                  # Node.js + Express API
│   ├── models/               # Mongoose schemas (HistoricalData.js)
│   ├── routes/               # API endpoints (api.js)
│   ├── server.js             # Express app entry point
│   └── package.json          # Backend dependencies
│
└── frontend/                 # React + Vite Application
    ├── public/               
    ├── src/                  
    │   ├── components/       # Reusable Neo-Brutalist UI (Navbar, Cards, DataTables)
    │   ├── pages/            # Main views (Homepage, Dashboard, Archive, Models)
    │   ├── App.jsx           # Main React Router setup
    │   ├── main.jsx          # React DOM renderer & Error Boundary
    │   └── index.css         # Global Tailwind directives & basic resets
    └── package.json          # Frontend dependencies
```

---

## 🎨 Design Philosophy (Neo-Brutalism)
If you wish to contribute or add new elements, please follow these strict design rules inherited by the system:
1. **No Gradients, No Soft Shadows:** Drop shadows must be solid blocks (e.g., `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`).
2. **Sharp Edges:** Use `rounded-none` universally. Never use border-radius.
3. **Thick Borders:** Every structural boundary needs `border-4 border-black`.
4. **Hover/Active States:** Interactions shouldn't use transitions (`transition-none`). Instead, mechanically shift physical positions (e.g., `hover:translate-x-1`, `active:shadow-none`).
5. **High Contrast:** Use palettes like `#FFCC00` (Yellow), `#00FF66` (Green), `#FF3366` (Pink).

---
## 🏥 Hospital Sustainability Forecaster Data & Interventions

### Where Does The Data Come From? (It is NOT Dummy Data)
The forecasting models and site data used in the Hospital Sustainability Forecaster are **not dummy values**. The engine is powered by real-world baseline data from Bidhannagar (Salt Lake City, Kolkata) combined with standard scientific health models:
- **Location Data:** The site candidates (e.g., Central Park Green Belt, Salt Lake Lake Area, HB Block Interior) use actual latitude, longitude, and established environmental profiles of those exact zones in Kolkata.
- **Traffic Data:** Traffic route indices and congestion metrics are based on realistic peak-hour patterns of 20 real Bidhannagar junctions (like Karunamayee, City Centre, and Sector V IT Hub) and actual alternate diversion routes (e.g. diverting traffic via Belghoria Expressway instead of BT Road).
- **Predictive ML Engine:** The 5-year prediction engine runs on a Python-based backend that scales pollutants (PM2.5, PM10, NO2) using mathematical models accurately mapped to **WHO (World Health Organization)** and **CPCB (Central Pollution Control Board)** index formulas. It calculates exactly how planting trees, reducing traffic, or dealing with seasonal weather shifts (Kolkata's monsoon vs. winter) practically affects the air over time.

### Layman Breakdown of "Climate Interventions"
We designed the tool with advanced scientific terms originally for an impact factor, but here is what those complex policies actually mean in simple, everyday language:

1. **Vertical Bio-Architecture** 
   *👉 Simply planting heavy greenery and trees on the building's outer walls/balconies to physically block and filter out street dust before it enters the hospital.*
2. **Zero-Emission 1km Radius** 
   *👉 Creating a 1-kilometer "clean zone" around the hospital where regular petrol/diesel vehicles are banned. Only walking, cycles, or Electric Vehicles (like EV ambulances) are permitted.*
3. **AI Priority Reroute** 
   *👉 Automatically redirecting heavy traffic jams to specific alternate routes blocks away (e.g., shifting heavy vehicles away from Karunamayee towards the Central Park Bypass) so the hospital area stays quiet, and the air stays clean.*
4. **100m Deep-Root Buffer** 
   *👉 Planting a very thick, 100-meter-wide mini-forest between the hospital and the main road. The dense trees act as a natural wall against engine noise and exhaust fumes.*
5. **Deep HEPA Isolation** 
   *👉 Upgrading to the highest-quality, perfectly sealed hospital air-conditioning systems. This guarantees that even if the city's outdoor air gets terribly polluted, patients inside breathe 100% pure air.*

---
## 📝 License
MIT License
