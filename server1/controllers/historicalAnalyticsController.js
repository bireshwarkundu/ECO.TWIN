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
 * 2. GET HOURLY PATTERNS (Heatmap) - Multi-parameter version
 * Returns all parameters in one response
 */
export const getHourlyPatterns = (req, res) => {
    try {
        const allParams = [
            'co', 'no', 'no2', 'nox', 'o3', 'pm10', 'pm25', 
            'relativehumidity', 'so2', 'temperature'
        ];

        // Get data with all parameters
        const data = getMergedData(allParams);
        
        if (!data || !Array.isArray(data)) {
            return res.status(500).json({ error: 'Invalid data received' });
        }

        // Initialize grouped data for all parameters
        const grouped = {};

        data.forEach(row => {
            if (!row.timestamp) return;

            const date = new Date(row.timestamp);
            if (isNaN(date.getTime())) return;

            const day = date.toLocaleString('default', { weekday: 'short' });
            const hour = date.getHours().toString().padStart(2, '0');
            const key = `${day}-${hour}`;

            if (!grouped[key]) {
                // Initialize with all parameters
                grouped[key] = { 
                    day, 
                    hour,
                    counts: {},
                    sums: {}
                };
                
                // Initialize sums and counts for all parameters
                allParams.forEach(param => {
                    grouped[key].sums[param] = 0;
                    grouped[key].counts[param] = 0;
                });
            }
            
            // Add values for each parameter
            allParams.forEach(param => {
                const value = row[param];
                if (typeof value === 'number' && !isNaN(value)) {
                    grouped[key].sums[param] += value;
                    grouped[key].counts[param] += 1;
                }
            });
        });

        // Transform to final format
        const result = Object.values(grouped).map(item => {
            const entry = {
                day: item.day,
                hour: item.hour
            };
            
            // Calculate averages for each parameter
            allParams.forEach(param => {
                if (item.counts[param] > 0) {
                    entry[param] = Math.round((item.sums[param] / item.counts[param]) * 100) / 100;
                } else {
                    entry[param] = null; // or 0, depending on your preference
                }
            });
            
            return entry;
        });

        // Sort results
        const dayOrder = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
        result.sort((a, b) => {
            if (dayOrder[a.day] !== dayOrder[b.day]) {
                return dayOrder[a.day] - dayOrder[b.day];
            }
            return parseInt(a.hour) - parseInt(b.hour);
        });

        // Units for reference
        const units = {
            'pm25': 'µg/m³',
            'pm10': 'µg/m³',
            'no2': 'ppb',
            'no': 'ppb',
            'nox': 'ppb',
            'co': 'ppm',
            'so2': 'ppb',
            'o3': 'ppb',
            'temperature': '°C',
            'relativehumidity': '%'
        };

        res.json({
            parameters: allParams,
            units: units,
            data: result
        });

    } catch (error) {
        console.error('Error in getAllHourlyPatterns:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * 3. GET DAILY SUMMARY (Calendar)
 * Query param: ?param=pm25 (default) or ?param=pm10, ?param=no2, etc.
 * Returns: [{ date: "2025-02-19", value: 50 }] for single parameter
 * 
 * Or if no param specified: [{ date: "2025-02-19", pm25: 50, pm10: 75, no2: 23, ... }]
 */
export const getDailySummary = (req, res) => {
    try {
        // All available parameters from your API
        const allParams = [
            'pm25', 'pm10', 'no2', 'no', 'nox', 'co', 'so2', 'o3',
            'temperature', 'relativehumidity'
        ];
        
        // Check if a specific parameter is requested
        const requestedParam = req.query.param;
        
        // If specific parameter requested, validate it
        if (requestedParam && !allParams.includes(requestedParam)) {
            return res.status(400).json({ 
                error: 'Invalid parameter. Must be one of: ' + allParams.join(', ') 
            });
        }

        // Get data with all parameters
        const data = getMergedData(allParams);
        
        if (!data || !Array.isArray(data)) {
            return res.status(500).json({ error: 'Invalid data received' });
        }

        console.log(`Processing daily summary for ${data.length} records`);

        // Group data by date
        const grouped = {};

        data.forEach(row => {
            if (!row.timestamp) return;
            
            const dateKey = row.timestamp.substring(0, 10); // "2025-02-19"

            if (!grouped[dateKey]) {
                // Initialize with empty arrays for all parameters
                grouped[dateKey] = {};
                allParams.forEach(param => {
                    grouped[dateKey][param] = [];
                });
            }

            // Add values for each parameter
            allParams.forEach(param => {
                if (typeof row[param] === 'number' && !isNaN(row[param])) {
                    grouped[dateKey][param].push(row[param]);
                }
            });
        });

        // If specific parameter requested, return simplified format
        if (requestedParam) {
            const result = Object.keys(grouped)
                .map(date => {
                    const values = grouped[date][requestedParam];
                    const avgValue = values.length > 0 
                        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
                        : null;
                    
                    // Only include dates that have data
                    if (avgValue !== null) {
                        return {
                            date,
                            value: avgValue
                        };
                    }
                    return null;
                })
                .filter(item => item !== null)
                .sort((a, b) => a.date.localeCompare(b.date));

            // Add metadata
            const units = {
                'pm25': 'µg/m³',
                'pm10': 'µg/m³',
                'no2': 'ppb',
                'no': 'ppb',
                'nox': 'ppb',
                'co': 'ppm',
                'so2': 'ppb',
                'o3': 'ppb',
                'temperature': '°C',
                'relativehumidity': '%'
            };

            return res.json({
                parameter: requestedParam,
                unit: units[requestedParam] || '',
                data: result
            });
        }

        // Otherwise return all parameters
        const result = Object.keys(grouped)
            .map(date => {
                const entry = { date };
                
                allParams.forEach(param => {
                    const values = grouped[date][param];
                    if (values.length > 0) {
                        entry[param] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
                    } else {
                        entry[param] = null;
                    }
                });
                
                return entry;
            })
            .sort((a, b) => a.date.localeCompare(b.date));

        // Units for reference
        const units = {
            'pm25': 'µg/m³',
            'pm10': 'µg/m³',
            'no2': 'ppb',
            'no': 'ppb',
            'nox': 'ppb',
            'co': 'ppm',
            'so2': 'ppb',
            'o3': 'ppb',
            'temperature': '°C',
            'relativehumidity': '%'
        };

        // Log summary stats
        console.log('Daily summary generated:', {
            dateRange: result.length > 0 
                ? `${result[0].date} to ${result[result.length-1].date}`
                : 'No data',
            totalDays: result.length,
            parameters: allParams
        });

        res.json({
            parameters: allParams,
            units: units,
            data: result
        });

    } catch (error) {
        console.error('Error in getDailySummary:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
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