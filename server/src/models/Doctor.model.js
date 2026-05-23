import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },

    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },

    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },

    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
    },

    bio: {
      type: String,
      default: '',
      trim: true,
    },

    consultationMode: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'both',
    },

    consultationFee: {
      type: Number,
      default: 0,
      required: [true, 'Consultation fee is required'],
      min: [0],
    },

    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0],
      max: [5],
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
    licenseDocument: {
      type: String,
      required: [true, 'Medical license is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

// doctorSchema.index({ userId: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ approvalStatus: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
