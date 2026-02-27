
// 1. Map specific Sensor IDs to readable Parameter Names
// This ensures we only read the sensors you identified as active/correct.
const SENSOR_MAP = {
    12235992: 'o3',
    12235996: 'so2',
    12235997: 'temperature',
    12235995: 'humidity',         // Mapped from 'relativehumidity' for cleaner UI
    12235993: 'pm10',
    12235994: 'pm25',
    12235989: 'co',
    12235991: 'no2',
    12235990: 'no',
    14341974: 'wind_speed',
    14341973: 'wind_direction',
    14341972: 'nox'
};

export const getRealTimeData = async (req, res) => {
    try {
        const LOCATION_ID = '10851';
        // Add your API Key here if you have one, otherwise leave empty
        const API_KEY = process.env.openAQI_API_Key;
        
        // 1. Fetch from OpenAQ API
        const response = await fetch(`https://api.openaq.org/v3/locations/${LOCATION_ID}/latest`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': API_KEY 
            }
        });

        if (!response.ok) {
            throw new Error(`OpenAQ API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const rawResults = data.results || [];

        // 2. Initialize Result Object
        // We set null as default so the Frontend knows if a sensor is offline
        const liveStatus = {
            timestamp: null,
            pm25: null,
            pm10: null,
            co: null,
            no2: null,
            no: null,
            nox: null,
            o3: null,
            so2: null,
            temperature: null,
            humidity: null,
            wind_speed: null,
            wind_direction: null
        };

        let latestTimestamp = null;

        // 3. Process & Filter Results
        rawResults.forEach(reading => {
            const sensorId = reading.sensorsId; 
            const paramName = SENSOR_MAP[sensorId]; 

            // Filter A: Is this a sensor ID we care about?
            if (!paramName) return;

            // Filter B: Is the data fresh? (Check if it's from 2026)
            // reading.datetime.local example: "2026-02-27T11:30:00+05:30"
            const localTime = reading.datetime.local;
            const readingYear = localTime.substring(0, 4);
            
            if (readingYear !== '2026') return;

            // If passed filters, save the value
            liveStatus[paramName] = reading.value;

            // Capture the timestamp (we take the first valid one we find)
            if (!latestTimestamp) {
                latestTimestamp = localTime;
            }
        });

        liveStatus.timestamp = latestTimestamp;

        // 4. Return the Clean Object
        res.json(liveStatus);

    } catch (error) {
        console.error("❌ Live Data Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch live data" });
    }
};