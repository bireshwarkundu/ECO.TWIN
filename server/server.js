import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Routes Import
import historicalAnalyticsRoutes from './routes/historicalAnalyticsRoutes.js';
import liveDataRoutes from "./routes/liveDataRoutes.js";
import userRoutes from './routes/userRoute.js';
import verifyRoute from './routes/verifyRoute.js';
import mintRoute from "./routes/mintRoute.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mount the routes
app.use('/api/histanalytics', historicalAnalyticsRoutes);
app.use('/api/realtime',liveDataRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user', verifyRoute);
app.use('/api/user', mintRoute);



app.listen(PORT, () => {
    console.log(`Server running on PORT:${PORT}`);
});