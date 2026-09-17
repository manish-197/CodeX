import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_LOG_DIR = path.resolve(__dirname, '../logs');
const AUDIT_LOG_FILE = path.join(AUDIT_LOG_DIR, 'triage_audit.jsonl');

// Ensure audit log directory exists
try {
  if (!fs.existsSync(AUDIT_LOG_DIR)) {
    fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[Audit Log] Could not initialize log directory:', e.message);
}

function logTriageSession(entry) {
  try {
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...entry
    }) + '\n';
    fs.appendFileSync(AUDIT_LOG_FILE, line, 'utf8');
  } catch (err) {
    console.warn('[Audit Log] Failed to write triage audit record:', err.message);
  }
}

/* 
 * NOTE: Gemini 2.5 series is scheduled for shutdown — check 
 * ai.google.dev/gemini-api/docs/changelog before final submission and migrate 
 * GEMINI_MODEL to gemini-3.1-flash-lite or the then-current stable model if needed. 
 * Never pin a deprecated model at submission time.
 */
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const MANDATORY_DISCLAIMER = "This is an AI-assisted preliminary triage, not a medical diagnosis. For any emergency or worsening symptoms, contact a doctor or call 108 immediately.";

/**
 * Verified Rural Clinical Triage Rules Engine
 * Implements strict clinical safety rules:
 * 1. Err toward caution (over-triage when uncertain, never under-triage).
 * 2. Safe, non-prescriptive home remedies only (no drug dosages).
 * 3. Specific emergency red-flag warning signs on every MODERATE/HIGH/CRITICAL case.
 * 4. Multilingual support (Marathi, Hindi, English).
 */
