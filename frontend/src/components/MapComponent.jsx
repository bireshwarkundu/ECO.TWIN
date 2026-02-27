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

// Call the fix function
fixLeafletIcons();

// ---------------------------
// 1️⃣ Simulation Area
// ---------------------------
const southWest = [22.5, 88.3];
const northEast = [22.65, 88.5];

const rows = 20;
const cols = 20;

const latStep = (northEast[0] - southWest[0]) / rows;
const lngStep = (northEast[1] - southWest[1]) / cols;

// Station coordinates with proper names
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

// Sample traffic hotspots
const trafficHotspots = [
  { pos: [22.575, 88.43], name: "City Center", intensity: "high" },
  { pos: [22.59, 88.41], name: "Sector V Junction", intensity: "very high" },
  { pos: [22.565, 88.39], name: "Salt Lake Stadium", intensity: "medium" },
  { pos: [22.585, 88.45], name: "Nicco Park", intensity: "low" },
];

// Sample school locations (sensitive areas)
const schools = [
  { pos: [22.578, 88.425], name: "Delhi Public School", students: 1200 },
  { pos: [22.588, 88.415], name: "St. Xavier's School", students: 800 },
  { pos: [22.572, 88.405], name: "Salt Lake School", students: 600 },
];

// Sample hospitals
const hospitals = [
  { pos: [22.58, 88.42], name: "AMRI Hospital", beds: 500 },
  { pos: [22.577, 88.435], name: "Apollo Clinic", beds: 200 },
];

// All available pollutants
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

// ---------------------------
// 2️⃣ Utility Functions
// ---------------------------
const getDistance = (lat1, lng1, lat2, lng2) => {
  return Math.sqrt(
    Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)
  );
};

const getColor = (value, pollutant = 'pm25') => {
  // Different color scales for different pollutants
  const scales = {
    pm25: [
      { threshold: 100, color: "#8B0000" },
      { threshold: 80, color: "#FF0000" },
      { threshold: 60, color: "#FFA500" },
      { threshold: 40, color: "#FFFF00" },
      { threshold: 0, color: "#008000" }
    ],
    pm10: [
      { threshold: 150, color: "#8B0000" },
      { threshold: 100, color: "#FF0000" },
      { threshold: 75, color: "#FFA500" },
      { threshold: 50, color: "#FFFF00" },
      { threshold: 0, color: "#008000" }
    ],
    no2: [
      { threshold: 60, color: "#8B0000" },
      { threshold: 40, color: "#FF0000" },
      { threshold: 30, color: "#FFA500" },
      { threshold: 20, color: "#FFFF00" },
      { threshold: 0, color: "#90EE90" }
    ],
    co: [
      { threshold: 10, color: "#8B0000" },
      { threshold: 7, color: "#FF0000" },
      { threshold: 4, color: "#FFA500" },
      { threshold: 2, color: "#FFFF00" },
      { threshold: 0, color: "#90EE90" }
    ],
    so2: [
      { threshold: 80, color: "#8B0000" },
      { threshold: 60, color: "#FF0000" },
      { threshold: 40, color: "#FFA500" },
      { threshold: 20, color: "#FFFF00" },
      { threshold: 0, color: "#ADD8E6" }
    ],
    o3: [
      { threshold: 70, color: "#800080" },
      { threshold: 55, color: "#FF0000" },
      { threshold: 40, color: "#FFA500" },
      { threshold: 25, color: "#FFFF00" },
      { threshold: 0, color: "#ADD8E6" }
    ],
    no: [
      { threshold: 60, color: "#8B0000" },
      { threshold: 40, color: "#FF0000" },
      { threshold: 30, color: "#FFA500" },
      { threshold: 20, color: "#FFFF00" },
      { threshold: 0, color: "#DDA0DD" }
    ],
    nox: [
      { threshold: 80, color: "#8B0000" },
      { threshold: 60, color: "#FF0000" },
      { threshold: 40, color: "#FFA500" },
      { threshold: 20, color: "#FFFF00" },
      { threshold: 0, color: "#C0C0C0" }
    ],
    temperature: [
      { threshold: 40, color: "#8B0000" },
      { threshold: 35, color: "#FF0000" },
      { threshold: 30, color: "#FFA500" },
      { threshold: 25, color: "#FFFF00" },
      { threshold: 0, color: "#00FF66" }
    ],
    humidity: [
      { threshold: 90, color: "#00008B" },
      { threshold: 70, color: "#4169E1" },
      { threshold: 50, color: "#87CEEB" },
      { threshold: 30, color: "#ADD8E6" },
      { threshold: 0, color: "#F0F8FF" }
    ]
  };
  
  const scale = scales[pollutant] || scales.pm25;
  for (let level of scale) {
    if (value > level.threshold) return level.color;
  }
  return "#008000";
};

