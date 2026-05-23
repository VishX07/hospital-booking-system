import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },

    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },

    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },

    consultationType: {
      type: String,
      enum: ['online', 'offline'],
      required: [true, 'Consultation type is required'],
    },

    reasonForVisit: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true,
    },

    amount: {
      type: Number,
      default: 0,
      min: [0, 'Amount cannot be negative'],
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },

    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: null,
    },

    cancelReason: {
      type: String,
      default: '',
      trim: true,
    },
    isRescheduled: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent double booking
appointmentSchema.index({
  doctorId: 1,
  appointmentDate: 1,
  timeSlot: 1,
});

appointmentSchema.index({
  patientId: 1,
});

appointmentSchema.index({
  appointmentDate: 1,
  doctorId: 1,
});

appointmentSchema.index({
  status: 1,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
