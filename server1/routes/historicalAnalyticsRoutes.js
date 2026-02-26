import express from 'express';
import { 
    getMonthlyTrends, 
    getHourlyPatterns, 
    getDailySummary, 
    getWindCorrelation 
} from '../controllers/historicalAnalyticsController.js';

const router = express.Router();

router.get('/monthly-trends', getMonthlyTrends);
router.get('/hourly-patterns', getHourlyPatterns);
router.get('/daily-summary', getDailySummary);
router.get('/wind-correlation', getWindCorrelation);

export default router;