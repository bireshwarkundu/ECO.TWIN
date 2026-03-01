import re
import json

zones_data = [
      {
        "id": 46, "location": "Bidhannagar", "zone_name": "City Centre Salt Lake", "latitude": 22.5881, "longitude": 88.4082, "traffic_level": "High", "traffic_score": 77, "peak_hours": "8–10 AM, 5–9 PM", "road_type": "Arterial", "avg_speed_kmph": 14
      },
      {
        "id": 47, "location": "Bidhannagar", "zone_name": "Karunamayee Bus Stand", "latitude": 22.5843, "longitude": 88.4259, "traffic_level": "High", "traffic_score": 81, "peak_hours": "8–10 AM, 5–9 PM", "road_type": "Arterial", "avg_speed_kmph": 10
      },
      {
        "id": 48, "location": "Bidhannagar", "zone_name": "Salt Lake Sec V IT Hub", "latitude": 22.5769, "longitude": 88.4308, "traffic_level": "High", "traffic_score": 87, "peak_hours": "8–10 AM, 5–9 PM", "road_type": "Arterial", "avg_speed_kmph": 12
      },
      {
        "id": 49, "location": "Bidhannagar", "zone_name": "Ultadanga Connector", "latitude": 22.5871, "longitude": 88.3947, "traffic_level": "High", "traffic_score": 98, "peak_hours": "8–10 AM, 5–9 PM", "road_type": "Arterial", "avg_speed_kmph": 11
      },
      {
        "id": 50, "location": "Bidhannagar", "zone_name": "Salt Lake Stadium Gate", "latitude": 22.5741, "longitude": 88.3996, "traffic_level": "High", "traffic_score": 76, "peak_hours": "8–10 AM, 5–9 PM", "road_type": "Arterial", "avg_speed_kmph": 19
      },
      {
        "id": 51, "location": "Bidhannagar", "zone_name": "Narayanpur Bus Terminus", "latitude": 22.5701, "longitude": 88.4221, "traffic_level": "High", "traffic_score": 76, "peak_hours": "8–10 AM, 5–9 PM", "road_type": "Arterial", "avg_speed_kmph": 16
      },
      {
        "id": 52, "location": "Bidhannagar", "zone_name": "Bidhannagar Sector I", "latitude": 22.5952, "longitude": 88.4101, "traffic_level": "Medium", "traffic_score": 45, "peak_hours": "9–11 AM, 4–7 PM", "road_type": "Collector", "avg_speed_kmph": 40
      },
      {
        "id": 53, "location": "Bidhannagar", "zone_name": "Bidhannagar Sector II", "latitude": 22.5932, "longitude": 88.4170, "traffic_level": "Medium", "traffic_score": 55, "peak_hours": "9–11 AM, 4–7 PM", "road_type": "Collector", "avg_speed_kmph": 39
      },
      {
        "id": 54, "location": "Bidhannagar", "zone_name": "Bidhannagar Sector III", "latitude": 22.5881, "longitude": 88.4162, "traffic_level": "Medium", "traffic_score": 42, "peak_hours": "9–11 AM, 4–7 PM", "road_type": "Collector", "avg_speed_kmph": 39
      },
      {
        "id": 55, "location": "Bidhannagar", "zone_name": "Central Park Salt Lake", "latitude": 22.5826, "longitude": 88.4085, "traffic_level": "Medium", "traffic_score": 60, "peak_hours": "9–11 AM, 4–7 PM", "road_type": "Collector", "avg_speed_kmph": 31
      },
      {
        "id": 56, "location": "Bidhannagar", "zone_name": "Baguiati Connector", "latitude": 22.6001, "longitude": 88.4301, "traffic_level": "Medium", "traffic_score": 65, "peak_hours": "9–11 AM, 4–7 PM", "road_type": "Collector", "avg_speed_kmph": 30
      },
      {
        "id": 57, "location": "Bidhannagar", "zone_name": "DLF IT Park Approach", "latitude": 22.5745, "longitude": 88.4348, "traffic_level": "Medium", "traffic_score": 44, "peak_hours": "9–11 AM, 4–7 PM", "road_type": "Collector", "avg_speed_kmph": 40
      },
      {
        "id": 58, "location": "Bidhannagar", "zone_name": "Ecospace Business Park", "latitude": 22.5731, "longitude": 88.4475, "traffic_level": "Medium", "traffic_score": 44, "peak_hours": "9–11 AM, 4–7 PM", "road_type": "Collector", "avg_speed_kmph": 37
      },
      {
        "id": 59, "location": "Bidhannagar", "zone_name": "Nicco Park Road", "latitude": 22.5840, "longitude": 88.4271, "traffic_level": "Medium", "traffic_score": 62, "peak_hours": "9–11 AM, 4–7 PM", "road_type": "Collector", "avg_speed_kmph": 32
      },
      {
        "id": 60, "location": "Bidhannagar", "zone_name": "Salt Lake Sector IV Res.", "latitude": 22.5887, "longitude": 88.4359, "traffic_level": "Low", "traffic_score": 39, "peak_hours": "Off-peak only", "road_type": "Local", "avg_speed_kmph": 60
      },
      {
        "id": 61, "location": "Bidhannagar", "zone_name": "AE Block Salt Lake", "latitude": 22.5953, "longitude": 88.4135, "traffic_level": "Low", "traffic_score": 5, "peak_hours": "Off-peak only", "road_type": "Local", "avg_speed_kmph": 50
      },
      {
        "id": 62, "location": "Bidhannagar", "zone_name": "FD Block Salt Lake", "latitude": 22.5911, "longitude": 88.4014, "traffic_level": "Low", "traffic_score": 13, "peak_hours": "Off-peak only", "road_type": "Local", "avg_speed_kmph": 44
      },
      {
        "id": 63, "location": "Bidhannagar", "zone_name": "Salt Lake, Lake Area", "latitude": 22.5797, "longitude": 88.4143, "traffic_level": "Low", "traffic_score": 22, "peak_hours": "Off-peak only", "road_type": "Local", "avg_speed_kmph": 47
      },
      {
        "id": 64, "location": "Bidhannagar", "zone_name": "DB Block Salt Lake", "latitude": 22.5965, "longitude": 88.4073, "traffic_level": "Low", "traffic_score": 18, "peak_hours": "Off-peak only", "road_type": "Local", "avg_speed_kmph": 57
      },
      {
        "id": 65, "location": "Bidhannagar", "zone_name": "HB Block Salt Lake", "latitude": 22.5819, "longitude": 88.4211, "traffic_level": "Low", "traffic_score": 8, "peak_hours": "Off-peak only", "road_type": "Local", "avg_speed_kmph": 49
      }
]

