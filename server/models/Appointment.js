import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true
    },
    arogyaId: {
      type: String,
      default: ''
    },
    abhaId: {
      type: String,
      default: ''
    },
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      default: 0
    },
    gender: {
      type: String,
      default: 'Other'
    },
    bloodGroup: {
      type: String,
      default: 'Unknown'
    },
    phone: {
      type: String,
      default: ''
    },
    village: {
      type: String,
      default: ''
    },
    doctorId: {
      type: String,
      required: true
    },
    doctorName: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      default: 'Emergency Specialist'
    },
    hospitalName: {
      type: String,
      required: true
    },
    hospitalId: {
      type: String,
      default: ''
    },
    kioskOperatorId: {
      type: String,
      default: ''
    },
    kioskOperatorName: {
      type: String,
      default: 'Kiosk Operator'
    },
    tokenNo: {
      type: String,
      required: true,
      unique: true
    },
    requestedTime: {
      type: String,
      default: 'Within 15 minutes (Emergency Priority Lane)'
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled'],
      default: 'requested'
    },
    triageSummary: {
      type: String,
      default: ''
    },
    riskLevel: {
      type: String,
      enum: ['CRITICAL', 'MODERATE', 'LOW', 'NONE'],
      default: 'CRITICAL'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index({ createdAt: -1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
