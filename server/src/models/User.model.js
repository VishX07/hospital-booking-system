import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { maxLength } from 'zod';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    phoneNumber: {
      type: String,
      // required: [true, 'Phone number is required'],
      default: null,
      // unique: true,
      trim: true,
      minlength: [10, 'Phone number must be at least 10 characters'],
      maxLength: [10, 'phone number should be 10 characters'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
      default: null,
    },

    profilePicture: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    googleId: {
      type: String,
      default: null,
      sparse: true,
    },

    loginProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
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

// ─── Pre-save Hook ─────────────────────────────────────────────────────────────

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Methods ──────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
