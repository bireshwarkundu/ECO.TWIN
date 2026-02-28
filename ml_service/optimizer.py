from ml_service.simulator import simulate_conditions


def _calc_aqi(pm25: float) -> float:
    """CPCB AQI from PM2.5 µg/m³."""
    if pm25 <= 30:   return pm25 * 50 / 30
    if pm25 <= 60:   return 50  + (pm25 - 30) * 50  / 30
    if pm25 <= 90:   return 100 + (pm25 - 60) * 100 / 30
    if pm25 <= 120:  return 200 + (pm25 - 90) * 100 / 30
    return 300


def optimize_policy():
    """
    Grid-search over meaningful policy scenarios and return the one that
    minimises a weighted health-impact score.

    Scoring (lower = better):
        2.0 × PM2.5  +  1.5 × PM10  +  1.0 × NO2  +  0.8 × SO2  +  0.5 × CO
    """

    # ── Scenario grid: 12 distinct policy configurations ──────────────────────
    scenarios = [
        # label                              traffic  green  industry  wind
        ("Light traffic restriction",          80,    15,     100,    2),
        ("Green cover expansion",             100,    30,     100,    2),
        ("Industrial output reduction",       100,    15,      70,    2),
        ("Moderate combined intervention",     75,    25,      80,    3),
        ("Aggressive traffic + green",         50,    40,      90,    3),
        ("Max industry + traffic cut",         60,    30,      60,    4),
        ("High wind dispersion scenario",      85,    20,      90,    8),
        ("Overnight industry shutdown",        90,    15,      40,    2),
        ("Full urban greening programme",      70,    50,      80,    3),
        ("Peak-hour traffic ban",              45,    20,      95,    2),
        ("Balanced multi-factor reduction",    65,    35,      70,    5),
        ("Maximum intervention",               50,    45,      60,    6),
    ]

    # ── Simulate baseline ─────────────────────────────────────────────────────
    baseline_inputs = {"traffic": 100, "green": 15, "industry": 100, "wind": 2}
    baseline = simulate_conditions(baseline_inputs)
    baseline_aqi = _calc_aqi(baseline["pm25"])

    def health_score(r):
        return (r["pm25"] * 2.0 + r["pm10"] * 1.5 +
                r["no2"]  * 1.0 + r["so2"]  * 0.8 + r["co"] * 0.5)

    baseline_hscore = health_score(baseline)

    # ── Find best scenario ────────────────────────────────────────────────────
    best_scenario = None
    best_result   = None
    best_hscore   = baseline_hscore  # only report something better than doing nothing

    for label, t, g, i, w in scenarios:
        inputs = {"traffic": t, "green": g, "industry": i, "wind": w}
        res = simulate_conditions(inputs)
        hs  = health_score(res)
        if hs < best_hscore:
            best_hscore   = hs
            best_scenario = {"label": label, "traffic": t, "green": g,
                             "industry": i, "wind": w}
            best_result   = res

    # Fallback if nothing beats baseline (shouldn't happen)
    if best_scenario is None:
        best_scenario = {"label": "No improvement found",
                         "traffic": 100, "green": 15, "industry": 100, "wind": 2}
        best_result   = baseline

    # ── Compute real AQI improvement ─────────────────────────────────────────
    best_aqi = _calc_aqi(best_result["pm25"])
    expected_aqi_drop = round(max(0.0, baseline_aqi - best_aqi), 1)

    # ── Policy description strings (human-readable) ───────────────────────────
    s = best_scenario
    policy_lines = []
    if s["traffic"] < 100:
        policy_lines.append(f"Reduce Traffic to {s['traffic']}%")
    if s["green"] > 15:
        policy_lines.append(f"Expand Green Cover to {s['green']}%")
    if s["industry"] < 100:
        policy_lines.append(f"Reduce Industry to {s['industry']}%")
    if s["wind"] > 2:
        policy_lines.append(f"Target Wind Speed: {s['wind']} m/s")

    return {
        "label":              s["label"],
        "policy":             {k: v for k, v in s.items() if k != "label"},
        "policy_lines":       policy_lines,
        "expected_aqi_drop":  expected_aqi_drop,
        "baseline_aqi":       round(baseline_aqi, 1),
        "optimised_aqi":      round(best_aqi, 1),
    }