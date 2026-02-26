import React, { useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import { Settings, Play, Terminal } from 'lucide-react';

const forecasterData = [
    { time: '06:00', historical_pm25: 35, predicted_pm25: null },
    { time: '08:00', historical_pm25: 42, predicted_pm25: null },
    { time: '10:00', historical_pm25: 55, predicted_pm25: null },
    { time: '12:00', historical_pm25: 48, predicted_pm25: null },
    { time: '14:00', historical_pm25: 45, predicted_pm25: null },
    { time: '16:00', historical_pm25: 50, predicted_pm25: null },
    { time: '18:00', historical_pm25: 65, predicted_pm25: null }, // NOW
    { time: '20:00', historical_pm25: null, predicted_pm25: 75 },
    { time: '22:00', historical_pm25: null, predicted_pm25: 68 },
    { time: '00:00', historical_pm25: null, predicted_pm25: 55 },
    { time: '02:00', historical_pm25: null, predicted_pm25: 40 },
    { time: '04:00', historical_pm25: null, predicted_pm25: 38 },
    { time: '06:00', historical_pm25: null, predicted_pm25: 45 }
];

// Combine the point 'NOW' to bridge the gap in recharts line segment
forecasterData[6].predicted_pm25 = forecasterData[6].historical_pm25;

const featureImportanceData = [
    { feature: 'Traffic Hour', weight: 65 },
    { feature: 'Temperature', weight: 20 },
    { feature: 'Wind Speed', weight: 10 },
    { feature: 'Humidity', weight: 5 }
];

const BrutalistTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono font-bold">
                <p className="border-b-2 border-black pb-2 mb-2 uppercase text-lg">{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color || '#000', fontWeight: 900 }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ModelsSimulation = () => {
    // Simulator State
    const [trafficVol, setTrafficVol] = useState(100);
    const [greenCover, setGreenCover] = useState(15);
    const [heavyBan, setHeavyBan] = useState(false);

    const [isSimulating, setIsSimulating] = useState(false);
    const [simResult, setSimResult] = useState(null);

    const handleRunSimulation = () => {
        setIsSimulating(true);
        setSimResult(null);

        // Fake network/calculation delay
        setTimeout(() => {
            // Very simple pseudo-math logic for demonstration
            let no2Drop = Math.floor((100 - trafficVol) * 0.3 + (heavyBan ? 12 : 0));
            let pmDrop = Math.floor((100 - trafficVol) * 0.2 + (greenCover * 0.5) + (heavyBan ? 8 : 0));

            // Prevent weird negative phrasing by formatting it nicely
            const no2Text = no2Drop > 0 ? `drops by ${no2Drop}%` : `rises by ${Math.abs(no2Drop)}%`;
            const pmText = pmDrop > 0 ? `drops by ${pmDrop}%` : `rises by ${Math.abs(pmDrop)}%`;

            setIsSimulating(false);
            setSimResult(`PREDICTED IMPACT: NO2 ${no2Text}, PM2.5 ${pmText}`);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-mono text-black selection:bg-[#00CFFF]">
            {/* Header Section */}
            <div className="mb-10 border-b-4 border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight bg-[#FF3366] text-white px-6 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        AI MODELS &amp; SIMULATION
                    </h1>
                    <p className="text-lg font-bold bg-white border-2 border-black px-4 py-2 mt-6 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Bidhannagar Predictive Engine &amp; Policy Sandbox
                    </p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-16">

                {/* 1. Policy Sandbox (Full Width) */}
                <div className="lg:col-span-2 bg-[#00CFFF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 flex flex-col xl:flex-row gap-8">
                    {/* Controls */}
                    <div className="flex-1 bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-2 mb-6 border-b-4 border-black pb-2">
                            <Settings size={28} strokeWidth={3} />
                            <h2 className="text-3xl font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>THE "WHAT-IF" SANDBOX</h2>
                        </div>
                        <p className="font-bold mb-8 text-lg bg-[#FFCC00] border-2 border-black inline-block px-2">Adjust urban parameters to simulate 5-year pollution impact.</p>

                        <div className="space-y-8">
                            {/* Slider 1 */}
                            <div>
                                <div className="flex justify-between font-black uppercase text-lg mb-2">
                                    <span>Sector V Traffic Volume</span>
                                    <span>{trafficVol}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50" max="150"
                                    value={trafficVol}
                                    onChange={(e) => setTrafficVol(e.target.value)}
                                    className="w-full h-4 bg-white border-4 border-black appearance-none cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer
                                    [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:cursor-pointer"
                                />
                            </div>

                            {/* Slider 2 */}
                            <div>
                                <div className="flex justify-between font-black uppercase text-lg mb-2">
                                    <span>Salt Lake Green Cover (Added)</span>
                                    <span>+{greenCover}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="30"
                                    value={greenCover}
                                    onChange={(e) => setGreenCover(e.target.value)}
                                    className="w-full h-4 bg-white border-4 border-black appearance-none cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer
                                    [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:cursor-pointer"
                                />
                            </div>

                            {/* BAN TOGGLE */}
                            <div className="flex items-center justify-between bg-[#FDFBF7] border-4 border-black p-4">
                                <span className="font-black uppercase text-lg">Heavy Vehicle Ban (08:00 - 20:00)</span>
                                <button
                                    onClick={() => setHeavyBan(!heavyBan)}
                                    className={`border-4 border-black px-6 py-2 font-black uppercase transition-none ${heavyBan ? 'bg-[#00FF66] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-[#FF3366] text-white shadow-none translate-x-1 translate-y-1'}`}
                                >
                                    {heavyBan ? 'ACTIVE' : 'OFF'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex-1 flex flex-col justify-center items-center gap-8 bg-[#FDFBF7] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            onClick={handleRunSimulation}
                            disabled={isSimulating}
                            className="w-full bg-[#FFCC00] border-4 border-black px-8 py-6 font-black uppercase text-3xl md:text-5xl flex items-center justify-center gap-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-3 active:translate-y-3 active:shadow-none transition-none disabled:opacity-80 disabled:cursor-wait"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                            {isSimulating ? 'CALCULATING...' : <><Play size={40} fill="black" /> RUN SIMULATION</>}
                        </button>

                        <div className="w-full bg-white border-4 border-black min-h-[150px] flex items-center justify-center p-8 text-center relative">
                            <div className="absolute top-0 left-0 bg-black text-white px-3 py-1 font-bold text-sm tracking-widest border-b-4 border-r-4 border-black uppercase">
                                Output Logs
                            </div>

                            {simResult ? (
                                <p className="text-2xl font-black uppercase bg-[#00FF66] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse" style={{ animationDirection: 'alternate', animationIterationCount: 3 }}>
                                    {simResult}
                                </p>
                            ) : (
                                <p className="text-gray-400 font-bold uppercase text-xl">AWAITING ENGINE INPUT...</p>
                            )}
                        </div>
                    </div>
                </div>


                {/* 2. Forecaster */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[550px]">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-2 inline-block w-max bg-[#00FF66] px-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        72-HOUR PREDICTION MODEL
                    </h2>
                    <p className="font-bold mb-6 text-lg">LSTM Time-Series forecast for PM2.5</p>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecasterData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid stroke="#000" strokeDasharray="5 5" />
                                <XAxis dataKey="time" stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }} />
                                <YAxis stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }} />
                                <Tooltip content={<BrutalistTooltip />} />
                                <Legend wrapperStyle={{ fontFamily: 'monospace', fontWeight: 'bold', paddingTop: '10px' }} />
                                <ReferenceLine x="18:00" stroke="black" strokeWidth={4} label={{ position: 'top', value: 'NOW', fill: 'black', fontWeight: 'black', fontSize: 20 }} strokeDasharray="3 3" />
                                <Line type="step" dataKey="historical_pm25" name="Past PM2.5 (Sensor)" stroke="#000" strokeWidth={5} dot={{ stroke: 'black', strokeWidth: 4, r: 6, fill: '#000' }} isAnimationActive={false} />
                                <Line type="step" dataKey="predicted_pm25" name="Future PM2.5 (LSTM AI)" stroke="#FF3366" strokeWidth={5} strokeDasharray="10 10" dot={{ stroke: 'black', strokeWidth: 4, r: 6, fill: '#FF3366' }} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {/* 3. Model Transparency */}
                <div className="bg-[#FDFBF7] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[550px] relative overflow-hidden">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        MODEL HEALTH &amp; TRANSPARENCY
                    </h2>
                    <p className="font-bold mb-6 text-lg bg-black text-white inline-block px-2">Live stats from the Random Forest Regressor.</p>

                    {/* Terminal Box */}
                    <div className="bg-black text-[#00FF66] font-mono p-4 border-4 border-black mb-6 shadow-[8px_8px_0px_0px_rgba(255,51,102,1)] flex flex-col">
                        <div className="flex items-center gap-2 mb-2 border-b-2 border-dashed border-[#00FF66] pb-2 text-[#00FF66]">
                            <Terminal size={20} />
                            <span className="font-black">LSTM_RF_ENGINE_V2</span>
                        </div>
                        <p className="animate-pulse">STATUS: ONLINE</p>
                        <p>LAST TRAINED: Feb 26, 2026</p>
                        <p>RMSE: 4.2 µg/m³</p>
                        <p>R² SCORE: 0.89</p>
                        <p className="text-[#FFCC00]">LIVE DRIFT ERROR: +1.2%</p>
                    </div>

                    <p className="font-black uppercase border-b-4 border-black pb-1 mb-4 inline-block">Feature Importance Weights</p>
                    {/* Bar Chart */}
                    <div className="flex-grow pb-8 pr-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={featureImportanceData} margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                                <CartesianGrid stroke="#000" strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'bold' }} />
                                <YAxis type="category" dataKey="feature" stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000', fontSize: 14 }} width={120} />
                                <Tooltip content={<BrutalistTooltip />} cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="weight" name="Impact Weight (%)" fill="#7B61FF" stroke="#000" strokeWidth={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ModelsSimulation;
