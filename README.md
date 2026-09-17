# ArogyaRakshak AI (आरोग्यरक्षक AI)
### Rural & Underserved Healthcare Accessibility Platform

A bilingual/multilingual, AI-triage-driven, GPS-accurate, offline-capable healthcare platform engineered specifically for India's rural communities, primary health centres (PHCs), and Gram Panchayat kiosks.

---

## 🌟 Key Pillars

1. **Discovery & 3D Bio-Twin**: WebGL Three.js anatomical digital twin synced to real recorded vitals with pulsating emissive glows.
2. **Dual-Role Access**: Citizen self-service mode (with ABHA IDs) and authorized Gram Panchayat Kiosk operator mode.
3. **Zero-Default Vitals**: Strict zero/empty initialization (`0/0 mmHg`, `0 BPM`, `0% SpO2`) with hypertensive detection.
4. **Multilingual Speech AI Triage**: Real-time Web Speech API audio processing with Google Gemini AI (`GEMINI_MODEL=gemini-2.5-flash`), dynamic language translation, risk classification, and synthesized voice feedback.
5. **Real Road-to-Road Navigation**: Device GPS combined with OSRM (Open Source Routing Machine) and Leaflet for true street-level rural hospital routing and turn-by-turn maneuvers.
6. **Six Integrated Extra Features**:
   - **AI Prescription OCR & Multilingual Audio Explainer** (Multer + Gemini Vision)
   - **1-Tap Emergency SOS Beacon** (3s abort timer + live GPS + vitals snapshot)
   - **Offline PWA & Background Sync** (Workbox + IndexedDB)
   - **WhatsApp Voice Bot for Elders** (Twilio/Meta webhook audio triage)
   - **ABDM Digital Health Card PDF** (Encrypted signed QR code + photo)
   - **Web Bluetooth BLE Vitals Sync** (GATT Heart Rate & BP monitor pairing)

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS ("Soft Neo-Glass, Earth & Sky"), Three.js, GSAP, Lenis, Leaflet, Lucide Icons, Web Speech API, Web Bluetooth API.
- **Backend**: Node.js + Express (ES Modules), MongoDB Atlas (Mongoose 2dsphere geo-indexing), JWT Auth, bcrypt password hashing, Multer.
- **AI & Geodata**: Google Gemini API (`gemini-2.5-flash`), OpenStreetMap / Nominatim reverse geocoding, OSRM road routing engine.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Environment Setup
Copy the template configuration file:
```bash
cp .env.example .env
```
Populate `.env` with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
```

> **Note on Gemini Model**: `gemini-2.5-flash` is configured via `GEMINI_MODEL`. Check `ai.google.dev/gemini-api/docs/changelog` and migrate to the current stable version if required.

### 3. Installation
```bash
# Install root, client, and server dependencies
npm run install:all
```

### 4. Running Locally
```bash
# Terminal 1: Frontend Client (Vite)
npm run dev:client

# Terminal 2: Backend Server (Node Express)
npm run dev:server
```

---

## 🔒 Security & Privacy

- All secrets loaded via environment variables (`.env` strictly gitignored).
- Passwords hashed using bcrypt with salt rounds ≥ 10.
- Health card QR codes encode signed, time-limited JWT tokens rather than exposed PII.
- Zero Dummy Data Discipline: no sample numbers or mockup placeholders are ever surfaced.
