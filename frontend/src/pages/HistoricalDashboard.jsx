import React from 'react';
import { Download } from 'lucide-react';
import SeasonalTrendChart from '../components/charts/SeasonalTrendChart';
import CityHeartbeatChart from '../components/charts/CityHeartbeatChart';
import DailyCalendarChart from '../components/charts/DailyCalendarChart';
import WindRoseChart from '../components/charts/WindRoseChart';
import BackToHomeButton from '../components/BackToHomeButton';

const HistoricalDashboard = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-mono text-black selection:bg-[#00FF66]">
            {/* Header Section */}
            <div className="mb-10 border-b-4 border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight bg-[#FFCC00] px-6 py-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block w-max relative z-10" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        HISTORICAL ARCHIVE
                    </h1>
                    <div className="flex bg-white border-4 border-black mt-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-flex">
                        <div className="w-4 bg-[#FFCC00] border-r-4 border-black flex-shrink-0"></div>
                        <p className="text-lg md:text-xl font-bold px-6 py-3">
                            Aggregated urban atmospheric metrics &amp; source tracking.
                        </p>
                    </div>
                </div>
                <button className="bg-[#00FF66] border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-none cursor-pointer" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <Download size={24} strokeWidth={3} /> EXPORT DATA
                </button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 pb-16">
                {/* Seasonal Trend - Now as its own component */}
                <SeasonalTrendChart />

                {/* City Heartbeat */}
                <CityHeartbeatChart />

                {/* Calendar View - Spans 2 columns */}
                <div className="xl:col-span-2">
                    <DailyCalendarChart />
                </div>

                {/* Wind Rose */}
                <WindRoseChart />
            </div>

            <BackToHomeButton />
        </div>
    );
};

export default HistoricalDashboard;