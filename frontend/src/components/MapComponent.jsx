import { useState, useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  CircleMarker,
  LayerGroup,
  GeoJSON
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Fix for default markers - using CDN URLs instead of require
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

fixLeafletIcons();

const stations = [
  {
    id: 'bidhanagar-east',
    name: 'Bidhannagar East',
    position: [22.58157, 88.410025],
    color: '#FF3366'
  },
  {
    id: 'Rabindra_Bharatia',
    name: 'Rabindra Bharati University',
    position: [22.627875, 88.3804],
    color: '#7B61FF'
  },
  {
    id: 'Ballygunge',
    name: 'Ballygunge',
    position: [22.5367507, 88.3638022],
    color: '#00FF66'
  },
  {
    id: 'Dasnagar',
    name: 'Dasnagar',
    position: [22.6025571, 88.3105664],
    color: '#FF8C42'
  }
];

const calculateBounds = () => {
  const lats = stations.map(s => s.position[0]);
  const lngs = stations.map(s => s.position[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;

  return {
    southWest: [minLat - latPadding, minLng - lngPadding],
    northEast: [maxLat + latPadding, maxLng + lngPadding]
  };
};

const bounds = calculateBounds();
const southWest = bounds.southWest;
const northEast = bounds.northEast;

const rows = 50;
const cols = 50;

const latStep = (northEast[0] - southWest[0]) / rows;
const lngStep = (northEast[1] - southWest[1]) / cols;

const trafficHotspots = [
  { pos: [22.575, 88.43], name: "City Center", intensity: "high" },
  { pos: [22.59, 88.41], name: "Sector V Junction", intensity: "very high" },
  { pos: [22.565, 88.39], name: "Salt Lake Stadium", intensity: "medium" },
  { pos: [22.585, 88.45], name: "Nicco Park", intensity: "low" },
];

const schools = [
  { pos: [22.578, 88.425], name: "Delhi Public School", students: 1200 },
  { pos: [22.588, 88.415], name: "St. Xavier's School", students: 800 },
  { pos: [22.572, 88.405], name: "Salt Lake School", students: 600 },
];

const hospitals = [
  { pos: [22.58, 88.42], name: "AMRI Hospital", beds: 500 },
  { pos: [22.577, 88.435], name: "Apollo Clinic", beds: 200 },
];

const pollutants = [
  { id: 'pm25', name: 'PM2.5', unit: 'µg/m³', baseColor: '#FF3366' },
  { id: 'pm10', name: 'PM10', unit: 'µg/m³', baseColor: '#FF8C42' },
  { id: 'no2', name: 'NO2', unit: 'ppb', baseColor: '#7B61FF' },
  { id: 'co', name: 'CO', unit: 'ppm', baseColor: '#FFD700' },
  { id: 'so2', name: 'SO2', unit: 'ppb', baseColor: '#00CFFF' },
  { id: 'o3', name: 'O3', unit: 'ppb', baseColor: '#FF69B4' },
  { id: 'no', name: 'NO', unit: 'ppb', baseColor: '#9370DB' },
  { id: 'nox', name: 'NOx', unit: 'ppb', baseColor: '#20B2AA' },
  { id: 'temperature', name: 'Temperature', unit: '°C', baseColor: '#00FF66' },
  { id: 'humidity', name: 'Humidity', unit: '%', baseColor: '#4169E1' },
  { id: 'wind_speed', name: 'Wind Speed', unit: 'm/s', baseColor: '#7B61FF' },
  { id: 'wind_direction', name: 'Wind Direction', unit: '°', baseColor: '#7B61FF' }
];

const getDistance = (lat1, lng1, lat2, lng2) => {
  return Math.sqrt(
    Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)
  );
};

// ---------------------------
// ✅ FIXED: Color thresholds now match the legend labels exactly
// ---------------------------
const getColor = (value, pollutant = 'pm25') => {
  const scales = {
    pm25: [
      // Legend: Hazardous (250+), Very Unhealthy (150-250), Unhealthy (100-150),
      //         Unhealthy Sens. (50-100), Moderate (12-50), Good (0-12)
      { threshold: 250, color: "#4B0082" }, // Hazardous       → 250+
      { threshold: 150, color: "#8B0000" }, // Very Unhealthy  → 150-250
      { threshold: 100, color: "#FF0000" }, // Unhealthy       → 100-150
      { threshold: 50,  color: "#FFA500" }, // Unhealthy Sens. → 50-100  ← 53 now correctly falls HERE (orange)
      { threshold: 12,  color: "#FFFF00" }, // Moderate        → 12-50
      { threshold: 0,   color: "#00FF66" }  // Good            → 0-12
    ],
    pm10: [
      // Legend: Hazardous (350+), Very Unhealthy (250-350), Unhealthy (150-250),
      //         Unhealthy Sens. (100-150), Moderate (50-100), Good (0-50)
      { threshold: 350, color: "#4B0082" }, // Hazardous       → 350+
      { threshold: 250, color: "#8B0000" }, // Very Unhealthy  → 250-350
      { threshold: 150, color: "#FF0000" }, // Unhealthy       → 150-250
      { threshold: 100, color: "#FFA500" }, // Unhealthy Sens. → 100-150
      { threshold: 50,  color: "#FFFF00" }, // Moderate        → 50-100
      { threshold: 0,   color: "#00FF66" }  // Good            → 0-50
    ],
    no2: [
      // WHO guideline: Good <25, Moderate 25-50, Unhealthy Sens. 50-100,
      //                Unhealthy 100-200, Very Unhealthy 200-400, Hazardous 400+
      { threshold: 400, color: "#4B0082" }, // Hazardous       → 400+
      { threshold: 200, color: "#8B0000" }, // Very Unhealthy  → 200-400
      { threshold: 100, color: "#FF0000" }, // Unhealthy       → 100-200
      { threshold: 50,  color: "#FFA500" }, // Unhealthy Sens. → 50-100
      { threshold: 25,  color: "#FFFF00" }, // Moderate        → 25-50
      { threshold: 0,   color: "#90EE90" }  // Good            → 0-25
    ],
    co: [
      // Standard CO breakpoints (ppm)
      { threshold: 30,  color: "#4B0082" }, // Hazardous       → 30+
      { threshold: 15,  color: "#8B0000" }, // Very Unhealthy  → 15-30
      { threshold: 10,  color: "#FF0000" }, // Unhealthy       → 10-15
      { threshold: 5,   color: "#FFA500" }, // Unhealthy Sens. → 5-10
      { threshold: 2,   color: "#FFFF00" }, // Moderate        → 2-5
      { threshold: 0,   color: "#90EE90" }  // Good            → 0-2
    ],
    so2: [
      // SO2 breakpoints (ppb)
      { threshold: 300, color: "#4B0082" }, // Hazardous       → 300+
      { threshold: 200, color: "#8B0000" }, // Very Unhealthy  → 200-300
      { threshold: 100, color: "#FF0000" }, // Unhealthy       → 100-200
      { threshold: 40,  color: "#FFA500" }, // Unhealthy Sens. → 40-100
      { threshold: 15,  color: "#FFFF00" }, // Moderate        → 15-40
      { threshold: 0,   color: "#ADD8E6" }  // Good            → 0-15
    ],
    o3: [
      // O3 breakpoints (ppb)
      { threshold: 200, color: "#4B0082" }, // Hazardous       → 200+
      { threshold: 150, color: "#8B0000" }, // Very Unhealthy  → 150-200
      { threshold: 100, color: "#FF0000" }, // Unhealthy       → 100-150
      { threshold: 60,  color: "#FFA500" }, // Unhealthy Sens. → 60-100
      { threshold: 30,  color: "#FFFF00" }, // Moderate        → 30-60
      { threshold: 0,   color: "#ADD8E6" }  // Good            → 0-30
    ],
    no: [
      // NO breakpoints (ppb)
      { threshold: 200, color: "#4B0082" }, // Hazardous       → 200+
      { threshold: 100, color: "#8B0000" }, // Very Unhealthy  → 100-200
      { threshold: 60,  color: "#FF0000" }, // Unhealthy       → 60-100
      { threshold: 30,  color: "#FFA500" }, // Unhealthy Sens. → 30-60
      { threshold: 10,  color: "#FFFF00" }, // Moderate        → 10-30
      { threshold: 0,   color: "#DDA0DD" }  // Good            → 0-10
    ],
    nox: [
      // NOx breakpoints (ppb)
      { threshold: 250, color: "#4B0082" }, // Hazardous       → 250+
      { threshold: 150, color: "#8B0000" }, // Very Unhealthy  → 150-250
      { threshold: 80,  color: "#FF0000" }, // Unhealthy       → 80-150
      { threshold: 40,  color: "#FFA500" }, // Unhealthy Sens. → 40-80
      { threshold: 15,  color: "#FFFF00" }, // Moderate        → 15-40
      { threshold: 0,   color: "#C0C0C0" }  // Good            → 0-15
    ],
    temperature: [
      { threshold: 45, color: "#8B0000" },  // Extreme Heat    → 45+
      { threshold: 40, color: "#FF0000" },  // Very Hot        → 40-45
      { threshold: 35, color: "#FFA500" },  // Hot             → 35-40
      { threshold: 30, color: "#FFFF00" },  // Warm            → 30-35
      { threshold: 20, color: "#00FF66" },  // Pleasant        → 20-30
      { threshold: 10, color: "#4169E1" },  // Cool            → 10-20
      { threshold: 0,  color: "#00008B" }   // Cold            → 0-10
    ],
    humidity: [
      { threshold: 90, color: "#00008B" },  // Very Humid      → 90+
      { threshold: 80, color: "#4169E1" },  // Humid           → 80-90
      { threshold: 70, color: "#87CEEB" },  // Moderate Humid  → 70-80
      { threshold: 50, color: "#ADD8E6" },  // Comfortable     → 50-70
      { threshold: 30, color: "#F0F8FF" },  // Dry             → 30-50
      { threshold: 0,  color: "#FFFFFF" }   // Very Dry        → 0-30
    ],
    wind_speed: [
      { threshold: 15, color: "#4B0082" },  // Storm           → 15+
      { threshold: 10, color: "#FF0000" },  // Strong          → 10-15
      { threshold: 7,  color: "#FFA500" },  // Moderate-High   → 7-10
      { threshold: 4,  color: "#FFFF00" },  // Moderate        → 4-7
      { threshold: 1,  color: "#00FF66" },  // Light           → 1-4
      { threshold: 0,  color: "#ADD8E6" }   // Calm            → 0-1
    ],
    wind_direction: [
      // Wind direction (0-360°) — use hue cycling, no AQI meaning
      { threshold: 315, color: "#4B0082" }, // NW
      { threshold: 270, color: "#7B61FF" }, // W
      { threshold: 225, color: "#00CFFF" }, // SW
      { threshold: 180, color: "#00FF66" }, // S
      { threshold: 135, color: "#FFFF00" }, // SE
      { threshold: 90,  color: "#FFA500" }, // E
      { threshold: 45,  color: "#FF0000" }, // NE
      { threshold: 0,   color: "#FF3366" }  // N
    ]
  };

  const scale = scales[pollutant] || scales.pm25;
  for (let level of scale) {
    if (value > level.threshold) return level.color;
  }
  return scale[scale.length - 1].color;
};

// ---------------------------
// IDW Interpolation (unchanged)
// ---------------------------
const idwInterpolate = (lat, lng, stationData, pollutant, power = 2) => {
  let weightedSum = 0;
  let weightSum = 0;
  let validStations = 0;

  stations.forEach(station => {
    const stationInfo = stationData?.stations?.[station.id];
    if (!stationInfo || stationInfo[pollutant] === null || stationInfo[pollutant] === undefined) return;

    const distance = getDistance(lat, lng, station.position[0], station.position[1]);
    validStations++;

    if (distance < 0.0001) {
      return stationInfo[pollutant];
    }

    const weight = 1 / Math.pow(distance, power);
    weightedSum += stationInfo[pollutant] * weight;
    weightSum += weight;
  });

  if (validStations === 0) return null;

  if (validStations === 1) {
    const singleStation = stations.find(s =>
      stationData?.stations?.[s.id]?.[pollutant] !== null &&
      stationData?.stations?.[s.id]?.[pollutant] !== undefined
    );
    return stationData?.stations?.[singleStation?.id]?.[pollutant] || null;
  }

  return weightSum > 0 ? weightedSum / weightSum : null;
};

const generateGrid = (pollutant, stationData) => {
  const cells = [];

  const hasValidData = stationData?.stations &&
    Object.values(stationData.stations).some(s => s && s[pollutant] !== null && s[pollutant] !== undefined);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const lat1 = southWest[0] + i * latStep;
      const lat2 = lat1 + latStep;
      const lng1 = southWest[1] + j * lngStep;
      const lng2 = lng1 + lngStep;

      const centerLat = (lat1 + lat2) / 2;
      const centerLng = (lng1 + lng2) / 2;

      let pollutionValue;

      if (hasValidData) {
        pollutionValue = idwInterpolate(centerLat, centerLng, stationData, pollutant, 2);
      } else {
        const baseValue = 50;
        const distanceToCenter = getDistance(centerLat, centerLng, 22.5828, 88.4172);
        const maxDistance = getDistance(southWest[0], southWest[1], northEast[0], northEast[1]);
        const normalizedDistance = distanceToCenter / maxDistance;
        const distanceFactor = Math.exp(-2 * Math.pow(normalizedDistance, 2)) * 1.2 + 0.3;
        const randomFactor = 0.9 + Math.random() * 0.2;
        pollutionValue = baseValue * distanceFactor * randomFactor;
      }

      if (pollutionValue !== null) {
        cells.push({
          positions: [
            [lat1, lng1],
            [lat1, lng2],
            [lat2, lng2],
            [lat2, lng1],
          ],
          value: Math.max(0, pollutionValue),
          center: [centerLat, centerLng]
        });
      }
    }
  }

  return cells;
};

