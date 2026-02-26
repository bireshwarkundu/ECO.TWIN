import { getMergedData } from '../models/dataModel.js';

// Helper: Safely calculate average
const calculateAvg = (arr) => {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return parseFloat((sum / arr.length).toFixed(2));
};

/**
 * 1. GET MONTHLY TRENDS
 * Returns: [{ month: "Feb", pm25: 45.2, co: 0.15, ... }]
 */
export const getMonthlyTrends = (req, res) => {
    // List all parameters you have files for
    const params = ['pm25', 'pm10', 'no2', 'co', 'so2', 'o3', 'temperature', 'relativehumidity', 'wind_speed'];
    
    const data = getMergedData(params);
    const grouped = {};

    data.forEach(row => {
        const date = new Date(row.timestamp);
        if (isNaN(date.getTime())) return; // Skip invalid dates

        const month = date.toLocaleString('default', { month: 'short' }); // "Feb"

        if (!grouped[month]) {
            grouped[month] = {};
            params.forEach(p => grouped[month][p] = []);
        }

        params.forEach(p => {
            // Only push if value exists (is not NaN/undefined)
            if (typeof row[p] === 'number' && !isNaN(row[p])) {
                grouped[month][p].push(row[p]);
            }
        });
    });

    const result = Object.keys(grouped).map(month => {
        const entry = { month };
        params.forEach(p => {
            entry[p] = calculateAvg(grouped[month][p]);
        });
        return entry;
    });

    res.json(result);
};

/**
 * 2. GET HOURLY PATTERNS (Heatmap)
 * Returns: [{ day: "Mon", hour: "09", value: 45 }]
 */
export const getHourlyPatterns = (req, res) => {
    // We use 'pm25' as the default pollution indicator
    const data = getMergedData(['pm25']); 
    const grouped = {};

    data.forEach(row => {
        const date = new Date(row.timestamp);
        if (isNaN(date.getTime())) return;

        const day = date.toLocaleString('default', { weekday: 'short' }); // "Mon"
        const hour = date.getHours().toString().padStart(2, '0'); // "09"
        const key = `${day}-${hour}`;

        if (!grouped[key]) grouped[key] = { day, hour, values: [] };
        
        if (typeof row.pm25 === 'number') {
            grouped[key].values.push(row.pm25);
        }
    });

    const result = Object.values(grouped).map(item => ({
        day: item.day,
        hour: item.hour,
        value: calculateAvg(item.values)
    }));

    res.json(result);
};

/**
 * 3. GET DAILY SUMMARY (Calendar)
 * Returns: [{ date: "2025-02-19", pm25: 50, co: 0.2 }]
 */
export const getDailySummary = (req, res) => {
    const params = ['pm25', 'co'];
    const data = getMergedData(params);
    const grouped = {};

    data.forEach(row => {
        const dateKey = row.timestamp.substring(0, 10); // "2025-02-19"

        if (!grouped[dateKey]) {
            grouped[dateKey] = { pm25: [], co: [] };
        }

        if (typeof row.pm25 === 'number') grouped[dateKey].pm25.push(row.pm25);
        if (typeof row.co === 'number') grouped[dateKey].co.push(row.co);
    });

    const result = Object.keys(grouped).map(date => ({
        date,
        pm25: calculateAvg(grouped[date].pm25),
        co: calculateAvg(grouped[date].co)
    }));

    res.json(result);
};

/**
 * 4. GET WIND CORRELATION (Radar Chart)
 * Returns: [{ direction: "N", pm25: 40 }]
 */
export const getWindCorrelation = (req, res) => {
    // Needs specific files: "wind_direction.json" and "pm25.json"
    // Ensure your file is named "wind_direction.json" or "wind_dir.json" (match exact filename)
    const data = getMergedData(['wind_direction', 'pm25']);
    const bins = { N: [], NE: [], E: [], SE: [], S: [], SW: [], W: [], NW: [] };

    data.forEach(row => {
        const deg = row.wind_direction;
        const pm = row.pm25;

        if (deg === undefined || pm === undefined) return;

        let dir = "N";
        if (deg >= 22.5 && deg < 67.5) dir = "NE";
        else if (deg >= 67.5 && deg < 112.5) dir = "E";
        else if (deg >= 112.5 && deg < 157.5) dir = "SE";
        else if (deg >= 157.5 && deg < 202.5) dir = "S";
        else if (deg >= 202.5 && deg < 247.5) dir = "SW";
        else if (deg >= 247.5 && deg < 292.5) dir = "W";
        else if (deg >= 292.5 && deg < 337.5) dir = "NW";

        bins[dir].push(pm);
    });

    const result = Object.keys(bins).map(dir => ({
        direction: dir,
        pm25: calculateAvg(bins[dir])
    }));

    res.json(result);
};