import joblib
import os

MODEL_DIR = "ml_service/models"

pollutants = ["co","no","no2","pm25","pm10","o3","so2"]

models = {}

for p in pollutants:
    try:
        models[p] = {
            "main": joblib.load(f"{MODEL_DIR}/{p}_model.pkl"),
            "hourly": joblib.load(f"{MODEL_DIR}/{p}_hourly_mean.pkl"),
            "monthly": joblib.load(f"{MODEL_DIR}/{p}_monthly_mean.pkl"),
            "global": joblib.load(f"{MODEL_DIR}/{p}_global_mean.pkl"),
        }
    except:
        print(f"⚠️ Missing model for {p}")