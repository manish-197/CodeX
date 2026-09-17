import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relation: {
    type: String,
    required: true,
    enum: ['Self', 'Father', 'Mother', 'Grandfather', 'Grandmother', 'Spouse', 'Child', 'Other'],
    default: 'Self',
  },
  age: {
    type: Number,
  },
  dob: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  bloodGroup: {
    type: String,
    default: 'Unknown',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  arogyaId: {
    type: String,
    trim: true,
  },
  abhaId: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  emergencyContact: {
    type: String,
    trim: true,
  },
  medicalHistory: [{
    type: String,
  }],
  // Zero-default vitals per hackathon core rule
  vitals: {
    bp: {
      sys: { type: Number, default: 0 },
      dia: { type: Number, default: 0 },
    },
    heartRate: { type: Number, default: 0 },
    spo2: { type: Number, default: 0 },
    recordedAt: { type: Date, default: null },
  },
}, {
  timestamps: true,
});

export const FamilyMember = mongoose.models.FamilyMember || mongoose.model('FamilyMember', familyMemberSchema);
