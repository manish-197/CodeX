import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['District Hospital', 'Sub-District Hospital', 'Community Health Centre (CHC)', 'Primary Health Centre (PHC)'],
    default: 'Primary Health Centre (PHC)',
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
  address: {
    type: String,
  },
  district: {
    type: String,
  },
  state: {
    type: String,
  },
  phone: {
    type: String,
    default: '108',
  },
  specialties: [{
    type: String,
  }],
  emergencyAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

hospitalSchema.index({ location: '2dsphere' });

export const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
