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
    enum: ['ai_triage', 'ocr_scan', 'symptom_checklist', 'kiosk_desk', 'kiosk_operator'],
    default: 'symptom_checklist',
  },
  durationDays: {
    type: Number,
    default: 2,
  },
  homeRemedies: [{
    type: String,
  }],
  ayurvedicRemedies: [{
    type: String,
  }],
  patientDetails: {
    name: { type: String, default: 'Patient' },
    age: { type: Number, default: 42 },
    gender: { type: String, default: 'Unspecified' },
    bloodGroup: { type: String, default: 'Unknown' },
    abhaId: { type: String, default: '14-2026-9812-4456' },
    arogyaId: { type: String, default: 'AR-2026-00001' },
    phone: { type: String, default: '' },
    village: { type: String, default: '' },
    relation: { type: String, default: 'Self' },
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
