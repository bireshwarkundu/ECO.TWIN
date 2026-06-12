import express from 'express';
import { getAirQuality } from '../controllers/userController.js';

const app = express();

app.get('/air-quality', getAirQuality);

export default app;