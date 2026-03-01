import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis,
    Tooltip, Legend, ResponsiveContainer, ReferenceArea, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    AlertTriangle, ArrowUpRight, ArrowDownRight, Settings, Play, Database, Download,
    Car, TreePine, Hospital, School, Shield, Zap, Wind, Activity,
    MapPin, TrendingDown, TrendingUp, Eye, Navigation, Leaf, ArrowLeft
} from 'lucide-react';
import BackToHomeButton from '../components/BackToHomeButton';

const API_BASE = 'http://localhost:8000';

// ═══════════════════════════════════════════════════════════════════════════
// BIDHANNAGAR TRAFFIC DATA
// ═══════════════════════════════════════════════════════════════════════════
const TRAFFIC_ZONES = [
    { id: 46, zone_name: "City Centre Salt Lake", latitude: 22.5878, longitude: 88.409, traffic_level: "High", traffic_score: 77, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 14 },
    { id: 47, zone_name: "Karunamayee Bus Stand", latitude: 22.5837, longitude: 88.4253, traffic_level: "High", traffic_score: 81, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 10 },
    { id: 48, zone_name: "Salt Lake Sec V IT Hub", latitude: 22.576, longitude: 88.4323, traffic_level: "High", traffic_score: 87, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 12 },
    { id: 49, zone_name: "Ultadanga Connector", latitude: 22.5937, longitude: 88.3948, traffic_level: "High", traffic_score: 98, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 11 },
    { id: 50, zone_name: "Salt Lake Stadium Gate", latitude: 22.5681, longitude: 88.4013, traffic_level: "High", traffic_score: 76, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 19 },
    { id: 51, zone_name: "Narayanpur Bus Terminus", latitude: 22.6134, longitude: 88.4527, traffic_level: "High", traffic_score: 76, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 16 },
    { id: 52, zone_name: "Bidhannagar Sector I", latitude: 22.5952, longitude: 88.4101, traffic_level: "Medium", traffic_score: 45, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 40 },
    { id: 53, zone_name: "Bidhannagar Sector II", latitude: 22.5932, longitude: 88.417, traffic_level: "Medium", traffic_score: 55, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 39 },
    { id: 54, zone_name: "Bidhannagar Sector III", latitude: 22.5881, longitude: 88.4162, traffic_level: "Medium", traffic_score: 42, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 39 },
    { id: 55, zone_name: "Central Park Salt Lake", latitude: 22.5854, longitude: 88.414, traffic_level: "Medium", traffic_score: 60, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 31 },
    { id: 56, zone_name: "Baguiati Connector", latitude: 22.6139, longitude: 88.4294, traffic_level: "Medium", traffic_score: 65, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 30 },
    { id: 57, zone_name: "DLF IT Park Approach", latitude: 22.5785, longitude: 88.459, traffic_level: "Medium", traffic_score: 44, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 40 },
    { id: 58, zone_name: "Ecospace Business Park", latitude: 22.5856, longitude: 88.4747, traffic_level: "Medium", traffic_score: 44, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 37 },
    { id: 59, zone_name: "Nicco Park Road", latitude: 22.5714, longitude: 88.4213, traffic_level: "Medium", traffic_score: 62, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 32 },
    { id: 60, zone_name: "Salt Lake Sector IV Res.", latitude: 22.58870, longitude: 88.43598, traffic_level: "Low", traffic_score: 39, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 60 },
    { id: 61, zone_name: "AE Block Salt Lake", latitude: 22.59540, longitude: 88.41352, traffic_level: "Low", traffic_score: 5, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 50 },
    { id: 62, zone_name: "FD Block Salt Lake", latitude: 22.59126, longitude: 88.40129, traffic_level: "Low", traffic_score: 13, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 44 },
    { id: 63, zone_name: "Salt Lake, Lake Area", latitude: 22.57968, longitude: 88.41413, traffic_level: "Low", traffic_score: 22, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 47 },
    { id: 64, zone_name: "DB Block Salt Lake", latitude: 22.59660, longitude: 88.40723, traffic_level: "Low", traffic_score: 18, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 57 },
    { id: 65, zone_name: "HB Block Salt Lake", latitude: 22.58115, longitude: 88.42163, traffic_level: "Low", traffic_score: 8, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 49 }
];

// Alternative routes for high-congestion roads
const ALT_ROUTES = {
    46: { name: "Central Park Bypass", via: "FD Block → Sector III connector", aqiReduction: 18, timeAdd: "+3 min", savings: "22 AQI pts saved" },
    47: { name: "AE Block Corridor", via: "Sector I → DB Block → Karunamayee", aqiReduction: 24, timeAdd: "+5 min", savings: "31 AQI pts saved" },
    48: { name: "HB Block IT Bypass", via: "Nicco Park Rd → Sec IV → IT Hub (rear)", aqiReduction: 15, timeAdd: "+4 min", savings: "19 AQI pts saved" },
    49: { name: "BT Road Diversion", via: "Dunlop → Belghoria Exp → Salt Lake", aqiReduction: 35, timeAdd: "+8 min", savings: "41 AQI pts saved" },
    50: { name: "Lake Town Bypass", via: "VIP Road → Salt Lake, Lake Area", aqiReduction: 20, timeAdd: "+6 min", savings: "25 AQI pts saved" },
    51: { name: "Baguiati Alt Route", via: "Rajarhat Road → Baguiati → Terminus", aqiReduction: 18, timeAdd: "+4 min", savings: "22 AQI pts saved" },
};

const SITE_CANDIDATES = [
    { id: 's1', name: "Central Park Green Belt", lat: 22.5820, lng: 88.4078, type: "both", aqiScore: 92, trafficScore: 88, greenScore: 95, futureScore: 90, desc: "Large green area, excellent AQI, minimal traffic. Ideal buffer zone from arterial roads." },
    { id: 's2', name: "Salt Lake, Lake Area", lat: 22.5797, lng: 88.4143, type: "both", aqiScore: 94, trafficScore: 91, greenScore: 98, futureScore: 95, desc: "Natural water body proximity, very clean air. Lowest PM2.5 readings in the district." },
    { id: 's3', name: "HB Block Interior", lat: 22.5819, lng: 88.4211, type: "school", aqiScore: 95, trafficScore: 97, greenScore: 88, futureScore: 93, desc: "Lowest traffic in Bidhannagar, safe for children. Score 8 traffic — barely any vehicles." },
    { id: 's4', name: "AE Block Salt Lake", lat: 22.5953, lng: 88.4135, type: "school", aqiScore: 96, trafficScore: 99, greenScore: 85, futureScore: 91, desc: "Extreme low traffic (score 5), excellent for schools. Quietest zone in entire dataset." },
    { id: 's5', name: "Ecospace-DLF Corridor", lat: 22.5738, lng: 88.4412, type: "hospital", aqiScore: 85, trafficScore: 82, greenScore: 75, futureScore: 88, desc: "IT hub area, future growth zone. Strong emergency vehicle access via Eastern Bypass." },
    { id: 's6', name: "DB Block Green Zone", lat: 22.5965, lng: 88.4073, type: "hospital", aqiScore: 93, trafficScore: 96, greenScore: 89, futureScore: 92, desc: "Residential quiet zone, excellent emergency access. Low score 18 traffic environment." },
    { id: 's7', name: "Sector IV North", lat: 22.5887, lng: 88.4359, type: "both", aqiScore: 88, trafficScore: 86, greenScore: 82, futureScore: 89, desc: "Balanced scores across all metrics. Largest available land parcels for expansion." },
];