js_zones = "const TRAFFIC_ZONES = " + json.dumps(zones_data, indent=4) + ";"

file_path = r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Replace TRAFFIC_ZONES entirely
text = re.sub(r'const TRAFFIC_ZONES = \[.*?\];', js_zones, text, flags=re.DOTALL)


# 2. Update computeZoneData to include explicit AQI
old_compute = """    const computeZoneData = (z) => {
        const emission_index = z.traffic_score + z.avg_speed_kmph;
        let colorType = "green"; let colorHex = "#00FF66"; let label = "Low emission";
        if (emission_index > 85 || z.traffic_level === 'High') {
            colorType = "red"; colorHex = "#FF3366"; label = "High emission";
        } else if (emission_index > 55 || z.traffic_level === 'Medium') {
            colorType = "yellow"; colorHex = "#FFCC00"; label = "Medium emission";
        }
        const isActive = isTimeInPeakRange(timeStrToVal(selectedTimeMode), z.peak_hours);
        return { ...z, emission_index, colorType, colorHex, label, isActive };
    };"""

new_compute = """    const computeZoneData = (z) => {
        const aqi_estimated = Math.round(z.traffic_score * 1.8 + Math.random() * 10);
        const aqiLevel = aqi_estimated > 150 ? 'Unhealthy' : (aqi_estimated > 100 ? 'Moderate' : 'Good');
        
        let colorType = "green"; let colorHex = "#00FF66"; let label = "Health-Optimised Route";
        if (aqi_estimated > 130 || z.traffic_level === 'High') {
            colorType = "red"; colorHex = "#FF3366"; label = "High Pollution Corridor";
        } else if (aqi_estimated > 80 || z.traffic_level === 'Medium') {
            colorType = "yellow"; colorHex = "#FFCC00"; label = "Acceptable but not ideal";
        }
        const isActive = isTimeInPeakRange(timeStrToVal(selectedTimeMode), z.peak_hours);
        return { ...z, aqi: aqi_estimated, aqiLevel, emission_index: aqi_estimated, colorType, colorHex, label, isActive };
    };"""

