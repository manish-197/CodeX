import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male',
  },
  bloodGroup: {
    type: String,
    default: 'Unknown',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  village: {
    type: String,
    trim: true,
    default: 'Gram Panchayat Center',
  },
  abhaId: {
    type: String,
    trim: true,
    default: '',
  },
  arogyaId: {
    type: String,
    trim: true,
    index: true,
  },
  registeredVia: {
    type: String,
    enum: ['kiosk', 'citizen', 'hospital'],
    default: 'kiosk',
  },
  kioskOperatorId: {
    type: String,
    index: true,
  },
  kioskOperatorName: {
    type: String,
  },
  complaint: {
    type: String,
    trim: true,
    default: '',
  },
  medicalHistory: [{
    type: String,
  }],
  vitals: {
    bp: {
      sys: { type: Number, default: 0 },
      dia: { type: Number, default: 0 },
    },
    heartRate: { type: Number, default: 0 },
    spo2: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    recordedAt: { type: Date },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