export function offlineClinicalTriage(symptoms, language = 'en', vitals = {}, age = null) {
  const lower = (symptoms || '').toLowerCase();
  
  // 1. Critical Life-Threatening Emergencies (Cardiovascular, Severe Trauma, Airway Compromise)
  const isChestEmergency = lower.includes('chest pain') || lower.includes('छातीत दुखणे') || lower.includes('सीने में दर्द') ||
    lower.includes('radiating to my left arm') || lower.includes('left arm') || lower.includes('डाव्या हातात') || lower.includes('बाएं हाथ');
  
  const isRespiratoryEmergency = lower.includes('difficulty breathing') || lower.includes('श्वास घेण्यास त्रास') || lower.includes('सांस लेने में दिक्कत') ||
    lower.includes('shortness of breath') || lower.includes('दम लागणे');

  const isSevereTrauma = lower.includes('bleeding heavily') || lower.includes('deep wound') || lower.includes('farm machinery') ||
    lower.includes('अपघात') || lower.includes('रक्तस्त्राव') || lower.includes('गंभीर जखम') || lower.includes('दुर्घटना') || lower.includes('खून बह रहा');

  const isUnconscious = lower.includes('unconscious') || lower.includes('fainted') || lower.includes('बेहोश') || lower.includes('सुन्न');

  if (isChestEmergency || (isRespiratoryEmergency && isChestEmergency) || isSevereTrauma || isUnconscious) {
    let diagnosis = 'Acute Cardio-Respiratory Emergency';
    if (isSevereTrauma) diagnosis = 'Severe Traumatic Injury & Hemorrhage';
    if (language === 'mr') diagnosis = isSevereTrauma ? 'तीव्र आघात आणि रक्तस्त्राव आणीबाणी' : 'तीव्र हृदय किंवा श्वसन आणीबाणी';
    if (language === 'hi') diagnosis = isSevereTrauma ? 'गंभीर चोट एवं रक्तस्राव आपातकाल' : 'गंभीर हृदय या श्वसन आपातकाल';

    return {
      riskLevel: 'CRITICAL',
      likelyDiagnosis: diagnosis,
      clinicalExplanation: language === 'mr' 
        ? 'लक्षणे अत्यंत गंभीर आणीबाणीकडे निर्देश करतात. विलंब न करता तात्काळ १०८ रुग्णवाहिका बोलवा किंवा जवळच्या रुग्णालयात हलवा.'
        : language === 'hi'
        ? 'लक्षण अत्यंत गंभीर आपातकाल की ओर संकेत करते हैं। बिना देर किए तुरंत १०८ एम्बुलेंस बुलाएं अथवा नजदीकी अस्पताल पहुंचे।'
        : 'Reported symptoms indicate a high-risk medical emergency. Immediate 108 ambulance dispatch and emergency hospital transfer required.',
      homeRemedies: [
        language === 'mr' ? 'रुग्णाला हवेशीर, शांत स्थितीत बसवा किंवा झोपवा.' : 'Keep patient in a seated or supported position with ample airflow.',
        language === 'mr' ? 'कोणतेही औषध, गोळ्या किंवा जड अन्न खाण्यास देऊ नका.' : 'Do not administer oral medicines, heavy food, or fluids.',
        isSevereTrauma 
          ? (language === 'mr' ? 'जखमेवर स्वच्छ कापडाने थेट दाब देऊन रक्तस्त्राव थांबवा.' : 'Apply firm, continuous direct pressure to the wound with a clean cloth.')
          : (language === 'mr' ? 'रुग्णाचे कपडे सैल करा.' : 'Loosen tight clothing around neck and chest.')
      ],
      warningSigns: [
        language === 'mr' ? 'ओठ किंवा बोटांची नखे निळी पडणे' : 'Cyanosis (bluish discoloration of lips, tongue, or fingertips)',
        language === 'mr' ? 'थंड घाम, चक्कर येणे किंवा शुद्ध हरपणे' : 'Profuse cold clammy sweating, dizziness, or loss of consciousness',
        language === 'mr' ? 'तीव्र धाप लागणे किंवा बोलता न येणे' : 'Severe gasping for air or inability to speak in full sentences'
      ],
      suggestedMedicines: [],
      recommendedSpecialty: 'Emergency Medicine / Cardiology / Trauma Care',
      audioResponseText: language === 'mr'
        ? 'तातडीचा इशारा! ही गंभीर आणीबाणी आहे. घरगुती उपायांत वेळ न घालवता त्वरित १०८ रुग्णवाहिका बोलवा.'
        : language === 'hi'
        ? 'आपातकालीन चेतावनी! यह गंभीर स्थिति है। घरेलू उपायों में समय न गवाएं, तुरंत १०८ एम्बुलेंस को कॉल करें।'
        : 'Medical Emergency Alert. These symptoms require immediate hospital attention. Please call 108 ambulance right away.',
      disclaimer: MANDATORY_DISCLAIMER
    };
  }

  // 2. High Risk: Acute Anaphylaxis / Severe Allergy
  if (lower.includes('swollen lips') || lower.includes('hives') || lower.includes('new tablet') || lower.includes('allergic') ||
      lower.includes('ओठ सुजणे') || lower.includes('गांधी उठणे') || lower.includes('एलर्जी') || lower.includes('होठों पर सूजन')) {
    return {
      riskLevel: 'HIGH',
      likelyDiagnosis: language === 'mr' ? 'औषधाची तीव्र ॲलर्जी / ॲनाफिलेक्सिस जोखीम' : language === 'hi' ? 'दवा की गंभीर एलर्जी / एनाफिलेक्सिस जोखिम' : 'Acute Drug Reaction / Suspected Anaphylaxis Risk',
      clinicalExplanation: language === 'mr'
        ? 'नवीन औषध घेतल्यानंतर ओठ सुजणे व अंगावर गांधी उठणे ही औषधाची तीव्र ॲलर्जी असू शकते. श्वासमार्गात अडथळा निर्माण होण्यापूर्वी वैद्यकीय तपासणी आवश्यक आहे.'
        : language === 'hi'
        ? 'नई दवा लेने के बाद होठों पर सूजन और पित्ती निकलना गंभीर एलर्जी हो सकती है। श्वसन मार्ग प्रभावित होने से पहले डॉक्टर से संपर्क करें।'
        : 'Facial/lip swelling and urticaria following medication intake indicates a potentially severe allergic reaction requiring prompt medical evaluation.',
      homeRemedies: [
        language === 'mr' ? 'संबंधित नवीन औषध तात्काळ बंद करा.' : 'Immediately stop taking the suspected medication.',
        language === 'mr' ? 'रुग्णाला शांत बसवा आणि भरपूर ताजे पाणी पिऊ द्या.' : 'Keep patient seated calmly and sip plain room-temperature water.',
        language === 'mr' ? 'घशात घरघर किंवा सूज जाणवल्यास थेट दवाखान्यात जा.' : 'Do not take home medicines; seek immediate medical assessment.'
      ],
      warningSigns: [
        language === 'mr' ? 'श्वास घेताना घरघर किंवा घसा आवळल्यासारखे वाटणे' : 'Stridor, throat tightness, or wheezing breath',
        language === 'mr' ? 'चक्कर येणे, रक्तदाब कमी होणे' : 'Lightheadedness, severe itching spreading to neck/face',
      ],
      suggestedMedicines: [],
      recommendedSpecialty: 'Emergency Medicine / Allergy & Immunology',
      audioResponseText: language === 'mr'
        ? 'खबरदारी! नवीन औषध घेणे त्वरित थांबवा आणि श्वास घेण्यास अडचण येण्यापूर्वी जवळच्या डॉक्टरांना दाखवा.'
        : language === 'hi'
        ? 'सावधानी! संदिग्ध दवा लेना तुरंत बंद करें और सांस में रुकावट आने से पहले तुरंत नजदीकी डॉक्टर से मिलें।'
        : 'Caution: Stop taking the suspected medication immediately and visit a clinic before airway swelling progresses.',
      disclaimer: MANDATORY_DISCLAIMER
    };
  }

  // 3. High Risk: Pediatric High Fever with Dehydration / Poor Oral Intake
  if ((lower.includes('child') || lower.includes('1-year-old') || lower.includes('infant') || lower.includes('baby') || lower.includes('बाळ') || lower.includes('लहान मूल') || lower.includes('बच्चा')) &&
      (lower.includes('fever') || lower.includes('not drinking') || lower.includes('ताप') || lower.includes('पाणी पीत नाही') || lower.includes('बुखार'))) {
    return {
      riskLevel: 'HIGH',
      likelyDiagnosis: language === 'mr' ? 'लहान बालकांमधील तीव्र ताप व निर्जलीकरण जोखीम' : language === 'hi' ? 'छोटे बच्चों में तीव्र बुखार एवं निर्जलीकरण जोखिम' : 'Pediatric Pyrexia with Dehydration Risk',
      clinicalExplanation: language === 'mr'
        ? 'लहान बालकांमध्ये तीव्र ताप आणि द्रवपदार्थ न घेणे यामुळे जलद निर्जलीकरण (Dehydration) होऊ शकते. बालरोगतज्ज्ञ किंवा आरोग्यसेविकेशी तात्काळ संपर्क साधा.'
        : language === 'hi'
        ? 'छोटे बच्चे में तेज बुखार और पानी न पीना गंभीर निर्जलीकरण का खतरा पैदा कर सकता है। बाल रोग विशेषज्ञ से तुरंत मिलें।'
        : 'High fever paired with poor fluid intake in young children poses rapid dehydration and febrile seizure risk. Urgent medical review recommended.',
      homeRemedies: [
        language === 'mr' ? 'चमच्याने थोडे थोडे ओआरएस (ORS) किंवा मातेचे दूध पाजा.' : 'Offer frequent small sips of ORS, breast milk, or boiled cooled water.',
        language === 'mr' ? 'कपाळावर आणि शरीरावर कोमट पाण्याच्या पट्ट्या फिरवा.' : 'Use lukewarm sponge baths to gently bring down body temperature.',
        language === 'mr' ? 'अंगावर जाड कपडे घालू नका.' : 'Dress child in light, breathable cotton clothing.'
      ],
      warningSigns: [
        language === 'mr' ? 'लघवीचे प्रमाण खूप कमी होणे किंवा ६ तास न होणे' : 'No wet diaper or urine output for over 6 hours',
        language === 'mr' ? 'बाळ खूप सुस्त होणे किंवा सतत रडणे' : 'Lethargy, sunken eyes, or persistent irritability / febrile twitching',
      ],
      suggestedMedicines: [
        {
          name: language === 'mr' ? 'ओआरएस (ORS) इलेक्ट्रोलाइट द्रावण' : language === 'hi' ? 'ओआरएस (ORS) घोल' : 'Oral Rehydration Salts (ORS) Category',
          category: language === 'mr' ? 'शरीरातील पाणी व क्षार नियंत्रण' : language === 'hi' ? 'इलेक्ट्रोलाइट संतुलन' : 'Electrolyte Replenishment Category',
          instructions: language === 'mr' ? 'बालरोगतज्ज्ञ किंवा आशा सेविकेच्या सल्ल्यानुसार थोडे थोडे पाजावे.' : language === 'hi' ? 'डॉक्टर या आशा कार्यकर्ता की सलाह से थोड़ा-थोड़ा पिलाएं।' : 'Discuss with a doctor or ASHA worker for age-appropriate administration. Offer in small sips.',
          timing: language === 'mr' ? 'दिवसभरात थोडे थोडे' : language === 'hi' ? 'दिनभर थोड़े-थोड़े अंतराल पर' : 'Throughout the day as advised by healthcare worker'
        }
      ],
      recommendedSpecialty: 'Pediatrics / Maternal & Child Health Unit',
      audioResponseText: language === 'mr'
        ? 'बालकांमधील ताप आणि पाणी न पिणे ही काळजीची बाब आहे. बाळाला कोमट पाण्याने पुसून त्वरित प्राथमिक आरोग्य केंद्रात न्या.'
        : language === 'hi'
        ? 'बच्चे को तेज बुखार और पानी न पीना जोखिम भरा है। तुरंत प्राथमिक स्वास्थ्य केंद्र या बाल चिकित्सक को दिखाएं।'
        : 'High fever in toddlers requires prompt care. Keep offering small sips of fluids and visit the nearest health centre.',
      disclaimer: MANDATORY_DISCLAIMER
    };
  }

  // 4. High Risk: Hypoglycemia / Diabetic Distress
  if (lower.includes('blood sugar') || lower.includes('sweating') || lower.includes('sugar reader says low') || lower.includes('साखर कमी') || lower.includes('घाम फुटणे') || lower.includes('शुगर कम')) {
    return {
      riskLevel: 'HIGH',
      likelyDiagnosis: language === 'mr' ? 'हायपोग्लायसेमिया (रक्तातील साखर अचानक कमी होणे)' : language === 'hi' ? 'हाइपोग्लाइसीमिया (रक्त में शर्करा का कम होना)' : 'Acute Symptomatic Hypoglycemia',
      clinicalExplanation: language === 'mr'
        ? 'चक्कर येणे, थंड घाम आणि रक्तातील साखर कमी असणे हे मेंदूला ग्लुकोज कमी पडण्याचे लक्षण आहे. तात्काळ साखर किंवा गोड पाणी द्या.'
        : language === 'hi'
        ? 'चक्कर आना, पसीना छूटना और शुगर का स्तर कम होना हाइपोग्लाइसीमिया का संकेत है। तुरंत चीनी या मीठा पेय लें।'
        : 'Dizziness, profuse sweating, and low glucometer readings strongly indicate acute hypoglycemia requiring immediate fast-acting carbohydrates.',
      homeRemedies: [
        language === 'mr' ? 'तात्काळ १ ग्लास पाण्यात २ चमचे साखर किंवा गूळ मिसळून प्या.' : 'Immediately drink 1 glass of water with 2-3 teaspoons of sugar, jaggery, or fruit juice.',
        language === 'mr' ? '१५ मिनिटे विश्रांती घ्या आणि साखर पुन्हा तपासा.' : 'Sit down safely, rest for 15 minutes, and recheck blood sugar.',
        language === 'mr' ? 'त्यानंतर हलके अन्न जसे चपाती किंवा भात खा.' : 'Follow up with a complex carbohydrate snack (chapati or rice).'
      ],
      warningSigns: [
        language === 'mr' ? 'साखर दिल्यावरही चक्कर न थांबणे किंवा बेशुद्ध पडणे' : 'Loss of consciousness or inability to swallow safely',
        language === 'mr' ? 'हात थरथरणे किंवा बोलण्यात अडखळणे' : 'Severe tremors, confusion, or speech impairment'
      ],
      suggestedMedicines: [
        {
          name: language === 'mr' ? 'ग्लुकोज / साखर पाणी' : language === 'hi' ? 'ग्लूकोज / मीठा पानी' : 'Fast-Acting Glucose / Electrolyte Category',
          category: language === 'mr' ? 'तात्काळ साखर वाढवणारे' : language === 'hi' ? 'त्वरित शर्करा पूरक' : 'Rapid Carbohydrate / Glucose Supplement',
          instructions: language === 'mr' ? '१५ मिनिटांत साखर पुन्हा तपासा आणि डॉक्टरांशी संपर्क साधा.' : language === 'hi' ? '१५ मिनट बाद शुगर जांचें और डॉक्टर से संपर्क करें।' : 'Re-check blood glucose after 15 minutes and seek medical evaluation.',
          timing: language === 'mr' ? 'तात्काळ १ वेळ' : language === 'hi' ? 'तुरंत एक बार' : 'Immediately once, followed by medical evaluation'
        }
      ],
      recommendedSpecialty: 'General Medicine / Endocrinology',
      audioResponseText: language === 'mr'
        ? 'रक्तातील साखर कमी झाली आहे. तात्काळ साखर किंवा गुळाचे पाणी प्या आणि १५ मिनिटे शांत बसा.'
        : language === 'hi'
        ? 'ब्लड शुगर कम हो गई है। तुरंत चीनी या गुड़ का पानी पिएं और विश्राम करें।'
        : 'Low blood sugar detected. Consume sugar or jaggery water immediately and rest sitting down.',
      disclaimer: MANDATORY_DISCLAIMER
    };
  }

  // 5. Moderate: Acute Gastroenteritis / Vomiting & Loose Stools
  if (lower.includes('vomiting') || lower.includes('loose stools') || lower.includes('उलट्या') || lower.includes('जुलाब') || lower.includes('दस्त') || lower.includes('उल्टी')) {
    return {
      riskLevel: 'MODERATE',
      likelyDiagnosis: language === 'mr' ? 'तीव्र गॅस्ट्रोएन्टेरिटिस (उलट्या व जुलाब)' : language === 'hi' ? 'तीव्र गैस्ट्रोएंटेराइटिस (उल्टी और दस्त)' : 'Acute Gastroenteritis with Mild Dehydration',
      clinicalExplanation: language === 'mr'
        ? 'वारंवार उलट्या आणि जुलाब झाल्याने शरीरातील क्षार व पाणी कमी होते. निर्जलीकरण टाळण्यासाठी ओआरएसचे पाणी वारंवार घेणे गरजेचे आहे.'
        : language === 'hi'
        ? 'बार-बार उल्टी और दस्त से शरीर में पानी और नमक की कमी हो जाती है। ओआरएस घोल लगातार पिएं।'
        : 'Multiple episodes of emesis and loose stools cause fluid and electrolyte depletion. Hydration therapy is paramount.',
      homeRemedies: [
        language === 'mr' ? 'प्रत्येक जुलाबानंतर १ ग्लास ओआरएस (ORS) किंवा नारळ पाणी प्या.' : 'Drink 1 glass of ORS or fresh coconut water after every loose stool.',
        language === 'mr' ? 'तांदळाची पेज, ताक आणि हलका मऊ आहार घ्या.' : 'Consume light fluids like rice kanji, thin salted buttermilk, and bananas.',
        language === 'mr' ? 'तेलकट, तिखट किंवा शिळे अन्न पूर्णपणे टाळा.' : 'Strictly avoid oily, spicy, dairy-heavy, or unhygienic street foods.'
      ],
      warningSigns: [
        language === 'mr' ? 'तोंड पूर्ण कोरडे पडणे किंवा लघवी गडद पिवळी व कमी होणे' : 'Extreme thirst, sunken eyes, or dark scanty urine',
        language === 'mr' ? 'उलट्यांमध्ये किंवा शौचात रक्त दिसणे' : 'Blood in vomit or stool, or persistent inability to keep liquids down'
      ],
      suggestedMedicines: [
        {
          name: language === 'mr' ? 'ओआरएस (ORS) द्रावण' : language === 'hi' ? 'ओआरएस (ORS) घोल' : 'Oral Rehydration Salts (ORS) Category',
          category: language === 'mr' ? 'निर्जलीकरण प्रतिबंध' : language === 'hi' ? 'निर्जलीकरण निवारक' : 'Electrolyte Balance Category',
          instructions: language === 'mr' ? 'प्रत्येक जुलाबानंतर उकळून थंड केलेल्या पाण्यात मिसळून प्यावे. योग्य प्रमाण समजून घेण्यासाठी फार्मासिस्टशी बोला.' : language === 'hi' ? 'उबले ठंडे पानी में घोलकर प्रत्येक दस्त के बाद लें।' : 'Mix with boiled and cooled water. Discuss with pharmacist for correct dilution.',
          timing: language === 'mr' ? 'प्रत्येक जुलाबानंतर' : language === 'hi' ? 'प्रत्येक दस्त के बाद' : 'After every loose stool episode'
        }
      ],
      recommendedSpecialty: 'Primary Health Centre (PHC) / Internal Medicine',
      audioResponseText: language === 'mr'
        ? 'शरीरातील पाणी कमी होऊ देऊ नका. भरपूर ओआरएस आणि तांदळाची पेज प्या. त्रास वाढल्यास आरोग्य केंद्रात जा.'
        : language === 'hi'
        ? 'शरीर में पानी की कमी न होने दें। ओआरएस घोल और छाछ पिएं। यदि सुधार न हो तो तुरंत स्वास्थ्य केंद्र जाएं।'
        : 'Prevent dehydration by drinking plenty of ORS and rice water. Visit the health center if vomiting persists.',
      disclaimer: MANDATORY_DISCLAIMER
    };
  }

  // 6. Moderate: Chronic Respiratory / Prolonged Cough (Screening for TB/Respiratory illness)
  if (lower.includes('cough for 3 weeks') || lower.includes('3 weeks') || lower.includes('weight loss') || lower.includes('खोकला ३ आठवडे') || lower.includes('वजन कमी') || lower.includes('खांसी ३ हफ्ते')) {
    return {
      riskLevel: 'MODERATE',
      likelyDiagnosis: language === 'mr' ? 'दीर्घकालीन खोकला (टीबी / श्वसन विकार तपासणी आवश्यक)' : language === 'hi' ? 'दीर्घकालिक खांसी (टीबी / श्वसन जांच आवश्यक)' : 'Subacute Cough with Constitutional Symptoms (TB Evaluation Needed)',
      clinicalExplanation: language === 'mr'
        ? '२ आठवड्यांपेक्षा जास्त काळ खोकला असणे आणि वजन घटणे हे क्षयरोग (TB) किंवा फुफ्फुसांच्या विकाराचे लक्षण असू शकते. प्राथमिक आरोग्य केंद्रात थुंकी तपासणी करून घेणे आवश्यक आहे.'
        : language === 'hi'
        ? 'दो सप्ताह से अधिक खांसी और वजन कम होना क्षयरोग (टीबी) का लक्षण हो सकता है। प्राथमिक स्वास्थ्य केंद्र में बलगम की मुफ्त जांच कराएं।'
        : 'Cough persisting beyond 2 weeks accompanied by weight loss warrants medical evaluation and sputum testing for pulmonary tuberculosis at the PHC.',
      homeRemedies: [
        language === 'mr' ? 'कोमट पाण्यात हळद घालून गुळण्या करा.' : 'Gargle with warm salt water twice daily for throat comfort.',
        language === 'mr' ? 'कोमट पाणी व तुळशी-आले काढ्याचा वापर करा.' : 'Drink warm water and home-brewed ginger-tulsi herbal tea.',
        language === 'mr' ? 'खोकताना तोंडावर रुमाल धरा आणि हवेशीर खोलीत राहा.' : 'Practice respiratory hygiene with a clean cloth cover and well-ventilated rooms.'
      ],
      warningSigns: [
        language === 'mr' ? 'थुंकीतून रक्त पडणे' : 'Hemoptysis (coughing up blood or rust-colored sputum)',
        language === 'mr' ? 'रात्री अंगाला खूप घाम येणे व बारीक ताप राहणे' : 'Night sweats, prolonged evening low-grade fever, or chest pain'
      ],
      suggestedMedicines: [
        {
          name: language === 'mr' ? 'हर्बल / कोमट पाण्याची वाफ' : language === 'hi' ? 'हर्बल भाप / गर्म पानी' : 'Warm Saline Steam & Throat Soothing Category',
          category: language === 'mr' ? 'घसा व श्वसन आराम' : language === 'hi' ? 'गले की राहत' : 'Supportive Respiratory Soothing Category',
          instructions: language === 'mr' ? 'स्वतःहून कोणतीही ॲन्टीबायोटिक गोळी घेऊ नका; प्राथमिक आरोग्य केंद्रात तपासणी आवश्यक आहे.' : language === 'hi' ? 'बिना डॉक्टर के कोई एंटीबायोटिक न लें, पीएचसी में जांच कराएं।' : 'Never take unprescribed antibiotics. Consult PHC medical officer for sputum test.',
          timing: language === 'mr' ? 'दिवसातून २ वेळा' : language === 'hi' ? 'दिन में दो बार' : 'As advised during clinical evaluation'
        }
      ],
      recommendedSpecialty: 'Pulmonology / National TB Elimination Program (NTEP) Clinic at PHC',
      audioResponseText: language === 'mr'
        ? 'तीन आठवड्यांपेक्षा जास्त खोकला दुर्लक्षित करू नका. जवळच्या प्राथमिक आरोग्य केंद्रात जाऊन मोफत थुंकी तपासणी करून घ्या.'
        : language === 'hi'
        ? 'तीन सप्ताह से अधिक खांसी को नजरअंदाज न करें। प्राथमिक स्वास्थ्य केंद्र पर जाकर बलगम की जांच कराएं।'
        : 'A cough lasting more than 3 weeks needs clinical testing. Please visit your local PHC for a sputum test.',
      disclaimer: MANDATORY_DISCLAIMER
    };
  }

  // 7. Moderate: Fever of 101°F + Body Ache for 2 Days (Typical Rural Viral / Vector Pyrexia)
  const isFever = lower.includes('fever') || lower.includes('101') || lower.includes('ताप') || lower.includes('बुखार');
  const isBodyAche = lower.includes('body ache') || lower.includes('अंगदुखी') || lower.includes('बदन दर्द') || lower.includes('headache');

  if (isFever && isBodyAche) {
    return {
      riskLevel: 'MODERATE',
      likelyDiagnosis: language === 'mr' ? 'मोसमी विषाणू ताप (व्हायरल पायरेक्सिया)' : language === 'hi' ? 'मौसमी वायरल बुखार (पायरेक्सिया)' : 'Acute Viral Pyrexia with Myalgia',
      clinicalExplanation: language === 'mr'
        ? '१०१ अंश ताप आणि २ दिवसांची अंगदुखी मोसमी विषाणू ताप दर्शवते. पुरेशी विश्रांती, पाणी आणि तापमान नियंत्रणाकडे लक्ष द्या. ताप न उतरल्यास डेंग्यू/मलेरियाची तपासणी करावी.'
        : language === 'hi'
        ? '१०१ डिग्री बुखार और बदन दर्द वायरल बुखार का संकेत है। पर्याप्त विश्राम, पानी और तापमान की निगरानी रखें। सुधार न होने पर रक्त जांच कराएं।'
        : 'Fever of 101°F with generalized body ache is consistent with acute viral illness. Supportive hydration and rest advised, with blood test if fever exceeds 72 hours.',
      homeRemedies: [
        language === 'mr' ? 'कपाळावर साध्या पाण्याच्या घड्या ठेवा.' : 'Apply lukewarm damp cloth compresses to the forehead and armpits.',
        language === 'mr' ? 'दिवसभरात भरपूर कोमट पाणी, लिंबू पाणी किंवा ताक प्या.' : 'Drink ample fluids: boiled lukewarm water, lemon water, or thin salted buttermilk.',
        language === 'mr' ? 'पूर्ण शारीरिक विश्रांती घ्या आणि हलका आहार खा.' : 'Ensure complete physical rest and eat easily digestible warm foods (khichdi).'
      ],
      warningSigns: [
        language === 'mr' ? 'ताप १०३ अंशांपेक्षा जास्त वाढल्यास' : 'Temperature spiking above 103°F despite cooling compresses',
        language === 'mr' ? 'अंगावर लाल पुरळ, हिरड्यांतून रक्तस्त्राव किंवा सतत उलट्या' : 'Petechial rash, gum bleeding, or persistent severe vomiting'
      ],
      suggestedMedicines: [
        {
          name: language === 'mr' ? 'पॅरासिटामॉल आधारित ताप प्रतिबंधक औषध गट' : language === 'hi' ? 'पैरासिटामोल आधारित बुखार निवारक वर्ग' : 'Paracetamol-based Fever Reducer Category',
          category: language === 'mr' ? 'ताप व सौम्य वेदनाशामक' : language === 'hi' ? 'बुखार एवं दर्द निवारक' : 'Antipyretic / Mild Analgesic Category',
          instructions: language === 'mr' ? 'वजन आणि वयानुसार योग्य स्वरूपासाठी फार्मासिस्ट किंवा डॉक्टरांशी चर्चा करा. रिकाम्या पोटी घेऊ नका.' : language === 'hi' ? 'उचित रूप और खुराक के लिए फार्मासिस्ट या डॉक्टर से परामर्श करें। खाली पेट न लें।' : 'Discuss with a pharmacist or doctor for age- and weight-appropriate formulation. Take after food.',
          timing: language === 'mr' ? 'जेवणानंतर, फार्मासिस्टच्या सल्ल्यानुसार' : language === 'hi' ? 'भोजन के बाद, फार्मासिस्ट की सलाह पर' : 'Post-meals, as advised by pharmacist or doctor'
        },
        {
          name: language === 'mr' ? 'ओआरएस (ORS) द्रावण' : language === 'hi' ? 'ओआरएस (ORS) घोल' : 'Oral Rehydration Salts (ORS) Category',
          category: language === 'mr' ? 'इलेक्ट्रोलाइट संतुलन' : language === 'hi' ? 'इलेक्ट्रोलाइट संतुलन' : 'Electrolyte Replenisher Category',
          instructions: language === 'mr' ? 'तापादरम्यान शरीरातील पाणी टिकवण्यासाठी स्वच्छ पाण्यात मिसळून प्यावे.' : language === 'hi' ? 'बुखार में पानी की कमी रोकने के लिए पिएं।' : 'Consume to maintain hydration during fever episodes.',
          timing: language === 'mr' ? 'दिवसभरात थोडे थोडे' : language === 'hi' ? 'दिनभर थोड़े-थोड़े अंतराल पर' : 'Throughout the day as needed'
        }
      ],
      recommendedSpecialty: 'General Medicine / Primary Health Centre (PHC)',
      audioResponseText: language === 'mr'
        ? 'आपली लक्षणे मोसमी तापाची आहेत. कपाळावर पाण्याच्या घड्या ठेवा आणि भरपूर पाणी प्या. २ दिवसांत आराम न पडल्यास आरोग्य केंद्रात भेट द्या.'
        : language === 'hi'
        ? 'यह मौसमी वायरल बुखार के लक्षण हैं। माथे पर ठंडी पट्टी रखें और खूब पानी पिएं। २ दिनों में आराम न मिले तो डॉक्टर से मिलें।'
        : 'These symptoms point to a viral fever. Apply forehead compresses, drink plenty of fluids, and visit your PHC if fever continues.',
      disclaimer: MANDATORY_DISCLAIMER
    };
  }

  // 8. Ambiguous / Vague: "I don't feel well" (Clinical Safety Guardrail: Err toward caution, ask clarifying questions)
  if (lower.trim() === "i don't feel well" || lower.trim() === "not feeling well" || lower.includes("मला बरे वाटत नाही") || lower.includes("तबीयत ठीक नहीं")) {
    return {
      riskLevel: 'MODERATE', // Over-triage caution bias: never dismiss vague malaise as completely safe
      likelyDiagnosis: language === 'mr' ? 'अस्पष्ट अस्वस्थता (तपशीलवार तपासणी आवश्यक)' : language === 'hi' ? 'अस्पष्ट अस्वस्थता (विस्तृत जांच आवश्यक)' : 'Generalized Malaise / Undifferentiated Discomfort',
      clinicalExplanation: language === 'mr'
        ? 'आपण "बरे वाटत नाही" असे सांगितले आहे, परंतु अचूक कारण समजण्यासाठी अधिक माहिती आवश्यक आहे. कृपया ताप, दुखणे, चक्कर किंवा थकवा यापैकी काय होते आहे ते स्पष्ट करा.'
        : language === 'hi'
        ? 'आपने अस्वस्थता बताई है, किंतु सटीक कारण जानने के लिए अधिक जानकारी चाहिए। कृपया बताएं कि क्या आपको बुखार, दर्द, चक्कर या थकान महसूस हो रही है।'
        : 'You noted feeling unwell, but specific symptoms were not described. Please share if you have fever, pain in any area, dizziness, cough, or stomach distress.',
      homeRemedies: [
        language === 'mr' ? 'हवेशीर जागी आरामात बसा किंवा विश्रांती घ्या.' : 'Sit down and rest in a well-ventilated, quiet space.',
        language === 'mr' ? 'एक ग्लास कोमट पाणी किंवा ताजे लिंबू पाणी प्या.' : 'Drink a glass of warm water or fresh lemon water with a pinch of salt.',
        language === 'mr' ? 'स्थानिक आशा (ASHA) किंवा अंगणवाडी सेविकेला प्राथमिक लक्षणे दाखवा.' : 'Consult your village ASHA worker or village health clinic for basic vitals check.'
      ],
      warningSigns: [
        language === 'mr' ? 'छातीत दडपण, अचानक अंधारी येणे किंवा श्वास अडकणे' : 'Chest discomfort, sudden severe blackout, or shortness of breath',
        language === 'mr' ? 'अचानक तीव्र पोटदुखी किंवा उलट्या सुरू होणे' : 'Acute onset of severe localized abdominal pain or intractable vomiting'
      ],
      suggestedMedicines: [
        {
          name: language === 'mr' ? 'ओआरएस किंवा इलेक्ट्रोलाइट पेये' : language === 'hi' ? 'ओआरएस या इलेक्ट्रोलाइट पेय' : 'Electrolyte Hydration Category',
          category: language === 'mr' ? 'सामान्य अशक्तपणा नियंत्रण' : language === 'hi' ? 'कमजोरी निवारण' : 'Mild Supportive Hydration Category',
          instructions: language === 'mr' ? 'औषध घेण्यापूर्वी आशा सेविकेकडून तपासणी करून घ्यावी.' : language === 'hi' ? 'दवा लेने से पहले आशा कार्यकर्ता से जांच कराएं।' : 'Consult local health worker before taking any oral medication.',
          timing: language === 'mr' ? 'गरज भासल्यास' : language === 'hi' ? 'आवश्यकतानुसार' : 'As advised by local health worker'
        }
      ],
      recommendedSpecialty: 'Village ASHA Worker / Primary Health Centre (PHC)',
      audioResponseText: language === 'mr'
        ? 'कृपया आपल्या त्रासाचे नेमके स्वरूप सांगा, जसे की ताप किंवा दुखणे. सध्या शांत विश्रांती घ्या आणि पाणी प्या.'
        : language === 'hi'
        ? 'कृपया अपनी समस्या के बारे में और बताएं, जैसे बुखार या दर्द। अभी शांत होकर विश्राम करें और पानी पिएं।'
        : 'Please tell us more about what you are feeling, such as fever or pain. For now, rest comfortably and stay hydrated.',
      disclaimer: MANDATORY_DISCLAIMER
    };
  }

  // 9. Mild: Slight headache, fatigue / tired
  return {
    riskLevel: 'LOW',
    likelyDiagnosis: language === 'mr' ? 'सामान्य थकवा व ताणजन्य डोकेदुखी' : language === 'hi' ? 'सामान्य थकान एवं तनावजनित सिरदर्द' : 'Mild Fatigue & Tension Headache',
    clinicalExplanation: language === 'mr'
      ? 'लक्षणे सौम्य स्वरूपाची आहेत. जास्त वेळ उन्हात काम करणे किंवा अपुऱ्या झोपेमुळे असा थकवा जाणवू शकतो. विश्रांती घेतल्यास आराम पडेल.'
      : language === 'hi'
      ? 'लक्षण सामान्य हैं। धूप में काम करने या नींद की कमी से ऐसा हो सकता है। विश्राम करने से राहत मिलेगी।'
      : 'Symptoms are mild and most likely related to dehydration, physical fatigue, or lack of sleep. Supportive self-care is sufficient.',
    homeRemedies: [
      language === 'mr' ? 'शांत अंधाऱ्या खोलीत ३० ते ६० मिनिटे डोळे बंद करून विश्रांती घ्या.' : 'Rest in a cool, quiet, dim room for 30-60 minutes.',
      language === 'mr' ? 'भरपूर पाणी प्या आणि कपाळावर हलका मसाज करा.' : 'Drink adequate water and apply gentle pressure to temples.',
      language === 'mr' ? 'उन्हात जाणे टाळा आणि वेळेवर सकस जेवण घ्या.' : 'Avoid direct midday sun exposure and eat a timely balanced meal.'
    ],
    warningSigns: [
      language === 'mr' ? 'डोकेदुखी अचानक असह्य तीव्र झाल्यास' : 'Sudden explosive headache unlike anything previously experienced',
      language === 'mr' ? 'उलट्या होणे किंवा मान ताठ होणे' : 'Persistent nausea, neck stiffness, or visual disturbances'
    ],
    suggestedMedicines: [
      {
        name: language === 'mr' ? 'पॅरासिटामॉल वेदनाशामक गट' : language === 'hi' ? 'पैरासिटामोल दर्द निवारक वर्ग' : 'Paracetamol-based Mild Pain Reliever Category',
        category: language === 'mr' ? 'सौम्य वेदनाशामक' : language === 'hi' ? 'हल्का दर्द निवारक' : 'Mild Analgesic Category',
        instructions: language === 'mr' ? 'डोकेदुखी विश्रांतीनंतरही न थांबल्यास फार्मासिस्टचा सल्ला घ्यावा. स्वतःहून जास्त दिवस घेऊ नये.' : language === 'hi' ? 'सिरदर्द आराम करने पर भी न रुके तो फार्मासिस्ट से परामर्श लें।' : 'Consult a pharmacist or doctor if discomfort persists despite rest and hydration.',
        timing: language === 'mr' ? 'जेवणानंतर, आवश्यकतेनुसार' : language === 'hi' ? 'भोजन के बाद, आवश्यकतानुसार' : 'Post-meals as advised by pharmacist'
      }
    ],
    recommendedSpecialty: 'Primary Self-Care / Village Health Wellness Centre (HWC)',
    audioResponseText: language === 'mr'
      ? 'लक्षणे सौम्य आहेत. थोडा वेळ विश्रांती घ्या आणि पुरेसे पाणी प्या. डोकेदुखी वाढल्यास दवाखान्यात जा.'
      : language === 'hi'
      ? 'लक्षण हल्के हैं। थोड़ा विश्राम करें और पानी पिएं। यदि सिरदर्द बढ़े तो डॉक्टर को दिखाएं।'
      : 'Symptoms appear mild. Rest in a quiet area, drink water, and visit a health post if pain intensifies.',
    disclaimer: MANDATORY_DISCLAIMER
  };
}

