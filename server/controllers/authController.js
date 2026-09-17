import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb, generateMemoryId } from '../services/inMemoryStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'arogyarakshak_jwt_secret_dev_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate random ABHA ID in XX-XXXX-XXXX-XXXX format if citizen doesn't have one
export function formatAbhaId(input) {
  if (input && /^(\d{2})-(\d{4})-(\d{4})-(\d{4})$/.test(input)) {
    return input;
  }
  const digits = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
  return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 14)}`;
}

export async function register(req, res) {
  try {
    const { 
      name, 
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

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone number, and password are required.' });
    }

    if (phone.length < 10) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit phone number.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const finalAbhaId = role === 'citizen' ? formatAbhaId(abhaId) : undefined;
    const userCoords = Array.isArray(coordinates) && coordinates.length === 2 
      ? coordinates 
      : [73.8567, 18.5204];

    let createdUser;

    if (isDbConnected()) {
      const existing = await User.findOne({ phone });
      if (existing) {
        return res.status(400).json({ error: 'A user with this phone number is already registered.' });
      }

      createdUser = await User.create({
        name,
        phone,
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
        if (user.phone === phone) {
          return res.status(400).json({ error: 'A user with this phone number is already registered.' });
        }
      }

      const memId = generateMemoryId();
      createdUser = {
        _id: memId,
        id: memId,
        name,
        phone,
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
        phone: createdUser.phone, 
        name: createdUser.name 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: createdUser._id || createdUser.id,
      name: createdUser.name,
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

export async function login(req, res) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required.' });
    }

    let foundUser;

    if (isDbConnected()) {
      foundUser = await User.findOne({ phone });
    } else {
      for (const [, user] of memoryDb.users) {
        if (user.phone === phone) {
          foundUser = user;
          break;
        }
      }
    }

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid phone number or credentials.' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone number or credentials.' });
    }

    const token = jwt.sign(
      { 
        id: foundUser._id || foundUser.id, 
        role: foundUser.role, 
        phone: foundUser.phone, 
        name: foundUser.name 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: foundUser._id || foundUser.id,
      name: foundUser.name,
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
