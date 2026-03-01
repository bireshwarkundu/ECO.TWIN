import re

with open(r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    """<div key={z.id} style={{ 
                                padding: '8px', marginBottom: '8px', border: '3px solid #000', """,
    """<div key={z.id} onClick={() => { setSelectedZone(z); if(simRunning){ setDivergedZones(prev => prev.includes(z.id) ? prev.filter(id => id !== z.id) : [...prev, z.id]); } mapInstance.current?.flyTo([z.latitude, z.longitude], 16, { animate: true, duration: 0.7 }); }} style={{ 
                                padding: '8px', marginBottom: '8px', border: '3px solid #000', cursor: 'pointer', """
)

with open(r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added clickability to lists.")
