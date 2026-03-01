import React, { useState, useEffect } from 'react';
import { Wallet, Activity, MapPin, Database, Server, Cpu, CheckCircle, Clock, Wind, AlertTriangle, Thermometer, ShieldCheck, Droplets, Zap, ExternalLink, RefreshCw, History, Image, FileText } from 'lucide-react';
import { getCalibratedAirData } from '../utils/fetchEnvironmentalData.js';
import { ethers } from 'ethers';

// Import contract ABI
import EcoNexusABI from '../../../blockchain/build/contracts/EcoNexus.json' with { type: 'json' };

const UserDashboard = () => {
    const [balance, setBalance] = useState(0);
    const [isMining, setIsMining] = useState(false);
    const [logs, setLogs] = useState([]);
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [chainId, setChainId] = useState(null);
    
    // Blockchain states
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    
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
    
    // History States
    const [userTokenIds, setUserTokenIds] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedTokenMetadata, setSelectedTokenMetadata] = useState(null);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

    // Contract configuration
    const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x2af355903755f17611C900e817a4a681E6883016";
    
    // Pinata gateway URL
    const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

    // Initialize provider and contract when wallet connects
    useEffect(() => {
        if (walletAddress && window.ethereum) {
            const setupBlockchain = async () => {
                try {
                    const web3Provider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(web3Provider);
                    
                    const signer = await web3Provider.getSigner();
                    const ecoContract = new ethers.Contract(CONTRACT_ADDRESS, EcoNexusABI.abi, signer);
                    setContract(ecoContract);
                    
                    // Fetch contract data
                    await fetchContractData(ecoContract, walletAddress);
                    await fetchUserHistory(ecoContract, walletAddress);
                    
                    setLogs(prev => [...prev, "> ✅ Blockchain connection established"]);
                } catch (error) {
                    console.error("Blockchain setup error:", error);
                    setLogs(prev => [...prev, "> ❌ Failed to connect to blockchain"]);
                }
            };
            
            setupBlockchain();
        }
    }, [walletAddress]);

    // Fetch all contract data
    const fetchContractData = async (contractInstance, address) => {
        if (!contractInstance || !address) return;
        
        try {
            setIsLoadingBalance(true);
            
            // Fetch ECO balance
            const balanceWei = await contractInstance.ecoBalance(address);
            const balanceEco = Number(balanceWei.toString());
            setBalance(balanceEco);
            
            setLogs(prev => [...prev, 
                `> 💰 ECO Balance: ${balanceEco} ECO`,
            ]);
        } catch (error) {
            console.error("Error fetching contract data:", error);
        } finally {
            setIsLoadingBalance(false);
        }
    };

    // Fetch user's token IDs history
    const fetchUserHistory = async (contractInstance, address) => {
        if (!contractInstance || !address) return;
        
        try {
            setIsLoadingHistory(true);
            
            // Get user's token IDs from contract
            const tokenIds = await contractInstance.getUserTokenIds(address);
            
            // Convert BigInt to Number
            const ids = tokenIds.map(id => Number(id.toString()));
            setUserTokenIds(ids);
            
            setLogs(prev => [...prev, 
                `> 📜 Found ${ids.length} contributions in history`,
            ]);
        } catch (error) {
            console.error("Error fetching user history:", error);
            setLogs(prev => [...prev, "> ❌ Failed to fetch contribution history"]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // NEW: Fetch token metadata from Pinata IPFS
    const fetchTokenMetadata = async (tokenId) => {
        if (!contract) return;
        
        try {
            setIsLoadingMetadata(true);
            setSelectedTokenMetadata(null);
            
            // Get token URI from contract
            const tokenURI = await contract.tokenURI(tokenId);
            console.log("Token URI:", tokenURI);
            
            // Extract IPFS hash from URI (handles both ipfs:// and https:// formats)
            let ipfsHash = tokenURI;
            if (tokenURI.startsWith('ipfs://')) {
                ipfsHash = tokenURI.replace('ipfs://', '');
            } else if (tokenURI.includes('/ipfs/')) {
                // Handle case where it might already be a gateway URL
                ipfsHash = tokenURI.split('/ipfs/')[1];
            }
            
            // Create Pinata gateway URL
            const gatewayUrl = `${PINATA_GATEWAY}${ipfsHash}`;
            
            // Fetch metadata from Pinata
            const response = await fetch(gatewayUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch metadata: ${response.status}`);
            }
            
            const metadata = await response.json();
            
            setSelectedTokenMetadata({
                tokenId,
                tokenURI,
                ipfsHash,
                gatewayUrl,
                metadata
            });
            
            setLogs(prev => [...prev, `> 🔍 Loaded metadata for Token #${tokenId} from Pinata`]);
        } catch (error) {
            console.error("Error fetching token metadata:", error);
            setLogs(prev => [...prev, `> ❌ Failed to fetch metadata for Token #${tokenId}`]);
        } finally {
            setIsLoadingMetadata(false);
        }
    };

    // Helper function to get Pinata gateway URL
    const getPinataUrl = (ipfsHash) => {
        return `${PINATA_GATEWAY}${ipfsHash}`;
    };

    // Refresh data manually
    const refreshData = async () => {
        if (contract && walletAddress) {
            await fetchContractData(contract, walletAddress);
            await fetchUserHistory(contract, walletAddress);
        }
    };

    // 1. Wallet Connection
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed!");
            window.open("https://metamask.io/download/", "_blank");
            return;
        }

        try {
            setIsConnecting(true);

            let accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            if (!accounts || accounts.length === 0) {
                setLogs(prev => [...prev, "> 🔄 Opening MetaMask... Select an account"]);
                accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
            }

            if (!accounts || accounts.length === 0) {
                throw new Error("No account selected");
            }

            const selectedAccount = accounts[0];
            setWalletAddress(selectedAccount);

            setLogs(prev => [
                ...prev,
                `> ✅ Connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`
            ]);

            const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
            const chainId = parseInt(chainIdHex, 16);
            setChainId(chainId);

            const networks = {
                1: "Ethereum Mainnet",
                137: "Polygon Mainnet",
                80001: "Polygon Mumbai",
                11155111: "Sepolia",
                1337 : "Ganache",
            };

            setLogs(prev => [
                ...prev,
                `> 🌐 Network: ${networks[chainId] || "Unknown"} (${chainId})`
            ]);

            if (chainId !== 80001 && chainId !== 137 && chainId !== 1337 && chainId !== 5777) {
                setLogs(prev => [...prev, "> ⚠️ Please switch to Polygon or local network"]);
            }

        } catch (error) {
            handleWalletError(error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleWalletError = (error) => {
        if (error.code === 4001) {
            setLogs(prev => [...prev, "> ❌ User rejected connection"]);
        } else if (error.code === -32002) {
            setLogs(prev => [...prev, "> ⏳ MetaMask request already pending"]);
        } else {
            console.error(error);
            setLogs(prev => [...prev, `> ❌ ${error.message}`]);
        }
    };

    // Account and network change listeners
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = async (accounts) => {
                if (accounts.length === 0) {
                    setWalletAddress('');
                    setBalance(0);
                    setContract(null);
                    setProvider(null);
                    setUserTokenIds([]);
                    setSelectedTokenMetadata(null);
                    setLogs(prev => [...prev, "> 🔒 Wallet disconnected"]);
                } else if (accounts[0] !== walletAddress) {
                    setWalletAddress(accounts[0]);
                    setLogs(prev => [...prev, `> 🔄 Switched to: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`]);
                    
                    if (contract) {
                        await fetchContractData(contract, accounts[0]);
                        await fetchUserHistory(contract, accounts[0]);
                    }
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
                else if (networkId === 1337) networkName = 'Ganache';
                else if (networkId === 5777) networkName = 'Ganache CLI';
                
                setLogs(prev => [...prev, `> 🔄 Network changed to: ${networkName} (${networkId})`]);
                
                if (walletAddress) {
                    window.location.reload();
                }
            };
            
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [walletAddress, contract]);

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

    // Switch network
    const switchToPolygon = async () => {
        if (!window.ethereum) return;
        
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x13881' }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x13881',
                            chainName: 'Polygon Mumbai',
                            nativeCurrency: {
                                name: 'MATIC',
                                symbol: 'MATIC',
                                decimals: 18
                            },
                            rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                            blockExplorerUrls: ['https://mumbai.polygonscan.com/']
                        }],
                    });
                } catch (addError) {
                    console.error("Failed to add network:", addError);
                }
            }
            console.error("Failed to switch network:", switchError);
        }
    };

    // 2. Fetch Data
    const toggleMining = async () => {
        if (isMining) {
            resetSession();
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

                const data = await getCalibratedAirData(lat, lon);
                
                if (data) {
                    setSensorData(data);
                    setLogs(prev => [...prev, "> ✅ Data Packets Received!", `> PM2.5: ${data.pm25} µg/m³`, `> Temperature: ${data.temperature}°C`]);
                } else {
                    setLogs(prev => [...prev, "> ⚠️ Sensor Connection Failed."]);
                    setIsMining(false);
                }
            },
            handleGeoError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleGeoError = (err) => {
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
    };

    const resetSession = () => {
        setIsMining(false);
        setSensorData(null);
        setLocation(null);
        setVerificationResult(null);
        setDeviation(null);
        setMintResult(null);
        setSignature(null);
        setLogs(prev => [...prev, "> Session Terminated."]);
    };

    // 3. Verify Data
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
                    userReadings: sensorData
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

    // 4. Mint NFT
    const handleMint = async () => {
        if (!sensorData || !location || !walletAddress) {
            alert("Please connect wallet and verify data first");
            return;
        }

        setIsMinting(true);
        setLogs(prev => [...prev, "> 🔏 Requesting signature from MetaMask..."]);

        try {
            const timestamp = Date.now();
            const message = `Mint EcoPulse NFT\nLocation: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}\nPM2.5: ${sensorData.pm25}\nTimestamp: ${timestamp}`;
            
            setLogs(prev => [...prev, "> ✍️ Please sign the message in MetaMask..."]);
            const sig = await signMessage(message);
            setSignature(sig);
            
            setLogs(prev => [...prev, "> ✅ Signature obtained", "> ⛓️ Submitting to blockchain relayer..."]);

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

            const response = await fetch('http://localhost:3000/api/user/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mintData)
            });

            const result = await response.json();

            if (result.success) {
                setMintResult(result);
                
                // Refresh balance and history from blockchain
                if (contract) {
                    await fetchContractData(contract, walletAddress);
                    await fetchUserHistory(contract, walletAddress);
                }
                
                setLogs(prev => [...prev, 
                    `> ✅ MINT SUCCESSFUL!`,
                    `> Token ID: ${result.tokenId || 'Unknown'}`,
                    `> Tx Hash: ${result.txHash ? result.txHash.substring(0, 10) + '...' + result.txHash.substring(58) : 'Unknown'}`,
                    `> 💰 +10 ECO Added to Balance!`,
                ]);
                
                if (result.explorerUrl) {
                    setLogs(prev => [...prev, `> 🔗 View: ${result.explorerUrl}`]);
                }
                
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

    // Auto-scroll logs
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
                        {isLoadingBalance ? "Loading..." : `${balance} ECO`}
                        {walletAddress && (
                            <button 
                                onClick={refreshData}
                                className="ml-2 hover:bg-gray-100 p-1 rounded"
                                title="Refresh Data"
                            >
                                <RefreshCw size={14} />
                            </button>
                        )}
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
                        {walletAddress && chainId && chainId !== 80001 && chainId !== 137 && chainId !== 1337 && chainId !== 5777 && (
                            <div className="bg-yellow-400 border-4 border-black p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                                <AlertTriangle size={20} />
                                <span className="font-bold">Switch to Polygon or local network</span>
                                <button 
                                    onClick={switchToPolygon}
                                    className="ml-auto bg-black text-white px-2 py-1 text-xs font-bold hover:bg-gray-800"
                                >
                                    SWITCH
                                </button>
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

                        {/* STEP 2: VERIFY DATA */}
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

                        {/* STEP 3: MINT REWARD */}
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
                                    onClick={resetSession}
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
                                    onClick={resetSession} 
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

                {/* CONTRIBUTION HISTORY SECTION - UPDATED FOR PINATA */}
                {walletAddress && (
                    <div className="mb-12">
                        <h3 className="text-3xl font-black mb-6 uppercase inline-flex items-center gap-3 bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <History size={28} /> MY CONTRIBUTION HISTORY
                            {!isLoadingHistory && (
                                <span className="text-sm bg-black text-white px-2 py-1 ml-4">
                                    Total: {userTokenIds.length} NFTs
                                </span>
                            )}
                        </h3>

                        {/* Token IDs Grid */}
                        {isLoadingHistory ? (
                            <div className="bg-white border-4 border-black p-8 text-center">
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="w-12 h-12 bg-gray-300 border-2 border-black mb-4"></div>
                                    <p className="font-bold">Loading contribution history...</p>
                                </div>
                            </div>
                        ) : userTokenIds.length === 0 ? (
                            <div className="bg-white border-4 border-black p-8 text-center">
                                <Image size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-xl font-bold mb-2">No contributions yet</p>
                                <p className="text-gray-600">Start mining to create your first NFT!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {userTokenIds.map((tokenId) => (
                                    <button
                                        key={tokenId}
                                        onClick={() => fetchTokenMetadata(tokenId)}
                                        className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group text-left"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-xl bg-black text-white px-2 py-1">
                                                #{tokenId}
                                            </span>
                                            <FileText size={16} className="text-gray-400 group-hover:text-[#00FF66] transition-colors" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-500">Click to view</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected Token Metadata Display - UPDATED FOR PINATA */}
                        {selectedTokenMetadata && (
                            <div className="mt-8 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-2xl font-black flex items-center gap-2">
                                        <Database size={24} />
                                        Token #{selectedTokenMetadata.tokenId} Details
                                    </h4>
                                    <button
                                        onClick={() => setSelectedTokenMetadata(null)}
                                        className="bg-[#FF3366] text-white border-2 border-black px-3 py-1 font-bold hover:bg-[#E62E5C] transition-colors"
                                    >
                                        CLOSE
                                    </button>
                                </div>

                                {isLoadingMetadata ? (
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-300 border-2 border-black w-3/4 mb-4"></div>
                                        <div className="h-4 bg-gray-300 border-2 border-black w-1/2 mb-4"></div>
                                        <div className="h-4 bg-gray-300 border-2 border-black w-2/3"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column - Basic Info */}
                                        <div>
                                            <h5 className="font-bold text-lg mb-2 border-b-2 border-black pb-1">Basic Info</h5>
                                            <p className="mb-2">
                                                <span className="font-bold">Name:</span> {selectedTokenMetadata.metadata.name}
                                            </p>
                                            <p className="mb-2">
                                                <span className="font-bold">Description:</span> {selectedTokenMetadata.metadata.description}
                                            </p>
                                            <p className="mb-2">
                                                <span className="font-bold">IPFS Hash:</span>{' '}
                                                <span className="font-mono text-sm">{selectedTokenMetadata.ipfsHash}</span>
                                            </p>
                                            <p className="mb-2">
                                                <span className="font-bold">Metadata URL:</span>{' '}
                                                <a 
                                                    href={selectedTokenMetadata.gatewayUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#0055FF] underline hover:text-[#0044CC] inline-flex items-center gap-1"
                                                >
                                                    View on Pinata <ExternalLink size={12} />
                                                </a>
                                            </p>
                                        </div>

                                        {/* Right Column - Attributes */}
                                        <div>
                                            <h5 className="font-bold text-lg mb-2 border-b-2 border-black pb-1">Environmental Data</h5>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedTokenMetadata.metadata.attributes && selectedTokenMetadata.metadata.attributes.map((attr, index) => (
                                                    <div key={index} className="bg-[#F4F4F0] border-2 border-black p-2">
                                                        <p className="text-xs font-bold text-gray-600">{attr.trait_type}</p>
                                                        <p className="font-black">{attr.value} {attr.unit || ''}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* External Links */}
                                <div className="flex gap-3 mt-6 pt-4 border-t-2 border-black">
                                    <a
                                        href={`https://testnets.opensea.io/assets/amoy/${CONTRACT_ADDRESS}/${selectedTokenMetadata.tokenId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#7B61FF] text-white border-2 border-black px-4 py-2 font-bold hover:bg-[#6a4df4] transition-colors inline-flex items-center gap-2"
                                    >
                                        View on OpenSea <ExternalLink size={14} />
                                    </a>
                                    <a
                                        href={`https://amoy.polygonscan.com/token/${CONTRACT_ADDRESS}?a=${selectedTokenMetadata.tokenId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white border-2 border-black px-4 py-2 font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                                    >
                                        View on Explorer <ExternalLink size={14} />
                                    </a>
                                    <a
                                        href={selectedTokenMetadata?.gatewayUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#00FF66] border-2 border-black px-4 py-2 font-bold hover:bg-[#00E65C] transition-colors inline-flex items-center gap-2"
                                    >
                                        View on Pinata <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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