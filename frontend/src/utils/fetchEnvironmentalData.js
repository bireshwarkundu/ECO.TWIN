// src/utils/fetchEnvironmentalData.js

export const getCalibratedAirData = async (lat, lon) => {
  try {
    console.log(`📡 Connecting to Local Node: http://localhost:3000...`);

    // 1. Call Your Backend Controller
    // We pass the dynamic lat/lon from the dashboard to your API
    const url = `http://localhost:3000/api/user/air-quality?lat=${lat}&lon=${lon}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.status}`);
    }

    const data = await response.json();

    // 2. Safety Check & Formatting
    // Ensure 'nox' exists for the UI (Calculate if missing)
    if (!data.nox) {
        const noVal = parseFloat(data.no) || 0;
        const no2Val = parseFloat(data.no2) || 0;
        data.nox = (noVal + no2Val).toFixed(1);
    }

    console.log("✅ Data received from Local Node:", data);
    return data;

  } catch (error) {
    console.error("❌ Node Connection Failed:", error);
    return null; // Returns null so the Dashboard knows to show "Retry"
  }
};