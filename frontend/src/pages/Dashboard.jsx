import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BrutalistCard from '../components/BrutalistCard';
import ActionButton from '../components/ActionButton';
import MarqueeBanner from '../components/MarqueeBanner';
import ComparativeAnalytics from '../components/ComparativeAnalytics';
import BackToHomeButton from '../components/BackToHomeButton';
import { Activity, Thermometer, Wind, Zap, BarChart2 } from 'lucide-react';

const Dashboard = () => {
    const [liveData, setLiveData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchLiveData = async () => {
        setLoading(true);
        try {
            // Backend api running on port 5001
            const res = await axios.get('http://localhost:5001/api/live-data');
            if (res.data.success) {
                setLiveData(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLiveData();
    }, []);

    const saveToHistory = async () => {
        if (!liveData) return;
        try {
            const payload = {
                timestamp: new Date().toISOString(),
                location: liveData.location,
                parameter: liveData.parameter,
                value: liveData.value,
                unit: liveData.unit
            };
            await axios.post('http://localhost:5001/api/history', { data: [payload] });
            alert("RECORD SAVED STRONGLY TO HISTORY!");
        } catch (err) {
            console.error(err);
            alert("FAILED TO SAVE DATA.");
        }
    };

    return (
        <div className="w-full bg-[#FDFBF7] font-mono text-black min-h-screen pb-16">
            <MarqueeBanner text="⚠️ WARNING: HIGH PM2.5 LEVELS DETECTED IN SECTOR V ⚠️" />

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

                {/* Main Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <BrutalistCard title="CURRENT LOCATION" headerColor="#FFCC00">
                        <div className="flex items-center space-x-6">
                            <div className="p-6 border-4 border-black bg-black text-[#00FF66] shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]">
                                <Activity size={48} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-sm uppercase font-black text-gray-500 mb-1">ACTIVE EDGE NODE</p>
                                <p className="text-3xl font-black uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{liveData ? liveData.location : 'SYNCING...'}</p>
                            </div>
                        </div>
                    </BrutalistCard>

                    <BrutalistCard title="AIR QUALITY" headerColor="#FF3366">
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-black mb-4 flex items-center justify-between border-b-4 border-black pb-2">
                                <span className="font-bold text-2xl uppercase flex items-center gap-2">
                                    <Wind size={28} strokeWidth={3} /> {liveData ? liveData.parameter : '--'}
                                </span>
                                <BarChart2 size={28} />
                            </div>
                            <div className="text-7xl font-black text-black flex items-baseline gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? liveData.value : '0'} <span className="text-2xl font-bold mt-auto mb-1">{liveData ? liveData.unit : ''}</span>
                            </div>
                        </div>
                    </BrutalistCard>

                    <BrutalistCard title="LAST UPDATED" headerColor="#7B61FF">
                        <div className="flex flex-col h-full justify-center space-y-4">
                            <p className="text-sm uppercase font-black text-gray-500 text-center">SYSTEM TIMESTAMP</p>
                            <p className="text-3xl font-black bg-white border-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {liveData ? new Date(liveData.lastUpdated).toLocaleTimeString() : '--:--:--'}
                            </p>
                        </div>
                    </BrutalistCard>
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
