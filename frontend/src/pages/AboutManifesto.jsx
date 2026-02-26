import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Brain, Settings2 } from 'lucide-react';

const AboutManifesto = () => {
    const techStack = [
        "React (Vite)", "Tailwind CSS", "React Three Fiber", "Leaflet", "Node.js", "Python", "Scikit-Learn", "OpenAQ REST API"
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-black flex flex-col relative pb-16 font-mono overflow-x-hidden">
            {/* 1. Hero / Manifesto */}
            <section className="p-8 md:p-16 border-b-4 border-black bg-[#FFCC00]">
                <div className="bg-white border-4 border-black px-4 py-2 font-mono w-max shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 font-black uppercase tracking-tighter text-lg">
                    OUR MISSION
                </div>
                <h1 className="text-6xl md:text-8xl font-black max-w-5xl uppercase tracking-tighter leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    WE DON'T JUST TRACK POLLUTION. WE PREDICT IT.
                </h1>
                <p className="font-mono text-xl md:text-2xl mt-8 max-w-4xl bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] leading-relaxed font-bold">
                    Urban planning has a fatal flaw: it is reactive. EcoTwin is a proactive Digital Twin for Bidhannagar. We fused real-time IoT sensor data, spatial mapping, and Machine Learning to give urban planners a time machine. See the invisible, predict the hazards, and simulate solutions before spending a single rupee.
                </p>
            </section>

            {/* 2. Core Pillars */}
            <section className="p-8 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#FDFBF7]">
                {/* Card 1 */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                    <div className="bg-[#00CFFF] border-b-4 border-black p-4 flex items-center gap-4 text-black">
                        <Eye size={32} strokeWidth={2.5} />
                        <h2 className="font-black uppercase tracking-tighter text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SEE THE INVISIBLE</h2>
                    </div>
                    <div className="p-6 font-mono font-bold text-lg leading-relaxed border-t-0 flex-grow">
                        Live atmospheric rendering powered by the OpenAQ API. We map PM2.5 and CO levels into visual reality.
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                    <div className="bg-[#FF3366] border-b-4 border-black p-4 flex items-center gap-4 text-black">
                        <Brain size={32} strokeWidth={2.5} />
                        <h2 className="font-black uppercase tracking-tighter text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>PREDICT THE FUTURE</h2>
                    </div>
                    <div className="p-6 font-mono font-bold text-lg leading-relaxed border-t-0 flex-grow">
                        Trained on massive historical datasets, our Time-Series AI predicts pollution spikes 72 hours before they happen.
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                    <div className="bg-[#00FF66] border-b-4 border-black p-4 flex items-center gap-4 text-black">
                        <Settings2 size={32} strokeWidth={2.5} />
                        <h2 className="font-black uppercase tracking-tighter text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SIMULATE SOLUTIONS</h2>
                    </div>
                    <div className="p-6 font-mono font-bold text-lg leading-relaxed border-t-0 flex-grow">
                        Our 'What-If' engine allows planners to test the impact of traffic bans or green cover on local air quality instantly.
                    </div>
                </div>
            </section>

            {/* 3. Tech Stack and Creator */}
            <section className="p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 border-t-4 border-black bg-white flex-grow">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SYSTEM ARCHITECTURE</h2>
                    <div className="flex flex-wrap gap-4 mt-6">
                        {techStack.map((tech, idx) => (
                            <div key={idx} className="border-2 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#FDFBF7]">
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>LEAD DEVELOPER</h2>
                    <div className="mt-6 bg-[#FDFBF7] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 flex flex-col sm:flex-row h-full max-h-[16rem]">
                        <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-300 border-b-4 sm:border-b-0 sm:border-r-4 border-black filter grayscale flex items-center justify-center font-mono text-sm font-bold flex-shrink-0">
                            [PHOTO]
                        </div>
                        <div className="p-6 font-mono flex flex-col justify-between flex-grow">
                            <div>
                                <p className="font-bold text-lg mb-2 text-black"><span className="text-gray-600 mr-2">NAME:</span>[Your Name]</p>
                                <p className="font-bold text-lg mb-2 text-black"><span className="text-gray-600 mr-2">ROLE:</span>Full-Stack & AI</p>
                                <p className="font-bold text-lg mb-4 text-black"><span className="text-gray-600 mr-2">MISSION:</span>Bridging AI and Urban Sustainability.</p>
                            </div>
                            <button className="bg-black text-[#00FF66] border-4 border-black px-6 py-2 font-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,255,102,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-none w-max">
                                GITHUB
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Marquee Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-black text-[#00FF66] border-t-4 border-black py-4 overflow-hidden z-50">
                <motion.div
                    className="flex whitespace-nowrap font-mono font-bold text-xl uppercase tracking-widest"
                    animate={{ x: [0, -1035] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
                >
                    <span className="mr-8">✦ REAL-TIME 3D ✦ IOT SENSORS ✦ PREDICTIVE AI ✦ URBAN SANDBOX ✦ BIDHANNAGAR DIGITAL TWIN ✦ OPEN DATA ✦ REAL-TIME 3D ✦ IOT SENSORS ✦ PREDICTIVE AI ✦ URBAN SANDBOX ✦ BIDHANNAGAR DIGITAL TWIN ✦ OPEN DATA ✦</span>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutManifesto;
