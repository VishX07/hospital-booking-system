import mongoose from 'mongoose';

const doctorLeaveSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: 'Doctor',

      required: [true, 'Doctor is required'],
    },

    startDate: {
      type: Date,

      required: [true, 'Start date is required'],
    },

    endDate: {
      type: Date,

      required: [true, 'End date is required'],
    },

    reason: {
      type: String,

      trim: true,

      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
doctorLeaveSchema.index({
  doctorId: 1,
});

doctorLeaveSchema.index({
  startDate: 1,
  endDate: 1,
});

const DoctorLeave = mongoose.model('DoctorLeave', doctorLeaveSchema);

export default DoctorLeave;
