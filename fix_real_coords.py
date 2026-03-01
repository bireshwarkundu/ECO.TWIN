import re

filepath = r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Exact precise real-world coordinates for the zones
exact_coords = {
    "City Centre Salt Lake": (22.5878, 88.4090),
    "Karunamayee Bus Stand": (22.5837, 88.4253),
    "Salt Lake Sec V IT Hub": (22.5760, 88.4323),
    "Ultadanga Connector": (22.5937, 88.3948),
    "Salt Lake Stadium Gate": (22.5681, 88.4013),
    "Narayanpur Bus Terminus": (22.6134, 88.4527),
    "Bidhannagar Sector I": (22.5952, 88.4101),
    "Bidhannagar Sector II": (22.5932, 88.4170),
    "Bidhannagar Sector III": (22.5881, 88.4162),
    "Central Park Salt Lake": (22.5854, 88.4140),
    "Baguiati Connector": (22.6139, 88.4294),
    "DLF IT Park Approach": (22.5785, 88.4590),
    "Ecospace Business Park": (22.5856, 88.4747),
    "Nicco Park Road": (22.5714, 88.4213)
}

match = re.search(r'const TRAFFIC_ZONES = \[\s*(.*?)\s*\];', text, re.DOTALL)
if match:
    zones_text = match.group(1)
    lines = zones_text.split('\n')
    
    new_lines = []
    
    for line in lines:
        for name, (lat, lon) in exact_coords.items():
            if f'zone_name: "{name}"' in line:
                line = re.sub(r'latitude:\s*[\d\.]+', f'latitude: {lat}', line)
                line = re.sub(r'longitude:\s*[\d\.]+', f'longitude: {lon}', line)
                break
        new_lines.append(line)
        
    new_zones_text = '\n'.join(new_lines)
    text = text.replace(match.group(0), f'const TRAFFIC_ZONES = [\n{new_zones_text}\n];')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("Coordinates pinpointed successfully.")
