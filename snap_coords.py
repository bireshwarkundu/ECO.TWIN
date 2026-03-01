import re
import json
import urllib.request
import time

filepath = r'c:\Users\LENOVO\OneDrive\Desktop\ECO.TWIN\frontend\src\pages\ModelsSimulation.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Extract TRAFFIC_ZONES
match = re.search(r'const TRAFFIC_ZONES = \[\s*(.*?)\s*\];', text, re.DOTALL)
if match:
    zones_text = match.group(1)
    lines = zones_text.split('\n')
    
    new_lines = []
    
    for line in lines:
        if 'latitude' in line and 'longitude' in line:
            lat_match = re.search(r'latitude:\s*([\d\.]+)', line)
            lon_match = re.search(r'longitude:\s*([\d\.]+)', line)
            
            if lat_match and lon_match:
                lat = float(lat_match.group(1))
                lon = float(lon_match.group(1))
                
                # Fetch nearest from OSRM
                url = f"http://router.project-osrm.org/nearest/v1/driving/{lon},{lat}"
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'EcoTwin-Tool'})
                    with urllib.request.urlopen(req) as response:
                        data = json.loads(response.read().decode())
                        if 'waypoints' in data and len(data['waypoints']) > 0:
                            snapped_lon, snapped_lat = data['waypoints'][0]['location']
                            line = re.sub(r'latitude:\s*[\d\.]+', f'latitude: {snapped_lat:.5f}', line)
                            line = re.sub(r'longitude:\s*[\d\.]+', f'longitude: {snapped_lon:.5f}', line)
                            print(f"Snapped {lat},{lon} -> {snapped_lat:.5f},{snapped_lon:.5f}")
                except Exception as e:
                    print(f"Error for {lat},{lon}: {e}")
                
                time.sleep(0.1)
                
        new_lines.append(line)
    
    new_zones_text = '\n'.join(new_lines)
    text = text.replace(match.group(0), f'const TRAFFIC_ZONES = [\n{new_zones_text}\n];')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("Coordinates snapped to nearest street successfully.")
