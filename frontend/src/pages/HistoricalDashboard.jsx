import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveCalendar } from '@nivo/calendar';
import { Download } from 'lucide-react';

const monthlyData = [
    { month: 'Jan', pm25: 85, no2: 40, temp: 15 },
    { month: 'Feb', pm25: 60, no2: 35, temp: 22 },
    { month: 'Mar', pm25: 55, no2: 15, temp: 28 },
    { month: 'Apr', pm25: 70, no2: 25, temp: 32 },
    { month: 'May', pm25: 90, no2: 50, temp: 35 },
    { month: 'Jun', pm25: 110, no2: 60, temp: 36 },
    { month: 'Jul', pm25: 40, no2: 20, temp: 30 },
    { month: 'Aug', pm25: 35, no2: 18, temp: 29 },
    { month: 'Sep', pm25: 50, no2: 30, temp: 31 },
    { month: 'Oct', pm25: 75, no2: 40, temp: 28 },
    { month: 'Nov', pm25: 120, no2: 70, temp: 22 },
    { month: 'Dec', pm25: 140, no2: 85, temp: 18 }
];

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

const BrutalistTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono font-bold">
                <p className="border-b-2 border-black pb-2 mb-2 uppercase text-lg">{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color, fontWeight: 900 }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const HistoricalDashboard = () => {
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

            {/* Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 pb-16">

                {/* 1. Seasonal Trend */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[500px]">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        SEASONAL TREND (MONTHLY)
                    </h2>
                    <p className="font-bold mb-6">PM2.5 vs NO2 vs Temp averages.</p>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke="#000" strokeDasharray="3 3" />
                                <XAxis dataKey="month" stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }} />
                                <YAxis stroke="#000" tick={{ fontFamily: 'monospace', fontWeight: 'bold', fill: '#000' }} />
                                <Tooltip content={<BrutalistTooltip />} />
                                <Legend wrapperStyle={{ fontFamily: 'monospace', fontWeight: 'bold', paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="pm25" stroke="#FF3366" strokeWidth={4} dot={{ stroke: 'black', strokeWidth: 3, r: 6, fill: '#FF3366' }} activeDot={{ r: 8, stroke: 'black', strokeWidth: 3 }} />
                                <Line type="monotone" dataKey="no2" stroke="#7B61FF" strokeWidth={4} dot={{ stroke: 'black', strokeWidth: 3, r: 6, fill: '#7B61FF' }} activeDot={{ r: 8, stroke: 'black', strokeWidth: 3 }} />
                                <Line type="monotone" dataKey="temp" stroke="#00FF66" strokeWidth={4} dot={{ stroke: 'black', strokeWidth: 3, r: 6, fill: '#00FF66' }} activeDot={{ r: 8, stroke: 'black', strokeWidth: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
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
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[500px] xl:col-span-2 overflow-hidden">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        DAILY AQI HISTORY
                    </h2>
                    <p className="font-bold mb-6">Year-long footprint of hazardous air days.</p>
                    <div className="flex-grow overflow-x-auto">
                        <div className="w-[1000px] xl:w-full h-[350px]">
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