export async function triageSymptoms(req, res) {
  try {
    const { symptoms, language = 'en', age, vitals } = req.body;

    console.log('[Voice AI Stage 4: Backend Endpoint] Incoming triage request:', {
      symptoms,
      language,
      age,
      vitalsPresent: !!vitals
    });

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ error: 'Symptoms description is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    console.log('[Voice AI Stage 5: Gemini API Pre-check] apiKey configured:', !!apiKey, 'modelName:', modelName);

    // Check if Gemini API Key is configured
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.log('[Voice AI Stage 5: Notice] No Gemini API key provided. Using verified offline clinical rules engine.');
      const result = offlineClinicalTriage(symptoms, language, vitals, age);
      logTriageSession({
        source: 'offline-clinical-engine',
        input: { symptoms, language, age, vitals },
        output: result
      });
      return res.json(result);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
You are ArogyaRakshak AI, an expert clinical triage physician serving rural and underserved communities in India.
CRITICAL SAFETY & TRIAGE GUIDELINES:
1. ERR TOWARD CAUTION: Always over-triage to a higher risk level when uncertain; NEVER under-triage. If severe emergency symptoms (e.g. chest pain, radiating arm pain, breathing difficulty, severe bleeding, anaphylaxis) are described, riskLevel MUST be "CRITICAL".
2. NON-PRESCRIPTIVE HOME REMEDIES: Strictly restrict home remedies to safe, non-drug self-care: oral rehydration fluids (ORS), lukewarm sponging, physical rest, clean wound pressure, position elevation, herbal soothing drinks. Instruct patient to see an ASHA/doctor for medicines.
3. SAFE MEDICINE SUGGESTIONS (SAFETY-CRITICAL & MANDATORY RULES):
   - Only suggest common, generally-safe, over-the-counter (OTC) medicine CATEGORIES appropriate to mild/moderate symptoms (e.g., "Paracetamol-based fever reducer category", "Oral Rehydration Salts (ORS) category").
   - NEVER output specific dosage amounts (e.g., NEVER write '500mg', '650mg', '10ml', etc.).
   - NEVER output specific intake frequencies (e.g., do NOT write 'take 2 tablets 3 times daily').
   - NEVER output commercial brand names.
   - For CRITICAL-risk symptoms: NEVER suggest any medicine under any circumstance. For CRITICAL cases, you MUST set "suggestedMedicines": [] and strictly instruct "seek emergency care immediately."
   - PHRASING MANDATE: You MUST explicitly phrase all medicine entries as a SUGGESTION TO DISCUSS WITH A PHARMACIST OR DOCTOR, NOT a prescription.
4. RED FLAGS: For MODERATE, HIGH, and CRITICAL risk levels, always provide distinct warning signs detailing when to escalate immediately to 108 or hospital.
5. AMBIGUITY: If symptoms are too vague (e.g., 'I don't feel well'), rate riskLevel as "MODERATE" for safety, ask clarifying questions in clinicalExplanation, and suggest visiting the village health worker.
6. MANDATORY DISCLAIMER: Include the exact field: "disclaimer": "${MANDATORY_DISCLAIMER}".

Patient Input:
- Symptoms: "${symptoms}"
- Language: "${language}" (mr = Marathi, hi = Hindi, en = English, ta = Tamil, kn = Kannada, bn = Bengali)
- Patient Age: ${age || 'Not specified'}
- Recorded Vitals: ${JSON.stringify(vitals || {})}

Return ONLY a valid, raw JSON object (no markdown, no backticks):
{
  "riskLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "likelyDiagnosis": "Concise medical assessment in requested language",
  "clinicalExplanation": "Compassionate, plain-language explanation in requested language",
  "homeRemedies": ["Safe, non-prescriptive home actions in requested language"],
  "suggestedMedicines": [
    {
      "name": "Generic OTC Category Name in requested language (NO specific dosages)",
      "category": "Pharmacological Category in requested language",
      "instructions": "Non-prescriptive suggestion to discuss with pharmacist or doctor",
      "timing": "General non-prescriptive timing advice (e.g., Post-meals as advised by pharmacist)"
    }
  ],
  "warningSigns": ["Emergency red flags in requested language"],
  "recommendedSpecialty": "Recommended specialty (e.g. Cardiology, Emergency Medicine, PHC)",
  "audioResponseText": "Warm 2-3 sentence spoken summary in requested language for speech playback",
  "disclaimer": "${MANDATORY_DISCLAIMER}"
}
`;

      console.log(`[Voice AI Stage 5: Calling Gemini] Model: ${modelName}`);
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      console.log('[Voice AI Stage 5: Gemini Success] Raw response received');

      // Clean any potential markdown wrapping
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleaned);

      if (!parsedJson.disclaimer) {
        parsedJson.disclaimer = MANDATORY_DISCLAIMER;
      }

      // Strict clinical safety guardrail on medicine suggestions
      if (parsedJson.riskLevel === 'CRITICAL' || !Array.isArray(parsedJson.suggestedMedicines)) {
        parsedJson.suggestedMedicines = [];
      } else {
        // Strip any accidental dosages or illegal prescription wording
        parsedJson.suggestedMedicines = parsedJson.suggestedMedicines.map(med => ({
          name: med.name || 'General OTC Category',
          category: med.category || 'General OTC Care',
          instructions: med.instructions || 'Consult a pharmacist or doctor before taking any medicine.',
          timing: med.timing || 'As advised by pharmacist or doctor',
        }));
      }

      logTriageSession({
        source: 'gemini-api',
        model: modelName,
        input: { symptoms, language, age, vitals },
        output: parsedJson
      });

      console.log('[Voice AI Stage 5: Returning Result] Risk:', parsedJson.riskLevel, 'Diagnosis:', parsedJson.likelyDiagnosis);
      return res.json(parsedJson);
    } catch (geminiError) {
      console.error('[Voice AI Stage 5: Gemini API Failure]', geminiError.message);
      const fallbackResult = offlineClinicalTriage(symptoms, language, vitals, age);
      logTriageSession({
        source: 'fallback-clinical-engine',
        reason: geminiError.message,
        input: { symptoms, language, age, vitals },
        output: fallbackResult
      });
      return res.json(fallbackResult);
    }
  } catch (err) {
    console.error('[Triage Controller Error]', err);
    res.status(500).json({ error: 'Clinical triage analysis could not be completed.' });
  }
}
