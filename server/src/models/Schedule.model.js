import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },

    dayOfWeek: {
      type: String,
      enum: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
      required: [true, 'Day of week is required'],
    },

    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },

    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },

    slotDuration: {
      type: Number,
      default: 30,
      min: [5, 'Slot duration must be at least 5 minutes'],
    },

    breakStart: {
      type: String,
      default: '',
    },

    breakEnd: {
      type: String,
      default: '',
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

scheduleSchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });
scheduleSchema.index({ isAvailable: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;
