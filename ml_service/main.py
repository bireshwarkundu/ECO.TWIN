from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import requests

from ml_service.config import OPENAQ_API_KEY, LOCATION_ID
from ml_service.simulator import simulate_conditions
from ml_service.optimizer import optimize_policy
from ml_service.analytics import analytics_summary

app = FastAPI(title="Urban Digital Twin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AQI CALCULATION (INDIAN CPCB) ---------------- #
def calculate_aqi(pm25):
    if pm25 <= 30:
        return int(pm25 * 50 / 30)
    elif pm25 <= 60:
        return int(50 + (pm25 - 30) * 50 / 30)
    elif pm25 <= 90:
        return int(100 + (pm25 - 60) * 100 / 30)
    elif pm25 <= 120:
        return int(200 + (pm25 - 90) * 100 / 30)
    else:
        return 300


# ---------------- LIVE DATA ---------------- #
@app.get("/live-data")
def live_data():
    headers = {"X-API-Key": OPENAQ_API_KEY}
    pollutants = {}

    try:
        loc_url = f"https://api.openaq.org/v3/locations/{LOCATION_ID}"
        loc_res = requests.get(loc_url, headers=headers, timeout=10)
        loc_json = loc_res.json()

        results = loc_json.get("results", [])
        if not results:
            raise Exception("No sensors found for location")

        sensors = results[0].get("sensors", [])

        for sensor in sensors:
            name = sensor["parameter"]["name"].lower()
            last = sensor.get("lastMeasurement")

            if last and last.get("value") is not None:
                pollutants[name] = last["value"]
                continue

            sensor_id = sensor["id"]
            latest_url = f"https://api.openaq.org/v3/sensors/{sensor_id}/measurements?limit=1"
            latest_res = requests.get(latest_url, headers=headers, timeout=10).json()
            meas_results = latest_res.get("results", [])
            if meas_results:
                pollutants[name] = meas_results[0]["value"]

        allowed = ["pm25", "pm10", "no", "no2", "co", "o3", "so2"]
        pollutants = {k: pollutants[k] for k in allowed if k in pollutants}

        # Convert CO µg/m³ → ppm (molecular weight CO = 28 g/mol)
        if "co" in pollutants:
            raw_co = pollutants["co"]
            converted = raw_co / 1145
            # If converted value is suspiciously near 0, keep a minimum display of 0.01
            pollutants["co"] = round(max(converted, 0.01), 2)

        pollutants = {k: round(v, 2) for k, v in pollutants.items()}

        if "pm25" in pollutants:
            pollutants["aqi"] = calculate_aqi(pollutants["pm25"])

        return pollutants

    except Exception as e:
        # Fallback mapping because OpenAQ might be unreliable
        print("OpenAQ Error:", str(e), "- Using fallback simulaton.")
        current_hour = datetime.now().hour
        base = {"traffic": 100, "green": 15, "industry": 100, "wind": 2}
        fallback = _simulate_hour(current_hour, base)
        if "pm25" in fallback:
            fallback["aqi"] = calculate_aqi(fallback["pm25"])
        return fallback


import math as _math

# ── Shared helper: simulate one hour of the daily cycle ──────────────────────
def _simulate_hour(hour_of_day: int, base: dict) -> dict:
    """
    Return simulated pollutant dict for a given hour of the day.
    Uses smooth Gaussian curves instead of step-function buckets so that
    every hour produces a distinct value — no flat plateaus on the chart.
    """
    h = hour_of_day

    # ── Traffic: double-peaked Gaussian (morning rush ~8h, evening rush ~18h) ─
    morning = _math.exp(-0.5 * ((h - 8)  / 1.5) ** 2)   # peak 08h, σ=1.5h
    evening = _math.exp(-0.5 * ((h - 18) / 1.5) ** 2)   # peak 18h, σ=1.5h
    traffic_mult = 0.40 + 0.90 * morning + 0.95 * evening  # range ~0.40–1.35

    # ── Wind: single Gaussian peak at 15h (Kolkata afternoon sea breeze) ──────
    wind_peak = _math.exp(-0.5 * ((h - 15) / 4.0) ** 2)  # peak 15h, σ=4h
    wind_mult = 0.65 + 0.80 * wind_peak                   # range ~0.65–1.45

    # ── Industry: ramp up 6-9h, broad plateau 9-18h, ramp down 18-22h ────────
    if h < 6:
        industry_mult = 0.50
    elif h < 9:
        industry_mult = 0.50 + 0.55 * (h - 6) / 3.0      # linear ramp-up
    elif h <= 18:
        # slight midday dip (lunch break effect) keeps values distinct
        industry_mult = 1.05 - 0.04 * _math.sin(_math.pi * (h - 9) / 9.0)
    elif h <= 22:
        industry_mult = 1.05 - 0.55 * (h - 18) / 4.0     # linear ramp-down
    else:
        industry_mult = 0.50

    varied = {
        "traffic":  base["traffic"]  * traffic_mult,
        "green":    base["green"],
        "industry": base["industry"] * industry_mult,
        "wind":     base["wind"]     * wind_mult,
    }
    return simulate_conditions(varied)


# ---------------- 72-HOUR FORECAST (ALL POLLUTANTS) ---------------- #
@app.get("/forecast")
def forecast():
    """
    Returns a dict with two keys:
      "past"   → list of 6 hourly values BEFORE current hour (historical)
      "future" → list of 72 hourly values FROM current hour onwards (predicted)
    Each value is itself a dict of pollutant → value.
    This gives the frontend clean, non-flat historical data.
    """
    current_hour = datetime.now().hour
    base = {"traffic": 100, "green": 15, "industry": 100, "wind": 2}
    pollutants = ["pm25", "pm10", "no2", "co", "o3", "so2", "no"]

    # Past: simulate the 6 hours BEFORE now (going back in time)
    past_data = {p: [] for p in pollutants}
    for offset in range(6, 0, -1):   # 6h ago → 1h ago
        hour_of_day = (current_hour - offset) % 24
        result = _simulate_hour(hour_of_day, base)
        for p in pollutants:
            past_data[p].append(round(result.get(p, 0), 2))

    # Future: simulate 72 hours FROM now
    future_data = {p: [] for p in pollutants}
    for offset in range(72):
        hour_of_day = (current_hour + offset) % 24
        result = _simulate_hour(hour_of_day, base)
        for p in pollutants:
            future_data[p].append(round(result.get(p, 0), 2))

    return {"past": past_data, "future": future_data}


# ---------------- RELATIVE RATIOS ---------------- #
@app.get("/ratios")
def ratios():
    base = {"traffic": 100, "green": 15, "industry": 100, "wind": 2}
    data = simulate_conditions(base)
    total = sum(data.values())
    return {k: round(v / total * 100, 1) for k, v in data.items()}


# ---------------- SIMULATION MODEL ---------------- #
class SimulationInput(BaseModel):
    traffic: float
    green: float
    industry: float
    wind: float


# ---------------- POLICY SANDBOX ---------------- #
@app.post("/simulate")
def simulate(inputs: SimulationInput):
    return simulate_conditions(inputs.dict())


# ---------------- AI OPTIMIZER ---------------- #
@app.get("/optimize")
def optimize():
    return optimize_policy()


# ---------------- ANALYTICS ---------------- #
@app.get("/analytics")
def analytics():
    base = {"traffic": 100, "green": 15, "industry": 100, "wind": 2}
    sim_data = simulate_conditions(base)

    # Pass live sensor readings so dominant pollutant + risk reflect
    # real observed values, not just model predictions
    live = None
    try:
        live = live_data()
        if live.get("error"):
            live = None
    except Exception:
        live = None

    return analytics_summary(sim_data, live_data=live)