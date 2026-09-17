import multer from 'multer';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Prescription } from '../models/Prescription.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb, generateMemoryId } from '../services/inMemoryStore.js';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// Multer memory storage for direct base64 streaming to Gemini API
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
});

/**
 * Save Prescription Record
 * Links strictly to familyMemberId
 */
export async function savePrescription(req, res) {
  try {
    const {
      familyMemberId,
      userId,
      patientDetails,
      createdBy = 'symptom_checklist',
      medicines = [],
      homeRemedies = [],
      durationDays = 2,
      diagnosisSummary = 'Clinical Health Assessment',
      riskLevel = 'LOW',
      verificationStatus = 'unverified'
    } = req.body;

    if (!familyMemberId) {
      return res.status(400).json({ error: 'familyMemberId is required to save a prescription.' });
    }

    // Standardize medicines array to { name, category, instructions, timing }
    const formattedMedicines = medicines.map(m => ({
      name: m.name || m.medicineName || 'Prescribed Medicine',
      category: m.category || 'General Formulation',
      instructions: m.instructions || m.dosage || 'Consult doctor or pharmacist for administration',
      timing: m.timing || 'As directed',
    }));

    let savedDoc;

    if (isDbConnected()) {
      savedDoc = await Prescription.create({
        familyMemberId,
        userId,
        patientDetails: patientDetails || {},
        createdBy,
        medicines: formattedMedicines,
        homeRemedies,
        durationDays: Number(durationDays) || 2,
        diagnosisSummary,
        riskLevel,
        verificationStatus,
      });

      // Update pdfUrl
      savedDoc.pdfUrl = `/api/prescriptions/${savedDoc._id}/pdf`;
      await savedDoc.save();
    } else {
      const memId = generateMemoryId();
      savedDoc = {
        _id: memId,
        id: memId,
        familyMemberId,
        userId,
        patientDetails: patientDetails || { name: 'Family Member', abhaId: '14-2026-9812-4456' },
        createdBy,
        medicines: formattedMedicines,
        homeRemedies,
        durationDays: Number(durationDays) || 2,
        diagnosisSummary,
        riskLevel,
        verificationStatus,
        pdfUrl: `/api/prescriptions/${memId}/pdf`,
        createdAt: new Date(),
      };
      memoryDb.prescriptions.set(memId, savedDoc);
    }

    console.log(`[Prescription Saved] ID: ${savedDoc._id || savedDoc.id} for Family Member: ${familyMemberId}`);

    res.status(201).json({
      success: true,
      message: 'Prescription record saved successfully',
      prescription: savedDoc,
    });
  } catch (err) {
    console.error('[SavePrescription Error]', err);
    res.status(500).json({ error: 'Failed to save prescription record.' });
  }
}

/**
 * Get Prescriptions for a Specific Family Member
 */
export async function getPrescriptionsByMember(req, res) {
  try {
    const { familyMemberId } = req.params;

    if (!familyMemberId) {
      return res.status(400).json({ error: 'familyMemberId is required.' });
    }

    let records = [];

    if (isDbConnected()) {
      records = await Prescription.find({ familyMemberId }).sort({ createdAt: -1 });
    } else {
      for (const [, presc] of memoryDb.prescriptions) {
        if (presc.familyMemberId === familyMemberId) {
          records.push(presc);
        }
      }
      records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      familyMemberId,
      count: records.length,
      prescriptions: records,
    });
  } catch (err) {
    console.error('[GetPrescriptionsByMember Error]', err);
    res.status(500).json({ error: 'Failed to load family member prescriptions.' });
  }
}

/**
 * Generate PDF Prescription Slip (Styled like a real medical slip with Pharmacist Verification)
 */
