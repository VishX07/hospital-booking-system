import express from 'express';
import {
  bookWithoutPayment,
  createPaymentOrder,
  verifyPaymentAndBook,
} from './payment.controller.js';
import protect from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPaymentAndBook);
router.post('/book-offline', protect, bookWithoutPayment);

export default router;
