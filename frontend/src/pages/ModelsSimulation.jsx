import React, { useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis,
    Tooltip, Legend, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, Settings, Play, Database, Download } from 'lucide-react';
import BackToHomeButton from '../components/BackToHomeButton';

// Mock Data for the Full Pollutant Matrix
const pollutantMatrix = [
    { name: 'PM2.5', value: 45, unit: 'µg/m³', trend: 'up' },
    { name: 'PM10', value: 82, unit: 'µg/m³', trend: 'down' },
    { name: 'NO', value: 12, unit: 'ppb', trend: 'up' },
    { name: 'NO2', value: 34, unit: 'ppb', trend: 'up' },
    { name: 'CO', value: 1.2, unit: 'ppm', trend: 'down' },
    { name: 'O3', value: 45, unit: 'ppb', trend: 'down' },
    { name: 'SO2', value: 8, unit: 'ppb', trend: 'up' }
];

// Mock Data for Forecast
const forecastDataSets = {
    'PM2.5': [
        { time: '12:00', past: 45, future: null },
        { time: '14:00', past: 48, future: null },
        { time: '16:00', past: 55, future: null },
        { time: '18:00', past: 65, future: 65 }, // NOW
        { time: '20:00', past: null, future: 75 },
        { time: '22:00', past: null, future: 68 },
        { time: '00:00', past: null, future: 50 },
        { time: '02:00', past: null, future: 42 }
    ],
    'NO2': [
        { time: '12:00', past: 30, future: null },
        { time: '14:00', past: 32, future: null },
        { time: '16:00', past: 36, future: null },
        { time: '18:00', past: 45, future: 45 }, // NOW
        { time: '20:00', past: null, future: 55 },
        { time: '22:00', past: null, future: 40 },
        { time: '00:00', past: null, future: 25 },
        { time: '02:00', past: null, future: 20 }
    ],
    'PM10': [
        { time: '12:00', past: 80, future: null },
        { time: '14:00', past: 85, future: null },
        { time: '16:00', past: 95, future: null },
        { time: '18:00', past: 110, future: 110 }, // NOW
        { time: '20:00', past: null, future: 125 },
        { time: '22:00', past: null, future: 100 },
        { time: '00:00', past: null, future: 85 },
        { time: '02:00', past: null, future: 75 }
    ],
    'CO': [
        { time: '12:00', past: 1.2, future: null },
        { time: '14:00', past: 1.3, future: null },
        { time: '16:00', past: 1.5, future: null },
        { time: '18:00', past: 1.8, future: 1.8 },
        { time: '20:00', past: null, future: 2.2 },
        { time: '22:00', past: null, future: 1.5 },
        { time: '00:00', past: null, future: 1.1 },
        { time: '02:00', past: null, future: 0.9 }
    ],
    'NO': [
        { time: '12:00', past: 12, future: null },
        { time: '14:00', past: 15, future: null },
        { time: '16:00', past: 18, future: null },
        { time: '18:00', past: 24, future: 24 },
        { time: '20:00', past: null, future: 30 },
        { time: '22:00', past: null, future: 22 },
        { time: '00:00', past: null, future: 15 },
        { time: '02:00', past: null, future: 12 }
    ],
    'NOx': [
        { time: '12:00', past: 42, future: null },
        { time: '14:00', past: 47, future: null },
        { time: '16:00', past: 54, future: null },
        { time: '18:00', past: 69, future: 69 },
        { time: '20:00', past: null, future: 85 },
        { time: '22:00', past: null, future: 62 },
        { time: '00:00', past: null, future: 40 },
        { time: '02:00', past: null, future: 32 }
    ],
    'O3': [
        { time: '12:00', past: 45, future: null },
        { time: '14:00', past: 55, future: null },
        { time: '16:00', past: 60, future: null },
        { time: '18:00', past: 50, future: 50 },
        { time: '20:00', past: null, future: 35 },
        { time: '22:00', past: null, future: 25 },
        { time: '00:00', past: null, future: 20 },
        { time: '02:00', past: null, future: 15 }
    ],
    'SO2': [
        { time: '12:00', past: 8, future: null },
        { time: '14:00', past: 9, future: null },
        { time: '16:00', past: 12, future: null },
        { time: '18:00', past: 15, future: 15 },
        { time: '20:00', past: null, future: 18 },
        { time: '22:00', past: null, future: 14 },
        { time: '00:00', past: null, future: 10 },
        { time: '02:00', past: null, future: 8 }
    ],
    'Temperature': [
        { time: '12:00', past: 32, future: null },
        { time: '14:00', past: 34, future: null },
        { time: '16:00', past: 33, future: null },
        { time: '18:00', past: 30, future: 30 },
        { time: '20:00', past: null, future: 28 },
        { time: '22:00', past: null, future: 26 },
        { time: '00:00', past: null, future: 25 },
        { time: '02:00', past: null, future: 24 }
    ],
    'Humidity': [
        { time: '12:00', past: 55, future: null },
        { time: '14:00', past: 50, future: null },
        { time: '16:00', past: 52, future: null },
        { time: '18:00', past: 60, future: 60 },
        { time: '20:00', past: null, future: 65 },
        { time: '22:00', past: null, future: 70 },
        { time: '00:00', past: null, future: 72 },
        { time: '02:00', past: null, future: 75 }
    ]
};

