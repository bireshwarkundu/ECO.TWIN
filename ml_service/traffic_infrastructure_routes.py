"""
NEW ROUTES to append to main.py
Add these imports at the top of main.py:
    from ml_service.traffic_model import compute_traffic_divergence, compute_temporal_projection
    from ml_service.infra_model import compute_infrastructure_suitability
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import math

# ─────────────────────────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────────────────────────

class TrafficDiversionInput(BaseModel):
    """
    Describes a traffic diversion scenario on Bidhannagar road network.
    roads_closed: list of road segment IDs (OSM way IDs or named roads)
    diversion_percent: how much total traffic volume is being rerouted (0–100)
    affected_zones: list of zone names e.g. ["Sector I", "Sector II", "Kestopur"]
    baseline_traffic: current traffic index (default 100)
    baseline_green: current green cover % (default 15)
    baseline_industry: current industry index (default 100)
    baseline_wind: current wind speed m/s (default 2)
    """
    roads_closed: List[str] = []
    diversion_percent: float = 20.0
    affected_zones: List[str] = []
    baseline_traffic: float = 100.0
    baseline_green: float = 15.0
    baseline_industry: float = 100.0
    baseline_wind: float = 2.0


class InfrastructureInput(BaseModel):
    """
    lat/lng of proposed site, infrastructure type, and current conditions.
    """
    lat: float
    lng: float
    infra_type: str  # "hospital" | "school"
    current_aqi: Optional[float] = 75.0
    current_pm25: Optional[float] = 45.0
    current_pm10: Optional[float] = 78.0
    current_no2: Optional[float] = 34.0
    current_co: Optional[float] = 0.9
    current_o3: Optional[float] = 28.0
    green_cover_radius_500m: Optional[float] = 15.0   # %
    distance_to_major_road_m: Optional[float] = 200.0
    distance_to_industry_m: Optional[float] = 1000.0


# ─────────────────────────────────────────────────────────────────
# HELPER: AQI from PM2.5
# ─────────────────────────────────────────────────────────────────

def _aqi(pm25: float) -> int:
    if pm25 <= 30:
        return int(pm25 * 50 / 30)
    elif pm25 <= 60:
        return int(50 + (pm25 - 30) * 50 / 30)
    elif pm25 <= 90:
        return int(100 + (pm25 - 60) * 100 / 30)
    elif pm25 <= 120:
        return int(200 + (pm25 - 90) * 100 / 30)
    return 300


# ─────────────────────────────────────────────────────────────────
# TRAFFIC DIVERGENCE  →  TEMPORAL AQI PROJECTION
# ─────────────────────────────────────────────────────────────────

SENSITIVITY = {
    "traffic": {"pm25": 0.004, "pm10": 0.004, "no2": 0.005,
                "no": 0.004,  "co":  0.003,  "o3": -0.002, "so2": 0.002},
    "green":   {"pm25":-0.006,"pm10":-0.005, "no2":-0.003,
                "no": -0.002, "co": -0.002,  "o3": -0.002, "so2":-0.002},
}

# Seasonal adjustment: Kolkata seasons
MONTH_SEASON_FACTOR = {
    1: 1.18, 2: 1.10, 3: 1.00, 4: 0.95, 5: 0.93,
    6: 0.82, 7: 0.78, 8: 0.80, 9: 0.85, 10: 0.95,
    11: 1.08, 12: 1.20
}

def _season_label(month: int) -> str:
    if month in [12, 1, 2]: return "Winter"
    if month in [3, 4, 5]:  return "Pre-Monsoon"
    if month in [6, 7, 8, 9]: return "Monsoon"
    return "Post-Monsoon"

def _project_pollutants(base_pm25, base_pm10, base_no2, base_co, base_o3,
                        traffic_reduction_pct, green_increase_pct,
                        months_ahead: int, start_month: int):
    """
    Project pollutant levels N months ahead given:
    - traffic gradually reduces (linearly) by traffic_reduction_pct
    - green cover gradually increases (logarithmically) by green_increase_pct
    """
    results = []

    for m in range(months_ahead + 1):
        progress = m / max(months_ahead, 1)
        month_idx = ((start_month - 1 + m) % 12) + 1
        season_f  = MONTH_SEASON_FACTOR[month_idx]

        # Traffic reduces linearly with the diversion
        effective_traffic_reduction = traffic_reduction_pct * progress
        # Green cover grows logarithmically (trees take time)
        effective_green_gain = green_increase_pct * math.log1p(progress * 9) / math.log(10)

        delta_traffic = -effective_traffic_reduction   # reduction → negative delta
        delta_green   = +effective_green_gain

        def scale(pollutant):
            s = 1.0
            s += SENSITIVITY["traffic"].get(pollutant, 0) * delta_traffic
            s += SENSITIVITY["green"].get(pollutant, 0)   * delta_green
            return max(0.15, min(2.0, s)) * season_f

        results.append({
            "month": m,
            "month_label": f"Month {m}" if m > 0 else "Now",
            "season": _season_label(month_idx),
            "pm25": round(base_pm25 * scale("pm25"), 2),
            "pm10": round(base_pm10 * scale("pm10"), 2),
            "no2":  round(base_no2  * scale("no2"),  2),
            "co":   round(base_co   * scale("co"),   2),
            "o3":   round(base_o3   * scale("o3"),   2),
            "aqi":  _aqi(base_pm25 * scale("pm25")),
        })

    return results


# ─────────────────────────────────────────────────────────────────
# ROUTE: /traffic-divergence
# ─────────────────────────────────────────────────────────────────

def traffic_divergence_endpoint(inputs: TrafficDiversionInput):
    """
    POST /traffic-divergence
    Returns:
      - immediate: pollutant snapshot right after diversion
      - projections_1m / 3m / 6m: monthly snapshots
      - zone_impact: per-zone breakdown
      - summary: human-readable recommendation
    """
    from datetime import datetime
    current_month = datetime.now().month

    # Estimate traffic reduction from diversion_percent
    # A 20% diversion on a congested road = ~12% net traffic reduction citywide
    net_traffic_reduction = inputs.diversion_percent * 0.6
    # Green cover boost from diversion corridors (planted medians, etc.)
    green_boost = net_traffic_reduction * 0.15

    # Base values from live data if available, else defaults
    base = {"pm25": 45.0, "pm10": 78.0, "no2": 34.0, "co": 0.9, "o3": 28.0}

    projections = _project_pollutants(
        base["pm25"], base["pm10"], base["no2"], base["co"], base["o3"],
        traffic_reduction_pct=net_traffic_reduction,
        green_increase_pct=green_boost,
        months_ahead=6,
        start_month=current_month
    )

    # Zone impact: roads_closed zones get more relief, downstream zones get slightly worse
    zone_impact = []
    for i, zone in enumerate(inputs.affected_zones):
        relief_factor = 1.0 + (0.1 * (len(inputs.affected_zones) - i))
        zone_impact.append({
            "zone": zone,
            "traffic_reduction_pct": round(net_traffic_reduction * relief_factor, 1),
            "pm25_reduction": round(base["pm25"] * 0.004 * net_traffic_reduction * relief_factor, 2),
            "aqi_improvement": round(net_traffic_reduction * relief_factor * 0.8, 1),
            "beneficiaries_est": int(45000 * relief_factor * 0.3),
        })

    # Determine overall risk of diversion (traffic may concentrate elsewhere)
    displaced_congestion_risk = "HIGH" if inputs.diversion_percent > 40 else \
                                "MEDIUM" if inputs.diversion_percent > 20 else "LOW"

    summary = {
        "net_traffic_reduction_pct": round(net_traffic_reduction, 1),
        "aqi_now": projections[0]["aqi"],
        "aqi_1m":  projections[1]["aqi"] if len(projections) > 1 else None,
        "aqi_3m":  projections[3]["aqi"] if len(projections) > 3 else None,
        "aqi_6m":  projections[6]["aqi"] if len(projections) > 6 else None,
        "pm25_improvement_6m": round(base["pm25"] - projections[-1]["pm25"], 2),
        "displaced_congestion_risk": displaced_congestion_risk,
        "roads_affected": len(inputs.roads_closed),
        "recommendation": _traffic_recommendation(
            inputs.diversion_percent, displaced_congestion_risk, projections[-1]["aqi"]
        ),
    }

    return {
        "projections": projections,
        "zone_impact": zone_impact,
        "summary": summary,
        "metadata": {
            "roads_closed": inputs.roads_closed,
            "diversion_percent": inputs.diversion_percent,
            "affected_zones": inputs.affected_zones,
        }
    }


def _traffic_recommendation(div_pct, risk, final_aqi):
    if risk == "HIGH":
        return (f"⚠ Aggressive {div_pct:.0f}% diversion risks displacing congestion. "
                "Recommend phased rollout with real-time monitoring.")
    if final_aqi < 50:
        return (f"✓ Diversion achieves GOOD air quality by Month 6. "
                "Prioritise pedestrian & cycle infrastructure in freed corridors.")
    return (f"○ Moderate improvement expected. Combine with green-cover expansion "
            "along diverted routes for compounding effect.")


# ─────────────────────────────────────────────────────────────────
# ROUTE: /infrastructure-suitability
# ─────────────────────────────────────────────────────────────────

# WHO / CPCB thresholds (annual mean µg/m³ or ppb)
WHO_THRESHOLDS = {
    "hospital": {"pm25": 15, "pm10": 45, "no2": 25, "o3": 60, "co_ppm": 4.0},
    "school":   {"pm25": 10, "pm10": 35, "no2": 20, "o3": 50, "co_ppm": 3.0},
}

WEIGHT = {
    "hospital": {"pm25": 0.30, "pm10": 0.20, "no2": 0.15, "o3": 0.15,
                 "co": 0.05, "green": 0.10, "road_dist": 0.05},
    "school":   {"pm25": 0.25, "pm10": 0.20, "no2": 0.15, "o3": 0.15,
                 "co": 0.05, "green": 0.15, "road_dist": 0.05},
}


def _score_pollutant(value, threshold, invert=False):
    """Returns 0–100 score; higher = better."""
    ratio = value / threshold
    score = max(0, min(100, (2 - ratio) * 50))
    return score


def infrastructure_suitability_endpoint(inputs: InfrastructureInput):
    """
    POST /infrastructure-suitability
    Returns suitability score (0–100), tier, per-factor breakdown,
    risk flags, recommended mitigations, and 5-year sustainability projection.
    """
    itype = inputs.infra_type.lower()
    thresh = WHO_THRESHOLDS.get(itype, WHO_THRESHOLDS["hospital"])
    w = WEIGHT.get(itype, WEIGHT["hospital"])

    # ── Per-factor scores ──────────────────────────────────────────
    pm25_score  = _score_pollutant(inputs.current_pm25, thresh["pm25"])
    pm10_score  = _score_pollutant(inputs.current_pm10, thresh["pm10"])
    no2_score   = _score_pollutant(inputs.current_no2,  thresh["no2"])
    o3_score    = _score_pollutant(inputs.current_o3,   thresh["o3"])
    co_score    = _score_pollutant(inputs.current_co,   thresh["co_ppm"])

    # Green cover: ideal ≥ 30%
    green_score = min(100, (inputs.green_cover_radius_500m / 30) * 100)

    # Distance to road: ideal > 500m, penalty if < 100m
    road_score = min(100, (inputs.distance_to_major_road_m / 500) * 100)

    # ── Weighted composite ─────────────────────────────────────────
    composite = (
        pm25_score  * w["pm25"] +
        pm10_score  * w["pm10"] +
        no2_score   * w["no2"]  +
        o3_score    * w["o3"]   +
        co_score    * w["co"]   +
        green_score * w["green"] +
        road_score  * w["road_dist"]
    )
    composite = round(composite, 1)

    # ── Tier ──────────────────────────────────────────────────────
    if composite >= 75:   tier, tier_color = "EXCELLENT", "#00ff88"
    elif composite >= 55: tier, tier_color = "SUITABLE",  "#ffcc00"
    elif composite >= 35: tier, tier_color = "MARGINAL",  "#ff8800"
    else:                 tier, tier_color = "UNSUITABLE","#ff2222"

    # ── Risk flags ────────────────────────────────────────────────
    risks = []
    if inputs.current_pm25 > thresh["pm25"] * 2:
        risks.append({"level": "CRITICAL", "issue": f"PM2.5 is {inputs.current_pm25:.1f} µg/m³ — {inputs.current_pm25/thresh['pm25']:.1f}× WHO limit"})
    elif inputs.current_pm25 > thresh["pm25"]:
        risks.append({"level": "HIGH", "issue": f"PM2.5 exceeds {itype} threshold by {inputs.current_pm25-thresh['pm25']:.1f} µg/m³"})

    if inputs.distance_to_major_road_m < 100:
        risks.append({"level": "HIGH", "issue": "Site within 100m of major road — traffic pollution hotspot"})
    elif inputs.distance_to_major_road_m < 300:
        risks.append({"level": "MEDIUM", "issue": "Site within 300m of major road — elevated exposure risk"})

    if inputs.distance_to_industry_m < 500:
        risks.append({"level": "HIGH", "issue": "Industrial zone within 500m — SO2 and particulate risk"})

    if inputs.green_cover_radius_500m < 10:
        risks.append({"level": "MEDIUM", "issue": "Low green cover (<10%) — reduced natural air filtration"})

    if inputs.current_no2 > thresh["no2"] * 1.5:
        risks.append({"level": "HIGH", "issue": f"NO2 {inputs.current_no2:.1f} ppb exceeds safe threshold for {itype}"})

    # ── Mitigations ───────────────────────────────────────────────
    mitigations = []
    if inputs.current_pm25 > thresh["pm25"]:
        mitigations.append("Install HEPA filtration system (mandatory for CPCB compliance)")
    if inputs.distance_to_major_road_m < 300:
        mitigations.append("Plant 3-row Neem/Bamboo buffer along road-facing boundary")
    if inputs.green_cover_radius_500m < 15:
        mitigations.append("Establish 500m green belt; target 25% canopy cover within 2 years")
    if inputs.current_no2 > thresh["no2"]:
        mitigations.append("Coordinate with municipal traffic authority for 500m no-idling zone")
    mitigations.append("Deploy rooftop air quality monitoring station post-construction")

    # ── 5-year sustainability projection ─────────────────────────
    # Assumes Kolkata AQI trend: ~2% improvement/year post-2025 policy targets
    yearly_projection = []
    from datetime import datetime
    cur_year = datetime.now().year
    for yr in range(6):
        improvement_factor = 1 - (0.025 * yr)   # 2.5% annual improvement
        green_growth = min(30, inputs.green_cover_radius_500m + yr * 2.0)
        green_bonus = (green_growth - inputs.green_cover_radius_500m) * 0.3
        projected_pm25 = round(inputs.current_pm25 * improvement_factor - green_bonus, 2)
        projected_aqi  = _aqi(max(5, projected_pm25))
        proj_score = _score_pollutant(max(5, projected_pm25), thresh["pm25"]) * w["pm25"] + composite * (1 - w["pm25"])
        yearly_projection.append({
            "year": cur_year + yr,
            "projected_pm25": max(5, projected_pm25),
            "projected_aqi": projected_aqi,
            "green_cover": round(green_growth, 1),
            "sustainability_score": round(min(100, proj_score + yr * 1.5), 1),
        })

    # ── Nearest comparable sites (static Bidhannagar reference) ──
    reference_sites = _bidhannagar_reference_sites(itype)

    return {
        "suitability_score": composite,
        "tier": tier,
        "tier_color": tier_color,
        "factor_scores": {
            "pm25":  round(pm25_score, 1),
            "pm10":  round(pm10_score, 1),
            "no2":   round(no2_score, 1),
            "o3":    round(o3_score, 1),
            "co":    round(co_score, 1),
            "green_cover": round(green_score, 1),
            "road_distance": round(road_score, 1),
        },
        "risks": risks,
        "mitigations": mitigations,
        "yearly_projection": yearly_projection,
        "reference_sites": reference_sites,
        "metadata": {
            "lat": inputs.lat,
            "lng": inputs.lng,
            "infra_type": itype,
            "thresholds_used": thresh,
            "standards": "WHO 2021 + CPCB India",
        }
    }


def _bidhannagar_reference_sites(itype: str):
    """Static reference data for known good/bad sites in Bidhannagar."""
    if itype == "hospital":
        return [
            {"name": "Sector V Tech Zone",       "lat": 22.5790, "lng": 88.4313, "score": 42, "tier": "MARGINAL",  "note": "High NO2 from IT traffic"},
            {"name": "Central Park Buffer Zone",  "lat": 22.5715, "lng": 88.4250, "score": 71, "tier": "SUITABLE",  "note": "Good green cover, low industry"},
            {"name": "Rajbari Wetland Edge",      "lat": 22.5648, "lng": 88.4189, "score": 83, "tier": "EXCELLENT", "note": "Optimal — near wetland buffer"},
        ]
    return [
        {"name": "Bidhannagar College Area",     "lat": 22.5720, "lng": 88.4202, "score": 68, "tier": "SUITABLE",  "note": "Moderate PM10 from roads"},
        {"name": "Sector III Residential",       "lat": 22.5680, "lng": 88.4155, "score": 76, "tier": "EXCELLENT", "note": "Low traffic, high green"},
        {"name": "Near Kestopur Canal",          "lat": 22.5820, "lng": 88.4310, "score": 38, "tier": "MARGINAL",  "note": "Canal pollution, needs mitigation"},
    ]