import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BrutalistCard from '../components/BrutalistCard';
import ActionButton from '../components/ActionButton';
import MarqueeBanner from '../components/MarqueeBanner';
import ComparativeAnalytics from '../components/ComparativeAnalytics';
import BackToHomeButton from '../components/BackToHomeButton';
import { Activity, Thermometer, Wind, Zap, BarChart2, Droplets, Gauge, Compass, Cloud } from 'lucide-react';

const Dashboard = () => {
    const [liveData, setLiveData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(null);

    const fetchLiveData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Updated to use port 3000 as per your API endpoint
            const res = await axios.get('http://localhost:3000/api/realtime/livedata');
            
            // Transform the data to include location and format
            const transformedData = {
                ...res.data,
                location: 'SECTOR V, KOLKATA', // You can make this dynamic based on your data
                lastUpdated: res.data.timestamp || new Date().toISOString(),
                // Ensure all values are numbers
                pm25: Number(res.data.pm25) || 0,
                pm10: Number(res.data.pm10) || 0,
                co: Number(res.data.co) || 0,
                no2: Number(res.data.no2) || 0,
                no: Number(res.data.no) || 0,
                nox: Number(res.data.nox) || 0,
                o3: Number(res.data.o3) || 0,
                so2: Number(res.data.so2) || 0,
                temperature: Number(res.data.temperature) || 0,
                humidity: Number(res.data.humidity) || 0,
                wind_speed: Number(res.data.wind_speed) || 0,
                wind_direction: Number(res.data.wind_direction) || 0
            };
            
            setLiveData(transformedData);
            setLastFetchTime(new Date());
        } catch (err) {
            console.error('Error fetching live data:', err);
            setError('Failed to fetch live data. Please try again.');
            
            // Fallback data for development
            setLiveData({
                timestamp: new Date().toISOString(),
                pm25: 56.5,
                pm10: 131.79,
                co: 0.804,
                no2: 10.27,
                no: 15.37,
                nox: 0.01782,
                o3: 58.22,
                so2: 3.63,
                temperature: 28.18,
                humidity: 41.68,
                wind_speed: 1.06,
                wind_direction: 249.36,
                location: 'SECTOR V, KOLKATA',
                lastUpdated: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchLiveData();
        }, 60000 * 60); // 60,000 ms = 1 minute
        
        return () => clearInterval(interval);
    }, []);

    const saveToHistory = async () => {
        if (!liveData) return;
        try {
            const payload = {
                timestamp: liveData.timestamp || new Date().toISOString(),
                location: liveData.location,
                pm25: liveData.pm25,
                pm10: liveData.pm10,
                co: liveData.co,
                no2: liveData.no2,
                no: liveData.no,
                nox: liveData.nox,
                o3: liveData.o3,
                so2: liveData.so2,
                temperature: liveData.temperature,
                humidity: liveData.humidity,
                wind_speed: liveData.wind_speed,
                wind_direction: liveData.wind_direction
            };
            
            await axios.post('http://localhost:5001/api/history', { data: [payload] });
            alert("✓ RECORD SAVED STRONGLY TO HISTORY!");
        } catch (err) {
            console.error(err);
            alert("✗ FAILED TO SAVE DATA.");
        }
    };

    // Determine AQI level and color based on PM2.5
    const getAQILevel = (pm25) => {
        if (pm25 <= 12) return { level: 'GOOD', color: '#00FF66' };
        if (pm25 <= 35.4) return { level: 'MODERATE', color: '#FFCC00' };
        if (pm25 <= 55.4) return { level: 'UNHEALTHY FOR SENSITIVE', color: '#FF8C42' };
        if (pm25 <= 150.4) return { level: 'UNHEALTHY', color: '#FF3366' };
        if (pm25 <= 250.4) return { level: 'VERY UNHEALTHY', color: '#9370DB' };
        return { level: 'HAZARDOUS', color: '#000000' };
    };

    const aqiInfo = liveData ? getAQILevel(liveData.pm25) : { level: '--', color: '#000000' };

    return (
        <div className="w-full bg-[#FDFBF7] font-mono text-black min-h-screen pb-16">
            <MarqueeBanner text={`⚠️ ${liveData ? `${aqiInfo.level} AIR QUALITY IN ${liveData.location} - PM2.5: ${liveData.pm25} µg/m³` : 'LOADING LIVE DATA...'} ⚠️`} />

            <div className="max-w-7xl mx-auto p-4 md:p-8">

                {/* Header Section */}
                <header className="mb-12 border-b-4 border-black pb-6 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 bg-[#00CFFF] border-4 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black bg-[#FFCC00] px-4 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max leading-none uppercase tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            LIVE TELEMETRY
                        </h1>
                        <h2 className="text-xl font-bold bg-white border-4 border-black px-4 py-2 mt-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max flex items-center gap-3">
                            <Zap size={24} className="text-[#FF3366] fill-[#FF3366]" /> REAL-TIME EDGE SENSOR NODE STREAMS
                        </h2>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                        <ActionButton onClick={fetchLiveData} disabled={loading} bg="#FF3366">
                            <span className="text-white font-black">{loading ? 'REFRESHING...' : 'FORCE REFRESH'}</span>
                        </ActionButton>
                        <ActionButton onClick={saveToHistory} bg="#00FF66">
                            <span className="text-black font-black uppercase">SAVE RECORD</span>
                        </ActionButton>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-[#FF3366] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white font-bold">
                        ⚠️ {error}
                    </div>
                )}

                {/* Main Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* Location Card */}
                    <BrutalistCard title="CURRENT LOCATION" headerColor="#FFCC00">
                        <div className="flex items-center space-x-6">
                            <div className="p-6 border-4 border-black bg-black text-[#00FF66] shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]">
                                <Activity size={48} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-sm uppercase font-black text-gray-500 mb-1">ACTIVE EDGE NODE</p>
                                <p className="text-3xl font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                    {liveData ? liveData.location : 'SYNCING...'}
                                </p>
                                <p className="text-xs mt-2 font-bold">
                                    Last: {liveData ? new Date(liveData.lastUpdated).toLocaleTimeString() : '--'}
                                </p>
                            </div>
                        </div>
                    </BrutalistCard>

                    {/* Air Quality Card - PM2.5 */}
                    <BrutalistCard title="AIR QUALITY (PM2.5)" headerColor="#FF3366">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase flex items-center gap-2">
                                    <Wind size={28} strokeWidth={3} /> PM2.5
                                </span>
                                <BarChart2 size={28} />
                            </div>
                            <div className="text-7xl font-black text-black flex items-baseline gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? liveData.pm25.toFixed(1) : '0'} <span className="text-2xl font-bold mt-auto mb-1">µg/m³</span>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="font-bold">AQI: </span>
                                <span className="font-black px-3 py-1" style={{ backgroundColor: aqiInfo.color, border: '2px solid black' }}>
                                    {aqiInfo.level}
                                </span>
                            </div>
                        </div>
                    </BrutalistCard>

                    {/* PM10 Card */}
                    <BrutalistCard title="PM10 LEVELS" headerColor="#FF8C42">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase flex items-center gap-2">
                                    <Cloud size={28} strokeWidth={3} /> PM10
                                </span>
                            </div>
                            <div className="text-6xl font-black text-black flex items-baseline gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? liveData.pm10.toFixed(1) : '0'} <span className="text-xl font-bold">µg/m³</span>
                            </div>
                        </div>
                    </BrutalistCard>

                    {/* Temperature Card */}
                    <BrutalistCard title="TEMPERATURE" headerColor="#00FF66">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase flex items-center gap-2">
                                    <Thermometer size={28} strokeWidth={3} /> AMBIENT
                                </span>
                            </div>
                            <div className="text-6xl font-black text-black flex items-baseline gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? liveData.temperature.toFixed(1) : '0'} <span className="text-xl font-bold">°C</span>
                            </div>
                        </div>
                    </BrutalistCard>

                    {/* Humidity Card */}
                    <BrutalistCard title="HUMIDITY" headerColor="#4169E1">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase flex items-center gap-2">
                                    <Droplets size={28} strokeWidth={3} /> RELATIVE
                                </span>
                            </div>
                            <div className="text-6xl font-black text-black flex items-baseline gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? liveData.humidity.toFixed(1) : '0'} <span className="text-xl font-bold">%</span>
                            </div>
                        </div>
                    </BrutalistCard>

                    {/* Wind Card */}
                    <BrutalistCard title="WIND" headerColor="#7B61FF">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase flex items-center gap-2">
                                    <Wind size={28} strokeWidth={3} /> SPEED/DIR
                                </span>
                                <Compass size={28} />
                            </div>
                            <div className="flex items-baseline gap-4">
                                <div className="text-4xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                    {liveData ? liveData.wind_speed.toFixed(1) : '0'} <span className="text-lg font-bold">m/s</span>
                                </div>
                                <div className="text-2xl font-black bg-black text-white px-3 py-1">
                                    {liveData ? liveData.wind_direction.toFixed(0) : '0'}°
                                </div>
                            </div>
                        </div>
                    </BrutalistCard>

                    {/* NO2 Card */}
                    <BrutalistCard title="NO2 LEVELS" headerColor="#9370DB">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase">NITROGEN DIOXIDE</span>
                            </div>
                            <div className="text-5xl font-black text-black flex items-baseline gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? liveData.no2.toFixed(2) : '0'} <span className="text-lg font-bold">ppb</span>
                            </div>
                        </div>
                    </BrutalistCard>

                    {/* CO Card */}
                    <BrutalistCard title="CO LEVELS" headerColor="#FFD700">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase">CARBON MONOXIDE</span>
                            </div>
                            <div className="text-5xl font-black text-black flex items-baseline gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? liveData.co.toFixed(3) : '0'} <span className="text-lg font-bold">ppm</span>
                            </div>
                        </div>
                    </BrutalistCard>

                    {/* O3 Card */}
                    <BrutalistCard title="O3 LEVELS" headerColor="#FF69B4">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase">OZONE</span>
                            </div>
                            <div className="text-5xl font-black text-black flex items-baseline gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? liveData.o3.toFixed(2) : '0'} <span className="text-lg font-bold">ppb</span>
                            </div>
                        </div>
                    </BrutalistCard>
                </div>

                {/* Last Updated Timestamp */}
                <div className="mt-6 text-right font-bold text-sm">
                    Last sync: {lastFetchTime ? lastFetchTime.toLocaleString() : 'Never'} | Auto-refresh every 1 Hour
                </div>

                {/* Comparative Analytics Module */}
                <div className="mt-12 w-full">
                    <ComparativeAnalytics />
                </div>
            </div>

            <BackToHomeButton />
        </div>
    );
};

export default Dashboard;