import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BrutalistCard from '../components/BrutalistCard';
import ActionButton from '../components/ActionButton';
import MarqueeBanner from '../components/MarqueeBanner';
import { Activity, Thermometer, Wind } from 'lucide-react';

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
            alert("Data Saved to History!");
        } catch (err) {
            console.error(err);
            alert("Failed to save data.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <MarqueeBanner text="⚠️ WARNING: HIGH PM2.5 LEVELS DETECTED IN SECTOR V ⚠️" />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl md:text-6xl font-black uppercase shadow-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Live Telemetry
                </h1>
                <div className="flex gap-4">
                    <ActionButton onClick={fetchLiveData} disabled={loading} bg="#b4a0ff">
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </ActionButton>
                    <ActionButton onClick={saveToHistory} bg="#ff3b30">
                        <span className="text-white relative z-10">Save Record</span>
                    </ActionButton>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <BrutalistCard title="Current Location" headerColor="#ffff00">
                    <div className="flex items-center space-x-4">
                        <div className="p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Activity size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm uppercase font-black">Active Node</p>
                            <p className="text-2xl font-bold">{liveData ? liveData.location : 'Loading...'}</p>
                        </div>
                    </div>
                </BrutalistCard>

                <BrutalistCard title="Air Quality" headerColor="#ff3b30">
                    <div className="flex flex-col h-full justify-center text-white">
                        <div className="text-black mb-2 flex items-center gap-2">
                            <Wind size={24} strokeWidth={2.5} />
                            <span className="font-bold text-lg uppercase">{liveData ? liveData.parameter : '--'}</span>
                        </div>
                        <div className="text-5xl font-black text-black">
                            {liveData ? liveData.value : '0'} <span className="text-xl">{liveData ? liveData.unit : ''}</span>
                        </div>
                    </div>
                </BrutalistCard>

                <BrutalistCard title="Last Updated" headerColor="#b4a0ff">
                    <div className="flex flex-col h-full justify-center">
                        <p className="text-lg font-bold border-2 border-dashed border-black p-4 text-center">
                            {liveData ? new Date(liveData.lastUpdated).toLocaleTimeString() : '--:--:--'}
                        </p>
                    </div>
                </BrutalistCard>
            </div>
        </div>
    );
};

export default Dashboard;
