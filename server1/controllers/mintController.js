import { ethers } from 'ethers';
import dotenv from 'dotenv';
import EcoNexus from '../../blockchain/build/contracts/EcoNexus.json' with { type: 'json' };
import { create } from 'ipfs-http-client';
import { Readable } from 'stream';
import FormData from 'form-data';
import axios from 'axios';

dotenv.config();

// 1. CONFIGURATION
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY; 
const RPC_URL = process.env.RPC_URL; 
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

const CONTRACT_ABI = EcoNexus.abi;

// 2. IPFS CLIENT SETUP
const ipfs = PINATA_API_KEY;

// Helper function to upload JSON to IPFS
async function uploadToIPFS(data) {
    try {
        const jsonData = JSON.stringify(data, null, 2);

        const formData = new FormData();
        formData.append("file", Buffer.from(jsonData), {
            filename: `EcoPulse-${Date.now()}.json`,
            contentType: "application/json",
        });

        formData.append(
            "pinataMetadata",
            JSON.stringify({
                name: `EcoPulse-Data-${Date.now()}`,
            })
        );

        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${PINATA_JWT}`,
                },
                maxBodyLength: Infinity,
            }
        );

        const ipfsHash = response.data.IpfsHash;

        console.log("✅ Uploaded to IPFS:", ipfsHash);
        return ipfsHash;

    } catch (err) {
        console.error("IPFS Upload Error:", err.response?.data || err.message);
        throw new Error("IPFS upload failed");
    }
}

const mintReward = async (req, res) => {
    try {
        const { userAddress, signature, message, sensorData } = req.body;

        if (!userAddress || !signature || !message) {
            return res.status(400).json({ error: "Missing verification credentials" });
        }

        if (!sensorData) {
            return res.status(400).json({ error: "Missing sensor data" });
        }

        console.log(`🔐 Verifying signature for: ${userAddress}`);

        // STEP 1: VERIFY SIGNATURE
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
            return res.status(401).json({ error: "Invalid Signature! Identity verification failed." });
        }

        console.log("✅ Signature Verified. Processing gasless transaction...");

        // STEP 2: CREATE RICH METADATA FOR IPFS
        const timestamp = new Date().toISOString();
        
        const metadata = {
            name: `EcoPulse Air Quality Data #${Date.now()}`,
            description: "Real-time environmental data captured by EcoPulse miner node",
            external_url: "https://econexus.eco",
            image: "ipfs://QmPlaceholderImageHash",
            attributes: [
                {
                    trait_type: "PM2.5",
                    value: sensorData.pm25,
                    unit: "µg/m³",
                    display_type: "number"
                },
                {
                    trait_type: "PM10",
                    value: sensorData.pm10,
                    unit: "µg/m³",
                    display_type: "number"
                },
                {
                    trait_type: "NO₂",
                    value: parseFloat(sensorData.no2),
                    unit: "ppb",
                    display_type: "number"
                },
                {
                    trait_type: "CO",
                    value: parseFloat(sensorData.co),
                    unit: "ppm",
                    display_type: "number"
                },
                {
                    trait_type: "O₃",
                    value: parseFloat(sensorData.o3),
                    unit: "ppb",
                    display_type: "number"
                },
                {
                    trait_type: "SO₂",
                    value: parseFloat(sensorData.so2),
                    unit: "ppb",
                    display_type: "number"
                },
                {
                    trait_type: "Temperature",
                    value: sensorData.temperature,
                    unit: "°C",
                    display_type: "number"
                },
                {
                    trait_type: "Humidity",
                    value: sensorData.relativehumidity,
                    unit: "%",
                    display_type: "number"
                },
                {
                    trait_type: "Location",
                    value: sensorData.location || "Unknown",
                    display_type: "string"
                },
                {
                    trait_type: "Latitude",
                    value: sensorData.lat || 0,
                    display_type: "number"
                },
                {
                    trait_type: "Longitude",
                    value: sensorData.lon || 0,
                    display_type: "number"
                },
                {
                    trait_type: "Timestamp",
                    value: timestamp,
                    display_type: "date"
                },
                {
                    trait_type: "Data Confidence",
                    value: "Verified",
                    display_type: "string"
                }
            ],
            properties: {
                version: "1.0.0",
                source: "Open-Meteo API",
                network: "Polygon Amoy",
                raw_data: sensorData
            }
        };

        // STEP 3: UPLOAD METADATA TO IPFS
        console.log("📦 Preparing metadata for IPFS...");
        const ipfsHash = await uploadToIPFS(metadata);
        const tokenURI = `ipfs://${ipfsHash}`;
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        
        console.log(`📝 Metadata stored at: ${gatewayUrl}`);

        // STEP 4: SETUP BLOCKCHAIN CONNECTION
        console.log("⛓️ Connecting to blockchain...");
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        // DEBUG: Log all available functions in the contract
        console.log("📋 Available contract functions:");
        const functions = CONTRACT_ABI.filter(item => item.type === 'function');
        functions.forEach(f => {
            console.log(`  - ${f.name}(${f.inputs.map(i => i.type).join(', ')})`);
        });

        // Check if submitData exists in the ABI
        const submitDataFunction = functions.find(f => f.name === 'submitData');
        if (!submitDataFunction) {
            throw new Error("submitData function not found in contract ABI!");
        }

        console.log("✅ Found submitData with signature:", 
            `submitData(${submitDataFunction.inputs.map(i => i.type).join(', ')})`);

        // STEP 5: PREPARE PARAMETERS
        const latInt = Math.floor((sensorData.lat || 22.5726) * 1e6);
        const lonInt = Math.floor((sensorData.lon || 88.3639) * 1e6);
        const aqi = Math.floor(sensorData.pm25 || 100);

        console.log("⛏️ Minting to blockchain with params:", {
            user: userAddress,
            lat: latInt,
            lon: lonInt,
            aqi: aqi,
            tokenURI: tokenURI.substring(0, 30) + "..."
        });

        // STEP 6: SEND TRANSACTION
        const tx = await contract.submitData(
            userAddress,
            latInt,
            lonInt,
            aqi,
            tokenURI
        );

        console.log(`🚀 Tx Sent: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait(1);
        console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
        
        // Parse events to get token ID
        let tokenId = "Unknown";
        if (receipt.logs && receipt.logs.length > 0) {
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog && parsedLog.name === 'DataMinted') {
                        tokenId = parsedLog.args.tokenId.toString();
                        console.log("🎨 Minted Token ID:", tokenId);
                        break;
                    }
                } catch (e) {
                    // Not all logs are from our contract
                }
            }
        }

        // STEP 7: SUCCESS
        res.json({
            success: true,
            message: "NFT Minted Successfully!",
            txHash: tx.hash,
            tokenId: tokenId,
            ipfsHash: ipfsHash,
            metadata: {
                url: tokenURI,
                gatewayUrl: gatewayUrl
            },
            explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`,
            openSeaUrl: tokenId !== "Unknown" ? `https://testnets.opensea.io/assets/amoy/${CONTRACT_ADDRESS}/${tokenId}` : undefined
        });

        console.log("✅ Minting complete!");

    } catch (error) {
        console.error("❌ Minting Error:", error);
        
        // Enhanced error logging
        if (error.info) {
            console.error("Error info:", JSON.stringify(error.info, null, 2));
        }
        if (error.reason) {
            console.error("Error reason:", error.reason);
        }
        if (error.error) {
            console.error("Error details:", error.error);
        }
        if (error.transaction) {
            console.error("Transaction data:", error.transaction);
        }
        
        res.status(500).json({ 
            error: "Blockchain Transaction Failed", 
            details: error.message,
            reason: error.reason || error.error?.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getMetadataFromIPFS = async (req, res) => {
    try {
        const { ipfsHash } = req.params;
        
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        const metadata = await response.json();
        
        res.json({
            success: true,
            metadata: metadata
        });
    } catch (error) {
        console.error("Error fetching from IPFS:", error);
        res.status(500).json({ error: "Failed to fetch metadata" });
    }
};

export { mintReward, getMetadataFromIPFS };