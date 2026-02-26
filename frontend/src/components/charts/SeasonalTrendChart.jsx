import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { parameterConfig, defaultSelectedParams } from '../constants/chartConfig';
import BrutalistTooltip from '../ui/BrutalistTooltip';
import ParameterSelector from '../ui/ParameterSelector';
import LoadingError from '../ui/LoadingError';

const SeasonalTrendChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedParams, setSelectedParams] = useState(defaultSelectedParams);
    const [showParamSelector, setShowParamSelector] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_SERVER1_URL}/api/histanalytics/monthly-trends`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apiData = await response.json();
            
            // Transform the data
            const transformedData = apiData.map(item => ({
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
            
            setData(transformedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching monthly trends:', err);
            setError('Failed to load monthly trends data');
            // You might want to set fallback data here
        } finally {
            setLoading(false);
        }
    };

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

    const renderLines = () => {
        return Object.entries(parameterConfig).map(([key, config]) => {
            if (!selectedParams[key]) return null;
            
            return (
                <Line
                    key={key}
                    yAxisId={config.yAxis}
                    type="monotone"
                    dataKey={key}
                    name={config.name}
                    stroke={config.color}
                    strokeWidth={3}
                    dot={{ stroke: 'black', strokeWidth: 2, r: 4, fill: config.color }}
                    activeDot={{ r: 6, stroke: 'black', strokeWidth: 2 }}
                />
            );
        });
    };

    if (loading) return <LoadingError type="loading" message="Loading seasonal trends..." />;
    if (error) return <LoadingError type="error" message={error} />;
    if (!data.length) return <LoadingError type="error" message="No data available" />;

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight border-b-4 border-black pb-2 inline-block w-max" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        SEASONAL TREND (MONTHLY)
                    </h2>
                    <p className="font-bold mt-2">All parameters from API - Select which to display</p>
                </div>
                
                <ParameterSelector
                    selectedParams={selectedParams}
                    onToggle={handleParamToggle}
                    onSelectAll={selectAll}
                    onClearAll={clearAll}
                    isOpen={showParamSelector}
                    onToggleOpen={() => setShowParamSelector(!showParamSelector)}
                />
            </div>

            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                        
                        {renderLines()}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SeasonalTrendChart;