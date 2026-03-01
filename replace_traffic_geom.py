import re

with open(r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add roadGeometries state
state_injection = """
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
"""
text = text.replace("const [divergedZones, setDivergedZones] = useState([]);", state_injection)

# 2. Update the polyline rendering
old_poly_logic = """            // Stylized Road Segment (Neo Brutalist Lines)
            const offsetLat = 0.002;
            const offsetLng = 0.003;
            // Determine a pseudo-random angle based on ID to make the roads look like a network
            const dirX = zone.id % 2 === 0 ? 1 : (zone.id % 3 === 0 ? 0 : -1);
            const dirY = zone.id % 2 !== 0 ? 1 : (zone.id % 3 === 0 ? -1 : 0);
            const roadLineCoords = [
                [zone.latitude - (offsetLat * dirY), zone.longitude - (offsetLng * dirX)],
                [zone.latitude + (offsetLat * dirY), zone.longitude + (offsetLng * dirX)]
            ];

            const roadLine = L.polyline(roadLineCoords, {
                color: roadColor,
                weight: isHighlighted ? 8 : 4,
                opacity: isDiverged ? 0.3 : (isHighlighted ? 1 : 0.5),
                dashArray: isDiverged ? '10, 15' : '1, 0',
                lineCap: 'square'
            }).addTo(mapInstance.current);
            polylineRef.current.push(roadLine);"""

new_poly_logic = """            // Stylized Road Segment (Neo Brutalist Lines from OpenStreetMap)
            const geom = roadGeometries[zone.id];
            if (geom) {
                const roadLine = L.polyline(geom, {
                    color: roadColor,
                    weight: isHighlighted ? 8 : 5,
                    opacity: isDiverged ? 0.3 : (isHighlighted ? 1 : 0.8),
                    dashArray: isDiverged ? '10, 15' : '1, 0',
                    lineCap: 'square'
                }).addTo(mapInstance.current);
                polylineRef.current.push(roadLine);
            }"""

text = text.replace(old_poly_logic, new_poly_logic)

# Make sure we add `roadGeometries` to the dependency array of the second useEffect
text = text.replace("}, [L, divergedZones, selectedTimeMode, enrichedZones, simRunning]);", "}, [L, divergedZones, selectedTimeMode, enrichedZones, simRunning, roadGeometries]);")


with open(r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated with OSM Road Geometry")
