import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb, generateMemoryId } from '../services/inMemoryStore.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'arogyarakshak_jwt_secret_dev_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// In-memory rate limiter for password reset requests: map of email -> timestamps[]
const resetRateLimitMap = new Map();

// Helper to validate email format
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Generate random ABHA ID in XX-XXXX-XXXX-XXXX format if citizen doesn't have one
export function formatAbhaId(input) {
  if (input && /^(\d{2})-(\d{4})-(\d{4})-(\d{4})$/.test(input)) {
    return input;
  }
  const digits = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
  return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 14)}`;
}

/**
 * User Registration
 * Collects name, email, phone (for SOS/WhatsApp), password, role, etc.
 */
export async function register(req, res) {
  try {
    const { 
      name, 
      email,
      phone, 
      password, 
      role = 'citizen', 
      abhaId, 
      kioskId, 
      village, 
      district, 
      state, 
      preferredLanguage = 'en',
      coordinates
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone number, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address (e.g. name@example.com).' });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number for emergency SOS services.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const finalAbhaId = role === 'citizen' ? formatAbhaId(abhaId) : undefined;
    const userCoords = Array.isArray(coordinates) && coordinates.length === 2 
      ? coordinates 
      : [73.8567, 18.5204];

    let createdUser;

    if (isDbConnected()) {
      // Check for existing user by email or phone
      const existing = await User.findOne({
        $or: [{ email: cleanEmail }, { phone: cleanPhone }],
      });

      if (existing) {
        if (existing.email === cleanEmail) {
          return res.status(400).json({ error: 'An account with this email address is already registered. Please log in.' });
        }
        return res.status(400).json({ error: 'An account with this mobile number is already registered.' });
      }

      createdUser = await User.create({
        name,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role,
        abhaId: finalAbhaId,
        kioskId: role === 'kiosk_operator' ? kioskId : undefined,
        village,
        district,
        state,
        preferredLanguage,
        location: {
          type: 'Point',
          coordinates: userCoords,
        },
      });
    } else {
      // In-memory fallback
      for (const [, user] of memoryDb.users) {
        if (user.email === cleanEmail) {
          return res.status(400).json({ error: 'An account with this email address is already registered. Please log in.' });
        }
        if (user.phone === cleanPhone) {
          return res.status(400).json({ error: 'An account with this mobile number is already registered.' });
        }
      }

      const memId = generateMemoryId();
      createdUser = {
        _id: memId,
        id: memId,
        name,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role,
        abhaId: finalAbhaId,
        kioskId: role === 'kiosk_operator' ? kioskId : undefined,
        village: village || '',
        district: district || '',
        state: state || '',
        preferredLanguage,
        location: {
          type: 'Point',
          coordinates: userCoords,
        },
        familyMembers: [],
        createdAt: new Date(),
      };
      memoryDb.users.set(memId, createdUser);
    }

    const token = jwt.sign(
      { 
        id: createdUser._id || createdUser.id, 
        role: createdUser.role, 
        email: createdUser.email,
        phone: createdUser.phone, 
        name: createdUser.name 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: createdUser._id || createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone,
      role: createdUser.role,
      abhaId: createdUser.abhaId,
      kioskId: createdUser.kioskId,
      village: createdUser.village,
      district: createdUser.district,
      state: createdUser.state,
      preferredLanguage: createdUser.preferredLanguage,
      location: createdUser.location,
    };

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error('[Register Error]', err);
    res.status(500).json({ error: 'Registration failed due to server error.' });
  }
}

/**
 * User Login
 * Authenticates via Email + Password (Section 3)
 */
export async function login(req, res) {
  try {
    const { email, phone, password } = req.body;

    // Login identifier: email is primary (fallback to phone if provided)
    const identifier = email || phone;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email address and password are required.' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim().replace(/\D/g, '') : null;

    let foundUser;

    if (isDbConnected()) {
      if (cleanEmail) {
        foundUser = await User.findOne({ email: cleanEmail });
      } else if (cleanPhone) {
        foundUser = await User.findOne({ phone: cleanPhone });
      }
    } else {
      for (const [, user] of memoryDb.users) {
        if (cleanEmail && user.email === cleanEmail) {
          foundUser = user;
          break;
        }
        if (cleanPhone && user.phone === cleanPhone) {
          foundUser = user;
          break;
        }
      }
    }

    if (!foundUser) {
      return res.status(404).json({ 
        error: cleanEmail 
          ? 'No account found with this email. Please sign up first.' 
          : 'No account found with this number. Please sign up first.' 
      });
    }

    const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please verify your credentials and try again.' });
    }

    const token = jwt.sign(
      { 
        id: foundUser._id || foundUser.id, 
        role: foundUser.role, 
        email: foundUser.email,
        phone: foundUser.phone, 
        name: foundUser.name 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: foundUser._id || foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      phone: foundUser.phone,
      role: foundUser.role,
      abhaId: foundUser.abhaId,
      kioskId: foundUser.kioskId,
      village: foundUser.village,
      district: foundUser.district,
      state: foundUser.state,
      preferredLanguage: foundUser.preferredLanguage,
      location: foundUser.location,
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Login failed due to server error.' });
  }
}

/**
 * Forgot Password (Section 2)
 * Sends a single-use, time-limited reset token to registered email with rate-limiting.
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid registered email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Rate limit check: max 3 requests per email per hour
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const timestamps = resetRateLimitMap.get(cleanEmail) || [];
    const recentTimestamps = timestamps.filter(t => now - t < oneHour);

    if (recentTimestamps.length >= 3) {
      return res.status(429).json({
        error: 'Too many password reset requests for this email. Please try again after an hour.'
      });
    }

    // 2. Lookup user
    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      for (const [, u] of memoryDb.users) {
        if (u.email === cleanEmail) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(404).json({
        error: 'No account found with this email. Please sign up first.'
      });
    }

    // 3. Generate single-use reset token (6-character uppercase alphanumeric code)
    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();
    const tokenExpiry = new Date(Date.now() + 25 * 60 * 1000); // 25 mins

    // Update user record
    if (isDbConnected()) {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = tokenExpiry;
      user.lastResetRequestAt = new Date();
      await user.save();
    } else {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = tokenExpiry;
      user.lastResetRequestAt = new Date();
    }

    // Update rate limit tracker
    recentTimestamps.push(now);
    resetRateLimitMap.set(cleanEmail, recentTimestamps);

    // 4. Send email dispatch
    await sendPasswordResetEmail({
      toEmail: cleanEmail,
      resetToken,
      userName: user.name,
    });

    res.json({
      success: true,
      message: 'Reset link sent to your email. Please check your inbox or spam folder.',
      email: cleanEmail,
      // Provide token in non-production environments to facilitate rapid testing
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    });
  } catch (err) {
    console.error('[ForgotPassword Error]', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
}

/**
 * Reset Password (Section 2)
 * Validates token, hashes new password with bcrypt, immediately invalidates token.
 */
export async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Reset verification code is required.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const cleanToken = token.trim().toUpperCase();
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    let user;

    if (isDbConnected()) {
      const query = {
        resetPasswordToken: cleanToken,
        resetPasswordExpires: { $gt: new Date() },
      };
      if (cleanEmail) query.email = cleanEmail;

      user = await User.findOne(query);
    } else {
      for (const [, u] of memoryDb.users) {
        if (
          u.resetPasswordToken === cleanToken &&
          u.resetPasswordExpires &&
          new Date(u.resetPasswordExpires) > new Date()
        ) {
          if (!cleanEmail || u.email === cleanEmail) {
            user = u;
            break;
          }
        }
      }
    }

    if (!user) {
      return res.status(400).json({
        error: 'Link expired, please request a new one.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Update password and invalidate single-use token immediately
    if (isDbConnected()) {
      user.passwordHash = newHash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    } else {
      user.passwordHash = newHash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
    }

    console.log(`[Password Reset Success] Password updated for ${user.email || user.name}`);

    res.json({
      success: true,
      message: 'Password updated successfully — please log in',
    });
  } catch (err) {
    console.error('[ResetPassword Error]', err);
    res.status(500).json({ error: 'Failed to reset password due to server error.' });
  }
}

export async function getMe(req, res) {
  try {
    const userId = req.user.id;
    let user;

    if (isDbConnected()) {
      user = await User.findById(userId).select('-passwordHash');
    } else {
      user = memoryDb.users.get(userId);
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const userResponse = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      abhaId: user.abhaId,
      kioskId: user.kioskId,
      village: user.village,
      district: user.district,
      state: user.state,
      preferredLanguage: user.preferredLanguage,
      location: user.location,
    };

    res.json({ user: userResponse });
  } catch (err) {
    console.error('[GetMe Error]', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}
