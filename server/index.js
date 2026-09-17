import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import triageRoutes from './routes/triageRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import healthCardRoutes from './routes/healthCardRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env first, then local .env if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Twilio Webhook forms

// Initialize DB connection
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/health-card', healthCardRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ArogyaRakshak AI Backend',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ArogyaRakshak Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
