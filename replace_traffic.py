import re

with open(r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace TRAFFIC_ZONES
new_traffic_zones = """const TRAFFIC_ZONES = [
    { id: 46, zone_name: "City Centre Salt Lake", latitude: 22.5881, longitude: 88.4082, traffic_level: "High", traffic_score: 77, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 14 },
    { id: 47, zone_name: "Karunamayee Bus Stand", latitude: 22.5895, longitude: 88.4205, traffic_level: "High", traffic_score: 81, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 10 },
    { id: 48, zone_name: "Salt Lake Sec V IT Hub", latitude: 22.5769, longitude: 88.4308, traffic_level: "High", traffic_score: 87, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 12 },
    { id: 49, zone_name: "Ultadanga Connector", latitude: 22.5871, longitude: 88.3947, traffic_level: "High", traffic_score: 98, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 11 },
    { id: 50, zone_name: "Salt Lake Stadium Gate", latitude: 22.5741, longitude: 88.3996, traffic_level: "High", traffic_score: 76, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 19 },
    { id: 51, zone_name: "Narayanpur Bus Terminus", latitude: 22.5701, longitude: 88.4221, traffic_level: "High", traffic_score: 76, peak_hours: "8–10 AM, 5–9 PM", road_type: "Arterial", avg_speed_kmph: 16 },
    { id: 52, zone_name: "Bidhannagar Sector I", latitude: 22.5952, longitude: 88.4101, traffic_level: "Medium", traffic_score: 45, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 40 },
    { id: 53, zone_name: "Bidhannagar Sector II", latitude: 22.5932, longitude: 88.417, traffic_level: "Medium", traffic_score: 55, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 39 },
    { id: 54, zone_name: "Bidhannagar Sector III", latitude: 22.5881, longitude: 88.4162, traffic_level: "Medium", traffic_score: 42, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 39 },
    { id: 55, zone_name: "Central Park Salt Lake", latitude: 22.5826, longitude: 88.4085, traffic_level: "Medium", traffic_score: 60, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 31 },
    { id: 56, zone_name: "Baguiati Connector", latitude: 22.6001, longitude: 88.4301, traffic_level: "Medium", traffic_score: 65, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 30 },
    { id: 57, zone_name: "DLF IT Park Approach", latitude: 22.5745, longitude: 88.4348, traffic_level: "Medium", traffic_score: 44, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 40 },
    { id: 58, zone_name: "Ecospace Business Park", latitude: 22.5731, longitude: 88.4475, traffic_level: "Medium", traffic_score: 44, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 37 },
    { id: 59, zone_name: "Nicco Park Road", latitude: 22.584, longitude: 88.4271, traffic_level: "Medium", traffic_score: 62, peak_hours: "9–11 AM, 4–7 PM", road_type: "Collector", avg_speed_kmph: 32 },
    { id: 60, zone_name: "Salt Lake Sector IV Res.", latitude: 22.5887, longitude: 88.4359, traffic_level: "Low", traffic_score: 39, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 60 },
    { id: 61, zone_name: "AE Block Salt Lake", latitude: 22.5953, longitude: 88.4135, traffic_level: "Low", traffic_score: 5, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 50 },
    { id: 62, zone_name: "FD Block Salt Lake", latitude: 22.5911, longitude: 88.4014, traffic_level: "Low", traffic_score: 13, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 44 },
    { id: 63, zone_name: "Salt Lake, Lake Area", latitude: 22.5797, longitude: 88.4143, traffic_level: "Low", traffic_score: 22, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 47 },
    { id: 64, zone_name: "DB Block Salt Lake", latitude: 22.5965, longitude: 88.4073, traffic_level: "Low", traffic_score: 18, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 57 },
    { id: 65, zone_name: "HB Block Salt Lake", latitude: 22.5819, longitude: 88.4211, traffic_level: "Low", traffic_score: 8, peak_hours: "Off-peak only", road_type: "Local", avg_speed_kmph: 49 }
];"""

text = re.sub(r'const TRAFFIC_ZONES = \[.*?\];', new_traffic_zones, text, flags=re.DOTALL)

# Now, building the new TrafficDivergenceSimulator
new_simulator = """
function TrafficDivergenceSimulator() {
    const L = useLeaflet();
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const circlesRef = useRef([]);

    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedTimeMode, setSelectedTimeMode] = useState("Morning");
    const [simRunning, setSimRunning] = useState(false);
    const [divergedZones, setDivergedZones] = useState([]);

    // We convert modes to a typical selected time for testing
    // "Morning" -> "09:00", "Evening" -> "18:00", "Off-Peak" -> "13:00"
    const timeStrToVal = (mode) => {
        if (mode === "Morning") return "09:00";
        if (mode === "Evening") return "18:00";
        return "13:00";
    };

    const isTimeInPeakRange = (timeStr, peakHoursStr) => {
        if (peakHoursStr === "Off-peak only") {
            return timeStr === "13:00";
        }
        
        const [h, m] = timeStr.split(':').map(Number);
        const timeInMin = h * 60 + m;
        
        // Parse "8–10 AM, 5–9 PM"
        const ranges = peakHoursStr.split(',').map(r => r.trim());
        for (const range of ranges) {
            // e.g., "8–10 AM", "5–9 PM"
            let [hoursPart, ampm] = range.split(' ');
            if(!ampm && range.includes("AM")) ampm = "AM";
            if(!ampm && range.includes("PM")) ampm = "PM";
            
            hoursPart = hoursPart.replace('AM', '').replace('PM', '').trim();
            const parts = hoursPart.split('–');
            if(parts.length < 2) continue;
            
            let startH = parseInt(parts[0]);
            let endH = parseInt(parts[1]);
            
            if (ampm === "PM" && startH < 12) startH += 12;
            if (ampm === "PM" && endH < 12) endH += 12;
            if (ampm === "AM" && startH === 12) startH = 0;
            if (ampm === "AM" && endH === 12) endH = 0;
            
            const startMin = startH * 60;
            const endMin = endH * 60;
            
            if (timeInMin >= startMin && timeInMin <= endMin) {
                return true;
            }
        }
        return false;
    };

    const computeZoneData = (z) => {
        const emission_index = z.traffic_score + z.avg_speed_kmph;
        let colorType = "green";
        let colorHex = "#00FF66"; // Low emission
        let label = "Low emission";
        
        if (emission_index > 90 || z.traffic_level === 'High') {
            colorType = "red";
            colorHex = "#FF3366";
            label = "High emission";
        } else if (emission_index > 60 || z.traffic_level === 'Medium') {
            colorType = "yellow";
            colorHex = "#FFCC00";
            label = "Medium emission";
        }

        const isActive = isTimeInPeakRange(timeStrToVal(selectedTimeMode), z.peak_hours);
        return { ...z, emission_index, colorType, colorHex, label, isActive };
    };

    const enrichedZones = TRAFFIC_ZONES.map(computeZoneData);
    const activeZones = enrichedZones.filter(z => z.isActive || z.colorType === 'green'); // Green zones always active? Or only if active? Let's say we highlight active zones.

    // Calculate Best Alternative for Diverged Red/Yellow Zones
    const getAlternativeRoute = (sourceZone) => {
        if (!sourceZone) return null;
        // Find best green zone
        const greens = enrichedZones.filter(z => z.colorType === 'green');
        if (greens.length === 0) return null;
        
        // Pick nearest or simplest logic: randomly pick a green base on id modulus
        const target = greens[sourceZone.id % greens.length];
        
        const origEmission = sourceZone.emission_index;
        const targetEmission = target.emission_index;
        const reductionFormula = ((origEmission - targetEmission) / origEmission) * 100;
        
        return {
            target,
            reductionPercentage: Math.round(reductionFormula)
        };
    };

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
        markersRef.current = [];
        circlesRef.current = [];

        enrichedZones.forEach(zone => {
            // Only activate meaning opacity/brightness depending on Time Logic
            const isDiverged = divergedZones.includes(zone.id);
            const roadColor = isDiverged ? '#00FF66' : zone.colorHex;
            
            const isHighlighted = zone.isActive;
            const opacity = isHighlighted ? 0.4 : 0.05;

            // Buffer circle (radial impact zone)
            const circle = L.circle([zone.latitude, zone.longitude], {
                color: roadColor,
                fillColor: roadColor,
                fillOpacity: isDiverged ? 0.1 : opacity,
                weight: isHighlighted ? 3 : 1,
                radius: zone.emission_index * 2,
            }).addTo(mapInstance.current);
            circlesRef.current.push(circle);

            // CircleMarker
            const marker = L.circleMarker([zone.latitude, zone.longitude], {
                radius: isHighlighted ? 9 : 4,
                fillColor: roadColor,
                color: '#000',
                weight: 2,
                fillOpacity: 1
            }).addTo(mapInstance.current);

            // Popup fields
            const popupHtml = `
                <div style="font-family:'Space Mono',monospace; padding:8px; border:3px solid #000; background:#FFF; width: 220px;">
                    <p style="font-weight:900; font-size:14px; margin-bottom:4px; text-transform:uppercase;">${zone.zone_name}</p>
                    <p style="font-size:12px; margin:2px 0;"><strong>Level:</strong> ${zone.traffic_level}</p>
                    <p style="font-size:12px; margin:2px 0;"><strong>Peak:</strong> ${zone.peak_hours}</p>
                    <p style="font-size:12px; margin:2px 0;"><strong>Speed:</strong> ${zone.avg_speed_kmph} km/h</p>
                    <p style="font-size:12px; margin:2px 0; color:${zone.colorHex}; font-weight:bold;">${zone.label} (${zone.emission_index})</p>
                </div>
            `;
            marker.bindPopup(popupHtml, { className: 'custom-brutalist-popup' });
            
            marker.on('click', () => {
                setSelectedZone(zone);
                if (simRunning) {
                    setDivergedZones(prev => prev.includes(zone.id) ? prev.filter(id => id !== zone.id) : [...prev, zone.id]);
                }
            });
            markersRef.current.push(marker);
        });
    }, [L, divergedZones, selectedTimeMode, enrichedZones, simRunning]);

    const activeAlternative = getAlternativeRoute(selectedZone);

    return (
        <div style={{ fontFamily: "'Space Mono','Courier New',monospace", background: '#FFF' }} className="w-full text-black">
            <div style={{ background: '#FFCC00', borderBottom: '6px solid #000' }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 style={{ fontFamily: "'Space Mono',monospace", letterSpacing: '-1px', fontSize: '28px', fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>
                        TRAFFIC DIVERGENCE SIMULATOR
                    </h2>
                    <p style={{ color: '#000', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', opacity: 0.6 }}>
                        EMISSION INDEXING · TIME LOGIC · SMART DIVERSION
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <span style={{ fontWeight: 900, fontSize: '14px' }}>TIME MODE:</span>
                    {['Morning', 'Evening', 'Off-Peak'].map(mode => (
                        <button key={mode} onClick={() => setSelectedTimeMode(mode)}
                            style={{
                                border: '3px solid #000',
                                background: selectedTimeMode === mode ? '#000' : '#FFF',
                                color: selectedTimeMode === mode ? '#FFF' : '#000',
                                padding: '6px 12px', fontWeight: 900, fontSize: '14px',
                                textTransform: 'uppercase', cursor: 'pointer'
                            }}>
                            {mode}
                        </button>
                    ))}
                    <button onClick={() => setSimRunning(!simRunning)} style={{ border: '3px solid #000', background: simRunning ? '#FF3366' : '#FFF', padding: '6px 12px', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer', marginLeft: '16px' }}>
                        {simRunning ? 'DIVERSION ON' : 'ENABLE DIVERSION'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', minHeight: '600px' }}>
                <div style={{ width: '320px', minWidth: '320px', background: '#F4F4F0', borderRight: '4px solid #000', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', borderBottom: '4px solid #000', background: '#FFF' }}>
                        <p style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', marginBottom: '8px' }}>DIVERSION LOGIC</p>
                        <p style={{ fontSize: '13px', marginBottom: '12px' }}>Enable diversion mode, then click any <span style={{color:'#D50000', fontWeight:'bold'}}>Red</span> or <span style={{color:'#FFCC00', fontWeight:'bold'}}>Yellow</span> road to trigger an alternative route suggestion.</p>
                        
                        {selectedZone && (selectedZone.colorType === 'red' || selectedZone.colorType === 'yellow') ? (
                            <div style={{ padding: '12px', border: '3px solid #000', background: '#ffe6e6' }}>
                                <p style={{ fontSize: '14px', fontWeight: 900, marginBottom: '6px' }}>SELECTED: {selectedZone.zone_name}</p>
                                <p style={{ fontSize: '14px', marginBottom: '4px' }}>Orig Emission: {selectedZone.emission_index}</p>
                                
                                {activeAlternative && (
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px dashed #000' }}>
                                        <p style={{ fontSize: '13px', fontWeight: 900, color: '#008000', marginBottom: '4px' }}>SUGGESTED ALT: {activeAlternative.target.zone_name}</p>
                                        <p style={{ fontSize: '13px', marginBottom: '6px' }}>New Emission: {activeAlternative.target.emission_index}</p>
                                        <p style={{ fontSize: '16px', fontWeight: 900, color: '#008000' }}>
                                            POLLUTION DECREASE: -{activeAlternative.reductionPercentage}%
                                        </p>
                                        
                                        {!divergedZones.includes(selectedZone.id) ? (
                                            <button onClick={() => setDivergedZones(prev => [...prev, selectedZone.id])}
                                                style={{ marginTop: '10px', width: '100%', background: '#00FF66', border: '3px solid #000', padding: '8px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>
                                                DIVERT TRAFFIC NOW
                                            </button>
                                        ) : (
                                            <div style={{ marginTop: '10px', padding: '8px', background: '#000', color: '#00FF66', fontWeight: 900, textAlign: 'center' }}>
                                                SUCCESSFULLY DIVERTED
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : selectedZone && selectedZone.colorType === 'green' ? (
                            <div style={{ padding: '12px', border: '3px solid #000', background: '#e6ffe6' }}>
                                <p style={{ fontSize: '14px', fontWeight: 900, marginBottom: '6px' }}>{selectedZone.zone_name}</p>
                                <p style={{ fontSize: '14px', color: '#008000', fontWeight: 'bold' }}>Low Emission Road. Good condition.</p>
                            </div>
                        ) : null}
                    </div>

                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                        <p style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px' }}>ALL ZONES EMISSION LIST</p>
                        {enrichedZones.sort((a,b) => b.emission_index - a.emission_index).map(z => (
                            <div key={z.id} style={{ 
                                padding: '8px', marginBottom: '8px', border: '3px solid #000', 
                                background: divergedZones.includes(z.id) ? '#ccffcc' : '#FFF',
                                opacity: z.isActive ? 1 : 0.6
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: 900, fontSize: '13px' }}>{z.zone_name}</span>
                                    <span style={{ fontWeight: 900, color: divergedZones.includes(z.id) ? '#008000' : z.colorHex }}>{z.emission_index}</span>
                                </div>
                                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                                    {z.road_type} | Speed: {z.avg_speed_kmph} | {divergedZones.includes(z.id) ? 'Diverted' : z.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, background: '#FFF', border: '4px solid #000', padding: '12px', boxShadow: '6px 6px 0 #000' }}>
                        <p style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>Legend & Physics</p>
                        {['🔴 High', '🟡 Medium', '🟢 Low'].map((lbl, idx) => (
                            <p key={idx} style={{ fontSize: '12px', fontWeight: 'bold', marginBottom:'4px' }}>{lbl} Emission</p>
                        ))}
                        <p style={{ fontSize: '11px', marginTop: '8px', borderTop: '2px solid #000', paddingTop: '4px' }}>Formula: Score + Speed = Emission</p>
                    </div>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                </div>
            </div>
        </div>
    );
}
"""

text = re.sub(r'function TrafficDivergenceSimulator\(\) \{.*?(?=// ═══════════════════════════════════════════════════════════════════════════\s*// FEATURE 2: SMART SITE ADVISOR — Enhanced)', new_simulator, text, flags=re.DOTALL)

with open(r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("TrafficDivergenceSimulator replaced successfully.")
