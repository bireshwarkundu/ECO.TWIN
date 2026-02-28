from datetime import datetime
from ml_service.model_loader import models
import numpy as np

# Baseline sensor-range features (what the model was trained on)
# These are realistic sensor readings at "normal" conditions
BASELINE_FEATURES = [45.0, 15.0, 100.0, 2.0]  # [pm25_approx, green, industry, wind]

def predict_pollutant(pollutant, features=None):
    """
    Predict a pollutant value using the ML model.
    features: optional list [traffic, green, industry, wind] — used if model accepts them.
    Falls back gracefully to global mean if model fails.
    """
    try:
        m = models[pollutant]

        # Try predicting with provided features
        input_features = features if features is not None else BASELINE_FEATURES
        base = m["main"].predict([input_features])[0]

        hour = datetime.now().hour
        month = datetime.now().month

        hourly_adj = m["hourly"][hour]
        monthly_adj = m["monthly"][month - 1]

        result = base + hourly_adj + monthly_adj
        # Clamp to physically plausible minimum
        return round(max(0.01, result), 2)

    except Exception:
        # Fallback to global mean
        try:
            return round(float(models[pollutant]["global"]), 2)
        except Exception:
            # Hard fallback defaults if everything fails
            defaults = {
                "pm25": 45.0,
                "pm10": 80.0,
                "no2":  34.0,
                "no":   12.0,
                "co":   1.2,
                "o3":   45.0,
                "so2":  8.0,
            }
            return defaults.get(pollutant, 10.0)