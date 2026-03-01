from datetime import datetime


# ── Peak-hour lookup: for each pollutant, which hour-of-day is worst? ────────
# Based on Bidhannagar / Kolkata air quality patterns:
#   Traffic pollutants (PM2.5, PM10, NO2, NO, CO) peak during evening rush (18–20h)
#   Industrial pollutants (SO2) peak mid-morning when factories ramp up (10–12h)
#   O3 is photochemical — peaks mid-afternoon (14–16h)
PEAK_HOURS = {
    "pm25": 19, "pm10": 19, "no2": 18, "no": 18,
    "co":   18, "so2":  11, "o3":  15,
}


def _season_from_month(month: int) -> str:
    """Return a descriptive seasonal air-quality phase for Kolkata."""
    if month in (11, 12, 1):
        return "ENTERING WINTER SMOG PHASE"
    elif month in (2, 3):
        return "LATE WINTER — IMPROVING"
    elif month in (4, 5):
        return "PRE-MONSOON DUST SEASON"
    elif month in (6, 7, 8, 9):
        return "MONSOON — AIR QUALITY GOOD"
    else:
        return "POST-MONSOON TRANSITION"


def _risk_from_pm25(pm25: float) -> str:
    """CPCB risk tiers based on PM2.5 µg/m³."""
    if pm25 > 90:  return "SEVERE"
    if pm25 > 60:  return "HIGH"
    if pm25 > 30:  return "MODERATE"
    return "LOW"


def analytics_summary(data: dict, live_data: dict = None) -> dict:
    """
    Generate analytics summary.

    Parameters
    ----------
    data      : simulated pollutant dict (baseline conditions)
    live_data : optional live sensor reading dict — used to override dominant
                pollutant and risk level with real observed values when available.
    """
    now = datetime.now()

    # ── Use live sensor values when available for dominant + risk ────────────
    source = {}
    if live_data and not live_data.get("error"):
        # Merge: live sensor values take priority over simulated ones
        for k in ["pm25", "pm10", "no2", "no", "co", "o3", "so2"]:
            val = live_data.get(k) or data.get(k)
            if isinstance(val, (int, float)):
                source[k] = val
    else:
        source = {k: v for k, v in data.items() if isinstance(v, (int, float))}

    if not source:
        # Absolute fallback — should never happen with working backend
        source = data

    # ── Dominant pollutant: highest concentration relative to safe threshold ─
    # WHO / CPCB 24h safe limits (µg/m³ or ppb):
    SAFE = {"pm25": 15, "pm10": 45, "no2": 40, "no": 25,
            "co": 0.5, "o3": 50, "so2": 20}
    # Compute exceedance ratio for each pollutant
    ratios = {}
    for k, v in source.items():
        if k in SAFE and SAFE[k] > 0:
            ratios[k] = v / SAFE[k]
    dominant = max(ratios, key=ratios.get) if ratios else max(source, key=source.get)

    # ── Risk level from the highest PM2.5 available ───────────────────────────
    pm25_val = source.get("pm25", data.get("pm25", 0))
    risk = _risk_from_pm25(pm25_val)

    # ── Peak hour: dynamically computed from the 72-hour forecast cycle ───────
    # Simulate a full 24-hour cycle and find the hour with highest PM2.5
    from ml_service.simulator import simulate_conditions
    base = {"traffic": 100, "green": 15, "industry": 100, "wind": 2}

    peak_hour = PEAK_HOURS.get(dominant, 19)   # fallback to known table

    # Compute peak hour accurately using the same smooth curves as main.py
    try:
        import math as _m
        worst_val = -1
        for h in range(24):
            # Smooth Gaussian traffic (mirrors _simulate_hour in main.py)
            t_m = 0.40 + 0.90 * _m.exp(-0.5*((h-8)/1.5)**2) + 0.95 * _m.exp(-0.5*((h-18)/1.5)**2)
            w_m = 0.65 + 0.80 * _m.exp(-0.5*((h-15)/4.0)**2)
            if h < 6:   i_m = 0.50
            elif h < 9: i_m = 0.50 + 0.55*(h-6)/3.0
            elif h <= 18: i_m = 1.05 - 0.04*_m.sin(_m.pi*(h-9)/9.0)
            elif h <= 22: i_m = 1.05 - 0.55*(h-18)/4.0
            else:       i_m = 0.50

            varied = {"traffic": base["traffic"] * t_m, "green": base["green"],
                      "industry": base["industry"] * i_m, "wind": base["wind"] * w_m}
            res = simulate_conditions(varied)
            poll_val = res.get(dominant, res.get("pm25", 0))
            if poll_val > worst_val:
                worst_val = poll_val
                peak_hour = h
    except Exception:
        pass  # stick with table fallback

    peak_time_str = f"{peak_hour:02d}:00"

    # ── Seasonal phase from actual calendar month ─────────────────────────────
    season = _season_from_month(now.month)

    return {
        "dominant_pollutant": dominant.upper(),
        "risk_level": risk,
        "peak_time": peak_time_str,
        "season": season,
    }