// Time-based scaling
const getTimeFactor = (hour) => {
  if (hour >= 7 && hour <= 10) return 1.6;   // Morning rush
  if (hour >= 17 && hour <= 20) return 1.7;  // Evening rush
  if (hour >= 0 && hour <= 5) return 0.6;    // Night
  return 1.0;                                // Normal
};

// Land use factors (different areas have different pollution levels)
const getLandUseFactor = (i, j) => {
  // Industrial area (higher pollution)
  if (i > 15 && j > 15) return 1.8;
  // Traffic corridor (middle band)
  if (i > 8 && i < 12 && j > 5 && j < 15) return 1.5;
  // Park / low emission zone
  if (i < 5 && j < 5) return 0.6;
  // Residential
  return 0.9;
};

// Inverse distance weighting interpolation using multiple stations
const interpolateValue = (lat, lng, stationData, pollutant) => {
  let weightedSum = 0;
  let weightSum = 0;
  
  stations.forEach(station => {
    const stationInfo = stationData?.stations?.[station.id];
    if (!stationInfo || stationInfo[pollutant] === null || stationInfo[pollutant] === undefined) return;
    
    const distance = getDistance(lat, lng, station.position[0], station.position[1]);
    // Avoid division by zero
    if (distance < 0.001) return stationInfo[pollutant]; // Very close to station
    
    // Inverse distance weighting (power of 2 for smoother falloff)
    const weight = 1 / Math.pow(distance, 2);
    weightedSum += stationInfo[pollutant] * weight;
    weightSum += weight;
  });
  
  if (weightSum === 0) return null;
  return weightedSum / weightSum;
};

// ---------------------------
// 3️⃣ Grid Simulation Logic with MULTI-STATION data
// ---------------------------
const generateGrid = (timeFactor, pollutant, stationData) => {
  const cells = [];
  
  // Check if we have any valid station data
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
        // Use interpolation from multiple stations
        const interpolated = interpolateValue(centerLat, centerLng, stationData, pollutant);
        pollutionValue = interpolated !== null ? interpolated : 50; // Fallback
      } else {
        // Fallback to single station simulation
        const baseValue = 50;
        const distanceToFirstStation = getDistance(centerLat, centerLng, stations[0].position[0], stations[0].position[1]);
        const maxDistance = getDistance(southWest[0], southWest[1], northEast[0], northEast[1]);
        const normalizedDistance = distanceToFirstStation / maxDistance;
        const distanceFactor = Math.exp(-2 * Math.pow(normalizedDistance, 2)) * 1.2 + 0.3;
        const landUseFactor = getLandUseFactor(i, j);
        const randomFactor = 0.9 + Math.random() * 0.2;
        pollutionValue = baseValue * timeFactor * distanceFactor * landUseFactor * randomFactor;
      }

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

  return cells;
};

// Generate isopleth contours (simplified)
const generateContours = (grid, levels = [40, 60, 80, 100]) => {
  return levels.map(level => ({
    level,
    bounds: [southWest, northEast]
  }));
};

// Create custom icons for schools and hospitals
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

// Create custom station icon
const createStationIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background: ${color}; border: 3px solid black; border-radius: 50%; width: 16px; height: 16px; box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);"></div>`,
    iconSize: [16, 16],
    popupAnchor: [0, -8]
  });
};

