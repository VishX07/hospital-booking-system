import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment is required'],
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['mock', 'razorpay', 'upi', 'card', 'netbanking'],
      default: 'mock',
    },

    transactionId: {
      type: String,
      default: '',
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ patientId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
