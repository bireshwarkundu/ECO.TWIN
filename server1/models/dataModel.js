import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const constantsPath = path.join(__dirname, '../constants');

const dataStore = {};

// 1. Load All JSON Files
try {
    if (fs.existsSync(constantsPath)) {
        const files = fs.readdirSync(constantsPath).filter(f => f.endsWith('.json'));
        
        files.forEach(file => {
            const paramName = file.replace('.json', ''); // e.g. "co", "pm25"
            const filePath = path.join(constantsPath, file);
            const raw = fs.readFileSync(filePath, 'utf-8');
            dataStore[paramName] = JSON.parse(raw);
            console.log(`✅ Loaded ${paramName}: ${dataStore[paramName].length} records`);
        });
    }
} catch (error) {
    console.error("❌ Error loading constants:", error.message);
}

// 2. Helper to get raw list
export const getParameterData = (param) => {
    return dataStore[param] || [];
};

// 3. ROBUST MERGE FUNCTION (Adapted for your JSON)
// Combines separate files (co.json, pm25.json) into one object per timestamp
export const getMergedData = (paramsNeeded) => {
    // We create a Map to align everything by time
    // Key: "2025-02-19 01:45:00+05:30", Value: { timestamp: "...", co: 0.15, pm25: 35 }
    const mergedMap = new Map();

    paramsNeeded.forEach(param => {
        const list = dataStore[param] || [];
        
        list.forEach(item => {
            // FIX 1: Use the "datetime" field from your JSON
            const timeKey = item.datetime; 
            
            // FIX 2: Parse string value "0.15" to float 0.15
            const val = parseFloat(item.value);

            if (!mergedMap.has(timeKey)) {
                mergedMap.set(timeKey, { timestamp: timeKey });
            }

            const entry = mergedMap.get(timeKey);
            entry[param] = val; // Add { co: 0.15 } to the object
        });
    });

    // Convert Map back to Array and Sort by Date
    return Array.from(mergedMap.values()).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );
};