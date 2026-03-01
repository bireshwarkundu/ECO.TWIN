import React, { useState } from 'react';
import { Navigation, Wallet, MapPin, Globe, Zap, Shield, ArrowRight } from 'lucide-react';

const Web3UserApp = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                setIsConnecting(true);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                }
            } catch (error) {
                console.error("Wallet connection failed:", error);
                alert("Failed to connect wallet. Please try again.");
            } finally {
                setIsConnecting(false);
            }
        } else {
            alert("MetaMask is not installed! Please install the browser extension to connect your wallet.");
        }
    };

    return (
        <div className="font-mono min-h-screen bg-[#F4F4F0] text-black">
            {/* Global Node Navbar */}
            <nav className="sticky top-0 z-50 bg-[#F4F4F0] border-b-[3px] md:border-b-4 border-black px-2 md:px-8 py-3 md:py-4 flex flex-col xl:flex-row justify-between items-center gap-3 md:gap-4">

                {/* Left Side */}
                <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center w-full xl:w-auto">
                    {/* <div className="bg-white border-[3px] md:border-4 border-black px-2 py-1 md:px-4 md:py-2 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 text-sm md:text-lg uppercase cursor-default">
                        <span className="w-3 h-3 md:w-4 md:h-4 bg-[#00FF66] rounded-full animate-pulse border-2 border-black" />
                        125 ECO
                    </div> */}

                    <a
                        href="/node"
                        className="bg-[#FFE600] border-[3px] md:border-4 border-black px-2 py-1 md:px-4 md:py-2 text-sm md:text-2xl font-black uppercase tracking-tighter shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all block w-max cursor-pointer"
                        style={{ fontFamily: "'Space Grotesk', 'Archivo Black', sans-serif" }}
                    >
                        ECO.PULSE
                    </a>
                </div>

                {/* Right Side */}
                <div className="flex gap-2 md:gap-4 items-center flex-wrap justify-center w-full xl:w-auto mt-2 md:mt-0">
                    <a
                        href="/node"
                        className="bg-[#00FF66] px-3 py-1.5 md:px-6 md:py-2 border-[3px] md:border-4 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-transform flex-1 text-center sm:flex-none text-xs md:text-base"
                    >
                        Map
                    </a>

                    <a
                        href="/user-dashboard"
                        className="bg-white px-3 py-1.5 md:px-6 md:py-2 border-[3px] md:border-4 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-transform flex items-center justify-center gap-1.5 md:gap-2 flex-1 sm:flex-none text-xs md:text-base whitespace-nowrap"
                    >
                        <Wallet size={14} className="md:w-[18px] md:h-[18px]" /> Node Dashboard
                    </a>

                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="bg-white text-black border-[3px] md:border-4 border-black px-3 py-1.5 md:px-4 md:py-2 font-mono font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed uppercase group hover:bg-[#00FF66] w-full sm:w-auto text-xs md:text-base mt-2 sm:mt-0"
                    >
                        <Wallet size={14} className="text-[#00FF66] group-hover:text-black transition-colors md:w-[18px] md:h-[18px]" />
                        {isConnecting ? "CONNECTING..." : walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "CONNECT WALLET"}
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="w-full">

                {/* 1. HERO SECTION */}
                <section className="bg-white border-b-4 border-black px-4 py-20 lg:py-32 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-10 left-10 w-32 h-32 md:w-64 md:h-64 bg-[#00FF66] border-4 border-black mix-blend-multiply opacity-30 animate-pulse rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 md:w-80 md:h-80 bg-[#0055FF] border-4 border-black mix-blend-multiply opacity-20 animate-pulse delay-700 blur-3xl"></div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-8 relative z-10 leading-[1.1] md:leading-[0.9] flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4 gap-y-2" style={{ fontFamily: "'Space Grotesk', 'Archivo Black', sans-serif" }}>
                        <span>Own The</span>
                        <span className="text-[#FF3366] bg-[#FFE600] px-2 md:px-4 py-0 md:py-1 outline-[3px] md:outline-4 outline-black border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_#000] md:shadow-[6px_6px_0px_0px_#000]">Air</span>
                        <span>You Breathe</span>
                    </h1>

                    <p className="max-w-4xl text-base md:text-2xl font-mono font-bold mb-10 bg-[#F4F4F0] border-[3px] md:border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative z-10 leading-relaxed text-left md:text-center w-[90%] md:w-auto">
                        Join the world's largest Decentralized Physical Infrastructure Network (DePIN). Mint local ground-level air quality data into verified blocks and earn <span className="text-[#0055FF] font-black underline">ECO tokens</span> passively.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 relative z-10 w-[90%] sm:w-auto px-0 md:px-4">
                        <button className="w-full sm:w-auto bg-[#FFE600] text-black border-[3px] md:border-4 border-black px-6 py-4 md:px-8 md:py-5 text-lg md:text-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3">
                            <Zap size={24} className="md:w-7 md:h-7" /> Deploy Node
                        </button>
                        <a href="#map-console" className="w-full sm:w-auto bg-white text-black border-[3px] md:border-4 border-black px-6 py-4 md:px-8 md:py-5 text-lg md:text-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 group hover:bg-[#00FF66]">
                            View Live Map <ArrowRight size={24} className="text-[#00FF66] group-hover:text-black transition-colors md:w-7 md:h-7" />
                        </a>
                    </div>
                </section>

                {/* 2. THE PROCESS / HOW IT WORKS */}
                <section className="bg-[#FDFBF7] border-b-4 border-black px-4 py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b-4 border-black pb-6 gap-4">
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                The Protocol
                            </h2>
                            <p className="font-mono font-bold text-xl md:text-2xl bg-[#00FF66] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
                                3 Steps to Web3
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {/* Step 1 */}
                            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_18px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="bg-black text-white w-20 h-20 flex items-center justify-center text-4xl font-black mb-8 border-4 border-black shadow-[6px_6px_0px_0px_#0055FF]">1</div>
                                <h3 className="text-3xl lg:text-4xl font-black uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sync Wallet</h3>
                                <p className="font-mono text-lg font-bold opacity-80 leading-relaxed">Connect your cryptography identity. Every ecological data upload requires a valid digital signature to completely prevent Sybil network attacks.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_18px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="bg-black text-white w-20 h-20 flex items-center justify-center text-4xl font-black mb-8 border-4 border-black shadow-[6px_6px_0px_0px_#FFE600]">2</div>
                                <h3 className="text-3xl lg:text-4xl font-black uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Scan Area</h3>
                                <p className="font-mono text-lg font-bold opacity-80 leading-relaxed">Your mobile device acts as a decentralized sensor edge node. It heavily pinpoints your geolocation and ingests the raw environmental variables.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_18px_0px_0px_rgba(0,0,0,1)] transition-all">
                                <div className="bg-black text-white w-20 h-20 flex items-center justify-center text-4xl font-black mb-8 border-4 border-black shadow-[6px_6px_0px_0px_#00FF66]">3</div>
                                <h3 className="text-3xl lg:text-4xl font-black uppercase mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Mine Data</h3>
                                <p className="font-mono text-lg font-bold opacity-80 leading-relaxed">Publish encrypted blocks to the public ledger. If global consensus verifies your hardware readings, you are rewarded instantly with high ECO yield.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. PURPOSE / DATA LAYER */}
                <section className="bg-[#FFE600] border-b-4 border-black px-4 py-20 lg:py-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1">
                            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-8 leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                Build The <br /><span className="text-[#FF3366] underline decoration-8 underline-offset-8 decoration-black">Truth</span>
                            </h2>
                            <p className="font-mono text-xl md:text-2xl font-bold mb-10 bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] leading-relaxed">
                                Governments and massive corporations deeply centralize climate reporting, creating huge data black-holes. <br /><br /><strong className="bg-[#FF3366] text-white px-2 py-1 border-2 border-black inline-block mt-2 shadow-[4px_4px_0px_0px_#000]">ECO.PULSE SHATTERS THAT.</strong>
                                <br /><br />
                                By crowd-sourcing atmospheric polling across millions of local nodes, we build a universally transparent, un-censorable realtime neural net of the Earth's absolute health.
                            </p>

                            <div className="flex flex-wrap gap-4 font-mono font-bold text-lg">
                                <div className="flex items-center gap-3 bg-black text-white border-4 border-white px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Shield size={24} /> Cryptographic</div>
                                <div className="flex items-center gap-3 bg-black text-[#00FF66] border-4 border-[#00FF66] px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Globe size={24} /> Permissionless</div>
                            </div>
                        </div>

                        {/* Visual Box */}
                        <div className="flex-1 w-full max-w-lg bg-black border-4 border-black shadow-[16px_16px_0px_0px_#0055FF] p-8 aspect-square flex flex-col items-center justify-center relative group">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00FF66] via-transparent to-transparent group-hover:opacity-40 transition-opacity"></div>
                            <Globe size={200} className="text-[#00FF66] animate-[spin_30s_linear_infinite]" strokeWidth={1} />

                            {/* Decorative Tech UI Overlays */}
                            <div className="absolute top-8 left-8 bg-white border-4 border-black px-3 py-2 font-mono font-bold text-base z-10 shadow-[4px_4px_0px_0px_#FF3366]">LIVE NODES: 14,082</div>
                            <div className="absolute bottom-8 right-8 bg-[#FF3366] text-white border-4 border-black px-3 py-2 font-mono font-bold text-base z-10 text-right shadow-[4px_4px_0px_0px_#FFE600]">CRITICAL AQI ALERTS: 89<br /><span className="text-xs">LAST 10 HOURS</span></div>
                        </div>
                    </div>
                </section>


                {/* 4. MAP CONSOLE SECTOR */}
                <section id="map-console" className="w-full relative h-[90vh] min-h-[700px] border-b-4 border-black flex flex-col">

                    <div className="bg-black text-white px-6 py-4 flex justify-between items-center border-b-4 border-black">
                        <h2 className="text-3xl font-black uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>TERMINAL: 0xGLOBAL_TRACKER</h2>
                        <div className="flex gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#FF3366] border-2 border-white"></span>
                            <span className="w-4 h-4 rounded-full bg-[#FFE600] border-2 border-white"></span>
                            <span className="w-4 h-4 rounded-full bg-[#00FF66] border-2 border-white animate-pulse"></span>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative bg-[#1a1a1a] overflow-hidden flex flex-col justify-between">
                        {/* Simulated Map Background Area */}
                        <div className="absolute inset-0 opacity-50" style={{
                            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px)',
                            backgroundSize: '40px 40px'
                        }}></div>

                        {/* Raster grid dots representing other miners */}
                        {['top-[20%] left-[15%]', 'top-[45%] right-[25%]', 'bottom-[30%] left-[40%]', 'top-[30%] right-[10%]', 'bottom-[20%] left-[20%]'].map((pos, i) => (
                            <div key={i} className={`absolute ${pos} w-5 h-5 bg-[#00FF66] border-2 border-black rounded-full animate-pulse shadow-[0_0_20px_#00FF66]`} />
                        ))}

                        <div className="w-full h-full flex flex-col justify-center items-center p-4 z-10 mt-auto md:mb-10 pointer-events-none">
                            {/* Inner Bottom Action Sheet */}
                            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl pointer-events-auto transform transition-transform hover:-translate-y-2">

                                <div className="font-mono text-base mb-4 font-bold flex items-center gap-3 bg-[#F4F4F0] border-4 border-black w-max px-3 py-2 shadow-[4px_4px_0px_0px_#000]">
                                    <MapPin size={20} className="text-[#FF3366]" /> Bidhannagar, Sector V
                                </div>

                                <h2
                                    className="text-5xl md:text-7xl font-black text-[#FF3366] mb-8 uppercase tracking-tight"
                                    style={{ fontFamily: "'Space Grotesk', 'Archivo Black', sans-serif" }}
                                >
                                    AQI: 155 (Unhealthy)
                                </h2>

                                <button className="w-full bg-[#0055FF] text-white border-4 border-black py-6 px-6 text-2xl md:text-3xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all mb-6 flex flex-col md:flex-row items-center justify-center gap-4 group">
                                    <span>⚡ MINT LOCATION DATA</span>
                                    <span className="text-lg font-mono font-bold text-black bg-[#00FF66] border-4 border-black px-3 py-1 shadow-[4px_4px_0px_0px_#000] group-hover:bg-white transition-colors">+10 ECO Reward</span>
                                </button>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    <button className="flex-1 bg-[#FF3366] text-black border-4 border-black py-5 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all flex justify-center items-center gap-3 text-lg">
                                        ⚠️ REPORT INCIDENT
                                    </button>
                                    <a href="/user-dashboard" className="flex-1 bg-[#F4F4F0] text-black border-4 border-black py-5 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all flex justify-center items-center gap-3 text-center text-lg">
                                        📊 DASHBOARD
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <footer className="bg-black text-white p-12 md:p-20 font-mono text-center flex flex-col items-center justify-center border-t-8 border-[#00FF66]">
                    <div className="text-4xl md:text-5xl font-black uppercase mb-6 tracking-tighter bg-[#FFE600] text-black px-6 py-2 shadow-[8px_8px_0px_0px_#FF3366]" style={{ fontFamily: "'Space Grotesk', 'Archivo Black', sans-serif" }}>ECO.PULSE NETWORK</div>
                    <p className="opacity-75 text-lg md:text-xl font-bold max-w-2xl mb-8">Decentralized Web3 Physical Infrastructure Protocol.</p>
                    <div className="flex gap-6 mt-4">
                        <a href="#" className="hover:text-[#00FF66] underline font-bold">Whitepaper</a>
                        <a href="#" className="hover:text-[#00FF66] underline font-bold">Github</a>
                        <a href="#" className="hover:text-[#00FF66] underline font-bold">Discord</a>
                    </div>
                </footer>

            </main>
        </div>
    );
};

export default Web3UserApp;
