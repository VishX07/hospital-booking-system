import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
      trim: true,
    },

    frequency: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: 'Appointment',

      required: [true, 'Appointment is required'],

      unique: true,
    },

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

    diagnosis: {
      type: String,

      required: [true, 'Diagnosis is required'],

      trim: true,
    },

    medicines: [medicineSchema],

    notes: {
      type: String,

      default: '',

      trim: true,
    },

    followUpDate: {
      type: Date,

      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
prescriptionSchema.index({
  patientId: 1,
});

prescriptionSchema.index({
  doctorId: 1,
});

// prescriptionSchema.index({
//   appointmentId: 1,
// });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
