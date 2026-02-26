const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urban_twin_neo';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected to', mongoURI))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Urban Twin Backend API Running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
