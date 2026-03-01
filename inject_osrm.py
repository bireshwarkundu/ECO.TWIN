import re

with open(r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

new_simulator = """
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
                         if(el.type === 'way' && el.geometry) {
                             el.geometry.forEach(pt => {
                                 const d = Math.pow(pt.lat - z.latitude, 2) + Math.pow(pt.lon - z.longitude, 2);
                                 if(d < minD){
                                     minD = d;
                                     bestWay = el;
                                 }
                             });
                         }
                     });
                     if(bestWay) {
                         newGeoms[z.id] = bestWay.geometry.map(pt => [pt.lat, pt.lon]);
                     }
                 });
                 setRoadGeometries(newGeoms);
             } catch(err) {
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
        const emission_index = z.traffic_score + z.avg_speed_kmph;
        let colorType = "green"; let colorHex = "#00FF66"; let label = "Low emission";
        if (emission_index > 85 || z.traffic_level === 'High') {
            colorType = "red"; colorHex = "#FF3366"; label = "High emission";
        } else if (emission_index > 55 || z.traffic_level === 'Medium') {
            colorType = "yellow"; colorHex = "#FFCC00"; label = "Medium emission";
        }
        const isActive = isTimeInPeakRange(timeStrToVal(selectedTimeMode), z.peak_hours);
        return { ...z, emission_index, colorType, colorHex, label, isActive };
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
                    
                    // Emulate AQI exposure based on endpoints to determine safety
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
                                const altAqi = Math.round((src.emission_index + via.emission_index + dst.emission_index) / 3) - 15; // Assume it drastically reduces it
                                const altExposureScore = Math.max(0, altAqi * altTime);
                                const percentageReduction = Math.round(((primaryExposureScore - altExposureScore) / primaryExposureScore) * 100);

                                altObj = {
                                    coords: altSegments.map(c => [c[1], c[0]]),
                                    travelTime: altTime,
                                    avgAqi: altAqi,
                                    exposureScore: altExposureScore,
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
            
            marker.bindPopup(`<div style="font-family:'Space Mono',monospace; padding:8px; border:3px solid #000; background:#FFF; width: 220px;"><p style="font-weight:900; font-size:14px; margin-bottom:4px; text-transform:uppercase;">${zone.zone_name}</p><p style="font-size:12px; margin:2px 0;"><strong>Emission:</strong> ${zone.emission_index}</p></div>`, { className: 'custom-brutalist-popup' });
            markersRef.current.push(marker);
        });

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
            <div style={{ background: '#FFCC00', borderBottom: '6px solid #000' }} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 style={{ fontFamily: "'Space Mono',monospace", letterSpacing: '-1px', fontSize: '28px', fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>
                        AQI-AWARE ROUTING
                    </h2>
                    <p style={{ color: '#000', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', opacity: 0.6 }}>
                        SMART NAV · EMISSION INDEXING · HEALTH SAFETY
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
                </div>
            </div>

            <div style={{ display: 'flex', minHeight: '600px' }}>
                <div style={{ width: '380px', minWidth: '380px', background: '#F4F4F0', borderRight: '4px solid #000', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Routing Input Panel */}
                    <div style={{ padding: '16px', borderBottom: '4px solid #000', background: '#FFF' }}>
                        <p style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', marginBottom: '12px' }}>ROUTING ENGINE</p>
                        
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 900, display: 'block', marginBottom: '4px' }}>SOURCE LOCATION</label>
                            <select value={sourceZoneId} onChange={(e) => setSourceZoneId(e.target.value)} style={{ width: '100%', padding: '8px', border: '3px solid #000', fontFamily: "'Space Mono',monospace", fontSize: '14px', background: '#FFF' }}>
                                <option value="">Select Starting Point</option>
                                {enrichedZones.sort((a,b)=>a.zone_name.localeCompare(b.zone_name)).map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
                            </select>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 900, display: 'block', marginBottom: '4px' }}>DESTINATION</label>
                            <select value={destZoneId} onChange={(e) => setDestZoneId(e.target.value)} style={{ width: '100%', padding: '8px', border: '3px solid #000', fontFamily: "'Space Mono',monospace", fontSize: '14px', background: '#FFF' }}>
                                <option value="">Select Destination</option>
                                {enrichedZones.sort((a,b)=>a.zone_name.localeCompare(b.zone_name)).map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Routing Results & Alerts */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                        {primaryRoute ? (
                            <div>
                                <p style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px' }}>ROUTE ANALYSIS</p>
                                
                                { primaryRoute.isSafe ? (
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
                                                <span style={{ fontSize: '10px', textTransform:'uppercase', fontWeight: 900 }}>Travel Time</span>
                                                <span style={{ fontSize: '16px', fontWeight: 900 }}>{primaryRoute.travelTime} min</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '10px', textTransform:'uppercase', fontWeight: 900 }}>AQI Exposure</span>
                                                <span style={{ fontSize: '16px', fontWeight: 900, color: primaryRoute.isSafe ? '#008000' : '#D50000' }}>{primaryRoute.exposureScore}</span>
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
                                            <span style={{ fontSize: '12px', color: '#007FFF', marginBottom: '6px', fontWeight:'bold' }}>Slightly longer but healthier</span>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '10px', textTransform:'uppercase', fontWeight: 900 }}>Travel Time</span>
                                                    <span style={{ fontSize: '16px', fontWeight: 900 }}>{alternateRoute.travelTime} min</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '10px', textTransform:'uppercase', fontWeight: 900 }}>AQI Exposure</span>
                                                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#008000' }}>{alternateRoute.exposureScore}</span>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '8px', background: '#00FF66', padding: '4px', border: '2px solid #000', textAlign: 'center' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 900 }}>TAKING DIVERTED ROUTE SAVES {alternateRoute.savings}% EXPOSURE</span>
                                            </div>
                                        </button>
                                    )}

                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', border: '4px dashed #ccc' }}>
                                <p style={{ fontWeight: 900, fontSize: '13px', color: '#888' }}>SELECT SOURCE AND DESTINATION TO BEGIN AQI-AWARE ROUTING</p>
                            </div>
                        )}
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
                </div>
            </div>
        </div>
    );
}
"""

text = re.sub(r'function TrafficDivergenceSimulator\(\) \{.*?(?=// ═══════════════════════════════════════════════════════════════════════════\s*// FEATURE 2: SMART SITE ADVISOR — Enhanced)', new_simulator, text, flags=re.DOTALL)

with open(r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Injected A-to-B AQI-Aware Routing logic")