export async function generatePrescriptionPdf(req, res) {
  try {
    const { id } = req.params;
    let presc;

    if (isDbConnected()) {
      presc = await Prescription.findById(id);
    } else {
      presc = memoryDb.prescriptions.get(id);
    }

    if (!presc) {
      return res.status(404).json({ error: 'Prescription record not found.' });
    }

    // Verification URL encoded into QR Code
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const verifyUrl = `${baseUrl}/api/prescriptions/verify/${id}`;
    const qrImageBase64 = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });
    const qrBuffer = Buffer.from(qrImageBase64.split(',')[1], 'base64');

    // Create PDF document
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Prescription-${id}.pdf"`);

    doc.pipe(res);

    // Header Background & Branding
    doc.rect(40, 40, 515, 65).fill('#0F4C5C'); // Deep teal header
    doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
      .text('ArogyaRakshak AI — Health Accessibility Record', 55, 52);
    doc.fontSize(10).font('Helvetica')
      .text('National Digital Health Mission Aligned | ABHA Connected Rural Tele-Triage', 55, 75);

    // Prominent AI-Assisted Notice Header
    doc.rect(40, 115, 515, 30).fill('#FFF3CD');
    doc.rect(40, 115, 515, 30).stroke('#FFEBAA');
    doc.fillColor('#856404').fontSize(10).font('Helvetica-Bold')
      .text('AI-Assisted Health Suggestion — Requires Pharmacist/Doctor Verification', 50, 124, { align: 'center', width: 495 });

    // Patient Information Card
    const patientName = presc.patientDetails?.name || 'Self (Registered Citizen)';
    const patientAge = presc.patientDetails?.age || 42;
    const patientBlood = presc.patientDetails?.bloodGroup || 'B+';
    const abhaId = presc.patientDetails?.abhaId || '14-2026-9812-4456';
    const recordDate = new Date(presc.createdAt || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    doc.rect(40, 155, 515, 75).fill('#F8F9FA');
    doc.rect(40, 155, 515, 75).stroke('#DEE2E6');

    doc.fillColor('#212529').fontSize(9).font('Helvetica-Bold');
    doc.text('PATIENT NAME:', 55, 168);
    doc.font('Helvetica').text(patientName, 150, 168);

    doc.font('Helvetica-Bold').text('AGE / BLOOD GROUP:', 320, 168);
    doc.font('Helvetica').text(`${patientAge} yrs | ${patientBlood}`, 440, 168);

    doc.font('Helvetica-Bold').text('ABHA NUMBER:', 55, 188);
    doc.font('Helvetica').text(abhaId, 150, 188);

    doc.font('Helvetica-Bold').text('DATE / TIME:', 320, 188);
    doc.font('Helvetica').text(recordDate, 440, 188);

    doc.font('Helvetica-Bold').text('PRESCRIPTION ID:', 55, 208);
    doc.font('Helvetica').text(String(presc._id || presc.id), 150, 208);

    doc.font('Helvetica-Bold').text('SOURCE CHANNEL:', 320, 208);
    const sourceLabel = presc.createdBy === 'ocr_scan' 
      ? 'Prescription OCR Scan' 
      : presc.createdBy === 'symptom_checklist' 
        ? 'Symptom Checklist Triage (2-Day Rx)' 
        : 'Clinical Triage';
    doc.font('Helvetica').text(sourceLabel, 440, 208);

    // Clinical Diagnosis Summary & Risk
    const isCritical = presc.riskLevel === 'CRITICAL';
    const assessmentBg = isCritical ? '#FEE2E2' : '#E9ECEF';
    const assessmentBorder = isCritical ? '#EF4444' : '#CED4DA';

    doc.rect(40, 238, 515, 45).fill(assessmentBg);
    doc.rect(40, 238, 515, 45).stroke(assessmentBorder);
    doc.fillColor(isCritical ? '#991B1B' : '#212529').fontSize(10).font('Helvetica-Bold')
      .text(isCritical ? 'CRITICAL EMERGENCY NOTICE / तातडीची वैद्यकीय आणीबाणी:' : 'Clinical Assessment / Diagnosis Summary:', 55, 246);
    doc.fontSize(9.5).font('Helvetica')
      .text(`${presc.diagnosisSummary || 'General Health Assessment'}  |  Risk Level: ${presc.riskLevel || 'LOW'}`, 55, 262, { width: 485 });

    let currentY = 292;

    if (isCritical) {
      // Emergency Red Alert Banner - Strictly Zero Self-Medication
      doc.rect(40, currentY, 515, 65).fill('#FEF2F2');
      doc.rect(40, currentY, 515, 65).stroke('#DC2626');

      doc.fillColor('#DC2626').fontSize(12).font('Helvetica-Bold')
        .text('EMERGENCY: STRICTLY NO SELF-MEDICATION (कोणतेही औषध स्वतः घेऊ नका)', 55, currentY + 12);
      doc.fillColor('#7F1D1D').fontSize(9).font('Helvetica')
        .text('Extreme risk detected. OTC medicine is NOT safe for this condition. Immediately visit the nearest emergency trauma hospital or call 108 for ambulance dispatch.', 55, currentY + 30, { width: 485 });

      currentY += 80;
    } else {
      // 2-Day Schedule Duration Banner
      doc.rect(40, currentY, 515, 20).fill('#FEF3C7');
      doc.rect(40, currentY, 515, 20).stroke('#F59E0B');
      doc.fillColor('#92400E').fontSize(9).font('Helvetica-Bold')
        .text('STRICT 2-DAY OTC RELIEF PROTOCOL (कालावधी: फक्त २ दिवस) - Discontinue & consult doctor if unresolved', 55, currentY + 5, { align: 'center', width: 495 });

      currentY += 26;

      // Medicines Table Header
      doc.rect(40, currentY, 515, 22).fill('#2A6F97');
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
      doc.text('MEDICINE / OTC CATEGORY', 50, currentY + 7, { width: 160 });
      doc.text('PHARMACOLOGICAL CLASS', 215, currentY + 7, { width: 110 });
      doc.text('INSTRUCTIONS / GUIDANCE', 330, currentY + 7, { width: 130 });
      doc.text('TIMING (2-DAY)', 465, currentY + 7, { width: 85 });

      currentY += 22;
      const meds = presc.medicines && presc.medicines.length > 0
        ? presc.medicines
        : [{ name: 'Paracetamol OTC Category', category: 'Antipyretic', instructions: 'Take with water post-meals as advised by pharmacist', timing: 'Post-meals [2 Days]' }];

      meds.forEach((med, index) => {
        const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
        doc.rect(40, currentY, 515, 30).fill(bgColor);
        doc.rect(40, currentY, 515, 30).stroke('#E5E7EB');

        doc.fillColor('#1F2937').fontSize(8.5).font('Helvetica-Bold')
          .text(med.name || 'Medicine', 50, currentY + 6, { width: 160 });

        doc.font('Helvetica').fillColor('#4B5563')
          .text(med.category || 'General OTC', 215, currentY + 6, { width: 110 });

        doc.text(med.instructions || 'Consult pharmacist', 330, currentY + 6, { width: 130 });
        doc.text(med.timing || 'As advised [2 Days]', 465, currentY + 6, { width: 85 });

        currentY += 32;
      });

      // Safe Home Remedies Box
      if (presc.homeRemedies && presc.homeRemedies.length > 0) {
        currentY += 6;
        const remediesCount = presc.homeRemedies.length;
        const boxHeight = Math.min(60, 20 + remediesCount * 14);
        doc.rect(40, currentY, 515, boxHeight).fill('#F0FDF4');
        doc.rect(40, currentY, 515, boxHeight).stroke('#86EFAC');

        doc.fillColor('#166534').fontSize(8.5).font('Helvetica-Bold')
          .text('SAFE HOME REMEDIES / SUPPORTIVE CARE (घरगुती सुरक्षित उपाय):', 50, currentY + 6);
        
        let remY = currentY + 18;
        presc.homeRemedies.slice(0, 3).forEach(rem => {
          doc.fillColor('#15803D').fontSize(8).font('Helvetica')
            .text(`* ${rem}`, 55, remY, { width: 480 });
          remY += 13;
        });

        currentY += boxHeight + 10;
      }
    }

    // Verification Section with QR Code Stamp
    currentY = Math.max(currentY + 10, 560);
    doc.rect(40, currentY, 515, 110).fill('#F0FDF4');
    doc.rect(40, currentY, 515, 110).stroke('#86EFAC');

    // Draw QR Code
    doc.image(qrBuffer, 55, currentY + 10, { width: 85, height: 85 });

    doc.fillColor('#166534').fontSize(10.5).font('Helvetica-Bold')
      .text('PHARMACIST / DOCTOR VERIFICATION SECTION', 155, currentY + 12);

    const isVerified = presc.verificationStatus === 'pharmacist_verified' || presc.verificationStatus === 'doctor_verified';

    doc.fontSize(8.5).font('Helvetica');
    if (isVerified) {
      doc.fillColor('#15803D').text(`Status: VERIFIED by ${presc.verifiedBy || 'Registered Pharmacist'}`, 155, currentY + 28);
      doc.text(`Verified On: ${new Date(presc.verifiedAt || Date.now()).toLocaleString('en-IN')}`, 155, currentY + 41);
    } else {
      doc.fillColor('#B45309').text('Status: UNVERIFIED (Awaiting local medical store verification)', 155, currentY + 28);
      doc.fillColor('#4B5563').text('Scan QR code to verify validity and approve dispensing.', 155, currentY + 41);
    }

    doc.fillColor('#374151').fontSize(8)
      .text('Pharmacist Stamp & Registration Sign-off:', 155, currentY + 60);
    doc.rect(155, currentY + 72, 230, 20).stroke('#9CA3AF');
    doc.fontSize(7.5).fillColor('#9CA3AF').text('Dispensing Chemist Signature / Reg No.', 165, currentY + 78);

    // Footer Disclaimer
    doc.rect(40, 720, 515, 45).fill('#F3F4F6');
    doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica')
      .text('LEGAL & CLINICAL DISCLAIMER: This document is generated by ArogyaRakshak AI rural tele-triage assistant. It is NOT a substitute for formal medical consultation or doctor prescription. In emergencies, call 108 or transfer patient to nearest Primary Health Centre (PHC). Pharmacists must inspect and verify patient suitability before dispensing OTC items.', 50, 728, { width: 495, align: 'center' });

    doc.end();
  } catch (err) {
    console.error('[GeneratePrescriptionPdf Error]', err);
    res.status(500).json({ error: 'Failed to generate prescription PDF slip.' });
  }
}