// Mock Data for Bar Chart
const barChartData = pollutantMatrix.map(p => ({
    name: p.name,
    value: p.value
}));

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

const ModelsSimulation = () => {
    // Forecast State
    const [selectedForecast, setSelectedForecast] = useState('PM2.5');
    const [forecastSelectOpen, setForecastSelectOpen] = useState(false);

    // Simulator State
    const [trafficVol, setTrafficVol] = useState(100);
    const [greenCover, setGreenCover] = useState(15);
    const [industryVol, setIndustryVol] = useState(100);
    const [windSpeed, setWindSpeed] = useState(2);
    const [officeBan, setOfficeBan] = useState(false);
    const [heavyBan, setHeavyBan] = useState(false);

    const [isSimulating, setIsSimulating] = useState(false);
    const [simResult, setSimResult] = useState(null);

    const handleExportData = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Pollutant,Time,Historical,Predicted\n";

        Object.entries(forecastDataSets).forEach(([pollutant, data]) => {
            data.forEach(row => {
                csvContent += `${pollutant},${row.time},${row.past || ''},${row.future || ''}\n`;
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bidhannagar_forecast_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRunSimulation = () => {
        setIsSimulating(true);
        setSimResult(null);

        setTimeout(() => {
            // Pseudo-math simulation logic
            let baseScore = 145;
            let reduction = (100 - trafficVol) * 0.4
                + (greenCover * 0.8)
                + (100 - industryVol) * 0.5
                + (windSpeed * 2)
                + (officeBan ? 15 : 0)
                + (heavyBan ? 20 : 0);

            let newScore = Math.max(10, Math.floor(baseScore - reduction));

            let no2Change = Math.floor((100 - trafficVol) * 0.3 + (heavyBan ? 12 : 0) + (officeBan ? 8 : 0));
            let pmChange = Math.floor((100 - industryVol) * 0.4 + (greenCover * 0.5) + (heavyBan ? 15 : 0));

            setIsSimulating(false);
            setSimResult({
                score: newScore,
                no2: no2Change > 0 ? `-${no2Change}%` : `+${Math.abs(no2Change)}%`,
                pm: pmChange > 0 ? `-${pmChange}%` : `+${Math.abs(pmChange)}%`
            });
        }, 1200);
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
                    <div className="flex items-center gap-4 mb-4">
                        <AlertTriangle size={48} strokeWidth={3} />
                        <h2 className="text-6xl font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AQI: 145</h2>
                    </div>
                    <div className="bg-black text-white px-6 py-2 text-2xl font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                        MODERATE
                    </div>
                    <p className="font-bold border-t-4 border-black pt-4 text-lg">
                        Health Advisory: <br />
                        <span className="bg-white text-black px-2 mt-2 inline-block">Sensitive groups should reduce outdoor exertion.</span>
                    </p>
                </div>

                {/* Full Pollutant Matrix */}
                <div className="xl:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 inline-block">LIVE POLLUTANT MATRIX</h3>
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
                        {/* Empty filler block for grid symmetry */}
                        <div className="border-4 border-black bg-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                            <Database className="text-[#FFCC00]" size={32} />
                        </div>
                    </div>
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
                                {selectedForecast} LEVELS
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                            {forecastSelectOpen && (
                                <div className="absolute right-0 top-full mt-2 min-w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 flex flex-col max-h-60 overflow-y-auto">
                                    {['PM2.5', 'PM10', 'NO2', 'CO', 'NO', 'NOx', 'O3', 'SO2', 'Temperature', 'Humidity'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                setSelectedForecast(option);
                                                setForecastSelectOpen(false);
                                            }}
                                            className={`px-4 py-2 font-black uppercase text-left border-b-4 border-black last:border-b-0 hover:bg-[#FFCC00] ${selectedForecast === option ? 'bg-gray-200' : ''}`}
                                        >
                                            {option} LEVELS
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecastDataSets[selectedForecast]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                <XAxis dataKey="time" stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                <YAxis stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                <Tooltip content={<BrutalistTooltip />} />

                                <ReferenceArea x1="18:00" x2="20:00" fill="#FF3366" fillOpacity={0.2} />

                                <Line type="monotone" dataKey="past" stroke="#000" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#000' }} activeDot={{ r: 8 }} name="Historical" />
                                <Line type="monotone" dataKey="future" stroke="#FF3366" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2, fill: '#FF3366' }} activeDot={{ r: 8 }} name="Predicted" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs font-black uppercase">
                        <div className="flex items-center gap-1"><div className="w-4 h-1 bg-black"></div> Historical</div>
                        <div className="flex items-center gap-1"><div className="w-4 h-1 bg-[#FF3366] border-dashed border-t-2 border-[#FF3366]"></div> Predicted</div>
                        <div className="flex items-center gap-1"><div className="w-4 h-4 bg-[#FF3366] opacity-20 border border-black"></div> Peak Hour</div>
                    </div>
                </div>

                {/* Current Pollutant Comparison */}
                <div className="bg-[#00CFFF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px] flex flex-col">
                    <h3 className="text-2xl font-black uppercase border-b-4 border-black pb-2 inline-block w-max mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        RELATIVE POLLUTANT RATIOS
                    </h3>
                    <div className="flex-grow bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#000" vertical={false} />
                                <XAxis dataKey="name" stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold', fontSize: 12 }} />
                                <YAxis stroke="#000" strokeWidth={2} tick={{ fontWeight: 'bold' }} />
                                <Tooltip content={<BrutalistTooltip />} cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill="#FF3366" stroke="#000" strokeWidth={3} radius={0} />
                            </BarChart>
                        </ResponsiveContainer>
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
                                <input
                                    type="number"
                                    min="50" max="150"
                                    value={trafficVol}
                                    onChange={(e) => setTrafficVol(Number(e.target.value))}
                                    className="w-20 border-2 border-black p-1 text-center font-black outline-none focus:bg-[#FFCC00]"
                                />
                            </div>
                            <input type="range" min="50" max="150" value={trafficVol} onChange={(e) => setTrafficVol(Number(e.target.value))} className="w-full h-4 bg-gray-200 border-2 border-black appearance-none cursor-pointer" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center font-bold mb-2">
                                <span>Green Cover Expansion (%)</span>
                                <input
                                    type="number"
                                    min="0" max="50"
                                    value={greenCover}
                                    onChange={(e) => setGreenCover(Number(e.target.value))}
                                    className="w-20 border-2 border-black p-1 text-center font-black outline-none focus:bg-[#00FF66]"
                                />
                            </div>
                            <input type="range" min="0" max="50" value={greenCover} onChange={(e) => setGreenCover(Number(e.target.value))} className="w-full h-4 bg-[#00FF66] border-2 border-black appearance-none cursor-pointer" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center font-bold mb-2">
                                <span>Industrial Activity (%)</span>
                                <input
                                    type="number"
                                    min="50" max="150"
                                    value={industryVol}
                                    onChange={(e) => setIndustryVol(Number(e.target.value))}
                                    className="w-20 border-2 border-black p-1 text-center font-black outline-none focus:bg-[#FFCC00]"
                                />
                            </div>
                            <input type="range" min="50" max="150" value={industryVol} onChange={(e) => setIndustryVol(Number(e.target.value))} className="w-full h-4 bg-[#FFCC00] border-2 border-black appearance-none cursor-pointer" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center font-bold mb-2">
                                <span>Wind Speed (m/s)</span>
                                <input
                                    type="number"
                                    min="0" max="10"
                                    value={windSpeed}
                                    onChange={(e) => setWindSpeed(Number(e.target.value))}
                                    className="w-20 border-2 border-black p-1 text-center font-black outline-none focus:bg-[#00CFFF]"
                                />
                            </div>
                            <input type="range" min="0" max="10" value={windSpeed} onChange={(e) => setWindSpeed(Number(e.target.value))} className="w-full h-4 bg-[#00CFFF] border-2 border-black appearance-none cursor-pointer" />
                        </div>

                        <div className="border-t-4 border-black pt-4 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" checked={officeBan} onChange={() => setOfficeBan(!officeBan)} className="sr-only" />
                                    <div className={`w-8 h-8 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-colors ${officeBan ? 'bg-black' : 'bg-white'}`}>
                                        {officeBan && <div className="w-3 h-3 bg-white" />}
                                    </div>
                                </div>
                                <span className="font-bold text-lg uppercase group-hover:underline decoration-4">Office Hour Traffic Restriction</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" checked={heavyBan} onChange={() => setHeavyBan(!heavyBan)} className="sr-only" />
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
                                        <p className="font-bold text-lg mb-2">EXPECTED CHANGES:</p>
                                        <ul className="list-disc list-inside font-bold space-y-1 pl-2">
                                            <li>PM2.5: {simResult.pm}</li>
                                            <li>NO2: {simResult.no2}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-[#00FF66] border-4 border-black p-4 text-center">
                                        <p className="font-bold uppercase mb-1">NEW POLLUTION INDEX SCORE</p>
                                        <p className="text-6xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{simResult.score}</p>
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
                </div>

                {/* Research Analytics */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col">
                    <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 w-max">
                        RESEARCH ANALYTICS
                    </h2>
                    <div className="flex-grow space-y-4 font-bold text-lg">
                        <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                            <span className="text-gray-500">DOMINANT POLLUTANT:</span>
                            <span className="text-[#FF3366] font-black">PM10</span>
                        </div>
                        <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                            <span className="text-gray-500">CURRENT RISK LEVEL:</span>
                            <span className="bg-black text-white px-2 uppercase">High</span>
                        </div>
                        <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                            <span className="text-gray-500">PEAK RISK TIME:</span>
                            <span className="uppercase">19:00</span>
                        </div>
                        <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2">
                            <span className="text-gray-500">SEASONAL TREND:</span>
                            <span className="text-[#7B61FF] font-black uppercase">Entering Winter Smog Phase</span>
                        </div>
                    </div>

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
