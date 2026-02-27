import React, { useState, useEffect } from 'react';
import { AlertTriangle, Map, Wind, Activity, Radio, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ParameterSelector from './ui/ParameterSelector';
import { parameterConfig } from './constants/chartConfig.js';

// Station configuration
const stations = [
    { 
        id: 'bidhanagar-east',
        name: 'Bidhannagar East',
        color: '#FF3366',
        coordinates: [22.58157, 88.410025]
    },
    { 
        id: 'Rabindra_Bharatia',
        name: 'Rabindra Bharati University',
        color: '#7B61FF',
        coordinates: [22.627875, 88.3804]
    },
    { 
        id: 'Ballygunge',
        name: 'Ballygunge',
        color: '#00FF66',
        coordinates: [22.5367507, 88.3638022]
    },
    { 
        id: 'Dasnagar',
        name: 'Dasnagar',
        color: '#FF8C42',
        coordinates: [22.6025571, 88.3105664]
    }
];

const ComparativeAnalytics = ({ liveData }) => {
    const [metrics, setMetrics] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStation, setSelectedStation] = useState('bidhanagar-east');
    const [stationMetrics, setStationMetrics] = useState({});

    const [selectedParams, setSelectedParams] = useState({
        pm25: true, pm10: true, no2: true, co: false, so2: false,
        o3: false, no: false, nox: false, temperature: false, relativehumidity: false
    });
    const [showParamSelector, setShowParamSelector] = useState(false);

    const handleParamToggle = (param) => {
        setSelectedParams(prev => ({ ...prev, [param]: !prev[param] }));
    };

    const selectAll = () => {
        const all = Object.keys(selectedParams).reduce((acc, k) => ({ ...acc, [k]: true }), {});
        setSelectedParams(all);
    };

    const clearAll = () => {
        const none = Object.keys(selectedParams).reduce((acc, k) => ({ ...acc, [k]: false }), {});
        setSelectedParams(none);
    };

    useEffect(() => {
        // Process liveData from props (multi-station format)
        if (liveData?.stations) {
            setStationMetrics(liveData.stations);
            
            // Set metrics for selected station
            const selectedData = liveData.stations[selectedStation];
            if (selectedData) {
                setMetrics({
                    pm25: selectedData.pm25 || 0,
                    pm10: selectedData.pm10 || 0,
                    no2: selectedData.no2 || 0,
                    wind_speed: selectedData.wind_speed || 0,
                    co: selectedData.co || 0,
                    so2: selectedData.so2 || 0,
                    o3: selectedData.o3 || 0,
                    no: selectedData.no || 0,
                    nox: selectedData.nox || 0,
                    temperature: selectedData.temperature || 0,
                    relativehumidity: selectedData.humidity || selectedData.relativehumidity || 0
                });
            }
            setIsLoading(false);
            return;
        }

        // Fallback to mock data
        const fetchServerData = async () => {
            setIsLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 800));

                // Mock multi-station data
                const mockData = {
                    "bidhanagar-east": {
                        pm25: 51.36, pm10: 120.41, no2: 10.16, wind_speed: 0.04,
                        co: 1.504, so2: 73.11, o3: 13.19, no: 15.36, nox: 0.01776,
                        temperature: 22.94, humidity: 45.59
                    },
                    "Dasnagar": {
                        pm25: 63.14, pm10: 149.15, no2: 94.28, wind_speed: 0.33,
                        co: 2.6, so2: 40.21, o3: 17.02, no: 25.92, nox: 0.07122,
                        temperature: 22.96, humidity: 49.51
                    },
                    "Rabindra_Bharatia": {
                        pm25: 93.95, pm10: 151.31, no2: 128.27, wind_speed: 0.02,
                        co: 1.729, so2: 6.77, o3: 18.92, no: 13.64, nox: 0.07794,
                        temperature: 24.21, humidity: 34.96
                    },
                    "Ballygunge": {
                        pm25: 63, pm10: 121.6, no2: 112.2, wind_speed: 0.63,
                        co: 3.017, so2: 11.17, o3: 11.38, no: 47.7, nox: 0.0969,
                        temperature: 20.23, humidity: 29.72
                    }
                };
                
                setStationMetrics(mockData);
                setMetrics(mockData[selectedStation]);
            } catch (error) {
                console.error("Failed to fetch environment metrics", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServerData();
    }, [liveData, selectedStation]);

    // Handle station change
    const handleStationChange = (stationId) => {
        setSelectedStation(stationId);
        if (stationMetrics[stationId]) {
            const data = stationMetrics[stationId];
            setMetrics({
                pm25: data.pm25 || 0,
                pm10: data.pm10 || 0,
                no2: data.no2 || 0,
                wind_speed: data.wind_speed || 0,
                co: data.co || 0,
                so2: data.so2 || 0,
                o3: data.o3 || 0,
                no: data.no || 0,
                nox: data.nox || 0,
                temperature: data.temperature || 0,
                relativehumidity: data.humidity || data.relativehumidity || 0
            });
        }
    };

    // Prepare chart data
    const chartData = Object.entries(parameterConfig)
        .filter(([key]) => selectedParams[key] && key !== 'wind_speed' && metrics[key] !== undefined)
        .map(([key, config]) => ({
            name: config.name,
            value: metrics[key] || 0,
            fill: config.color,
            unit: config.unit,
            key: key
        }));

    // Determine dominant pollutant for warning
    const getDominantWarning = () => {
        if (metrics.pm10 > metrics.no2) {
            return "> WARNING: PM10 IS DOMINANT. RESTRICT CONSTRUCTION.";
        } else if (metrics.no2 > metrics.pm10) {
            return "> WARNING: NO2 IS DOMINANT. RESTRICT TRAFFIC.";
        }
        return "> POLLUTANT LEVELS ARE BALANCED.";
    };

    // Get current station info
    const currentStation = stations.find(s => s.id === selectedStation) || stations[0];

    if (isLoading) {
        return (
            <div className="w-full bg-[#FDFBF7] p-8 min-h-[400px] flex items-center justify-center font-mono text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-12 mb-12">
                <div className="bg-[#FFCC00] text-black border-4 border-black px-8 py-4 font-black text-2xl uppercase tracking-widest animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    &gt; FETCHING STATION DATA...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#FDFBF7] p-4 md:p-8 font-mono text-black">

            {/* Header with Station Selector */}
            <header className="mb-12 border-b-4 border-black pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-5xl md:text-7xl font-black bg-[#00FF66] px-4 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max leading-none uppercase tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        ATMOSPHERIC COMPARISONS
                    </h1>
                    
                    {/* Station Selector */}
                    <div className="flex items-center gap-2 bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Radio size={20} className="text-black" />
                        <select
                            value={selectedStation}
                            onChange={(e) => handleStationChange(e.target.value)}
                            className="font-bold uppercase bg-transparent border-none outline-none cursor-pointer p-1"
                            style={{ fontFamily: 'monospace' }}
                        >
                            {stations.map(station => (
                                <option key={station.id} value={station.id}>
                                    {station.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <h2 className="text-xl font-bold bg-white border-2 border-black px-3 py-1 mt-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max flex items-center gap-2">
                    <Layers size={20} /> Live analysis from {currentStation.name}
                </h2>
            </header>

            {/* Quick Stats Bar - All Stations Overview */}
            <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {stations.map(station => {
                    const data = stationMetrics[station.id];
                    const pm25 = data?.pm25 || 0;
                    const isSelected = station.id === selectedStation;
                    return (
                        <button
                            key={station.id}
                            onClick={() => handleStationChange(station.id)}
                            className={`border-4 border-black p-3 font-bold transition-all ${
                                isSelected 
                                    ? 'bg-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' 
                                    : 'bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            }`}
                            style={{ borderColor: station.color }}
                        >
                            <div className="text-xs uppercase">{station.name}</div>
                            <div className="text-lg font-black" style={{ color: isSelected ? 'white' : station.color }}>
                                {pm25.toFixed(1)} µg/m³
                            </div>
                            <div className="text-xs">PM2.5</div>
                        </button>
                    );
                })}
            </div>

            {/* Grid System */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* 1. WHO Standard Battle */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 flex flex-col relative">
                    <div className="border-b-4 border-black p-4 bg-white font-black uppercase text-xl flex items-center gap-2">
                        <Activity className="shrink-0" /> HEALTH LIMIT: {currentStation.name} VS W.H.O.
                    </div>

                    <div className="flex flex-col sm:flex-row flex-grow relative">
                        {/* VS Badge - Absolute Center */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black text-white font-black text-3xl border-4 border-white p-4 z-10 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-center w-20 h-20">
                            VS
                        </div>

                        {/* Left Side: Live Data */}
                        <div className="bg-[#FF3366] text-black p-8 sm:p-12 border-b-4 sm:border-b-0 sm:border-r-4 border-black w-full flex flex-col justify-center items-center">
                            <span className="font-bold text-lg mb-2 uppercase">Live PM2.5</span>
                            <span className="font-black text-5xl md:text-7xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {metrics.pm25.toFixed(1)}
                            </span>
                            <span className="font-bold">µg/m³</span>
                        </div>

                        {/* Right Side: WHO Limit */}
                        <div className="bg-[#00FF66] text-black p-8 sm:p-12 w-full flex flex-col justify-center items-center">
                            <span className="font-bold text-lg mb-2 uppercase">W.H.O. Limit</span>
                            <span className="font-black text-5xl md:text-7xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                15.0
                            </span>
                            <span className="font-bold">µg/m³</span>
                        </div>
                    </div>

                    {/* Warning if exceeding WHO limit */}
                    {metrics.pm25 > 15 && (
                        <div className="border-t-4 border-black p-4 bg-[#FF3366] font-black text-center text-white">
                            ⚠️ EXCEEDING WHO LIMIT BY {(metrics.pm25 - 15).toFixed(1)} µg/m³ ⚠️
                        </div>
                    )}
                </div>

                {/* 2. Source Rivalry */}
                <div className="bg-[#00CFFF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                    <div className="border-b-4 border-black p-4 bg-white font-black uppercase text-xl flex items-center gap-2">
                        <AlertTriangle className="shrink-0" /> POLLUTANT SOURCE: TRAFFIC VS DUST
                    </div>

                    <div className="p-6 md:p-8 flex flex-col gap-6">
                        {/* Block 1: Traffic */}
                        <div className="bg-[#FFCC00] border-4 border-black p-6 relative flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <span className="font-black text-2xl uppercase">TRAFFIC (NO2)</span>
                            <span className="font-black text-4xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{metrics.no2.toFixed(1)}</span>
                        </div>

                        <div className="font-black text-xl text-center">VS</div>

                        {/* Block 2: Dust/Construction */}
                        <div className="bg-[#7B61FF] text-white border-4 border-black p-6 relative flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <span className="font-black text-2xl uppercase">CONSTRUCTION (PM10)</span>
                            <span className="font-black text-4xl text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{metrics.pm10.toFixed(1)}</span>
                        </div>

                        {/* Terminal Box Logic */}
                        <div className="bg-black text-[#00FF66] font-mono font-bold p-4 mt-2 border-4 border-black">
                            {getDominantWarning()}
                        </div>
                    </div>
                </div>

                {/* 3. Wind Impact */}
                <div className="bg-[#FFCC00] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:col-span-2 flex flex-col">
                    <div className="border-b-4 border-black p-4 bg-white font-black uppercase text-xl flex items-center gap-2">
                        <Wind className="shrink-0" /> ENVIRONMENTAL: WIND VS POLLUTION AT {currentStation.name}
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-stretch justify-between mb-8">
                            {/* Left: Wind Speed */}
                            <div className="bg-white border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full flex flex-col items-center justify-center">
                                <span className="font-bold text-xl mb-4 uppercase">CURRENT WIND SPEED</span>
                                <div className="flex items-end gap-2">
                                    <span className="font-black text-6xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{metrics.wind_speed.toFixed(2)}</span>
                                    <span className="font-bold text-2xl mb-2">m/s</span>
                                </div>
                                <div className="mt-2 text-sm font-bold">
                                    Direction: {stationMetrics[selectedStation]?.wind_direction?.toFixed(1) || 'N/A'}°
                                </div>
                            </div>

                            <div className="hidden md:flex items-center justify-center">
                                <div className="bg-black text-white font-black text-3xl border-4 border-white p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                                    VS
                                </div>
                            </div>

                            {/* Right: PM2.5 */}
                            <div className="bg-[#FF3366] text-black border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full flex flex-col items-center justify-center">
                                <span className="font-bold text-xl mb-4 uppercase">CURRENT PM2.5</span>
                                <div className="flex items-end gap-2">
                                    <span className="font-black text-6xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{metrics.pm25.toFixed(1)}</span>
                                    <span className="font-bold text-2xl mb-2">µg/m³</span>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Wind Alert */}
                        {metrics.wind_speed < 0.5 && (
                            <div className="mt-8 bg-[#FF3366] text-white border-4 border-black p-6 font-black text-2xl md:text-3xl uppercase tracking-tighter text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                ⚠️ STAGNANT AIR. LOW WIND IS TRAPPING POLLUTANTS AT {currentStation.name}! ⚠️
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Comparison Graph */}
            <div className="mt-12 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0 flex flex-col overflow-visible">
                <div className="border-b-4 border-black p-4 bg-[#FF00FF] font-black uppercase text-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <Activity className="shrink-0 text-white" /> 
                        <span>CUSTOM COMPARISON - {currentStation.name}</span>
                    </div>
                    {/* Parameter Selector Component */}
                    <div className="w-auto z-10">
                        <ParameterSelector
                            selectedParams={selectedParams}
                            onToggle={handleParamToggle}
                            onSelectAll={selectAll}
                            onClearAll={clearAll}
                            isOpen={showParamSelector}
                            onToggleOpen={() => setShowParamSelector(!showParamSelector)}
                            parameters={parameterConfig}
                            position="right"
                        />
                    </div>
                </div>
                <div className="p-8 h-[400px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 10, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fill: '#000', fontWeight: 'bold', fontSize: 11 }} 
                                    stroke="#000" 
                                    strokeWidth={2} 
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis 
                                    tick={{ fill: '#000', fontWeight: 'bold' }} 
                                    stroke="#000" 
                                    strokeWidth={2} 
                                />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: '#00FF66', 
                                        border: '4px solid black', 
                                        borderRadius: '0', 
                                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', 
                                        fontWeight: 'bold' 
                                    }}
                                    cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                                    formatter={(value, name, props) => [`${value} ${props.payload.unit}`, props.payload.name]}
                                />
                                <Bar dataKey="value" stroke="#000" strokeWidth={2} radius={0}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center font-bold text-xl">
                            No parameters selected. Use the PARAMETERS button to select data to display.
                        </div>
                    )}
                </div>
            </div>

            {/* Station Comparison Table */}
            <div className="mt-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-black text-white p-3 font-bold uppercase">
                    📊 ALL STATIONS COMPARISON
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse font-mono text-sm">
                        <thead>
                            <tr className="border-b-4 border-black bg-gray-100">
                                <th className="p-3 text-left font-black">Parameter</th>
                                {stations.map(station => (
                                    <th key={station.id} className="p-3 text-left font-black" style={{ color: station.color }}>
                                        {station.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {['pm25', 'pm10', 'no2', 'co', 'so2', 'o3', 'temperature', 'humidity'].map(param => {
                                const config = parameterConfig[param] || { name: param.toUpperCase(), unit: '' };
                                return (
                                    <tr key={param} className="border-b-2 border-black">
                                        <td className="p-3 font-bold">{config.name} ({config.unit})</td>
                                        {stations.map(station => {
                                            const value = stationMetrics[station.id]?.[param === 'humidity' ? 'humidity' : param];
                                            return (
                                                <td key={station.id} className="p-3 font-mono">
                                                    {value ? value.toFixed(2) : 'N/A'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparativeAnalytics;