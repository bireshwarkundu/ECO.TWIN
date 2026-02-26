import React, { useState, useEffect } from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';
import LoadingError from '../ui/LoadingError';
import { Settings } from 'lucide-react';

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

// Color scales for different parameters (black removed)
const colorScales = {
    'pm25': ['#00FF66', '#FFCC00', '#FF3366', '#FF0000'], // Green → Yellow → Pink → Bright Red
    'pm10': ['#00FF66', '#FFCC00', '#FF8C42', '#FF4500'], // Green → Yellow → Orange → Orange-Red
    'no2': ['#f2f0f7', '#9e9ac8', '#6a51a3', '#3f007d'], // Light Purple → Medium Purple → Dark Purple → Deep Purple
    'co': ['#edf8e9', '#74c476', '#31a354', '#006d2c'], // Light Green → Medium Green → Dark Green → Forest Green
    'so2': ['#eff3ff', '#6baed6', '#3182bd', '#08519c'], // Light Blue → Medium Blue → Dark Blue → Navy Blue
    'o3': ['#fee5d9', '#fb6a4a', '#cb181d', '#99000d'], // Light Pink → Orange-Red → Bright Red → Deep Red
    'no': ['#f2f0f7', '#9e9ac8', '#6a51a3', '#3f007d'], // Light Purple → Medium Purple → Dark Purple → Deep Purple
    'nox': ['#f7f7f7', '#bdbdbd', '#636363', '#252525'], // White → Light Grey → Medium Grey → Dark Grey
    'temperature': ['#fee5d9', '#fc9272', '#cb181d', '#99000d'], // Light Pink → Coral → Bright Red → Deep Red
    'relativehumidity': ['#eff3ff', '#6baed6', '#3182bd', '#08519c'] // Light Blue → Medium Blue → Dark Blue → Navy Blue
};

// Helper function to format date in local format (e.g., "25-Feb")
const formatLocalDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day}-${month}`;
};

// Helper function to format full date for tooltip
const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
};

const DailyCalendarChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedParam, setSelectedParam] = useState('pm25');
    const [showParamSelector, setShowParamSelector] = useState(false);
    const [dateRange, setDateRange] = useState({ from: '2025-01-01', to: '2025-12-31' });
    const [paramUnit, setParamUnit] = useState('µg/m³');

    useEffect(() => {
        fetchDailyData();
    }, [selectedParam]);

    const fetchDailyData = async () => {
        try {
            setLoading(true);
            // Fetch data for selected parameter
            const response = await fetch(`http://localhost:3000/api/histanalytics/daily-summary?param=${selectedParam}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apiResponse = await response.json();
            
            // Transform data to Nivo calendar format
            const transformedData = transformDailyData(apiResponse.data);
            
            // Update date range based on actual data
            if (transformedData.length > 0) {
                const dates = transformedData.map(d => d.day).sort();
                setDateRange({
                    from: dates[0],
                    to: dates[dates.length - 1]
                });
            }
            
            setData(transformedData);
            setParamUnit(apiResponse.unit || 'µg/m³');
            setError(null);
        } catch (err) {
            console.error('Error fetching daily summary:', err);
            setError('Failed to load daily summary data');
            
            // Fallback to mock data
            const fallbackData = generateFallbackData();
            setData(fallbackData);
        } finally {
            setLoading(false);
        }
    };

    const transformDailyData = (apiData) => {
        if (!apiData || !Array.isArray(apiData)) return [];
        
        return apiData
            .map(item => ({
                day: item.date,
                value: Math.round(item.value) // Round to integer for better calendar display
            }))
            .filter(item => item.value > 0); // Remove zero values if any
    };

    const generateFallbackData = () => {
        const data = [];
        for (let m = 1; m <= 12; m++) {
            const mStr = m.toString().padStart(2, '0');
            for (let d = 1; d <= 28; d++) {
                const dStr = d.toString().padStart(2, '0');
                data.push({ 
                    day: `2025-${mStr}-${dStr}`, 
                    value: Math.floor(Math.random() * 200) + 20 
                });
            }
        }
        return data;
    };

    const handleParamChange = (paramId) => {
        setSelectedParam(paramId);
        setShowParamSelector(false);
    };

    // Get current parameter config
    const currentParam = availableParameters.find(p => p.id === selectedParam) || availableParameters[0];
    
    // Get color scale for current parameter
    const currentColorScale = colorScales[selectedParam] || colorScales.pm25;

    // Calculate min and max values for legend
    const values = data.map(d => d.value);
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 100;
    const midLowValue = Math.round(minValue + (maxValue - minValue) * 0.33);
    const midHighValue = Math.round(minValue + (maxValue - minValue) * 0.66);

    if (loading) return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px]">
            <LoadingError type="loading" message="Loading daily calendar..." />
        </div>
    );
    
    if (error) return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-[500px]">
            <LoadingError type="error" message={error} />
        </div>
    );

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[600px] overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <h2 className="text-2xl font-black uppercase tracking-tight border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    DAILY {currentParam.name} HISTORY
                </h2>
                
                {/* Parameter Selector Button */}
                <div className="relative">
                    <button 
                        onClick={() => setShowParamSelector(!showParamSelector)}
                        className="bg-black text-white border-4 border-black px-4 py-2 font-bold uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-none text-sm"
                    >
                        <Settings size={16} /> {currentParam.name}
                    </button>

                    {showParamSelector && (
                        <div className="absolute right-0 mt-2 w-64 p-4 border-4 border-black bg-gray-50 z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-bold mb-2 border-b-2 border-black pb-1">Select Parameter</h3>
                            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                                {availableParameters.map(param => (
                                    <button
                                        key={param.id}
                                        onClick={() => handleParamChange(param.id)}
                                        className={`flex items-center justify-between p-2 border-2 border-black font-bold hover:bg-gray-100 w-full text-left ${
                                            selectedParam === param.id ? 'bg-gray-200' : ''
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
                Year-long footprint of {currentParam.name} levels ({currentParam.unit})
            </p>
            
            <div className="flex-grow overflow-x-auto overflow-y-auto">
                <div className="w-[1000px] xl:w-full h-[550px]">
                    <ResponsiveCalendar
                        data={data}
                        from={dateRange.from}
                        to={dateRange.to}
                        emptyColor="#FDFBF7"
                        colors={currentColorScale}
                        margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
                        yearSpacing={40}
                        monthBorderColor="#000000"
                        monthBorderWidth={4}
                        dayBorderWidth={2}
                        dayBorderColor="#000000"
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'row',
                                translateY: 36,
                                itemCount: 4,
                                itemWidth: 42,
                                itemHeight: 36,
                                itemsSpacing: 14,
                                itemDirection: 'right-to-left'
                            }
                        ]}
                        tooltip={(data) => {
                            const formattedDate = formatLocalDate(data.day);
                            const fullDate = formatFullDate(data.day);
                            return (
                                <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono font-bold">
                                    <div className="border-b-2 border-black pb-1 mb-1 text-sm">
                                        {fullDate}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3" style={{ backgroundColor: currentColorScale[2], border: '1px solid black' }}></div>
                                        <span style={{ color: currentParam.color }}>
                                            {currentParam.name}: {data.value} {currentParam.unit}
                                        </span>
                                    </div>
                                </div>
                            );
                        }}
                        theme={{
                            fontFamily: 'monospace',
                            fontSize: 14,
                            textColor: '#000000',
                            tooltip: {
                                container: {
                                    background: '#ffffff',
                                    border: '4px solid black',
                                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                    fontFamily: 'monospace',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    padding: '8px'
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Color Legend */}
            <div className="mt-4 pt-4 border-t-4 border-black">
                <div className="flex justify-between items-center text-sm font-bold">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4" style={{ backgroundColor: currentColorScale[0], border: '2px solid black' }}></div>
                            <span>Low ({minValue} {currentParam.unit})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4" style={{ backgroundColor: currentColorScale[1], border: '2px solid black' }}></div>
                            <span>Medium-Low ({midLowValue} {currentParam.unit})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4" style={{ backgroundColor: currentColorScale[2], border: '2px solid black' }}></div>
                            <span>Medium-High ({midHighValue} {currentParam.unit})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4" style={{ backgroundColor: currentColorScale[3], border: '2px solid black' }}></div>
                            <span>High ({maxValue} {currentParam.unit})</span>
                        </div>
                    </div>
                    <div className="bg-black text-white px-3 py-1 border-2 border-black text-xs">
                        {formatLocalDate(dateRange.from)} - {formatLocalDate(dateRange.to)}
                    </div>
                </div>
                
                {/* Color Gradient Bar */}
                <div className="w-full h-4 mt-2 relative border-2 border-black">
                    <div className="absolute inset-0" style={{
                        background: `linear-gradient(to right, ${currentColorScale.join(', ')})`
                    }}></div>
                </div>
            </div>
        </div>
    );
};

export default DailyCalendarChart;