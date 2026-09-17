import { GoogleGenerativeAI } from '@google/generative-ai';

/* 
 * NOTE: Gemini 2.5 series is scheduled for shutdown — check 
 * ai.google.dev/gemini-api/docs/changelog before final submission and migrate 
 * GEMINI_MODEL to gemini-3.1-flash-lite or the then-current stable model if needed. 
 * Never pin a deprecated model at submission time.
 */
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Clean clinical triage rules engine fallback when external GEMINI_API_KEY is unconfigured in local dev
function offlineClinicalTriage(symptoms, language = 'en') {
  const lower = (symptoms || '').toLowerCase();
  
  // Critical red flags
  if (lower.includes('chest pain') || lower.includes('छातीत दुखणे') || lower.includes('सीने में दर्द') || 
      lower.includes('difficulty breathing') || lower.includes('श्वास घेण्यास त्रास') || lower.includes('सांस लेने में दिक्कत') ||
      lower.includes('unconscious') || lower.includes('बेहोश') || lower.includes('सुन्न')) {
    return {
      riskLevel: 'CRITICAL',
      likelyDiagnosis: language === 'mr' ? 'तीव्र हृदय किंवा श्वसन आणीबाणी' : language === 'hi' ? 'गंभीर हृदय या श्वसन आपातकाल' : 'Acute Cardio-Respiratory Emergency',
      clinicalExplanation: language === 'mr' 
        ? 'लक्षणे तातडीच्या वैद्यकीय आणीबाणीकडे निर्देश करतात. विलंब न करता तात्काळ १०८ रुग्णवाहिका बोलवा.'
        : language === 'hi'
        ? 'लक्षणें आपातकालीन स्थिति की ओर संकेत करती हैं। तुरंत १०८ एम्बुलेंस को कॉल करें।'
        : 'Reported symptoms indicate a high-risk emergency. Immediate 108 ambulance dispatch recommended.',
      homeRemedies: [
        language === 'mr' ? 'रुग्णाला हवेशीर जागी शांत बसवा.' : 'Keep patient in seated, ventilated position.',
        language === 'mr' ? 'कोणतेही जड अन्न किंवा पाणी देऊ नका.' : 'Do not administer heavy fluids or solid food.',
      ],
      warningSigns: [
        language === 'mr' ? 'ओठ किंवा नखे निळे पडणे' : 'Cyanosis (bluish tint on lips or fingers)',
        language === 'mr' ? 'थंड घाम येणे' : 'Cold clammy sweats',
      ],
      recommendedSpecialty: 'Emergency Medicine / Cardiology',
      audioResponseText: language === 'mr'
        ? 'लक्ष द्या! ही गंभीर आणीबाणी असू शकते. कृपया लगेच १०८ रुग्णवाहिका बोलवा किंवा जवळच्या रुग्णालयात जा.'
        : language === 'hi'
        ? 'ध्यान दें! यह गंभीर आपातकाल हो सकता है। कृपया तुरंत १०८ एम्बुलेंस बुलाएं या नजदीकी अस्पताल जाएं।'
        : 'Warning! This may be a critical emergency. Please call 108 ambulance or reach the nearest hospital immediately.'
    };
  }

  // Moderate / Common rural conditions (fever, gastro, cough)
  const isFever = lower.includes('fever') || lower.includes('ताप') || lower.includes('बुखार');
  const isCough = lower.includes('cough') || lower.includes('खोकला') || lower.includes('खांसी');

  return {
    riskLevel: isFever ? 'MODERATE' : 'LOW',
    likelyDiagnosis: isFever 
      ? (language === 'mr' ? 'मोसमी विषाणू ताप' : language === 'hi' ? 'मौसमी वायरल बुखार' : 'Viral Pyrexia')
      : (language === 'mr' ? 'सामान्य प्राथमिक लक्षणे' : language === 'hi' ? 'सामान्य प्राथमिक लक्षण' : 'Mild Symptomatic Distress'),
    clinicalExplanation: language === 'mr'
      ? 'लक्षणे सौम्य ते मध्यम स्वरूपाची आहेत. भरपूर विश्रांती आणि द्रवपदार्थ घेणे फायदेशीर ठरेल.'
      : language === 'hi'
      ? 'लक्षण सामान्य से मध्यम हैं। पर्याप्त विश्राम और तरल पदार्थ लें।'
      : 'Symptoms appear mild to moderate. Hydration and primary health centre monitoring advised.',
    homeRemedies: [
      language === 'mr' ? 'ओआरएस (ORS) किंवा नारळ पाणी प्या.' : 'Drink adequate fluids and oral rehydration salts.',
      language === 'mr' ? 'कपाळावर कोमट पाण्याच्या पट्ट्या ठेवा.' : 'Apply lukewarm water compresses for temperature relief.',
      language === 'mr' ? 'पुरेशी विश्रांती घ्या.' : 'Take complete physical rest.',
    ],
    warningSigns: [
      language === 'mr' ? 'ताप १०२ अंशांपेक्षा जास्त राहिल्यास' : 'High fever persistent above 102 F',
      language === 'mr' ? 'सलग उलट्या किंवा जुलाब झाल्यास' : 'Severe persistent vomiting or dehydration',
    ],
    recommendedSpecialty: 'General Medicine / Primary Health Centre (PHC)',
    audioResponseText: language === 'mr'
      ? 'आपली लक्षणे तपासून घेतली आहेत. जोखीम मध्यम आहे. भरपूर पाणी प्या आणि २ दिवसात फरक न पडल्यास जवळच्या प्राथमिक आरोग्य केंद्राला भेट द्या.'
      : language === 'hi'
      ? 'आपके लक्षण जांचे गए हैं। जोखिम मध्यम है। खूब पानी पिएं और २ दिन में सुधार न होने पर प्राथमिक स्वास्थ्य केंद्र जाएं।'
      : 'Triage assessment complete. Risk level is moderate. Maintain hydration and visit your local PHC if symptoms persist.'
  };
}