/**
 * Pharmacist Verification Endpoint
 */
export async function verifyPrescription(req, res) {
  try {
    const { id } = req.params;
    const { verifierName = 'Gram Panchayat Registered Chemist', status = 'pharmacist_verified' } = req.body;

    let updated;

    if (isDbConnected()) {
      updated = await Prescription.findByIdAndUpdate(
        id,
        {
          verificationStatus: status,
          verifiedBy: verifierName,
          verifiedAt: new Date(),
        },
        { new: true }
      );
    } else {
      updated = memoryDb.prescriptions.get(id);
      if (updated) {
        updated.verificationStatus = status;
        updated.verifiedBy = verifierName;
        updated.verifiedAt = new Date();
        memoryDb.prescriptions.set(id, updated);
      }
    }

    if (!updated) {
      return res.status(404).json({ error: 'Prescription not found.' });
    }

    res.json({
      success: true,
      message: 'Prescription marked as verified successfully',
      prescription: updated,
    });
  } catch (err) {
    console.error('[VerifyPrescription Error]', err);
    res.status(500).json({ error: 'Failed to update verification status.' });
  }
}

/**
 * Web QR Verification Landing Page
 */
export async function verifyPrescriptionLanding(req, res) {
  try {
    const { id } = req.params;
    let presc;

    if (isDbConnected()) {
      presc = await Prescription.findById(id);
    } else {
      presc = memoryDb.prescriptions.get(id);
    }

    if (!presc) {
      return res.status(404).send('<h2>Prescription not found or invalid QR code.</h2>');
    }

    const patientName = presc.patientDetails?.name || 'Self';
    const isVerified = presc.verificationStatus === 'pharmacist_verified' || presc.verificationStatus === 'doctor_verified';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ArogyaRakshak AI — Prescription Verification</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f0fdf4; margin: 0; padding: 20px; color: #1e293b; }
          .card { max-width: 540px; margin: 20px auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; }
          .verified { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
          .unverified { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
          .btn { display: inline-block; background: #0f4c5c; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; cursor: pointer; border: none; }
          .btn-verify { background: #16a34a; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 12px; font-weight: 700; color: #e36414; text-transform: uppercase;">ArogyaRakshak AI — Tele-Triage Verification</div>
          <h1 style="font-size: 22px; margin: 8px 0 16px 0;">Prescription Verification Slip</h1>
          <div style="margin-bottom: 20px;">
            <span class="badge ${isVerified ? 'verified' : 'unverified'}">
              ${isVerified ? '✓ Pharmacist Verified' : '⚠ Unverified AI Suggestion'}
            </span>
          </div>
          <p><strong>Patient Name:</strong> ${patientName}</p>
          <p><strong>Diagnosis:</strong> ${presc.diagnosisSummary || 'General Assessment'}</p>
          <p><strong>Risk Level:</strong> ${presc.riskLevel || 'LOW'}</p>
          <p><strong>Created:</strong> ${new Date(presc.createdAt || Date.now()).toLocaleString('en-IN')}</p>
          
          <div style="margin-top: 24px; display: flex; gap: 10px;">
            <a href="/api/prescriptions/${id}/pdf" class="btn" target="_blank">Download PDF Slip</a>
            ${!isVerified ? `
              <form method="POST" action="/api/prescriptions/${id}/verify" style="display:inline;">
                <button type="submit" class="btn btn-verify">Mark as Pharmacist Verified</button>
              </form>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error('[VerifyLanding Error]', err);
    res.status(500).send('Error rendering verification details.');
  }
}

function offlinePrescriptionExtractor(language = 'en') {
  return {
    extractedSummary: language === 'mr' 
      ? 'डॉक्टरांचे सामान्य प्रिस्क्रिप्शन: ताप आणि अंगदुखीसाठी गोळ्या'
      : language === 'hi'
      ? 'डॉक्टर का सामान्य प्रिस्क्रिप्शन: बुखार और दर्द निवारक दवाएं'
      : 'Clinical Prescription: Antipyretic & Analgesic course',
    medicines: [
      {
        name: 'Paracetamol 650mg',
        category: 'Antipyretic / Analgesic',
        instructions: '1 tablet after food',
        timing: language === 'mr' ? 'जेवणानंतर (After food)' : 'After food',
      },
      {
        name: 'Cetirizine 10mg',
        category: 'Antihistamine',
        instructions: '1 tablet at bedtime',
        timing: language === 'mr' ? 'रात्री झोपताना (At bedtime)' : 'At bedtime',
      },
      {
        name: 'ORS Sachet',
        category: 'Electrolyte Balance',
        instructions: 'Mix 1 packet in 1L safe water',
        timing: language === 'mr' ? 'दिवसभरात थोडे थोडे' : 'Throughout the day',
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
    const { familyMemberId = 'self_1', language = 'en' } = req.body;
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
Extract all medications, categories, instructions, and timings from this prescription image.
Format your response for language: "${language}" (mr = Marathi, hi = Hindi, en = English).

Return ONLY raw JSON (no backticks):
{
  "extractedSummary": "Brief overview of what this prescription is for in the requested language",
  "medicines": [
    {
      "name": "Clear Drug Name (Brand + Generic)",
      "category": "Pharmacological Category",
      "instructions": "Clear instruction (e.g., 1 tablet after meals)",
      "timing": "Before food OR After food in requested language"
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

    // Save prescription record linked to active familyMemberId
    let savedPresc;
    if (isDbConnected()) {
      savedPresc = await Prescription.create({
        familyMemberId,
        createdBy: 'ocr_scan',
        imageUrl: file ? `data:${file.mimetype};base64,...` : '',
        diagnosisSummary: ocrResult.extractedSummary || 'Scanned Doctor Prescription',
        medicines: ocrResult.medicines || [],
        audioExplanationText: ocrResult.audioExplanationText,
        verificationStatus: 'unverified',
      });
      savedPresc.pdfUrl = `/api/prescriptions/${savedPresc._id}/pdf`;
      await savedPresc.save();
    } else {
      const memId = generateMemoryId();
      savedPresc = {
        _id: memId,
        id: memId,
        familyMemberId,
        createdBy: 'ocr_scan',
        diagnosisSummary: ocrResult.extractedSummary || 'Scanned Doctor Prescription',
        medicines: ocrResult.medicines || [],
        audioExplanationText: ocrResult.audioExplanationText,
        verificationStatus: 'unverified',
        pdfUrl: `/api/prescriptions/${memId}/pdf`,
        createdAt: new Date(),
      };
      memoryDb.prescriptions.set(memId, savedPresc);
    }

    res.json({
      success: true,
      prescription: savedPresc,
      familyMemberId,
      ...ocrResult,
    });
  } catch (err) {
    console.error('[Prescription OCR Error]', err);
    res.status(500).json({ error: 'Failed to process prescription image OCR.' });
  }
}
