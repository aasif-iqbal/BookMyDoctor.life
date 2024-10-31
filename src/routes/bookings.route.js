import express from 'express';
import { postBooking } from '../controllers/booking.controller.js';

const router = express();

router.post('/book', postBooking);

export default router;