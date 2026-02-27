import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BrutalistCard from '../components/BrutalistCard';
import ActionButton from '../components/ActionButton';
import MarqueeBanner from '../components/MarqueeBanner';
import ComparativeAnalytics from '../components/ComparativeAnalytics';
import BackToHomeButton from '../components/BackToHomeButton';
import MapComponent from '../components/MapComponent';
import StationSelector from '../components/StationSelector'; // Import the new component
import { Activity, Thermometer, Wind, Zap, BarChart2, Droplets, Compass, Cloud, Map, Radio } from 'lucide-react';

// Station configuration
const stations = [
    { 
        id: 'bidhanagar-east',
        name: 'Bidhannagar East',
        color: '#FF3366',
        location: 'SECTOR V, KOLKATA',
        coordinates: [22.58157, 88.410025]
    },
    { 
        id: 'Rabindra_Bharatia',
        name: 'Rabindra Bharati University',
        color: '#7B61FF',
        location: 'RABINDRA BHARATI, KOLKATA',
        coordinates: [22.627875, 88.3804]
    },
    { 
        id: 'Ballygunge',
        name: 'Ballygunge',
        color: '#00FF66',
        location: 'BALLYGUNGE, KOLKATA',
        coordinates: [22.5367507, 88.3638022]
    },
    { 
        id: 'Dasnagar',
        name: 'Dasnagar',
        color: '#FF8C42',
        location: 'DASNAGAR, HOWRAH',
        coordinates: [22.6025571, 88.3105664]
    }
];

