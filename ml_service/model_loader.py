import joblib
import os

MODEL_DIR = "ml_service/models"

pollutants = ["co","no","no2","pm25","pm10","o3","so2"]

models = {}

for p in pollutants:
    models[p] = {}
    
    components = {
        "main": f"{p}_model.pkl",
        "hourly": f"{p}_hourly_mean.pkl",
        "monthly": f"{p}_monthly_mean.pkl",
        "global": f"{p}_global_mean.pkl"
    }

    for key, filename in components.items():
        filepath = os.path.join(MODEL_DIR, filename)
        try:
            models[p][key] = joblib.load(filepath)
        except Exception as e:
            print(f"⚠️ Missing {key} model for {p} ({filename}): {e}")