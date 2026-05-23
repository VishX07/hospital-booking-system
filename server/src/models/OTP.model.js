import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },

    otp: {
      type: String,
      required: [true, 'OTP is required'],
    },

    type: {
      type: String,
      enum: ['signup', 'password_reset'],
      default: 'signup',
    },

    expiresAt: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },

    attempts: {
      type: Number,
      default: 0,
      min: [0, 'Attempts cannot be negative'],
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL — MongoDB auto-deletes expired docs

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
