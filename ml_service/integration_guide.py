# ═══════════════════════════════════════════════════════════════════
# INTEGRATION GUIDE — Digital Twin: Bidhannagar
# Two new features: Traffic Divergence + Infrastructure Planner
# ═══════════════════════════════════════════════════════════════════

# ── 1. ADD TO main.py ──────────────────────────────────────────────

# At top of main.py, add these imports:
from traffic_infrastructure_routes import (
    TrafficDiversionInput,
    InfrastructureInput,
    traffic_divergence_endpoint,
    infrastructure_suitability_endpoint,
)

# Then add these two routes to your FastAPI app:

@app.post("/traffic-divergence")
def traffic_divergence(inputs: TrafficDiversionInput):
    """
    POST body example:
    {
      "roads_closed": ["vip_road", "eastern_metro"],
      "diversion_percent": 30,
      "affected_zones": ["Sector I", "Sector II", "Sector V"],
      "baseline_traffic": 100,
      "baseline_green": 15,
      "baseline_industry": 100,
      "baseline_wind": 2
    }
    """
    return traffic_divergence_endpoint(inputs)


@app.post("/infrastructure-suitability")
def infrastructure_suitability(inputs: InfrastructureInput):
    """
    POST body example:
    {
      "lat": 22.5715,
      "lng": 88.4250,
      "infra_type": "hospital",
      "current_aqi": 75,
      "current_pm25": 45,
      "current_pm10": 78,
      "current_no2": 34,
      "current_co": 0.9,
      "current_o3": 28,
      "green_cover_radius_500m": 15,
      "distance_to_major_road_m": 200,
      "distance_to_industry_m": 1000
    }
    """
    return infrastructure_suitability_endpoint(inputs)


# ── 2. FRONTEND INTEGRATION ────────────────────────────────────────
# In your React router (App.jsx or similar), add these routes:
#
#   import TrafficDivergence       from "./components/TrafficDivergence";
#   import InfrastructurePlanner   from "./components/InfrastructurePlanner";
#
#   <Route path="/traffic"         element={<TrafficDivergence />} />
#   <Route path="/infrastructure"  element={<InfrastructurePlanner />} />
#
# Then add navigation buttons in your existing sidebar/nav:
#   🚦 Traffic Divergence   → /traffic
#   🏗 Infrastructure Plan  → /infrastructure


# ── 3. LEAFLET DEPENDENCY ─────────────────────────────────────────
# Both components use window.L (Leaflet loaded globally).
# In your index.html, ensure you have:
#
#   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
#   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
#
# OR install via npm:
#   npm install leaflet
#   import L from 'leaflet';
#   import 'leaflet/dist/leaflet.css';
#   (then change all window.L references to L)


# ── 4. RECHARTS DEPENDENCY ─────────────────────────────────────────
#   npm install recharts
# (already used in your existing frontend based on the screenshots)


# ── 5. FILE PLACEMENT ─────────────────────────────────────────────
# Backend:
#   ml_service/traffic_infrastructure_routes.py  ← the new routes file
#
# Frontend:
#   src/components/TrafficDivergence.jsx
#   src/components/InfrastructurePlanner.jsx


# ── 6. CONNECTING LIVE DATA ────────────────────────────────────────
# In traffic_divergence_endpoint(), replace the hardcoded base dict:
#   base = {"pm25": 45.0, "pm10": 78.0, ...}
# with a call to your existing live_data() function:
#   live = live_data()
#   base = {
#     "pm25": live.get("pm25", 45.0),
#     "pm10": live.get("pm10", 78.0),
#     ...
#   }
#
# Similarly in infrastructure_suitability_endpoint(), the POST body
# already accepts current_pm25, current_pm10 etc. — wire these from
# your live /live-data endpoint on the frontend before submitting.


# ── 7. OPTIONAL: AUTO-POPULATE FORM FROM LIVE DATA ────────────────
# In InfrastructurePlanner.jsx, add this useEffect to auto-fill
# the sliders from the live API:
#
#   useEffect(() => {
#     fetch(`${API}/live-data`).then(r => r.json()).then(d => {
#       if (!d.error) setFormData(prev => ({
#         ...prev,
#         current_pm25: d.pm25 || 45,
#         current_pm10: d.pm10 || 78,
#         current_no2:  d.no2  || 34,
#         current_co:   d.co   || 0.9,
#         current_o3:   d.o3   || 28,
#         current_aqi:  d.aqi  || 75,
#       }));
#     });
#   }, []);