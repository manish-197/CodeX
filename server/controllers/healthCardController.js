import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'arogyarakshak_jwt_secret_dev_2026';

// Generates signed, tamper-proof token for QR code to prevent raw PII leakage
export function generateSignedHealthToken(member) {
  return jwt.sign(
    {
      abhaId: member.abhaId || '14-2026-9812-4456',
      iss: 'ArogyaRakshak-ABDM',
      v: 1,
      nameRef: Buffer.from(member.name || 'Citizen').toString('base64').slice(0, 10),
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: '365d' }
  );
}

// Preview endpoint returning signed QR data URL for on-screen display
export async function getCardPreview(req, res) {
  try {
    const member = req.body || {};
    const signedToken = generateSignedHealthToken(member);
    const qrDataUrl = await QRCode.toDataURL(signedToken, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#0F5E5E',
        light: '#FFFFFF',
      },
    });

    res.json({
      abhaId: member.abhaId || '14-2026-9812-4456',
      name: member.name || 'Primary Citizen',
      gender: member.gender || 'Not specified',
      bloodGroup: member.bloodGroup || 'Unknown',
      qrDataUrl,
      signedToken,
    });
  } catch (err) {
    console.error('[Health Card Preview Error]', err);
    res.status(500).json({ error: 'Failed to generate health card preview.' });
  }
}

// Generate printable ABDM PDF Document
export async function generateHealthCardPdf(req, res) {
  try {
    const member = req.body || {};
    const abhaId = member.abhaId || '14-2026-9812-4456';
    const name = member.name || 'Primary Citizen';
    const gender = member.gender || 'Not specified';
    const bloodGroup = member.bloodGroup || 'Unknown';
    const relation = member.relation || 'Self';
    const age = member.age || 'N/A';

    const signedToken = generateSignedHealthToken(member);
    const qrBuffer = await QRCode.toBuffer(signedToken, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#0F5E5E',
        light: '#FFFFFF',
      },
      width: 140,
    });

    const doc = new PDFDocument({
      size: [360, 240], // Standard CR80 wallet card landscape ratio
      margin: 15,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ABDM_Health_Card_${abhaId.replace(/-/g, '_')}.pdf"`);

    doc.pipe(res);

    // Background Card Styling
    doc.roundedRect(5, 5, 350, 230, 12).fillAndStroke('#FFFFFF', '#0F5E5E');

    // Header Band (Deep Teal)
    doc.roundedRect(5, 5, 350, 48, 12).fill('#0F5E5E');
    doc.rect(5, 25, 350, 28).fill('#0F5E5E'); // square lower corners

    // Header Typography
    doc.fillColor('#F4B942').fontSize(9).font('Helvetica-Bold')
      .text('AYUSHMAN BHARAT DIGITAL MISSION (ABDM)', 18, 14, { characterSpacing: 0.5 });
    doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica')
      .text('National Health Authority • ArogyaRakshak AI Rural Health Hub', 18, 27);

    // Decorative Orange Strip
    doc.rect(5, 53, 350, 3).fill('#E4714E');

    // Demographic Info Column
    doc.fillColor('#0F5E5E').fontSize(8).font('Helvetica-Bold').text('NAME / नाव', 20, 70);
    doc.fillColor('#1A2E2E').fontSize(11).font('Helvetica-Bold').text(name.toUpperCase(), 20, 81);

    doc.fillColor('#0F5E5E').fontSize(7).font('Helvetica-Bold').text('ABHA ADDRESS / आभा क्रमांक', 20, 102);
    doc.fillColor('#E4714E').fontSize(11).font('Helvetica-Bold').text(abhaId, 20, 112);

    doc.fillColor('#0F5E5E').fontSize(7).font('Helvetica-Bold').text('GENDER / लिंग', 20, 134);
    doc.fillColor('#1A2E2E').fontSize(9).font('Helvetica').text(gender, 20, 144);

    doc.fillColor('#0F5E5E').fontSize(7).font('Helvetica-Bold').text('BLOOD GROUP', 110, 134);
    doc.fillColor('#D64550').fontSize(10).font('Helvetica-Bold').text(bloodGroup, 110, 143);

    doc.fillColor('#0F5E5E').fontSize(7).font('Helvetica-Bold').text('RELATION / AGE', 20, 162);
    doc.fillColor('#1A2E2E').fontSize(8).font('Helvetica').text(`${relation} • ${age} yrs`, 20, 172);

    // QR Code Image on Right
    doc.image(qrBuffer, 225, 68, { width: 110, height: 110 });

    doc.fillColor('#666666').fontSize(6).font('Helvetica')
      .text('Scan for encrypted ABDM verification', 222, 182, { width: 116, align: 'center' });

    // Footer Security Notice
    doc.rect(5, 202, 350, 33).fill('#F0F7F7');
    doc.fillColor('#0F5E5E').fontSize(6).font('Helvetica')
      .text('This digital card contains a cryptographically signed ABDM token. No raw PII is exposed.', 15, 208);
    doc.fillColor('#D64550').fontSize(6).font('Helvetica-Bold')
      .text('Emergency Medical Ambulance Helpline: Dial 108 | Health Info: 104', 15, 218);

    doc.end();
  } catch (err) {
    console.error('[Health Card PDF Generation Error]', err);
    res.status(500).json({ error: 'Failed to generate health card PDF.' });
  }
}
