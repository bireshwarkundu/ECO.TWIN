import express from 'express';
import cors from 'cors';
import historicalAnalyticsRoutes from './routes/historicalAnalyticsRoutes.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mount the routes
app.use('/api/histanalytics', historicalAnalyticsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on PORT:${PORT}`);
});