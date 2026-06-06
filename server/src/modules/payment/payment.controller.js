import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../../models/Payment.model.js';
import Appointment from '../../models/Appointment.model.js';
import Doctor from '../../models/Doctor.model.js'; // ← fix path to match yours
import { bookAppointmentService } from '../appointment/appointment.service.js'; // ← adjust this path too

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ─── Create Razorpay Order ── */
export const createPaymentOrder = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId is required' });
    }

    const doctor = await Doctor.findById(doctorId).select('consultationFee');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const amount = doctor.consultationFee; // paise

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('createPaymentOrder error:', err);
    return res.status(500).json({ message: 'Failed to create payment order' });
  }
};

/* ─── Verify Payment + Create Appointment ── */
export const verifyPaymentAndBook = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentData,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Create appointment via existing service
    const result = await bookAppointmentService(req.user._id, appointmentData);
    const appointment = result.appointment;

    // Create payment record
    await Payment.create({
      appointmentId: appointment._id,
      patientId: req.user._id,
      amount: appointment.amount,
      status: 'paid',
      paymentMethod: 'razorpay',
      transactionId: razorpay_payment_id,
      paidAt: new Date(),
    });

    // Mark appointment paid
    await Appointment.findByIdAndUpdate(appointment._id, {
      paymentStatus: 'paid',
    });

    return res.status(201).json({
      success: true,
      message: 'Payment verified and appointment booked',
      appointment,
    });
  } catch (err) {
    console.error('verifyPaymentAndBook error:', err);
    return res.status(500).json({
      message: err.message || 'Failed to verify payment',
    });
  }
};
/* ─── Book Appointment Without Payment (Pay at Clinic) ── */
export const bookWithoutPayment = async (req, res) => {
  try {
    const { appointmentData } = req.body;

    // Only allow offline consultations to skip payment
    if (appointmentData.consultationType !== 'offline') {
      return res.status(400).json({
        message: 'Online consultations require advance payment',
      });
    }

    const result = await bookAppointmentService(req.user._id, appointmentData);
    const appointment = result.appointment;

    // Create payment record as pending
    await Payment.create({
      appointmentId: appointment._id,
      patientId: req.user._id,
      amount: appointment.amount,
      status: 'pending',
      paymentMethod: 'mock',
      transactionId: '',
      paidAt: null,
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked. Please pay at the clinic.',
      appointment,
    });
  } catch (err) {
    console.error('bookWithoutPayment error:', err);
    return res.status(500).json({
      message: err.message || 'Failed to book appointment',
    });
  }
};
