from ml_service.predictor import predict_pollutant

# ── Baseline policy inputs (the "neutral" reference point) ──────────────────
BASELINE = {
    "traffic":  100,
    "green":     15,
    "industry": 100,
    "wind":       2,
}

# ── Sensitivity table ────────────────────────────────────────────────────────
# Each value = fractional change in pollutant per 1-unit delta from baseline.
#
# Design constraints:
#   Worst case combined reduction (traffic -50, industry -50, wind +8, green +35):
#     pm25: -50×0.004 + (-50×0.005) + (+8×-0.025) + (+35×-0.006)
#         = -0.20    - 0.25        - 0.20         - 0.21
#         = -0.86  → scale = 0.14  (stays above 0.15 floor ✓)
#   Worst case combined increase (traffic +50, industry +50, wind -2, green -15):
#     pm25: +50×0.004 + (+50×0.005) + (-2×-0.025) + (-15×-0.006)
#         = +0.20    + 0.25         + 0.05         + 0.09
#         = +0.59  → scale = 1.59  (stays below 2.0 cap ✓)
# ─────────────────────────────────────────────────────────────────────────────
SENSITIVITY = {
    "traffic": {
        "pm25": +0.004,
        "pm10": +0.004,
        "no2":  +0.005,
        "no":   +0.004,
        "co":   +0.003,
        "o3":   -0.002,
        "so2":  +0.002,
    },
    "green": {
        "pm25": -0.006,
        "pm10": -0.005,
        "no2":  -0.003,
        "no":   -0.002,
        "co":   -0.002,
        "o3":   -0.002,
        "so2":  -0.002,
    },
    "industry": {
        "pm25": +0.005,
        "pm10": +0.005,
        "no2":  +0.004,
        "no":   +0.003,
        "co":   +0.004,
        "o3":   +0.001,
        "so2":  +0.008,   # SO2 most sensitive to industry
    },
    "wind": {
        "pm25": -0.025,   # wind disperses pollutants
        "pm10": -0.028,
        "no2":  -0.022,
        "no":   -0.022,
        "co":   -0.018,
        "o3":   -0.012,
        "so2":  -0.022,
    },
}


def simulate_conditions(inputs):
    """
    Simulate air-quality conditions for given policy inputs.

    Strategy:
      1. Get ML-predicted baseline values at BASELINE conditions.
      2. Compute a physics-based scale factor from input deltas vs baseline.
      3. Clamp scale to [0.15, 2.0] — realistic improvement cap of ~85%,
         max worsening of 2× baseline.
    """
    traffic  = float(inputs["traffic"])
    green    = float(inputs["green"])
    industry = float(inputs["industry"])
    wind     = float(inputs["wind"])

    baseline_features = [
        BASELINE["traffic"],
        BASELINE["green"],
        BASELINE["industry"],
        BASELINE["wind"],
    ]

    delta_traffic  = traffic  - BASELINE["traffic"]
    delta_green    = green    - BASELINE["green"]
    delta_industry = industry - BASELINE["industry"]
    delta_wind     = wind     - BASELINE["wind"]

    result = {}

    for p in ["pm25", "pm10", "no2", "co", "o3", "so2", "no"]:
        base_val = predict_pollutant(p, baseline_features)

        scale = 1.0
        scale += SENSITIVITY["traffic"][p]   * delta_traffic
        scale += SENSITIVITY["green"][p]     * delta_green
        scale += SENSITIVITY["industry"][p]  * delta_industry
        scale += SENSITIVITY["wind"][p]      * delta_wind

        # Clamp: best case = 15% of baseline, worst case = 200% of baseline
        scale = max(0.15, min(2.0, scale))

        result[p] = round(base_val * scale, 2)

    return result