import React, { useState, useEffect } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import LoadingError from '../ui/LoadingError';
import { Settings } from 'lucide-react';

// Map API day abbreviations to full day names and order them correctly
const dayOrder = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
};

// Display order (Sunday first for heatmap)
const displayDayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Available parameters from API
const availableParameters = [
    { id: 'pm25', name: 'PM2.5', unit: 'µg/m³', color: '#FF3366' },
    { id: 'pm10', name: 'PM10', unit: 'µg/m³', color: '#FF8C42' },
    { id: 'no2', name: 'NO2', unit: 'ppb', color: '#7B61FF' },
    { id: 'co', name: 'CO', unit: 'ppm', color: '#FFD700' },
    { id: 'so2', name: 'SO2', unit: 'ppb', color: '#00CFFF' },
    { id: 'o3', name: 'O3', unit: 'ppb', color: '#FF69B4' },
    { id: 'no', name: 'NO', unit: 'ppb', color: '#9370DB' },
    { id: 'nox', name: 'NOx', unit: 'ppb', color: '#20B2AA' },
    { id: 'temperature', name: 'Temperature', unit: '°C', color: '#00FF66' },
    { id: 'relativehumidity', name: 'Humidity', unit: '%', color: '#4169E1' }
];

// Color schemes with their gradient colors
const colorSchemes = {
    'oranges': {
        colors: ['#fff5eb', '#fd8d3c', '#7f2704'],
        gradient: 'linear-gradient(to right, #fff5eb, #fd8d3c, #7f2704)'
    },
    'purples': {
        colors: ['#f2f0f7', '#9e9ac8', '#3f007d'],
        gradient: 'linear-gradient(to right, #f2f0f7, #9e9ac8, #3f007d)'
    },
    'greens': {
        colors: ['#edf8e9', '#74c476', '#005a32'],
        gradient: 'linear-gradient(to right, #edf8e9, #74c476, #005a32)'
    },
    'blues': {
        colors: ['#eff3ff', '#6baed6', '#08519c'],
        gradient: 'linear-gradient(to right, #eff3ff, #6baed6, #08519c)'
    },
    'reds': {
        colors: ['#fee5d9', '#fb6a4a', '#99000d'],
        gradient: 'linear-gradient(to right, #fee5d9, #fb6a4a, #99000d)'
    },
    'greys': {
        colors: ['#f7f7f7', '#969696', '#252525'],
        gradient: 'linear-gradient(to right, #f7f7f7, #969696, #252525)'
    },
    'yellow_orange_red': {
        colors: ['#ffffcc', '#ffb59e', '#bd0026'],
        gradient: 'linear-gradient(to right, #ffffcc, #ffb59e, #bd0026)'
    }
};

// Color scheme for heatmap based on selected parameter
const getColorScheme = (paramId) => {
    const schemes = {
        'pm25': 'oranges',
        'pm10': 'oranges',
        'no2': 'purples',
        'co': 'greens',
        'so2': 'blues',
        'o3': 'reds',
        'no': 'purples',
        'nox': 'greys',
        'temperature': 'reds',
        'relativehumidity': 'blues'
    };
    return schemes[paramId] || 'yellow_orange_red';
};

const CityHeartbeatChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [valueRange, setValueRange] = useState({ min: 0, max: 100 });
    const [selectedParam, setSelectedParam] = useState('pm25');
    const [showParamSelector, setShowParamSelector] = useState(false);
    const [allData, setAllData] = useState(null);

    useEffect(() => {
        fetchAllHourlyData();
    }, []);

    useEffect(() => {
        if (allData) {
            updateDataForSelectedParam(selectedParam);
        }
    }, [selectedParam, allData]);

    const fetchAllHourlyData = async () => {
        try {
            setLoading(true);
            // Using the multi-parameter endpoint
            const response = await fetch(`${import.meta.env.VITE_SERVER1_URL}/api/histanalytics/hourly-patterns`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiResponse = await response.json();
            setAllData(apiResponse);

            // Initialize with default parameter (pm25)
            updateDataForSelectedParam('pm25', apiResponse);
            setError(null);
        } catch (err) {
            console.error('Error fetching hourly patterns:', err);
            setError('Failed to load hourly patterns data');

            // Fallback to mock data if API fails
            const fallbackData = generateFallbackData();
            setData(fallbackData);

            const allValues = fallbackData.flatMap(day => day.data.map(h => h.y));
            const min = Math.min(...allValues);
            const max = Math.max(...allValues);
            setValueRange({ min, max });
        } finally {
            setLoading(false);
        }
    };

    const updateDataForSelectedParam = (paramId, dataSource = allData) => {
        if (!dataSource || !dataSource.data) return;

        // Transform API data to Nivo heatmap format for selected parameter
        const transformedData = transformHourlyDataForParam(dataSource.data, paramId);

        // Calculate actual min and max values from the data
        const allValues = transformedData.flatMap(day => day.data.map(h => h.y));
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);

        setData(transformedData);
        setValueRange({ min, max });
    };

    const transformHourlyDataForParam = (apiData, paramId) => {
        // Group data by day
        const groupedByDay = {};

        apiData.forEach(item => {
            const fullDayName = dayOrder[item.day];
            if (!fullDayName) return; // Skip if day mapping not found

            if (!groupedByDay[fullDayName]) {
                groupedByDay[fullDayName] = {};
            }

            // Convert hour string to number and format for display
            const hourNum = parseInt(item.hour, 10);
            const hourStr = hourNum.toString().padStart(2, '0') + ':00';

            // Get value for selected parameter
            const value = item[paramId];
            if (value !== null && value !== undefined) {
                groupedByDay[fullDayName][hourStr] = value;
            }
        });

        // Create array for each day in the correct display order
        const heatmapData = displayDayOrder.map(day => {
            const dayData = groupedByDay[day] || {};
            const hours = [];

            // Create entries for all 24 hours
            for (let i = 0; i < 24; i++) {
                const hourStr = i.toString().padStart(2, '0') + ':00';
                hours.push({
                    x: hourStr,
                    y: dayData[hourStr] !== undefined ? Math.round(dayData[hourStr] * 100) / 100 : 0
                });
            }

            return {
                id: day,
                data: hours
            };
        });

        return heatmapData;
    };

    const generateFallbackData = () => {
        return displayDayOrder.map(day => {
            const hours = [];
            for (let i = 0; i < 24; i++) {
                const hourStr = i.toString().padStart(2, '0') + ':00';
                let base = 50 + Math.random() * 20;
                // Morning rush hour
                if (i >= 8 && i <= 10) base += 40;
                // Evening rush hour
                if (i >= 19 && i <= 21) base += 30;
                hours.push({ x: hourStr, y: Math.floor(base) });
            }
            return { id: day, data: hours };
        });
    };

    const handleParamChange = (paramId) => {
        setSelectedParam(paramId);
        setShowParamSelector(false);
    };

    // Get current parameter config
    const currentParam = availableParameters.find(p => p.id === selectedParam) || availableParameters[0];

    // Get current color scheme
    const currentScheme = colorSchemes[getColorScheme(selectedParam)];

    if (loading) return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px]">
            <LoadingError type="loading" message="Loading hourly patterns..." />
        </div>
    );

    if (error) return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px]">
            <LoadingError type="error" message={error} />
        </div>
    );

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[500px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <h2 className="text-2xl font-black uppercase tracking-tight border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    CITY HEARTBEAT (HOURLY)
                </h2>

                {/* Parameter Selector Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowParamSelector(!showParamSelector)}
                        className="bg-white text-black border-4 border-black px-4 py-2 font-black uppercase flex items-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-none text-sm"
                    >
                        <Settings size={16} strokeWidth={3} /> {currentParam.name}
                    </button>

                    {showParamSelector && (
                        <div className="absolute right-0 mt-2 w-64 p-4 border-4 border-black bg-gray-50 z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-bold mb-2 border-b-2 border-black pb-1">Select Parameter</h3>
                            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                                {availableParameters.map(param => (
                                    <button
                                        key={param.id}
                                        onClick={() => handleParamChange(param.id)}
                                        className={`flex items-center justify-between p-2 border-2 border-black font-bold hover:bg-gray-100 w-full text-left ${selectedParam === param.id ? 'bg-gray-200' : ''
                                            }`}
                                    >
                                        <span style={{ color: param.color }}>{param.name}</span>
                                        <span className="text-xs bg-black text-white px-1">{param.unit}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="font-bold mb-6">
                {currentParam.name} concentration by hour and day of week ({currentParam.unit})
            </p>

            <div className="flex-grow font-bold focus:outline-none focus:ring-none text-black">
                <ResponsiveHeatMap
                    data={data}
                    margin={{ top: 40, right: 20, bottom: 40, left: 100 }}
                    valueFormat=">-.1f"
                    xInnerPadding={0.05}
                    yInnerPadding={0.05}
                    axisTop={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Hour of Day',
                        legendOffset: -35,
                    }}
                    axisRight={null}
                    axisBottom={null}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Day of Week',
                        legendPosition: 'middle',
                        legendOffset: -80,
                    }}
                    colors={{
                        type: 'sequential',
                        scheme: getColorScheme(selectedParam),
                        minValue: valueRange.min,
                        maxValue: valueRange.max
                    }}
                    emptyColor="#FDFBF7"
                    cellBorderWidth={2}
                    cellBorderColor="#000000"
                    labelTextColor="#000000"
                    enableLabels={true}
                    label={(cell) => cell.data.y?.toFixed(1) || ''}
                    theme={{
                        fontFamily: 'monospace',
                        fontSize: 10,
                        textColor: '#000000',
                        axis: {
                            domain: { line: { stroke: '#000000', strokeWidth: 2 } },
                            ticks: {
                                line: { stroke: '#000000', strokeWidth: 2 },
                                text: { fontWeight: 'bold', fontSize: 10 }
                            }
                        },
                        legends: {
                            text: { fontWeight: 'bold', fontSize: 10 }
                        }
                    }}
                />
            </div>

            {/* Legend with dynamic color gradient based on selected parameter */}
            <div className="mt-4 pt-4 border-t-4 border-black">
                <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5" style={{ backgroundColor: currentScheme.colors[0], border: '2px solid black' }}></div>
                            <span>Low ({valueRange.min.toFixed(1)} {currentParam.unit})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5" style={{ backgroundColor: currentScheme.colors[1], border: '2px solid black' }}></div>
                            <span>Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5" style={{ backgroundColor: currentScheme.colors[2], border: '2px solid black' }}></div>
                            <span>High ({valueRange.max.toFixed(1)} {currentParam.unit})</span>
                        </div>
                    </div>
                    <div className="bg-black text-white px-3 py-1 border-2 border-black text-xs">
                        {currentParam.name} ({currentParam.unit})
                    </div>
                </div>

                {/* Dynamic Color Gradient Bar */}
                <div className="w-full h-6 mt-2 relative border-2 border-black">
                    <div className="absolute inset-0" style={{
                        background: currentScheme.gradient
                    }}></div>
                </div>
                <div className="flex justify-between text-xs font-bold mt-1">
                    <span>{valueRange.min.toFixed(1)}</span>
                    <span>{((valueRange.max - valueRange.min) / 2 + valueRange.min).toFixed(1)}</span>
                    <span>{valueRange.max.toFixed(1)}</span>
                </div>
            </div>
        </div>
    );
};

export default CityHeartbeatChart;