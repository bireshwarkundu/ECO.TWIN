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
## 📝 License
MIT License
