// Station configuration with sensor mappings
const STATIONS = {
    "bidhanagar-east": {
        id: "10851",
        name: "Bidhannagar East",
        sensors: {
            12235992: 'o3',
            12235996: 'so2',
            12235997: 'temperature',
            12235995: 'humidity',
            12235993: 'pm10',
            12235994: 'pm25',
            12235989: 'co',
            12235991: 'no2',
            12235990: 'no',
            14341974: 'wind_speed',
            14341973: 'wind_direction',
            14341972: 'nox'
        }
    },
    "Dasnagar": {
        id: "3409530",
        name: "Dasnagar",
        sensors: {
            12244864: 'o3',
            12244868: 'so2',
            12244869: 'temperature',
            12244867: 'humidity',
            12244865: 'pm10',
            12244866: 'pm25',
            12244861: 'co',
            12244863: 'no2',
            12244862: 'no',
            14341680: 'wind_speed',
            14341679: 'wind_direction',
            14341678: 'nox'
        }
    },
    "Rabindra_Bharatia": {
        id: "3409320",
        name: "Rabindra Bharatia",
        sensors: {
            12235563: 'o3',
            12235567: 'so2',
            12235568: 'temperature',
            12235566: 'humidity',
            12235564: 'pm10',
            12235565: 'pm25',
            12235560: 'co',
            12235562: 'no2',
            12235561: 'no',
            14341862: 'wind_speed',
            14341861: 'wind_direction',
            14341860: 'nox'
        }
    },
    "Ballygunge": {
        id: "10918",
        name: "Ballygunge",
        sensors: {
            12236010: 'o3',
            12236014: 'so2',
            12236015: 'temperature',
            12236013: 'humidity',
            12236011: 'pm10',
            12236012: 'pm25',
            12236007: 'co',
            12236009: 'no2',
            12236008: 'no',
            14341977: 'wind_speed',
            14341976: 'wind_direction',
            14341975: 'nox'
        }
    }
};

// All possible parameters we want to track
const ALL_PARAMETERS = [
    'pm25', 'pm10', 'no2', 'no', 'nox', 'co', 'so2', 'o3',
    'temperature', 'humidity', 'wind_speed', 'wind_direction'
];

// Helper function to fetch data for a single station
const fetchStationData = async (stationKey, station, API_KEY) => {
    try {
        const response = await fetch(`https://api.openaq.org/v3/locations/${station.id}/latest`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': API_KEY 
            }
        });

        if (!response.ok) {
            console.error(`❌ Failed to fetch ${stationKey}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const rawResults = data.results || [];

        // Initialize station data with null values
        const stationData = {
            station_id: station.id,
            station_name: station.name,
            station_key: stationKey,
            timestamp: null,
            ...Object.fromEntries(ALL_PARAMETERS.map(p => [p, null]))
        };

        let latestTimestamp = null;

        // Process readings
        rawResults.forEach(reading => {
            const sensorId = reading.sensorsId;
            const paramName = station.sensors[sensorId];

            // Skip if not a sensor we care about for this station
            if (!paramName) return;

            // Check if data is from 2026
            const localTime = reading.datetime.local;
            const readingYear = localTime.substring(0, 4);
            
            if (readingYear !== '2026') return;

            // Save the value
            stationData[paramName] = reading.value;

            // Capture the first valid timestamp
            if (!latestTimestamp) {
                latestTimestamp = localTime;
            }
        });

        stationData.timestamp = latestTimestamp;
        
        // Log success
        console.log(`✅ Fetched ${stationKey}:`, {
            timestamp: latestTimestamp,
            active_sensors: Object.keys(stationData).filter(k => 
                ALL_PARAMETERS.includes(k) && stationData[k] !== null
            ).length
        });

        return stationData;

    } catch (error) {
        console.error(`❌ Error fetching ${stationKey}:`, error.message);
        return null;
    }
};

export const getRealTimeData = async (req, res) => {
    try {
        const API_KEY = process.env.openAQI_API_Key;
        
        if (!API_KEY) {
            console.warn("⚠️ No API Key found. Using simulated data.");
        }

        // Fetch data from all stations in parallel
        const fetchPromises = Object.entries(STATIONS).map(([key, station]) => 
            fetchStationData(key, station, API_KEY)
        );

        const results = await Promise.all(fetchPromises);

        // Build response object with only successful stations
        const response = {};
        results.forEach((stationData, index) => {
            const stationKey = Object.keys(STATIONS)[index];
            if (stationData) {
                response[stationKey] = stationData;
            } else {
                // Provide fallback with null values for failed stations
                response[stationKey] = {
                    station_id: STATIONS[stationKey].id,
                    station_name: STATIONS[stationKey].name,
                    station_key: stationKey,
                    timestamp: null,
                    ...Object.fromEntries(ALL_PARAMETERS.map(p => [p, null])),
                    error: "Failed to fetch data"
                };
            }
        });

        // Add metadata
        const successfulStations = Object.values(response).filter(s => s.timestamp !== null).length;
        const totalStations = Object.keys(STATIONS).length;

        const finalResponse = {
            success: true,
            timestamp: new Date().toISOString(),
            metadata: {
                total_stations: totalStations,
                successful_stations: successfulStations,
                failed_stations: totalStations - successfulStations
            },
            stations: response
        };

        console.log(`📊 Summary: ${successfulStations}/${totalStations} stations updated successfully`);
        
        res.json(finalResponse);

    } catch (error) {
        console.error("❌ Live Data Fetch Error:", error.message);
        
        // Return partial data if any was fetched, or error if completely failed
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch live data",
            message: error.message,
            stations: {}
        });
    }
};

// Optional: Endpoint to get a specific station's data
export const getStationData = async (req, res) => {
    try {
        const { stationKey } = req.params;
        const API_KEY = process.env.openAQI_API_Key;

        if (!STATIONS[stationKey]) {
            return res.status(404).json({ 
                success: false,
                error: "Station not found",
                valid_stations: Object.keys(STATIONS)
            });
        }

        const stationData = await fetchStationData(stationKey, STATIONS[stationKey], API_KEY);
        
        if (!stationData) {
            return res.status(500).json({ 
                success: false,
                error: `Failed to fetch data for ${stationKey}`
            });
        }

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            station: stationData
        });

    } catch (error) {
        console.error("❌ Station Data Fetch Error:", error.message);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};