// ---------------------------
// 4️⃣ Main Component
// ---------------------------
function MapComponent({ liveData }) {
  const [hour, setHour] = useState(new Date().getHours());
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');
  const [showTraffic, setShowTraffic] = useState(true);
  const [showSensitive, setShowSensitive] = useState(true);
  const [showWind, setShowWind] = useState(true);
  const [showContours, setShowContours] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  const timeFactor = getTimeFactor(hour);
  
  // Generate grid using data from all stations
  const grid = useMemo(() => 
    generateGrid(timeFactor, selectedPollutant, liveData), 
    [timeFactor, selectedPollutant, liveData]
  );

  console.log('Station Data:', liveData);
  console.log('Grid Stats:', {
    pollutant: selectedPollutant,
    cells: grid.length,
    min: Math.min(...grid.map(c => c.value)).toFixed(2),
    max: Math.max(...grid.map(c => c.value)).toFixed(2),
    avg: (grid.reduce((a, c) => a + c.value, 0) / grid.length).toFixed(2)
  });
  
  // Calculate statistics
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

  // Get current pollutant unit
  const currentPollutant = pollutants.find(p => p.id === selectedPollutant) || pollutants[0];

  // Get average wind data from stations
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

  // Create wind arrow points
  const createWindArrow = () => {
    const arrowLength = 0.02;
    const startLat = 22.5828;
    const startLng = 88.4172;
    const rad = (currentWind.direction * Math.PI) / 180;
    const endLat = startLat + arrowLength * Math.cos(rad);
    const endLng = startLng + arrowLength * Math.sin(rad);
    
    // Arrow head
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

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={[22.5828, 88.4172]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Base Map Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap Layer (Grid Cells) with interpolated data */}
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
                <strong>{selectedPollutant.toUpperCase()} Level</strong><br/>
                Value: {cell.value.toFixed(2)} {currentPollutant.unit}<br/>
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
                <strong>Contour Line</strong><br/>
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
                  <strong style={{ fontSize: '14px' }}>📍 {station.name}</strong><br/>
                  <hr style={{ margin: '5px 0', border: '1px solid black' }}/>
                  {stationData ? (
                    <>
                      <strong>REAL-TIME READINGS:</strong><br/>
                      PM2.5: {stationData.pm25?.toFixed(2) || 'N/A'} µg/m³<br/>
                      PM10: {stationData.pm10?.toFixed(2) || 'N/A'} µg/m³<br/>
                      NO2: {stationData.no2?.toFixed(2) || 'N/A'} ppb<br/>
                      CO: {stationData.co?.toFixed(3) || 'N/A'} ppm<br/>
                      SO2: {stationData.so2?.toFixed(2) || 'N/A'} ppb<br/>
                      O3: {stationData.o3?.toFixed(2) || 'N/A'} ppb<br/>
                      NO: {stationData.no?.toFixed(2) || 'N/A'} ppb<br/>
                      NOx: {stationData.nox?.toFixed(3) || 'N/A'} ppb<br/>
                      Temperature: {stationData.temperature?.toFixed(1) || 'N/A'}°C<br/>
                      Humidity: {stationData.humidity?.toFixed(1) || 'N/A'}%<br/>
                      Wind: {stationData.wind_speed?.toFixed(2) || 'N/A'} m/s at {stationData.wind_direction?.toFixed(0) || 'N/A'}°
                    </>
                  ) : (
                    'No live data available'
                  )}
                  <br/>
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
                <strong>{spot.name}</strong><br/>
                Traffic Intensity: {spot.intensity.toUpperCase()}<br/>
                Impact Zone: High pollution risk
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Schools (Sensitive Areas) */}
        {showSensitive && schools.map((school, idx) => (
          <Marker 
            key={`school-${idx}`} 
            position={school.pos}
            icon={createSchoolIcon()}
          >
            <Popup>
              <div style={{ fontFamily: 'monospace' }}>
                <strong>{school.name}</strong><br/>
                Students: {school.students}<br/>
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
                <strong>{hospital.name}</strong><br/>
                Beds: {hospital.beds}<br/>
                🏥 Healthcare Facility
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Wind Direction Visualization */}
        {showWind && (
          <LayerGroup>
            {/* Wind arrow shaft */}
            <Polygon
              positions={windArrow.shaft}
              pathOptions={{
                color: "#7B61FF",
                weight: 4,
                opacity: 0.8
              }}
            />
            {/* Wind arrow head */}
            <Polygon
              positions={windArrow.head}
              pathOptions={{
                color: "#7B61FF",
                weight: 2,
                fillColor: "#7B61FF",
                fillOpacity: 0.8
              }}
            />
            <Marker position={[22.5828, 88.4172]}>
              <Popup>
                <div style={{ fontFamily: 'monospace' }}>
                  <strong>Average Wind Direction</strong><br/>
                  Speed: {currentWind.speed.toFixed(2)} m/s<br/>
                  Direction: {currentWind.direction.toFixed(1)}°
                </div>
              </Popup>
            </Marker>
          </LayerGroup>
        )}
      </MapContainer>

      {/* Control Panel */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "white",
          padding: "15px",
          border: "4px solid black",
          zIndex: 1000,
          width: "320px",
          boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
          fontFamily: "monospace"
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", fontWeight: "bold", borderBottom: "2px solid black", paddingBottom: "5px" }}>
          MAP CONTROLS {liveData?.success ? '✅ LIVE' : '⏳ SIMULATED'}
        </h4>
        
        {/* Time Slider */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Time Simulation</label>
          <p style={{ margin: "5px 0" }}>
            Hour: <strong>{hour}:00</strong>
          </p>
          <input
            type="range"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Pollutant Selector */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Pollutant</label>
          <select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            style={{
              width: "100%",
              padding: "5px",
              marginTop: "5px",
              border: "2px solid black",
              fontFamily: "monospace",
              fontWeight: "bold"
            }}
          >
            {pollutants.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Layer Toggles */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold" }}>Layers</label>
          <div style={{ marginTop: "5px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Heatmap Grid
            </label>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={showTraffic}
                onChange={(e) => setShowTraffic(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Traffic Hotspots
            </label>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={showSensitive}
                onChange={(e) => setShowSensitive(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Schools & Hospitals
            </label>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={showWind}
                onChange={(e) => setShowWind(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Wind Direction
            </label>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={showContours}
                onChange={(e) => setShowContours(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Pollution Contours
            </label>
          </div>
        </div>

        {/* Station Statistics */}
        <div style={{ 
          borderTop: "2px solid black", 
          paddingTop: "10px",
          fontSize: "12px"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
            Station Readings:
          </div>
          {stations.map(station => {
            const stationData = liveData?.stations?.[station.id];
            const value = stationData?.[selectedPollutant];
            return (
              <div key={station.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                <span style={{ color: station.color }}>● {station.name}:</span>
                <strong>{value?.toFixed(2) || 'N/A'} {currentPollutant.unit}</strong>
              </div>
            );
          })}
          <div style={{ marginTop: "8px", borderTop: "1px dashed black", paddingTop: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Map Average:</span>
              <strong>{avgPollution} {currentPollutant.unit}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Map Range:</span>
              <strong>{minPollution} - {maxPollution} {currentPollutant.unit}</strong>
            </div>
          </div>
        </div>

        {/* Metadata */}
        {liveData?.metadata && (
          <div style={{ 
            marginTop: "10px",
            paddingTop: "5px",
            borderTop: "1px solid black",
            fontSize: "10px",
            color: "#666"
          }}>
            <div>Stations: {liveData.metadata.successful_stations}/{liveData.metadata.total_stations} online</div>
            <div>Last sync: {new Date(liveData.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      {/* Color Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          background: "white",
          padding: "10px",
          border: "2px solid black",
          zIndex: 1000,
          width: "220px",
          fontFamily: "monospace",
          fontSize: "11px"
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
          {currentPollutant.name} Levels ({currentPollutant.unit})
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "15px", height: "15px", backgroundColor: "#008000", border: "1px solid black" }}></div>
            <span>Low</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "15px", height: "15px", backgroundColor: "#FFFF00", border: "1px solid black" }}></div>
            <span>Moderate</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "15px", height: "15px", backgroundColor: "#FFA500", border: "1px solid black" }}></div>
            <span>High</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "15px", height: "15px", backgroundColor: "#FF0000", border: "1px solid black" }}></div>
            <span>Very High</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "15px", height: "15px", backgroundColor: "#8B0000", border: "1px solid black" }}></div>
            <span>Severe</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapComponent;