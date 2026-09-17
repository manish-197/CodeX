import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  familyMemberId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  extractedSummary: {
    type: String,
  },
  medicines: [{
    medicineName: { type: String, required: true },
    dosage: { type: String, default: '1 tablet' },
    schedule: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      night: { type: Boolean, default: false },
    },
    timing: { type: String, default: 'After food / जेवणानंतर' },
    durationDays: { type: Number, default: 5 },
  }],
  audioExplanationText: {
    type: String,
  },
}, {
  timestamps: true,
});

export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
