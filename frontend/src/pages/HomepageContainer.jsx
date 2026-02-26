import React from 'react';
import { Box, TrendingUp, Map } from 'lucide-react';

const HomepageContainer = () => {
    return (
        <div className="font-body text-black bg-[#FDFBF7] min-h-screen selection:bg-[#00FF66]">

            {/* 1. Navbar */}
            <nav className="bg-[#FDFBF7] border-b-4 border-black px-8 py-5 flex justify-between items-center sticky top-0 z-50">
                <div className="font-black text-2xl bg-[#FF3366] px-2 py-1 border-2 border-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ECO.TWIN
                </div>
                <div className="hidden md:flex gap-6 font-mono uppercase font-bold text-lg">
                    {['Dashboard', 'Models', 'About'].map((link) => (
                        <a key={link} href={link === 'Models' ? "/models" : (link === 'Dashboard' ? "/dashboard" : "/about")} className="hover:bg-[#FFCC00] px-3 py-1 border-2 border-transparent hover:border-black transition-colors">
                            {link}
                        </a>
                    ))}
                </div>
                <button className="bg-[#00FF66] border-4 border-black px-6 py-2 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-150" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    LAUNCH APP
                </button>
            </nav>

            {/* 2. Hero Section */}
            <section className="min-h-[80vh] grid grid-cols-1 md:grid-cols-2 border-b-4 border-black bg-[#FDFBF7] relative overflow-hidden">
                {/* Left Column */}
                <div className="p-12 lg:p-24 flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-4 border-black bg-[#7B61FF]">
                    <div className="bg-white border-4 border-black px-4 py-2 w-max text-sm font-mono font-bold mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[#000]">
                        System Online 🟢
                    </div>
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tight mb-8 text-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        Predict the <br /> <span className="text-white shadow-text">Invisible.</span>
                    </h1>
                    <p className="font-mono text-lg md:text-xl font-bold bg-white border-2 border-black p-4 mb-8 text-black max-w-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Real-time 3D urban tracking meets AI-driven pollution forecasting.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 mt-4">
                        <a href="/archive" className="bg-[#00FF66] border-4 border-black px-8 py-4 font-black text-xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all duration-150 inline-flex items-center justify-center text-center text-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            Start Archive
                        </a>
                        <a href="/dashboard" className="bg-white border-4 border-black px-8 py-4 font-black text-xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all duration-150 inline-flex items-center justify-center text-center text-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            View Live Data
                        </a>
                    </div>
                </div>

                {/* Right Column */}
                <div className="relative border-t-4 border-black md:border-t-0 p-12 flex items-center justify-center bg-[#FFCC00]" style={{
                    backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
                    backgroundSize: '30px 30px'
                }}>
                    <div className="bg-white border-4 border-black w-full max-w-md aspect-square flex items-center justify-center p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-rotate-3 transition-transform duration-500">
                        <div className="border-4 border-dashed border-black w-full h-full flex items-center justify-center bg-[#f0f0f0]">
                            <p className="font-mono font-bold text-2xl text-center">3D MAP<br />PLACEHOLDER</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Marquee Ticker */}
            <section className="bg-[#FF3366] text-white border-b-4 border-black py-4 overflow-hidden flex whitespace-nowrap">
                <div className="animate-marquee font-mono font-bold text-xl inline-block w-full">
                    ✦ LIVE SENSOR DATA ✦ PM2.5: 45 µg/m³ ✦ TEMP: 28°C ✦ WIND: 12 KM/H ✦ STATUS: MODERATE ✦ LIVE SENSOR DATA ✦ PM2.5: 45 µg/m³ ✦ TEMP: 28°C ✦ WIND: 12 KM/H ✦ STATUS: MODERATE ✦
                </div>
            </section>

            {/* 4. Bento Features Grid */}
            <section className="p-12 lg:p-24 bg-[#FDFBF7]">
                <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-16 border-b-8 border-black pb-4 inline-block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    System Modules
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Card 1 */}
                    <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 flex flex-col justify-between min-h-[300px]">
                        <div>
                            <div className="border-4 border-black w-16 h-16 flex items-center justify-center mb-6 bg-[#00FF66] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Box size={32} strokeWidth={3} />
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Real-Time 3D</h3>
                            <p className="font-mono font-bold text-lg">Live atmospheric rendering of Bidhannagar sector layouts.</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#FFCC00] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 flex flex-col justify-between min-h-[300px]">
                        <div>
                            <div className="border-4 border-black w-16 h-16 flex items-center justify-center mb-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <TrendingUp size={32} strokeWidth={3} />
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AI Forecasting</h3>
                            <p className="font-mono font-bold text-lg">Predictive ML models for 24-hour localized pollution tracking.</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#7B61FF] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 flex flex-col justify-between min-h-[300px] text-white">
                        <div>
                            <div className="border-4 border-black w-16 h-16 flex items-center justify-center mb-6 bg-[#FF3366] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Map size={32} strokeWidth={3} />
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4 text-black shadow-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Urban Planning</h3>
                            <p className="font-mono font-bold text-lg text-black bg-white/90 p-2 border-2 border-black">What-if simulations for traffic interventions and green cover.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Footer */}
            <footer className="bg-black text-white p-12 md:p-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ECO.TWIN <br />
                    <span className="text-[#00FF66]">v1.0</span>
                </h2>
                <div className="font-mono font-bold text-lg text-right flex flex-col items-start md:items-end gap-2">
                    <a href="#" className="hover:text-[#FFCC00] hover:underline underline-offset-4 decoration-4">API Documentation</a>
                    <a href="#" className="hover:text-[#FF3366] hover:underline underline-offset-4 decoration-4">Project GitHub</a>
                    <p className="mt-8 text-gray-500">© 2026 NEO-URBANISM BUREAU</p>
                </div>
            </footer>

        </div>
    );
};

export default HomepageContainer;
