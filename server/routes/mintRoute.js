import express from 'express';
import { mintReward } from '../controllers/mintController.js';

const router = express.Router();

router.post('/mint',mintReward);

export default router;