import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['citizen', 'kiosk_operator'],
    default: 'citizen',
  },
  abhaId: {
    type: String,
    trim: true,
    // Expected format: XX-XXXX-XXXX-XXXX
  },
  kioskId: {
    type: String,
    trim: true,
  },
  village: {
    type: String,
    trim: true,
  },
  district: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  preferredLanguage: {
    type: String,
    default: 'en',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [73.8567, 18.5204], // [longitude, latitude]
    },
  },
  familyMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
  }],
}, {
  timestamps: true,
});

// 2dsphere index for geospatial queries
userSchema.index({ location: '2dsphere' });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
