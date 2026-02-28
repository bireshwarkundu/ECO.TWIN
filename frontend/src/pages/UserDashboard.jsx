import React, { useState, useEffect } from 'react';
import { Wallet, Activity, MapPin, Database, Server, Cpu, CheckCircle, Clock, Wind, AlertTriangle, Thermometer } from 'lucide-react';
import { getFullEnvironmentalData } from '../utils/fetchEnvironmentalData.js';

const UserDashboard = () => {
    const [balance, setBalance] = useState(124.5);
    const [isMining, setIsMining] = useState(false);
    const [logs, setLogs] = useState([]);
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    
    // NEW: State for Real Scientific Data
    const [sensorData, setSensorData] = useState(null);
    const [location, setLocation] = useState(null);

    // 1. Wallet Connection Logic
    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                setIsConnecting(true);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setLogs(prev => [...prev, `> Wallet Connected: ${accounts[0].substring(0, 6)}...`]);
                }
            } catch (error) {
                console.error("Wallet connection failed:", error);
                alert("Failed to connect wallet.");
                setLogs(prev => [...prev, "> ❌ Wallet connection failed"]);
            } finally {
                setIsConnecting(false);
            }
        } else {
            alert("MetaMask is not installed!");
            setLogs(prev => [...prev, "> ❌ MetaMask not detected"]);
        }
    };

    // 2. The Mining & Data Fetching Logic
    const toggleMining = async () => {
        if (isMining) {
            // STOP MINING
            setIsMining(false);
            setSensorData(null);
            setLocation(null);
            setLogs(prev => [...prev, "> Session Terminated."]);
            return;
        }

        // START MINING
        setIsMining(true);
        setLogs(["> Initializing Node Connection..."]);

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setLogs(prev => [...prev, "❌ GPS Error: Not Supported by Browser"]);
            setIsMining(false);
            return;
        }

        setLogs(prev => [...prev, "> Requesting GPS access..."]);

        // A. Get Location with better error handling
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log("GPS Coordinates:", lat, lon);
                setLocation({ lat, lon });
                
                setLogs(prev => [...prev, `> ✅ GPS Signal Acquired: ${lat.toFixed(4)}, ${lon.toFixed(4)}`]);
                setLogs(prev => [...prev, "> Calibrating Sensors (Open-Meteo API)..."]);

                // B. Fetch Real Data
                setLogs(prev => [...prev, "> Contacting environmental satellites..."]);
                const data = await getFullEnvironmentalData(lat, lon);
                console.log("Fetched Sensor Data:", data);
                
                if (data) {
                    setSensorData(data);
                    setLogs(prev => [...prev, 
                        "> ✅ Data Packets Received!",
                        `> PM2.5: ${data.pm25} µg/m³`,
                        `> Temperature: ${data.temperature}°C`,
                        "> Uploading to Mesh Network...",
                        "> Mining Blocks...",
                        "> ⛏️ Block Mined! +10 ECO"
                    ]);
                    // Simulate earning ECO
                    setBalance(prev => prev + 10);
                } else {
                    setLogs(prev => [...prev, "> ⚠️ API Connection Failed. Retrying in 5 seconds..."]);
                    // Retry logic could be added here
                    setTimeout(() => {
                        setLogs(prev => [...prev, "> Retry attempt failed. Please try again."]);
                        setIsMining(false);
                    }, 5000);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                let errorMessage = "> ❌ GPS Access Denied.";
                if (err.code === 1) {
                    errorMessage = "> ❌ Location permission denied. Please enable location access in your browser.";
                } else if (err.code === 2) {
                    errorMessage = "> ❌ Position unavailable. Check GPS signal or try again.";
                } else if (err.code === 3) {
                    errorMessage = "> ❌ Location request timed out. Please try again.";
                }
                setLogs(prev => [...prev, errorMessage]);
                setIsMining(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // 3. Fake Log Interval (Visual Effect)
    useEffect(() => {
        let interval;
        if (isMining && sensorData) {
            const possibleLogs = [
                `> Syncing Peer [${Math.floor(Math.random()*900)+100}]...`,
                `> Verifying PM2.5: ${sensorData.pm25} µg/m³...`,
                "> Consensus Reached ✓",
                "> Block Header Validated",
                "> Awaiting Next Cycle...",
                `> Hashrate: ${Math.floor(Math.random()*50)+50} H/s`,
                "> Network Difficulty: 12.5 TH"
            ];

            interval = setInterval(() => {
                setLogs(prev => {
                    const newLogs = [...prev, possibleLogs[Math.floor(Math.random() * possibleLogs.length)]];
                    // Keep only last 8 logs
                    if (newLogs.length > 8) {
                        return newLogs.slice(-8);
                    }
                    return newLogs;
                });
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isMining, sensorData]);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-black selection:bg-[#00FF66] font-mono">
            {/* Global Node Navbar */}
            <nav className="sticky top-0 z-50 bg-[#FDFBF7] border-b-[3px] md:border-b-4 border-black px-2 md:px-8 py-3 md:py-4 flex flex-col xl:flex-row justify-between items-center gap-3 md:gap-4">
                {/* Left Side */}
                <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center w-full xl:w-auto">
                    <div className="bg-white border-[3px] md:border-4 border-black px-2 py-1 md:px-4 md:py-2 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 text-sm md:text-lg uppercase cursor-default">
                        <span className="w-3 h-3 md:w-4 md:h-4 bg-[#00FF66] rounded-full animate-pulse border-2 border-black" />
                        {balance} ECO
                    </div>
                    <a href="/node" className="bg-[#FFE600] border-[3px] md:border-4 border-black px-2 py-1 md:px-4 md:py-2 text-sm md:text-2xl font-black uppercase tracking-tighter shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all block w-max cursor-pointer" style={{ fontFamily: "'Space Grotesk', 'Archivo Black', sans-serif" }}>
                        ECO.PULSE
                    </a>
                </div>

                {/* Right Side */}
                <div className="flex gap-2 md:gap-4 items-center flex-wrap justify-center w-full xl:w-auto mt-2 md:mt-0">
                    <a href="/dashboard" className="bg-[#00FF66] px-3 py-1.5 md:px-6 md:py-2 border-[3px] md:border-4 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-transform flex-1 text-center sm:flex-none text-xs md:text-base">
                        Global Map
                    </a>
                    <button 
                        onClick={connectWallet} 
                        disabled={isConnecting} 
                        className="bg-white text-black border-[3px] md:border-4 border-black px-3 py-1.5 md:px-4 md:py-2 font-mono font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed uppercase group hover:bg-[#00FF66] w-full sm:w-auto text-xs md:text-base mt-2 sm:mt-0"
                    >
                        <Wallet size={14} className="text-[#00FF66] group-hover:text-black transition-colors md:w-[18px] md:h-[18px]" />
                        {isConnecting ? "CONNECTING..." : walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "CONNECT WALLET"}
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <h1 className="text-4xl md:text-5xl font-black mb-8 border-b-4 border-black pb-4 uppercase" style={{ fontFamily: "'Space Grotesk', 'Archivo Black', sans-serif" }}>
                    MINER PROFILE
                </h1>

                {/* 1. HERO STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-black font-black text-lg mb-2 uppercase flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            <Wallet size={20} /> WALLET BALANCE
                        </h3>
                        <div className="text-5xl font-black text-[#0055FF] mb-2">{balance} ECO</div>
                        <div className="text-sm font-bold bg-[#00FF66] border-2 border-black px-2 py-1 w-max shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            ▲ +12.5 today
                        </div>
                    </div>

                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-black font-black text-lg mb-2 uppercase flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            <Activity size={20} /> TRUST SCORE
                        </h3>
                        <div className="text-5xl font-black text-[#7B61FF] mb-2">98%</div>
                        <div className="text-sm font-bold bg-white border-2 border-black px-2 py-1 w-max shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Level: Expert Node
                        </div>
                    </div>
                </div>

                {/* 2. MINING ACTION */}
                <div className="bg-[#FFE600] border-4 border-black p-6 md:p-8 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
                            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                <Server size={32} /> ACTIVE SENSOR NODE
                            </h2>
                            <span className={`inline-block w-6 h-6 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isMining ? 'bg-[#00FF66] animate-pulse' : 'bg-[#FF3366]'}`}></span>
                        </div>

                        <p className="text-lg font-bold mb-6 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
                            Status: {isMining ? (sensorData ? "📡 Data Stream Active" : "🛰️ Connecting to Satellites...") : "⚡ Idle. Start session to earn."}
                        </p>

                        <button
                            onClick={toggleMining}
                            className={`w-full py-4 text-2xl font-black uppercase text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all flex items-center justify-center gap-4 ${isMining ? 'bg-[#FF3366] hover:bg-[#E62E5C]' : 'bg-[#0055FF] hover:bg-[#0044CC]'}`}
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            <Cpu size={28} />
                            {isMining ? "⏹️ STOP MINING" : "▶️ START EARNING ECO"}
                        </button>
                        
                        {location && (
                            <div className="mt-4 bg-white border-4 border-black p-2 text-sm font-bold">
                                <MapPin size={16} className="inline mr-1" /> 
                                Current: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                            </div>
                        )}
                    </div>

                    {/* Console Logs */}
                    <div className="flex-1 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col min-h-[300px]">
                        <div className="bg-[#FDFBF7] border-b-4 border-black p-2 flex gap-2 items-center">
                            <span className="w-3 h-3 bg-[#FF3366] border-2 border-black rounded-full"></span>
                            <span className="w-3 h-3 bg-[#FFE600] border-2 border-black rounded-full"></span>
                            <span className="w-3 h-3 bg-[#00FF66] border-2 border-black rounded-full"></span>
                            <span className="ml-2 text-xs font-bold uppercase">NODE TERMINAL v1.0</span>
                        </div>
                        <div className="p-4 text-[#00FF66] text-sm md:text-base flex-1 flex flex-col justify-end font-mono overflow-auto max-h-[300px]">
                            {!isMining ? (
                                <p className="text-gray-500 italic">No active processes. Awaiting INIT command.</p>
                            ) : (
                                <div className="space-y-1">
                                    {logs.map((log, idx) => (
                                        <p key={idx} className={`${idx === logs.length - 1 ? 'font-bold animate-pulse' : 'opacity-80'} text-xs md:text-sm`}>
                                            {log}
                                        </p>
                                    ))}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="w-3 h-4 bg-[#00FF66] animate-pulse"></span>
                                        <span className="text-[#00FF66] text-xs">Processing...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. REAL DATA DISPLAY (Appears when mining) */}
                {sensorData && isMining && (
                    <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <h3 className="text-2xl md:text-3xl font-black mb-6 uppercase inline-flex items-center gap-3 bg-[#00FFFF] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            <Wind size={28} /> LIVE ENVIRONMENT READINGS
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* PM2.5 Card */}
                            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-500">PM2.5</h4>
                                    <AlertTriangle size={24} className="text-[#FF3366]" />
                                </div>
                                <div className="text-4xl font-black mt-2">{sensorData.pm25}</div>
                                <div className="text-sm font-bold bg-[#FF3366] text-white border-2 border-black px-2 inline-block mt-2">µg/m³</div>
                            </div>

                            {/* PM10 Card */}
                            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-500">PM10</h4>
                                    <Wind size={24} className="text-[#7B61FF]" />
                                </div>
                                <div className="text-4xl font-black mt-2">{sensorData.pm10}</div>
                                <div className="text-sm font-bold bg-[#7B61FF] text-white border-2 border-black px-2 inline-block mt-2">µg/m³</div>
                            </div>

                            {/* NO2 Card */}
                            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-500">NO₂ (Traffic)</h4>
                                    <Wind size={24} className="text-[#0055FF]" />
                                </div>
                                <div className="text-4xl font-black mt-2">{sensorData.no2}</div>
                                <div className="text-sm font-bold bg-[#0055FF] text-white border-2 border-black px-2 inline-block mt-2">ppb</div>
                            </div>

                            {/* CO Card */}
                            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-500">CO Level</h4>
                                    <Activity size={24} className="text-[#7B61FF]" />
                                </div>
                                <div className="text-4xl font-black mt-2">{sensorData.co}</div>
                                <div className="text-sm font-bold bg-[#7B61FF] text-white border-2 border-black px-2 inline-block mt-2">ppm</div>
                            </div>

                            {/* O3 Card */}
                            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-500">O₃ (Ozone)</h4>
                                    <Wind size={24} className="text-[#00FF66]" />
                                </div>
                                <div className="text-4xl font-black mt-2">{sensorData.o3}</div>
                                <div className="text-sm font-bold bg-[#00FF66] text-black border-2 border-black px-2 inline-block mt-2">ppb</div>
                            </div>

                            {/* SO2 Card */}
                            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-500">SO₂</h4>
                                    <AlertTriangle size={24} className="text-[#FF3366]" />
                                </div>
                                <div className="text-4xl font-black mt-2">{sensorData.so2}</div>
                                <div className="text-sm font-bold bg-[#FF3366] text-white border-2 border-black px-2 inline-block mt-2">ppb</div>
                            </div>

                             {/* Weather Card */}
                             <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all bg-gradient-to-br from-white to-[#E0F7FA]">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-500">Conditions</h4>
                                    <Thermometer size={24} className="text-black" />
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <div>
                                        <div className="text-2xl font-black">{sensorData.temperature}°C</div>
                                        <div className="text-xs font-bold text-gray-500">TEMP</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black">{sensorData.relativehumidity}%</div>
                                        <div className="text-xs font-bold text-gray-500">HUMIDITY</div>
                                    </div>
                                </div>
                            </div>

                            {/* NOx Card */}
                            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-500">NOx (Total)</h4>
                                    <Activity size={24} className="text-[#FFE600]" />
                                </div>
                                <div className="text-4xl font-black mt-2">{sensorData.nox}</div>
                                <div className="text-sm font-bold bg-[#FFE600] text-black border-2 border-black px-2 inline-block mt-2">ppb</div>
                            </div>
                        </div>
                        
                        <div className="mt-4 text-xs text-gray-500 text-right">
                            Last updated: {new Date(sensorData.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                )}

                {/* 4. RECENT NFT MINTS */}
                <h3 className="text-2xl md:text-3xl font-black mb-6 uppercase inline-flex items-center gap-3 bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Database size={28} /> MY AIR-NFTs
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[
                        { id: '#8821', time: '10:42 AM', loc: 'Salt Lake', aqi: '142', reward: '+10 ECO', color: 'text-[#FF3366]', bgColor: 'bg-[#00FFFF]' },
                        { id: '#8820', time: '10:30 AM', loc: 'Sector V', aqi: '89', reward: '+10 ECO', color: 'text-[#FFCC00]', bgColor: 'bg-white' },
                        { id: '#8819', time: '09:15 AM', loc: 'New Town', aqi: '110', reward: '+10 ECO', color: 'text-[#FF3366]', bgColor: 'bg-[#FFE600]' },
                        { id: '#8818', time: '08:45 AM', loc: 'Airport', aqi: '156', reward: '+10 ECO', color: 'text-[#FF3366]', bgColor: 'bg-[#FF99FF]' },
                    ].map((item, idx) => (
                        <div key={idx} className={`${item.bgColor} border-4 border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[6px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between aspect-[4/5] cursor-pointer group`}>
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-black text-xl md:text-2xl bg-black text-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        {item.id}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 font-mono bg-[#F4F4F0] text-black border-4 border-black p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-[#00FF66] transition-colors">
                                    <p className="font-bold flex items-center gap-2 text-sm lg:text-base"><MapPin size={16} /> {item.loc}</p>
                                    <p className="font-bold flex items-center gap-2 text-xs md:text-sm"><Clock size={16} /> {item.time}</p>
                                </div>
                                <div className="text-center mt-6">
                                    <span className="bg-black text-white px-2 py-1 font-bold text-xs uppercase tracking-widest border-2 border-black">Air Quality Index</span>
                                    <div className={`font-black text-4xl mt-2 ${item.color}`}>{item.aqi}</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 mt-4">
                                <span className="font-black text-xl text-[#0055FF] bg-white border-4 border-black px-2 py-2 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{item.reward}</span>
                                <span className="flex items-center justify-center gap-2 font-mono text-sm font-bold bg-[#00FF66] border-4 border-black px-2 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <CheckCircle size={16} /> VERIFIED
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;