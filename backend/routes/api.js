const express = require('express');
const axios = require('axios');
const HistoricalData = require('../models/HistoricalData');

const router = express.Router();

// GET /api/live-data
router.get('/live-data', async (req, res) => {
    try {
        // OpenAQ API sample (fetching PM2.5 data for a city)
        // Using a simple public URL. Sometimes OpenAQ has rate limits or changes v2 endpoints.
        // So we add a fallback just in case it fails.
        let location = "Sector V";
        let parameter = "PM2.5";
        let value = Math.floor(Math.random() * 50) + 10;
        let unit = "µg/m³";
        let lastUpdated = new Date().toISOString();

        try {
            const response = await axios.get('https://api.openaq.org/v2/latest?city=London&parameter=pm25&limit=1', { timeout: 3000 });
            if (response.data && response.data.results && response.data.results.length > 0) {
                const record = response.data.results[0];
                const detail = record.measurements[0];
                location = record.city || location;
                parameter = detail.parameter || parameter;
                value = detail.value || value;
                unit = detail.unit || unit;
                lastUpdated = detail.lastUpdated || lastUpdated;
            }
        } catch (apiErr) {
            console.warn('OpenAQ API failed or timeout, using simulated data.', apiErr.message);
        }

        return res.json({
            success: true,
            data: {
                location,
                parameter,
                value,
                unit,
                lastUpdated
            }
        });

    } catch (error) {
        console.error("Live Data Error:", error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch live data' });
    }
});

// POST /api/history
router.post('/history', async (req, res) => {
    try {
        let { data } = req.body; // Expecting an array of records or a single record
        if (!data) {
            return res.status(400).json({ success: false, error: 'No data provided' });
        }
        if (!Array.isArray(data)) {
            data = [data]; // wrap in array if it's a single object
        }

        // Insert many
        const result = await HistoricalData.insertMany(data);
        res.status(201).json({ success: true, count: result.length, data: result });
    } catch (error) {
        console.error("History Save Error:", error.message);
        res.status(500).json({ success: false, error: 'Failed to save historical data' });
    }
});

// GET /api/history
router.get('/history', async (req, res) => {
    try {
        const history = await HistoricalData.find().sort({ timestamp: -1 }).limit(100);
        res.json({ success: true, count: history.length, data: history });
    } catch (error) {
        console.error("History Fetch Error:", error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch historical data' });
    }
});

module.exports = router;
