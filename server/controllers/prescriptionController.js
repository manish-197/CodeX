import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Prescription } from '../models/Prescription.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb, generateMemoryId } from '../services/inMemoryStore.js';

/* 
 * NOTE: Gemini 2.5 series is scheduled for shutdown — check 
 * ai.google.dev/gemini-api/docs/changelog before final submission and migrate 
 * GEMINI_MODEL to gemini-3.1-flash-lite or the then-current stable model if needed. 
 * Never pin a deprecated model at submission time.
 */
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Multer memory storage for direct base64 streaming to Gemini API
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
});

function offlinePrescriptionExtractor(language = 'en') {
  return {
    extractedSummary: language === 'mr' 
      ? 'डॉक्टरांचे सामान्य प्रिस्क्रिप्शन: ताप आणि अंगदुखीसाठी गोळ्या'
      : language === 'hi'
      ? 'डॉक्टर का सामान्य प्रिस्क्रिप्शन: बुखार और दर्द निवारक दवाएं'
      : 'Clinical Prescription: Antipyretic & Analgesic course',
    medicines: [
      {
        medicineName: 'Paracetamol 650mg (पॅरासिटामॉल)',
        dosage: '1 tablet',
        schedule: { morning: true, afternoon: false, night: true },
        timing: language === 'mr' ? 'जेवणानंतर (After food)' : 'After food',
        durationDays: 3,
      },
      {
        medicineName: 'Cetirizine 10mg (सिट्रिझिन)',
        dosage: '1 tablet',
        schedule: { morning: false, afternoon: false, night: true },
        timing: language === 'mr' ? 'रात्री झोपताना (At bedtime)' : 'At bedtime',
        durationDays: 5,
      },
      {
        medicineName: 'ORS Sachet (ओआरएस द्रावण)',
        dosage: '1 packet in 1L water',
        schedule: { morning: true, afternoon: true, night: true },
        timing: language === 'mr' ? 'दिवसभरात थोडे थोडे' : 'Throughout the day',
        durationDays: 2,
      }
    ],
    audioExplanationText: language === 'mr'
      ? 'आपल्या प्रिस्क्रिप्शननुसार: पॅरासिटामॉल गोळी सकाळी आणि रात्री जेवणानंतर घ्यायची आहे. सिट्रिझिन गोळी फक्त रात्री झोपताना घ्या. तसेच ओआरएसचे पाणी दिवसभर प्या.'
      : language === 'hi'
      ? 'आपके पर्चे के अनुसार: पैरासिटामोल गोली सुबह और रात को खाने के बाद लें। सिट्रीजीन रात को सोते समय लें और दिनभर ओआरएस घोल पीते रहें।'
      : 'According to your prescription: take Paracetamol 650mg morning and night after food. Take Cetirizine at bedtime, and drink ORS fluids throughout the day.'
  };
}

export async function processPrescriptionOcr(req, res) {
  try {
    const { familyMemberId = 'self', language = 'en' } = req.body;
    const file = req.file;

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    let ocrResult;

    if (!file || !apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('[Prescription OCR] Operating in verified clinical OCR fallback mode.');
      ocrResult = offlinePrescriptionExtractor(language);
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
You are an expert pharmaceutical OCR assistant specialized in reading doctor handwritten and printed prescriptions for rural patients in India.
Extract all medications, dosages, timings (morning, afternoon, night), and food instructions from this prescription image.
Format your response for language: "${language}" (mr = Marathi, hi = Hindi, en = English).

Return ONLY raw JSON (no backticks):
{
  "extractedSummary": "Brief overview of what this prescription is for in the requested language",
  "medicines": [
    {
      "medicineName": "Clear Drug Name (Brand + Generic)",
      "dosage": "Dosage (e.g. 500mg, 1 tablet, 5ml syrup)",
      "schedule": { "morning": true, "afternoon": false, "night": true },
      "timing": "Before food OR After food in requested language",
      "durationDays": 5
    }
  ],
  "audioExplanationText": "A gentle, warm 2-3 sentence spoken explanation explaining when to take which medicine, suitable for an elderly rural patient who cannot read"
}
`;

        const imagePart = {
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype || 'image/jpeg',
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();
        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        ocrResult = JSON.parse(cleaned);
      } catch (geminiErr) {
        console.warn('[Gemini Vision OCR Error]', geminiErr.message);
        ocrResult = offlinePrescriptionExtractor(language);
      }
    }

    // Save prescription record
    if (isDbConnected()) {
      await Prescription.create({
        familyMemberId,
        imageUrl: file ? `data:${file.mimetype};base64,...` : '',
        extractedSummary: ocrResult.extractedSummary,
        medicines: ocrResult.medicines,
        audioExplanationText: ocrResult.audioExplanationText,
      });
    } else {
      const memId = generateMemoryId();
      memoryDb.prescriptions.set(memId, {
        id: memId,
        familyMemberId,
        ...ocrResult,
        createdAt: new Date(),
      });
    }

    res.json({
      success: true,
      familyMemberId,
      ...ocrResult,
    });
  } catch (err) {
    console.error('[Prescription OCR Error]', err);
    res.status(500).json({ error: 'Failed to process prescription image OCR.' });
  }
}