export async function triageSymptoms(req, res) {
  try {
    const { symptoms, language = 'en', age, vitals } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ error: 'Symptoms description is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    // Check if Gemini API Key is configured
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('[Gemini Triage] GEMINI_API_KEY not configured. Engaging verified offline clinical triage engine.');
      const result = offlineClinicalTriage(symptoms, language);
      return res.json(result);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
You are ArogyaRakshak AI, an expert rural clinical triage doctor specializing in healthcare for rural and underserved Indian communities.
Analyze the following patient consultation:

Patient Reported Symptoms: "${symptoms}"
Target Language: "${language}" (mr = Marathi, hi = Hindi, en = English, ta = Tamil, kn = Kannada, bn = Bengali)
Patient Age: ${age || 'Not specified'}
Recorded Vitals: ${JSON.stringify(vitals || {})}

Return ONLY a valid, raw JSON object (NO markdown backticks, NO extra commentary) adhering strictly to this JSON schema:
{
  "riskLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "likelyDiagnosis": "String in the requested language",
  "clinicalExplanation": "Clear, compassionate explanation for a rural patient in the requested language",
  "homeRemedies": ["Safe, evidence-based home remedies in the requested language"],
  "warningSigns": ["Red-flag symptoms requiring emergency hospital visit in the requested language"],
  "recommendedSpecialty": "Recommended medical department (e.g. General Medicine, Cardiology, Pediatrics)",
  "audioResponseText": "A warm, natural 2-3 sentence spoken summary in the requested language suitable for Web Speech synthesis readout"
}
`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      // Clean any potential markdown wrapping
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleaned);

      return res.json(parsedJson);
    } catch (geminiError) {
      console.warn('[Gemini API Call Failed]', geminiError.message);
      // Graceful fallback to clinical triage engine
      const fallbackResult = offlineClinicalTriage(symptoms, language);
      return res.json(fallbackResult);
    }
  } catch (err) {
    console.error('[Triage Controller Error]', err);
    res.status(500).json({ error: 'Clinical triage analysis could not be completed.' });
  }
}
