import express from 'express';

import { getSlots, getAvailableSlots } from '../controllers/slot.controller.js';

const router = express();

router.get('/slots', getSlots);
router.get('/slots/:date', getAvailableSlots);

export default router;