const generateContours = (grid, levels = [50, 100, 150, 200, 250, 300]) => {
  return levels.map(level => ({
    level,
    bounds: [southWest, northEast]
  }));
};

const createSchoolIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background: white; border: 2px solid black; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px;">🏫</div>',
    iconSize: [24, 24],
    popupAnchor: [0, -12]
  });
};

const createHospitalIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background: white; border: 2px solid black; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px;">🏥</div>',
    iconSize: [24, 24],
    popupAnchor: [0, -12]
  });
};

const createStationIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background: ${color}; border: 3px solid black; border-radius: 50%; width: 16px; height: 16px; box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);"></div>`,
    iconSize: [16, 16],
    popupAnchor: [0, -8]
  });
};

// ---------------------------
// ✅ FIXED: Legend items now match getColor thresholds exactly
// ---------------------------
const getLegendItems = (selectedPollutant) => {
  const legends = {
    pm25: [
      { color: "#4B0082", label: "Hazardous (250+)" },
      { color: "#8B0000", label: "Very Unhealthy (150–250)" },
      { color: "#FF0000", label: "Unhealthy (100–150)" },
      { color: "#FFA500", label: "Unhealthy Sens. (50–100)" },
      { color: "#FFFF00", label: "Moderate (12–50)" },
      { color: "#00FF66", label: "Good (0–12)" }
    ],
    pm10: [
      { color: "#4B0082", label: "Hazardous (350+)" },
      { color: "#8B0000", label: "Very Unhealthy (250–350)" },
      { color: "#FF0000", label: "Unhealthy (150–250)" },
      { color: "#FFA500", label: "Unhealthy Sens. (100–150)" },
      { color: "#FFFF00", label: "Moderate (50–100)" },
      { color: "#00FF66", label: "Good (0–50)" }
    ],
    no2: [
      { color: "#4B0082", label: "Hazardous (400+)" },
      { color: "#8B0000", label: "Very Unhealthy (200–400)" },
      { color: "#FF0000", label: "Unhealthy (100–200)" },
      { color: "#FFA500", label: "Unhealthy Sens. (50–100)" },
      { color: "#FFFF00", label: "Moderate (25–50)" },
      { color: "#90EE90", label: "Good (0–25)" }
    ],
    co: [
      { color: "#4B0082", label: "Hazardous (30+ ppm)" },
      { color: "#8B0000", label: "Very Unhealthy (15–30)" },
      { color: "#FF0000", label: "Unhealthy (10–15)" },
      { color: "#FFA500", label: "Unhealthy Sens. (5–10)" },
      { color: "#FFFF00", label: "Moderate (2–5)" },
      { color: "#90EE90", label: "Good (0–2)" }
    ],
    so2: [
      { color: "#4B0082", label: "Hazardous (300+)" },
      { color: "#8B0000", label: "Very Unhealthy (200–300)" },
      { color: "#FF0000", label: "Unhealthy (100–200)" },
      { color: "#FFA500", label: "Unhealthy Sens. (40–100)" },
      { color: "#FFFF00", label: "Moderate (15–40)" },
      { color: "#ADD8E6", label: "Good (0–15)" }
    ],
    o3: [
      { color: "#4B0082", label: "Hazardous (200+)" },
      { color: "#8B0000", label: "Very Unhealthy (150–200)" },
      { color: "#FF0000", label: "Unhealthy (100–150)" },
      { color: "#FFA500", label: "Unhealthy Sens. (60–100)" },
      { color: "#FFFF00", label: "Moderate (30–60)" },
      { color: "#ADD8E6", label: "Good (0–30)" }
    ],
    no: [
      { color: "#4B0082", label: "Hazardous (200+)" },
      { color: "#8B0000", label: "Very Unhealthy (100–200)" },
      { color: "#FF0000", label: "Unhealthy (60–100)" },
      { color: "#FFA500", label: "Unhealthy Sens. (30–60)" },
      { color: "#FFFF00", label: "Moderate (10–30)" },
      { color: "#DDA0DD", label: "Good (0–10)" }
    ],
    nox: [
      { color: "#4B0082", label: "Hazardous (250+)" },
      { color: "#8B0000", label: "Very Unhealthy (150–250)" },
      { color: "#FF0000", label: "Unhealthy (80–150)" },
      { color: "#FFA500", label: "Unhealthy Sens. (40–80)" },
      { color: "#FFFF00", label: "Moderate (15–40)" },
      { color: "#C0C0C0", label: "Good (0–15)" }
    ],
    temperature: [
      { color: "#8B0000", label: "Extreme Heat (45°C+)" },
      { color: "#FF0000", label: "Very Hot (40–45°C)" },
      { color: "#FFA500", label: "Hot (35–40°C)" },
      { color: "#FFFF00", label: "Warm (30–35°C)" },
      { color: "#00FF66", label: "Pleasant (20–30°C)" },
      { color: "#4169E1", label: "Cool (10–20°C)" },
      { color: "#00008B", label: "Cold (0–10°C)" }
    ],
    humidity: [
      { color: "#00008B", label: "Very Humid (90%+)" },
      { color: "#4169E1", label: "Humid (80–90%)" },
      { color: "#87CEEB", label: "Moderate Humid (70–80%)" },
      { color: "#ADD8E6", label: "Comfortable (50–70%)" },
      { color: "#F0F8FF", label: "Dry (30–50%)" },
      { color: "#FFFFFF", label: "Very Dry (0–30%)" }
    ],
    wind_speed: [
      { color: "#4B0082", label: "Storm (15+ m/s)" },
      { color: "#FF0000", label: "Strong (10–15 m/s)" },
      { color: "#FFA500", label: "Moderate-High (7–10)" },
      { color: "#FFFF00", label: "Moderate (4–7)" },
      { color: "#00FF66", label: "Light (1–4)" },
      { color: "#ADD8E6", label: "Calm (0–1)" }
    ],
    wind_direction: [
      { color: "#FF3366", label: "N (0–45°)" },
      { color: "#FF0000", label: "NE (45–90°)" },
      { color: "#FFA500", label: "E (90–135°)" },
      { color: "#FFFF00", label: "SE (135–180°)" },
      { color: "#00FF66", label: "S (180–225°)" },
      { color: "#00CFFF", label: "SW (225–270°)" },
      { color: "#7B61FF", label: "W (270–315°)" },
      { color: "#4B0082", label: "NW (315–360°)" }
    ]
  };

  return legends[selectedPollutant] || legends.pm25;
};

