import React, { useState, useEffect } from 'react';
import { Wallet, Activity, MapPin, Database, Server, Cpu, CheckCircle, Clock, Wind, AlertTriangle, Thermometer, ShieldCheck, Droplets, Zap, ExternalLink } from 'lucide-react';
import { getCalibratedAirData } from '../utils/fetchEnvironmentalData.js';

const UserDashboard = () => {
    const [balance, setBalance] = useState(124.5);
    const [isMining, setIsMining] = useState(false);
    const [logs, setLogs] = useState([]);
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [chainId, setChainId] = useState(null);
    
    // DATA STATES
    const [sensorData, setSensorData] = useState(null);
    const [location, setLocation] = useState(null);

    // VERIFICATION STATES
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [deviation, setDeviation] = useState(null);
    
    // MINTING STATES
    const [isMinting, setIsMinting] = useState(false);
    const [mintResult, setMintResult] = useState(null);
    const [signature, setSignature] = useState(null);

    // 1. Wallet Connection - Opens MetaMask for user to select account
    const connectWallet = async () => {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        window.open("https://metamask.io/download/", "_blank");
        return;
    }

    try {
        setIsConnecting(true);

        // 1️⃣ Try already connected accounts (no popup)
        let accounts = await window.ethereum.request({
            method: "eth_accounts",
        });

        // 2️⃣ If none, open MetaMask (popup WILL appear)
        if (!accounts || accounts.length === 0) {
            setLogs(prev => [...prev, "> 🔄 Opening MetaMask... Select an account"]);
            accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
        }

        if (!accounts || accounts.length === 0) {
            throw new Error("No account selected");
        }

        // MetaMask decides the default account, not you
        const selectedAccount = accounts[0];
        setWalletAddress(selectedAccount);

        setLogs(prev => [
            ...prev,
            `> ✅ Connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`
        ]);

        // Network
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        const chainId = parseInt(chainIdHex, 16);
        setChainId(chainId);

        const networks = {
            1: "Ethereum Mainnet",
            137: "Polygon Mainnet",
            80001: "Polygon Mumbai",
            11155111: "Sepolia",
        };

        setLogs(prev => [
            ...prev,
            `> 🌐 Network: ${networks[chainId] || "Unknown"} (${chainId})`
        ]);

        // Balance
        const balanceHex = await window.ethereum.request({
            method: "eth_getBalance",
            params: [selectedAccount, "latest"],
        });

        const balance = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
        setLogs(prev => [...prev, `> 💰 Balance: ${balance} ETH`]);

    } catch (error) {
        if (error.code === 4001) {
            setLogs(prev => [...prev, "> ❌ User rejected connection"]);
        } else if (error.code === -32002) {
            setLogs(prev => [...prev, "> ⏳ MetaMask request already pending"]);
        } else {
            console.error(error);
            setLogs(prev => [...prev, `> ❌ ${error.message}`]);
        }
    } finally {
        setIsConnecting(false);
    }
};

    // Add account and network change listeners
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected/locked wallet
                    setWalletAddress('');
                    setLogs(prev => [...prev, "> 🔒 Wallet disconnected"]);
                } else if (accounts[0] !== walletAddress) {
                    // Account changed
                    setWalletAddress(accounts[0]);
                    setLogs(prev => [...prev, `> 🔄 Switched to: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`]);
                }
            };
            
            const handleChainChanged = (chainId) => {
                const networkId = parseInt(chainId, 16);
                setChainId(networkId);
                
                let networkName = 'Unknown';
                if (networkId === 1) networkName = 'Ethereum Mainnet';
                else if (networkId === 137) networkName = 'Polygon Mainnet';
                else if (networkId === 80001) networkName = 'Polygon Mumbai';
                else if (networkId === 11155111) networkName = 'Sepolia';
                
                setLogs(prev => [...prev, `> 🔄 Network changed to: ${networkName} (${networkId})`]);
            };
            
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [walletAddress]);

    useEffect(() => {
        console.log("Sensor Data Updated:", sensorData);
    }, [sensorData]);

    // Helper: Sign message with MetaMask
    const signMessage = async (message) => {
        if (!window.ethereum) throw new Error("MetaMask not installed");
        
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, account]
            });
            
            return signature;
        } catch (error) {
            console.error("Signing error:", error);
            throw error;
        }
    };

    // 2. Step 1: Fetch Data
    const toggleMining = async () => {
        if (isMining) {
            // Reset Everything on Stop
            setIsMining(false);
            setSensorData(null);
            setLocation(null);
            setVerificationResult(null);
            setDeviation(null);
            setMintResult(null);
            setSignature(null);
            setLogs(prev => [...prev, "> Session Terminated."]);
            return;
        }

        setIsMining(true);
        setLogs(["> Initializing Node Connection..."]);

        if (!navigator.geolocation) {
            setLogs(prev => [...prev, "❌ GPS Error: Not Supported"]);
            setIsMining(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setLocation({ lat, lon });
                
                setLogs(prev => [...prev, `> ✅ GPS Signal Acquired: ${lat.toFixed(4)}, ${lon.toFixed(4)}`]);
                setLogs(prev => [...prev, "> Contacting environmental satellites..."]);

                // CALL YOUR LOCAL NODE API
                const data = await getCalibratedAirData(lat, lon);
                
                if (data) {
                    setSensorData(data);
                    setLogs(prev => [...prev, "> ✅ Data Packets Received!", `> PM2.5: ${data.pm25} µg/m³`, `> Temperature: ${data.temperature}°C`]);
                } else {
                    setLogs(prev => [...prev, "> ⚠️ Sensor Connection Failed."]);
                    setIsMining(false);
                }
            },
            (err) => {
                console.error(err);
                let errorMessage = "> ❌ GPS Access Denied.";
                if (err.code === 1) {
                    errorMessage = "> ❌ Location permission denied. Please enable location access.";
                } else if (err.code === 2) {
                    errorMessage = "> ❌ Position unavailable. Check GPS signal.";
                } else if (err.code === 3) {
                    errorMessage = "> ❌ Location request timed out.";
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

    // 3. Step 2: Verify Data (Call Backend)
    const handleVerify = async () => {
        if (!sensorData || !location) return;

        setIsVerifying(true);
        setVerificationResult(null);
        setLogs(prev => [...prev, "> 🛡️ Initiating Consensus Protocol...", "> Contacting Validator Node..."]);

        try {
            const response = await fetch('http://localhost:3000/api/user/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lat: location.lat,
                    lon: location.lon,
                    userReadings: {
                        co: sensorData.co,
                        pm25: sensorData.pm25,
                        pm10: sensorData.pm10,
                        no: sensorData.no,
                        no2: sensorData.no2,
                        nox: sensorData.nox,
                        o3: sensorData.o3,
                        pm10: sensorData.pm10,
                        pm25: sensorData.pm25,
                        relativehumidity: sensorData.relativehumidity,
                        so2: sensorData.so2,
                        temperature: sensorData.temperature

                    }
                })
            });

            const result = await response.json();

            if (result.verified) {
                setVerificationResult('success');
                setDeviation(result.deviation);
                setLogs(prev => [...prev, `> ✅ VERIFIED! Deviation: ${result.deviation}%`, "> Consensus: APPROVED"]);
            } else {
                setVerificationResult('failed');
                setDeviation(result.deviation);
                setLogs(prev => [...prev, `> ❌ REJECTED! Deviation: ${result.deviation || 'Unknown'}%`, `> Reason: ${result.message}`]);
            }

        } catch (error) {
            console.error("Verification Error:", error);
            setLogs(prev => [...prev, "> ❌ Validator Node Offline."]);
            setVerificationResult('failed');
        } finally {
            setIsVerifying(false);
        }
    };

    // 4. Step 3: Mint NFT (Call Backend Endpoint)
    const handleMint = async () => {
        if (!sensorData || !location || !walletAddress) {
            alert("Please connect wallet and verify data first");
            return;
        }

        setIsMinting(true);
        setLogs(prev => [...prev, "> 🔏 Requesting signature from MetaMask..."]);

        try {
            // Create message to sign
            const timestamp = Date.now();
            const message = `Mint EcoPulse NFT\nLocation: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}\nPM2.5: ${sensorData.pm25}\nTimestamp: ${timestamp}`;
            
            // Get signature from MetaMask
            setLogs(prev => [...prev, "> ✍️ Please sign the message in MetaMask..."]);
            const sig = await signMessage(message);
            setSignature(sig);
            
            setLogs(prev => [...prev, "> ✅ Signature obtained", "> ⛓️ Submitting to blockchain relayer..."]);

            // Prepare data for minting
            const mintData = {
                userAddress: walletAddress,
                signature: sig,
                message: message,
                sensorData: {
                    ...sensorData,
                    lat: location.lat,
                    lon: location.lon,
                    timestamp: new Date().toISOString(),
                    deviation: deviation
                }
            };

            // Call your mint endpoint
            const response = await fetch('http://localhost:3000/api/user/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mintData)
            });

            const result = await response.json();

            if (result.success) {
                setMintResult(result);
                setBalance(prev => prev + 10); // Add reward
                setLogs(prev => [...prev, 
                    `> ✅ MINT SUCCESSFUL!`,
                    `> Token ID: ${result.tokenId || 'Unknown'}`,
                    `> Tx Hash: ${result.txHash ? result.txHash.substring(0, 10) + '...' + result.txHash.substring(58) : 'Unknown'}`,
                    `> 💰 +10 ECO Reward Received!`,
                ]);
                
                // Optional: Show explorer link
                if (result.explorerUrl) {
                    setLogs(prev => [...prev, `> 🔗 View: ${result.explorerUrl}`]);
                }
                
                // Optional: Show OpenSea link
                if (result.openSeaUrl) {
                    setLogs(prev => [...prev, `> 🖼️ OpenSea: ${result.openSeaUrl}`]);
                }
            } else {
                throw new Error(result.error || "Minting failed");
            }

        } catch (error) {
            console.error("Minting Error:", error);
            setLogs(prev => [...prev, `> ❌ Minting Failed: ${error.message}`]);
            alert(`Minting failed: ${error.message}`);
        } finally {
            setIsMinting(false);
        }
    };

    // Auto-scroll logs to bottom
    useEffect(() => {
        const terminal = document.getElementById('terminal-logs');
        if (terminal) {
            terminal.scrollTop = terminal.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-black selection:bg-[#00FF66] font-mono">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#FDFBF7] border-b-[3px] md:border-b-4 border-black px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white border-4 border-black px-4 py-2 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 text-lg">
                        <span className="w-4 h-4 bg-[#00FF66] rounded-full animate-pulse border-2 border-black" />
                        {balance} ECO
                    </div>
                    <span className="bg-[#FFE600] border-4 border-black px-4 py-2 text-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        ECO.PULSE
                    </span>
                </div>
                <button 
                    onClick={connectWallet} 
                    disabled={isConnecting}
                    className="bg-white text-black border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#00FF66] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 min-w-[180px] justify-center"
                >
                    <Wallet size={18} /> 
                    {isConnecting ? "CONNECTING..." : walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : "CONNECT WALLET"}
                </button>
            </nav>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <h1 className="text-5xl font-black mb-8 border-b-4 border-black pb-4 uppercase">MINER PROFILE</h1>

                {/* MAIN ACTION AREA */}
                <div className="bg-[#FFE600] border-4 border-black p-8 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
                            <h2 className="text-3xl font-black flex items-center gap-3 uppercase">
                                <Server size={32} /> ACTIVE SENSOR NODE
                            </h2>
                            <span className={`inline-block w-6 h-6 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isMining ? 'bg-[#00FF66] animate-pulse' : 'bg-[#FF3366]'}`}></span>
                        </div>

                        {/* Wallet Status */}
                        {!walletAddress && (
                            <div className="bg-[#FF3366] text-white border-4 border-black p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                                <AlertTriangle size={20} />
                                <span className="font-bold">Connect wallet to start mining</span>
                            </div>
                        )}

                        {/* Network Status */}
                        {walletAddress && chainId && chainId !== 80001 && chainId !== 137 && (
                            <div className="bg-yellow-400 border-4 border-black p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                                <AlertTriangle size={20} />
                                <span className="font-bold">Switch to Polygon network for best experience</span>
                            </div>
                        )}

                        {/* STEP 1: START MINING */}
                        {!sensorData && (
                            <button
                                onClick={toggleMining}
                                disabled={!walletAddress}
                                className={`w-full py-4 text-2xl font-black uppercase text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-4 ${isMining ? 'bg-[#FF3366] hover:bg-[#E62E5C]' : 'bg-[#0055FF] hover:bg-[#0044CC]'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <Cpu size={28} /> {isMining ? "⏹️ STOP SESSION" : "▶️ START DATA STREAM"}
                            </button>
                        )}

                        {/* STEP 2: VERIFY DATA (Appears after fetch) */}
                        {sensorData && !verificationResult && (
                            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="font-bold mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-[#00FF66] rounded-full animate-pulse"></span>
                                    📡 Data Captured. Run verification to validate accuracy.
                                </p>
                                <button
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                    className="w-full py-3 text-xl font-black uppercase bg-[#7B61FF] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6a4df4] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? (
                                        <>⏳ Verifying...</>
                                    ) : (
                                        <><ShieldCheck size={20} /> VERIFY WITH NETWORK</>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* STEP 3: MINT REWARD (Appears after success) */}
                        {verificationResult === 'success' && !mintResult && (
                            <div className="bg-[#00FF66] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in duration-300">
                                <p className="font-bold mb-2 flex items-center gap-2">
                                    <CheckCircle size={20} /> 
                                    Data Verified! Deviation: {deviation}%
                                </p>
                                <button
                                    onClick={handleMint}
                                    disabled={isMinting}
                                    className="w-full py-3 text-xl font-black uppercase bg-black text-[#00FF66] border-4 border-black hover:bg-gray-900 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isMinting ? (
                                        <>⛏️ Minting NFT...</>
                                    ) : (
                                        <><Database size={20} /> MINT NFT & CLAIM +10 ECO</>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* MINT SUCCESS STATE */}
                        {mintResult && (
                            <div className="bg-[#00FF66] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4 duration-300">
                                <p className="font-bold mb-2 text-green-900 flex items-center gap-2">
                                    <CheckCircle size={20} />
                                    NFT Minted Successfully!
                                </p>
                                <div className="bg-black text-[#00FF66] p-3 font-mono text-sm border-2 border-black">
                                    <p>Token ID: {mintResult.tokenId || 'N/A'}</p>
                                    <p className="truncate">Tx: {mintResult.txHash || 'N/A'}</p>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    {mintResult.explorerUrl && (
                                        <a 
                                            href={mintResult.explorerUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-white border-2 border-black px-2 py-1 font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-100"
                                        >
                                            View on Explorer <ExternalLink size={12} />
                                        </a>
                                    )}
                                    {mintResult.openSeaUrl && (
                                        <a 
                                            href={mintResult.openSeaUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-white border-2 border-black px-2 py-1 font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-100"
                                        >
                                            OpenSea <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                                <button 
                                    onClick={toggleMining}
                                    className="mt-3 w-full bg-[#0055FF] text-white border-2 border-black py-1 font-bold hover:bg-[#0044CC] transition-all"
                                >
                                    Start New Session
                                </button>
                            </div>
                        )}
                        
                        {/* FAILED STATE */}
                        {verificationResult === 'failed' && (
                            <div className="bg-[#FF3366] text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="font-bold flex items-center gap-2">
                                    <AlertTriangle size={20} />
                                    Verification Failed (Deviation: {deviation}%)
                                </p>
                                <button 
                                    onClick={toggleMining} 
                                    className="mt-2 underline font-bold hover:text-white/80 transition-colors"
                                >
                                    Restart Session →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* TERMINAL LOGS */}
                    <div className="flex-1 bg-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col min-h-[400px]">
                        <div className="bg-[#FDFBF7] border-b-4 border-black p-2 flex gap-2 items-center sticky top-0">
                            <span className="w-3 h-3 bg-[#FF3366] border-2 border-black rounded-full"></span>
                            <span className="w-3 h-3 bg-[#FFE600] border-2 border-black rounded-full"></span>
                            <span className="w-3 h-3 bg-[#00FF66] border-2 border-black rounded-full"></span>
                            <span className="ml-2 text-xs font-bold uppercase">NODE TERMINAL v1.0</span>
                        </div>
                        <div 
                            id="terminal-logs"
                            className="p-4 text-[#00FF66] font-mono text-sm overflow-y-auto flex-1"
                            style={{ maxHeight: '400px' }}
                        >
                            {logs.length === 0 && (
                                <p className="text-gray-500 italic">System Idle. Start a session to begin.</p>
                            )}
                            {logs.map((log, i) => (
                                <p key={i} className="mb-1 break-all">{log}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SENSOR DATA GRID */}
                {sensorData && (
                    <div className="mb-12">
                        <h3 className="text-3xl font-black mb-6 uppercase inline-flex items-center gap-3 bg-[#00FFFF] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Wind size={28} /> LIVE ENVIRONMENT READINGS
                            {location && (
                                <span className="text-sm bg-black text-white px-2 py-1 ml-4">
                                    {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                                </span>
                            )}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            <DataCard label="PM2.5" value={sensorData.pm25} unit="µg/m³" color="bg-white" icon={<AlertTriangle color="#FF3366"/>} />
                            <DataCard label="PM10" value={sensorData.pm10} unit="µg/m³" color="bg-white" icon={<Wind color="#FF9900"/>} />
                            <DataCard label="NO₂" value={sensorData.no2} unit="ppb" color="bg-white" icon={<Wind color="#0055FF"/>} />
                            <DataCard label="SO₂" value={sensorData.so2} unit="ppb" color="bg-white" icon={<AlertTriangle color="#FFCC00"/>} />
                            <DataCard label="O₃" value={sensorData.o3} unit="ppb" color="bg-white" icon={<Zap color="#00FF66"/>} />
                            <DataCard label="CO" value={sensorData.co} unit="ppm" color="bg-white" icon={<Activity color="#7B61FF"/>} />
                            <DataCard label="NOx" value={sensorData.nox} unit="ppb" color="bg-white" icon={<Wind color="#9933FF"/>} />
                            <DataCard label="Temp" value={sensorData.temperature} unit="°C" color="bg-white" icon={<Thermometer />} />
                            <DataCard label="Humidity" value={sensorData.relativehumidity} unit="%" color="bg-white" icon={<Droplets color="#0099FF"/>} />
                        </div>
                        
                        {/* Timestamp */}
                        {sensorData.timestamp && (
                            <p className="text-right text-sm text-gray-500 mt-4">
                                Last updated: {new Date(sensorData.timestamp).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Data Card Component
const DataCard = ({ label, value, unit, color, icon }) => (
    <div className={`${color} border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all`}>
        <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-gray-500 text-sm uppercase">{label}</span>
            {icon}
        </div>
        <div className="text-4xl font-black truncate">{value}</div>
        <div className="text-sm font-bold bg-black text-white px-2 inline-block mt-1 border-2 border-black">{unit}</div>
    </div>
);

export default UserDashboard;