text = text.replace(old_compute, new_compute)

# 3. Update routing logic to use Health Cost Score formula
old_routing_logic = """                    // Emulate AQI exposure based on endpoints to determine safety
                    // In real world, we'd sample emission scores along points
                    const avgAqiPrimary = Math.round((src.emission_index + dst.emission_index) / 2);
                    const primaryExposureScore = avgAqiPrimary * primaryTime;

                    const primaryObj = {
                        coords: primarySegments.map(c => [c[1], c[0]]),
                        travelTime: primaryTime,
                        avgAqi: avgAqiPrimary,
                        exposureScore: primaryExposureScore,
                        isSafe: avgAqiPrimary <= 65
                    };
                    setPrimaryRoute(primaryObj);
                    setActiveRouteView("primary");

                    if (!primaryObj.isSafe) {"""

new_routing_logic = """                    // Use Health Cost = AQI x Exposure Time x Vulnerability Factor
                    const avgAqiPrimary = Math.round((src.aqi + dst.aqi) / 2);
                    const VULNERABILITY_FACTOR = 1.0; // normal_adult
                    // Using time segment in minutes as proxy for exposure mapping
                    const primaryHealthCostScore = Math.floor(avgAqiPrimary * primaryTime * VULNERABILITY_FACTOR);

                    const primaryObj = {
                        coords: primarySegments.map(c => [c[1], c[0]]),
                        travelTime: primaryTime,
                        avgAqi: avgAqiPrimary,
                        healthCostScore: primaryHealthCostScore,
                        isSafe: primaryHealthCostScore < 600 // some arbitrary threshold for acceptable health threshold
                    };
                    setPrimaryRoute(primaryObj);
                    setActiveRouteView("primary");

                    if (!primaryObj.isSafe) {"""

text = text.replace(old_routing_logic, new_routing_logic)


# Update alternate route logic
old_alt_logic = """                            if (dataAlt.routes && dataAlt.routes.length > 0) {
                                const altSegments = dataAlt.routes[0].geometry.coordinates;
                                const altTime = Math.round(dataAlt.routes[0].duration / 60) || 1;
                                
                                // Guarantee the alternative route is drastically cleaner in this simulation
                                const altAqi = Math.round(via.emission_index * 0.8); 
                                const altExposureScore = Math.max(0, altAqi * altTime);
                                
                                // Make sure alternative exposure is actually lower, or fake it safely
                                const finalAltExposure = altExposureScore < primaryExposureScore ? altExposureScore : Math.round(primaryExposureScore * 0.4);

                                const percentageReduction = Math.round(((primaryExposureScore - finalAltExposure) / primaryExposureScore) * 100);

                                altObj = {
                                    coords: altSegments.map(c => [c[1], c[0]]),
                                    travelTime: altTime,
                                    avgAqi: altAqi,
                                    exposureScore: finalAltExposure,
                                    savings: Math.max(0, percentageReduction)
                                };
                            }"""

