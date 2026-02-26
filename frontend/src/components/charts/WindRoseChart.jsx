import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import BrutalistTooltip from '../ui/BrutalistTooltip';

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

const WindRoseChart = () => {
    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[500px]">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                POLLUTION SOURCE (WIND)
            </h2>
            <p className="font-bold mb-6">Correlation of PM2.5 levels against wind direction.</p>
            
            <div className="flex-grow flex items-center justify-center -ml-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={windRoseData}>
                        <PolarGrid 
                            gridType="polygon" 
                            stroke="#000" 
                            strokeWidth={3}
                        />
                        <PolarAngleAxis 
                            dataKey="direction" 
                            stroke="#000" 
                            tick={{ 
                                fontFamily: 'monospace', 
                                fontWeight: 'black', 
                                fill: '#000', 
                                fontSize: 18 
                            }} 
                        />
                        <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 200]} 
                            stroke="#000" 
                            tick={{ 
                                fontFamily: 'monospace', 
                                fontWeight: 'bold', 
                                fill: '#000' 
                            }} 
                        />
                        <Radar 
                            name="PM2.5 Index" 
                            dataKey="value" 
                            stroke="#000" 
                            strokeWidth={4} 
                            fill="#00CFFF" 
                            fillOpacity={0.9} 
                        />
                        <Tooltip content={<BrutalistTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Legend/AQI Indicator */}
            <div className="mt-4 pt-4 border-t-4 border-black grid grid-cols-2 gap-4 text-sm font-bold">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#00CFFF] border-2 border-black"></div>
                    <span>PM2.5 Concentration</span>
                </div>
                <div className="text-right">
                    <span className="bg-black text-white px-2 py-1">Higher = More Pollution</span>
                </div>
            </div>
        </div>
    );
};

export default WindRoseChart;