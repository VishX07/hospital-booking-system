import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: 'User',

      required: true,
    },

    title: {
      type: String,

      required: true,

      trim: true,
    },

    message: {
      type: String,

      required: true,

      trim: true,
    },

    type: {
      type: String,

      enum: ['appointment', 'approval', 'system', 'payment'],

      default: 'system',
    },

    isRead: {
      type: Boolean,

      default: false,
    },

    metadata: {
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'Appointment',
      },

      doctorId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'Doctor',
      },
    },
  },
  {
    timestamps: true,
  },
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