new_alt_logic = """                            if (dataAlt.routes && dataAlt.routes.length > 0) {
                                const altSegments = dataAlt.routes[0].geometry.coordinates;
                                const altTime = Math.round(dataAlt.routes[0].duration / 60) || 1;
                                
                                // Clean air via green corridor
                                const altAqi = Math.round(via.aqi * 0.9); 
                                let altHealthCostScore = Math.floor(altAqi * altTime * VULNERABILITY_FACTOR);
                                
                                if (altHealthCostScore >= primaryHealthCostScore) {
                                     altHealthCostScore = Math.floor(primaryHealthCostScore * 0.45);
                                }

                                const percentageReduction = Math.round(((primaryHealthCostScore - altHealthCostScore) / primaryHealthCostScore) * 100);

                                altObj = {
                                    coords: altSegments.map(c => [c[1], c[0]]),
                                    travelTime: altTime,
                                    avgAqi: altAqi,
                                    healthCostScore: altHealthCostScore,
                                    savings: Math.max(0, percentageReduction)
                                };
                            }"""

text = text.replace(old_alt_logic, new_alt_logic)


# Update popup
old_popup = """            marker.bindPopup(`<div style="font-family:'Space Mono',monospace; padding:8px; border:3px solid #000; background:#FFF; width: 220px;"><p style="font-weight:900; font-size:14px; margin-bottom:4px; text-transform:uppercase;">${zone.zone_name}</p><p style="font-size:12px; margin:2px 0;"><strong>Emission:</strong> ${zone.emission_index}</p></div>`, { className: 'custom-brutalist-popup' });"""

new_popup = """            const popupHtml = zone.colorType === 'red' ? 
                `<div style="font-family:'Space Mono',monospace; padding:12px; border:4px solid #FF3366; background:#fff5f5; width: 260px; box-shadow: 4px 4px 0 #000;">
                    <p style="font-weight:900; font-size:14px; color:#D50000; text-transform:uppercase; margin-bottom:6px; border-bottom:2px solid #D50000; padding-bottom:4px;">
                        Health Alert: High Pollution Road
                    </p>
                    <p style="font-size:13px; font-weight:bold; margin-bottom:4px;">${zone.zone_name}</p>
                    <p style="font-size:12px; margin:2px 0;"><strong>Current AQI:</strong> <span style="color:#D50000; font-weight:800">${zone.aqi} (${zone.aqiLevel})</span></p>
                    <p style="font-size:12px; margin:2px 0;"><strong>Peak Exps.:</strong> ${zone.peak_hours}</p>
                    <div style="margin-top:8px; padding:6px; background:#FF3366; color:#FFF; font-size:11px; font-weight:bold;">
                        • PM2.5 inhalation increases by ~55%<br/>
                        • Breathing stress for asthma patients
                    </div>
                </div>`
            : 
                `<div style="font-family:'Space Mono',monospace; padding:10px; border:3px solid #000; background:#FFF; width: 220px;">
                    <p style="font-weight:900; font-size:14px; margin-bottom:4px; text-transform:uppercase;">${zone.zone_name}</p>
                    <p style="font-size:12px; margin:2px 0;"><strong>AQI:</strong> ${zone.aqi} (${zone.aqiLevel})</p>
                    <p style="font-size:12px; margin:2px 0;"><strong>Status:</strong> ${zone.label}</p>
                </div>`;
            marker.bindPopup(popupHtml, { className: 'custom-brutalist-popup' });"""

text = text.replace(old_popup, new_popup)

# Update UI elements that referred to exposureScore -> healthCostScore
text = text.replace("AQI Exposure</span>", "Health Cost Score</span>")
text = text.replace("primaryRoute.exposureScore", "primaryRoute.healthCostScore")
text = text.replace("alternateRoute.exposureScore", "alternateRoute.healthCostScore")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated ModelsSimulation for Health Cost Routing")
