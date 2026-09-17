import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Stethoscope, 
  Activity, 
  Heart, 
  Info,
  Calendar,
  Pill,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import PrescriptionResultModal from './PrescriptionResultModal';

// Comprehensive 3-Tier Multilingual Symptom Catalog
export const SYMPTOM_CATALOG = {
  level1: {
    level: 1,
    badgeColor: 'bg-health-green/20 text-health-green border-health-green/30',
    items: [
      {
        id: 'cold_runny_nose',
        name: {
          en: 'Common Cold / Runny Nose',
          mr: 'सर्दी-पडसे (Common Cold)',
          hi: 'सर्दी-जुकाम / बहती नाक',
          ta: 'சளி / மூக்கு ஒழுகுதல்',
          kn: 'ನೆಗಡಿ / ಮೂಗು ಸೋರುವುದು',
          bn: 'সর্দি / নাক দিয়ে জল পড়া',
        },
        desc: {
          en: 'Runny nose, frequent sneezing, dry throat, and mild nasal congestion.',
          mr: 'नाक वाहणे, सतत शिंका येणे, घसा कोरडा पडणे व हलका कफ.',
          hi: 'नाक बहना, लगातार छींकें आना, गला सूखना और नाक बंद होना।',
          ta: 'மூக்கு ஒழுகுதல், தும்மல் மற்றும் லேசான தொண்டை வறட்சி.',
          kn: 'ಮೂಗು ಸೋರುವುದು, ಸೀನುವಿಕೆ ಮತ್ತು ಗಂಟಲು ನೋವು.',
          bn: 'নাক দিয়ে জল পড়া, ঘন ঘন হাঁচি ও গলা শুকিয়ে যাওয়া।',
        },
        category: {
          en: 'Respiratory (श्वसन)',
          mr: 'श्वसन (Respiratory)',
          hi: 'श्वसन (Respiratory)',
          ta: 'சுவாசம் (Respiratory)',
          kn: 'ಉಸಿರಾಟ (Respiratory)',
          bn: 'শ্বাসযন্ত্র (Respiratory)',
        },
        rxGenericEn: 'Tab. Cetirizine 10mg (Antihistamine)',
        rxNameLocal: {
          en: 'Tab. Cetirizine 10mg',
          mr: 'सिट्रिझिन १० मि.ग्रॅ. गोळी (Cetirizine)',
          hi: 'सिट्रीजीन १० मि.ग्रा. गोली (Cetirizine)',
          ta: 'செட்டிரிசின் 10 மிகி மாத்திரை',
          kn: 'ಸೆಟಿರಿಜಿನ್ 10 ಮಿಲಿಗ್ರಾಂ ಮಾತ್ರೆ',
          bn: 'সেটিরিজিন ১০ মিগ্রা ট্যাবলেট',
        },
        dosage: '1 Tablet',
        instructionsEn: '1 tablet at bedtime with warm water for 2 days.',
        instructionsLocal: {
          en: '1 tablet at bedtime with warm water for 2 days.',
          mr: '१ गोळी रात्री झोपताना कोमट पाण्यासोबत [२ दिवस].',
          hi: '१ गोली रात को सोते समय गुनगुने पानी के साथ [२ दिन]।',
          ta: 'இரவு படுக்கைக்கு முன் 1 மாத்திரை வெதுவெதுப்பான நீருடன் [2 நாட்கள்].',
          kn: 'ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ 1 ಮಾತ್ರೆ ಬೆಚ್ಚಗಿನ ನೀರಿನೊಂದಿಗೆ [2 ದಿನಗಳು].',
          bn: 'রাতে ঘুমানোর আগে ১টি ট্যাবলেট ঈষদুষ্ণ জলের সাথে [২ দিন]।',
        },
        timing: { morning: false, afternoon: false, night: true },
        remedy: {
          en: 'Take steam inhalation twice daily and sip warm water.',
          mr: 'गरम पाण्याची वाफ (Steam inhalation) दिवसातून दोनदा घ्या व कोमट पाणी प्या.',
          hi: 'दिन में दो बार गर्म पानी की भाप लें और गुनगुना पानी पिएं।',
          ta: 'தினமும் இரண்டு முறை நீராவி பிடிக்கவும் மற்றும் வெதுவெதுப்பான நீர் அருந்தவும்.',
          kn: 'ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಹಬೆ ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ಬೆಚ್ಚಗಿನ ನೀರನ್ನು ಕುಡಿಯಿರಿ.',
          bn: 'দিনে দুবার গরম জলের ভাপ নিন এবং কুসুম গরম জল পান করুন।',
        }
      },
      {
        id: 'mild_headache',
        name: {
          en: 'Mild Tension Headache',
          mr: 'सौम्य डोकेदुखी (Tension Headache)',
          hi: 'हल्का सिरदर्द (Tension Headache)',
          ta: 'லேசான தலைவலி',
          kn: 'ಸೌಮ್ಯ ತಲೆನೋವು',
          bn: 'হালকা মাথাব্যথা',
        },
        desc: {
          en: 'Dull ache across forehead, eyestrain, mild tiredness after work.',
          mr: 'कपाळ किंवा डोके हलके दुखणे, थकवा, डोळ्यांवर ताण जाणवणे.',
          hi: 'माथे में हल्का दर्द, आंखों में खिंचाव, काम के बाद थकान।',
          ta: 'நெற்றியில் லேசான வலி மற்றும் கண் சோர்வு.',
          kn: 'ಹಣೆಯಲ್ಲಿ ಸೌಮ್ಯ ನೋವು ಮತ್ತು ಕಣ್ಣಿನ ಆಯಾಸ.',
          bn: 'কপালে হালকা ব্যথা, চোখের ওপর চাপ ও ক্লান্তি।',
        },
        category: {
          en: 'General (सामान्य)',
          mr: 'सामान्य (General)',
          hi: 'सामान्य (General)',
          ta: 'பொதுவானது (General)',
          kn: 'ಸಾಮಾನ್ಯ (General)',
          bn: 'সাধারণ (General)',
        },
        rxGenericEn: 'Tab. Paracetamol 500mg (Analgesic)',
        rxNameLocal: {
          en: 'Tab. Paracetamol 500mg',
          mr: 'पॅरासिटामॉल ५०० मि.ग्रॅ. (Paracetamol)',
          hi: 'पैरासिटामोल ५०० मि.ग्रा. (Paracetamol)',
          ta: 'பாராசிட்டமால் 500 மிகி மாத்திரை',
          kn: 'ಪ್ಯಾರಸಿಟಮಾಲ್ 500 ಮಿಲಿಗ್ರಾಂ ಮಾತ್ರೆ',
          bn: 'প্যারাসিটামল ৫০০ মিগ্রা ট্যাবলেট',
        },
        dosage: '1 Tablet',
        instructionsEn: '1 tablet post-meals if headache persists for 2 days.',
        instructionsLocal: {
          en: '1 tablet post-meals if headache persists for 2 days.',
          mr: '१ गोळी जेवणानंतर, डोकेदुखी असल्यास [२ दिवस].',
          hi: '१ गोली भोजन के बाद, यदि सिरदर्द हो [२ दिन]।',
          ta: 'தலைவலி இருந்தால் உணவுக்குப் பின் 1 மாத்திரை [2 நாட்கள்].',
          kn: 'ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ ತಲೆನೋವು ಇದ್ದರೆ [2 ದಿನಗಳು].',
          bn: 'খাবারের পর ১টি ট্যাবলেট যদি মাথাব্যথা থাকে [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Rest in a quiet, dark room for 30 minutes and hydrate well.',
          mr: 'शांत अंधाऱ्या खोलीत ३० मिनिटे विश्रांती घ्या व भरपूर पाणी प्या.',
          hi: 'शांत अंधेरे कमरे में ३० मिनट आराम करें और पर्याप्त पानी पिएं।',
          ta: 'அமைதியான இருண்ட அறையில் 30 நிமிடங்கள் ஓய்வெடுக்கவும்.',
          kn: 'ಶಾಂತ ಕೋಣೆಯಲ್ಲಿ 30 ನಿಮಿಷ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.',
          bn: 'শান্ত অন্ধকার ঘরে ৩০ মিনিট বিশ্রাম নিন এবং পর্যাপ্ত জল পান করুন।',
        }
      },
      {
        id: 'acidity_heartburn',
        name: {
          en: 'Acidity / Heartburn',
          mr: 'ऍसिडिटी / छातीत जळजळ (Acidity)',
          hi: 'एसिडिटी / सीने में जलन',
          ta: 'அமிலத்தன்மை / நெஞ்செரிச்சல்',
          kn: 'ಅಸಿಡಿಟಿ / ಎದೆಯುರಿ',
          bn: 'অ্যাসিডিটি / বুকজ্বালা',
        },
        desc: {
          en: 'Burning in chest or throat, sour burps, mild nausea.',
          mr: 'छातीत व घशात जळजळ, आंबट ढेकर, हलकी मळमळ जाणवणे.',
          hi: 'सीने और गले में जलन, खट्टी डकारें, हल्का जी मिचलाना।',
          ta: 'நெஞ்சு மற்றும் தொண்டையில் எரிச்சல், புளிப்பு ஏப்பம்.',
          kn: 'ಎದೆ ಮತ್ತು ಗಂಟಲಿನಲ್ಲಿ ಉರಿ, ಹುಳಿ ತೇಗು.',
          bn: 'বুকে ও গলায় জ্বালা, টক ঢেকুর, বমি বমি ভাব।',
        },
        category: {
          en: 'Gastroenterology (पचनसंस्था)',
          mr: 'पचनसंस्था (Digestive)',
          hi: 'पाचन तंत्र (Digestive)',
          ta: 'செரிமான அமைப்பு (Digestive)',
          kn: 'ಜೀರ್ಣಾಂಗ (Digestive)',
          bn: 'পাচনতন্ত্র (Digestive)',
        },
        rxGenericEn: 'Cap. Antacid / Omeprazole 20mg (Antacid)',
        rxNameLocal: {
          en: 'Cap. Omeprazole 20mg',
          mr: 'अँटासिड / ओमेप्राझोल २० मि.ग्रॅ. (Antacid)',
          hi: 'एंटासिड / ओमेप्राजोल २० मि.ग्रा. (Antacid)',
          ta: 'ஆன்டாசிட் / ஒமேபிரசோல் 20 மிகி',
          kn: 'ಆಂಟಾಸಿಡ್ / ಒಮೆಪ್ರಜೋಲ್ 20 ಮಿಲಿಗ್ರಾಂ',
          bn: 'অ্যান্টাসিড / ওমেপ্রাজল ২০ মিগ্রা',
        },
        dosage: '1 Capsule / Chewable',
        instructionsEn: '1 capsule 30 minutes before breakfast for 2 days.',
        instructionsLocal: {
          en: '1 capsule 30 minutes before breakfast for 2 days.',
          mr: '१ गोळी जेवणापूर्वी किंवा जेवणानंतर चावून खावी [२ दिवस].',
          hi: '१ गोली भोजन से पहले या चबाकर खाएं [२ दिन]।',
          ta: 'காலை உணவுக்கு 30 நிமிடங்களுக்கு முன் 1 மாத்திரை [2 நாட்கள்].',
          kn: 'ತಿಂಡಿಗೆ 30 ನಿಮಿಷ ಮುಂಚೆ 1 ಮಾತ್ರೆ [2 ದಿನಗಳು].',
          bn: 'সকালের খাবারের ৩০ মিনিট আগে ১টি ক্যাপসুল [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: false },
        remedy: {
          en: 'Drink cold milk or coconut water and avoid spicy, oily food.',
          mr: 'थंड दूध किंवा नारळ पाणी प्या आणि तिखट-मसालेदार अन्न टाळा.',
          hi: 'ठंडा दूध या नारियल पानी पिएं और मसालेदार भोजन से बचें।',
          ta: 'குளிர்ந்த பால் அல்லது இளநீர் அருந்தவும்; காரமான உணவை தவிர்க்கவும்.',
          kn: 'ತಣ್ಣನೆಯ ಹಾಲು ಅಥವಾ ಎಳನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಮಸಾಲೆಯುಕ್ತ ಆಹಾರ ತಪ್ಪಿಸಿ.',
          bn: 'ঠান্ডা দুধ বা ডাবের জল খান এবং মশলাদার খাবার এড়িয়ে চলুন।',
        }
      },
      {
        id: 'fatigue_bodyache',
        name: {
          en: 'Fatigue / Mild Body Ache',
          mr: 'थकवा / अंगदुखी (Fatigue / Body Ache)',
          hi: 'थकान / बदन दर्द (Body Ache)',
          ta: 'சோர்வு / உடல் வலி',
          kn: 'ಆಯಾಸ / ಮೈಕೈ ನೋವು',
          bn: 'ক্লান্তি / শরীরে ব্যথা',
        },
        desc: {
          en: 'General body fatigue, muscle tiredness from physical labour or dehydration.',
          mr: 'कामाचा ताण किंवा शारीरिक थकव्यामुळे हातपाय व कंबर दुखणे.',
          hi: 'शारीरिक काम या निर्जलीकरण से बदन दर्द और कमजोरी।',
          ta: 'கடுமையான உடல் உழைப்பால் ஏற்படும் தசை வலி மற்றும் சோர்வு.',
          kn: 'ದೈಹಿಕ ಶ್ರಮದಿಂದ ಮೈಕೈ ನೋವು ಮತ್ತು ಆಯಾಸ.',
          bn: 'শারীরিক পরিশ্রম বা পানিশূন্যতার কারণে শরীরে ব্যথা ও ক্লান্তি।',
        },
        category: {
          en: 'Supportive Care (सामान्य)',
          mr: 'सामान्य (General)',
          hi: 'सामान्य (General)',
          ta: 'பொதுவானது (General)',
          kn: 'ಸಾಮಾನ್ಯ (General)',
        },
        rxGenericEn: 'Oral Rehydration Salts (WHO ORS Sachet)',
        rxNameLocal: {
          en: 'Oral Rehydration Salts (ORS)',
          mr: 'ओआरएस इलेक्ट्रोलाइट रिहायड्रेशन (ORS Sachet)',
          hi: 'ओआरएस इलेक्ट्रोलाइट घोल (ORS Sachet)',
          ta: 'ஓஆர்எஸ் எலக்ட்ரோலைட் பாக்கெட்',
          kn: 'ಒಆರ್‌ಎಸ್ ಎಲೆಕ್ಟ್ರೋಲೈಟ್ ಸ್ಯಾಚೆಟ್',
          bn: 'ওআরএস ইলেক্ট্রোলাইট স্যাচেট',
        },
        dosage: '1 Sachet in 1 Litre Water',
        instructionsEn: 'Mix 1 sachet in clean drinking water and sip through the day for 2 days.',
        instructionsLocal: {
          en: 'Mix 1 sachet in clean drinking water and sip through the day for 2 days.',
          mr: 'स्वच्छ पाण्यात मिसळून दिवसभरात थोडे थोडे प्यावे [२ दिवस].',
          hi: 'साफ पानी में घोलकर दिनभर थोड़ा-थोड़ा पिएं [२ दिन]।',
          ta: 'சுத்தமான நீரில் கலந்து நாள் முழுவதும் குடிக்கவும் [2 நாட்கள்].',
          kn: 'ಶುದ್ಧ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ದಿನವಿಡೀ ಸ್ವಲ್ಪ ಸ್ವಲ್ಪ ಕುಡಿಯಿರಿ [2 ದಿನಗಳು].',
          bn: 'পরিষ্কার জলে মিশিয়ে সারাদিন ধরে অল্প অল্প করে পান করুন [২ দিন]।',
        },
        timing: { morning: true, afternoon: true, night: true },
        remedy: {
          en: 'Take a warm water bath and ensure at least 8 hours of sleep.',
          mr: 'कोमट पाण्याने आंघोळ करा आणि रात्री पुरेशी ८ तासांची झोप घ्या.',
          hi: 'गुनगुने पानी से स्नान करें और रात में कम से कम ८ घंटे सोएं।',
          ta: 'வெதுவெதுப்பான நீரில் குளித்து 8 மணி நேரம் ஓய்வெடுக்கவும்.',
          kn: 'ಬೆಚ್ಚಗಿನ ನೀರಿನಲ್ಲಿ ಸ್ನಾನ ಮಾಡಿ ಮತ್ತು ಕನಿಷ್ಠ 8 ಗಂಟೆಗಳ ಕಾಲ ನಿದ್ರಿಸಿ.',
          bn: 'কুসুম গরম জলে স্নান করুন এবং রাতে কমপক্ষে ৮ ঘণ্টা ঘুমান।',
        }
      },
      {
        id: 'mild_sore_throat',
        name: {
          en: 'Mild Sore Throat / Irritation',
          mr: 'घसा खवखवणे (Mild Sore Throat)',
          hi: 'गले में खराश / दर्द',
          ta: 'தொண்டை வலி / கரகரப்பு',
          kn: 'ಗಂಟಲು ಕೆರೆತ / ನೋವು',
          bn: 'গলা ব্যথা / খুসখুস করা',
        },
        desc: {
          en: 'Prickling sensation in throat, discomfort swallowing, dry irritation.',
          mr: 'गिळताना घशात टोचणे, कोरडी खाज व हलकी सूज.',
          hi: 'निगलते समय गले में चुभन, सूखापन और हल्की खराश।',
          ta: 'விழுங்கும் போது தொண்டையில் வலி மற்றும் வறட்சி.',
          kn: 'ನುಂಗುವಾಗ ಗಂಟಲಿನಲ್ಲಿ ನೋವು ಮತ್ತು ಶುಷ್ಕತೆ.',
          bn: 'খাবার গিলতে কষ্ট, গলায় কাঁটা ফোটার অনুভূতি ও খুসখুসানি।',
        },
        category: {
          en: 'ENT (ईएनटी)',
          mr: 'ईएनटी (ENT)',
          hi: 'ईएनटी (ENT)',
          ta: 'காது மூக்கு தொண்டை (ENT)',
          kn: 'ಇಎನ್‌ಟಿ (ENT)',
          bn: 'ইএনটি (ENT)',
        },
        rxGenericEn: 'Herbal Throat Lozenges (OTC Antiseptic)',
        rxNameLocal: {
          en: 'Throat Soothing Lozenges',
          mr: 'घसा आराम कफ ड्रॉप्स (Throat Lozenges)',
          hi: 'गला आराम कफ ड्रॉप्स (Throat Lozenges)',
          ta: 'தொண்டை நிவாரண மாத்திரை',
          kn: 'ಗಂಟಲು ಪರಿಹಾರದ ಮಾತ್ರೆ',
          bn: 'গলা উপশমকারী লজেন্স',
        },
        dosage: '1 Lozenge',
        instructionsEn: 'Dissolve 1 lozenge slowly in mouth 2-3 times daily for 2 days.',
        instructionsLocal: {
          en: 'Dissolve 1 lozenge slowly in mouth 2-3 times daily for 2 days.',
          mr: '१ गोळी दिवसातून २-३ वेळा हळूहळू चघळावी [२ दिवस].',
          hi: '१ गोली दिन में २-३ बार मुंह में रखकर धीरे-धीरे चूसें [२ दिन]।',
          ta: '1 மாத்திரையை மெதுவாக வாயில் கரைக்கவும் [2 நாட்கள்].',
          kn: 'ದಿನಕ್ಕೆ 2-3 ಬಾರಿ 1 ಮಾತ್ರೆಯನ್ನು ಚೀಪಬೇಕು [2 ದಿನಗಳು].',
          bn: 'দিনে ২-৩ বার ১টি লজেন্স ধীরে ধীরে চুষে খান [২ দিন]।',
        },
        timing: { morning: true, afternoon: true, night: true },
        remedy: {
          en: 'Gargle with warm salt water and turmeric 3 times daily.',
          mr: 'कोमट पाण्यात थोडे मीठ आणि हळद घालून दिवसातून ३ वेळा गुळण्या करा.',
          hi: 'गुनगुने पानी में थोड़ा नमक और हल्दी मिलाकर दिन में ३ बार गरारे करें।',
          ta: 'வெதுவெதுப்பான உப்பு நீரில் மஞ்சள் சேர்த்து கொப்பளிக்கவும்.',
          kn: 'ಬೆಚ್ಚಗಿನ ಉಪ್ಪು ನೀರಿನಲ್ಲಿ ಅರಿಶಿನ ಹಾಕಿ ಬಾಯಿ ಮುಕ್ಕಳಿಸಿ.',
          bn: 'ঈষদুষ্ণ নুন ও হলুদ জলে দিনে ৩ বার কুলকুচি করুন।',
        }
      }
    ]
  },

  level2: {
    level: 2,
    badgeColor: 'bg-caution-amber/25 text-deep-navy dark:text-caution-amber border-caution-amber/40',
    items: [
      {
        id: 'viral_fever_chills',
        name: {
          en: 'Viral Fever with Chills (up to 101°F)',
          mr: 'ताप (१०१°F पर्यंत) व हुडहुडी (Viral Fever)',
          hi: 'वायरल बुखार और कंपकंपी (१०१°F तक)',
          ta: 'வைரஸ் காய்ச்சல் மற்றும் நடுக்கம்',
          kn: 'ಜ್ವರ ಮತ್ತು ಚಳಿ (101°F ವರೆಗೆ)',
          bn: 'ভাইরাল জ্বর ও কাঁপুনি (১০১°ফা পর্যন্ত)',
        },
        desc: {
          en: 'Elevated body temperature up to 101°F, shivering, sweating, generalized body weakness.',
          mr: 'अंगात तीव्र उष्णता, थंडी वाजून ताप येणे, अशक्तपणा.',
          hi: '१०१°F तक शरीर का तापमान, ठंड लगना, पसीना और कमजोरी।',
          ta: 'உடல் சூடு, நடுக்கம் மற்றும் கடுமையான உடல் சோர்வு.',
          kn: 'ದೇಹದ ಉಷ್ಣತೆ ಹೆಚ್ಚಳ, ನಡುಕ ಮತ್ತು ನಿಶ್ಯಕ್ತಿ.',
          bn: '১০১°ফা পর্যন্ত জ্বর, কাঁপুনি ও অতিরিক্ত দুর্বলতা।',
        },
        category: {
          en: 'Infectious (संसर्गजन्य)',
          mr: 'संसर्गजन्य (Infectious)',
          hi: 'संक्रामक (Infectious)',
          ta: 'தொற்றுநோய் (Infectious)',
          kn: 'ಸಾಂಕ್ರಾಮಿಕ (Infectious)',
          bn: 'সংক্রামক (Infectious)',
        },
        rxGenericEn: 'Tab. Paracetamol 650mg (Antipyretic)',
        rxNameLocal: {
          en: 'Tab. Paracetamol 650mg',
          mr: 'पॅरासिटामॉल ६५० मि.ग्रॅ. (Paracetamol)',
          hi: 'पैरासिटामोल ६५० मि.ग्रा. (Paracetamol)',
          ta: 'பாராசிட்டமால் 650 மிகி மாத்திரை',
          kn: 'ಪ್ಯಾರಸಿಟಮಾಲ್ 650 ಮಿಲಿಗ್ರಾಂ ಮಾತ್ರೆ',
          bn: 'প্যারাসিটামল ৬৫০ মিগ্রা ট্যাবলেট',
        },
        dosage: '1 Tablet',
        instructionsEn: '1 tablet post-meals twice daily if temperature > 100°F for 2 days.',
        instructionsLocal: {
          en: '1 tablet post-meals twice daily if temperature > 100°F for 2 days.',
          mr: '१ गोळी जेवणानंतर, दिवसातून २ वेळा ताप असल्यास [२ दिवस].',
          hi: '१ गोली भोजन के बाद, दिन में २ बार यदि बुखार हो [२ दिन]।',
          ta: 'உணவுக்குப் பின் 1 மாத்திரை, காய்ச்சல் இருந்தால் [2 நாட்கள்].',
          kn: 'ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ ಜ್ವರವಿದ್ದರೆ [2 ದಿನಗಳು].',
          bn: 'খাবারের পর ১টি ট্যাবলেট যদি জ্বর থাকে [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Apply damp cloth compresses to forehead and armpits to dissipate heat.',
          mr: 'कपाळावर आणि मानेवर कोमट ओल्या कापडाच्या घड्या ठेवा.',
          hi: 'माथे और गर्दन पर गीले कपड़े की पट्टियां रखकर ताप कम करें।',
          ta: 'ஈரத் துணியால் நெற்றியில் ஒத்தடம் கொடுக்கவும்.',
          kn: 'ಹಣೆಯ ಮೇಲೆ ತೇವವಾದ ಬಟ್ಟೆಯ ಪಟ್ಟಿಗಳನ್ನು ಇರಿಸಿ.',
          bn: 'কপালে এবং গলায় ভেজা কাপড়ের জলপট্টি দিন।',
        }
      },
      {
        id: 'vomiting_diarrhea',
        name: {
          en: 'Vomiting / Loose Motions (Dehydration Risk)',
          mr: 'उलट्या / जुलाब (Vomiting & Diarrhea)',
          hi: 'उल्टी और दस्त (निर्जलीकरण जोखिम)',
          ta: 'வாந்தி மற்றும் வயிற்றுப்போக்கு',
          kn: 'ವಾಂತಿ ಮತ್ತು ಭೇದಿ',
          bn: 'বমি ও পাতলা পায়খানা',
        },
        desc: {
          en: 'Frequent loose stools (>3 times/day) or nausea/vomiting causing fluid loss.',
          mr: 'दिवसातून ३ हून अधिक वेळा पातळ शौचास होणे किंवा सतत उलट्या.',
          hi: 'दिन में ३ से अधिक बार दस्त या लगातार उल्टी होना।',
          ta: 'நாள் ஒன்றுக்கு 3 முறைக்கு மேல் வயிற்றுப்போக்கு அல்லது வாந்தி.',
          kn: 'ದಿನಕ್ಕೆ 3 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಾರಿ ಭೇದಿ ಅಥವಾ ನಿರಂತರ ವಾಂತಿ.',
          bn: 'দিনে ৩ বারের বেশি পাতলা পায়খানা বা ঘন ঘন বমি।',
        },
        category: {
          en: 'Gastroenterology (पचनसंस्था)',
          mr: 'पचनसंस्था (Digestive)',
          hi: 'पाचन तंत्र (Digestive)',
          ta: 'செரிமானம் (Digestive)',
          kn: 'ಜೀರ್ಣಾಂಗ (Digestive)',
          bn: 'পাচনতন্ত্র (Digestive)',
        },
        rxGenericEn: 'WHO-Standard Oral Rehydration Salts (ORS) Sachet',
        rxNameLocal: {
          en: 'WHO ORS Electrolyte Sachet',
          mr: 'डब्ल्यूएचओ ओआरएस रिहायड्रेशन द्रावण (ORS)',
          hi: 'डब्ल्यूएचओ ओआरएस पैकेट (ORS Solution)',
          ta: 'WHO அங்கீகரிக்கப்பட்ட ORS கரைசல்',
          kn: 'ಡಬ್ಲ್ಯುಎಚ್‌ಒ ಒಆರ್‌ಎಸ್ ದ್ರಾವಣ',
          bn: 'ডব্লিউএইচও ওআরএস স্যালাইন',
        },
        dosage: '1 Sachet in 1 Litre Water',
        instructionsEn: 'Dissolve entire sachet in 1 litre boiled, cooled water. Drink after every loose stool for 2 days.',
        instructionsLocal: {
          en: 'Dissolve entire sachet in 1 litre boiled, cooled water. Drink after every loose stool for 2 days.',
          mr: '१ लिटर स्वच्छ उकळून थंड केलेल्या पाण्यात १ पाकीट मिसळून सतत प्यावे [२ दिवस].',
          hi: '१ लीटर उबले और ठंडे पानी में घोलकर प्रत्येक दस्त के बाद पिएं [२ दिन]।',
          ta: '1 லிட்டர் காய்ச்சி ஆறிய நீரில் கலந்து ஒவ்வொரு முறைக்கும் பின் குடிக்கவும்.',
          kn: '1 ಲೀಟರ್ ಕುದಿಸಿ ಆರಿಸಿದ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ಪ್ರತಿ ಭೇದಿಯ ನಂತರ ಕುಡಿಯಿರಿ.',
          bn: '১ লিটার ফোটানো ঠান্ডা জলে গুলে প্রতিবার পায়খানার পর পান করুন।',
        },
        timing: { morning: true, afternoon: true, night: true },
        remedy: {
          en: 'Drink rice water, fresh coconut water, and diluted buttermilk.',
          mr: 'पातळ पेज, ताक, आणि नारळ पाणी वारंवार थोडे थोडे प्या.',
          hi: 'चावल का मांड, नारियल पानी और ताजा छाछ का सेवन करें।',
          ta: 'கஞ்சி, இளநீர் மற்றும் மோர் அடிக்கடி பருகவும்.',
          kn: 'ಗಂಜಿ ನೀರು, ಎಳನೀರು ಮತ್ತು ಮಜ್ಜಿಗೆಯನ್ನು ಸೇವಿಸಿ.',
          bn: 'ভাতের ফ্যান, ডাবের জল ও পাতলা ঘোল অল্প অল্প করে পান করুন।',
        }
      },
      {
        id: 'persistent_cough',
        name: {
          en: 'Persistent Productive Cough',
          mr: 'तीव्र खोकला / कफ (Productive Cough)',
          hi: 'लगातार बलगम वाली खांसी',
          ta: 'தொடர் இருமல் / சளி',
          kn: 'ನಿರಂತರ ಕೆಮ್ಮು / ಕಫ',
          bn: 'ক্রমাগত কাশি ও কফ',
        },
        desc: {
          en: 'Heavy chest congestion, thick phlegm, continuous bouts of coughing.',
          mr: 'छातीत कफ अडकणे, खोकताना छातीत जडपणा जाणवणे.',
          hi: 'सीने में जकड़न, गाढ़ा बलगम और लगातार खांसी के दौरे।',
          ta: 'மார்பு சளி மற்றும் இடைவிடாத இருமல்.',
          kn: 'ಎದೆಯಲ್ಲಿ ಕಫ ಕಟ್ಟುವುದು ಮತ್ತು ನಿರಂತರ ಕೆಮ್ಮು.',
          bn: 'বুকে কফ জমা ও দমবন্ধ করা কাশি।',
        },
        category: {
          en: 'Respiratory (श्वसन)',
          mr: 'श्वसन (Respiratory)',
          hi: 'श्वसन (Respiratory)',
          ta: 'சுவாசம் (Respiratory)',
          kn: 'ಉಸಿರಾಟ (Respiratory)',
          bn: 'শ্বাসযন্ত্র (Respiratory)',
        },
        rxGenericEn: 'OTC Expectorant Cough Syrup (100ml)',
        rxNameLocal: {
          en: 'OTC Cough Expectorant Syrup',
          mr: 'कफ निवारक सिरप (Cough Syrup)',
          hi: 'कफ सिरप (Cough Expectorant)',
          ta: 'இருமல் நிவாரணி சிரப்',
          kn: 'ಕೆಮ್ಮಿನ ಸಿರಪ್',
          bn: 'কাফ সিরাপ',
        },
        dosage: '2 Teaspoons (10ml)',
        instructionsEn: '2 teaspoons with warm water twice daily post-meals for 2 days.',
        instructionsLocal: {
          en: '2 teaspoons with warm water twice daily post-meals for 2 days.',
          mr: '२ चमचे कोमट पाण्यासोबत दिवसातून २ वेळा जेवणानंतर [२ दिवस].',
          hi: '२ चम्मच गुनगुने पानी के साथ दिन में २ बार भोजन के बाद [२ दिन]।',
          ta: 'உணவுக்குப் பின் 2 தேக்கரண்டி வெதுவெதுப்பான நீருடன் [2 நாட்கள்].',
          kn: 'ಊಟದ ನಂತರ 2 ಚಮಚ ಬೆಚ್ಚಗಿನ ನೀರಿನೊಂದಿಗೆ [2 ದಿನಗಳು].',
          bn: 'খাবারের পর ২ চামচ ঈষদুষ্ণ জলের সাথে দিনে ২ বার [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Mix fresh ginger juice and tulsi with honey twice daily.',
          mr: 'आले-तुळशीचा रस मधासोबत दिवसातून दोनदा चाटण म्हणून घ्या.',
          hi: 'अदरक और तुलसी के रस को शहद के साथ मिलाकर दिन में दो बार लें।',
          ta: 'இஞ்சி மற்றும் துளசி சாற்றை தேனுடன் கலந்து உட்கொள்ளவும்.',
          kn: 'ಶುಂಠಿ ಮತ್ತು ತುಳಸಿ ರಸವನ್ನು ಜೇನುತುಪ್ಪದೊಂದಿಗೆ ಸೇವಿಸಿ.',
          bn: 'আদা ও তুলসীর রস মধুর সাথে মিশিয়ে দিনে দুবার খান।',
        }
      },
      {
        id: 'severe_stomach_cramps',
        name: {
          en: 'Severe Stomach Cramps / Spasms',
          mr: 'पोटात मुरडा येऊन दुखणे (Stomach Cramps)',
          hi: 'पेट में मरोड़ और तेज दर्द',
          ta: 'கடுமையான வயிற்று வலி',
          kn: 'ಹೊಟ್ಟೆ ನೋವು ಮತ್ತು ಸೆಳೆತ',
          bn: 'পেটে তীব্র মোচড় ও ব্যথা',
        },
        desc: {
          en: 'Spasmodic colicky abdominal pain, bloating, or excessive flatulence.',
          mr: 'पोटात कळा येणे, गॅसमुळे पोट फुगणे किंवा तीव्र मुरडा.',
          hi: 'पेट में ऐंठन, गैस से पेट फूलना या मरोड़ वाला दर्द।',
          ta: 'வாயு மற்றும் வயிற்று பிடிப்பு காரணமாக ஏற்படும் வலி.',
          kn: 'ಹೊಟ್ಟೆಯಲ್ಲಿ ಸೆಳೆತ ಮತ್ತು ವಾಯು ನೋವು.',
          bn: 'গ্যাসের কারণে পেট ফাঁপা ও তীব্র মোচড় দেওয়া পেটব্যথা।',
        },
        category: {
          en: 'Gastroenterology (पचनसंस्था)',
          mr: 'पचनसंस्था (Digestive)',
          hi: 'पाचन तंत्र (Digestive)',
          ta: 'செரிமானம் (Digestive)',
          kn: 'ಜೀರ್ಣಾಂಗ (Digestive)',
          bn: 'পাচনতন্ত্র (Digestive)',
        },
        rxGenericEn: 'Tab. Dicyclomine Supportive Care (Mild Antispasmodic)',
        rxNameLocal: {
          en: 'Mild Antispasmodic Care',
          mr: 'पोटदुखी शामक गोळी (Antispasmodic)',
          hi: 'पेट दर्द निवारक गोली (Antispasmodic)',
          ta: 'வயிற்று வலி நிவாரண மாத்திரை',
          kn: 'ಹೊಟ್ಟೆ ನೋವು ನಿವಾರಕ ಮಾತ್ರೆ',
          bn: 'পেটব্যথা কমানোর ওষুধ',
        },
        dosage: '1 Tablet',
        instructionsEn: '1 tablet post-meals if spasm persists for 2 days.',
        instructionsLocal: {
          en: '1 tablet post-meals if spasm persists for 2 days.',
          mr: 'गरज भासल्यास जेवणानंतर १ गोळी फार्मासिस्टच्या सल्ल्याने [२ दिवस].',
          hi: 'जरूरत पड़ने पर भोजन के बाद १ गोली [२ दिन]।',
          ta: 'தேவைப்பட்டால் உணவுக்குப் பின் 1 மாத்திரை [2 நாட்கள்].',
          kn: 'ಅಗತ್ಯವಿದ್ದರೆ ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ [2 ದಿನಗಳು].',
          bn: 'প্রয়োজনে খাবারের পর ১টি ট্যাবলেট [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Apply a warm water heating pad to abdomen and drink warm water.',
          mr: 'पोटावर गरम पाण्याची पिशवी ठेवून शेका आणि गरम पाणी प्या.',
          hi: 'पेट पर गर्म पानी की थैली से सिकाई करें और हल्का गुनगुना पानी पिएं।',
          ta: 'வெந்நீர் ஒத்தடம் கொடுத்து வெதுவெதுப்பான நீர் அருந்தவும்.',
          kn: 'ಹೊಟ್ಟೆಯ ಮೇಲೆ ಬಿಸಿ ನೀರಿನ ಶಾಖ ಕೊಡಿ ಮತ್ತು ಬೆಚ್ಚಗಿನ ನೀರನ್ನು ಕುಡಿಯಿರಿ.',
          bn: 'পেটে গরম সেঁক দিন এবং হালকা গরম জল পান করুন।',
        }
      },
      {
        id: 'skin_allergy_rash',
        name: {
          en: 'Skin Allergy / Urticaria / Rashes',
          mr: 'अंगावर पुरळ किंवा खाज (Skin Allergy)',
          hi: 'त्वचा पर पित्ती / खुजली / चकत्ते',
          ta: 'தோல் ஒவ்வாமை / அரிப்பு',
          kn: 'ಚರ್ಮದ ಅಲರ್ಜಿ / ತುರಿಕೆ',
          bn: 'ত্বকের অ্যালার্জি / চুলকানি',
        },
        desc: {
          en: 'Red itchy patches, hives, insect bite swelling across skin.',
          mr: 'अंगावर लाल चट्टे उठणे, तीव्र खाज येणे, कीटक चावल्यासारखी सूज.',
          hi: 'शरीर पर लाल चकत्ते, तेज खुजली, कीड़े के काटने जैसी सूजन।',
          ta: 'தோலில் சிவப்பு தடிப்புகள் மற்றும் அரிப்பு.',
          kn: 'ಚರ್ಮದ ಮೇಲೆ ಕೆಂಪು ಕಲೆಗಳು ಮತ್ತು ತುರಿಕೆ.',
          bn: 'ত্বকে লাল চাকা চাকা দাগ, চুলকানি ও ফোলাভাব।',
        },
        category: {
          en: 'Dermatology (त्वचा)',
          mr: 'त्वचा (Dermatology)',
          hi: 'त्वचा (Dermatology)',
          ta: 'தோல் நோய் (Dermatology)',
          kn: 'ಚರ್ಮರೋಗ (Dermatology)',
          bn: 'চর্মরোগ (Dermatology)',
        },
        rxGenericEn: 'Tab. Levocetirizine 5mg (Antiallergic)',
        rxNameLocal: {
          en: 'Tab. Levocetirizine 5mg',
          mr: 'लेवोसिट्रिझिन ५ मि.ग्रॅ. (Levocetirizine)',
          hi: 'लेवोसिट्रीजीन ५ मि.ग्रा. (Levocetirizine)',
          ta: 'லெவோசெட்டிரிசின் 5 மிகி',
          kn: 'ಲೆವೊಸೆಟಿರಿಜಿನ್ 5 ಮಿಲಿಗ್ರಾಂ',
          bn: 'লেভোসেটিরিজিন ৫ মিগ্রা',
        },
        dosage: '1 Tablet',
        instructionsEn: '1 tablet at night after meals for 2 days.',
        instructionsLocal: {
          en: '1 tablet at night after meals for 2 days.',
          mr: '१ गोळी रात्री झोपताना जेवणानंतर [२ दिवस].',
          hi: '१ गोली रात को भोजन के बाद सोते समय [२ दिन]।',
          ta: 'இரவு உணவுக்குப் பின் 1 மாத்திரை [2 நாட்கள்].',
          kn: 'ರಾತ್ರಿ ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ [2 ದಿನಗಳು].',
          bn: 'রাতে খাবারের পর ১টি ট্যাবলেট [২ দিন]।',
        },
        timing: { morning: false, afternoon: false, night: true },
        remedy: {
          en: 'Apply pure aloe vera gel or virgin coconut oil gently to soothe itching.',
          mr: 'खाजणाऱ्या जागी कोरफड जेल किंवा खोबरेल तेल हलक्या हाताने लावा.',
          hi: 'खुजली वाली जगह पर एलोवेरा जेल या नारियल तेल हल्के हाथों से लगाएं।',
          ta: 'கற்றாழை ஜெல் அல்லது தேங்காய் எண்ணெய் தடவவும்.',
          kn: 'ಅಲೋವೆರಾ ಜೆಲ್ ಅಥವಾ ತೆಂಗಿನ ಎಣ್ಣೆಯನ್ನು ಹಚ್ಚಿ.',
          bn: 'চুলকানির স্থানে খাঁটি অ্যালোভেরা জেল বা নারকেল তেল লাগান।',
        }
      }
    ]
  },

  level3: {
    level: 3,
    badgeColor: 'bg-alert-red text-white border-alert-red animate-pulse',
    items: [
      {
        id: 'chest_pain_radiating',
        name: {
          en: 'Acute Severe Chest Pain radiating to Left Arm',
          mr: 'तीव्र छातीत कळ व डाव्या हातात दुखणे (Chest Pain)',
          hi: 'सीने में असहनीय दर्द व बाएं हाथ में खिंचाव',
          ta: 'நெஞ்சு வலி மற்றும் இடது கையில் வலி',
          kn: 'ತೀವ್ರ ಎದೆ ನೋವು ಮತ್ತು ಎಡಗೈ ನೋವು',
          bn: 'বুকে অসহ্য ব্যথা ও বাঁ হাতে ছড়িয়ে পড়া',
        },
        desc: {
          en: 'Crushing heavy pressure on chest, cold sweats, breathlessness — suspected acute cardiac event.',
          mr: 'छातीवर प्रचंड वजन, थंड घाम येणे, हृदयविकाराचा झटका संशय (Heart Attack Suspicion).',
          hi: 'सीने पर भारी दबाव, ठंडा पसीना, घबराहट — दिल का दौरा पड़ने की आशंका।',
          ta: 'மார்பில் கடுமையான அழுத்தம் மற்றும் வியர்வை — மாரடைப்பு சந்தேகம்.',
          kn: 'ಎದೆಯ ಮೇಲೆ ತೀವ್ರ ಒತ್ತಡ, ತಣ್ಣನೆಯ ಬೆವರು — ಹೃದಯಾಘಾತದ ಶಂಕೆ.',
          bn: 'বুকে ভারী চাপ, ঠান্ডা ঘাম, শ্বাসকষ্ট — হার্ট অ্যাটাকের লক্ষণ।',
        },
        category: {
          en: 'Cardiology Emergency',
          mr: 'हृदयरोग (Cardiology)',
          hi: 'हृदय रोग (Cardiology)',
          ta: 'இதய அவசரநிலை (Cardiology)',
          kn: 'ಹೃದ್ರೋಗ ತುರ್ತು (Cardiology)',
          bn: 'হৃদরোগ জরুরি অবস্থা (Cardiology)',
        },
        critical: true,
        specialty: {
          en: 'Interventional Cardiologist',
          mr: 'हृदयरोग तज्ज्ञ (Cardiologist)',
          hi: 'हृदय रोग विशेषज्ञ (Cardiologist)',
          ta: 'இதய சிகிச்சை நிபுணர்',
          kn: 'ಹೃದ್ರೋಗ ತಜ್ಞರು',
          bn: 'হৃদরোগ বিশেষজ্ঞ',
        }
      },
      {
        id: 'shortness_of_breath',
        name: {
          en: 'Severe Shortness of Breath / Gasping',
          mr: 'तीव्र श्वास घेण्यास अडचण (Severe Shortness of Breath)',
          hi: 'अत्यधिक सांस फूलना / दम घुटना',
          ta: 'கடுமையான மூச்சுத் திணறல்',
          kn: 'ತೀವ್ರ ಉಸಿರಾಟದ ತೊಂದರೆ',
          bn: 'তীব্র শ্বাসকষ্ট / হাঁপ ধরা',
        },
        desc: {
          en: 'Struggling to speak in full sentences, blue tint on lips or fingernails, suffocating sensation.',
          mr: 'श्वास कोंडणे, बोलताना धाप लागणे, ओठ किंवा नखे निळी पडणे.',
          hi: 'सांस लेने में भारी कठिनाई, बोलने में दम फूलना, होंठ नीले पड़ना।',
          ta: 'பேச முடியாத அளவுக்கு மூச்சுத் திணறல் மற்றும் உதடுகள் நீலமாதல்.',
          kn: 'ಉಸಿರಾಡಲು ಕಷ್ಟವಾಗುವುದು ಮತ್ತು ತುಟಿಗಳು ನೀಲಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು.',
          bn: 'কথা বলতে কষ্ট, ঠোঁট বা নখ নীল হয়ে যাওয়া।',
        },
        category: {
          en: 'Pulmonology / ICU',
          mr: 'श्वसन अतिदक्षता (Pulmonology)',
          hi: 'श्वसन आपातकाल (Pulmonology)',
          ta: 'நுரையீரல் அவசரநிலை (Pulmonology)',
          kn: 'ಉಸಿರಾಟ ತೀವ್ರ ನಿಗಾ (Pulmonology)',
          bn: 'ফুসফুস ও আইসিইউ (Pulmonology)',
        },
        critical: true,
        specialty: {
          en: 'Pulmonologist & Critical Care ICU',
          mr: 'श्वसनरोग व अतिदक्षता तज्ज्ञ (Pulmonology ICU)',
          hi: 'श्वसन व आईसीयू विशेषज्ञ',
          ta: 'நுரையீரல் & தீவிர சிகிச்சை நிபுணர்',
          kn: 'ಉಸಿರಾಟ ಮತ್ತು ತೀವ್ರ ನಿಗಾ ತಜ್ಞರು',
          bn: 'ফুসফুস ও ক্রিটিক্যাল কেয়ার বিশেষজ্ঞ',
        }
      },
      {
        id: 'stroke_slurred_speech',
        name: {
          en: 'Sudden Face Droop / Slurred Speech / Stroke',
          mr: 'अचानक अर्धांगवायू / बोलणे अडखळणे (Stroke Signs)',
          hi: 'अचानक मुंह टेढ़ा होना / आवाज लड़खड़ाना (स्ट्रोक)',
          ta: 'திடீர் பக்கவாதம் / பேச்சு குளறுதல்',
          kn: 'ಮುಖ ವಕ್ರವಾಗುವುದು / ಮಾತು ತೊದಲುವಿಕೆ (ಪಾರ್ಶ್ವವಾಯು)',
          bn: 'মুখ বেঁকে যাওয়া / কথা জড়িয়ে যাওয়া (স্ট্রোক)',
        },
        desc: {
          en: 'Sudden weakness on one side of body, arm weakness, inability to raise arm, confused speech.',
          mr: 'तोंड एका बाजूला वाकडे होणे, हात किंवा पाय लुळा पडणे (Paralysis/Stroke).',
          hi: 'शरीर के एक हिस्से में कमजोरी, हाथ-पैर सुन्न होना, बोलने में असमर्थता।',
          ta: 'உடலின் ஒரு பக்கம் செயலிழத்தல் மற்றும் பேச இயலாமை.',
          kn: 'ದೇಹದ ಒಂದು ಭಾಗ ನಿಶ್ಚೇಷ್ಟಿತವಾಗುವುದು ಮತ್ತು ಮಾತನಾಡಲು ಕಷ್ಟವಾಗುವುದು.',
          bn: 'শরীরের একপাশ অবশ হয়ে যাওয়া ও কথা বলতে না পারা।',
        },
        category: {
          en: 'Neurology Emergency',
          mr: 'मेंदूरोग (Neurology)',
          hi: 'न्यूरोलॉजी (Neurology)',
          ta: 'நரம்பியல் அவசரநிலை',
          kn: 'ನರರೋಗ ತುರ್ತು',
          bn: 'নিউরোলজি জরুরি অবস্থা',
        },
        critical: true,
        specialty: {
          en: 'Neurologist / Stroke Centre',
          mr: 'मेंदूरोग व पक्षाघात तज्ज्ञ (Neurologist)',
          hi: 'मस्तिष्क रोग विशेषज्ञ (Neurologist)',
          ta: 'நரம்பியல் நிபுணர்',
          kn: 'ನರರೋಗ ತಜ್ಞರು',
          bn: 'নিউরোলজিস্ট',
        }
      },
      {
        id: 'syncope_unconscious',
        name: {
          en: 'Syncope / Sudden Unconsciousness / Blackout',
          mr: 'चक्कर येऊन बेशुद्ध पडणे (Sudden Unconsciousness)',
          hi: 'अचानक चक्कर आकर बेहोश हो जाना',
          ta: 'திடீர் மயக்கம் / சுயநினைவின்மை',
          kn: 'ದಿಢೀರ್ ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು',
          bn: 'হঠাৎ মাথা ঘুরে অজ্ঞান হয়ে যাওয়া',
        },
        desc: {
          en: 'Sudden collapse, unresponsive to voice or gentle shaking, pulse very slow or erratic.',
          mr: 'अचानक अंधारी येऊन कोसळणे, हाक मारल्यास प्रतिसाद न देणे.',
          hi: 'अचानक गिर पड़ना, आवाज देने पर प्रतिक्रिया न देना।',
          ta: 'சுயநினைவின்றி கீழே விழுதல் மற்றும் பதிலளிக்க இயலாமை.',
          kn: 'ಪ್ರಜ್ಞೆ ತಪ್ಪಿ ಬೀಳುವುದು ಮತ್ತು ಕರೆದಾಗ ಪ್ರತಿಕ್ರಿಯಿಸದಿರುವುದು.',
          bn: 'হঠাৎ পড়ে যাওয়া ও ডাকে সাড়া না দেওয়া।',
        },
        category: {
          en: 'Emergency Medicine',
          mr: 'आपत्कालीन (Emergency Medicine)',
          hi: 'आपातकालीन चिकित्सा',
          ta: 'அவசர சிகிச்சை',
          kn: 'ತುರ್ತು ಚಿಕಿತ್ಸೆ',
          bn: 'জরুরি চিকিৎসা',
        },
        critical: true,
        specialty: {
          en: 'Emergency Medicine Consultant',
          mr: 'आपत्कालीन विभाग प्रमुख (Emergency Medicine)',
          hi: 'आपातकालीन चिकित्सा विशेषज्ञ',
          ta: 'அவசர மருத்துவ நிபுணர்',
          kn: 'ತುರ್ತು ವೈದ್ಯಕೀಯ ತಜ್ಞರು',
          bn: 'জরুরি মেডিসিন কনসালটেন্ট',
        }
      },
      {
        id: 'heavy_trauma_bleeding',
        name: {
          en: 'Severe Agricultural Trauma / Uncontrolled Bleeding',
          mr: 'तीव्र अपघाती रक्तस्त्राव किंवा खोल जखम (Trauma Bleeding)',
          hi: 'गंभीर चोट / न रुकने वाला रक्तस्राव',
          ta: 'தீவிர விபத்து காயம் / அதிக ரத்தப்போக்கு',
          kn: 'ತೀವ್ರ ರಕ್ತಸ್ರಾವ / ಆಳವಾದ ಗಾಯ',
          bn: 'গুরুতর দুর্ঘটনাজনিত রক্তক্ষরণ',
        },
        desc: {
          en: 'Machinery or road accident, profuse active hemorrhage that does not stop with pressure.',
          mr: 'शेतकाम किंवा रस्त्यावरील अपघातातून न थांबणारा रक्तस्त्राव.',
          hi: 'खेत में काम करते समय या सड़क हादसे में गंभीर घाव और अनियंत्रित खून बहना।',
          ta: 'விவசாய இயந்திரங்கள் அல்லது விபத்தால் ஏற்படும் நிற்காத ரத்தப்போக்கு.',
          kn: 'ಯಂತ್ರಗಳಿಂದ ಅಥವಾ ಅಪಘಾತದಿಂದ ನಿಲ್ಲದ ತೀವ್ರ ರಕ್ತಸ್ರಾವ.',
          bn: 'যন্ত্রের আঘাত বা দুর্ঘটনায় অনিয়ন্ত্রিত রক্তপাত।',
        },
        category: {
          en: 'Trauma Surgery',
          mr: 'ट्रॉमा व शस्त्रक्रिया (Trauma Surgery)',
          hi: 'ट्रॉमा एवं सर्जरी',
          ta: 'அதிர்ச்சி அறுவை சிகிச்சை',
          kn: 'ಟ್ರಾಮಾ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ',
          bn: 'ট্রমা ও সার্জারি',
        },
        critical: true,
        specialty: {
          en: 'Trauma & Orthopedic Surgeon',
          mr: 'ट्रॉमा व शस्त्रक्रिया विभाग (Trauma Surgeon)',
          hi: 'ट्रॉमा सर्जन',
          ta: 'அதிர்ச்சி அறுவை சிகிச்சை நிபுணர்',
          kn: 'ಟ್ರಾಮಾ ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರು',
          bn: 'ট্রমা সার্জন',
        }
      }
    ]
  }
};

export default function SymptomChecklistTriage({
  onNavigateToHospital,
  onNavigateToHub,
  currentUser,
  activeMember,
  onSelectMember
}) {
  const { lang, t } = useLanguage();

  // Family Member Context
  const [allMembers, setAllMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('arogya_family_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: currentUser?.id || 'self_1',
        name: currentUser?.name || 'Self (Primary Citizen)',
        relation: 'Self',
        age: 42,
        bloodGroup: 'B+',
        abhaId: currentUser?.abhaId || '14-2026-9812-4456',
      }
    ];
  });

  const [selectedMember, setSelectedMember] = useState(() => {
    if (activeMember) return activeMember;
    try {
      const saved = localStorage.getItem('arogya_active_member');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return allMembers[0];
  });

  useEffect(() => {
    if (activeMember) {
      setSelectedMember(activeMember);
    }
  }, [activeMember]);

  const handleSelectPatient = (member) => {
    setSelectedMember(member);
    try {
      localStorage.setItem('arogya_active_member', JSON.stringify(member));
      localStorage.setItem('arogya_active_member_id', member.id);
    } catch (e) {}
    if (onSelectMember) {
      onSelectMember(member);
    }
  };

  // State: selected symptoms by ID
  const [selectedSymptomIds, setSelectedSymptomIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);
  const [isGeneratingRx, setIsGeneratingRx] = useState(false);
  const [nearestDoctors, setNearestDoctors] = useState([]);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/hospitals/nearest?lat=18.5204&lng=73.8567&limit=3');
        if (res.ok) {
          const data = await res.json();
          if (data.hospitals && data.hospitals.length > 0) {
            const mapped = data.hospitals.map((h, idx) => ({
              id: h.id || 'hosp_' + idx,
              doctorName: idx === 0 ? 'Dr. Ajit Kulkarni' : idx === 1 ? 'Dr. Anita Deshmukh' : 'Dr. Rahul Patil',
              specialty: h.specialties?.[0] || 'Emergency Care Specialist',
              hospitalName: h.name,
              phone: h.phone || '108',
              distanceKm: h.distanceKm || (idx + 1) * 4.2,
              location: h.location,
              coordinates: h.location?.coordinates || [73.8052, 18.5584],
              address: h.address || 'District Emergency Centre'
            }));
            setNearestDoctors(mapped);
            return;
          }
        }
      } catch (e) {}
      // Fallback
      setNearestDoctors([
        {
          id: 'doc_1',
          doctorName: 'Dr. Ajit Kulkarni (M.D. Cardiology)',
          specialty: 'Senior Interventional Cardiologist',
          hospitalName: 'District Civil Hospital Aundh',
          phone: '020-27158900',
          distanceKm: 7.2,
          coordinates: [73.8052, 18.5584],
          address: 'Aundh Camp Road, Pune Rural District'
        },
        {
          id: 'doc_2',
          doctorName: 'Dr. Anita Deshmukh (M.D. Chest & Critical)',
          specialty: 'Pulmonology & ICU In-charge',
          hospitalName: 'Sub-District Hospital Shirur',
          phone: '02138-222108',
          distanceKm: 14.2,
          coordinates: [74.3789, 18.8274],
          address: 'Shirur, Pune Rural District'
        },
        {
          id: 'doc_3',
          doctorName: 'Dr. Rahul Patil (M.S. General & Trauma)',
          specialty: 'Trauma & Emergency Surgeon',
          hospitalName: 'CHC Junnar Critical Unit',
          phone: '02132-222045',
          distanceKm: 18.5,
          coordinates: [73.8789, 19.2082],
          address: 'Junnar Rural Hospital, Pune'
        }
      ]);
    };
    fetchDocs();
  }, []);

  const toggleSymptom = (id) => {
    setSelectedSymptomIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const clearAll = () => {
    setSelectedSymptomIds([]);
  };

  // Determine current risk level based on selection
  const allSymptomItems = [
    ...SYMPTOM_CATALOG.level1.items,
    ...SYMPTOM_CATALOG.level2.items,
    ...SYMPTOM_CATALOG.level3.items
  ];

  const selectedItems = allSymptomItems.filter(item => selectedSymptomIds.includes(item.id));
  const hasLevel3 = selectedItems.some(item => item.critical);
  const hasLevel2 = selectedItems.some(item => !item.critical && SYMPTOM_CATALOG.level2.items.some(l2 => l2.id === item.id));
  const currentRisk = hasLevel3 ? 'CRITICAL' : hasLevel2 ? 'MODERATE' : selectedItems.length > 0 ? 'LOW' : 'NONE';

  const handleApplyChecklist = async () => {
    if (selectedItems.length === 0) {
      alert(lang === 'mr' ? 'कृपया किमान एक लक्षण निवडा.' : lang === 'hi' ? 'कृपया कम से कम एक लक्षण चुनें।' : 'Please select at least one symptom.');
      return;
    }

    setIsGeneratingRx(true);

    try {
      const activeMemberId = selectedMember?.id || currentUser?.id || 'self_1';
      const patientName = selectedMember?.name || currentUser?.name || 'Self (Primary Citizen)';
      const patientAge = selectedMember?.age || 42;
      const patientBlood = selectedMember?.bloodGroup || 'B+';
      const patientAbha = selectedMember?.abhaId || '14-2026-9812-4456';

      // Build 2-day OTC medicines list with clean generic Latin pharmacological names
      // AND localized versions for the UI!
      const medicinesList = hasLevel3 
        ? [] 
        : selectedItems.map(item => ({
            name: item.rxGenericEn || item.name.en,
            nameLocal: item.rxNameLocal?.[lang] || item.rxNameLocal?.mr || item.name[lang] || item.name.en,
            category: item.category.en || 'General Formulation',
            categoryLocal: item.category[lang] || item.category.en,
            dosage: item.dosage || '1 Tablet',
            dosageLocal: item.dosage || '1 Tablet',
            instructions: item.instructionsEn || 'Take post-meals with warm water for 2 days.',
            instructionsLocal: item.instructionsLocal?.[lang] || item.instructionsLocal?.mr || item.instructionsEn,
            timing: item.timing?.morning && item.timing?.night ? 'Morning & Night [2 times]' : item.timing?.night ? 'Night [1 time]' : 'Morning [1 time]',
            timingSchedule: item.timing || { morning: true, afternoon: false, night: true }
          }));

      // Safe Home Remedies (localized for UI, English for standard)
      const remediesListLocal = hasLevel3
        ? [
            lang === 'mr' ? 'रुग्णाला हवेशीर जागी शांत बसवा किंवा आधार देऊन झोपवा.' : lang === 'hi' ? 'मरीज को हवादार स्थान पर शांत बैठाएं।' : 'Keep patient in a seated or supported position with ample airflow.',
            lang === 'mr' ? 'मानेवरील आणि छातीवरील घट्ट कपडे सैल करा.' : lang === 'hi' ? 'गले और छाती के कपड़े ढीले करें।' : 'Loosen tight clothing around chest and neck.',
            lang === 'mr' ? 'तातडीने १०८ रुग्णवाहिकेला कॉल करा आणि रुग्णाला त्वरित हलवा.' : lang === 'hi' ? 'तुरंत १०८ एम्बुलेंस को कॉल करें।' : 'Call 108 Emergency Ambulance immediately.'
          ]
        : Array.from(new Set(selectedItems.map(item => item.remedy[lang] || item.remedy.mr || item.remedy.en).filter(Boolean)));

      const summaryText = hasLevel3
        ? `Emergency Alert: ${selectedItems.map(i => i.name.en || i.name.mr).join(', ')}`
        : `2-Day Preliminary Assessment: ${selectedItems.map(i => i.name.en || i.name.mr).join(', ')}`;

      // Save to Backend API
      const res = await fetch('http://localhost:5000/api/prescriptions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyMemberId: activeMemberId,
          userId: currentUser?.id,
          patientDetails: {
            name: patientName,
            age: patientAge,
            bloodGroup: patientBlood,
            abhaId: patientAbha,
          },
          createdBy: 'symptom_checklist',
          durationDays: 2,
          medicines: medicinesList,
          homeRemedies: remediesListLocal,
          diagnosisSummary: summaryText,
          riskLevel: currentRisk,
          verificationStatus: 'unverified'
        })
      });

      let savedRecord;
      if (res.ok) {
        const data = await res.json();
        savedRecord = data.prescription || data;
      } else {
        throw new Error('Save API returned error');
      }

      // Sync to localStorage
      try {
        const savedList = JSON.parse(localStorage.getItem('arogya_prescriptions') || '[]');
        savedList.unshift(savedRecord);
        localStorage.setItem('arogya_prescriptions', JSON.stringify(savedList));
      } catch (e) {}

      setGeneratedPrescription(savedRecord);
      setModalOpen(true);
    } catch (err) {
      console.warn('[Checklist Apply Error, creating local prescription]', err.message);
      // Fallback local object
      const fallbackRx = {
        _id: 'rx_chk_' + Date.now(),
        id: 'rx_chk_' + Date.now(),
        familyMemberId: selectedMember?.id || 'self_1',
        patientDetails: {
          name: selectedMember?.name || 'Self',
          age: selectedMember?.age || 42,
          bloodGroup: selectedMember?.bloodGroup || 'B+',
          abhaId: selectedMember?.abhaId || '14-2026-9812-4456'
        },
        createdBy: 'symptom_checklist',
        durationDays: 2,
        medicines: hasLevel3 ? [] : selectedItems.map(item => ({
          name: item.rxGenericEn || item.name.en,
          nameLocal: item.rxNameLocal?.[lang] || item.name[lang],
          category: item.category.en,
          categoryLocal: item.category[lang] || item.category.en,
          dosage: item.dosage || '1 Tablet',
          dosageLocal: item.dosage || '1 Tablet',
          instructions: item.instructionsEn,
          instructionsLocal: item.instructionsLocal?.[lang] || item.instructionsEn,
          timing: 'Morning & Night',
          timingSchedule: item.timing || { morning: true, afternoon: false, night: true }
        })),
        homeRemedies: Array.from(new Set(selectedItems.map(item => item.remedy[lang] || item.remedy.en).filter(Boolean))),
        diagnosisSummary: `2-Day Assessment: ${selectedItems.map(i => i.name[lang] || i.name.en).join(', ')}`,
        riskLevel: currentRisk,
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString()
      };
      setGeneratedPrescription(fallbackRx);
      setModalOpen(true);
    } finally {
      setIsGeneratingRx(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fadeIn text-deep-navy dark:text-clinical-white">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-xl text-left">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-medical-blue/15 text-medical-blue border border-medical-blue/25">
            <Stethoscope className="w-4 h-4" />
            <span>{t('triage_header_title')}</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white tracking-tight">
            {t('triage_header_title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {t('triage_header_subtitle')}
          </p>
        </div>

        {/* Dynamic Family Member Selector */}
        <div className="space-y-2 self-start md:self-auto bg-white/50 dark:bg-dark-base/50 p-3.5 rounded-2xl border border-deep-navy/10 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-medical-blue" />
            <span>{t('triage_patient_select')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {allMembers.map((member) => {
              const isSelected = (selectedMember?.id === member.id) || (selectedMember?.name === member.name);
              return (
                <button
                  key={member.id}
                  onClick={() => handleSelectPatient(member)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-medical-blue text-white shadow-md scale-[1.03]'
                      : 'bg-white/80 dark:bg-dark-muted/20 text-deep-navy dark:text-clinical-white hover:bg-medical-blue/10'
                  }`}
                >
                  <span>{member.name}</span>
                  <span className="text-[10px] opacity-80">({member.relation})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Patient Card Indicator */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-medical-blue/10 border border-medical-blue/20 text-xs text-left">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-health-green animate-pulse" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">{t('triage_patient_current')}</span>
          <strong className="font-bold text-deep-navy dark:text-clinical-white">{selectedMember?.name}</strong>
          <span className="text-slate-500">({selectedMember?.relation} • {selectedMember?.age} {t('rx_modal_years')} • {selectedMember?.bloodGroup})</span>
        </div>
        <span className="font-mono text-[11px] text-medical-blue font-bold hidden sm:inline">
          ABHA: {selectedMember?.abhaId || '14-2026-9812-4456'}
        </span>
      </div>

      {/* SECTION 1: LEVEL 1 — MILD & COMMON ILLNESSES */}
      <div className="glass-card p-6 rounded-3xl border border-white/80 dark:border-white/10 space-y-4 shadow-lg text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-health-green" />
            <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
              {t('triage_level1_title')}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-health-green/20 text-health-green border border-health-green/30 self-start sm:self-auto">
            {t('triage_level1_badge')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYMPTOM_CATALOG.level1.items.map((item) => {
            const checked = selectedSymptomIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSymptom(item.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border text-left flex items-start gap-3 select-none ${
                  checked
                    ? 'bg-health-green/15 border-health-green shadow-md scale-[1.02] ring-2 ring-health-green/30'
                    : 'bg-white/70 dark:bg-dark-base/70 border-deep-navy/10 dark:border-white/10 hover:border-health-green/50'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-health-green">
                  {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-xs sm:text-sm text-deep-navy dark:text-clinical-white leading-tight">
                    {item.name[lang] || item.name.mr || item.name.en}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {item.desc[lang] || item.desc.mr || item.desc.en}
                  </div>
                  <div className="text-[10px] font-semibold text-medical-blue mt-1">
                    {item.category[lang] || item.category.en}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: LEVEL 2 — MODERATE ILLNESSES */}
      <div className="glass-card p-6 rounded-3xl border border-white/80 dark:border-white/10 space-y-4 shadow-lg text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-caution-amber" />
            <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
              {t('triage_level2_title')}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-caution-amber/25 text-deep-navy dark:text-caution-amber border border-caution-amber/40 self-start sm:self-auto">
            {t('triage_level2_badge')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYMPTOM_CATALOG.level2.items.map((item) => {
            const checked = selectedSymptomIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSymptom(item.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border text-left flex items-start gap-3 select-none ${
                  checked
                    ? 'bg-caution-amber/20 border-caution-amber shadow-md scale-[1.02] ring-2 ring-caution-amber/40'
                    : 'bg-white/70 dark:bg-dark-base/70 border-deep-navy/10 dark:border-white/10 hover:border-caution-amber/50'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-caution-amber">
                  {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-xs sm:text-sm text-deep-navy dark:text-clinical-white leading-tight">
                    {item.name[lang] || item.name.mr || item.name.en}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {item.desc[lang] || item.desc.mr || item.desc.en}
                  </div>
                  <div className="text-[10px] font-semibold text-medical-blue mt-1">
                    {item.category[lang] || item.category.en}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: LEVEL 3 — CRITICAL EMERGENCY ILLNESSES */}
      <div className="glass-card p-6 rounded-3xl border-2 border-alert-red/30 space-y-4 shadow-xl bg-alert-red/5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-alert-red/20">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-alert-red animate-ping" />
            <h3 className="font-display font-bold text-lg text-alert-red flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <span>{t('triage_level3_title')}</span>
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-alert-red text-white animate-pulse self-start sm:self-auto">
            {t('triage_level3_badge')}
          </span>
        </div>

        <p className="text-xs text-alert-red font-medium">
          {t('triage_level3_warning')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYMPTOM_CATALOG.level3.items.map((item) => {
            const checked = selectedSymptomIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSymptom(item.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border text-left flex items-start gap-3 select-none ${
                  checked
                    ? 'bg-alert-red/20 border-alert-red shadow-lg scale-[1.02] ring-2 ring-alert-red/30'
                    : 'bg-white/70 dark:bg-dark-base/70 border-alert-red/20 hover:border-alert-red/50'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-alert-red">
                  {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-xs sm:text-sm text-alert-red leading-tight">
                    {item.name[lang] || item.name.mr || item.name.en}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {item.desc[lang] || item.desc.mr || item.desc.en}
                  </div>
                  <div className="text-[10px] font-bold text-medical-blue mt-1">
                    {t('triage_specialist')} {item.specialty[lang] || item.specialty.en}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Persistent Bottom Bar: Selection counter & Apply Button */}
      <div className="sticky bottom-6 z-30 p-4 sm:p-5 rounded-3xl glass-card border border-white/80 dark:border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-2xl bg-medical-blue/15 text-medical-blue">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-deep-navy dark:text-clinical-white">
              {t('triage_selected_count')} <span className="text-medical-blue">{t('triage_selected_items', { count: selectedItems.length })}</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {t('triage_severity')} {' '}
              {hasLevel3 ? (
                <span className="font-extrabold text-alert-red animate-pulse">{t('triage_severity_crit')}</span>
              ) : hasLevel2 ? (
                <span className="font-bold text-caution-amber">{t('triage_severity_mod')}</span>
              ) : selectedItems.length > 0 ? (
                <span className="font-bold text-health-green">{t('triage_severity_low')}</span>
              ) : (
                <span>{t('triage_severity_none')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedItems.length > 0 && (
            <button
              onClick={clearAll}
              className="btn-glass text-xs py-3 px-4 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('triage_reset')}</span>
            </button>
          )}

          <button
            id="apply-symptom-checklist-btn"
            onClick={handleApplyChecklist}
            disabled={isGeneratingRx || selectedItems.length === 0}
            className={`w-full sm:w-auto text-xs sm:text-sm py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all ${
              hasLevel3
                ? 'bg-alert-red text-white hover:bg-red-700 animate-pulse'
                : 'btn-navy text-white hover:shadow-medical-blue/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{isGeneratingRx ? t('triage_generating') : t('triage_apply')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prescription Result Modal */}
      <PrescriptionResultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        prescription={generatedPrescription}
        selectedMember={selectedMember}
        nearestDoctors={nearestDoctors}
        onNavigateToHospital={onNavigateToHospital}
      />

    </div>
  );
}