// ---------------------------
// Main Component
// ---------------------------
function MapComponent({ liveData }) {
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');
  const [showTraffic, setShowTraffic] = useState(true);
  const [showSensitive, setShowSensitive] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [showContours, setShowContours] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  const grid = useMemo(() =>
    generateGrid(selectedPollutant, liveData),
    [selectedPollutant, liveData]
  );

  console.log('Station Data:', liveData);
  console.log('Grid Stats:', {
    pollutant: selectedPollutant,
    cells: grid.length,
    min: grid.length > 0 ? Math.min(...grid.map(c => c.value)).toFixed(2) : 'N/A',
    max: grid.length > 0 ? Math.max(...grid.map(c => c.value)).toFixed(2) : 'N/A',
    avg: grid.length > 0 ? (grid.reduce((a, c) => a + c.value, 0) / grid.length).toFixed(2) : 'N/A'
  });

  const avgPollution = useMemo(() => {
    if (!grid.length) return "0";
    const values = grid.map(cell => cell.value);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  }, [grid]);

  const maxPollution = useMemo(() => {
    if (!grid.length) return "0";
    return Math.max(...grid.map(cell => cell.value)).toFixed(1);
  }, [grid]);

  const minPollution = useMemo(() => {
    if (!grid.length) return "0";
    return Math.min(...grid.map(cell => cell.value)).toFixed(1);
  }, [grid]);

  const currentPollutant = pollutants.find(p => p.id === selectedPollutant) || pollutants[0];

  const avgWindSpeed = useMemo(() => {
    if (!liveData?.stations) return 1.06;
    const speeds = Object.values(liveData.stations)
      .map(s => s?.wind_speed)
      .filter(v => v !== null && v !== undefined);
    if (speeds.length === 0) return 1.06;
    return speeds.reduce((a, b) => a + b, 0) / speeds.length;
  }, [liveData]);

  const avgWindDirection = useMemo(() => {
    if (!liveData?.stations) return 249.36;
    const directions = Object.values(liveData.stations)
      .map(s => s?.wind_direction)
      .filter(v => v !== null && v !== undefined);
    if (directions.length === 0) return 249.36;
    return directions.reduce((a, b) => a + b, 0) / directions.length;
  }, [liveData]);

  const currentWind = {
    speed: avgWindSpeed,
    direction: avgWindDirection
  };

  const createWindArrow = () => {
    const arrowLength = 0.02;
    const startLat = 22.5828;
    const startLng = 88.4172;
    const rad = (currentWind.direction * Math.PI) / 180;
    const endLat = startLat + arrowLength * Math.cos(rad);
    const endLng = startLng + arrowLength * Math.sin(rad);

    const headLength = 0.007;
    const angle = Math.atan2(endLng - startLng, endLat - startLat);
    const headLat1 = endLat - headLength * Math.cos(angle - 0.5);
    const headLng1 = endLng - headLength * Math.sin(angle - 0.5);
    const headLat2 = endLat - headLength * Math.cos(angle + 0.5);
    const headLng2 = endLng - headLength * Math.sin(angle + 0.5);

    return {
      shaft: [[startLat, startLng], [endLat, endLng]],
      head: [[endLat, endLng], [headLat1, headLng1], [headLat2, headLng2]]
    };
  };

  const windArrow = createWindArrow();

  const mapCenter = [
    (southWest[0] + northEast[0]) / 2,
    (southWest[1] + northEast[1]) / 2
  ];

  // ✅ Use the unified getLegendItems function
  const legendItems = getLegendItems(selectedPollutant);

  return (
    <div className="flex flex-col lg:flex-row w-full bg-[#FDFBF7] font-mono border-t-0" style={{ minHeight: "700px" }}>

      {/* Control Panel - Left Sidebar */}
      <div className="w-full lg:w-[320px] bg-white border-b-4 lg:border-b-0 lg:border-r-4 border-black p-4 flex flex-col shrink-0 overflow-y-auto z-10">
        <h4 className="font-black text-lg border-b-4 border-black pb-2 mb-4">
          MAP CONTROLS {liveData?.success ? '✅ LIVE' : '⏳ SIM'}
        </h4>

        {/* Pollutant Selector */}
        <div className="mb-4">
          <label className="font-bold">Pollutant</label>
          <select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            className="w-full p-2 mt-1 border-2 border-black font-mono font-bold bg-[#FDFBF7] cursor-pointer"
          >
            {pollutants.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Layer Toggles */}
        <div className="mb-4">
          <label className="font-bold">Layers</label>
          <div className="mt-1 flex flex-col gap-2">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} className="mr-2 border-2 border-black w-4 h-4 cursor-pointer" />
              Heatmap Grid (IDW)
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={showTraffic} onChange={(e) => setShowTraffic(e.target.checked)} className="mr-2 border-2 border-black w-4 h-4 cursor-pointer" />
              Traffic Hotspots
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={showSensitive} onChange={(e) => setShowSensitive(e.target.checked)} className="mr-2 border-2 border-black w-4 h-4 cursor-pointer" />
              Schools & Hospitals
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={showWind} onChange={(e) => setShowWind(e.target.checked)} className="mr-2 border-2 border-black w-4 h-4 cursor-pointer" />
              Wind Direction
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={showContours} onChange={(e) => setShowContours(e.target.checked)} className="mr-2 border-2 border-black w-4 h-4 cursor-pointer" />
              Pollution Contours
            </label>
          </div>
        </div>

        {/* Station Statistics */}
        <div className="border-t-2 border-black pt-3 text-sm flex flex-col gap-2 flex-grow">
          <div className="font-bold">Station Readings:</div>
          {stations.map(station => {
            const stationData = liveData?.stations?.[station.id];
            const value = stationData?.[selectedPollutant];
            return (
              <div key={station.id} className="flex justify-between items-center bg-[#FDFBF7] p-1 border-b border-gray-200">
                <span className="truncate" style={{ color: station.color }}>● {station.name}:</span>
                <strong className="ml-2 whitespace-nowrap">{value?.toFixed(2) || 'N/A'} {currentPollutant.unit}</strong>
              </div>
            );
          })}

          <div className="mt-2 pt-2 border-t-2 border-black">
            <div className="flex justify-between">
              <span>Map Avg:</span>
              <strong>{avgPollution} {currentPollutant.unit}</strong>
            </div>
            <div className="flex justify-between">
              <span>Map Range:</span>
              <strong>{minPollution} - {maxPollution} {currentPollutant.unit}</strong>
            </div>
          </div>
        </div>

        {/* Metadata */}
        {liveData?.metadata && (
          <div className="mt-4 pt-2 border-t-2 border-black text-[10px] text-gray-600 font-bold uppercase">
            <div>Network: {liveData.metadata.successful_stations}/{liveData.metadata.total_stations} online</div>
            <div>Sync: {new Date(liveData.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      {/* Map Content - Center */}
      <div className="flex-1 relative z-0 h-[500px] lg:h-auto min-h-[500px]">
        <MapContainer
          center={mapCenter}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmap Layer */}
          {showHeatmap && grid.map((cell, index) => (
            <Polygon
              key={`${selectedPollutant}-${index}`}
              positions={cell.positions}
              pathOptions={{
                color: "black",
                weight: 0.3,
                fillColor: getColor(cell.value, selectedPollutant),
                fillOpacity: 0.7,
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'monospace' }}>
                  <strong>{selectedPollutant.toUpperCase()} Level</strong><br />
                  Value: {cell.value.toFixed(2)} {currentPollutant.unit}<br />
                  Location: [{cell.center[0].toFixed(4)}, {cell.center[1].toFixed(4)}]
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Isopleth Contours */}
          {showContours && generateContours(grid).map((contour, idx) => (
            <GeoJSON
              key={`contour-${idx}`}
              data={{
                type: "Feature",
                properties: { level: contour.level },
                geometry: {
                  type: "Polygon",
                  coordinates: [[
                    [southWest[1], southWest[0]],
                    [northEast[1], southWest[0]],
                    [northEast[1], northEast[0]],
                    [southWest[1], northEast[0]],
                    [southWest[1], southWest[0]]
                  ]]
                }
              }}
              style={() => ({
                color: "black",
                weight: 2,
                fill: false,
                dashArray: "5, 5"
              })}
            >
              <Popup>
                <div style={{ fontFamily: 'monospace' }}>
                  <strong>Contour Line</strong><br />
                  Level: {contour.level} {currentPollutant.unit}
                </div>
              </Popup>
            </GeoJSON>
          ))}

          {/* All Monitoring Stations */}
          {stations.map((station) => {
            const stationData = liveData?.stations?.[station.id];
            const pollutantValue = stationData?.[selectedPollutant];

            return (
              <Marker
                key={station.id}
                position={station.position}
                icon={createStationIcon(station.color)}
                eventHandlers={{
                  mouseover: () => setSelectedStation(station.id),
                  mouseout: () => setSelectedStation(null)
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'monospace', maxWidth: '250px' }}>
                    <strong style={{ fontSize: '14px' }}>📍 {station.name}</strong><br />
                    <hr style={{ margin: '5px 0', border: '1px solid black' }} />
                    {stationData ? (
                      <>
                        <strong>REAL-TIME READINGS:</strong><br />
                        PM2.5: {stationData.pm25?.toFixed(2) || 'N/A'} µg/m³<br />
                        PM10: {stationData.pm10?.toFixed(2) || 'N/A'} µg/m³<br />
                        NO2: {stationData.no2?.toFixed(2) || 'N/A'} ppb<br />
                        CO: {stationData.co?.toFixed(3) || 'N/A'} ppm<br />
                        SO2: {stationData.so2?.toFixed(2) || 'N/A'} ppb<br />
                        O3: {stationData.o3?.toFixed(2) || 'N/A'} ppb<br />
                        NO: {stationData.no?.toFixed(2) || 'N/A'} ppb<br />
                        NOx: {stationData.nox?.toFixed(3) || 'N/A'} ppb<br />
                        Temperature: {stationData.temperature?.toFixed(1) || 'N/A'}°C<br />
                        Humidity: {stationData.humidity?.toFixed(1) || 'N/A'}%<br />
                        Wind: {stationData.wind_speed?.toFixed(2) || 'N/A'} m/s at {stationData.wind_direction?.toFixed(0) || 'N/A'}°
                      </>
                    ) : (
                      'No live data available'
                    )}
                    <br />
                    <small>Last updated: {stationData?.timestamp ? new Date(stationData.timestamp).toLocaleString() : 'N/A'}</small>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Traffic Hotspots */}
          {showTraffic && trafficHotspots.map((spot, idx) => (
            <CircleMarker
              key={`traffic-${idx}`}
              center={spot.pos}
              radius={spot.intensity === 'very high' ? 12 : spot.intensity === 'high' ? 9 : 6}
              pathOptions={{
                color: "black",
                weight: 2,
                fillColor: spot.intensity === 'very high' ? "#8B0000" :
                  spot.intensity === 'high' ? "#FF0000" : "#FFA500",
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'monospace' }}>
                  <strong>{spot.name}</strong><br />
                  Traffic Intensity: {spot.intensity.toUpperCase()}<br />
                  Impact Zone: High pollution risk
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Schools */}
          {showSensitive && schools.map((school, idx) => (
            <Marker
              key={`school-${idx}`}
              position={school.pos}
              icon={createSchoolIcon()}
            >
              <Popup>
                <div style={{ fontFamily: 'monospace' }}>
                  <strong>{school.name}</strong><br />
                  Students: {school.students}<br />
                  ⚠️ Sensitive Area - Children at risk
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Hospitals */}
          {showSensitive && hospitals.map((hospital, idx) => (
            <Marker
              key={`hospital-${idx}`}
              position={hospital.pos}
              icon={createHospitalIcon()}
            >
              <Popup>
                <div style={{ fontFamily: 'monospace' }}>
                  <strong>{hospital.name}</strong><br />
                  Beds: {hospital.beds}<br />
                  🏥 Healthcare Facility
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Wind Direction */}
          {showWind && (
            <LayerGroup>
              <Polygon
                positions={windArrow.shaft}
                pathOptions={{ color: "#7B61FF", weight: 4, opacity: 0.8 }}
              />
              <Polygon
                positions={windArrow.head}
                pathOptions={{ color: "#7B61FF", weight: 2, fillColor: "#7B61FF", fillOpacity: 0.8 }}
              />
              <Marker position={mapCenter}>
                <Popup>
                  <div style={{ fontFamily: 'monospace' }}>
                    <strong>Average Wind Direction</strong><br />
                    Speed: {currentWind.speed.toFixed(2)} m/s<br />
                    Direction: {currentWind.direction.toFixed(1)}°
                  </div>
                </Popup>
              </Marker>
            </LayerGroup>
          )}
        </MapContainer>
      </div>

      {/* ✅ FIXED: Legend - now dynamically uses getLegendItems() for all pollutants */}
      <div className="w-full lg:w-[260px] bg-[#FFCC00] border-t-4 lg:border-t-0 lg:border-l-4 border-black p-4 shrink-0 flex flex-col z-10 overflow-y-auto">
        <div className="font-black text-lg border-b-4 border-black pb-2 mb-4 bg-white p-2 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
          {currentPollutant.name} LEVELS
        </div>
        <div className="flex flex-col gap-3 font-bold text-sm bg-white p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-5 h-5 border-2 border-black shrink-0"
                style={{ background: item.color }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapComponent;