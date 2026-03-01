import express from 'express';
import { verifyUserReadings } from '../controllers/verificationController.js';

const router = express.Router();

// Route: POST /verify
router.post('/verify', verifyUserReadings);

export default router;