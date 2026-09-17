import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI is not set. Operating in secure in-memory fallback store.');
    console.warn('[MongoDB] Zero Dummy Data Discipline: in-memory collections start strictly empty.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[MongoDB] Connection error: ${err.message}. Falling back to clean in-memory store.`);
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}
