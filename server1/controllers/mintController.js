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
const PINATA_JWT = process.env.PINATA_JWT; // Alternative to API Key/Secret

const CONTRACT_ABI = EcoNexus.abi;

// 2. IPFS CLIENT SETUP (Choose one method)

// Method A: Using Pinata (Recommended for production)
const pinataClient = (() => {
    if (PINATA_JWT) {
        return create({
            host: 'api.pinata.cloud',
            port: 443,
            protocol: 'https',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            }
        });
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
        return create({
            host: 'api.pinata.cloud',
            port: 443,
            protocol: 'https',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY
            }
        });
    }
    return null;
})();

// Method B: Using public IPFS (For testing only)
const publicIpfsClient = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

// Method C: Using local IPFS node
const localIpfsClient = create({ url: 'http://localhost:5001' });

// Choose which client to use based on available config
const ipfs = PINATA_API_KEY ;

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

// Helper function to upload multiple files (if you have images)
async function uploadImageToIPFS(imageBuffer, fileName) {
    try {
        const result = await ipfs.add(imageBuffer, {
            pin: true,
            'pinataMetadata': {
                name: fileName
            }
        });
        return result.path || result.cid.toString();
    } catch (error) {
        console.error("Image Upload Error:", error);
        throw error;
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
        
        // Create comprehensive metadata
        const metadata = {
            name: `EcoPulse Air Quality Data #${Date.now()}`,
            description: "Real-time environmental data captured by EcoPulse miner node",
            external_url: "https://econexus.eco",
            image: "ipfs://QmPlaceholderImageHash", // You can add a default image or generate dynamically
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
                raw_data: {
                    pm25: sensorData.pm25,
                    pm10: sensorData.pm10,
                    no2: sensorData.no2,
                    co: sensorData.co,
                    o3: sensorData.o3,
                    so2: sensorData.so2,
                    nox: sensorData.nox,
                    temperature: sensorData.temperature,
                    humidity: sensorData.relativehumidity,
                    location: sensorData.location || "Kolkata",
                    coordinates: {
                        lat: sensorData.lat || 22.5726,
                        lon: sensorData.lon || 88.3639
                    }
                },
                collection: {
                    name: "EcoPulse Environmental Data",
                    family: "Environmental NFTs"
                }
            }
        };

        // STEP 3: UPLOAD METADATA TO IPFS
        console.log("📦 Preparing metadata for IPFS...");
        const ipfsHash = await uploadToIPFS(metadata);
        
        // Create the IPFS URI
        const tokenURI = `ipfs://${ipfsHash}`;
        
        // Also create a public gateway URL for easy access
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        
        console.log(`📝 Metadata stored at: ${gatewayUrl}`);

        // STEP 4: SETUP BLOCKCHAIN CONNECTION
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        // STEP 5: SEND TRANSACTION (Backend Pays Gas!)
        console.log("⛏️ Minting to blockchain...");
        
        // IMPORTANT: Your contract needs to have a function like this
        // If you're using the EcoNexus.sol you shared, use submitData() instead
        const tx = await contract.submitData(
            sensorData.lat ? Math.floor(sensorData.lat * 1e6) : 22572600, // Convert to int256
            sensorData.lon ? Math.floor(sensorData.lon * 1e6) : 88363900, // Convert to int256
            Math.floor(sensorData.pm25 || 100), // AQI or PM2.5 value
            tokenURI
        );

        console.log(`🚀 Tx Sent: ${tx.hash}`);

        // Wait for 1 confirmation
        const receipt = await tx.wait(1);
        
        // Get the token ID from the event logs
        const event = receipt.logs.find(
            log => log.topics[0] === contract.interface.getEvent('DataMinted').topicHash
        );
        
        let tokenId = "Unknown";
        if (event) {
            const parsedEvent = contract.interface.parseLog(event);
            tokenId = parsedEvent.args.tokenId.toString();
        }

        // STEP 6: SUCCESS
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
            openSeaUrl: `https://testnets.opensea.io/assets/amoy/${CONTRACT_ADDRESS}/${tokenId}`
        });

        console.log("✅ Minting complete!");

    } catch (error) {
        console.error("❌ Minting Error:", error);
        res.status(500).json({ 
            error: "Blockchain Transaction Failed", 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Optional: Endpoint to retrieve metadata from IPFS
const getMetadataFromIPFS = async (req, res) => {
    try {
        const { ipfsHash } = req.params;
        
        // Fetch from IPFS gateway
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