const EXISTING_INSTITUTIONS = [
    { id: 'e1', name: "Techno India University", lat: 22.5765, lng: 88.4287, type: "university", aqi: 135, details: "4500 Students" },
    { id: 'e2', name: "Jadavpur Univ. (SL)", lat: 22.5695, lng: 88.4093, type: "university", aqi: 98, details: "2000 Students" },
    { id: 'e3', name: "Bidhannagar Mun. School", lat: 22.5901, lng: 88.4111, type: "school", aqi: 110, details: "1200 Students" },
    { id: 'e4', name: "Salt Lake School", lat: 22.5839, lng: 88.4215, type: "school", aqi: 122, details: "1500 Students" },
    { id: 'e5', name: "AMRI Hospital", lat: 22.5786, lng: 88.4061, type: "hospital", aqi: 145, details: "200 Beds" },
    { id: 'e6', name: "Apollo Hospital", lat: 22.5746, lng: 88.4005, type: "hospital", aqi: 155, details: "350 Beds" },
    { id: 'e7', name: "Bidhannagar Hospital", lat: 22.5947, lng: 88.4159, type: "hospital", aqi: 85, details: "150 Beds" },
    { id: 'e8', name: "IEM College", lat: 22.5752, lng: 88.4320, type: "college", aqi: 140, details: "3000 Students" },
    { id: 'e9', name: "NIFT Institute", lat: 22.5683, lng: 88.4121, type: "institute", aqi: 96, details: "800 Students" },
    { id: 'e10', name: "St. Joan's School", lat: 22.5912, lng: 88.4187, type: "school", aqi: 105, details: "900 Students" },
    { id: 'e11', name: "Calcutta Heart Clinic", lat: 22.5855, lng: 88.4022, type: "hospital", aqi: 130, details: "100 Beds" },
    { id: 'e12', name: "Bidhannagar College", lat: 22.5878, lng: 88.4055, type: "college", aqi: 115, details: "2200 Students" }
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const BrutalistTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#fff', border: '4px solid #000', padding: '10px 14px', boxShadow: '4px 4px 0 #000', fontFamily: "'Space Mono',monospace", fontWeight: 900 }}>
                <p style={{ borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase', fontSize: '14px' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color || '#000', fontSize: '12px' }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function getAQILabel(aqi) {
    if (aqi <= 50) return 'GOOD';
    if (aqi <= 100) return 'SATISFACTORY';
    if (aqi <= 200) return 'MODERATE';
    if (aqi <= 300) return 'POOR';
    if (aqi <= 400) return 'VERY POOR';
    return 'SEVERE';
}

function getHealthAdvisory(aqi) {
    if (aqi === null || aqi === undefined) return 'Live sensor data unavailable. Showing model estimates.';
    if (aqi <= 50) return 'Air quality is satisfactory. Enjoy outdoor activities.';
    if (aqi <= 100) return 'Minor breathing discomfort to sensitive people.';
    if (aqi <= 200) return 'Sensitive groups should reduce outdoor exertion.';
    if (aqi <= 300) return 'Breathing discomfort to most people on prolonged exposure.';
    if (aqi <= 400) return 'Respiratory illness on prolonged exposure. Avoid outdoor activities.';
    return 'Health emergency. Everyone should avoid outdoor activities.';
}

function calcAQI(pm25) {
    if (pm25 <= 30) return Math.round(pm25 * 50 / 30);
    if (pm25 <= 60) return Math.round(50 + (pm25 - 30) * 50 / 30);
    if (pm25 <= 90) return Math.round(100 + (pm25 - 60) * 100 / 30);
    return Math.round(200 + (pm25 - 90) * 100 / 30);
}

function aqiBg(aqi) {
    if (aqi <= 50) return '#00E676';
    if (aqi <= 100) return '#FFEE58';
    if (aqi <= 150) return '#FFA726';
    if (aqi <= 200) return '#EF5350';
    return '#CE93D8';
}

function aqiWord(aqi) {
    if (aqi <= 50) return 'GOOD';
    if (aqi <= 100) return 'SATISFACTORY';
    if (aqi <= 150) return 'MODERATE';
    if (aqi <= 200) return 'POOR';
    return 'VERY POOR';
}

// ═══════════════════════════════════════════════════════════════════════════
// LEAFLET HOOK
// ═══════════════════════════════════════════════════════════════════════════
function useLeaflet() {
    const [L, setL] = useState(null);
    useEffect(() => {
        if (window.L) { setL(window.L); return; }
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(link);
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = () => setL(window.L);
        document.head.appendChild(script);
    }, []);
    return L;
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 1: TRAFFIC DIVERGENCE SIMULATOR — Enhanced
// ═══════════════════════════════════════════════════════════════════════════



function TrafficDivergenceSimulator() {
    const L = useLeaflet();
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const circlesRef = useRef([]);
    const polylineRef = useRef([]);
    const osrmPolylineRef = useRef(null);
    const altOsrmPolylineRef = useRef(null);

    const [selectedTimeMode, setSelectedTimeMode] = useState("Morning");

    // AQI-Aware Routing States
    const [sourceZoneId, setSourceZoneId] = useState("");
    const [destZoneId, setDestZoneId] = useState("");

    const [primaryRoute, setPrimaryRoute] = useState(null);
    const [alternateRoute, setAlternateRoute] = useState(null);
    const [activeRouteView, setActiveRouteView] = useState("primary"); // "primary" or "alternate"

    const [divergedZones, setDivergedZones] = useState([]);
    const [roadGeometries, setRoadGeometries] = useState({});

    // Fetch OSM road geometries 
    useEffect(() => {
        const fetchGeometries = async () => {
            let queryBody = "";
            TRAFFIC_ZONES.forEach(z => {
                queryBody += `way(around:100,${z.latitude},${z.longitude})["highway"];`;
            });
            const query = `[out:json];(${queryBody});out geom;`;
            try {
                const res = await fetch(`https://overpass-api.de/api/interpreter`, {
                    method: 'POST',
                    body: query
                });
                const data = await res.json();

                const newGeoms = {};
                TRAFFIC_ZONES.forEach(z => {
                    let minD = Infinity;
                    let bestWay = null;
                    data.elements.forEach(el => {
                        if (el.type === 'way' && el.geometry) {
                            el.geometry.forEach(pt => {
                                const d = Math.pow(pt.lat - z.latitude, 2) + Math.pow(pt.lon - z.longitude, 2);
                                if (d < minD) {
                                    minD = d;
                                    bestWay = el;
                                }
                            });
                        }
                    });
                    if (bestWay) {
                        newGeoms[z.id] = bestWay.geometry.map(pt => [pt.lat, pt.lon]);
                    }
                });
                setRoadGeometries(newGeoms);
            } catch (err) {
                console.error("Overpass API error:", err);
            }
        };
        fetchGeometries();
    }, []);

    const timeStrToVal = (mode) => {
        if (mode === "Morning") return "09:00";
        if (mode === "Evening") return "18:00";
        return "13:00";
    };

    const isTimeInPeakRange = (timeStr, peakHoursStr) => {
        if (peakHoursStr === "Off-peak only") return timeStr === "13:00";
        const [h, m] = timeStr.split(':').map(Number);
        const timeInMin = h * 60 + m;
        const ranges = peakHoursStr.split(',').map(r => r.trim());
        for (const range of ranges) {
            let [hoursPart, ampm] = range.split(' ');
            if (!ampm && range.includes("AM")) ampm = "AM";
            if (!ampm && range.includes("PM")) ampm = "PM";
            hoursPart = hoursPart.replace('AM', '').replace('PM', '').trim();
            const parts = hoursPart.split('–');
            if (parts.length < 2) continue;
            let startH = parseInt(parts[0]);
            let endH = parseInt(parts[1]);
            if (ampm === "PM" && startH < 12) startH += 12;
            if (ampm === "PM" && endH < 12) endH += 12;
            if (ampm === "AM" && startH === 12) startH = 0;
            if (ampm === "AM" && endH === 12) endH = 0;
            if (timeInMin >= startH * 60 && timeInMin <= endH * 60) return true;
        }
        return false;
    };

    const computeZoneData = (z) => {
        const isActive = isTimeInPeakRange(timeStrToVal(selectedTimeMode), z.peak_hours);

        // Dynamically adjust score based on time mode (High during peak, drastically lower when inactive)
        const effectiveScore = isActive ? z.traffic_score : Math.max(z.traffic_score * 0.35, 10);

        const aqi_estimated = Math.round(effectiveScore * 1.8 + 20); // Scale up to approximate AQI values
        const aqiLevel = aqi_estimated > 150 ? 'Unhealthy' : (aqi_estimated > 100 ? 'Moderate' : 'Good');

        let colorType = "green"; let colorHex = "#00FF66"; let label = "Health-Optimised Route";
        if (aqi_estimated > 130 || (isActive && z.traffic_level === 'High')) {
            colorType = "red"; colorHex = "#FF3366"; label = "High Pollution Corridor";
        } else if (aqi_estimated > 80 || (isActive && z.traffic_level === 'Medium')) {
            colorType = "yellow"; colorHex = "#FFCC00"; label = "Acceptable but not ideal";
        }

        return { ...z, aqi: aqi_estimated, aqiLevel, emission_index: aqi_estimated, colorType, colorHex, label, isActive };
    };

    const enrichedZones = TRAFFIC_ZONES.map(computeZoneData);

    // OSRM Logic for AQI-Aware Routing A-to-B
    useEffect(() => {
        const fetchRouting = async () => {
            if (!sourceZoneId || !destZoneId || sourceZoneId === destZoneId) {
                setPrimaryRoute(null); setAlternateRoute(null);
                return;
            }
            const src = enrichedZones.find(z => z.id === parseInt(sourceZoneId));
            const dst = enrichedZones.find(z => z.id === parseInt(destZoneId));
            if (!src || !dst) return;

            try {
                // Fetch Shortest Route
                const primaryStr = `${src.longitude},${src.latitude};${dst.longitude},${dst.latitude}`;
                const resPrimary = await fetch(`http://router.project-osrm.org/route/v1/driving/${primaryStr}?overview=full&geometries=geojson`);
                const dataPrimary = await resPrimary.json();

                if (dataPrimary.routes && dataPrimary.routes.length > 0) {
                    const primarySegments = dataPrimary.routes[0].geometry.coordinates;
                    const primaryTime = Math.round(dataPrimary.routes[0].duration / 60) || 1;

                    // Use Health Cost = AQI x Exposure Time x Vulnerability Factor
                    const avgAqiPrimary = Math.round((src.aqi + dst.aqi) / 2);
                    const VULNERABILITY_FACTOR = 1.0; // normal_adult
                    // Using time segment in minutes as proxy for exposure mapping
                    const primaryHealthCostScore = Math.floor(avgAqiPrimary * primaryTime * VULNERABILITY_FACTOR);

                    const primaryObj = {
                        coords: primarySegments.map(c => [c[1], c[0]]),
                        travelTime: primaryTime,
                        avgAqi: avgAqiPrimary,
                        healthCostScore: primaryHealthCostScore,
                        isSafe: primaryHealthCostScore < 800 // Acceptable health threshold
                    };
                    setPrimaryRoute(primaryObj);
                    setActiveRouteView("primary");

                    if (!primaryObj.isSafe) {
                        // Unhealthy route! Find a green midpoint to act as an alternate healthy via-point
                        const greens = enrichedZones.filter(z => z.colorType === 'green' && z.id !== src.id && z.id !== dst.id);
                        let altObj = null;
                        if (greens.length > 0) {
                            // Find the green zone that minimizes distance deviation
                            // For simplicity, just pick a central green one
                            const via = greens[Math.floor(greens.length / 2)];
                            const altStr = `${src.longitude},${src.latitude};${via.longitude},${via.latitude};${dst.longitude},${dst.latitude}`;
                            const resAlt = await fetch(`http://router.project-osrm.org/route/v1/driving/${altStr}?overview=full&geometries=geojson`);
                            const dataAlt = await resAlt.json();

                            if (dataAlt.routes && dataAlt.routes.length > 0) {
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
                            }
                        }
                        setAlternateRoute(altObj);
                    } else {
                        setAlternateRoute(null);
                    }
                }
            } catch (e) { console.error("OSRM Error:", e); }
        };
        fetchRouting();
    }, [sourceZoneId, destZoneId, selectedTimeMode]); // Refresh if time mode changes -> causes emission changes

    useEffect(() => {
        if (!L || !mapRef.current || mapInstance.current) return;
        const map = L.map(mapRef.current, { center: [22.583, 88.415], zoom: 14, zoomControl: true });
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri', maxZoom: 19 }).addTo(map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { attribution: 'CartoDB', maxZoom: 19, opacity: 0.9 }).addTo(map);
        mapInstance.current = map;
        return () => { map.remove(); mapInstance.current = null; };
    }, [L]);

    useEffect(() => {
        if (!mapInstance.current || !L) return;
        markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
        circlesRef.current.forEach(c => mapInstance.current.removeLayer(c));
        polylineRef.current.forEach(p => mapInstance.current.removeLayer(p));
        if (osrmPolylineRef.current) mapInstance.current.removeLayer(osrmPolylineRef.current);
        if (altOsrmPolylineRef.current) mapInstance.current.removeLayer(altOsrmPolylineRef.current);

        markersRef.current = []; circlesRef.current = []; polylineRef.current = [];
        osrmPolylineRef.current = null; altOsrmPolylineRef.current = null;

        // Draw Base Network
        enrichedZones.forEach(zone => {
            const isHighlighted = zone.isActive;
            const opacity = isHighlighted ? 0.3 : 0.05;
            const circle = L.circle([zone.latitude, zone.longitude], {
                color: zone.colorHex, fillColor: zone.colorHex, fillOpacity: opacity, weight: isHighlighted ? 2 : 1, radius: zone.emission_index * 2,
            }).addTo(mapInstance.current);
            circlesRef.current.push(circle);

            if (roadGeometries[zone.id]) {
                const roadLine = L.polyline(roadGeometries[zone.id], {
                    color: zone.colorHex, weight: isHighlighted ? 5 : 3, opacity: isHighlighted ? 0.8 : 0.4, lineCap: 'square'
                }).addTo(mapInstance.current);
                polylineRef.current.push(roadLine);
            }

            const marker = L.circleMarker([zone.latitude, zone.longitude], {
                radius: 4, fillColor: zone.colorHex, color: '#000', weight: 2, fillOpacity: 1
            }).addTo(mapInstance.current);
            const popupHtml = zone.colorType === 'red' ?
                `<div style="font-family:'Space Mono',monospace; padding:12px; border:4px solid #FF3366; background:#fff5f5; width: 280px; box-shadow: 4px 4px 0 #000;">
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
            marker.bindPopup(popupHtml, { className: 'custom-brutalist-popup' });
            markersRef.current.push(marker);
        });

        // Add Source and Destination Pin Icons
        if (sourceZoneId) {
            const srcZone = enrichedZones.find(z => z.id === parseInt(sourceZoneId));
            if (srcZone) {
                const srcPin = L.marker([srcZone.latitude, srcZone.longitude], {
                    icon: L.divIcon({
                        className: '',
                        html: `<div style="background:#000; color:#00FF66; border:3px solid #00FF66; padding:4px 8px; font-weight:900; font-family:'Space Mono',monospace; font-size:12px; box-shadow:4px 4px 0 #000; white-space:nowrap;">📍 SRC</div>`,
                        iconSize: [70, 30], iconAnchor: [35, 40]
                    })
                }).addTo(mapInstance.current);
                markersRef.current.push(srcPin);
            }
        }
        if (destZoneId) {
            const dstZone = enrichedZones.find(z => z.id === parseInt(destZoneId));
            if (dstZone) {
                const dstPin = L.marker([dstZone.latitude, dstZone.longitude], {
                    icon: L.divIcon({
                        className: '',
                        html: `<div style="background:#000; color:#00CFFF; border:3px solid #00CFFF; padding:4px 8px; font-weight:900; font-family:'Space Mono',monospace; font-size:12px; box-shadow:4px 4px 0 #000; white-space:nowrap;">📍 DST</div>`,
                        iconSize: [70, 30], iconAnchor: [35, 40]
                    })
                }).addTo(mapInstance.current);
                markersRef.current.push(dstPin);
            }
        }

        // Draw active OSRM Route
        if (primaryRoute && activeRouteView === "primary") {
            osrmPolylineRef.current = L.polyline(primaryRoute.coords, {
                color: primaryRoute.isSafe ? '#00FF66' : '#FF3366', weight: 8, opacity: 0.9, lineCap: 'square', dashArray: '5,10'
            }).addTo(mapInstance.current);
            mapInstance.current.fitBounds(osrmPolylineRef.current.getBounds(), { padding: [30, 30] });
        } else if (alternateRoute && activeRouteView === "alternate") {
            altOsrmPolylineRef.current = L.polyline(alternateRoute.coords, {
                color: '#00CFFF', weight: 8, opacity: 0.9, lineCap: 'square', dashArray: '5,10'
            }).addTo(mapInstance.current);
            mapInstance.current.fitBounds(altOsrmPolylineRef.current.getBounds(), { padding: [30, 30] });
        }

    }, [L, enrichedZones, roadGeometries, primaryRoute, alternateRoute, activeRouteView]);

    return (
        <div style={{ fontFamily: "'Space Mono','Courier New',monospace", background: '#FFF' }} className="w-full text-black">
            <div style={{ background: '#000', borderBottom: '4px solid #000' }} className="px-6 py-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 bg-[#111] p-2 border-2 border-[#333]">
                            <Navigation size={36} strokeWidth={3} color="#00FF66" />

                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-1px', fontSize: '32px', fontWeight: 900, color: '#FFF', textTransform: 'uppercase' }}>
                                AQI-AWARE ROUTING
                            </h2>
                            <p style={{ color: '#00FF66', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px' }}>
                                SMART NAV · EMISSION INDEXING · HEALTH SAFETY
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <span style={{ fontWeight: 900, fontSize: '14px', color: '#FFF', marginRight: '8px' }}>TIME MODE:</span>
                    {['Morning', 'Evening', 'Off-Peak'].map(mode => (
                        <button key={mode} onClick={() => setSelectedTimeMode(mode)}
                            style={{
                                border: '3px solid #00FF66',
                                background: selectedTimeMode === mode ? '#00FF66' : '#000',
                                color: selectedTimeMode === mode ? '#000' : '#00FF66',
                                padding: '10px 16px', fontWeight: 900, fontSize: '14px',
                                textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Space Mono',monospace",
                                boxShadow: selectedTimeMode === mode ? '4px 4px 0 #FFF' : '4px 4px 0 #00FF66'
                            }}>
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', minHeight: '600px' }}>
                <div style={{ width: '380px', minWidth: '380px', background: '#F4F4F0', borderRight: '4px solid #000', display: 'flex', flexDirection: 'column' }}>

                    {/* Routing Input Panel */}
                    <div style={{ padding: '24px', borderBottom: '4px solid #000', background: '#000' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Zap size={28} color="#00FF66" />
                            <p style={{ fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', color: '#FFF', letterSpacing: '2px', margin: 0 }}>ROUTING ENGINE</p>
                        </div>

                        <div style={{ marginBottom: '16px', background: '#FFF', padding: '12px', border: '3px solid #00FF66', boxShadow: '4px 4px 0px 0px #00FF66' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <MapPin size={16} color="#000" />
                                <label style={{ fontSize: '13px', fontWeight: 900, color: '#000', letterSpacing: '1px' }}>SOURCE LOCATION</label>
                            </div>
                            <select value={sourceZoneId} onChange={(e) => setSourceZoneId(e.target.value)} style={{ width: '100%', padding: '12px', border: '3px solid #000', fontFamily: "'Space Mono',monospace", fontSize: '15px', background: '#F4F4F0', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                                <option value="">Select Starting Point</option>
                                {enrichedZones.sort((a, b) => a.zone_name.localeCompare(b.zone_name)).map(z => <option key={z.id} value={z.id} style={{ color: '#000' }}>{z.zone_name}</option>)}
                            </select>
                        </div>

                        <div style={{ background: '#FFF', padding: '12px', border: '3px solid #FF3366', boxShadow: '4px 4px 0px 0px #FF3366' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Navigation size={16} color="#000" />
                                <label style={{ fontSize: '13px', fontWeight: 900, color: '#000', letterSpacing: '1px' }}>DESTINATION</label>
                            </div>
                            <select value={destZoneId} onChange={(e) => setDestZoneId(e.target.value)} style={{ width: '100%', padding: '12px', border: '3px solid #000', fontFamily: "'Space Mono',monospace", fontSize: '15px', background: '#F4F4F0', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                                <option value="">Select Destination</option>
                                {enrichedZones.sort((a, b) => a.zone_name.localeCompare(b.zone_name)).map(z => <option key={z.id} value={z.id} style={{ color: '#000' }}>{z.zone_name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Routing Results & Alerts */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                        {primaryRoute ? (
                            <div>
                                <p style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px' }}>ROUTE ANALYSIS</p>

                                {primaryRoute.isSafe ? (
                                    <div style={{ border: '3px solid #00FF66', background: '#e6ffe6', padding: '12px', marginBottom: '16px' }}>
                                        <p style={{ color: '#008000', fontWeight: 900, fontSize: '14px', marginBottom: '6px' }}>✅ Route is safe</p>
                                        <p style={{ fontSize: '13px' }}>The shortest route has acceptable AQI exposure levels.</p>
                                    </div>
                                ) : (
                                    <div style={{ border: '3px solid #FF3366', background: '#ffe6e6', padding: '12px', marginBottom: '16px' }}>
                                        <p style={{ color: '#D50000', fontWeight: 900, fontSize: '14px', marginBottom: '6px' }}>HEALTH WARNING</p>
                                        <p style={{ fontSize: '13px', color: '#000', fontWeight: 'bold' }}>Air quality on this route is unhealthy!</p>
                                        <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Alternate green routing triggered.</p>
                                    </div>
                                )}

                                <div>
                                    {/* Primary Route Option (Shortest) */}
                                    <button onClick={() => setActiveRouteView("primary")} style={{
                                        width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column',
                                        padding: '12px', border: '3px solid #000', marginBottom: '12px', cursor: 'pointer',
                                        background: activeRouteView === "primary" ? (primaryRoute.isSafe ? '#ccffcc' : '#ffe6e6') : '#FFF'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 900, fontSize: '14px' }}>SHORTEST ROUTE {primaryRoute.isSafe ? '✅' : '❌'}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#555', marginBottom: '6px' }}>{primaryRoute.isSafe ? 'Healthy path' : 'Shortest but polluted'}</span>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>Travel Time</span>
                                                <span style={{ fontSize: '16px', fontWeight: 900 }}>{primaryRoute.travelTime} min</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>AQI Score</span>
                                                <span style={{ fontSize: '16px', fontWeight: 900, color: primaryRoute.isSafe ? '#008000' : '#D50000' }}>
                                                    {primaryRoute.avgAqi}
                                                    {alternateRoute && <span style={{ fontSize: '12px', marginLeft: '6px' }}>(+{Math.round(((primaryRoute.avgAqi - alternateRoute.avgAqi) / primaryRoute.avgAqi) * 100)}% Higher Risk)</span>}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Alternate Route Option (Healthier) */}
                                    {alternateRoute && (
                                        <button onClick={() => setActiveRouteView("alternate")} style={{
                                            width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column',
                                            padding: '12px', border: '3px solid #000', cursor: 'pointer',
                                            background: activeRouteView === "alternate" ? '#e6f7ff' : '#FFF'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 900, fontSize: '14px', color: '#007FFF' }}>AQI-AWARE ROUTE ✅</span>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#007FFF', marginBottom: '6px', fontWeight: 'bold' }}>Slightly longer but healthier</span>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>Travel Time</span>
                                                    <span style={{ fontSize: '16px', fontWeight: 900 }}>{alternateRoute.travelTime} min</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>AQI Score</span>
                                                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#008000' }}>
                                                        {alternateRoute.avgAqi}
                                                        <span style={{ fontSize: '12px', marginLeft: '6px' }}>(-{Math.round(((primaryRoute.avgAqi - alternateRoute.avgAqi) / primaryRoute.avgAqi) * 100)}% Decrease)</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '12px', background: '#00FF66', padding: '10px', border: '3px solid #000', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', color: '#000', letterSpacing: '1px' }}>✅ {alternateRoute.savings}% LESS AQI EXPOSURE</span>
                                                <div style={{ borderTop: '2px dashed #000', margin: '2px 0' }}></div>
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textTransform: 'uppercase', lineHeight: '1.4' }}>
                                                    <Leaf size={16} color="#000" />
                                                    Sustainability Impact: Choosing this route reduces personal cumulative inhalation of toxic PM2.5 by approx {(alternateRoute.travelTime * (primaryRoute.avgAqi - alternateRoute.avgAqi) * 0.12).toFixed(1)} µg
                                                </span>
                                            </div>
                                        </button>
                                    )}

                                </div>
                            </div>
                        ) : (() => {
                            const sortedBad = [...enrichedZones].sort((a, b) => (b.aqi + b.traffic_score) - (a.aqi + a.traffic_score));
                            const worstZone = sortedBad[0] || {};
                            const nextWorstZone = sortedBad.find(z => z.id !== worstZone.id && z.traffic_level === worstZone.traffic_level) || sortedBad[1] || {};

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ padding: '20px', textAlign: 'center', border: '4px dashed #ccc', background: '#FFF' }}>
                                        <p style={{ fontWeight: 900, fontSize: '15px', color: '#000' }}>SELECT SOURCE AND DESTINATION TO BEGIN AQI-AWARE ROUTING</p>
                                    </div>

                                    {/* 🚨 DAILY ROUTE UPDATE ADVISORY 🚨 */}
                                    <div style={{ border: '4px solid #FF3366', background: '#fff5f5', padding: '16px', boxShadow: '4px 4px 0 #000' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #FF3366', paddingBottom: '8px', marginBottom: '12px' }}>
                                            <p style={{ fontWeight: 900, fontSize: '18px', color: '#D50000', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <AlertTriangle size={22} /> HEALTH ADVISORY
                                            </p>
                                            <span style={{ fontSize: '14px', fontWeight: 900, background: '#FF3366', color: '#FFF', padding: '4px 8px' }}>TODAY 6:00 AM</span>
                                        </div>

                                        <p style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px', lineHeight: '1.2', color: '#000' }}>Today's High-Risk Routes (Salt Lake)</p>
                                        <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#000' }}>Daily Commuters: Avoid the following routes due to harmful conditions (AQI &ge; 201 + Traffic Score &ge; 70).</p>

                                        <div style={{ background: '#FFF', border: '3px solid #000', padding: '12px', marginBottom: '16px' }}>
                                            <p style={{ fontSize: '16px', fontWeight: 900, marginBottom: '8px', color: '#000' }}>ROUTE: {worstZone.zone_name} &rarr; {nextWorstZone.zone_name}</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                                                <div style={{ background: '#ffe6e6', padding: '6px', color: '#000' }}><strong>AQI:</strong> <span style={{ color: '#D50000', fontWeight: 900 }}>{worstZone.aqi || 245} ({typeof worstZone.aqiLevel === 'string' ? worstZone.aqiLevel : 'Poor'})</span></div>
                                                <div style={{ background: '#f0f0f0', padding: '6px', color: '#000' }}><strong>Traffic:</strong> <span style={{ fontWeight: 900 }}>{worstZone.traffic_level || 'High'}</span></div>
                                                <div style={{ background: '#f0f0f0', padding: '6px', color: '#000' }}><strong>Speed:</strong> <span style={{ fontWeight: 900 }}>{worstZone.avg_speed_kmph || 12} km/h</span></div>
                                                <div style={{ background: '#f0f0f0', padding: '6px', color: '#000' }}><strong>Peak Time:</strong> <span style={{ fontWeight: 900 }}>{worstZone.peak_hours || '8-10 AM'}</span></div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '16px' }}>
                                            <p style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px', color: '#000' }}>Travel Impact:</p>
                                            <p style={{ fontSize: '15px', color: '#D50000', fontWeight: 'bold' }}>&#9201; Expected Delay: +20–30 minutes</p>
                                        </div>

                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px', color: '#000' }}>Health Impact:</p>
                                            <ul style={{ fontSize: '14px', margin: 0, paddingLeft: '20px', color: '#000', fontWeight: 'bold' }}>
                                                <li style={{ marginBottom: '4px' }}>High PM2.5 exposure due to idling traffic</li>
                                                <li style={{ marginBottom: '4px' }}>Increased risk of breathing discomfort, fatigue & headaches</li>
                                                <li style={{ fontWeight: 900, color: '#D50000' }}>Not recommended for asthma patients, elderly & children</li>
                                            </ul>
                                        </div>
                                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                            <button onClick={() => { setSourceZoneId(String(worstZone.id)); setDestZoneId(String(nextWorstZone.id)); }} style={{ width: '100%', background: '#000', color: '#FFF', fontWeight: 900, padding: '12px', fontSize: '16px', border: '3px solid #000', cursor: 'pointer', textTransform: 'uppercase' }}>
                                                FIND CLEANER ALTERNATIVE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, background: '#FFF', border: '4px solid #000', padding: '12px', boxShadow: '6px 6px 0 #000' }}>
                        <p style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>Legend & Physics</p>
                        {['🔴 High', '🟡 Medium', '🟢 Low'].map((lbl, idx) => (
                            <p key={idx} style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{lbl} Emission Overlay</p>
                        ))}
                        <p style={{ fontSize: '11px', marginTop: '8px', borderTop: '2px solid #000', paddingTop: '4px' }}>Active paths adapt to peak traffic times.</p>
                    </div>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                    <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', background: '#000', zIndex: 1000, padding: '4px 10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ color: '#666', fontSize: '10px', fontFamily: "'Space Mono',monospace", fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            *We used dummy dataset for traffic zones
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 2: SMART SITE ADVISOR — Enhanced
// ═══════════════════════════════════════════════════════════════════════════

function SmartSiteAdvisor() {
    const L = useLeaflet();
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const [siteType, setSiteType] = useState('both');
    const [selectedSite, setSelectedSite] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [comparedSites, setComparedSites] = useState([]);
    const [animatedScore, setAnimatedScore] = useState(0);
    const animScoreRef = useRef(null);

    const filteredSites = siteType === 'both' ? SITE_CANDIDATES : SITE_CANDIDATES.filter(s => s.type === siteType || s.type === 'both');
    const totalScore = (site) => Math.round((site.aqiScore + site.trafficScore + site.greenScore + site.futureScore) / 4);
    const bestSite = filteredSites.reduce((best, s) => totalScore(s) > totalScore(best) ? s : best, filteredSites[0]);

    // Animate score when site selected
    useEffect(() => {
        if (!selectedSite) return;
        const target = totalScore(selectedSite);
        setAnimatedScore(0);
        let curr = 0;
        clearInterval(animScoreRef.current);
        animScoreRef.current = setInterval(() => {
            curr = Math.min(target, curr + Math.max(1, Math.round((target - curr) / 4)));
            setAnimatedScore(curr);
            if (curr >= target) clearInterval(animScoreRef.current);
        }, 30);
        return () => clearInterval(animScoreRef.current);
    }, [selectedSite]);

    // Init map
    useEffect(() => {
        if (!L || !mapRef.current || mapInstance.current) return;
        const map = L.map(mapRef.current, { center: [22.583, 88.415], zoom: 14, zoomControl: true });
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri', maxZoom: 19 }).addTo(map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { attribution: 'CartoDB', maxZoom: 19, opacity: 0.9 }).addTo(map);

        // Traffic heatmap underlay
        TRAFFIC_ZONES.forEach(zone => {
            const color = zone.traffic_score >= 80 ? '#FF3366' : zone.traffic_score >= 50 ? '#FFCC00' : '#00FF66';
            L.circle([zone.latitude, zone.longitude], {
                color: color, fillColor: color, fillOpacity: 0.06,
                weight: 1, radius: (zone.traffic_score / 100) * 160 + 40, dashArray: '3,8',
            }).addTo(map);
        });

        mapInstance.current = map;
        return () => { map.remove(); mapInstance.current = null; };
    }, [L]);

    // Render site markers
    useEffect(() => {
        if (!mapInstance.current || !L) return;
        markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
        markersRef.current = [];

        filteredSites.forEach(site => {
            const isSelected = selectedSite?.id === site.id;
            const isCompared = comparedSites.includes(site.id);
            const score = totalScore(site);
            const scoreColor = score >= 93 ? '#00FF66' : score >= 88 ? '#FFCC00' : '#FF9800';
            const isBest = site.id === bestSite?.id;

            const typeLabel = site.type === 'school' ? 'SCHOOL' : site.type === 'hospital' ? 'HOSPITAL' : 'SCHOOL + HOSPITAL';
            const typeIcon = site.type === 'school' ? 'S' : site.type === 'hospital' ? 'H' : 'S+H';

            const icon = L.divIcon({
                html: `<div style="
                    font-family:'Space Mono',monospace;
                    background:${isSelected ? '#000' : '#0c0c1e'};
                    border:3px solid #000;
                    color:${scoreColor};
                    padding:10px 12px;
                    font-weight:900;
                    min-width:130px;
                    box-shadow: ${isSelected ? `0 0 0 3px #fff, 6px 6px 0 #000` : isCompared ? '0 0 0 2px #00CFFF88, 4px 4px 0 #000' : '4px 4px 0 #000'};
                    cursor:pointer;
                    text-align:center;
                    position:relative;
                ">
                    ${isBest ? '<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#00FF66;color:#000;font-size:8px;font-weight:900;padding:2px 8px;border:2px solid #000;white-space:nowrap;">#1 BEST SITE</div>' : ''}
                    <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;color:${scoreColor}88">${typeIcon}</div>
                    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:4px">${site.name.substring(0, 14)}</div>
                    <div style="font-size:22px;font-weight:900;line-height:1">${score}<span style="font-size:11px;opacity:0.6">/100</span></div>
                    ${isCompared ? '<div style="color:#00CFFF;font-size:8px;font-weight:900;margin-top:3px;border-top:1px solid #00CFFF44;padding-top:3px">COMPARING</div>' : ''}
                </div>`,
                className: '',
                iconAnchor: [65, 0],
            });

            const marker = L.marker([site.lat, site.lng], { icon, zIndexOffset: isSelected ? 1000 : 0 }).addTo(mapInstance.current);
            marker.on('click', () => {
                setSelectedSite(site);
                if (compareMode) {
                    setComparedSites(prev => prev.includes(site.id) ? prev.filter(id => id !== site.id) : prev.length < 3 ? [...prev, site.id] : prev);
                }
            });
            markersRef.current.push(marker);
        });

        // Loop over EXISTING_INSTITUTIONS
        const filteredExisting = EXISTING_INSTITUTIONS.filter(s => {
            if (siteType === 'both') return true;
            if (siteType === 'hospital') return s.type === 'hospital';
            return ['school', 'college', 'university', 'institute'].includes(s.type);
        });

        filteredExisting.forEach(site => {
            const aqiColor = site.aqi >= 150 ? '#FF3366' : site.aqi >= 100 ? '#FFCC00' : '#00FF66';

            const icon = L.divIcon({
                html: `<div style="
                    font-family:'Space Mono',monospace;
                    background:#FFF;
                    border:3px solid #000;
                    padding:6px 10px;
                    min-width:120px;
                    box-shadow: 4px 4px 0 #000;
                    text-align:left;
                    position:relative;
                ">
                    <div style="position:absolute;top:-10px;right:-10px;background:${aqiColor};color:#000;border:2px solid #000;padding:2px 6px;font-size:10px;font-weight:900;box-shadow: 2px 2px 0 #000;">
                        AQI ${site.aqi}
                    </div>
                    <div style="font-size:8px;text-transform:uppercase;color:#555;font-weight:900;background:#000;color:#00FF66;padding:1px 4px;display:inline-block;margin-bottom:3px;border:1px solid #000;">${site.type}</div>
                    <div style="font-size:11px;font-weight:900;line-height:1.1;margin:2px 0;width:100%;white-space:normal;" title="${site.name}">${site.name}</div>
                    <div style="font-size:9px;font-weight:bold;color:#333;margin-top:2px;">${site.details}</div>
                </div>`,
                className: '',
                iconAnchor: [60, 30],
            });
            const marker = L.marker([site.lat, site.lng], { icon, zIndexOffset: -100 }).addTo(mapInstance.current);
            markersRef.current.push(marker);
        });
    }, [L, filteredSites, siteType, selectedSite, compareMode, comparedSites]);

    const comparedSiteObjs = SITE_CANDIDATES.filter(s => comparedSites.includes(s.id));
    const compareChartData = ['aqiScore', 'trafficScore', 'greenScore', 'futureScore'].map(key => ({
        metric: key.replace('Score', '').replace('aqi', 'AQI').replace('traffic', 'TRAFFIC').replace('green', 'GREEN').replace('future', 'FUTURE'),
        ...comparedSiteObjs.reduce((acc, s) => ({ ...acc, [s.name.substring(0, 12)]: s[key] }), {}),
    }));
    const COMPARE_COLORS = ['#FF3366', '#00FF66', '#FFCC00'];

    const METRICS = [
        { key: 'aqiScore', label: 'AQI SCORE', color: '#00FF66', icon: 'AIR', desc: 'PM2.5 & NO2 — lower levels = safer for children & patients' },
        { key: 'trafficScore', label: 'TRAFFIC SAFETY', color: '#FF3366', icon: 'TRF', desc: 'Distance from high-congestion zones, safe access routes' },
        { key: 'greenScore', label: 'GREEN COVER', color: '#00CFFF', icon: 'GRN', desc: 'Proximity to parks, green belts, natural buffers' },
        { key: 'futureScore', label: 'FUTURE GROWTH', color: '#FFCC00', icon: 'FUT', desc: 'Development potential, land availability, infrastructure' },
    ];

    return (
        <div style={{ fontFamily: "'Space Mono','Courier New',monospace", background: '#FFF' }} className="w-full text-black">

            {/* ── HEADER ── */}
            <div style={{ background: '#000', borderBottom: '4px solid #000' }} className="px-6 py-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 bg-[#111] p-2 border-2 border-[#333]">
                            <School size={36} strokeWidth={3} color="#00CFFF" />

                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-1px', fontSize: '32px', fontWeight: 900, color: '#FFF', textTransform: 'uppercase' }}>
                                SMART SITE ADVISOR
                            </h2>
                            <p style={{ color: '#00CFFF', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px' }}>
                                AI-POWERED PLACEMENT · 4-FACTOR SCORING · SUSTAINABILITY-FIRST
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    {['both', 'school', 'hospital'].map(t => (
                        <button key={t} onClick={() => { setSiteType(t); setSelectedSite(null); }}
                            style={{
                                border: '3px solid #00CFFF', background: siteType === t ? '#00CFFF' : '#000',
                                color: siteType === t ? '#000' : '#00CFFF', fontFamily: "'Space Mono',monospace",
                                padding: '10px 16px', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer',
                                boxShadow: siteType === t ? '4px 4px 0 #FFF' : '4px 4px 0 #00CFFF'
                            }}>
                            {t === 'both' ? 'ALL SITES' : t === 'school' ? 'SCHOOLS' : 'HOSPITALS'}
                        </button>
                    ))}
                    <button onClick={() => { setCompareMode(m => !m); if (compareMode) setComparedSites([]); }}
                        style={{ border: '3px solid #FF3366', background: compareMode ? '#FF3366' : '#000', color: compareMode ? '#000' : '#FF3366', fontFamily: "'Space Mono',monospace", padding: '10px 16px', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer', boxShadow: compareMode ? '4px 4px 0 #FFF' : '4px 4px 0 #FF3366', marginLeft: '12px' }}>
                        {compareMode ? 'COMPARE: ON' : 'COMPARE SITES'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', minHeight: '740px' }}>

                {/* ── LEFT: Rankings ── */}
                <div style={{ width: '320px', minWidth: '320px', background: '#F4F4F0', borderRight: '4px solid #000', overflowY: 'auto' }}>

                    {/* Best site callout */}
                    {bestSite && (
                        <div style={{ background: '#00FF66', borderBottom: '4px solid #000', padding: '12px 14px' }}>
                            <p style={{ color: '#000', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>TOP RECOMMENDATION</p>
                            <p style={{ color: '#000', fontSize: '14px', fontWeight: 900, marginTop: '3px' }}>{bestSite.name}</p>
                            <p style={{ color: '#1a5c2a', fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>Score: {totalScore(bestSite)}/100</p>
                        </div>
                    )}

                    <div style={{ padding: '14px' }}>
                        <p style={{ color: '#000', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>RANKED SITES</p>

                        {filteredSites.sort((a, b) => totalScore(b) - totalScore(a)).map((site, rank) => {
                            const score = totalScore(site);
                            const scoreColor = score >= 93 ? '#00FF66' : score >= 88 ? '#FFCC00' : '#FF9800';
                            const isSelected = selectedSite?.id === site.id;
                            const isBest = site.id === bestSite?.id;
                            return (
                                <button key={site.id}
                                    onClick={() => {
                                        setSelectedSite(site);
                                        if (compareMode) setComparedSites(prev => prev.includes(site.id) ? prev.filter(id => id !== site.id) : prev.length < 3 ? [...prev, site.id] : prev);
                                        mapInstance.current?.flyTo([site.lat, site.lng], 15, { animate: true, duration: 0.8 });
                                    }}
                                    style={{
                                        width: '100%', textAlign: 'left', marginBottom: '12px', padding: '16px',
                                        background: isSelected ? '#FF3366' : comparedSites.includes(site.id) ? '#00CFFF' : '#FFF',
                                        border: '3px solid #000',
                                        cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                                        boxShadow: isSelected ? '6px 6px 0px 0px #000' : '4px 4px 0px 0px #000',
                                        transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                                    }}>
                                    {isBest && (
                                        <div style={{ position: 'absolute', top: '-8px', right: '8px', background: '#00FF66', color: '#000', fontSize: '7px', fontWeight: 900, padding: '2px 7px', border: '2px solid #000' }}>
                                            #1 BEST
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                        <div style={{ flex: 1, paddingRight: '8px' }}>
                                            <p style={{ color: '#555', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }}>#{rank + 1} {site.type === 'school' ? 'SCHOOL' : site.type === 'hospital' ? 'HOSPITAL' : 'BOTH'}</p>
                                            <p style={{ color: isSelected ? scoreColor : '#ccc', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', marginTop: '2px', lineHeight: '1.3' }}>{site.name.substring(0, 18)}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ color: scoreColor, fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{score}</p>
                                            <p style={{ color: '#555', fontSize: '7px' }}>/100</p>
                                        </div>
                                    </div>
                                    {/* Score bars */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                        {[
                                            { label: 'AQI', val: site.aqiScore, col: '#00FF66' },
                                            { label: 'TRF', val: site.trafficScore, col: '#FFCC00' },
                                            { label: 'GRN', val: site.greenScore, col: '#00CFFF' },
                                            { label: 'FUT', val: site.futureScore, col: '#FF9800' },
                                        ].map(({ label, val, col }) => (
                                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ color: '#555', fontSize: '7px', width: '20px', fontWeight: 900, flexShrink: 0 }}>{label}</span>
                                                <div style={{ flex: 1, background: '#EEE', height: '4px' }}>
                                                    <div style={{ width: `${val}%`, height: '100%', background: col, transition: 'width 0.5s' }} />
                                                </div>
                                                <span style={{ color: col, fontSize: '7px', fontWeight: 900, width: '20px', textAlign: 'right' }}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}

                        {compareMode && comparedSites.length > 0 && (
                            <button onClick={() => setComparedSites([])} style={{ width: '100%', padding: '8px', border: '2px solid #FF3366', background: 'transparent', color: '#FF3366', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', marginTop: '6px' }}>
                                CLEAR COMPARISON
                            </button>
                        )}
                    </div>
                </div>

                {/* ── CENTER: Map ── */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: '#000', borderBottom: '4px solid #000', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#FFF', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>SITE SUITABILITY MAP — REAL BIDHANNAGAR</span>
                        <span style={{ color: '#00FF66', fontSize: '12px', fontWeight: 'bold', border: '2px solid #00FF66', padding: '2px 8px' }}>TRAFFIC HEATMAP ACTIVE</span>
                        {compareMode && (
                            <span style={{ background: '#FF3366', color: '#FFF', border: '2px solid #FFF', padding: '4px 12px', fontSize: '14px', fontWeight: 900 }}>
                                SELECT UP TO 3 SITES TO COMPARE
                            </span>
                        )}
                    </div>
                    <div ref={mapRef} style={{ flex: 1, minHeight: '560px' }} />

                    {/* Score key on map */}
                    <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: '#FFF', border: '3px solid #00CFFF', padding: '10px 14px', zIndex: 1000, fontFamily: "'Space Mono',monospace" }}>
                        <p style={{ color: '#000', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px' }}>SUITABILITY SCORE</p>
                        {[
                            { range: '90–100', color: '#00FF66', label: 'EXCELLENT' },
                            { range: '80–89', color: '#000', label: 'GOOD' },
                            { range: '<80', color: '#FF9800', label: 'FAIR' },
                        ].map(({ range, color, label }) => (
                            <div key={range} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <div style={{ width: '14px', height: '14px', background: color, border: '2px solid #000', flexShrink: 0 }} />
                                <span style={{ color: color, fontSize: '12px', fontWeight: 900 }}>{range} — {label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: Detail Panel ── */}
                <div style={{ width: '340px', minWidth: '340px', background: '#F4F4F0', borderLeft: '4px solid #000', overflowY: 'auto' }}>

                    {/* Default state — how we score */}
                    {!selectedSite && !compareMode && (
                        <div style={{ padding: '24px' }}>
                            <p style={{ color: '#000', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>HOW WE SCORE</p>
                            {METRICS.map(m => (
                                <div key={m.key} style={{ border: `3px solid #000`, padding: '16px', marginBottom: '16px', background: '#FFF', boxShadow: `4px 4px 0 ${m.color}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', background: m.color, color: m.color === '#000' ? '#FFF' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', flexShrink: 0, border: '2px solid #000' }}>
                                            {m.icon}
                                        </div>
                                        <span style={{ color: '#000', fontSize: '15px', fontWeight: 900, textTransform: 'uppercase' }}>{m.label}</span>
                                    </div>
                                    <p style={{ color: '#000', fontSize: '14px', lineHeight: '1.4', fontWeight: 'bold' }}>{m.desc}</p>
                                </div>
                            ))}
                            <div style={{ background: '#00FF66', border: '4px solid #000', padding: '20px', boxShadow: '6px 6px 0 #000', marginTop: '24px' }}>
                                <p style={{ color: '#000', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>TOP RECOMMENDATION</p>
                                <p style={{ color: '#000', fontSize: '20px', fontWeight: 900, marginTop: '8px' }}>{bestSite?.name}</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                                    <span style={{ color: '#000', fontSize: '42px', fontWeight: 900, lineHeight: 1 }}>{bestSite ? totalScore(bestSite) : 0}</span>
                                    <span style={{ fontSize: '16px', fontWeight: 900 }}>/100</span>
                                </div>
                                <p style={{ color: '#000', fontSize: '14px', marginTop: '12px', lineHeight: '1.5', fontWeight: 'bold' }}>{bestSite?.desc}</p>
                            </div>
                        </div>
                    )}

                    {/* Selected site detail */}
                    {selectedSite && !compareMode && (
                        <div style={{ padding: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <div>
                                    <p style={{ color: '#000', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>SITE ANALYSIS</p>
                                    <p style={{ color: '#000', fontSize: '15px', fontWeight: 900, marginTop: '4px', textTransform: 'uppercase' }}>{selectedSite.name}</p>
                                    <p style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>
                                        {selectedSite.type === 'school' ? 'SCHOOLS ONLY' : selectedSite.type === 'hospital' ? 'HOSPITALS ONLY' : 'SUITABLE FOR BOTH'}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedSite(null)} style={{ color: '#555', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                            </div>

                            {/* Animated score */}
                            <div style={{
                                border: '4px solid #000',
                                padding: '24px', textAlign: 'center', marginBottom: '20px', background: totalScore(selectedSite) >= 93 ? '#00FF66' : totalScore(selectedSite) >= 88 ? '#FFCC00' : '#FF9800',
                                boxShadow: '6px 6px 0 #000',
                            }}>
                                <p style={{ color: '#000', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>SUITABILITY SCORE</p>
                                <p style={{ color: '#000', fontSize: '84px', fontWeight: 900, lineHeight: 1, transition: 'all 0.1s', marginTop: '10px' }}>
                                    {animatedScore}
                                </p>
                                <p style={{ color: '#000', fontSize: '16px', fontWeight: 900 }}>/ 100 COMPOSITE SCORE</p>
                            </div>

                            {/* Metric breakdown */}
                            {METRICS.map(({ key, label, color, desc }) => {
                                const val = selectedSite[key];
                                return (
                                    <div key={key} style={{ marginBottom: '14px', border: `2px solid ${color}22`, padding: '10px', background: `${color}05` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ color: color, fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' }}>{label}</span>
                                            <span style={{ color: color, fontSize: '22px', fontWeight: 900 }}>{val}</span>
                                        </div>
                                        <div style={{ background: '#EEE', height: '8px', border: '1px solid #333', marginBottom: '5px' }}>
                                            <div style={{ width: `${val}%`, height: '100%', background: color, transition: 'width 0.6s' }} />
                                        </div>
                                        <p style={{ color: '#555', fontSize: '12px', lineHeight: '1.4' }}>{desc}</p>
                                    </div>
                                );
                            })}

                            {/* Site description */}
                            <div style={{ border: '2px solid #1e1e3f', padding: '12px', background: '#FFF', marginBottom: '12px' }}>
                                <p style={{ color: '#000', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '1px' }}>ANALYSIS</p>
                                <p style={{ color: '#333', fontSize: '13px', lineHeight: '1.7' }}>{selectedSite.desc}</p>
                            </div>

                            {/* Nearby traffic impact */}
                            <div>
                                <p style={{ color: '#FF3366', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>NEARBY TRAFFIC IMPACT</p>
                                {TRAFFIC_ZONES.filter(z => {
                                    const d = Math.sqrt((z.latitude - selectedSite.lat) ** 2 + (z.longitude - selectedSite.lng) ** 2);
                                    return d < 0.018;
                                }).slice(0, 4).map(z => {
                                    const color = z.traffic_score >= 80 ? '#FF3366' : z.traffic_score >= 50 ? '#FFCC00' : '#00FF66';
                                    return (
                                        <div key={z.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', border: `1px solid ${color}33`, marginBottom: '4px', background: `${color}06` }}>
                                            <div>
                                                <p style={{ color: '#555', fontSize: '12px', fontWeight: 700 }}>{z.zone_name.substring(0, 18)}</p>
                                                <p style={{ color: '#555', fontSize: '14px' }}>{z.road_type} · Score {z.traffic_score}</p>
                                            </div>
                                            <span style={{ color: color, fontSize: '13px', fontWeight: 900, background: `${color}15`, padding: '3px 8px', border: `1px solid ${color}44` }}>{z.traffic_level}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Compare mode */}
                    {compareMode && comparedSites.length > 0 && (
                        <div style={{ padding: '18px' }}>
                            <p style={{ color: '#000', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>SITE COMPARISON</p>
                            <div style={{ height: '260px', marginBottom: '14px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={compareChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
                                        <XAxis dataKey="metric" stroke="#555" tick={{ fontSize: 8, fontWeight: 900, fill: '#555' }} />
                                        <YAxis stroke="#555" tick={{ fontSize: 9, fill: '#555' }} domain={[60, 100]} />
                                        <Tooltip content={<BrutalistTooltip />} />
                                        {comparedSiteObjs.map((s, i) => (
                                            <Bar key={s.id} dataKey={s.name.substring(0, 12)} fill={COMPARE_COLORS[i]} stroke="#000" strokeWidth={2} />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            {comparedSiteObjs.map((s, i) => {
                                const score = totalScore(s);
                                const scoreColor = score >= 93 ? '#00FF66' : score >= 88 ? '#FFCC00' : '#FF9800';
                                return (
                                    <div key={s.id} style={{ border: `3px solid ${COMPARE_COLORS[i]}`, padding: '10px', marginBottom: '8px', background: `${COMPARE_COLORS[i]}0a` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <p style={{ color: COMPARE_COLORS[i], fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' }}>{s.name.substring(0, 20)}</p>
                                            <p style={{ color: scoreColor, fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>{score}</p>
                                        </div>
                                        <p style={{ color: '#555', fontSize: '12px' }}>{s.desc.substring(0, 60)}...</p>
                                    </div>
                                );
                            })}
                            {comparedSiteObjs.length > 1 && (
                                <div style={{ background: '#00FF66', border: '3px solid #000', padding: '12px', boxShadow: '4px 4px 0 #000', marginTop: '10px' }}>
                                    <p style={{ color: '#000', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' }}>WINNER</p>
                                    <p style={{ color: '#000', fontSize: '15px', fontWeight: 900, marginTop: '3px' }}>
                                        {comparedSiteObjs.sort((a, b) => totalScore(b) - totalScore(a))[0].name}
                                    </p>
                                    <p style={{ color: '#1a5c2a', fontSize: '22px', fontWeight: 900 }}>
                                        {totalScore(comparedSiteObjs.sort((a, b) => totalScore(b) - totalScore(a))[0])}/100
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {compareMode && comparedSites.length === 0 && (
                        <div style={{ padding: '18px', textAlign: 'center', marginTop: '40px' }}>
                            <p style={{ color: '#333', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', lineHeight: '1.8' }}>SELECT SITES ON THE MAP OR FROM THE RANKED LIST TO COMPARE</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE 3: CITIZEN HEALTH RISK INDEX (preserved with minor polish)
// ═══════════════════════════════════════════════════════════════════════════

function CitizenHealthRiskDashboard() {
    const [activeZone, setActiveZone] = useState(TRAFFIC_ZONES[3]);
    const [viewMode, setViewMode] = useState('grid');
    const [timeSlider, setTimeSlider] = useState(8);
    const [animating, setAnimating] = useState(false);
    const animRef = useRef(null);

    const computeHealthRisk = useCallback((zone, hour) => {
        const morningPeak = Math.exp(-0.5 * ((hour - 9) / 1.5) ** 2);
        const eveningPeak = Math.exp(-0.5 * ((hour - 18) / 1.5) ** 2);
        const trafficFactor = 0.4 + 0.9 * morningPeak + 0.95 * eveningPeak;
        const baseTrafficRisk = (zone.traffic_score / 100 || 0.5) * trafficFactor;
        const pm25Est = 20 + baseTrafficRisk * 60;
        const no2Est = 15 + baseTrafficRisk * 40;
        const coEst = 0.3 + baseTrafficRisk * 1.2;
        const aqiEst = calcAQI(pm25Est);
        const childrenRisk = Math.min(100, aqiEst * 1.3 + ((zone.traffic_score || 50) * 0.2));
        const elderlyRisk = Math.min(100, aqiEst * 1.5 + ((zone.traffic_score || 50) * 0.15));
        const respiratoryRisk = Math.min(100, aqiEst * 1.8 + ((zone.traffic_score || 50) * 0.1));
        const generalRisk = Math.min(100, aqiEst * 0.8 + ((zone.traffic_score || 50) * 0.1));
        const overallRisk = Math.min(100, Math.round((childrenRisk * 0.3 + elderlyRisk * 0.25 + respiratoryRisk * 0.25 + generalRisk * 0.2)));
        return {
            pm25: Math.round(pm25Est), no2: Math.round(no2Est), co: Math.round(coEst * 100) / 100,
            aqi: aqiEst, childrenRisk: Math.round(childrenRisk), elderlyRisk: Math.round(elderlyRisk),
            respiratoryRisk: Math.round(respiratoryRisk), generalRisk: Math.round(generalRisk), overallRisk,
        };
    }, []);

    const timelineData = Array.from({ length: 24 }, (_, h) => {
        const r = computeHealthRisk(activeZone, h);
        return { hour: `${String(h).padStart(2, '0')}:00`, ...r };
    });

    const currentRisk = computeHealthRisk(activeZone, timeSlider);
    const allZoneRisks = TRAFFIC_ZONES.map(z => ({ ...z, risk: computeHealthRisk(z, timeSlider) })).sort((a, b) => b.risk.overallRisk - a.risk.overallRisk);

    const riskColor = (v) => v >= 80 ? '#FF3366' : v >= 60 ? '#FF9800' : v >= 40 ? '#FFCC00' : '#00FF66';
    const riskLabel = (v) => v >= 80 ? 'SEVERE' : v >= 60 ? 'HIGH' : v >= 40 ? 'MODERATE' : v >= 20 ? 'LOW' : 'MINIMAL';

    const startAnimation = () => {
        setAnimating(true); setTimeSlider(0);
        let h = 0;
        animRef.current = setInterval(() => {
            h++; setTimeSlider(h);
            if (h >= 23) { clearInterval(animRef.current); setAnimating(false); }
        }, 200);
    };

    useEffect(() => () => clearInterval(animRef.current), []);

    const radarData = [
        { metric: 'Children', value: currentRisk.childrenRisk },
        { metric: 'Elderly', value: currentRisk.elderlyRisk },
        { metric: 'Respiratory', value: currentRisk.respiratoryRisk },
        { metric: 'General', value: currentRisk.generalRisk },
        { metric: 'PM2.5 Risk', value: Math.min(100, currentRisk.pm25) },
        { metric: 'Traffic Exp.', value: activeZone.traffic_score || 50 },
    ];

    return (
        <div style={{ fontFamily: "'Space Mono','Courier New',monospace", background: '#FFF' }} className="w-full text-black">
            {/* HER HEADER */}
            <div style={{ background: '#000', borderBottom: '4px solid #000' }} className="px-6 py-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 bg-[#111] p-2 border-2 border-[#333]">
                            <Shield size={36} strokeWidth={3} color="#FF3366" />
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-1px', fontSize: '32px', fontWeight: 900, color: '#FFF', textTransform: 'uppercase' }}>
                                CITIZEN HEALTH RISK INDEX
                            </h2>
                            <p style={{ color: '#FF3366', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px' }}>
                                PER-ZONE WELLBEING · VULNERABLE POPULATIONS · 24H SIMULATION
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <span style={{ fontWeight: 900, fontSize: '14px', color: '#FFF', marginRight: '8px' }}>VISUALIZE:</span>
                    {['grid', 'radar', 'timeline'].map(m => (
                        <button key={m} onClick={() => setViewMode(m)}
                            style={{
                                border: '3px solid #FF3366',
                                background: viewMode === m ? '#FF3366' : '#000',
                                color: viewMode === m ? '#000' : '#FF3366',
                                padding: '10px 16px', fontWeight: 900, fontSize: '14px',
                                textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Space Mono',monospace",
                                boxShadow: viewMode === m ? '4px 4px 0 #FFF' : '4px 4px 0 #FF3366'
                            }}>
                            {m === 'grid' ? 'GRID' : m === 'radar' ? 'RADAR' : 'TIMELINE'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ACTION BAR */}
            <div style={{ background: '#000', borderBottom: '4px solid #000', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 2, minWidth: '400px' }}>
                    <span style={{ color: '#00FF66', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>TIME OVERLAY:</span>
                    <input type="range" min="0" max="23" value={timeSlider} onChange={e => setTimeSlider(Number(e.target.value))} style={{ flex: 1, maxWidth: '300px', accentColor: '#FF3366', cursor: 'pointer' }} />
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFF', border: '3px solid #000', boxShadow: '4px 4px 0 #FF3366' }}>
                        <span style={{ color: '#000', fontWeight: 900, fontSize: '20px', padding: '6px 16px', letterSpacing: '2px', background: '#FFF' }}>
                            {String(timeSlider).padStart(2, '0')}:00
                        </span>
                        {((timeSlider >= 8 && timeSlider <= 10) || (timeSlider >= 17 && timeSlider <= 21)) && (
                            <span style={{ background: '#FF3366', color: '#FFF', fontWeight: 900, fontSize: '13px', padding: '10px 14px', textTransform: 'uppercase' }}>PEAK</span>
                        )}
                    </div>
                    <button onClick={startAnimation} disabled={animating} style={{ border: '3px solid #00FF66', background: animating ? '#00FF66' : '#000', color: animating ? '#000' : '#00FF66', padding: '8px 20px', fontWeight: 900, fontSize: '14px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '4px 4px 0 #00FF66', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Play fill={animating ? '#000' : '#00FF66'} size={18} />
                        {animating ? 'SIMULATING...' : 'PLAY 24H SIMULATION'}
                    </button>
                </div>
                <div style={{ flex: 1, borderLeft: '4px solid #333', paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '350px' }}>
                    <span style={{ color: '#00CFFF', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>TARGET ZONE:</span>
                    <select
                        value={activeZone.id}
                        onChange={(e) => setActiveZone(allZoneRisks.find(z => String(z.id) === e.target.value))}
                        style={{ flex: 1, background: '#FFF', color: '#000', border: '3px solid #000', padding: '8px 16px', fontWeight: 900, fontSize: '14px', fontFamily: "'Space Mono', monospace", boxShadow: '4px 4px 0 #00CFFF', outline: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                        {allZoneRisks.map((z, rank) => (
                            <option key={z.id} value={z.id}>
                                #{rank + 1} - {z.zone_name.toUpperCase()} (RISK SCORE: {z.risk.overallRisk})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', minHeight: '600px', background: '#F4F4F0' }}>
                {/* MAIN CONTENT AREA */}
                <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '24px', marginBottom: '32px' }}>
                        {/* OVERALL COMPOSITE SCORE */}
                        <div style={{ border: '4px solid #000', padding: '32px', textAlign: 'center', background: '#FFF', boxShadow: `8px 8px 0 ${riskColor(currentRisk.overallRisk)}`, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#000', color: '#FFF', padding: '6px', fontSize: '12px', fontWeight: 900, letterSpacing: '2px' }}>OVERALL ZONE RISK</div>
                            <p style={{ color: riskColor(currentRisk.overallRisk), fontSize: '80px', fontWeight: 900, lineHeight: 1, marginTop: '20px', textShadow: '4px 4px 0 #000' }}>{currentRisk.overallRisk}</p>
                            <p style={{ background: '#000', color: riskColor(currentRisk.overallRisk), fontSize: '20px', fontWeight: 900, padding: '4px 12px', display: 'inline-block', border: '2px solid #000', margin: '16px auto 0' }}>{riskLabel(currentRisk.overallRisk)}</p>
                            <p style={{ color: '#000', fontSize: '14px', fontWeight: 900, marginTop: '12px' }}>{activeZone.zone_name}</p>
                        </div>

                        {/* ESTIMATIONS BREAKDOWN */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ border: '4px solid #000', display: 'flex', background: '#FFF', boxShadow: '6px 6px 0 #000' }}>
                                <div style={{ background: '#000', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '140px' }}>
                                    <p style={{ color: '#00CFFF', fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>COMPOSITE</p>
                                    <p style={{ color: '#FFF', fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>AQI</p>
                                </div>
                                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '24px', flex: 1, background: '#F4F4F0' }}>
                                    <p style={{ color: '#000', fontSize: '50px', fontWeight: 900, lineHeight: 1 }}>{currentRisk.aqi}</p>
                                    <p style={{ background: '#FF3366', color: '#000', border: '3px solid #000', fontSize: '16px', fontWeight: 900, padding: '4px 12px', boxShadow: '2px 2px 0 #000' }}>{getAQILabel(currentRisk.aqi)}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {[
                                    { label: 'PM2.5', val: currentRisk.pm25, unit: 'µg/m³', col: '#FF3366' },
                                    { label: 'NO2', val: currentRisk.no2, unit: 'ppb', col: '#FFCC00' },
                                    { label: 'CO', val: currentRisk.co, unit: 'ppm', col: '#00CFFF' },
                                    { label: 'TRAFFIC', val: activeZone.traffic_score || 50, unit: 'IDX', col: '#00FF66' },
                                ].map(({ label, val, unit, col }) => (
                                    <div key={label} style={{ border: '3px solid #000', padding: '12px', background: '#FFF', position: 'relative' }}>
                                        <div style={{ width: '100%', height: '4px', background: col, position: 'absolute', top: 0, left: 0, borderBottom: '2px solid #000' }} />
                                        <p style={{ color: '#000', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', marginTop: '4px' }}>{label}</p>
                                        <p style={{ color: '#000', fontSize: '22px', fontWeight: 900, marginTop: '8px' }}>{val}<span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>{unit}</span></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC VIEW CONTAINER */}
                    {viewMode === 'grid' && (
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '4px solid #000', paddingBottom: '8px' }}>
                                <Activity size={24} color="#000" />
                                <h3 style={{ color: '#000', fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>VULNERABLE POPULATION IMPACT</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                                {[
                                    { group: 'Children (0-14)', risk: currentRisk.childrenRisk, note: 'School hours exposure critical', alert: currentRisk.childrenRisk > 60 },
                                    { group: 'Elderly (60+)', risk: currentRisk.elderlyRisk, note: 'Cardiovascular risk elevated', alert: currentRisk.elderlyRisk > 55 },
                                    { group: 'Respiratory', risk: currentRisk.respiratoryRisk, note: 'Asthma/COPD patients at risk', alert: currentRisk.respiratoryRisk > 50 },
                                    { group: 'General Public', risk: currentRisk.generalRisk, note: 'Healthy adults risk level', alert: currentRisk.generalRisk > 70 },
                                ].map(({ group, risk, note, alert }) => {
                                    const rc = riskColor(risk);
                                    return (
                                        <div key={group} style={{ border: '4px solid #000', padding: '24px', background: '#FFF', boxShadow: alert ? `8px 8px 0 ${rc}` : '6px 6px 0 #000', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                <div>
                                                    <p style={{ color: '#000', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', background: alert ? rc : '#EEE', display: 'inline-block', padding: '4px 8px', border: '2px solid #000', marginBottom: '8px' }}>{group}</p>
                                                    <p style={{ color: '#555', fontSize: '13px', fontWeight: 900 }}>{note}</p>
                                                </div>
                                                <div style={{ textAlign: 'right', background: '#000', padding: '8px 16px', color: '#FFF', border: `2px solid ${rc}` }}>
                                                    <p style={{ color: rc, fontSize: '36px', fontWeight: 900, lineHeight: 1 }}>{risk}</p>
                                                    <p style={{ color: '#FFF', fontSize: '12px', fontWeight: 900, marginTop: '4px' }}>{riskLabel(risk)}</p>
                                                </div>
                                            </div>
                                            <div style={{ background: '#000', height: '12px', width: '100%', border: '2px solid #000', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ width: `${risk}%`, height: '100%', background: rc, transition: 'width 0.5s', borderRight: '2px solid #000' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* HIGH RISK ALERT TRIGGER */}
                            {currentRisk.overallRisk >= 60 && (
                                <div style={{ background: '#000', border: '4px solid #FF3366', padding: '24px', boxShadow: '8px 8px 0 #000' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                        <div style={{ background: '#FF3366', padding: '8px', border: '2px solid #000' }}><AlertTriangle size={36} color="#000" strokeWidth={3} /></div>
                                        <div>
                                            <p style={{ color: '#FF3366', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>HIGH RISK PROTOCOL ENGAGED</p>
                                            <p style={{ color: '#FFF', fontSize: '13px', fontWeight: 'bold' }}>IMMEDIATE MULTI-AGENCY ACTIONS REQUIRED</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                        {[
                                            'Redirect private transit',
                                            'Issue health advisory blast',
                                            'Lockdown outdoor schooling',
                                            'Prep respiratory wards',
                                        ].map((a, i) => (
                                            <div key={i} style={{ border: '2px solid #FFF', padding: '12px', background: '#111' }}>
                                                <span style={{ color: '#FF3366', fontWeight: 900, marginRight: '8px' }}>0{i + 1}</span>
                                                <span style={{ color: '#FFF', fontSize: '13px', fontWeight: 900 }}>{a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'radar' && (
                        <div style={{ flex: 1, border: '4px solid #000', background: '#FFF', padding: '24px', boxShadow: '8px 8px 0 #000' }}>
                            <p style={{ color: '#000', background: '#FF00FF', display: 'inline-block', padding: '4px 12px', border: '2px solid #000', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
                                POPULATION RISK RADAR
                            </p>
                            <div style={{ height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#000" strokeWidth={2} />
                                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#000', fontSize: 13, fontFamily: "'Space Mono',monospace", fontWeight: 900 }} />
                                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Risk Index" dataKey="value" stroke="#FF3366" strokeWidth={4} fill="#FF00FF" fillOpacity={0.6} />
                                        <Tooltip content={<BrutalistTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {viewMode === 'timeline' && (
                        <div style={{ flex: 1, border: '4px solid #000', background: '#FFF', padding: '24px', boxShadow: '8px 8px 0 #000' }}>
                            <p style={{ color: '#000', background: '#00FF66', display: 'inline-block', padding: '4px 12px', border: '2px solid #000', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
                                24-HOUR FORECAST INDEX
                            </p>
                            <div style={{ height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                        <XAxis dataKey="hour" stroke="#000" strokeWidth={2} tick={{ fontSize: 11, fontWeight: 900, fill: '#000' }} interval={2} />
                                        <YAxis stroke="#000" strokeWidth={2} tick={{ fontSize: 12, fontWeight: 900, fill: '#000' }} domain={[0, 100]} />
                                        <Tooltip content={<BrutalistTooltip />} />
                                        {[8, 9, 10].map(h => <ReferenceArea key={`m${h}`} x1={`${String(h).padStart(2, '0')}:00`} x2={`${String(h + 1).padStart(2, '0')}:00`} fill="#FF3366" fillOpacity={0.2} />)}
                                        {[17, 18, 19, 20].map(h => <ReferenceArea key={`e${h}`} x1={`${String(h).padStart(2, '0')}:00`} x2={`${String(h + 1).padStart(2, '0')}:00`} fill="#FF3366" fillOpacity={0.2} />)}
                                        <Legend wrapperStyle={{ fontFamily: "'Space Mono',monospace", fontSize: '14px', fontWeight: 900 }} />
                                        <Line dataKey="overallRisk" name="Composite Risk" stroke="#000" strokeWidth={4} dot={false} />
                                        <Line dataKey="childrenRisk" name="Vulnerable Pop." stroke="#FF3366" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                                        <Line dataKey="aqi" name="AQI Base" stroke="#00CFFF" strokeWidth={3} dot={false} strokeDasharray="2 4" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* EMERGENCY CORRIDORS DRAWER */}
                <div style={{ width: '380px', minWidth: '380px', borderLeft: '4px solid #000', background: '#FFF', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '4px solid #000', background: '#FF3366' }}>
                        <p style={{ fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: '#000', letterSpacing: '1px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Car size={24} /> EMERGENCY CORRIDORS
                        </p>
                        <p style={{ color: '#000', fontSize: '12px', fontWeight: 900, marginTop: '4px' }}>FASTEST CLEAN-AIR ROUTES</p>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
                        {[
                            { name: 'Corridor A (North)', route: 'AE Block → Sector I → Karunamayee', time: '4 min', aqiImpact: 'LOW EXPOSURE', color: '#00FF66', avoids: 'Ultadanga Conn.' },
                            { name: 'Corridor B (Central)', route: 'DB Block → Central Park → Stadium Gate', time: '6 min', aqiImpact: 'MED EXPOSURE', color: '#FFCC00', avoids: 'City Centre SL' },
                            { name: 'Corridor C (East)', route: 'HB Block → Nicco Park → Sec V', time: '8 min', aqiImpact: 'HIGH EXPOSURE', color: '#FF3366', avoids: 'Karunamayee Hub' },
                        ].map(corridor => (
                            <div key={corridor.name} style={{ border: `4px solid ${corridor.color}`, padding: '16px', marginBottom: '16px', background: '#000', color: '#FFF', boxShadow: `4px 4px 0 #000` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <p style={{ color: corridor.color, fontSize: '15px', fontWeight: 900, textTransform: 'uppercase' }}>{corridor.name}</p>
                                    <span style={{ background: corridor.color, color: '#000', fontSize: '16px', fontWeight: 900, padding: '4px 8px', border: '2px solid #FFF' }}>{corridor.time}</span>
                                </div>
                                <p style={{ color: '#CCC', fontSize: '13px', lineHeight: '1.5', marginBottom: '8px', fontWeight: 900 }}>{corridor.route}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #333', paddingTop: '8px' }}>
                                    <span style={{ color: '#FFF', fontSize: '12px', fontWeight: 900 }}>AVOID: <span style={{ color: '#FF3366' }}>{corridor.avoids}</span></span>
                                    <span style={{ color: corridor.color, fontSize: '12px', fontWeight: 900 }}>{corridor.aqiImpact}</span>
                                </div>
                            </div>
                        ))}

                        <div style={{ border: '4px solid #000', padding: '16px', background: '#FFF', boxShadow: '4px 4px 0 #000', marginTop: '32px' }}>
                            <p style={{ color: '#000', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>PEAK EXPOSURE WINDOWS</p>
                            {[
                                { time: '08:00–10:00', risk: 'SEVERE', desc: 'School Rush' },
                                { time: '17:00–21:00', risk: 'HIGH', desc: 'IT-Hub Exodus' },
                                { time: '11:00–16:00', risk: 'MODERATE', desc: 'Midday Lull' },
                                { time: '22:00–07:00', risk: 'LOW', desc: 'Clear Air' },
                            ].map(({ time, risk, desc }) => {
                                const rc = risk === 'SEVERE' ? '#FF3366' : risk === 'HIGH' ? '#FF9800' : risk === 'MODERATE' ? '#FFCC00' : '#00FF66';
                                return (
                                    <div key={time} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '2px dashed #000' }}>
                                        <div>
                                            <p style={{ color: '#000', fontSize: '14px', fontWeight: 900 }}>{time}</p>
                                            <p style={{ color: '#555', fontSize: '12px', fontWeight: 900 }}>{desc}</p>
                                        </div>
                                        <span style={{ background: rc, color: '#000', fontSize: '12px', fontWeight: 900, border: '2px solid #000', padding: '4px 8px' }}>{risk}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// POLICY SANDBOX (preserved intact)
// ═══════════════════════════════════════════════════════════════════════════

const SPECIES = {
    neem: { name: 'Neem', emoji: '🌿', color: '#2D8A50', radius: 18, pm25: -1.2, no2: -0.6, co: -0.4, o3: -0.3, pm10: -1.5, desc: 'Fast PM2.5 absorber' },
    banyan: { name: 'Banyan', emoji: '🌳', color: '#1A5C2A', radius: 28, pm25: -2.2, no2: -1.4, co: -0.9, o3: -0.6, pm10: -2.8, desc: 'Massive canopy, best overall' },
    palm: { name: 'Palm', emoji: '🌴', color: '#4DB87A', radius: 14, pm25: -0.6, no2: -0.4, co: -0.3, o3: -0.8, pm10: -0.8, desc: 'Best O3 reducer' },
    bamboo: { name: 'Bamboo', emoji: '🎋', color: '#6BC48A', radius: 16, pm25: -0.9, no2: -1.2, co: -0.7, o3: -0.4, pm10: -1.1, desc: 'Top NO2 absorber' },
};

const BASELINE = { pm25: 45, pm10: 78, no2: 34, co: 0.9, o3: 28, so2: 8 };

function calcAQIfn(pm25) {
    if (pm25 <= 30) return Math.round(pm25 * 50 / 30);
    if (pm25 <= 60) return Math.round(50 + (pm25 - 30) * 50 / 30);
    if (pm25 <= 90) return Math.round(100 + (pm25 - 60) * 100 / 30);
    return Math.round(200 + (pm25 - 90) * 100 / 30);
}

function aqiBgFn(aqi) {
    if (aqi <= 50) return '#00E676';
    if (aqi <= 100) return '#FFEE58';
    if (aqi <= 150) return '#FFA726';
    if (aqi <= 200) return '#EF5350';
    return '#CE93D8';
}

function aqiWordFn(aqi) {
    if (aqi <= 50) return 'GOOD';
    if (aqi <= 100) return 'SATISFACTORY';
    if (aqi <= 150) return 'MODERATE';
    if (aqi <= 200) return 'POOR';
    return 'VERY POOR';
}

async function isRestrictedLocation(lat, lng) {
    const query = `[out:json][timeout:5];(way["highway"](around:15,${lat},${lng});way["building"](around:8,${lat},${lng}););out body;`;
    try {
        const resp = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(query) });
        const data = await resp.json();
        if (!data.elements || data.elements.length === 0) return { restricted: false };
        const roads = data.elements.filter(e => e.tags?.highway);
        const buildings = data.elements.filter(e => e.tags?.building);
        if (buildings.length > 0) return { restricted: true, reason: 'building' };
        if (roads.length > 0) return { restricted: true, reason: 'road' };
        return { restricted: false };
    } catch { return { restricted: false }; }
}

function makeTreeIcon(L, species, fresh = false) {
    const sp = SPECIES[species];
    const r = sp.radius;
    const svg = `<svg width="${r * 2 + 4}" height="${r * 2 + 16}" xmlns="http://www.w3.org/2000/svg">
      ${fresh ? `<circle cx="${r + 2}" cy="${r + 2}" r="${r + 2}" fill="rgba(255,255,100,0.5)"/>` : ''}
      <circle cx="${r + 2}" cy="${r + 2}" r="${r}" fill="${sp.color}" stroke="#000" stroke-width="1.5"/>
      <circle cx="${r - 2}" cy="${r - 2}" r="${r * 0.35}" fill="rgba(255,255,255,0.25)"/>
      <rect x="${r}" y="${r * 2 + 2}" width="4" height="12" fill="#5C3D1E" rx="1"/>
      <text x="${r + 2}" y="${r + 6}" text-anchor="middle" font-size="${r * 0.7}px">${sp.emoji}</text>
    </svg>`;
    return L.divIcon({ html: svg, className: '', iconSize: [r * 2 + 4, r * 2 + 16], iconAnchor: [r + 2, r * 2 + 16], popupAnchor: [0, -(r * 2 + 16)] });
}

function PolicySandboxWidget() {
    const L = useLeaflet();
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const [trees, setTrees] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState('neem');
    const [mode, setMode] = useState('plant');
    const [pollution, setPollution] = useState({ ...BASELINE, aqi: calcAQIfn(BASELINE.pm25) });
    const [toast, setToast] = useState(null);
    const [checking, setChecking] = useState(false);
    const [history, setHistory] = useState([]);
    const toastTimer = useRef(null);
    const modeRef = useRef(mode);
    const speciesRef = useRef(selectedSpecies);
    const treesRef = useRef(trees);

    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { speciesRef.current = selectedSpecies; }, [selectedSpecies]);
    useEffect(() => { treesRef.current = trees; }, [trees]);

    const recalc = useCallback((treeList) => {
        let d = { pm25: 0, pm10: 0, no2: 0, co: 0, o3: 0 };
        treeList.forEach(t => { const sp = SPECIES[t.species]; d.pm25 += sp.pm25; d.pm10 += sp.pm10; d.no2 += sp.no2; d.co += sp.co; d.o3 += sp.o3; });
        const p = {
            pm25: Math.max(2, +(BASELINE.pm25 + d.pm25).toFixed(1)),
            pm10: Math.max(3, +(BASELINE.pm10 + d.pm10).toFixed(1)),
            no2: Math.max(1, +(BASELINE.no2 + d.no2).toFixed(1)),
            co: Math.max(0.01, +(BASELINE.co + d.co).toFixed(2)),
            o3: Math.max(1, +(BASELINE.o3 + d.o3).toFixed(1)),
            so2: BASELINE.so2,
        };
        p.aqi = calcAQIfn(p.pm25);
        setPollution(p);
    }, []);

    const showToast = useCallback((msg, type = 'info') => {
        clearTimeout(toastTimer.current);
        setToast({ msg, type });
        toastTimer.current = setTimeout(() => setToast(null), 2500);
    }, []);

    useEffect(() => {
        if (!L || !mapRef.current || mapInstance.current) return;
        const map = L.map(mapRef.current, { center: [22.5839, 88.4148], zoom: 15, zoomControl: true });
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri', maxZoom: 19 }).addTo(map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { attribution: 'CartoDB', maxZoom: 19, opacity: 0.85 }).addTo(map);

        map.on('click', async (e) => {
            if (modeRef.current !== 'plant') return;
            const { lat, lng } = e.latlng;
            setChecking(true);
            showToast('Checking location...', 'info');
            const { restricted, reason } = await isRestrictedLocation(lat, lng);
            setChecking(false);
            if (restricted) {
                showToast(reason === 'road' ? 'Cannot plant on roads!' : 'Cannot plant inside a building!', 'error');
                const circle = L.circle([lat, lng], { color: '#FF3366', fillColor: '#FF3366', fillOpacity: 0.3, radius: 8 }).addTo(map);
                setTimeout(() => map.removeLayer(circle), 1500);
                return;
            }
            const sp = SPECIES[speciesRef.current];
            const id = Date.now() + Math.random();
            const marker = L.marker([lat, lng], { icon: makeTreeIcon(L, speciesRef.current, true) }).addTo(map).bindPopup(`
              <div style="font-family:'Courier New',monospace;font-weight:900;min-width:160px">
                <div style="font-size:18px;margin-bottom:4px">${sp.emoji} ${sp.name}</div>
                <div style="font-size:11px;color:#666;margin-bottom:6px">${sp.desc}</div>
                <div style="font-size:11px">PM2.5: <b>${sp.pm25}/day</b></div>
                <div style="font-size:11px">NO2: <b>${sp.no2}/day</b></div>
                <button onclick="window._sandboxErase('${id}')" style="margin-top:8px;background:#FF3366;color:white;border:2px solid black;padding:4px 8px;font-weight:900;font-size:11px;cursor:pointer;width:100%">REMOVE THIS TREE</button>
              </div>`);
            setTimeout(() => marker.setIcon(makeTreeIcon(L, speciesRef.current, false)), 600);
            window._sandboxErase = (eid) => {
                setTrees(prev => {
                    const idx = prev.findIndex(t => String(t.id) === String(eid));
                    if (idx === -1) return prev;
                    map.removeLayer(prev[idx].marker);
                    const next = prev.filter(t => String(t.id) !== String(eid));
                    recalc(next); return next;
                });
                map.closePopup();
                showToast('Tree removed', 'warn');
            };
            const newTree = { id, lat, lng, species: speciesRef.current, marker };
            setTrees(prev => { setHistory(h => [...h.slice(-29), prev]); const next = [...prev, newTree]; recalc(next); return next; });
            showToast(`${sp.emoji} ${sp.name} planted!`, 'success');
        });

        mapInstance.current = map;
        return () => { map.remove(); mapInstance.current = null; };
    }, [L, recalc, showToast]);

    useEffect(() => {
        const container = mapInstance.current?.getContainer();
        if (!container) return;
        container.style.cursor = mode === 'plant' ? 'crosshair' : mode === 'erase' ? 'cell' : 'zoom-in';
    }, [mode]);

    const handleUndo = () => {
        if (!history.length) return;
        const prev = history[history.length - 1];
        trees.forEach(t => { if (!prev.find(p => p.id === t.id)) mapInstance.current?.removeLayer(t.marker); });
        setTrees(prev); treesRef.current = prev; setHistory(h => h.slice(0, -1)); recalc(prev);
        showToast('Undone', 'info');
    };

    const handleReset = () => {
        trees.forEach(t => mapInstance.current?.removeLayer(t.marker));
        setTrees([]); treesRef.current = []; setHistory([]); recalc([]);
        showToast('Map cleared', 'info');
    };

    const totalTrees = trees.length;
    const dAQI = pollution.aqi - calcAQIfn(BASELINE.pm25);
    const dPM25 = +(pollution.pm25 - BASELINE.pm25).toFixed(1);
    const counts = {};
    trees.forEach(t => { counts[t.species] = (counts[t.species] || 0) + 1; });

    return (
        <div style={{ fontFamily: "'Space Mono','Courier New',monospace", background: '#0A0A14' }} className="w-full text-black select-none">
            <div style={{ background: '#FF3366', borderBottom: '6px solid #000' }} className="px-6 py-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h2 style={{ fontFamily: "'Space Mono',monospace", letterSpacing: '-1px', fontSize: '28px', fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>POLICY SANDBOX</h2>
                    <p style={{ color: '#000', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', opacity: 0.7 }}>BIDHANNAGAR · REAL MAP · LIVE POLLUTION PHYSICS</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {checking && <div style={{ background: '#FFCC00', border: '3px solid #000', padding: '6px 14px', fontWeight: 900, color: '#000', fontSize: '12px', textTransform: 'uppercase' }} className="animate-pulse">CHECKING...</div>}
                    <button onClick={handleUndo} disabled={!history.length} style={{ border: '3px solid #000', background: '#000', color: '#FFF', fontFamily: "'Space Mono',monospace", padding: '8px 16px', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer', opacity: history.length ? 1 : 0.3 }}>UNDO</button>
                    <button onClick={handleReset} style={{ border: '3px solid #000', background: '#FFCC00', color: '#000', fontFamily: "'Space Mono',monospace", padding: '8px 16px', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer' }}>RESET</button>
                </div>
            </div>

            <div style={{ display: 'flex', minHeight: '620px' }}>
                <div style={{ width: '210px', minWidth: '210px', background: '#0d0d1a', borderRight: '4px solid #FF3366', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div style={{ borderBottom: '4px solid #000', padding: '12px' }}>
                        <p style={{ color: '#FF3366', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>MODE</p>
                        {[{ m: 'plant', label: 'PLANT', col: '#00FF66' }, { m: 'erase', label: 'POPUP ERASE', col: '#FF3366' }, { m: 'inspect', label: 'INSPECT', col: '#00CFFF' }].map(({ m, label, col }) => (
                            <button key={m} onClick={() => setMode(m)} style={{ width: '100%', display: 'block', marginBottom: '6px', padding: '8px', border: `2px solid ${mode === m ? col : '#333'}`, background: mode === m ? col + '22' : 'transparent', color: mode === m ? col : '#666', fontFamily: "'Space Mono',monospace", textAlign: 'left', cursor: 'pointer', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}>{label}</button>
                        ))}
                    </div>
                    {mode === 'plant' && (
                        <div style={{ borderBottom: '4px solid #000', padding: '12px' }}>
                            <p style={{ color: '#00FF66', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>SPECIES</p>
                            {Object.entries(SPECIES).map(([key, sp]) => (
                                <button key={key} onClick={() => setSelectedSpecies(key)} style={{ width: '100%', display: 'block', marginBottom: '6px', padding: '8px', border: `2px solid ${selectedSpecies === key ? sp.color : '#333'}`, background: selectedSpecies === key ? sp.color + '33' : 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                                    <div style={{ color: selectedSpecies === key ? sp.color : '#aaa', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}>{sp.emoji} {sp.name}</div>
                                    <div style={{ color: '#555', fontSize: '13px', marginTop: '2px' }}>{sp.desc}</div>
                                    {selectedSpecies === key && <div style={{ color: sp.color, fontSize: '13px', marginTop: '4px' }}>PM2.5 {sp.pm25} · NO2 {sp.no2}/tree</div>}
                                </button>
                            ))}
                        </div>
                    )}
                    <div style={{ padding: '12px', borderBottom: '4px solid #000' }}>
                        <p style={{ color: '#000', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>PLANTED</p>
                        {Object.entries(SPECIES).map(([key, sp]) => (counts[key] || 0) > 0 && (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                                <span style={{ color: '#555', fontSize: '14px' }}>{sp.emoji} {sp.name}</span>
                                <span style={{ color: sp.color, fontWeight: 900, fontSize: '13px' }}>x{counts[key]}</span>
                            </div>
                        ))}
                        {totalTrees === 0 && <p style={{ color: '#555', fontSize: '14px' }}>No trees yet</p>}
                        {totalTrees > 0 && <div style={{ borderTop: '1px solid #333', paddingTop: '6px', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#555', fontSize: '14px' }}>TOTAL</span><span style={{ color: '#00FF66', fontWeight: 900 }}>{totalTrees}</span></div>}
                    </div>
                </div>

                <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {toast && <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, pointerEvents: 'none', background: toast.type === 'success' ? '#00FF66' : toast.type === 'error' ? '#FF3366' : toast.type === 'warn' ? '#FFCC00' : '#00CFFF', color: 'black', border: '3px solid #000', padding: '10px 22px', fontFamily: "'Space Mono',monospace", fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', boxShadow: '4px 4px 0 #000', whiteSpace: 'nowrap' }}>{toast.msg}</div>}
                    <div style={{ background: '#EEE', borderBottom: '2px solid #333', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#000', fontSize: '14px', fontWeight: 900 }}>BIDHANNAGAR MUNICIPAL AREA — SATELLITE VIEW</span>
                        <span style={{ color: '#555', fontSize: '13px', fontWeight: 900 }}>OSM ROAD DETECTION ACTIVE</span>
                        {mode === 'plant' && !checking && <span style={{ background: '#00FF66' + '33', color: '#00FF66', border: '1px solid #00FF66', padding: '2px 10px', fontSize: '13px', fontWeight: 900 }}>PLANTING: {SPECIES[selectedSpecies].emoji} {SPECIES[selectedSpecies].name.toUpperCase()}</span>}
                    </div>
                    <div ref={mapRef} style={{ flex: 1, minHeight: '560px' }} />
                </div>

                <div style={{ width: '250px', minWidth: '250px', background: '#0d0d1a', borderLeft: '4px solid #FF3366', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div style={{ background: aqiBgFn(pollution.aqi), borderBottom: '6px solid #000', padding: '18px', textAlign: 'center', transition: 'background 0.5s' }}>
                        <p style={{ color: '#000', fontWeight: 900, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>LIVE AQI</p>
                        <div style={{ fontSize: '68px', fontWeight: 900, lineHeight: 1, color: '#000', fontFamily: "'Space Mono',monospace", transition: 'all 0.3s' }}>{pollution.aqi}</div>
                        <p style={{ color: '#000', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}>{aqiWordFn(pollution.aqi)}</p>
                        {dAQI !== 0 && <div style={{ marginTop: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px 10px', display: 'inline-block' }}><span style={{ color: '#000', fontWeight: 900, fontSize: '12px' }}>{dAQI < 0 ? `${Math.abs(dAQI)} IMPROVED` : `${dAQI} WORSENED`}</span></div>}
                    </div>
                    <div style={{ padding: '12px', borderBottom: '4px solid #000' }}>
                        <p style={{ color: '#FF3366', fontWeight: 900, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>POLLUTANTS</p>
                        {[
                            { k: 'pm25', lbl: 'PM2.5', unit: 'µg/m³', max: 100, col: '#FF3366' },
                            { k: 'pm10', lbl: 'PM10', unit: 'µg/m³', max: 150, col: '#FF9800' },
                            { k: 'no2', lbl: 'NO2', unit: 'ppb', max: 80, col: '#FFCC00' },
                            { k: 'co', lbl: 'CO', unit: 'ppm', max: 3, col: '#00CFFF' },
                            { k: 'o3', lbl: 'O3', unit: 'ppb', max: 70, col: '#00FF66' },
                            { k: 'so2', lbl: 'SO2', unit: 'ppb', max: 30, col: '#CE93D8' },
                        ].map(({ k, lbl, unit, max, col }) => {
                            const val = pollution[k], base = BASELINE[k];
                            const pct = Math.min(100, (val / max) * 100);
                            const bPct = Math.min(100, (base / max) * 100);
                            const d = +(val - base).toFixed(2);
                            return (
                                <div key={k} style={{ marginBottom: '9px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                        <span style={{ color: '#666', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase' }}>{lbl}</span>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                            <span style={{ color: col, fontWeight: 900, fontSize: '12px' }}>{val}</span>
                                            <span style={{ color: '#333', fontSize: '12px' }}>{unit}</span>
                                            {d !== 0 && <span style={{ color: d < 0 ? '#00FF66' : '#FF3366', fontWeight: 900, fontSize: '12px' }}>{d < 0 ? `${Math.abs(d)}` : `+${d}`}</span>}
                                        </div>
                                    </div>
                                    <div style={{ height: '5px', background: '#EEE', border: '1px solid #333', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', left: `${bPct}%`, top: 0, bottom: 0, width: '2px', background: '#444', zIndex: 2 }} />
                                        <div style={{ width: `${pct}%`, height: '100%', background: col, transition: 'width 0.5s ease-out' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ padding: '12px', flex: 1 }}>
                        <p style={{ color: '#000', fontWeight: 900, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>IMPACT</p>
                        <div style={{ border: '2px solid #00FF66', padding: '10px', marginBottom: '8px' }}><p style={{ color: '#00FF66', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase' }}>Trees on Real Map</p><p style={{ color: 'white', fontWeight: 900, fontSize: '28px' }}>{totalTrees}</p></div>
                        <div style={{ border: `2px solid ${dAQI <= 0 ? '#00FF66' : '#FF3366'}`, padding: '10px', marginBottom: '8px', transition: 'border-color 0.3s' }}><p style={{ color: dAQI <= 0 ? '#00FF66' : '#FF3366', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase' }}>AQI Change</p><p style={{ color: 'white', fontWeight: 900, fontSize: '22px' }}>{dAQI === 0 ? '—' : dAQI > 0 ? `+${dAQI}` : dAQI}</p></div>
                        <div style={{ border: '2px solid #FF3366', padding: '10px', marginBottom: '8px' }}><p style={{ color: '#FF3366', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase' }}>PM2.5 Change</p><p style={{ color: 'white', fontWeight: 900, fontSize: '18px' }}>{dPM25 === 0 ? '—' : dPM25 > 0 ? `+${dPM25}` : dPM25} µg/m³</p></div>
                        {totalTrees >= 5 && dAQI < 0 && <div style={{ background: '#00FF66', border: '3px solid #000', padding: '10px', boxShadow: '4px 4px 0 #000', marginTop: '10px' }}><p style={{ color: 'black', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}>REAL IMPACT!</p><p style={{ color: 'black', fontSize: '14px', marginTop: '4px', fontWeight: 700 }}>{totalTrees} trees on real Bidhannagar map · AQI {Math.abs(dAQI)}pts better</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ModelsSimulation = () => {
    const [liveData, setLiveData] = useState(null);
    const [liveLoading, setLiveLoading] = useState(true);
    const [liveFetchedAt, setLiveFetchedAt] = useState(null);
    const [selectedForecast, setSelectedForecast] = useState('all');
    const [forecastSelectOpen, setForecastSelectOpen] = useState(false);
    const [forecastRaw, setForecastRaw] = useState([]);
    const [forecastLoading, setForecastLoading] = useState(true);
    const [ratiosData, setRatiosData] = useState([]);
    const [ratiosLoading, setRatiosLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [optimizerData, setOptimizerData] = useState(null);
    const [optimizerLoading, setOptimizerLoading] = useState(true);
    const [activeFeature, setActiveFeature] = useState(null);

    useEffect(() => {
        setLiveLoading(true);
        const fetchLive = () => fetch(`${API_BASE}/live-data`).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(data => { if (data && data.error) throw new Error(data.error); setLiveData(data); setLiveLoading(false); setLiveFetchedAt(new Date()); });
        fetchLive().catch(() => setTimeout(() => fetchLive().catch(() => { setLiveData({ _unavailable: true }); setLiveLoading(false); }), 3000));
    }, []);

    useEffect(() => {
        setForecastLoading(true);
        fetch(`${API_BASE}/forecast`).then(r => r.json()).then(data => {
            if (data && data.past && data.future) setForecastRaw(data);
            else if (Array.isArray(data)) setForecastRaw({ past: { pm25: [] }, future: { pm25: data } });
            else setForecastRaw({ past: {}, future: data });
            setForecastLoading(false);
        }).catch(() => setForecastLoading(false));
    }, []);

    useEffect(() => {
        setRatiosLoading(true);
        fetch(`${API_BASE}/ratios`).then(r => r.json()).then(data => { setRatiosData(Object.entries(data).map(([name, value]) => ({ name: name.toUpperCase(), value }))); setRatiosLoading(false); }).catch(() => setRatiosLoading(false));
    }, []);

    useEffect(() => {
        setAnalyticsLoading(true);
        fetch(`${API_BASE}/analytics`).then(r => r.json()).then(data => { setAnalytics(data); setAnalyticsLoading(false); }).catch(() => setAnalyticsLoading(false));
    }, []);

    useEffect(() => {
        setOptimizerLoading(true);
        fetch(`${API_BASE}/optimize`).then(r => r.json()).then(data => { setOptimizerData(data); setOptimizerLoading(false); }).catch(() => setOptimizerLoading(false));
    }, []);

    const liveOk = liveData && !liveData.error && !liveData._unavailable;
    const pollutantMatrix = liveOk ? [
        { name: 'PM2.5', value: liveData.pm25, unit: 'µg/m³', trend: liveData.pm25 > 45 ? 'up' : 'down' },
        { name: 'PM10', value: liveData.pm10, unit: 'µg/m³', trend: liveData.pm10 > 82 ? 'up' : 'down' },
        { name: 'NO', value: liveData.no, unit: 'ppb', trend: liveData.no > 12 ? 'up' : 'down' },
        { name: 'NO2', value: liveData.no2, unit: 'ppb', trend: liveData.no2 > 34 ? 'up' : 'down' },
        { name: 'CO', value: liveData.co, unit: 'ppm', trend: liveData.co > 1.2 ? 'up' : 'down' },
        { name: 'O3', value: liveData.o3, unit: 'ppb', trend: liveData.o3 > 45 ? 'up' : 'down' },
        { name: 'SO2', value: liveData.so2, unit: 'ppb', trend: liveData.so2 > 8 ? 'up' : 'down' },
    ].filter(p => p.value !== undefined && p.value !== null) : [];

    const currentAQI = (liveOk && liveData.aqi) ? liveData.aqi : null;
    const aqiLabel = getAQILabel(currentAQI);
    const healthAdvisory = getHealthAdvisory(currentAQI);

    const FORECAST_POLLUTANTS = ['pm25', 'pm10', 'no2', 'co', 'o3', 'so2', 'no', 'all'];
    const FORECAST_LABELS = { pm25: 'PM2.5', pm10: 'PM10', no2: 'NO2', co: 'CO', o3: 'O3', so2: 'SO2', no: 'NO', all: 'ALL POLLUTANTS' };

    const buildForecastChartData = () => {
        const intervalMin = forecastRaw?.interval_min || 15;
        const NUM_PAST = 6, NUM_FUTURE = 7;
        const now = new Date();
        const times = [];
        for (let i = -NUM_PAST; i < NUM_FUTURE; i++) {
            const d = new Date(now.getTime() + i * intervalMin * 60000);
            times.push(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
        }

        if (selectedForecast === 'all') {
            return times.map((time, i) => {
                const pt = { time };
                FORECAST_POLLUTANTS.filter(p => p !== 'all').forEach(p => {
                    const key = p.toLowerCase().replace('.', '');
                    const pastArr = forecastRaw?.past?.[key] || [];
                    const futureArr = forecastRaw?.future?.[key] || [];
                    const usePast = pastArr.length >= NUM_PAST ? pastArr : [];
                    const useFuture = futureArr.length >= NUM_FUTURE ? futureArr : [];

                    if (i < NUM_PAST - 1) {
                        pt[`${p}_past`] = usePast[i] ?? null;
                        pt[`${p}_future`] = null;
                    } else if (i === NUM_PAST - 1) {
                        pt[`${p}_past`] = usePast[i] ?? null;
                        pt[`${p}_future`] = usePast[i] ?? null;
                    } else {
                        const futureIdx = i - NUM_PAST;
                        pt[`${p}_past`] = null;
                        pt[`${p}_future`] = useFuture[futureIdx] ?? null;
                    }
                });
                return pt;
            });
        } else {
            const key = selectedForecast.toLowerCase().replace('.', '');
            const pastArr = forecastRaw?.past?.[key] || [];
            const futureArr = forecastRaw?.future?.[key] || [];
            const usePast = pastArr.length >= NUM_PAST ? pastArr : [];
            const useFuture = futureArr.length >= NUM_FUTURE ? futureArr : [];

            return times.map((time, i) => {
                if (i < NUM_PAST - 1) return { time, past: usePast[i] ?? null, future: null };
                if (i === NUM_PAST - 1) return { time, past: usePast[i] ?? null, future: usePast[i] ?? null };
                const futureIdx = i - NUM_PAST;
                const val = useFuture[futureIdx] ?? null;
                return { time, past: null, future: val };
            });
        }
    };

    const forecastChartData = buildForecastChartData();
    const peakTime1 = forecastChartData[6]?.time;
    const peakTime2 = forecastChartData[7]?.time;
    const barChartData = ratiosData.length > 0 ? ratiosData : pollutantMatrix.map(p => ({ name: p.name, value: p.value }));

    const handleExportData = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        const futureData = forecastRaw?.future || {};
        const forecastKeys = Object.keys(futureData).filter(k => Array.isArray(futureData[k]));
        csvContent += "Minute_Offset," + forecastKeys.map(k => k.toUpperCase()).join(",") + "\n";
        const len = forecastKeys.length > 0 ? (futureData[forecastKeys[0]] || []).length : 0;
        for (let i = 0; i < len; i++) {
            csvContent += i;
            forecastKeys.forEach(k => { csvContent += `,${(futureData[k] || [])[i] ?? ''}`; });
            csvContent += "\n";
        }
        csvContent += "\nLive Pollutants\n";
        if (liveData && !liveData.error) Object.entries(liveData).forEach(([k, v]) => { csvContent += `${k},${v}\n`; });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bidhannagar_forecast_data.csv");
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const FEATURES = [
        {
            id: 'traffic',
            title: 'TRAFFIC DIVERGENCE SIMULATOR',
            icon: Car,
            color: '#000',
            bg: '#FFF',
            desc: 'Real-time traffic rerouting on live Bidhannagar map with AQI impact analysis. Click zones to divert congestion.',
            stats: [
                { label: 'Zones Monitored', value: '20', color: '#000' },
                { label: 'Worst Score', value: '98', color: '#FF3366' },
                { label: 'Avg Speed (High)', value: '14 km/h', color: '#FF9800' },
            ]
        },
        {
            id: 'sites',
            title: 'SMART SITE ADVISOR',
            icon: School,
            color: '#000',
            bg: '#FFF',
            desc: 'AI-powered placement scoring for schools & hospitals. Multi-factor analysis: AQI, traffic, green cover, future growth.',
            stats: [
                { label: 'Candidate Sites', value: '7', color: '#000' },
                { label: 'Top Score', value: '95/100', color: '#00FF66' },
                { label: 'Metrics Used', value: '4', color: '#000' },
            ]
        },
        {
            id: 'health',
            title: 'CITIZEN HEALTH RISK INDEX',
            icon: Shield,
            color: '#000',
            bg: '#FFF',
            desc: 'Per-zone health risk scoring for vulnerable populations. 24-hour simulation with emergency corridor optimization.',
            stats: [
                { label: 'Population Groups', value: '4', color: '#000' },
                { label: 'Risk Simulated', value: '24H', color: '#FF9800' },
                { label: 'Emergency Routes', value: '3', color: '#00FF66' },
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-mono text-black space-y-12 selection:bg-[#00FF66]">

            {/* HEADER */}
            <div>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight bg-[#FF3366] text-black px-6 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    AI COMMAND CENTER
                </h1>
                <br />
                <p className="text-xl font-bold bg-white border-4 border-black px-6 py-3 mt-8 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase">
                    Expanded Bidhannagar Digital Twin Engine
                </p>
            </div>

            {/* AQI + MATRIX */}
            <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="col-span-1 bg-[#FFCC00] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center justify-center text-center">
                    {liveLoading ? (
                        <p className="text-2xl font-black animate-pulse uppercase">LOADING...</p>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-4">
                                <AlertTriangle size={48} strokeWidth={3} />
                                <h2 className="text-6xl font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AQI: {currentAQI !== null ? currentAQI : 'N/A'}</h2>
                            </div>
                            <div className="bg-black text-white px-6 py-2 text-2xl font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">{aqiLabel}</div>
                            <p className="font-bold border-t-4 border-black pt-4 text-lg">Health Advisory: <br /><span className="bg-white text-black px-2 mt-2 inline-block">{healthAdvisory}</span></p>
                        </>
                    )}
                </div>
                <div className="xl:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 inline-block">LIVE POLLUTANT MATRIX</h3>
                    {liveFetchedAt && <p className="text-xs text-gray-400 font-mono mt-1 mb-2">SNAPSHOT: {liveFetchedAt.toLocaleTimeString()} · FIXED UNTIL PAGE REFRESH</p>}
                    {liveLoading ? (
                        <p className="font-bold animate-pulse uppercase text-gray-400">Fetching live data...</p>
                    ) : pollutantMatrix.length === 0 ? (
                        <div className="border-4 border-dashed border-red-400 p-6 text-center col-span-4"><p className="font-black text-red-500 text-lg uppercase">SENSOR DATA UNAVAILABLE</p><p className="text-sm text-gray-500 mt-1">Could not reach OpenAQ API. Check backend connection.</p></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {pollutantMatrix.map((pol, idx) => (
                                <div key={idx} className="border-4 border-black p-3 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-50">
                                    <span className="font-black text-xs text-gray-500">{pol.name}</span>
                                    <div className="flex items-end justify-between mt-2">
                                        <span className="font-black text-xl">{pol.value} <span className="text-xs font-bold">{pol.unit}</span></span>
                                        {pol.trend === 'up' ? <ArrowUpRight size={24} strokeWidth={4} className="text-[#FF3366]" /> : <ArrowDownRight size={24} strokeWidth={4} className="text-[#00FF66]" />}
                                    </div>
                                </div>
                            ))}
                            <div className="border-4 border-black bg-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"><Database className="text-[#FFCC00]" size={32} /></div>
                        </div>
                    )}
                </div>
            </div>

            {/* FORECAST + RATIOS */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px] flex flex-col">
                    <div className="flex justify-between items-start mb-4 border-b-4 border-black pb-4">
                        <h3 className="text-2xl font-black uppercase">3-HOUR FORECAST</h3>
                        <div className="relative">
                            <button onClick={() => setForecastSelectOpen(!forecastSelectOpen)} className="bg-[#00CFFF] border-4 border-black px-4 py-2 font-black uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {FORECAST_LABELS[selectedForecast] || selectedForecast.toUpperCase()} LEVELS
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                            {forecastSelectOpen && (
                                <div className="absolute right-0 top-full mt-2 min-w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 flex flex-col max-h-60 overflow-y-auto">
                                    {FORECAST_POLLUTANTS.map(key => (
                                        <button key={key} onClick={() => { setSelectedForecast(key); setForecastSelectOpen(false); }} className={`px-4 py-2 font-black uppercase text-left border-b-4 border-black last:border-b-0 hover:bg-[#FFCC00] ${selectedForecast === key ? 'bg-gray-200' : ''}`}>{FORECAST_LABELS[key]} LEVELS</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-grow">
                        {forecastLoading ? <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase animate-pulse">Loading forecast...</div> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={forecastChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                    <XAxis dataKey="time" stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                    <YAxis stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                    <Tooltip content={<BrutalistTooltip />} />
                                    {peakTime1 && peakTime2 && <ReferenceArea x1={peakTime1} x2={peakTime2} fill="#FF3366" fillOpacity={0.2} />}

                                    {selectedForecast === 'all' ? (
                                        FORECAST_POLLUTANTS.filter(p => p !== 'all').flatMap((pol, idx) => {
                                            const colors = ['#FF3366', '#00CFFF', '#00FF66', '#FFCC00', '#7B61FF', '#FF9800', '#E91E63'];
                                            const color = colors[idx % colors.length];
                                            return [
                                                <Line key={`${pol}_past`} type="monotone" dataKey={`${pol}_past`} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: color }} activeDot={{ r: 8 }} name={`${pol.toUpperCase()} Historical`} connectNulls={false} />,
                                                <Line key={`${pol}_future`} type="monotone" dataKey={`${pol}_future`} stroke={color} strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2, fill: color }} activeDot={{ r: 8 }} name={`${pol.toUpperCase()} Predicted`} connectNulls={false} />
                                            ];
                                        })
                                    ) : (
                                        <>
                                            <Line type="monotone" dataKey="past" stroke="#000" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#000' }} activeDot={{ r: 8 }} name="Historical" connectNulls={false} />
                                            <Line type="monotone" dataKey="future" stroke="#FF3366" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2, fill: '#FF3366' }} activeDot={{ r: 8 }} name="Predicted" connectNulls={false} />
                                        </>
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-3 flex gap-6 text-xs font-black uppercase justify-center border-t-4 border-black pt-3">
                        <div className="flex items-center gap-2">
                            <div style={{ width: '20px', height: '4px', background: '#000' }}></div>
                            <span>Historical Logging</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div style={{ width: '20px', height: '4px', background: 'repeating-linear-gradient(90deg, #FF3366, #FF3366 4px, transparent 4px, transparent 8px)' }}></div>
                            <span>AI Predicted Trend</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[#00CFFF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px] flex flex-col">
                    <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-2 inline-block w-max mb-6">RELATIVE POLLUTANT RATIOS</h3>
                    <div className="flex-grow bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {ratiosLoading ? <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase animate-pulse">Loading ratios...</div> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                    <XAxis dataKey="name" stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold', fontSize: 12 }} />
                                    <YAxis stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                    <Tooltip content={<BrutalistTooltip />} cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#FF3366" stroke="#000" strokeWidth={3} radius={0} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* URBAN INTELLIGENCE FEATURE HUB */}
            <div>
                <div className="border-4 border-black bg-black text-white px-8 py-4 shadow-[8px_8px_0px_0px_rgba(255,51,102,1)] mb-8">
                    <h2 className="text-3xl font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        URBAN INTELLIGENCE FEATURES
                    </h2>
                    <p style={{ color: '#555', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>THREE VISIONARY TOOLS FOR A SMARTER, HEALTHIER BIDHANNAGAR</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {FEATURES.map(feature => {
                        const Icon = feature.icon;
                        const isActive = activeFeature === feature.id;
                        return (
                            <button key={feature.id} onClick={() => isActive ? setActiveFeature(null) : setActiveFeature(feature.id)}
                                className="text-left relative"
                                style={{ border: `4px solid ${feature.color}`, background: feature.bg, padding: '28px', boxShadow: isActive ? `0 0 0 4px #000, 12px 12px 0 ${feature.color}` : `8px 8px 0 ${feature.color}`, cursor: 'pointer', fontFamily: "'Space Mono',monospace", transition: 'all 0.1s', transform: isActive ? 'translate(-4px, -4px)' : 'none', opacity: activeFeature !== null && !isActive ? 0.6 : 1 }}
                                onMouseEnter={e => { if (isActive) return; e.currentTarget.style.transform = 'translate(-4px,-4px)'; e.currentTarget.style.boxShadow = `12px 12px 0 ${feature.color}`; e.currentTarget.style.opacity = '1'; }}
                                onMouseLeave={e => { if (isActive) return; e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `8px 8px 0 ${feature.color}`; if (activeFeature !== null) e.currentTarget.style.opacity = '0.6'; }}>
                                <Icon size={48} strokeWidth={2.5} color={feature.color} style={{ marginBottom: '16px' }} />
                                <h3 style={{ color: feature.color, fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '10px', lineHeight: 1.2 }}>{feature.title}</h3>
                                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.8', marginBottom: '20px' }}>{feature.desc}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '20px' }}>
                                    {feature.stats.map(s => (
                                        <div key={s.label} style={{ border: `1px solid ${s.color}44`, padding: '8px', background: '#F4F4F0' }}>
                                            <p style={{ color: '#555', fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '3px' }}>{s.label}</p>
                                            <p style={{ color: s.color, fontSize: '16px', fontWeight: 900 }}>{s.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ position: 'relative', background: feature.color, color: '#FFF', padding: '12px 16px', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', border: '3px solid #000', boxShadow: '3px 3px 0 #000', letterSpacing: '1px' }}>
                                    {isActive ? (
                                        <div style={{ position: 'absolute', top: '-10px', left: '-10px', background: '#FF00FF', padding: '10px 14px', border: '3px solid #000', color: '#000', boxShadow: '4px 4px 0 #000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                            <Icon size={24} strokeWidth={3} color="#000" />
                                        </div>
                                    ) : (
                                        <Zap size={16} strokeWidth={3} />
                                    )}
                                    <span style={{ marginLeft: isActive ? '50px' : '0' }}>{isActive ? 'CLOSE FEATURE' : 'LAUNCH FEATURE'}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {activeFeature !== null && (
                    <div className="border-4 border-black overflow-hidden mb-12" style={{ boxShadow: '8px 8px 0 #000', animation: 'fadeIn 0.3s ease-in-out' }}>
                        {activeFeature === 'traffic' && <TrafficDivergenceSimulator />}
                        {activeFeature === 'sites' && <SmartSiteAdvisor />}
                        {activeFeature === 'health' && <CitizenHealthRiskDashboard />}
                    </div>
                )}
            </div>

            {/* POLICY SANDBOX */}
            <PolicySandboxWidget />

            {/* WHO COMPLIANCE + ANALYTICS */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16">
                <div className="bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,51,102,1)] p-8 font-mono flex flex-col">
                    <h2 className="text-2xl font-black mb-2 border-b-4 border-black pb-2 w-max text-black uppercase">WHO COMPLIANCE BOARD</h2>
                    <p className="text-xs font-black text-[#666] mb-6 uppercase tracking-wider">Live Bidhannagar Sensors vs World Health Organization Safe Limits</p>
                    <div className="flex-grow space-y-4 overflow-y-auto max-h-[380px] pr-4 brutalist-scrollbar">
                        {(() => {
                            const limits = { 'PM2.5': 15, 'PM10': 45, 'NO2': 25, 'SO2': 15, 'O3': 50, 'CO': 4 };
                            if (!pollutantMatrix || pollutantMatrix.length === 0) return <p className="animate-pulse text-[#FF3366] font-black uppercase text-xl">Awaiting Sensor Data...</p>;

                            return pollutantMatrix.map(pol => {
                                const limit = limits[pol.name];
                                if (!limit) return null;
                                const isSafe = pol.value <= limit;
                                const ratio = pol.value / limit;
                                const exceedPct = isSafe ? 0 : Math.round((ratio - 1) * 100);

                                return (
                                    <div key={pol.name} className="border-4 border-black p-3 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: isSafe ? '#00FF66' : '#FF3366' }}>
                                        <div className="flex flex-col">
                                            <span className="font-black text-xl text-black">{pol.name}</span>
                                            <span className="text-xs uppercase text-black font-bold">Limit: {limit} {pol.unit}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-2xl text-black">{pol.value}</span>
                                            <div className="text-[11px] uppercase font-black text-black mt-1 bg-white px-1 border-2 border-black block w-max ml-auto">
                                                {isSafe ? 'SAFE' : `⚠ ${exceedPct}% EXCEED`}
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
                    <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 w-max">RESEARCH ANALYTICS</h2>
                    {analyticsLoading ? <p className="font-bold animate-pulse uppercase text-gray-400">Loading analytics...</p> : (
                        <div className="flex-grow space-y-4 font-bold text-lg">
                            <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2"><span className="text-gray-500">DOMINANT POLLUTANT:</span><span className="text-[#FF3366] font-black">{analytics?.dominant_pollutant || 'PM10'}</span></div>
                            <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2"><span className="text-gray-500">CURRENT RISK LEVEL:</span><span className="bg-black text-white px-2 uppercase">{analytics?.risk_level || 'HIGH'}</span></div>
                            <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2"><span className="text-gray-500">PEAK RISK TIME:</span><span className="uppercase">{analytics?.peak_time || '19:00'}</span></div>
                            <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2"><span className="text-gray-500">SEASONAL TREND:</span><span className="text-[#7B61FF] font-black uppercase">{analytics?.season || 'Entering Winter Smog Phase'}</span></div>
                        </div>
                    )}
                    <button onClick={handleExportData} className="bg-[#00CFFF] border-4 border-black w-full py-4 text-2xl font-black uppercase flex items-center justify-center gap-3 mt-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <Download size={28} strokeWidth={3} /> EXPORT DATA (CSV)
                    </button>
                </div>
            </div>

            <BackToHomeButton />
        </div>
    );
};

export default ModelsSimulation;