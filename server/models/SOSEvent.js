import mongoose from 'mongoose';

const sosEventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  vitalsSnapshot: {
    bp: {
      sys: { type: Number, default: 0 },
      dia: { type: Number, default: 0 },
    },
    heartRate: { type: Number, default: 0 },
    spo2: { type: Number, default: 0 },
  },
  notifiedContacts: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['dispatched', 'aborted', 'resolved'],
    default: 'dispatched',
  },
}, {
  timestamps: true,
});

sosEventSchema.index({ location: '2dsphere' });

export const SOSEvent = mongoose.models.SOSEvent || mongoose.model('SOSEvent', sosEventSchema);
