import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis,
    Tooltip, Legend, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, Settings, Play, Database, Download } from 'lucide-react';
import BackToHomeButton from '../components/BackToHomeButton';

const API_BASE = 'http://localhost:8000';

const BrutalistTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono font-bold">
                <p className="border-b-2 border-black pb-1 mb-2 uppercase">{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color || '#000' }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function getAQILabel(aqi) {
    if (aqi <= 50) return 'GOOD';
    if (aqi <= 100) return 'SATISFACTORY';
    if (aqi <= 200) return 'MODERATE';
    if (aqi <= 300) return 'POOR';
    if (aqi <= 400) return 'VERY POOR';
    return 'SEVERE';
}

function getHealthAdvisory(aqi) {
    if (aqi <= 50) return 'Air quality is satisfactory. Enjoy outdoor activities.';
    if (aqi <= 100) return 'Minor breathing discomfort to sensitive people.';
    if (aqi <= 200) return 'Sensitive groups should reduce outdoor exertion.';
    if (aqi <= 300) return 'Breathing discomfort to most people on prolonged exposure.';
    if (aqi <= 400) return 'Respiratory illness on prolonged exposure. Avoid outdoor activities.';
    return 'Health emergency. Everyone should avoid outdoor activities.';
}

const ModelsSimulation = () => {
    // Live data state
    const [liveData, setLiveData] = useState(null);
    const [liveLoading, setLiveLoading] = useState(true);

    // Forecast state
    const [selectedForecast, setSelectedForecast] = useState('pm25');
    const [forecastSelectOpen, setForecastSelectOpen] = useState(false);
    const [forecastRaw, setForecastRaw] = useState([]);
    const [forecastLoading, setForecastLoading] = useState(true);

    // Ratios state
    const [ratiosData, setRatiosData] = useState([]);
    const [ratiosLoading, setRatiosLoading] = useState(true);

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Optimizer state
    const [optimizerData, setOptimizerData] = useState(null);
    const [optimizerLoading, setOptimizerLoading] = useState(true);

    // Simulator state
    const [trafficVol, setTrafficVol] = useState(100);
    const [greenCover, setGreenCover] = useState(15);
    const [industryVol, setIndustryVol] = useState(100);
    const [windSpeed, setWindSpeed] = useState(2);
    const [officeBan, setOfficeBan] = useState(false);
    const [heavyBan, setHeavyBan] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simResult, setSimResult] = useState(null);

    // Clear sim results when any input changes
    const setTrafficVolAndClear = (v) => { setTrafficVol(v); setSimResult(null); };
    const setGreenCoverAndClear = (v) => { setGreenCover(v); setSimResult(null); };
    const setIndustryVolAndClear = (v) => { setIndustryVol(v); setSimResult(null); };
    const setWindSpeedAndClear = (v) => { setWindSpeed(v); setSimResult(null); };
    const toggleOfficeBan = () => { setOfficeBan(prev => !prev); setSimResult(null); };
    const toggleHeavyBan = () => { setHeavyBan(prev => !prev); setSimResult(null); };

    // Fetch live data
    useEffect(() => {
        setLiveLoading(true);
        fetch(`${API_BASE}/live-data`)
            .then(r => r.json())
            .then(data => {
                setLiveData(data);
                setLiveLoading(false);
            })
            .catch(() => setLiveLoading(false));
    }, []);

    // Fetch forecast (all pollutants, 72 values each)
    useEffect(() => {
        setForecastLoading(true);
        fetch(`${API_BASE}/forecast`)
            .then(r => r.json())
            .then(data => {
                // New format: { past: {pm25:[...],...}, future: {pm25:[...],...} }
                // Old format fallback: { pm25: [...], ... } or flat array
                if (data && data.past && data.future) {
                    setForecastRaw(data);
                } else if (Array.isArray(data)) {
                    setForecastRaw({ past: { pm25: [] }, future: { pm25: data } });
                } else {
                    // old flat format — wrap it
                    setForecastRaw({ past: {}, future: data });
                }
                setForecastLoading(false);
            })
            .catch(() => setForecastLoading(false));
    }, []);

    // Fetch ratios
    useEffect(() => {
        setRatiosLoading(true);
        fetch(`${API_BASE}/ratios`)
            .then(r => r.json())
            .then(data => {
                const arr = Object.entries(data).map(([name, value]) => ({
                    name: name.toUpperCase(),
                    value
                }));
                setRatiosData(arr);
                setRatiosLoading(false);
            })
            .catch(() => setRatiosLoading(false));
    }, []);

    // Fetch analytics
    useEffect(() => {
        setAnalyticsLoading(true);
        fetch(`${API_BASE}/analytics`)
            .then(r => r.json())
            .then(data => {
                setAnalytics(data);
                setAnalyticsLoading(false);
            })
            .catch(() => setAnalyticsLoading(false));
    }, []);

    // Fetch optimizer
    useEffect(() => {
        setOptimizerLoading(true);
        fetch(`${API_BASE}/optimize`)
            .then(r => r.json())
            .then(data => {
                setOptimizerData(data);
                setOptimizerLoading(false);
            })
            .catch(() => setOptimizerLoading(false));
    }, []);

    // Build pollutant matrix from live data
    const pollutantMatrix = liveData && !liveData.error ? [
        { name: 'PM2.5', value: liveData.pm25, unit: 'µg/m³', trend: liveData.pm25 > 45 ? 'up' : 'down' },
        { name: 'PM10', value: liveData.pm10, unit: 'µg/m³', trend: liveData.pm10 > 82 ? 'up' : 'down' },
        { name: 'NO', value: liveData.no, unit: 'ppb', trend: liveData.no > 12 ? 'up' : 'down' },
        { name: 'NO2', value: liveData.no2, unit: 'ppb', trend: liveData.no2 > 34 ? 'up' : 'down' },
        { name: 'CO', value: liveData.co, unit: 'ppm', trend: liveData.co > 1.2 ? 'up' : 'down' },
        { name: 'O3', value: liveData.o3, unit: 'ppb', trend: liveData.o3 > 45 ? 'up' : 'down' },
        { name: 'SO2', value: liveData.so2, unit: 'ppb', trend: liveData.so2 > 8 ? 'up' : 'down' },
    ].filter(p => p.value !== undefined) : [
        { name: 'PM2.5', value: 45, unit: 'µg/m³', trend: 'up' },
        { name: 'PM10', value: 82, unit: 'µg/m³', trend: 'down' },
        { name: 'NO', value: 12, unit: 'ppb', trend: 'up' },
        { name: 'NO2', value: 34, unit: 'ppb', trend: 'up' },
        { name: 'CO', value: 1.2, unit: 'ppm', trend: 'down' },
        { name: 'O3', value: 45, unit: 'ppb', trend: 'down' },
        { name: 'SO2', value: 8, unit: 'ppb', trend: 'up' },
    ];

    const currentAQI = (liveData && !liveData.error && liveData.aqi) ? liveData.aqi : 145;
    const aqiLabel = getAQILabel(currentAQI);
    const healthAdvisory = getHealthAdvisory(currentAQI);

    // FORECAST_POLLUTANTS: keys as they come from the backend
    const FORECAST_POLLUTANTS = ['pm25', 'pm10', 'no2', 'co', 'o3', 'so2', 'no'];
    const FORECAST_LABELS = {
        pm25: 'PM2.5', pm10: 'PM10', no2: 'NO2',
        co: 'CO', o3: 'O3', so2: 'SO2', no: 'NO'
    };
    // selectedForecast is stored as the backend key e.g. 'pm25'

    // Build forecast chart data for the selected pollutant
    const buildForecastChartData = () => {
        const key = selectedForecast.toLowerCase().replace('.', '');
        // key mapping: 'pm25', 'pm10', 'no2', 'co', 'o3', 'so2', 'no'

        // Extract past and future arrays from the backend response
        const pastArr   = forecastRaw?.past?.[key]   || [];
        const futureArr = forecastRaw?.future?.[key] || [];

        // Fallback patterns if backend hasn't loaded yet
        const FALLBACKS = {
            pm25: { past: [68,62,56,52,50,55],   future: [55,58,65,72,68,60,52,46] },
            pm10: { past: [105,98,90,84,80,85],  future: [85,90,102,115,108,95,84,76] },
            no2:  { past: [36,30,24,20,18,20],   future: [20,22,28,38,44,36,26,20] },
            co:   { past: [1.1,1.0,0.85,0.75,0.68,0.72], future: [0.72,0.76,0.95,1.1,1.0,0.88,0.75,0.68] },
            o3:   { past: [22,24,26,28,27,26],   future: [26,25,24,20,18,17,16,15] },
            so2:  { past: [8,7,6,5,4,5],         future: [5,5,7,8,8,7,6,5] },
            no:   { past: [24,20,16,12,11,13],   future: [13,14,18,26,28,22,16,12] },
        };

        const usePast   = pastArr.length   >= 4 ? pastArr   : (FALLBACKS[key]?.past   || FALLBACKS.pm25.past);
        const useFuture = futureArr.length >= 4 ? futureArr : (FALLBACKS[key]?.future || FALLBACKS.pm25.future);

        const NUM_PAST   = 4;  // 4 historical points shown
        const NUM_FUTURE = 7;  // 7 predicted points shown

        // Generate hour labels centred on NOW
        const now = new Date();
        const times = [];
        for (let i = -NUM_PAST; i <= NUM_FUTURE; i++) {
            const d = new Date(now.getTime() + i * 3600000);
            times.push(`${String(d.getHours()).padStart(2, '0')}:00`);
        }

        // past array: index 0 = 6h ago, last index = 1h ago
        // we want the last NUM_PAST values (most recent past hours)
        const pastSlice = usePast.slice(-NUM_PAST);

        return times.map((time, i) => {
            if (i < NUM_PAST) {
                return { time, past: pastSlice[i] ?? null, future: null };
            } else if (i === NUM_PAST) {
                // NOW: junction — show on both lines for visual continuity
                const val = useFuture[0] ?? null;
                return { time, past: val, future: val };
            } else {
                const futureIdx = i - NUM_PAST;  // 1, 2, 3 ...
                return { time, past: null, future: useFuture[futureIdx] ?? null };
            }
        });
    };

    const forecastChartData = buildForecastChartData();
    // Peak reference area: highlight the transition from historical to predicted
    const peakTime1 = forecastChartData[4]?.time;  // NOW
    const peakTime2 = forecastChartData[6]?.time;  // +2h from now

    // Bar chart data from ratios
    const barChartData = ratiosData.length > 0 ? ratiosData : pollutantMatrix.map(p => ({ name: p.name, value: p.value }));

    const handleExportData = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        // Export future forecast data
        const futureData = forecastRaw?.future || {};
        const forecastKeys = Object.keys(futureData).filter(k => Array.isArray(futureData[k]));
        csvContent += "Hour," + forecastKeys.map(k => k.toUpperCase()).join(",") + "\n";
        const len = forecastKeys.length > 0 ? (futureData[forecastKeys[0]] || []).length : 0;
        for (let i = 0; i < len; i++) {
            csvContent += i;
            forecastKeys.forEach(k => {
                csvContent += `,${(futureData[k] || [])[i] ?? ''}`;
            });
            csvContent += "\n";
        }
        // Add live data
        csvContent += "\nLive Pollutants\n";
        if (liveData && !liveData.error) {
            Object.entries(liveData).forEach(([k, v]) => {
                csvContent += `${k},${v}\n`;
            });
        }
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bidhannagar_forecast_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRunSimulation = async () => {
        setIsSimulating(true);
        setSimResult(null);

        // Capture current values at time of click (avoid stale closure issues)
        const currentTraffic = trafficVol;
        const currentGreen = greenCover;
        const currentIndustry = industryVol;
        const currentWind = windSpeed;
        const currentOfficeBan = officeBan;
        const currentHeavyBan = heavyBan;

        // Apply policy modifiers to traffic
        let effectiveTraffic = currentTraffic;
        if (currentOfficeBan) effectiveTraffic = Math.max(50, effectiveTraffic - 20);
        if (currentHeavyBan) effectiveTraffic = Math.max(50, effectiveTraffic - 15);

        const calcAQI = (pm25) => {
            if (pm25 <= 30) return Math.round(pm25 * 50 / 30);
            if (pm25 <= 60) return Math.round(50 + (pm25 - 30) * 50 / 30);
            if (pm25 <= 90) return Math.round(100 + (pm25 - 60) * 100 / 30);
            if (pm25 <= 120) return Math.round(200 + (pm25 - 90) * 100 / 30);
            return 300;
        };

        const formatPct = (newVal, baseVal) => {
            const pct = Math.round(((newVal - baseVal) / baseVal) * 100);
            return pct <= 0 ? `${pct}%` : `+${pct}%`;
        };

        try {
            // Run both baseline and user scenario in parallel
            const [baseRes, simRes] = await Promise.all([
                fetch(`${API_BASE}/simulate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ traffic: 100, green: 15, industry: 100, wind: 2 })
                }),
                fetch(`${API_BASE}/simulate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        traffic: effectiveTraffic,
                        green: currentGreen,
                        industry: currentIndustry,
                        wind: currentWind
                    })
                })
            ]);
            const baseData = await baseRes.json();
            const data = await simRes.json();

            // Compare against ML baseline (not live data) for meaningful percentages
            const basePM25 = baseData.pm25 ?? 45;
            const baseNO2 = baseData.no2 ?? 34;

            setSimResult({
                score: calcAQI(data.pm25 ?? 40),
                baseScore: calcAQI(basePM25),
                pm: formatPct(data.pm25 ?? 40, basePM25),
                no2: formatPct(data.no2 ?? 30, baseNO2),
                raw: data
            });
        } catch (e) {
            // Fallback: estimate using physics-based scaling (mirrors simulator.py)
            const SENS = { traffic: 0.004, green: -0.006, industry: 0.005, wind: -0.025 };
            const scale = Math.max(0.15, Math.min(2.0,
                1.0
                + SENS.traffic   * (effectiveTraffic  - 100)
                + SENS.green     * (currentGreen      - 15)
                + SENS.industry  * (currentIndustry   - 100)
                + SENS.wind      * (currentWind       - 2)
            ));
            const basePM25Fb = 45;
            const newPM25 = basePM25Fb * scale;
            const newScore = calcAQI(newPM25);
            const baseScore = calcAQI(basePM25Fb);
            const pmChgPct = Math.round((scale - 1) * 100);
            const no2Scale = Math.max(0.15, Math.min(2.0,
                1.0
                + 0.005 * (effectiveTraffic - 100)
                + -0.003 * (currentGreen - 15)
                + 0.004 * (currentIndustry - 100)
                + -0.022 * (currentWind - 2)
            ));
            const no2ChgPct = Math.round((no2Scale - 1) * 100);
            setSimResult({
                score: newScore,
                baseScore: baseScore,
                no2: no2ChgPct <= 0 ? `${no2ChgPct}%` : `+${no2ChgPct}%`,
                pm: pmChgPct <= 0 ? `${pmChgPct}%` : `+${pmChgPct}%`
            });
        }
        setIsSimulating(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-mono text-black space-y-12 selection:bg-[#00FF66]">
            {/* Header */}
            <div>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight bg-[#FF3366] text-white px-6 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    AI COMMAND CENTER
                </h1>
                <br />
                <p className="text-xl font-bold bg-white border-4 border-black px-6 py-3 mt-8 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase">
                    Expanded Bidhannagar Digital Twin Engine
                </p>
            </div>

            {/* WIDGET 1: AQI Intelligence and Live Matrix */}
            <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Live AQI Block */}
                <div className="col-span-1 bg-[#FFCC00] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center justify-center text-center">
                    {liveLoading ? (
                        <p className="text-2xl font-black animate-pulse uppercase">LOADING...</p>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-4">
                                <AlertTriangle size={48} strokeWidth={3} />
                                <h2 className="text-6xl font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AQI: {currentAQI}</h2>
                            </div>
                            <div className="bg-black text-white px-6 py-2 text-2xl font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                                {aqiLabel}
                            </div>
                            <p className="font-bold border-t-4 border-black pt-4 text-lg">
                                Health Advisory: <br />
                                <span className="bg-white text-black px-2 mt-2 inline-block">{healthAdvisory}</span>
                            </p>
                        </>
                    )}
                </div>

                {/* Full Pollutant Matrix */}
                <div className="xl:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 inline-block">LIVE POLLUTANT MATRIX</h3>
                    {liveLoading ? (
                        <p className="font-bold animate-pulse uppercase text-gray-400">Fetching live data...</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {pollutantMatrix.map((pol, idx) => (
                                <div key={idx} className="border-4 border-black p-3 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-50">
                                    <span className="font-black text-xs text-gray-500">{pol.name}</span>
                                    <div className="flex items-end justify-between mt-2">
                                        <span className="font-black text-xl">
                                            {pol.value} <span className="text-xs font-bold">{pol.unit}</span>
                                        </span>
                                        {pol.trend === 'up' ? (
                                            <ArrowUpRight size={24} strokeWidth={4} className="text-[#FF3366]" />
                                        ) : (
                                            <ArrowDownRight size={24} strokeWidth={4} className="text-[#00FF66]" />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Filler block */}
                            <div className="border-4 border-black bg-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                                <Database className="text-[#FFCC00]" size={32} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* WIDGET 2: Advanced Forecaster */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 72-Hour Forecast */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px] flex flex-col">
                    <div className="flex justify-between items-start mb-4 border-b-4 border-black pb-4">
                        <h3 className="text-2xl font-black uppercase">72-HOUR FORECAST</h3>
                        <div className="relative">
                            <button
                                onClick={() => setForecastSelectOpen(!forecastSelectOpen)}
                                className="bg-[#00CFFF] border-4 border-black px-4 py-2 font-black uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-none"
                            >
                                {FORECAST_LABELS[selectedForecast] || selectedForecast.toUpperCase()} LEVELS
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                            {forecastSelectOpen && (
                                <div className="absolute right-0 top-full mt-2 min-w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 flex flex-col max-h-60 overflow-y-auto">
                                    {FORECAST_POLLUTANTS.map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setSelectedForecast(key);
                                                setForecastSelectOpen(false);
                                            }}
                                            className={`px-4 py-2 font-black uppercase text-left border-b-4 border-black last:border-b-0 hover:bg-[#FFCC00] ${selectedForecast === key ? 'bg-gray-200' : ''}`}
                                        >
                                            {FORECAST_LABELS[key]} LEVELS
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-grow">
                        {forecastLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase animate-pulse">Loading forecast...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={forecastChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                    <XAxis dataKey="time" stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                    <YAxis stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                    <Tooltip content={<BrutalistTooltip />} />
                                    {peakTime1 && peakTime2 && (
                                        <ReferenceArea x1={peakTime1} x2={peakTime2} fill="#FF3366" fillOpacity={0.2} />
                                    )}
                                    <Line type="monotone" dataKey="past" stroke="#000" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#000' }} activeDot={{ r: 8 }} name="Historical" connectNulls={false} />
                                    <Line type="monotone" dataKey="future" stroke="#FF3366" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2, fill: '#FF3366' }} activeDot={{ r: 8 }} name="Predicted" connectNulls={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-2 flex gap-4 text-xs font-black uppercase">
                        <div className="flex items-center gap-1"><div className="w-4 h-1 bg-black"></div> Historical</div>
                        <div className="flex items-center gap-1"><div className="w-4 h-1 bg-[#FF3366] border-dashed border-t-2 border-[#FF3366]"></div> Predicted</div>
                        <div className="flex items-center gap-1"><div className="w-4 h-4 bg-[#FF3366] opacity-20 border border-black"></div> Peak Hour</div>
                    </div>
                </div>

                {/* Relative Pollutant Ratios */}
                <div className="bg-[#00CFFF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px] flex flex-col">
                    <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-2 inline-block w-max mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        RELATIVE POLLUTANT RATIOS
                    </h3>
                    <div className="flex-grow bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {ratiosLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase animate-pulse">Loading ratios...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                    <XAxis dataKey="name" stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold', fontSize: 12 }} />
                                    <YAxis stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                    <Tooltip content={<BrutalistTooltip />} cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#FF3366" stroke="#000" strokeWidth={3} radius={0} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* WIDGET 3: Expanded What-If Simulator */}
            <div className="w-full bg-[#7B61FF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <h2 className="text-4xl font-black uppercase text-white bg-black w-max px-4 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    EXPANDED POLICY SANDBOX
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
                        <h3 className="text-xl font-black uppercase border-b-4 border-black pb-2">Adjust Variables</h3>
                        <div>
                            <div className="flex justify-between items-center font-bold mb-2">
                                <span>Traffic Volume (%)</span>
                                <input type="number" min="50" max="150" value={trafficVol} onChange={(e) => setTrafficVolAndClear(Number(e.target.value))} className="w-20 border-2 border-black p-1 text-center font-black outline-none focus:bg-[#FFCC00]" />
                            </div>
                            <input type="range" min="50" max="150" value={trafficVol} onChange={(e) => setTrafficVolAndClear(Number(e.target.value))} className="w-full h-4 bg-gray-200 border-2 border-black appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center font-bold mb-2">
                                <span>Green Cover Expansion (%)</span>
                                <input type="number" min="0" max="50" value={greenCover} onChange={(e) => setGreenCoverAndClear(Number(e.target.value))} className="w-20 border-2 border-black p-1 text-center font-black outline-none focus:bg-[#00FF66]" />
                            </div>
                            <input type="range" min="0" max="50" value={greenCover} onChange={(e) => setGreenCoverAndClear(Number(e.target.value))} className="w-full h-4 bg-[#00FF66] border-2 border-black appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center font-bold mb-2">
                                <span>Industrial Activity (%)</span>
                                <input type="number" min="50" max="150" value={industryVol} onChange={(e) => setIndustryVolAndClear(Number(e.target.value))} className="w-20 border-2 border-black p-1 text-center font-black outline-none focus:bg-[#FFCC00]" />
                            </div>
                            <input type="range" min="50" max="150" value={industryVol} onChange={(e) => setIndustryVolAndClear(Number(e.target.value))} className="w-full h-4 bg-[#FFCC00] border-2 border-black appearance-none cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center font-bold mb-2">
                                <span>Wind Speed (m/s)</span>
                                <input type="number" min="0" max="10" value={windSpeed} onChange={(e) => setWindSpeedAndClear(Number(e.target.value))} className="w-20 border-2 border-black p-1 text-center font-black outline-none focus:bg-[#00CFFF]" />
                            </div>
                            <input type="range" min="0" max="10" value={windSpeed} onChange={(e) => setWindSpeedAndClear(Number(e.target.value))} className="w-full h-4 bg-[#00CFFF] border-2 border-black appearance-none cursor-pointer" />
                        </div>
                        <div className="border-t-4 border-black pt-4 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" checked={officeBan} onChange={toggleOfficeBan} className="sr-only" />
                                    <div className={`w-8 h-8 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-colors ${officeBan ? 'bg-black' : 'bg-white'}`}>
                                        {officeBan && <div className="w-3 h-3 bg-white" />}
                                    </div>
                                </div>
                                <span className="font-bold text-lg uppercase group-hover:underline decoration-4">Office Hour Traffic Restriction</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" checked={heavyBan} onChange={toggleHeavyBan} className="sr-only" />
                                    <div className={`w-8 h-8 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-colors ${heavyBan ? 'bg-black' : 'bg-white'}`}>
                                        {heavyBan && <div className="w-3 h-3 bg-white" />}
                                    </div>
                                </div>
                                <span className="font-bold text-lg uppercase group-hover:underline decoration-4">Heavy Vehicle Ban (Daytime)</span>
                            </label>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="flex flex-col gap-6">
                        <button
                            onClick={handleRunSimulation}
                            disabled={isSimulating}
                            className="bg-[#FFCC00] text-black border-4 border-black p-8 text-3xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-none flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                            {isSimulating ? <><Settings className="animate-spin" size={32} strokeWidth={3} /> PROCESSING...</> : <><Play size={32} strokeWidth={3} /> RUN SIMULATION</>}
                        </button>
                        <div className="flex-grow bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                            <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-2 mb-6">PREDICTED LEVELS:</h3>
                            {simResult ? (
                                <div className="space-y-6 flex-grow">
                                    <div className="bg-gray-100 p-4 border-4 border-black border-l-[16px] border-l-[#FFCC00]">
                                        <p className="font-bold text-lg mb-2">EXPECTED CHANGES VS BASELINE:</p>
                                        <ul className="list-disc list-inside font-bold space-y-1 pl-2">
                                            <li>PM2.5: {simResult.pm}</li>
                                            <li>NO2: {simResult.no2}</li>
                                            {simResult.raw && (
                                                <>
                                                    <li>PM10: {simResult.raw.pm10?.toFixed(1)} µg/m³</li>
                                                    <li>CO: {simResult.raw.co?.toFixed(2)} ppm</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                    <div className={`border-4 border-black p-4 text-center ${simResult.score < (simResult.baseScore || 75) ? 'bg-[#00FF66]' : 'bg-[#FF3366]'}`}>
                                        <p className="font-bold uppercase mb-1">NEW AQI SCORE</p>
                                        <p className="text-6xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{simResult.score}</p>
                                        {simResult.baseScore && (
                                            <p className="font-bold mt-1 text-sm uppercase">
                                                {simResult.score < simResult.baseScore
                                                    ? `▼ ${simResult.baseScore - simResult.score} pts better than baseline`
                                                    : `▲ ${simResult.score - simResult.baseScore} pts worse than baseline`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow flex items-center justify-center bg-gray-100 border-4 border-black border-dashed">
                                    <p className="text-gray-400 font-bold uppercase p-4 text-center">Run simulation to see projected outcomes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* WIDGET 4: AI Decision Support and Research */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16">
                {/* Best Scenario Optimizer */}
                <div className="bg-black text-[#00FF66] border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,51,102,1)] p-8 font-mono flex flex-col">
                    <h2 className="text-2xl font-black mb-6 border-b-4 border-[#00FF66] pb-2 w-max">
                        &gt; AI SCENARIO OPTIMIZER
                    </h2>
                    {optimizerLoading ? (
                        <p className="animate-pulse">ANALYZING Bidhannagar grid...</p>
                    ) : optimizerData ? (
                        <div className="flex-grow space-y-4 text-lg">
                            <p className="animate-pulse">ANALYZING Bidhannagar grid...</p>
                            <p className="mt-4"><span className="text-white">OPTIMAL POLICY DETECTED:</span></p>
                            <div className="border-l-4 border-[#00FF66] pl-4 py-2">
                                {optimizerData.label && (
                                    <p className="text-white font-black mb-2">{optimizerData.label}</p>
                                )}
                                {optimizerData.policy_lines && optimizerData.policy_lines.length > 0
                                    ? optimizerData.policy_lines.map((line, i) => (
                                        <span key={i} className="block text-[#00FF66]">
                                            {i === 0 ? '' : '+ '}{line}
                                        </span>
                                      ))
                                    : (
                                        <>
                                            {optimizerData.policy?.traffic < 100 && <span className="block">Reduce Traffic to {optimizerData.policy?.traffic}%</span>}
                                            {optimizerData.policy?.green > 15 && <span className="block">+ Expand Green Cover to {optimizerData.policy?.green}%</span>}
                                            {optimizerData.policy?.industry < 100 && <span className="block">+ Reduce Industry to {optimizerData.policy?.industry}%</span>}
                                            {optimizerData.policy?.wind > 2 && <span className="block">+ Wind Speed: {optimizerData.policy?.wind} m/s</span>}
                                        </>
                                    )
                                }
                            </div>
                            <p className="pt-4"><span className="text-white">EXPECTED IMPROVEMENT:</span></p>
                            {optimizerData.baseline_aqi && optimizerData.optimised_aqi && (
                                    <p className="text-gray-400 text-sm font-mono mb-1">
                                        {Math.round(optimizerData.baseline_aqi)} → {Math.round(optimizerData.optimised_aqi)} AQI
                                    </p>
                                )}
                                <p className="text-2xl font-black">AQI drops by {optimizerData.expected_aqi_drop} points.</p>
                        </div>
                    ) : (
                        <div className="flex-grow space-y-4 text-lg">
                            <p className="animate-pulse">ANALYZING Bidhannagar grid...</p>
                            <p className="mt-4"><span className="text-white">OPTIMAL POLICY DETECTED:</span></p>
                            <div className="border-l-4 border-[#00FF66] pl-4 py-2">
                                Implement Heavy Vehicle Ban<br />
                                + 15% Green Cover<br />
                                + 10% Industry Reduction
                            </div>
                            <p className="pt-4"><span className="text-white">EXPECTED IMPROVEMENT:</span></p>
                            <p className="text-2xl font-black">AQI drops by 35 points.</p>
                        </div>
                    )}
                </div>

                {/* Research Analytics */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
                    <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 w-max">
                        RESEARCH ANALYTICS
                    </h2>
                    {analyticsLoading ? (
                        <p className="font-bold animate-pulse uppercase text-gray-400">Loading analytics...</p>
                    ) : (
                        <div className="flex-grow space-y-4 font-bold text-lg">
                            <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                                <span className="text-gray-500">DOMINANT POLLUTANT:</span>
                                <span className="text-[#FF3366] font-black">{analytics?.dominant_pollutant || 'PM10'}</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                                <span className="text-gray-500">CURRENT RISK LEVEL:</span>
                                <span className="bg-black text-white px-2 uppercase">{analytics?.risk_level || 'HIGH'}</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                                <span className="text-gray-500">PEAK RISK TIME:</span>
                                <span className="uppercase">{analytics?.peak_time || '19:00'}</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                                <span className="text-gray-500">SEASONAL TREND:</span>
                                <span className="text-[#7B61FF] font-black uppercase">{analytics?.season || 'Entering Winter Smog Phase'}</span>
                            </div>
                        </div>
                    )}
                    <button onClick={handleExportData} className="bg-[#00CFFF] border-4 border-black w-full py-4 text-2xl font-black uppercase flex items-center justify-center gap-3 mt-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <Download size={28} strokeWidth={3} /> EXPORT DATA (CSV)
                    </button>
                </div>
            </div>

            <BackToHomeButton />
        </div>
    );
};

export default ModelsSimulation;