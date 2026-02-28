// src/utils/fetchEnvironmentalData.js
export const getFullEnvironmentalData = async (lat, lon) => {
  try {
    console.log("Fetching environmental data for:", lat, lon);
    
    // 1. DEFINE ENDPOINTS
    // API A: Air Quality (Pollutants)
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,nitrogen_monoxide&timezone=auto`;

    // API B: Weather (Temp & Humidity)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`;

    // 2. FETCH BOTH IN PARALLEL (Fast!)
    const [airRes, weatherRes] = await Promise.all([
      fetch(airUrl),
      fetch(weatherUrl)
    ]);

    if (!airRes.ok || !weatherRes.ok) {
      throw new Error(`API responded with status: ${airRes.status}, ${weatherRes.status}`);
    }

    const airData = await airRes.json();
    const weatherData = await weatherRes.json();

    if (!airData.current || !weatherData.current) {
      throw new Error("Incomplete data received from APIs");
    }

    const a = airData.current;
    const w = weatherData.current;

    // 3. CONVERT UNITS (µg/m³ -> ppb/ppm)
    // These are standard conversion factors at 25°C and 1 atm pressure
    const co_ppm = (a.carbon_monoxide / 1150).toFixed(2);       // µg/m³ -> ppm
    const no2_ppb = (a.nitrogen_dioxide / 1.88).toFixed(1);     // µg/m³ -> ppb
    const so2_ppb = (a.sulphur_dioxide / 2.62).toFixed(1);      // µg/m³ -> ppb
    const o3_ppb = (a.ozone / 2.0).toFixed(1);                  // µg/m³ -> ppb
    const no_ppb = (a.nitrogen_monoxide / 1.25).toFixed(1);     // µg/m³ -> ppb (Approx)
    
    // NOx is usually sum of NO and NO2 in ppb
    const nox_ppb = (parseFloat(no_ppb) + parseFloat(no2_ppb)).toFixed(1);

    console.log("Successfully fetched environmental data");

    // 4. RETURN YOUR EXACT FORMAT
    return {
      pm25: a.pm2_5 || 0,              // µg/m³
      pm10: a.pm10 || 0,               // µg/m³
      no2: no2_ppb || "0",               // ppb
      no: no_ppb || "0",                 // ppb
      nox: nox_ppb || "0",               // ppb
      co: co_ppm || "0",                 // ppm
      so2: so2_ppb || "0",               // ppb
      o3: o3_ppb || "0",                 // ppb
      temperature: w.temperature_2m || 0,       // °C
      relativehumidity: w.relative_humidity_2m || 0, // %
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("Data Fetch Error:", error);
    return null;
  }
};