import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveCalendar } from '@nivo/calendar';
import { Download, Settings } from 'lucide-react';

// Keep your existing data for other charts
const daysOfWeek = ['Sunday', 'Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday'];
const hourlyHeatmapData = daysOfWeek.map(day => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
        const hourStr = i.toString().padStart(2, '0') + ':00';
        let base = 50 + Math.random() * 20;
        if (i >= 8 && i <= 10) base += 40;
        if (i >= 19 && i <= 21) base += 30;
        hours.push({ x: hourStr, y: Math.floor(base) });
    }
    return { id: day, data: hours };
});

const calendarData = [];
for (let m = 1; m <= 12; m++) {
    const mStr = m.toString().padStart(2, '0');
    for (let d = 1; d <= 28; d++) {
        const dStr = d.toString().padStart(2, '0');
        calendarData.push({ day: `2025-${mStr}-${dStr}`, value: Math.floor(Math.random() * 200) + 20 });
    }
}

const windRoseData = [
    { direction: 'N', value: 180 },
    { direction: 'NE', value: 120 },
    { direction: 'E', value: 60 },
    { direction: 'SE', value: 40 },
    { direction: 'S', value: 50 },
    { direction: 'SW', value: 80 },
    { direction: 'W', value: 100 },
    { direction: 'NW', value: 150 }
];

// Color mapping for different parameters
const parameterColors = {
    pm25: '#FF3366',
    pm10: '#FF8C42',
    no2: '#7B61FF',
    co: '#FFD700',
    so2: '#00CFFF',
    o3: '#FF69B4',
    temperature: '#00FF66',
    relativehumidity: '#4169E1',
    wind_speed: '#9370DB'
};

// Parameter display names and units
const parameterConfig = {
    pm25: { name: 'PM2.5', unit: 'µg/m³', color: '#FF3366' },
    pm10: { name: 'PM10', unit: 'µg/m³', color: '#FF8C42' },
    no2: { name: 'NO2', unit: 'ppb', color: '#7B61FF' },
    co: { name: 'CO', unit: 'ppm', color: '#FFD700' },
    so2: { name: 'SO2', unit: 'ppb', color: '#00CFFF' },
    o3: { name: 'O3', unit: 'ppb', color: '#FF69B4' },
    temperature: { name: 'Temperature', unit: '°C', color: '#00FF66' },
    relativehumidity: { name: 'Humidity', unit: '%', color: '#4169E1' },
    wind_speed: { name: 'Wind Speed', unit: 'm/s', color: '#9370DB' }
};

const BrutalistTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono font-bold">
                <p className="border-b-2 border-black pb-2 mb-2 uppercase text-lg">{label}</p>
                {payload.map((entry, index) => {
                    const config = parameterConfig[entry.dataKey] || { name: entry.name, unit: '' };
                    return (
                        <p key={`item-${index}`} style={{ color: entry.color, fontWeight: 900 }}>
                            {config.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {config.unit}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

const HistoricalDashboard = () => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for selected parameters
    const [selectedParams, setSelectedParams] = useState({
        pm25: true,
        pm10: true,
        no2: true,
        co: false,
        so2: false,
        o3: false,
        temperature: true,
        relativehumidity: false,
        wind_speed: false
    });

    // State for showing/hiding parameter selector
    const [showParamSelector, setShowParamSelector] = useState(false);

    useEffect(() => {
        const fetchMonthlyTrends = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3000/api/histanalytics/monthly-trends');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Transform the data to match the expected format
                const transformedData = data.map(item => ({
                    month: item.month,
                    pm25: item.pm25,
                    pm10: item.pm10,
                    no2: item.no2,
                    co: item.co,
                    so2: item.so2,
                    o3: item.o3,
                    temperature: item.temperature,
                    relativehumidity: item.relativehumidity,
                    wind_speed: item.wind_speed
                }));
                
                setMonthlyData(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching monthly trends:', err);
                setError('Failed to load monthly trends data. Using fallback data.');
                
                // Fallback data using the provided API data
                setMonthlyData([
                    { month: 'Feb', pm25: 46.13, pm10: 76.49, no2: 43.14, co: 0.25, so2: 7.06, o3: 29.34, temperature: 24.27, relativehumidity: 74.75, wind_speed: 0 },
                    { month: 'Mar', pm25: 36.67, pm10: 66.34, no2: 25.36, co: 0.18, so2: 7.27, o3: 31, temperature: 27.47, relativehumidity: 63.89, wind_speed: 0 },
                    { month: 'Apr', pm25: 19.51, pm10: 45.69, no2: 11.39, co: 0.41, so2: 6.76, o3: 27.82, temperature: 28.95, relativehumidity: 74.51, wind_speed: 0 },
                    { month: 'May', pm25: 19.13, pm10: 50.38, no2: 11.02, co: 0.51, so2: 11.17, o3: 28.19, temperature: 29.56, relativehumidity: 76.51, wind_speed: 0 },
                    { month: 'Jun', pm25: 18.84, pm10: 48.09, no2: 10.98, co: 0.52, so2: 7.31, o3: 28.67, temperature: 28.88, relativehumidity: 86.72, wind_speed: 0 },
                    { month: 'Jul', pm25: 14.07, pm10: 36.34, no2: 10.68, co: 0.48, so2: 7.37, o3: 25.39, temperature: 27.83, relativehumidity: 93.3, wind_speed: 0 },
                    { month: 'Aug', pm25: 13.91, pm10: 31.83, no2: 10.79, co: 0.56, so2: 8.02, o3: 28.16, temperature: 27.78, relativehumidity: 91.43, wind_speed: 0 },
                    { month: 'Sept', pm25: 16.37, pm10: 42.31, no2: 11.65, co: 0.74, so2: 7.65, o3: 27.3, temperature: 28.51, relativehumidity: 87.69, wind_speed: 0 },
                    { month: 'Oct', pm25: 31.05, pm10: 70.44, no2: 9.39, co: 0.73, so2: 8.46, o3: 25.38, temperature: 27.42, relativehumidity: 82.51, wind_speed: 0 },
                    { month: 'Nov', pm25: 62.35, pm10: 131.05, no2: 12.28, co: 1.47, so2: 8.91, o3: 23.51, temperature: 23.14, relativehumidity: 68.36, wind_speed: 0 },
                    { month: 'Dec', pm25: 91.81, pm10: 176.99, no2: 17.18, co: 1.91, so2: 16.64, o3: 21.11, temperature: 18.67, relativehumidity: 71.93, wind_speed: 0 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyTrends();
    }, []);

    const handleParamToggle = (param) => {
        setSelectedParams(prev => ({
            ...prev,
            [param]: !prev[param]
        }));
    };

    const selectAll = () => {
        const allSelected = Object.keys(selectedParams).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setSelectedParams(allSelected);
    };

    const clearAll = () => {
        const allCleared = Object.keys(selectedParams).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});
        setSelectedParams(allCleared);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-mono text-black selection:bg-[#00FF66]">
            {/* Header Section */}
            <div className="mb-10 border-b-4 border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight bg-[#FFCC00] px-6 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        HISTORICAL ARCHIVE
                    </h1>
                    <p className="text-lg md:text-xl font-bold bg-white border-2 border-black px-4 py-2 mt-6 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Aggregated urban atmospheric metrics &amp; source tracking.
                    </p>
                </div>
                <button className="bg-[#00FF66] border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-none cursor-pointer" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <Download size={24} strokeWidth={3} /> EXPORT DATA
                </button>
            </div>

            {/* Loading/Error Indicators */}
            {loading && (
                <div className="mb-4 p-4 bg-blue-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
                    Loading monthly trends data...
                </div>
            )}
            
            {error && (
                <div className="mb-4 p-4 bg-yellow-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
                    ⚠️ {error}
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 pb-16">

                {/* 1. Seasonal Trend - With all parameters and checkboxes */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[600px] xl:col-span-2">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                SEASONAL TREND (MONTHLY)
                            </h2>
                            <p className="font-bold mt-2">All parameters from API - Select which to display</p>
                        </div>
                        
                        {/* Parameter Selector Toggle Button */}
                        <button 
                            onClick={() => setShowParamSelector(!showParamSelector)}
                            className="bg-black text-white border-4 border-black px-4 py-2 font-bold uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-none"
                        >
                            <Settings size={20} /> PARAMETERS
                        </button>
                    </div>

                    {/* Parameter Checkboxes */}
                    {showParamSelector && (
                        <div className="mb-6 p-4 border-4 border-black bg-gray-50">
                            <div className="flex flex-wrap gap-4 mb-4">
                                <button 
                                    onClick={selectAll}
                                    className="bg-[#00FF66] border-2 border-black px-3 py-1 font-bold text-sm uppercase hover:bg-[#00dd55]"
                                >
                                    Select All
                                </button>
                                <button 
                                    onClick={clearAll}
                                    className="bg-[#FF3366] border-2 border-black px-3 py-1 font-bold text-sm uppercase text-white hover:bg-[#dd2255]"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {Object.keys(parameterConfig).map(param => (
                                    <label key={param} className="flex items-center gap-2 font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedParams[param]}
                                            onChange={() => handleParamToggle(param)}
                                            className="w-5 h-5 border-4 border-black accent-black"
                                        />
                                        <span style={{ color: parameterConfig[param].color }}>
                                            {parameterConfig[param].name} ({parameterConfig[param].unit})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    <div className="flex-grow">
                        {monthlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid stroke="#000" strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="#000" 
                                        tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }} 
                                    />
                                    <YAxis 
                                        yAxisId="left"
                                        stroke="#000" 
                                        tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }}
                                        label={{ value: 'Concentration', angle: -90, position: 'insideLeft', style: { fontWeight: 'bold' } }}
                                    />
                                    <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#000" 
                                        tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }}
                                        label={{ value: 'Temperature/Humidity', angle: 90, position: 'insideRight', style: { fontWeight: 'bold' } }}
                                    />
                                    <Tooltip content={<BrutalistTooltip />} />
                                    <Legend 
                                        wrapperStyle={{ fontFamily: 'monospace', fontWeight: 'bold', paddingTop: '10px' }} 
                                    />
                                    
                                    {/* Dynamically render lines based on selected parameters */}
                                    {selectedParams.pm25 && (
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="pm25" 
                                            name="PM2.5"
                                            stroke={parameterConfig.pm25.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.pm25.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                    
                                    {selectedParams.pm10 && (
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="pm10" 
                                            name="PM10"
                                            stroke={parameterConfig.pm10.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.pm10.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                    
                                    {selectedParams.no2 && (
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="no2" 
                                            name="NO2"
                                            stroke={parameterConfig.no2.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.no2.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                    
                                    {selectedParams.co && (
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="co" 
                                            name="CO"
                                            stroke={parameterConfig.co.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.co.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                    
                                    {selectedParams.so2 && (
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="so2" 
                                            name="SO2"
                                            stroke={parameterConfig.so2.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.so2.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                    
                                    {selectedParams.o3 && (
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="o3" 
                                            name="O3"
                                            stroke={parameterConfig.o3.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.o3.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                    
                                    {selectedParams.temperature && (
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="temperature" 
                                            name="Temperature"
                                            stroke={parameterConfig.temperature.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.temperature.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                    
                                    {selectedParams.relativehumidity && (
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="relativehumidity" 
                                            name="Humidity"
                                            stroke={parameterConfig.relativehumidity.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.relativehumidity.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                    
                                    {selectedParams.wind_speed && (
                                        <Line 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="wind_speed" 
                                            name="Wind Speed"
                                            stroke={parameterConfig.wind_speed.color}
                                            strokeWidth={3} 
                                            dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: parameterConfig.wind_speed.color }} 
                                            activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }} 
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center font-bold text-xl">
                                {loading ? 'Loading data...' : 'No data available'}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. City Heartbeat */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[500px]">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        CITY HEARTBEAT (HOURLY)
                    </h2>
                    <p className="font-bold mb-6">Pollution intensity by hour and day of week.</p>
                    <div className="flex-grow font-bold focus:outline-none focus:ring-none text-black">
                        <ResponsiveHeatMap
                            data={hourlyHeatmapData}
                            margin={{ top: 40, right: 20, bottom: 40, left: 80 }}
                            valueFormat=">-.0f"
                            xInnerPadding={0.05}
                            yInnerPadding={0.05}
                            axisTop={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: -45,
                                legend: '',
                            }}
                            axisRight={null}
                            axisBottom={null}
                            axisLeft={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: '',
                            }}
                            colors={{ type: 'sequential', colors: ['#00FF66', '#FFCC00', '#FF3366'] }}
                            emptyColor="#FDFBF7"
                            cellBorderWidth={2}
                            cellBorderColor="#000000"
                            labelTextColor="#000000"
                            theme={{
                                fontFamily: 'monospace',
                                fontSize: 12,
                                textColor: '#000000',
                                axis: { domain: { line: { stroke: '#000000', strokeWidth: 2 } } }
                            }}
                        />
                    </div>
                </div>

                {/* 3. Calendar View */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[500px] overflow-hidden">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        DAILY AQI HISTORY
                    </h2>
                    <p className="font-bold mb-6">Year-long footprint of hazardous air days.</p>
                    <div className="flex-grow overflow-x-auto">
                        <div className="w-[1000px] h-[350px]">
                            <ResponsiveCalendar
                                data={calendarData}
                                from="2025-01-01"
                                to="2025-12-31"
                                emptyColor="#ffffff"
                                colors={['#00FF66', '#FFCC00', '#FF3366', '#000000']}
                                margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
                                yearSpacing={40}
                                monthBorderColor="#000000"
                                monthBorderWidth={4}
                                dayBorderWidth={2}
                                dayBorderColor="#000000"
                                theme={{
                                    fontFamily: 'monospace',
                                    fontSize: 14,
                                    textColor: '#000000'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Wind Rose */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[500px]">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        POLLUTION SOURCE (WIND)
                    </h2>
                    <p className="font-bold mb-6">Correlation of PM2.5 levels against wind direction.</p>
                    <div className="flex-grow flex items-center justify-center -ml-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={windRoseData}>
                                <PolarGrid gridType="polygon" stroke="#000" strokeWidth={3} />
                                <PolarAngleAxis dataKey="direction" stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'black', fill: '#000', fontSize: 18 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 200]} stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }} />
                                <Radar name="PM2.5 Index" dataKey="value" stroke="#000" strokeWidth={4} fill="#00CFFF" fillOpacity={0.9} />
                                <Tooltip content={<BrutalistTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HistoricalDashboard;