import React from 'react';
import { Radio, MapPin, Activity } from 'lucide-react';

const StationSelector = ({ 
    stations, 
    selectedStation, 
    onStationSelect,
    stationData = {},
    className = '' 
}) => {
    
    // Get AQI level and color based on PM2.5
    const getAQIInfo = (pm25) => {
        if (!pm25 && pm25 !== 0) return { level: 'OFFLINE', color: '#666666', textColor: 'white' };
        
        if (pm25 <= 12) return { level: 'GOOD', color: '#00FF66', textColor: 'black' };
        if (pm25 <= 35.4) return { level: 'MODERATE', color: '#FFCC00', textColor: 'black' };
        if (pm25 <= 55.4) return { level: 'UNHEALTHY SENS', color: '#FF8C42', textColor: 'black' };
        if (pm25 <= 150.4) return { level: 'UNHEALTHY', color: '#FF3366', textColor: 'white' };
        if (pm25 <= 250.4) return { level: 'VERY UNHEALTHY', color: '#9370DB', textColor: 'white' };
        return { level: 'HAZARDOUS', color: '#000000', textColor: 'white' };
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return 'No data';
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } catch {
            return 'Invalid time';
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Desktop/Tablet Grid View */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stations.map((station) => {
                    const data = stationData[station.id];
                    const pm25 = data?.pm25;
                    const aqiInfo = getAQIInfo(pm25);
                    const isSelected = station.id === selectedStation;
                    
                    return (
                        <button
                            key={station.id}
                            onClick={() => onStationSelect(station.id)}
                            className={`
                                relative border-4 font-mono transition-all text-left
                                ${isSelected 
                                    ? 'bg-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' 
                                    : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                }
                            `}
                            style={{ borderColor: station.color }}
                        >
                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#FFCC00] border-2 border-black rotate-45 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-black rotate-45"></div>
                                </div>
                            )}

                            <div className="p-4">
                                {/* Header with Icon and AQI */}
                                <div className="flex items-center justify-between mb-3">
                                    <Radio 
                                        size={20} 
                                        color={isSelected ? 'white' : station.color}
                                        className={isSelected ? 'animate-pulse' : ''}
                                    />
                                    <span 
                                        className="text-xs font-black px-2 py-1 border-2 border-black"
                                        style={{ 
                                            backgroundColor: aqiInfo.color,
                                            color: aqiInfo.textColor
                                        }}
                                    >
                                        {aqiInfo.level}
                                    </span>
                                </div>

                                {/* Station Name */}
                                <div className="text-sm uppercase font-black mb-1 truncate">
                                    {station.name}
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-1 text-xs mb-3 opacity-75">
                                    <MapPin size={12} />
                                    <span className="truncate">{station.location || 'Kolkata'}</span>
                                </div>

                                {/* PM2.5 Value */}
                                <div className="flex items-baseline gap-1">
                                    <span 
                                        className="text-3xl font-black"
                                        style={{ color: isSelected ? 'white' : station.color }}
                                    >
                                        {pm25?.toFixed(1) || '--'}
                                    </span>
                                    <span className="text-xs font-bold">µg/m³</span>
                                </div>

                                {/* Last Updated */}
                                <div className="text-[10px] font-bold mt-2 opacity-75">
                                    {data?.timestamp ? formatTime(data.timestamp) : 'Offline'}
                                </div>
                            </div>

                            {/* Bottom Accent */}
                            <div 
                                className="h-1 w-full" 
                                style={{ backgroundColor: station.color }}
                            ></div>
                        </button>
                    );
                })}
            </div>

            {/* Mobile Horizontal Scroll View */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex gap-3 min-w-min">
                    {stations.map((station) => {
                        const data = stationData[station.id];
                        const pm25 = data?.pm25;
                        const aqiInfo = getAQIInfo(pm25);
                        const isSelected = station.id === selectedStation;
                        
                        return (
                            <button
                                key={station.id}
                                onClick={() => onStationSelect(station.id)}
                                className={`
                                    flex-none w-64 border-4 font-mono transition-all text-left
                                    ${isSelected 
                                        ? 'bg-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' 
                                        : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    }
                                `}
                                style={{ borderColor: station.color }}
                            >
                                <div className="p-3">
                                    {/* Mobile Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Radio size={16} color={isSelected ? 'white' : station.color} />
                                            <span className="text-xs font-black truncate max-w-[120px]">
                                                {station.name}
                                            </span>
                                        </div>
                                        <span 
                                            className="text-[10px] font-black px-2 py-0.5 border-2 border-black"
                                            style={{ 
                                                backgroundColor: aqiInfo.color,
                                                color: aqiInfo.textColor
                                            }}
                                        >
                                            {aqiInfo.level}
                                        </span>
                                    </div>

                                    {/* Mobile Value */}
                                    <div className="flex items-baseline justify-between">
                                        <div className="flex items-baseline gap-1">
                                            <span 
                                                className="text-2xl font-black"
                                                style={{ color: isSelected ? 'white' : station.color }}
                                            >
                                                {pm25?.toFixed(1) || '--'}
                                            </span>
                                            <span className="text-[10px] font-bold">µg/m³</span>
                                        </div>
                                        <span className="text-[10px] opacity-75">
                                            {data?.timestamp ? formatTime(data.timestamp) : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Network Status Bar */}
            <div className="mt-4 flex items-center justify-between text-xs font-mono font-bold border-t-2 border-black pt-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Activity size={14} />
                        <span>
                            {Object.values(stationData).filter(d => d?.pm25).length}/{stations.length} Active
                        </span>
                    </span>
                    <span className="text-gray-600">
                        Last network update: {
                            Object.values(stationData)
                                .map(d => d?.timestamp)
                                .filter(Boolean)
                                .sort()
                                .reverse()[0] 
                                ? formatTime(Object.values(stationData).map(d => d?.timestamp).filter(Boolean).sort().reverse()[0])
                                : 'Never'
                        }
                    </span>
                </div>
                <div className="flex gap-2">
                    {stations.map(station => (
                        <div 
                            key={station.id}
                            className="w-2 h-2 rounded-full"
                            style={{ 
                                backgroundColor: stationData[station.id]?.pm25 ? station.color : '#ccc',
                                border: '1px solid black'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StationSelector;