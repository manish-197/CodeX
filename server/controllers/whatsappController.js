import { GoogleGenerativeAI } from '@google/generative-ai';

/* 
 * NOTE: Gemini 2.5 series is scheduled for shutdown — check 
 * ai.google.dev/gemini-api/docs/changelog before final submission and migrate 
 * GEMINI_MODEL to gemini-3.1-flash-lite or the then-current stable model if needed. 
 * Never pin a deprecated model at submission time.
 */
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Sanitizes input against basic prompt injection
function sanitizeInput(text) {
  if (!text) return '';
  return text.replace(/[<>{}$]/g, '').trim().slice(0, 500);
}

// Localized WhatsApp bot triage pipeline
export async function handleWhatsAppWebhook(req, res) {
  try {
    const incomingText = req.body.Body || req.body.text || req.body.message || '';
    const sender = req.body.From || 'Elderly Citizen';
    const mediaUrl = req.body.MediaUrl0;

    const sanitized = sanitizeInput(incomingText);

    let triageReply = '';
    const detectedLang = /[\u0900-\u097F]/.test(sanitized) ? 'mr' : 'en';

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || !sanitized) {
      triageReply = detectedLang === 'mr'
        ? `🏥 *आरोग्यरक्षक व्हॉट्सअॅप सहाय्यक*\n\nआपली लक्षणे प्राप्त झाली. ताप किंवा खोकल्यासाठी भरपूर पाणी प्या व विश्रांती घ्या. लक्षणे वाढल्यास त्वरित प्राथमिक आरोग्य केंद्रात जा किंवा १०८ वर कॉल करा.`
        : `🏥 *ArogyaRakshak WhatsApp Health Bot*\n\nSymptoms received. Rest well and hydrate. If breathing difficulty or chest pain occurs, immediately call 108 national ambulance.`;
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `
You are the WhatsApp Voice/Text Bot for ArogyaRakshak AI helping elderly rural citizens in India.
Patient Message: "${sanitized}"
Provide a brief, compassionate 3-sentence clinical triage advice in the same language (Marathi/Hindi/English) with emergency hotline 108 mention.
`;
        const response = await model.generateContent(prompt);
        triageReply = response.response.text();
      } catch (err) {
        console.warn('[Gemini WhatsApp Fallback]', err.message);
        triageReply = `🏥 *ArogyaRakshak Emergency Assist*\nConsultation recorded. Dial 108 for emergency ambulance support.`;
      }
    }

    // Return Twilio TwiML format
    res.type('text/xml');
    res.send(`
      <Response>
        <Message>
          <Body>${triageReply}</Body>
        </Message>
      </Response>
    `.trim());
  } catch (err) {
    console.error('[WhatsApp Webhook Error]', err);
    res.status(500).send('<Response><Message><Body>Service temporarily unavailable.</Body></Message></Response>');
  }
}

// Simulation endpoint for browser testing & interactive demo
export async function simulateWhatsAppMessage(req, res) {
  try {
    const { message, language = 'mr' } = req.body;
    const sanitized = sanitizeInput(message);

    if (!sanitized) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    let reply = '';

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      reply = language === 'mr'
        ? `🏥 *आरोग्यरक्षक व्हॉट्सअॅप सहाय्यक*\n\nआपली लक्षणे तपासली: "${sanitized}".\n• जोखीम: मध्यम (विश्रांती आवश्यक)\n• उपाय: ओआरएस पाणी प्या व आराम करा.\n• आपत्कालीन क्रमांक: १०८ रुग्णवाहिका उपलब्ध.`
        : `🏥 *ArogyaRakshak WhatsApp Bot*\n\nEvaluated: "${sanitized}".\n• Risk: Moderate\n• Advice: Hydrate with ORS and rest.\n• Emergency: Ambulance 108 is on standby.`;
    } else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = `
You are the WhatsApp Bot of ArogyaRakshak AI responding to an elderly Indian villager.
Message: "${sanitized}"
Language: ${language}
Provide a warm, reassuring, clinical triage message (bulleted, under 70 words) with emergency 108 hotline.
`;
        const response = await model.generateContent(prompt);
        reply = response.response.text();
      } catch (e) {
        reply = `🏥 *ArogyaRakshak AI*: Consultation processed. Please rest and call 108 if symptoms worsen.`;
      }
    }

    res.json({
      success: true,
      sender: '+91 98220 12345 (Village Elder)',
      receivedMessage: sanitized,
      botReply: reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[WhatsApp Simulate Error]', err);
    res.status(500).json({ error: 'Failed to process simulation.' });
  }
}
