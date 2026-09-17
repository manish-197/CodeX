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
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  resetPasswordAttempts: {
    type: Number,
    default: 0,
  },
  lastResetRequestAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['citizen', 'kiosk_operator'],
    default: 'citizen',
  },
  arogyaId: {
    type: String,
    trim: true,
    index: true,
    // Expected sequential series: AR-2026-00001, AR-2026-00002, etc.
  },
  abhaId: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  bloodGroup: {
    type: String,
    default: 'Unknown',
  },
  pincode: {
    type: String,
    trim: true,
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relation: { type: String, trim: true },
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
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
