import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  familyMemberId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    index: true,
  },
  createdBy: {
    type: String,
    enum: ['ai_triage', 'ocr_scan'],
    default: 'ai_triage',
  },
  patientDetails: {
    name: { type: String, default: 'Patient' },
    age: { type: Number, default: 42 },
    gender: { type: String, default: 'Unspecified' },
    bloodGroup: { type: String, default: 'Unknown' },
    abhaId: { type: String, default: '14-2026-9812-4456' },
  },
  medicines: [{
    name: { type: String, required: true },
    category: { type: String, default: 'General OTC' },
    instructions: { type: String, default: 'Consult doctor or pharmacist' },
    timing: { type: String, default: 'As advised' },
  }],
  diagnosisSummary: {
    type: String,
    default: 'Clinical Assessment',
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
    default: 'LOW',
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pharmacist_verified', 'doctor_verified'],
    default: 'unverified',
  },
  verifiedBy: {
    type: String,
  },
  verifiedAt: {
    type: Date,
  },
  pdfUrl: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  audioExplanationText: {
    type: String,
  },
}, {
  timestamps: true,
});

export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
