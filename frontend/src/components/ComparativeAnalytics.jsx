import React, { useState, useEffect } from 'react';
import { AlertTriangle, Map, Wind, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ParameterSelector from './ui/ParameterSelector';
import { parameterConfig } from './constants/chartConfig';

const ComparativeAnalytics = () => {
    const [metrics, setMetrics] = useState({
        pm25: null, pm10: null, no2: null, windSpeed: null,
        co: null, so2: null, o3: null, no: null, nox: null, temperature: null, relativehumidity: null
    });
    const [isLoading, setIsLoading] = useState(true);

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
        // Simulate pulling data from a single backend file
        const fetchServerData = async () => {
            setIsLoading(true);
            try {
                // Mock delay to simulate network request
                await new Promise(resolve => setTimeout(resolve, 800));

                // Simulated server response representing Bidhannagar data
                const mockServerData = {
                    pm25: 35.4, pm10: 74.8, no2: 30.8, windSpeed: 0.05,
                    co: 0.8, so2: 12.5, o3: 45.2, no: 15.3, nox: 46.1, temperature: 28.5, relativehumidity: 65.2
                };

                setMetrics(mockServerData);
            } catch (error) {
                console.error("Failed to fetch environment metrics", error);
                // Fallback data in case of error
                setMetrics({ pm25: 0, pm10: 0, no2: 0, windSpeed: 0, co: 0, so2: 0, o3: 0, no: 0, nox: 0, temperature: 0, relativehumidity: 0 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchServerData();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full bg-[#FDFBF7] p-8 min-h-[400px] flex items-center justify-center font-mono text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-12 mb-12">
                <div className="bg-[#FFCC00] text-black border-4 border-black px-8 py-4 font-black text-2xl uppercase tracking-widest animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    &gt; FETCHING SERVER DATA...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#FDFBF7] p-4 md:p-8 font-mono text-black">

            {/* Header */}
            <header className="mb-12 border-b-4 border-black pb-6">
                <h1 className="text-5xl md:text-7xl font-black bg-[#00FF66] px-4 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max leading-none uppercase tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ATMOSPHERIC COMPARISONS
                </h1>
                <h2 className="text-xl font-bold bg-white border-2 border-black px-3 py-1 mt-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max">
                    Live analysis driven by server data.
                </h2>
            </header>

            {/* Grid System */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* 1. WHO Standard Battle */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 flex flex-col relative">
                    <div className="border-b-4 border-black p-4 bg-white font-black uppercase text-xl flex items-center gap-2">
                        <Activity className="shrink-0" /> HEALTH LIMIT: LIVE VS W.H.O.
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
                                {metrics.pm25}
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
                            <span className="font-black text-4xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{metrics.no2}</span>
                        </div>

                        <div className="font-black text-xl text-center">VS</div>

                        {/* Block 2: Dust/Construction */}
                        <div className="bg-[#7B61FF] text-white border-4 border-black p-6 relative flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <span className="font-black text-2xl uppercase shadow-text">CONSTRUCTION (PM10)</span>
                            <span className="font-black text-4xl text-white shadow-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{metrics.pm10}</span>
                        </div>

                        {/* Terminal Box Logic */}
                        <div className="bg-black text-[#00FF66] font-mono font-bold p-4 mt-2 border-4 border-black">
                            {metrics.pm10 > metrics.no2 ? (
                                "> WARNING: PM10 IS DOMINANT. RESTRICT CONSTRUCTION."
                            ) : (
                                "> WARNING: NO2 IS DOMINANT. RESTRICT TRAFFIC."
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Wind Impact */}
                <div className="bg-[#FFCC00] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:col-span-2 flex flex-col">
                    <div className="border-b-4 border-black p-4 bg-white font-black uppercase text-xl flex items-center gap-2">
                        <Wind className="shrink-0" /> ENVIRONMENTAL: WIND VS POLLUTION
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-stretch justify-between mb-8">
                            {/* Left: Wind Speed */}
                            <div className="bg-white border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full flex flex-col items-center justify-center">
                                <span className="font-bold text-xl mb-4 uppercase">CURRENT WIND SPEED</span>
                                <div className="flex items-end gap-2">
                                    <span className="font-black text-6xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{metrics.windSpeed}</span>
                                    <span className="font-bold text-2xl mb-2">m/s</span>
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
                                    <span className="font-black text-6xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{metrics.pm25}</span>
                                    <span className="font-bold text-2xl mb-2">µg/m³</span>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Wind Alert */}
                        {metrics.windSpeed < 0.5 && (
                            <div className="mt-8 bg-[#FF3366] text-black border-4 border-black p-6 font-black text-2xl md:text-3xl uppercase tracking-tighter text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                STAGNANT AIR. LOW WIND IS TRAPPING POLLUTANTS!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Comparison Graph */}
            <div className="mt-12 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0 flex flex-col overflow-visible">
                <div className="border-b-4 border-black p-4 bg-[#FF00FF] font-black uppercase text-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <Activity className="shrink-0 text-white" /> <span>CUSTOM COMPARISON</span>
                    </div>
                    {/* Re-use Parameter Selector Component */}
                    <div className="w-auto z-10">
                        <ParameterSelector
                            selectedParams={selectedParams}
                            onToggle={handleParamToggle}
                            onSelectAll={selectAll}
                            onClearAll={clearAll}
                            isOpen={showParamSelector}
                            onToggleOpen={() => setShowParamSelector(!showParamSelector)}
                        />
                    </div>
                </div>
                <div className="p-8 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={Object.entries(parameterConfig)
                                .filter(([key]) => selectedParams[key] && key !== 'wind_speed')
                                .map(([key, config]) => ({
                                    name: config.name,
                                    value: metrics[key] || 0,
                                    fill: config.color,
                                    unit: config.unit
                                }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#000', fontWeight: 'bold' }} stroke="#000" strokeWidth={2} />
                            <YAxis tick={{ fill: '#000', fontWeight: 'bold' }} stroke="#000" strokeWidth={2} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#00FF66', border: '4px solid black', borderRadius: '0', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
                                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                                formatter={(value, name, props) => [`${value} ${props.payload.unit}`, name]}
                            />
                            <Bar dataKey="value" stroke="#000" strokeWidth={4} radius={0}>
                                {
                                    Object.entries(parameterConfig)
                                        .filter(([key]) => selectedParams[key] && key !== 'wind_speed')
                                        .map(([key, config], index) => (
                                            <Cell key={`cell-${index}`} fill={config.color} />
                                        ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ComparativeAnalytics;