const Dashboard = () => {
    const [allStationsData, setAllStationsData] = useState(null);
    const [selectedStation, setSelectedStation] = useState('bidhanagar-east');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const [showMap, setShowMap] = useState(false);

    const fetchAllStationsData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER1_URL}/api/realtime/livedata`);
            setAllStationsData(res.data);
            setLastFetchTime(new Date());
            console.log('All stations data:', res.data);
        } catch (err) {
            console.error('Error fetching live data:', err);
            setError('Failed to fetch live data. Please try again.');
            
            // Fallback data (keep your existing fallback)
            setAllStationsData({
                success: true,
                timestamp: new Date().toISOString(),
                metadata: {
                    total_stations: 4,
                    successful_stations: 4,
                    failed_stations: 0
                },
                stations: {
                    "bidhanagar-east": {
                        station_id: "10851",
                        station_name: "Bidhannagar East",
                        station_key: "bidhanagar-east",
                        timestamp: new Date().toISOString(),
                        pm25: 51.36,
                        pm10: 120.41,
                        no2: 10.16,
                        no: 15.36,
                        nox: 0.01776,
                        co: 1.504,
                        so2: 73.11,
                        o3: 13.19,
                        temperature: 22.94,
                        humidity: 45.59,
                        wind_speed: 0.04,
                        wind_direction: 280.44
                    },
                    "Dasnagar": {
                        station_id: "3409530",
                        station_name: "Dasnagar",
                        station_key: "Dasnagar",
                        timestamp: new Date().toISOString(),
                        pm25: 63.14,
                        pm10: 149.15,
                        no2: 94.28,
                        no: 25.92,
                        nox: 0.07122,
                        co: 2.6,
                        so2: 40.21,
                        o3: 17.02,
                        temperature: 22.96,
                        humidity: 49.51,
                        wind_speed: 0.33,
                        wind_direction: 109.07
                    },
                    "Rabindra_Bharatia": {
                        station_id: "3409320",
                        station_name: "Rabindra Bharatia",
                        station_key: "Rabindra_Bharatia",
                        timestamp: new Date().toISOString(),
                        pm25: 93.95,
                        pm10: 151.31,
                        no2: 128.27,
                        no: 13.64,
                        nox: 0.07794,
                        co: 1.729,
                        so2: 6.77,
                        o3: 18.92,
                        temperature: 24.21,
                        humidity: 34.96,
                        wind_speed: 0.02,
                        wind_direction: 165.86
                    },
                    "Ballygunge": {
                        station_id: "10918",
                        station_name: "Ballygunge",
                        station_key: "Ballygunge",
                        timestamp: new Date().toISOString(),
                        pm25: 63,
                        pm10: 121.6,
                        no2: 112.2,
                        no: 47.7,
                        nox: 0.0969,
                        co: 3.017,
                        so2: 11.17,
                        o3: 11.38,
                        temperature: 20.23,
                        humidity: 29.72,
                        wind_speed: 0.63,
                        wind_direction: 145.95
                    }
                }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllStationsData();
        const interval = setInterval(fetchAllStationsData, 60000 * 60); // Auto-refresh every 60 minutes
        return () => clearInterval(interval);
    }, []);

    const saveToHistory = async () => {
        if (!allStationsData) return;
        try {
            const currentStationData = getCurrentStationData();
            const payload = {
                timestamp: currentStationData?.timestamp || new Date().toISOString(),
                station_id: selectedStation,
                station_name: getCurrentStation()?.name,
                ...currentStationData
            };
            
            await axios.post('http://localhost:5001/api/history', { data: [payload] });
            alert("✓ RECORD SAVED STRONGLY TO HISTORY!");
        } catch (err) {
            console.error(err);
            alert("✗ FAILED TO SAVE DATA.");
        }
    };

    // Helper functions
    const getCurrentStation = () => {
        return stations.find(s => s.id === selectedStation) || stations[0];
    };

    const getCurrentStationData = () => {
        return allStationsData?.stations?.[selectedStation];
    };

    const getStationAQI = (stationId) => {
        const pm25 = allStationsData?.stations?.[stationId]?.pm25;
        if (!pm25) return { level: '--', color: '#000000' };
        
        if (pm25 <= 12) return { level: 'GOOD', color: '#00FF66' };
        if (pm25 <= 35.4) return { level: 'MODERATE', color: '#FFCC00' };
        if (pm25 <= 55.4) return { level: 'UNHEALTHY FOR SENSITIVE', color: '#FF8C42' };
        if (pm25 <= 150.4) return { level: 'UNHEALTHY', color: '#FF3366' };
        if (pm25 <= 250.4) return { level: 'VERY UNHEALTHY', color: '#9370DB' };
        return { level: 'HAZARDOUS', color: '#000000' };
    };

    const currentStation = getCurrentStation();
    const currentStationData = getCurrentStationData();
    const aqiInfo = getStationAQI(selectedStation);

    return (
        <div className="w-full bg-[#FDFBF7] font-mono text-black min-h-screen pb-16">
            <MarqueeBanner 
                text={`⚠️ ${currentStationData ? `${aqiInfo.level} AIR QUALITY AT ${currentStation.name} - PM2.5: ${currentStationData.pm25?.toFixed(1)} µg/m³` : 'LOADING LIVE DATA...'} ⚠️`} 
            />

            <div className="max-w-7xl mx-auto p-4 md:p-8">

                {/* Header Section */}
                <header className="mb-12 border-b-4 border-black pb-6 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 bg-[#00CFFF] border-4 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black bg-[#FFCC00] px-4 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max leading-none uppercase tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            LIVE TELEMETRY
                        </h1>
                        <h2 className="text-xl font-bold bg-white border-4 border-black px-4 py-2 mt-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max flex items-center gap-3">
                            <Zap size={24} className="text-[#FF3366] fill-[#FF3366]" /> REAL-TIME NETWORK • 4 STATIONS ONLINE
                        </h2>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                        <ActionButton onClick={fetchAllStationsData} disabled={loading} bg="#FF3366">
                            <span className="text-white font-black">{loading ? 'REFRESHING...' : 'FORCE REFRESH'}</span>
                        </ActionButton>
                        <ActionButton onClick={saveToHistory} bg="#00FF66">
                            <span className="text-black font-black uppercase">SAVE RECORD</span>
                        </ActionButton>
                        <ActionButton onClick={() => setShowMap(!showMap)} bg="#7B61FF">
                            <span className="text-white font-black uppercase flex items-center gap-2">
                                <Map size={20} /> {showMap ? 'HIDE MAP' : 'SHOW MAP'}
                            </span>
                        </ActionButton>
                    </div>
                </header>

                {/* ===== STATION SELECTOR GOES HERE ===== */}
                {/* Replace the old station grid with this */}
                <StationSelector
                    stations={stations}
                    selectedStation={selectedStation}
                    onStationSelect={setSelectedStation}
                    stationData={allStationsData?.stations || {}}
                    className="mb-8"
                />

                {error && (
                    <div className="mb-6 p-4 bg-[#FF3366] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white font-bold">
                        ⚠️ {error}
                    </div>
                )}

                {/* Map Section */}
                {showMap && (
                    <div className="mb-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="bg-black text-white px-4 py-2 font-bold flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <Map size={20} /> SPATIAL POLLUTION MAP - KOLKATA NETWORK
                            </span>
                            <span className="text-xs bg-[#FF3366] px-2 py-1">
                                {allStationsData?.metadata?.successful_stations || 0}/4 STATIONS ONLINE
                            </span>
                        </div>
                        <div className="h-[500px] w-full">
                            <MapComponent liveData={allStationsData} />
                        </div>
                        <div className="bg-[#FDFBF7] border-t-4 border-black p-2 text-xs font-bold flex flex-wrap gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green border border-black"></div>
                                <span>Low (0-40)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-yellow border border-black"></div>
                                <span>Moderate (40-60)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-orange border border-black"></div>
                                <span>High (60-80)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red border border-black"></div>
                                <span>Very High (80-100)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-darkred border border-black"></div>
                                <span>Severe (100+)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Cards Grid - Now showing selected station data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* ... (keep all your existing BrutalistCard components) ... */}
                </div>

                {/* Network Status */}
                <div className="mt-6 flex justify-between items-center text-sm font-bold">
                    <div className="flex items-center gap-4">
                        <span className="bg-black text-white px-2 py-1">
                            {allStationsData?.metadata?.successful_stations || 0}/{allStationsData?.metadata?.total_stations || 4} STATIONS ONLINE
                        </span>
                        <span className="text-xs">
                            Last network sync: {lastFetchTime ? lastFetchTime.toLocaleString() : 'Never'}
                        </span>
                    </div>
                    <span className="text-xs">Auto-refresh every 5 minutes</span>
                </div>

                {/* Comparative Analytics Module */}
                <div className="mt-12 w-full">
                    <ComparativeAnalytics liveData={allStationsData} />
                </div>
            </div>

            <BackToHomeButton />
        </div>
    );
};

export default Dashboard;