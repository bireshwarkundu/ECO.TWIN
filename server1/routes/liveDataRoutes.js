import express from "express";

import { getRealTimeData } from "../controllers/liveDataController.js";

const router = express.Router();

router.get('/livedata', getRealTimeData);

export default router;