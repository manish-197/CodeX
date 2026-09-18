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
          en: 'Respiratory',
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
          en: 'General',
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
          en: 'Gastroenterology',
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
          en: 'Supportive Care',
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
          en: 'ENT',
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
      },
      {
        id: 'loose_motion_diarrhea',
        name: {
          en: 'Mild Loose Motions / Diarrhea',
          mr: 'सौम्य जुलाब / पोट बिघडणे (Loose Motions)',
          hi: 'हल्के दस्त / पेट खराब (Mild Diarrhea)',
          ta: 'லேசான வயிற்றுப்போக்கு',
          kn: 'ಸೌಮ್ಯ ಅತಿಸಾರ / ಭೇದಿ',
          bn: 'মৃদু ডায়রিয়া / পাতলা পায়খানা',
        },
        desc: {
          en: 'Watery stools 2-3 times, mild cramps without high fever or blood.',
          mr: 'दिवसातून २-३ वेळा पातळ संडास होणे, पोटात सौम्य मुरड, अशक्तपणा.',
          hi: 'दिन में २-৩ बार पतला दस्त, पेट में हल्का मरोड़ व कमजोरी।',
          ta: 'நீர்த்த மலம் மற்றும் லேசான வயிற்றுப் பிடிப்பு.',
          kn: 'ದಿನಕ್ಕೆ 2-3 ಬಾರಿ ತೆಳುವಾದ ಮಲ ಮತ್ತು ಸುಸ್ತು.',
          bn: 'দিনে ২-৩ বার পাতলা পায়খানা ও পেটে মৃদু টান।',
        },
        category: {
          en: 'Gastroenterology',
          mr: 'पचनसंस्था (Gastro)',
          hi: 'पाचन तंत्र (Gastro)',
          ta: 'செரிமான மண்டலம் (Gastro)',
          kn: 'ಜೀರ್ಣಾಂಗ (Gastro)',
          bn: 'পরিপাকতন্ত্র (Gastro)',
        },
        rxGenericEn: 'Oral Rehydration Salts (WHO ORS Sachet)',
        rxNameLocal: {
          en: 'WHO ORS Electrolyte Sachet',
          mr: 'ओआरएस इलेक्ट्रोलाइट सॅचेट (ORS)',
          hi: 'ओआरएस घोल पैकेट (ORS Sachet)',
          ta: 'ஓஆர்எஸ் எலக்ட்ரோலைட் பாக்கெட்',
          kn: 'ಒಆರ್‌ಎಸ್ ಎಲೆಕ್ಟ್ರೋಲೈಟ್ ಸ್ಯಾಚೆಟ್',
          bn: 'ওআরএস স্যাচেট',
        },
        dosage: '1 Sachet in 1 Litre Water',
        instructionsEn: 'Mix 1 sachet in clean drinking water and sip through the day for 2 days.',
        instructionsLocal: {
          en: 'Mix 1 sachet in clean drinking water and sip through the day for 2 days.',
          mr: '१ लिटर स्वच्छ पाण्यात मिसळून दिवसभर थोडे थोडे प्यावे [२ दिवस].',
          hi: '१ लीटर पानी में घोलकर दिनभर थोड़ा-थोड़ा पिएं [२ दिन]।',
          ta: '1 லிட்டர் தண்ணீரில் கலந்து நாள் முழுவதும் குடிக்கவும் [2 நாட்கள்].',
          kn: '1 ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ದಿನವಿಡೀ ಕುಡಿಯಿರಿ [2 ದಿನಗಳು].',
          bn: '১ লিটার জলে গুলে সারাদিন অল্প অল্প করে পান করুন [২ দিন]।',
        },
        timing: { morning: true, afternoon: true, night: true },
        remedy: {
          en: 'Drink fresh buttermilk with roasted cumin and eat plain khichdi.',
          mr: 'भाजलेले जिरे टाकून ताजे ताक प्या आणि मुगाच्या डाळीची मऊ खिचडी खा.',
          hi: 'भुना जीरा डालकर ताजा छाछ पिएं और मूंग दाल की पतली खिचड़ी खाएं।',
          ta: 'சீரகம் சேர்த்த மோர் அருந்தி மென்மையான கிச்சடி சாப்பிடவும்.',
          kn: 'ಜೀರಿಗೆ ಹಾಕಿದ ಮಜ್ಜಿಗೆ ಕುಡಿಯಿರಿ ಮತ್ತು ಮೃದುವಾದ ಕಿಚಡಿ ತಿನ್ನಿರಿ.',
          bn: 'ভাজা জিরে মেশানো ঘোল পান করুন এবং নরম খিচুড়ি খান।',
        }
      },
      {
        id: 'dry_cough_irritation',
        name: {
          en: 'Dry Cough & Throat Tickle',
          mr: 'कोरडा खोकला / घशात टोचणे (Dry Cough)',
          hi: 'सूखी खांसी / गले में चुभन (Dry Cough)',
          ta: 'வறட்டு இருமல்',
          kn: 'ಒಣ ಕೆಮ್ಮು',
          bn: 'শুকনো কাশি',
        },
        desc: {
          en: 'Continuous dry barking cough without phlegm, irritation in windpipe.',
          mr: 'कफ न येता कोरडी ढास लागणे, रात्री खोकल्याची उबळ येणे.',
          hi: 'बिना बलगम के सूखी खांसी, रात में लगातार धंसका लगना।',
          ta: 'சளியற்ற வறட்டு இருமல் மற்றும் தொண்டை எரிச்சல்.',
          kn: 'ಕಫವಿಲ್ಲದ ಒಣ ಕೆಮ್ಮು ಮತ್ತು ಗಂಟಲಿನಲ್ಲಿ ಕೆರೆತ.',
          bn: 'কফ ছাড়া শুকনো কাশি ও রাতে কাশির দমক।',
        },
        category: {
          en: 'Respiratory',
          mr: 'श्वसन (Respiratory)',
          hi: 'श्वसन (Respiratory)',
          ta: 'சுவாசம் (Respiratory)',
          kn: 'ಉಸಿರಾಟ (Respiratory)',
          bn: 'শ্বাসযন্ত্র (Respiratory)',
        },
        rxGenericEn: 'Herbal Throat Lozenges (OTC Antiseptic)',
        rxNameLocal: {
          en: 'Herbal Cough Lozenges',
          mr: 'कफ निवारक हर्बल लोजेंजेस (Lozenges)',
          hi: 'कफ राहत लोजेंजेस',
          ta: 'இருமல் நிவாரண மாத்திரை',
          kn: 'ಕೆಮ್ಮು ನಿವಾರಕ ಮಾತ್ರೆ',
          bn: 'কাশি উপশমকারী লজেন্স',
        },
        dosage: '1 Lozenge',
        instructionsEn: 'Dissolve 1 lozenge slowly in mouth every 4-6 hours for 2 days.',
        instructionsLocal: {
          en: 'Dissolve 1 lozenge slowly in mouth every 4-6 hours for 2 days.',
          mr: '१ गोळी दर ४-६ तासांनी तोंडात हळूहळू चघळावी [२ दिवस].',
          hi: '१ गोली हर ४-६ घंटे में मुंह में रखकर चूसें [२ दिन]।',
          ta: '1 மாத்திரையை 4-6 மணி நேரத்திற்கு ஒருமுறை சப்பவும் [2 நாட்கள்].',
          kn: 'ಪ್ರತಿ 4-6 ಗಂಟೆಗೊಮ್ಮೆ 1 ಮಾತ್ರೆಯನ್ನು ಚೀಪಬೇಕು [2 ದಿನಗಳು].',
          bn: 'প্রতি ৪-৬ ঘণ্টা অন্তর ১টি লজেন্স চুষে খান [২ দিন]।',
        },
        timing: { morning: true, afternoon: true, night: true },
        remedy: {
          en: 'Drink warm water with 1 spoon honey and fresh ginger juice.',
          mr: '१ चमचा मधात आल्याचा रस मिसळून दिवसातून २ वेळा चाटण घ्या.',
          hi: '१ चम्मच शहद में अदरक का रस मिलाकर दिन में २ बार चाटें।',
          ta: 'தேன் மற்றும் இஞ்சி சாறு கலந்து உட்கொள்ளவும்.',
          kn: 'ಜೇನುತುಪ್ಪ ಮತ್ತು ಶುಂಠಿ ರಸವನ್ನು ಬೆರೆಸಿ ಸೇವಿಸಿ.',
          bn: '১ চামচ মধুর সাথে আদার রস মিশিয়ে দিনে ২ বার খান।',
        }
      },
      {
        id: 'toothache_gum_pain',
        name: {
          en: 'Mild Toothache & Gum Pain',
          mr: 'दातदुखी / हिरड्यांची सूज (Mild Toothache)',
          hi: 'दांत दर्द / मसूड़ों में सूजन',
          ta: 'பல் வலி / ஈறு வலி',
          kn: 'ಹಲ್ಲು ನೋವು / ವಸಡು ನೋವು',
          bn: 'দাঁতের ব্যথা / মাড়ি ফোলা',
        },
        desc: {
          en: 'Throbbing pain in tooth while chewing, mild localized gum sensitivity.',
          mr: 'चावताना दातात कळ येणे, हिरडी फुगणे, गार किंवा गरम खाताना झिणझिण्या.',
          hi: 'चबाते समय दांत में दर्द, मसूड़ों में संवेदनशीलता।',
          ta: 'மெல்லும்போது பல் வலி மற்றும் ஈறு வீக்கம்.',
          kn: 'ಅಗಿಯುವಾಗ ಹಲ್ಲು ನೋವು ಮತ್ತು ವಸಡಿನ ಊತ.',
          bn: 'খাবার চিবানোর সময় দাঁতে ব্যথা ও মাড়ির সংবেদনশীলতা।',
        },
        category: {
          en: 'Dental',
          mr: 'दंतरोग (Dental)',
          hi: 'दंत चिकित्सा (Dental)',
          ta: 'பல் மருத்துவம் (Dental)',
          kn: 'ದಂತ ವೈದ್ಯಕೀಯ (Dental)',
          bn: 'দন্ত চিকিৎসা (Dental)',
        },
        rxGenericEn: 'Tab. Paracetamol 500mg (Analgesic)',
        rxNameLocal: {
          en: 'Tab. Paracetamol 500mg',
          mr: 'पॅरासिटामॉल ५०० मि.ग्रॅ. (Paracetamol)',
          hi: 'पैरासिटामोल ५०० मि.ग्रा.',
          ta: 'பாராசிட்டமால் 500 மிகி',
          kn: 'ಪ್ಯಾರಸಿಟಮಾಲ್ 500 ಮಿಲಿಗ್ರಾಂ',
          bn: 'প্যারাসিটামল ৫০০ মিগ্রা',
        },
        dosage: '1 Tablet',
        instructionsEn: '1 tablet post-meals if toothache is bothersome for 2 days.',
        instructionsLocal: {
          en: '1 tablet post-meals if toothache is bothersome for 2 days.',
          mr: '१ गोळी जेवणानंतर, दातदुखीचा त्रास असल्यास [२ दिवस].',
          hi: '१ गोली भोजन के बाद, दांत दर्द होने पर [२ दिन]।',
          ta: 'உணவுக்குப் பின் 1 மாத்திரை, வலி இருந்தால் [2 நாட்கள்].',
          kn: 'ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ, ನೋವಿದ್ದರೆ [2 ದಿನಗಳು].',
          bn: 'খাবারের পর ১টি ট্যাবলেট, ব্যথা থাকলে [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Apply a drop of clove oil on cotton over the painful tooth; rinse with warm salt water.',
          mr: 'दुखणाऱ्या दातात लवंग किंवा लवंग तेलाचा कापूस धरा आणि कोमट मिठाच्या पाण्याच्या गुळण्या करा.',
          hi: 'दर्द वाले दांत पर लौंग का तेल लगाएं और गुनगुने नमक के पानी से कुल्ला करें।',
          ta: 'கிராம்பு எண்ணெய் வைக்கவும், வெதுவெதுப்பான உப்பு நீரில் வாய் கொப்பளிக்கவும்.',
          kn: 'ಲವಂಗದ ಎಣ್ಣೆಯನ್ನು ಹಚ್ಚಿ, ಉಪ್ಪು ನೀರಿನಲ್ಲಿ ಬಾಯಿ ಮುಕ್ಕಳಿಸಿ.',
          bn: 'লবঙ্গের তেল লাগান এবং ঈষদুষ্ণ নুন জল দিয়ে কুলকুচি করুন।',
        }
      },
      {
        id: 'constipation_bloating',
        name: {
          en: 'Constipation & Gas Bloating',
          mr: 'बद्धकोष्ठता व पोटात गॅस (Constipation)',
          hi: 'कब्ज एवं पेट में गैस / अफारा',
          ta: 'மலச்சிக்கல் மற்றும் வாயு',
          kn: 'ಮಲಬದ್ಧತೆ ಮತ್ತು ಗ್ಯಾಸ್',
          bn: 'কোষ্ঠকাঠিন্য ও পেটে গ্যাস',
        },
        desc: {
          en: 'Difficulty in bowel movements, abdominal hardness, heavy gas bloating.',
          mr: 'शौचास साफ न होणे, पोट फुगणे, पोटात गॅस धरणे व जडपणा जाणवणे.',
          hi: 'पेट साफ न होना, पेट फूलना, भारीपन और असहजता।',
          ta: 'மலம் கழிப்பதில் சிரமம் மற்றும் வயிற்று உப்புசம்.',
          kn: 'ಮಲವಿಸರ್ಜನೆಗೆ ತೊಂದರೆ ಮತ್ತು ಹೊಟ್ಟೆ ಉಬ್ಬರ.',
          bn: 'মলত্যাগে কষ্ট, পেট ফাঁপা এবং অস্বস্তি।',
        },
        category: {
          en: 'Gastrointestinal',
          mr: 'पचनसंस्था (Gastrointestinal)',
          hi: 'पाचन तंत्र (Gastrointestinal)',
          ta: 'செரிமான அமைப்பு',
          kn: 'ಜೀರ್ಣಾಂಗ ವ್ಯವಸ್ಥೆ',
          bn: 'পরিপাকতন্ত্র',
        },
        rxGenericEn: 'Tab. Bisacodyl 5mg / Isabgol Husk',
        rxNameLocal: {
          en: 'Tab. Bisacodyl 5mg / Isabgol',
          mr: 'बिसाकोडिल ५ मि.ग्रॅ. / इसबगोल (Bisacodyl / Isabgol)',
          hi: 'बिसाकोडिल ५ मि.ग्रा. / इसबगोल',
          ta: 'பிசாகோடைல் 5 மிகி / இசப்கோல்',
          kn: 'ಬಿಸಾಕೋಡಿಲ್ 5 ಮಿಲಿಗ್ರಾಂ / ಇಸಬ್ಗೋಲ್',
          bn: 'বিসাকোডিল ৫ মিগ্রা / ইসবগুল',
        },
        dosage: '1 Tablet / 2 Teaspoons',
        instructionsEn: 'Take with warm water/milk before sleeping for 2 days.',
        instructionsLocal: {
          en: 'Take with warm water/milk before sleeping for 2 days.',
          mr: 'रात्री झोपताना १ गोळी किंवा २ चमचे इसबगोल कोमट पाण्यासोबत [२ दिवस].',
          hi: 'रात को सोते समय १ गोली या २ चम्मच इसबगोल गुनगुने पानी के साथ [२ दिन]।',
          ta: 'இரவு தூங்கும் முன் வெதுவெதுப்பான நீருடன் [2 நாட்கள்].',
          kn: 'ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ಬೆಚ್ಚಗಿನ ನೀರಿನೊಂದಿಗೆ [2 ದಿನಗಳು].',
          bn: 'রাতে শোবার আগে কুসুম গরম জলের সাথে [২ দিন]।',
        },
        timing: { morning: false, afternoon: false, night: true },
        remedy: {
          en: 'Drink 2 glasses of warm water in the morning, eat ripe papaya, and increase green leafy vegetables.',
          mr: 'सकाळी उठल्यावर २ ग्लास कोमट पाणी प्या, पिकलेली पपई खा आणि आहारात पालेभाज्या वाढवा.',
          hi: 'सुबह उठकर २ गिलास गुनगुना पानी पिएं, पपीता खाएं और हरी सब्जियां लें।',
          ta: 'காலையில் வெதுவெதுப்பான நீர் குடிக்கவும் மற்றும் பப்பாளி சாப்பிடவும்.',
          kn: 'ಬೆಳಿಗ್ಗೆ ಬೆಚ್ಚಗಿನ ನೀರನ್ನು ಕುಡಿಯಿರಿ ಮತ್ತು ಪಪ್ಪಾಯಿ ಹಣ್ಣನ್ನು ಸೇವಿಸಿ.',
          bn: 'সকালে ২ গ্লাস কুসুম গরম জল পান করুন এবং পাকা পেঁপে খান।',
        }
      },
      {
        id: 'mild_earache',
        name: {
          en: 'Mild Earache & Fullness',
          mr: 'हलकी कानदुखी / कानात जडपणा (Earache)',
          hi: 'कान में हल्का दर्द / भारीपन',
          ta: 'லேசான காது வலி',
          kn: 'ಸೌಮ್ಯ ಕಿವಿ ನೋವು',
          bn: 'হালকা কান ব্যথা',
        },
        desc: {
          en: 'Mild ear discomfort after bath or cold breeze, no pus discharge.',
          mr: 'पाणी गेल्याने किंवा थंडीमुळे कानात हलकी ठसठस, पू येत नाही.',
          hi: 'नहाने के बाद या ठंड से कान में हल्का दर्द, कोई मवाद नहीं।',
          ta: 'குளித்த பின் அல்லது குளிர்காற்றால் லேசான காது வலி.',
          kn: 'ಸ್ನಾನದ ನಂತರ ಅಥವಾ ಶೀತದಿಂದ ಕಿವಿಯಲ್ಲಿ ನೋವು.',
          bn: 'স্নানের পর বা ঠান্ডার কারণে কানে মৃদু ব্যথা।',
        },
        category: {
          en: 'ENT',
          mr: 'कान-नाक-घसा (ENT)',
          hi: 'ईएनटी (ENT)',
          ta: 'காது மூக்கு தொண்டை',
          kn: 'ಇಎನ್‌ಟಿ (ENT)',
          bn: 'ইএনটি (ENT)',
        },
        rxGenericEn: 'Tab. Paracetamol 500mg',
        rxNameLocal: {
          en: 'Tab. Paracetamol 500mg',
          mr: 'पॅरासिटामॉल ५०० मि.ग्रॅ. (Paracetamol)',
          hi: 'पैरासिटामोल ५०० मि.ग्रा.',
          ta: 'பாராசிட்டமால் 500 மிகி',
          kn: 'ಪ್ಯಾರಸಿಟಮಾಲ್ 500 ಮಿಲಿಗ್ರಾಂ',
          bn: 'প্যারাসিটামল ৫০০ মিগ্রা',
        },
        dosage: '1 Tablet',
        instructionsEn: '1 tablet post-meals if earache bothers for 2 days.',
        instructionsLocal: {
          en: '1 tablet post-meals if earache bothers for 2 days.',
          mr: '१ गोळी जेवणानंतर, कान दुखत असल्यास [२ दिवस].',
          hi: '१ गोली भोजन के बाद, कान में दर्द होने पर [२ दिन]।',
          ta: 'உணவுக்குப் பின் 1 மாத்திரை [2 நாட்கள்].',
          kn: 'ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ [2 ದಿನಗಳು].',
          bn: 'খাবারের পর ১টি ট্যাবলেট [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Warm dry compress outside the ear with a warm towel. Keep ear dry; DO NOT put unboiled oil or sharp pins.',
          mr: 'कानाला बाहेरून गरम कपड्याने शेका. कानात पाणी जाऊ देऊ नका; कानात तेल, काडी किंवा पिन घालू नका.',
          hi: 'कान के बाहर गर्म कपड़े से सूखा सेक दें। कान में तेल या नुकीली चीजें न डालें।',
          ta: 'காதின் வெளிப்புறத்தில் வெதுவெதுப்பான துணியால் ஒத்தடம் கொடுக்கவும்.',
          kn: 'ಕಿವಿಯ ಹೊರಭಾಗದಲ್ಲಿ ಬೆಚ್ಚಗಿನ ಬಟ್ಟೆಯಿಂದ ಶಾಖ ಕೊಡಿ.',
          bn: 'কানের বাইরে শুকনো গরম কাপড়ের সেঁক দিন। কানে তেল বা কাঠি দেবেন না।',
        }
      },
      {
        id: 'motion_sickness_nausea',
        name: {
          en: 'Motion Sickness & Travel Nausea',
          mr: 'प्रवासातील मळमळ व उलटी (Motion Sickness)',
          hi: 'सफर में जी मिचलाना व उल्टी',
          ta: 'பயண வாந்தி / மயக்கம்',
          kn: 'ಪ್ರಯಾಣದ ವಾಂತಿ ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ',
          bn: 'যাত্রাপথে বমি বমি ভাব ও বমি',
        },
        desc: {
          en: 'Nausea, dizziness, cold sweat during bus, car or ghat travel.',
          mr: 'एसटी, गाडी किंवा घाटात प्रवास करताना मळमळणे, चक्कर येणे व उलटीची भावना.',
          hi: 'गाड़ी या बस में सफर के दौरान उल्टी और चक्कर आना।',
          ta: 'பயணத்தின் போது குமட்டல் மற்றும் தலைசுற்றல்.',
          kn: 'ಬಸ್ ಅಥವಾ ಕಾರು ಪ್ರಯಾಣದಲ್ಲಿ ವಾಂತಿ ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ.',
          bn: 'বাস বা গাড়িতে ভ্রমণের সময় বমি ভাব ও মাথা ঘোরা।',
        },
        category: {
          en: 'General',
          mr: 'सामान्य (General)',
          hi: 'सामान्य (General)',
          ta: 'பொதுவானது',
          kn: 'ಸಾಮಾನ್ಯ',
          bn: 'সাধারণ',
        },
        rxGenericEn: 'Tab. Ondansetron 4mg / Domperidone 10mg',
        rxNameLocal: {
          en: 'Tab. Ondansetron 4mg',
          mr: 'ऑन्डॅनसेट्रॉन ४ मि.ग्रॅ. गोळी (Ondansetron)',
          hi: 'ओन्डैनसेट्रॉन ४ मि.ग्रा.',
          ta: 'ஒண்டான்செட்ரான் 4 மிகி',
          kn: 'ಆಂಡಾನ್‌ಸೆಟ್ರಾನ್ 4 ಮಿಲಿಗ್ರಾಂ',
          bn: 'অনডানসেট্রন ৪ মিগ্রা',
        },
        dosage: '1 Tablet',
        instructionsEn: '1 tablet 30 minutes before starting journey.',
        instructionsLocal: {
          en: '1 tablet 30 minutes before starting journey.',
          mr: 'प्रवास सुरू करण्याच्या ३० मिनिटे आधी १ गोळी पाण्यासोबत घ्या.',
          hi: 'सफर शुरू करने से ३० मिनट पहले १ गोली लें।',
          ta: 'பயணம் தொடங்குவதற்கு 30 நிமிடங்களுக்கு முன் 1 மாத்திரை.',
          kn: 'ಪ್ರಯಾಣ ಆರಂಭಿಸುವ 30 ನಿಮಿಷ ಮುಂಚೆ 1 ಮಾತ್ರೆ ಸೇವಿಸಿ.',
          bn: 'যাত্রা শুরুর ৩০ মিনিট আগে ১টি ট্যাবলেট গ্রহণ করুন।',
        },
        timing: { morning: true, afternoon: false, night: false },
        remedy: {
          en: 'Chew a small piece of fresh ginger or suck on a lemon slice with black salt. Look at the distant horizon.',
          mr: 'आल्याचा तुकडा चावा किंवा लिंबावर थोडे काळे मीठ लावून चोखा. खिडकीतून दूर क्षितिजाकडे पहा.',
          hi: 'अदरक का टुकड़ा चबाएं या नींबू पर काला नमक लगाकर चूसें।',
          ta: 'சிறிய இஞ்சி துண்டை மெல்லவும் அல்லது எலுமிச்சை சாறு அருந்தவும்.',
          kn: 'ಶುಂಠಿಯ ತುಂಡನ್ನು ಜಗಿಯಿರಿ ಅಥವಾ ನಿಂಬೆ ಹಣ್ಣನ್ನು ಹೀರಿ.',
          bn: 'আদার টুকরো চিবিয়ে খান বা লেবুতে বিট নুন লাগিয়ে চুষুন।',
        }
      },
      {
        id: 'mouth_ulcers',
        name: {
          en: 'Mouth Ulcers / Canker Sores',
          mr: 'तोंड येणे / जिभेवरील फोड (Mouth Ulcers)',
          hi: 'मुंह के छाले (Mouth Ulcers)',
          ta: 'வாய் புண்கள்',
          kn: 'ಬಾಯಿ ಹುಣ್ಣು',
          bn: 'মুখের ঘা',
        },
        desc: {
          en: 'Painful white or red sores on tongue, gums or inner lips while eating.',
          mr: 'जीभ, हिरडी किंवा ओठांच्या आत पांढरे/लाल फोड, तिखट खाताना आग होणे.',
          hi: 'जीभ या होंठों के अंदर दर्दनाक छाले, तीखा खाने पर तेज जलन।',
          ta: 'நாக்கு அல்லது உதட்டின் உட்பகுதியில் வலிமிகுந்த புண்கள்.',
          kn: 'ನಾಲಿಗೆ ಅಥವಾ ತುಟಿಯ ಒಳಗೆ ನೋವಿನ ಹುಣ್ಣುಗಳು.',
          bn: 'জিহ্বা বা ঠোঁটের ভেতরে যন্ত্রণাদায়ক ঘা।',
        },
        category: {
          en: 'Oral Health',
          mr: 'तोंड व दंत (Oral Health)',
          hi: 'मौखिक स्वास्थ्य (Oral Health)',
          ta: 'வாய் ஆரோக்கியம்',
          kn: 'ಬಾಯಿಯ ಆರೋಗ್ಯ',
          bn: 'মুখের স্বাস্থ্য',
        },
        rxGenericEn: 'Choline Salicylate Gel + B-Complex Zinc Tablets',
        rxNameLocal: {
          en: 'B-Complex with Zinc + Ulcer Gel',
          mr: 'बी-कॉम्प्लेक्स झिंक गोळी व जेल (B-Complex + Gel)',
          hi: 'बी-कॉम्प्लेक्स जिंक गोली एवं अल्सर जेल',
          ta: 'பி-காம்ப்ளக்ஸ் மாத்திரை மற்றும் ஜெல்',
          kn: 'ಬಿ-ಕಾಂಪ್ಲೆಕ್ಸ್ ಮಾತ್ರೆ ಮತ್ತು ಜೆಲ್',
          bn: 'বি-কমপ্লেক্স ট্যাবলেট ও জেল',
        },
        dosage: '1 Tablet Daily + Gel Application',
        instructionsEn: 'Take 1 vitamin tablet daily for 2 days; apply gel before food.',
        instructionsLocal: {
          en: 'Take 1 vitamin tablet daily for 2 days; apply gel before food.',
          mr: 'दररोज १ बी-कॉम्प्लेक्स गोळी जेवणानंतर घ्या [२ दिवस]; जेवणाआधी फोडांवर जेल लावा.',
          hi: 'दिन में १ विटामिन गोली भोजन के बाद [२ दिन]; खाने से पहले जेल लगाएं।',
          ta: 'உணவுக்குப் பின் தினமும் 1 மாத்திரை [2 நாட்கள்].',
          kn: 'ಊಟದ ನಂತರ ದಿನಕ್ಕೆ 1 ಮಾತ್ರೆ [2 ದಿನಗಳು].',
          bn: 'খাবারের পর প্রতিদিন ১টি ট্যাবলেট [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: false },
        remedy: {
          en: 'Apply pure coconut oil or organic honey on the ulcers. Avoid spicy and sour food for 2 days.',
          mr: 'फोडांवर शुद्ध खोबरेल तेल किंवा मध लावा. दोन दिवस तिखट, खारट व आंबट पदार्थ खाणे टाळा.',
          hi: 'छालों पर नारियल तेल या शुद्ध शहद लगाएं। तीखा व खट्टा न खाएं।',
          ta: 'புண்களின் மீது தேங்காய் எண்ணெய் அல்லது தேன் தடவவும்.',
          kn: 'ಹುಣ್ಣುಗಳ ಮೇಲೆ ತೆಂಗಿನ ಎಣ್ಣೆ ಅಥವಾ ಜೇನುತುಪ್ಪ ಹಚ್ಚಿ.',
          bn: 'ঘায়ের ওপর খাঁটি নারকেল তেল বা মধু লাগান। ঝাল খাবার এড়িয়ে চলুন।',
        }
      },
      {
        id: 'minor_burn_scald',
        name: {
          en: 'Minor 1st Degree Kitchen Burns',
          mr: 'किरकोळ भाजणे / चटका बसणे (Minor Burns)',
          hi: 'मामूली जलना / भाप या तेल का चटका',
          ta: 'லேசான தீக்காயம்',
          kn: 'ಸೌಮ್ಯ ಸುಟ್ಟ ಗಾಯ',
          bn: 'সামান্য পুড়ে যাওয়া',
        },
        desc: {
          en: 'Redness and burning pain from hot tea, oil splash or utensil, no skin rupture.',
          mr: 'गरम चहा, तेल किंवा भांड्याचा चटका लागल्याने त्वचा लाल होणे व जळजळणे.',
          hi: 'गर्म चाय या तेल की छींट से त्वचा लाल होना और जलन, छाला नहीं।',
          ta: 'சூடான நீர் அல்லது எண்ணெயால் ஏற்படும் லேசான தீக்காயம்.',
          kn: 'ಬಿಸಿ ನೀರು ಅಥವಾ ಎಣ್ಣೆಯಿಂದ ಉಂಟಾದ ಸೌಮ್ಯ ಸುಟ್ಟ ಗಾಯ.',
          bn: 'গরম জল বা তেলের ছিটায় চামড়া লাল হয়ে জ্বালা করা।',
        },
        category: {
          en: 'Dermatology & First Aid',
          mr: 'त्वचारोग व प्रथमोपचार (First Aid)',
          hi: 'त्वचा एवं प्राथमिक उपचार',
          ta: 'முதலுதவி',
          kn: 'ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ',
          bn: 'প্রাথমিক চিকিৎসা',
        },
        rxGenericEn: 'Silver Sulfadiazine 1% / Burn Cream',
        rxNameLocal: {
          en: 'Silver Sulfadiazine 1% Cream',
          mr: 'सिल्व्हर सल्फाडायझिन १% मलम (Burn Cream)',
          hi: 'सिल्वर सल्फाडायजीन १% क्रीम',
          ta: 'சில்வர் சல்பாடயசின் 1% கிரீம்',
          kn: 'ಸಿಲ್ವರ್ ಸಲ್ಫಾಡಯಾಸಿನ್ 1% ಕ್ರೀಮ್',
          bn: 'সিলভার সালফাডায়াজিন ১% ক্রিম',
        },
        dosage: 'Local Application',
        instructionsEn: 'Apply gently twice daily over the burn area for 2 days.',
        instructionsLocal: {
          en: 'Apply gently twice daily over the burn area for 2 days.',
          mr: 'भाजलेल्या जागेवर दिवसातून २ वेळा हलक्या हाताने लावा [२ दिवस].',
          hi: 'जली हुई त्वचा पर दिन में २ बार हल्के हाथ से लगाएं [२ दिन]।',
          ta: 'பாதிக்கப்பட்ட பகுதியில் தினமும் 2 முறை தடவவும் [2 நாட்கள்].',
          kn: 'ಸುಟ್ಟ ಜಾಗಕ್ಕೆ ದಿನಕ್ಕೆ 2 ಬಾರಿ ಲೇಪಿಸಿ [2 ದಿನಗಳು].',
          bn: 'পোড়া জায়গায় দিনে ২ বার আলতো করে লাগান [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Immediately hold under cool running tap water for 15 minutes. DO NOT apply ice, toothpaste, or turmeric on fresh burns.',
          mr: 'ताबडतोब वाहत्या थंड नळाच्या पाण्याखाली १५ मिनिटे धरा. बर्फ, टूथपेस्ट किंवा हळद लावू नका.',
          hi: 'तुरंत बहते ठंडे पानी के नीचे १५ मिनट तक रखें। बर्फ या टूथपेस्ट न लगाएं।',
          ta: 'உடனடியாக 15 நிமிடங்கள் ஓடும் குளிர்ந்த நீரில் வைக்கவும்.',
          kn: 'ತಕ್ಷಣವೇ 15 ನಿಮಿಷಗಳ ಕಾಲ ತಣ್ಣೀರಿನಲ್ಲಿ ಹಿಡಿಯಿರಿ. ಮಂಜುಗಡ್ಡೆ ಅಥವಾ ಟೂತ್‌ಪೇಸ್ಟ್ ಹಚ್ಚಬೇಡಿ.',
          bn: 'অবিলম্বে ১৫ মিনিট ঠান্ডা জলের নিচে রাখুন। বরফ বা টুথপেস্ট লাগাবেন না।',
        }
      },
      {
        id: 'minor_cuts_abrasions',
        name: {
          en: 'Minor Cuts & Scrapes',
          mr: 'किरकोळ खरचटने / कापलेली जखम (Minor Cuts)',
          hi: 'मामूली खरोंच व छोटा घाव',
          ta: 'லேசான வெட்டுக்காயம் / சிராய்ப்பு',
          kn: 'ಸೌಮ್ಯ ಗಾಯ ಮತ್ತು ಪರಚು',
          bn: 'সামান্য কাটাছেঁড়া ও আঁচড়',
        },
        desc: {
          en: 'Superficial skin graze or paper cut, minimal bleeding that stops with pressure.',
          mr: 'वरवरची खरचटलेली जखम, थोडा रक्तस्त्राव जो दाब दिल्यावर थांबतो.',
          hi: 'त्वचा पर हल्की खरोंच या छोटा चीरा, खून बहना रुक गया हो।',
          ta: 'மேலோட்டமான சிராய்ப்பு அல்லது சிறிய வெட்டுக்காயம்.',
          kn: 'ಮೇಲ್ಮೈ ಚರ್ಮದ ಗಾಯ ಮತ್ತು ರಕ್ತಸ್ರಾವ ನಿಂತಿದೆ.',
          bn: 'ত্বকে সামান্য আঁচড় বা ছোট কাটা, রক্তপাত বন্ধ হয়েছে।',
        },
        category: {
          en: 'First Aid',
          mr: 'प्रथमोपचार (First Aid)',
          hi: 'प्राथमिक उपचार (First Aid)',
          ta: 'முதலுதவி',
          kn: 'ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ',
          bn: 'প্রাথমিক চিকিৎসা',
        },
        rxGenericEn: 'Povidone Iodine 5% Ointment + Adhesive Bandage',
        rxNameLocal: {
          en: 'Povidone Iodine 5% Ointment',
          mr: 'पोव्हिडोन आयोडिन ५% मलम (Betadine Ointment)',
          hi: 'पोवीडोन आयोडीन ५% मलहम',
          ta: 'போவிடோன் அயோடின் 5% களிம்பு',
          kn: 'ಪೋವಿಡೋನ್ ಅಯೋಡಿನ್ 5% ಮುಲಾಮು',
          bn: 'পোভিডোন আয়োডিন ৫% মলম',
        },
        dosage: 'Local Application',
        instructionsEn: 'Clean with clean water and apply twice daily for 2 days.',
        instructionsLocal: {
          en: 'Clean with clean water and apply twice daily for 2 days.',
          mr: 'स्वच्छ पाण्याने धुवून दिवसातून दोनदा मलम लावा व पट्टी बांधा [२ दिवस].',
          hi: 'साफ पानी से धोकर दिन में दो बार लगाएं व पट्टी करें [२ दिन]।',
          ta: 'சுத்தமான நீரில் கழுவி தினமும் 2 முறை தடவவும் [2 நாட்கள்].',
          kn: 'ಸ್ವಚ್ಛ ನೀರಿನಿಂದ ತೊಳೆದು ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಹಚ್ಚಿ [2 ದಿನಗಳು].',
          bn: 'পরিষ্কার জল দিয়ে ধুয়ে দিনে দুবার লাগান [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Wash thoroughly with clean soap and water to remove dirt. Apply pressure with clean cloth for 2 minutes to stop bleeding.',
          mr: 'जखम स्वच्छ पाण्याने धुवून धूळ-माती काढून टाका. स्वच्छ कापडाने २ मिनिटे दाबून धरा.',
          hi: 'घाव को साफ पानी और साबुन से अच्छी तरह धोएं। साफ कपड़े से दबाकर खून रोकें।',
          ta: 'தூசியை நீக்க சோப்பு மற்றும் நீரால் நன்றாகக் கழுவவும்.',
          kn: 'ಧೂಳನ್ನು ತೆಗೆದುಹಾಕಲು ಸ್ವಚ್ಛ ನೀರಿನಿಂದ ತೊಳೆಯಿರಿ.',
          bn: 'ধুলোবালি দূর করতে পরিষ্কার জল দিয়ে ধুয়ে ফেলুন।',
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
          en: 'Infectious',
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
          en: 'Gastroenterology',
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
          en: 'Respiratory',
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
          en: 'Gastroenterology',
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
          en: 'Dermatology',
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
      },
      {
        id: 'dehydration_sunstroke',
        name: {
          en: 'Heat Exhaustion & Sunstroke Discomfort',
          mr: 'उन्हाचा त्रास / अशक्तपणा (Heat Exhaustion)',
          hi: 'लू लगना / अत्यधिक कमजोरी (Sunstroke)',
          ta: 'வெப்ப சோர்வு மற்றும் நீர்ச்சத்து குறைவு',
          kn: 'ಬಿಸಿಲಿನ ತಾಪ ಮತ್ತು ಆಯಾಸ',
          bn: 'হিটস্ট্রোক ও তীব্র পানিশূন্যতা',
        },
        desc: {
          en: 'Extreme dizziness, heavy perspiration, dry parched mouth after working in hot sun.',
          mr: 'उन्हात शेतात काम केल्यावर चक्कर येणे, खूप घाम सुटणे, घसा कोरडा पडणे व अशक्तपणा.',
          hi: 'तेज धूप में चक्कर आना, अधिक पसीना आना, मुंह सूखना व कमजोरी।',
          ta: 'வெயிலில் வேலை செய்த பின் தலைச்சுற்றல் மற்றும் தீவிர சோர்வு.',
          kn: 'ಬಿಸಿಲಿನಲ್ಲಿ ಕೆಲಸ ಮಾಡಿದ ನಂತರ ತಲೆತಿರುಗುವಿಕೆ ಮತ್ತು ವಿಪರೀತ ಬಾಯಾರಿಕೆ.',
          bn: 'রোদে কাজ করার পর তীব্র মাথা ঘোরা, দুর্বলতা ও মুখ শুকিয়ে যাওয়া।',
        },
        category: {
          en: 'Emergency Medicine',
          mr: 'आपत्कालीन (Emergency)',
          hi: 'आपातकालीन (Emergency)',
          ta: 'அவசர சிகிச்சை',
          kn: 'ತುರ್ತು ಚಿಕಿತ್ಸೆ',
          bn: 'জরুরি চিকিৎসা',
        },
        rxGenericEn: 'Oral Rehydration Salts (WHO ORS Sachet)',
        rxNameLocal: {
          en: 'WHO ORS Electrolyte Sachet',
          mr: 'ओआरएस इलेक्ट्रोलाइट रिहायड्रेशन सॅचेट',
          hi: 'ओआरएस घोल पैकेट',
          ta: 'ஓஆர்எஸ் எலக்ட்ரோலைட் பாக்கெட்',
          kn: 'ಒಆರ್‌ಎಸ್ ಎಲೆಕ್ಟ್ರೋಲೈಟ್ ಸ್ಯಾಚೆಟ್',
          bn: 'ওআরএস ইলেক্ট্রোলাইট স্যাচেট',
        },
        dosage: '1 Sachet in 1 Litre Water',
        instructionsEn: 'Dissolve in 1 Litre clean drinking water; drink periodically over 2 days.',
        instructionsLocal: {
          en: 'Dissolve in 1 Litre clean drinking water; drink periodically over 2 days.',
          mr: '१ लिटर स्वच्छ पाण्यात मिसळून दिवसभर थोडे थोडे प्यावे [२ दिवस].',
          hi: '१ लीटर पानी में घोलकर दिनभर थोड़ा-थोड़ा पिएं [२ दिन]।',
          ta: '1 லிட்டர் தண்ணீரில் கலந்து நாள் முழுவதும் குடிக்கவும் [2 நாட்கள்].',
          kn: '1 ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಬೆರೆಸಿ ದಿನವಿಡೀ ಕುಡಿಯಿರಿ [2 ದಿನಗಳು].',
          bn: '১ লিটার জলে গুলে সারাদিন অল্প অল্প করে পান করুন [২ দিন]।',
        },
        timing: { morning: true, afternoon: true, night: true },
        remedy: {
          en: 'Move immediately to a cool shaded place; sip tender coconut water or cold milk.',
          mr: 'तातडीने सावलीत शांत झोपावे; शहाळ्याचे पाणी किंवा थंड दूध प्यावे.',
          hi: 'तुरंत छायादार ठंडे स्थान पर आराम करें; नारियल पानी या ठंडा दूध पिएं।',
          ta: 'நிழலான இடத்தில் ஓய்வெடுக்கவும்; இளநீர் அல்லது குளிர்ந்த பால் குடிக்கவும்.',
          kn: 'ತಂಪಾದ ಸ್ಥಳದಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ; ಎಳನೀರು ಅಥವಾ ತಣ್ಣನೆಯ ಹಾಲು ಕುಡಿಯಿರಿ.',
          bn: 'ঠান্ডা ছায়াযুক্ত স্থানে বিশ্রাম নিন; ডাবের জল বা ঠান্ডা দুধ পান করুন।',
        }
      },
      {
        id: 'red_eyes_conjunctivitis',
        name: {
          en: 'Acute Conjunctivitis & Eye Irritation',
          mr: 'डोळे येणे / लालसरपणा (Conjunctivitis)',
          hi: 'आंख आना / आंखों में लाली व जलन',
          ta: 'கண் சிவப்பு மற்றும் எரிச்சல்',
          kn: 'ಕಣ್ಣು ಕೆಂಪಾಗುವುದು ಮತ್ತು ಉರಿ',
          bn: 'চোখ ওঠা / চোখে লালচে ভাব ও অস্বস্তি',
        },
        desc: {
          en: 'Severe eye redness, gritty feeling, sticky watery discharge, morning eyelid crusting.',
          mr: 'डोळे लाल भडक होणे, टोचणे, डोळ्यांतून चिकट पाणी येणे, पापण्या चिकटणे.',
          hi: 'आंखों में लालिमा, चुभन, पानी आना और चिपचिपापन।',
          ta: 'கண் சிவத்தல், நீர் வடிதல் மற்றும் கண் இமைகள் ஒட்டுதல்.',
          kn: 'ಕಣ್ಣುಗಳು ಕೆಂಪಾಗುವುದು, ನೀರು ಸುರಿಯುವುದು ಮತ್ತು ರೆಪ್ಪೆಗಳು ಅಂಟಿಕೊಳ್ಳುವುದು.',
          bn: 'চোখ লাল হওয়া, খচখচ করা ও সকালে চোখের পাতা জুড়ে যাওয়া।',
        },
        category: {
          en: 'Ophthalmology',
          mr: 'नेत्ररोग (Ophthalmology)',
          hi: 'नेत्र रोग (Ophthalmology)',
          ta: 'கண் மருத்துவம்',
          kn: 'ನೇತ್ರಶಾಸ್ತ್ರ',
          bn: 'চক্ষুরোগ',
        },
        rxGenericEn: 'Carboxymethylcellulose 0.5% Lubricant Eye Drops',
        rxNameLocal: {
          en: 'Lubricant Eye Drops 0.5%',
          mr: 'वंगण आय ड्रॉप्स (Lubricant Eye Drops)',
          hi: 'लुब्रिकेंट आई ड्रॉप्स',
          ta: 'கண் சொட்டு மருந்து',
          kn: 'ಕಣ್ಣಿನ ಹನಿಗಳು',
          bn: 'চোখের ড্রপ',
        },
        dosage: '1-2 Drops in each eye',
        instructionsEn: 'Instill 1-2 drops in affected eye 3 times daily for 2 days. Do not rub eyes.',
        instructionsLocal: {
          en: 'Instill 1-2 drops in affected eye 3 times daily for 2 days. Do not rub eyes.',
          mr: 'दिवसातून ३ वेळा १-२ थेंब डोळ्यात टाकावे [२ दिवस]. डोळे चोळू नयेत.',
          hi: 'दिन में ३ बार १-२ बूंद आंख में डालें [२ दिन]। आंखें न मलें।',
          ta: 'நாளைக்கு 3 முறை 1-2 சொட்டு கண்ணில் இடவும் [2 நாட்கள்].',
          kn: 'ದಿನಕ್ಕೆ 3 ಬಾರಿ 1-2 ಹನಿಗಳನ್ನು ಕಣ್ಣಿಗೆ ಹಾಕಿ [2 ದಿನಗಳು].',
          bn: 'দিনে ৩ বার ১-২ ফোঁটা চোখে দিন [২ দিন]। চোখ ঘষবেন না।',
        },
        timing: { morning: true, afternoon: true, night: true },
        remedy: {
          en: 'Wash eyes gently with boiled and cooled clean water; wear dark sunglasses outdoors.',
          mr: 'उकळून थंड केलेल्या स्वच्छ पाण्याने डोळे धुवा; काळा चष्मा वापरा व इतरांचा रुमाल वापरू नका.',
          hi: 'उबले हुए ठंडे पानी से आंखें धोएं; धूप का चश्मा पहनें और तौलिया अलग रखें।',
          ta: 'குளிர்ந்த நீரால் கண்களைக் கழுவவும்; கருப்புக் கண்ணாடி அணியவும்.',
          kn: 'ಕುದಿಸಿ ತಣಿಸಿದ ನೀರಿನಿಂದ ಕಣ್ಣುಗಳನ್ನು ತೊಳೆಯಿರಿ; ಕಪ್ಪು ಕನ್ನಡಕ ಬಳಸಿ.',
          bn: 'ফুটানো ঠান্ডা জল দিয়ে চোখ ধুয়ে নিন; কালো চশমা পরুন ও আলাদা তোয়ালে ব্যবহার করুন।',
        }
      },
      {
        id: 'joint_swelling_arthritis',
        name: {
          en: 'Severe Joint Swelling & Pain',
          mr: 'सांधेदुखी व सांध्यांवर तीव्र सूज (Joint Pain & Swelling)',
          hi: 'जोड़ों में गंभीर दर्द व सूजन',
          ta: 'மூட்டு வலி மற்றும் கடுமையான வீக்கம்',
          kn: 'ಕೀಲು ನೋವು ಮತ್ತು ತೀವ್ರ ಊತ',
          bn: 'জয়েন্টে তীব্র ব্যথা ও ফোলাভাব',
        },
        desc: {
          en: 'Severe pain, heat, and swelling in knees, ankles or wrists with morning stiffness.',
          mr: 'गुडघे, घोटा किंवा मनगटावर लालसर सूज, हालचाल करताना तीव्र कळा व ताठरता.',
          hi: 'घुटनों या टखनों में तेज दर्द, लालिमा और सूजन, चलने-फिरने में कठिनाई।',
          ta: 'முழங்கால் அல்லது கணுக்காலில் கடுமையான வலி மற்றும் வீக்கம்.',
          kn: 'ಮೊಣಕಾಲು ಅಥವಾ ಕೀಲುಗಳಲ್ಲಿ ತೀವ್ರ ನೋವು ಮತ್ತು ಊತ.',
          bn: 'হাঁটু বা গোড়ালিতে তীব্র ব্যথা, লালচে ভাব ও ফোলাভাব।',
        },
        category: {
          en: 'Orthopedics & Rheumatology',
          mr: 'अस्थिरोग (Orthopedics)',
          hi: 'अस्थि रोग (Orthopedics)',
          ta: 'எலும்பியல்',
          kn: 'ಮೂಳೆ ರೋಗ',
          bn: 'অস্থিবিদ্যা',
        },
        rxGenericEn: 'Tab. Paracetamol 650mg + Topical Diclofenac Gel',
        rxNameLocal: {
          en: 'Tab. Paracetamol 650mg + Gel',
          mr: 'पॅरासिटामॉल ६५० मि.ग्रॅ. + पेन रिलिफ जेल',
          hi: 'पैरासिटामोल ६५० मि.ग्रा. + दर्द निवारक जेल',
          ta: 'பாராசிட்டமால் 650 மிகி + வலி நிவாரண ஜெல்',
          kn: 'ಪ್ಯಾರಸಿಟಮಾಲ್ 650 ಮಿಲಿಗ್ರಾಂ + ಮುಲಾಮು',
          bn: 'প্যারাসিটামল ৬৫০ মিগ্রা + ব্যথানাশক জেল',
        },
        dosage: '1 Tablet twice daily + Gel application',
        instructionsEn: 'Take 1 tablet after food twice daily for 2 days. Consult an Orthopedic doctor.',
        instructionsLocal: {
          en: 'Take 1 tablet after food twice daily for 2 days. Consult an Orthopedic doctor.',
          mr: 'जेवणानंतर १ गोळी दिवसातून २ वेळा [२ दिवस]. तात्पुरता आराम मिळेपर्यंत लावा, हाडांच्या डॉक्टरांना भेटा.',
          hi: 'भोजन के बाद १ गोली दिन में २ बार [२ दिन]। दर्द जेल लगाएं, अस्थि रोग विशेषज्ञ को दिखाएं।',
          ta: 'உணவுக்குப் பின் 1 மாத்திரை தினமும் 2 முறை [2 நாட்கள்].',
          kn: 'ಊಟದ ನಂತರ ದಿನಕ್ಕೆ 2 ಬಾರಿ 1 ಮಾತ್ರೆ [2 ದಿನಗಳು].',
          bn: 'খাবারের পর ১টি ট্যাবলেট দিনে ২ বার [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Rest the joint; apply warm water compress with epsom salt; avoid heavy walking or squats.',
          mr: 'सांध्याला विश्रांती द्या; गरम पाण्यात मीठ टाकून शेका; जास्त चालणे व वजन उचलणे टाळा.',
          hi: 'जोड़ों को आराम दें, गुनगुने पानी में नमक डालकर सिकाई करें, वजन न उठाएं।',
          ta: 'மூட்டுகளுக்கு ஓய்வு கொடுக்கவும், வெதுவெதுப்பான உப்பு நீரில் ஒத்தடம் கொடுக்கவும்.',
          kn: 'ಕೀಲುಗಳಿಗೆ ವಿಶ್ರಾಂತಿ ನೀಡಿ, ಬೆಚ್ಚಗಿನ ಉಪ್ಪು ನೀರಿನಿಂದ ಶಾಖ ಕೊಡಿ.',
          bn: 'জয়েন্টকে বিশ্রাম দিন, গরম নুন জল দিয়ে সেঁক দিন।',
        }
      },
      {
        id: 'burning_urination_uti',
        name: {
          en: 'Painful Burning Urination (Suspected UTI)',
          mr: 'लघवी करताना आग होणे / जळजळ (Burning Urination)',
          hi: 'पेशाब में तेज जलन / मूत्र संक्रमण (UTI)',
          ta: 'சிறுநீர் கழிக்கும் போது கடுமையான எரிச்சல்',
          kn: 'ಮೂತ್ರ ವಿಸರ್ಜನೆಯಲ್ಲಿ ಉರಿ ಮತ್ತು ನೋವು',
          bn: 'প্রস্রাবের সময় তীব্র জ্বালা ও ব্যথা',
        },
        desc: {
          en: 'Sharp burning sensation, frequent urgency, lower abdominal pelvic pain.',
          mr: 'लघवी करताना तीव्र जळजळ, वारंवार लघवीची भावना, ओटीपोटात दुखणे.',
          hi: 'पेशाब करते समय तेज जलन, बार-बार पेशाब की इच्छा, पेल्विक दर्द।',
          ta: 'சிறுநீர் கழிக்கும் போது கடுமையான எரிச்சல் மற்றும் அடிவயிற்று வலி.',
          kn: 'ಮೂತ್ರ ವಿಸರ್ಜನೆ ಮಾಡುವಾಗ ಉರಿ ಮತ್ತು ಕಿಬ್ಬೊಟ್ಟೆ ನೋವು.',
          bn: 'প্রস্রাবে তীব্র জ্বালাপোড়া, ঘন ঘন প্রস্রাবের বেগ ও তলপেটে ব্যথা।',
        },
        category: {
          en: 'Urology & Nephrology',
          mr: 'मूत्ररोग (Urology)',
          hi: 'मूत्र रोग (Urology)',
          ta: 'சிறுநீரகவியல்',
          kn: 'ಮೂತ್ರಪಿಂಡ ರೋಗ',
          bn: 'ইউরোলজি',
        },
        rxGenericEn: 'Disodium Hydrogen Citrate Liquid (Alkalizer)',
        rxNameLocal: {
          en: 'Urine Alkalizer Syrup (Citrate)',
          mr: 'सिट्रेट युरिन अल्कलायझर सिरप (Alkalizer)',
          hi: 'साइट्रेट यूरिन अल्केलाइजर सिरप',
          ta: 'யூரினரி அல்கலைசர் சிரப்',
          kn: 'ಯೂರಿನ್ ಆಲ್ಕಲೈಜರ್ ಸಿರಪ್',
          bn: 'ইউরিন অ্যালকালাইজার সিরাপ',
        },
        dosage: '2 Teaspoons in Glass of Water',
        instructionsEn: 'Mix 2 teaspoons in 1 glass of drinking water twice daily for 2 days. Drink plenty of water.',
        instructionsLocal: {
          en: 'Mix 2 teaspoons in 1 glass of drinking water twice daily for 2 days. Drink plenty of water.',
          mr: '१ ग्लास पाण्यात २ चमचे सिरप टाकून दिवसातून २ वेळा प्या [२ दिवस]. भरपूर पाणी प्या.',
          hi: '१ गिलास पानी में २ चम्मच सिरप मिलाकर दिन में २ बार पिएं [२ दिन]।',
          ta: '1 டம்ளர் நீரில் 2 ஸ்பூன் கலந்து தினமும் 2 முறை அருந்தவும் [2 நாட்கள்].',
          kn: '1 ಲೋಟ ನೀರಿನಲ್ಲಿ 2 ಚಮಚ ಬೆರೆಸಿ ದಿನಕ್ಕೆ 2 ಬಾರಿ ಕುಡಿಯಿರಿ [2 ದಿನಗಳು].',
          bn: '১ গ্লাস জলে ২ চামচ সিরাপ মিশিয়ে দিনে ২ বার পান করুন [২ দিন]।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Drink 3 to 4 liters of clean water daily, tender coconut water, and barley water. Do not hold urine.',
          mr: 'दिवसाला ३ ते ४ लिटर स्वच्छ पाणी, शहाळ्याचे पाणी व ताक प्या. लघवी रोखून धरू नका.',
          hi: 'दिन में ३ से ४ लीटर पानी पिएं, नारियल पानी और छाछ लें। पेशाब न रोकें।',
          ta: 'தினமும் 3-4 லிட்டர் தண்ணீர், இளநீர் மற்றும் மோர் அருந்தவும்.',
          kn: 'ದಿನಕ್ಕೆ 3-4 ಲೀಟರ್ ನೀರು ಮತ್ತು ಎಳನೀರು ಕುಡಿಯಿರಿ.',
          bn: 'দিনে ৩-৪ লিটার জল এবং ডাবের জল পান করুন।',
        }
      },
      {
        id: 'jaundice_yellow_eyes',
        name: {
          en: 'Yellow Eyes & Dark Urine (Suspected Jaundice)',
          mr: 'डोळे पिवळे पडणे व गर्द लघवी (कावीळ संशय - Jaundice)',
          hi: 'आंखें व त्वचा पीली होना / पीलिया (Jaundice)',
          ta: 'மஞ்சள் காமாலை சந்தேகம் (கண்கள் மஞ்சள் நிறமாதல்)',
          kn: 'ಕಣ್ಣುಗಳು ಹಳದಿಯಾಗುವುದು / ಕಾಮಾಲೆ ಶಂಕೆ',
          bn: 'চোখ হলুদ হওয়া / জন্ডিসের আশঙ্কা',
        },
        desc: {
          en: 'Yellowish sclera of eyes, deep tea-colored urine, profound fatigue, loss of appetite.',
          mr: 'डोळ्यांचा पांढरा भाग पिवळा दिसणे, लघवी लालसर-पिवळी होणे, भूक मंदावणे व थकवा.',
          hi: 'आंखों में पीलापन, गहरे रंग का पेशाब, भूख न लगना और अत्यधिक कमजोरी।',
          ta: 'கண்கள் மற்றும் சிறுநீர் மஞ்சள் நிறமாதல், தீவிர சோர்வு.',
          kn: 'ಕಣ್ಣುಗಳು ಹಳದಿಯಾಗುವುದು, ಗಾಢ ಬಣ್ಣದ ಮೂತ್ರ, ಹಸಿವಿನ ಕೊರತೆ.',
          bn: 'চোখ ও প্রস্রাব হলুদ হওয়া, ক্ষুধামন্দা ও অতিরিক্ত ক্লান্তি।',
        },
        category: {
          en: 'Gastroenterology & Hepatology',
          mr: 'यकृत विकार (Hepatology)',
          hi: 'यकृत रोग (Hepatology)',
          ta: 'கல்லீரல் நோய்',
          kn: 'ಯಕೃತ್ತಿನ ರೋಗ',
          bn: 'লিভারের রোগ',
        },
        rxGenericEn: 'Electrolytes + Liver Health Support (Medical Visit Required)',
        rxNameLocal: {
          en: 'ORS + Liver Support (Doctor Consult Mandated)',
          mr: 'ओआरएस व हायड्रेशन (डॉक्टरांची भेट तातडीने आवश्यक)',
          hi: 'ओआरएस घोल एवं यकृत परामर्श (डॉक्टर को तुरंत दिखाएं)',
          ta: 'ஓஆர்எஸ் மற்றும் மருத்துவர் ஆலோசனை கட்டாயம்',
          kn: 'ಒಆರ್‌ಎಸ್ ಮತ್ತು ವೈದ್ಯರ ಭೇಟಿ ಕಡ್ಡಾಯ',
          bn: 'ওআরএস ও ডাক্তারের পরামর্শ আবশ্যক',
        },
        dosage: 'Hydration Only',
        instructionsEn: 'Keep patient well hydrated. Immediate doctor visit for Liver Function Tests (LFT).',
        instructionsLocal: {
          en: 'Keep patient well hydrated. Immediate doctor visit for Liver Function Tests (LFT).',
          mr: 'रुग्णाला डिहायड्रेशन होऊ देऊ नका. त्वरित जवळच्या प्राथमिक आरोग्य केंद्रात एलएफटी रक्ताची तपासणी करा.',
          hi: 'मरीज को पर्याप्त तरल पदार्थ दें। तुरंत डॉक्टर से एलएफटी (LFT) जांच करवाएं।',
          ta: 'உடனடியாக மருத்துவரை சந்தித்து எல்எஃப்டி பரிசோதனை செய்யவும்.',
          kn: 'ತಕ್ಷಣವೇ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ ಎಲ್ಎಫ್‌ಟಿ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ.',
          bn: 'রোগীকে পর্যাপ্ত জলীয় খাবার দিন। অবিলম্বে ডাক্তারের কাছে যান।',
        },
        timing: { morning: true, afternoon: true, night: true },
        remedy: {
          en: 'Drink sugarcane juice from clean source, boiled water, and eat boiled bland rice and moong dal. Avoid oily food strictly.',
          mr: 'उकळलेले पाणी प्या, मुगाची मऊ खिचडी खा. तेलकट, मसालेदार व बाहेरचे अन्न पूर्णपणे बंद करा.',
          hi: 'उबला हुआ पानी पिएं, मूंग दाल की खिचड़ी लें। तला-भुना खाना पूरी तरह बंद करें।',
          ta: 'எண்ணெய் இல்லாத எளிய உணவு உண்ணவும், கொதிக்க வைத்த நீர் அருந்தவும்.',
          kn: 'ಎಣ್ಣೆ ರಹಿತ ಆಹಾರ ಸೇವಿಸಿ, ಕುದಿಸಿದ ನೀರನ್ನು ಕುಡಿಯಿರಿ.',
          bn: 'সিদ্ধ হালকা খাবার খান, তেল-মশলাদার খাবার সম্পূর্ণ বন্ধ রাখুন।',
        }
      },
      {
        id: 'hypertensive_dizziness',
        name: {
          en: 'Sudden High BP Spike & Giddiness',
          mr: 'अचानक चक्कर येणे व बीपी वाढणे (High BP Spike)',
          hi: 'अचानक चक्कर आना व बीपी बढ़ना',
          ta: 'திடீர் உயர் ரத்த அழுத்தம் மற்றும் தலைசுற்றல்',
          kn: 'ರಕ್ತದೊತ್ತಡ ಹೆಚ್ಚಳ ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ',
          bn: 'হঠাৎ উচ্চ রক্তচাপ বৃদ্ধি ও মাথা ঘোরা',
        },
        desc: {
          en: 'Pounding sensation in back of neck, visual floaters, dizziness, BP above 150/95 mmHg.',
          mr: 'मानेच्या मागे ठसठस, डोळ्यांसमोर अंधारी, चक्कर, रक्तदाब १५०/९५ पेक्षा जास्त.',
          hi: 'गर्दन के पीछे तेज धड़कन, आंखों के आगे अंधेरा, चक्कर आना, बीपी अधिक होना।',
          ta: 'கழுத்தின் பின் பகுதியில் துடிப்பு, தலைசுற்றல் மற்றும் உயர் ரத்த அழுத்தம்.',
          kn: 'ಕುತ್ತಿಗೆಯ ಹಿಂಭಾಗದಲ್ಲಿ ನೋವು, ತಲೆತಿರುಗುವಿಕೆ ಮತ್ತು ಅಧಿಕ ರಕ್ತದೊತ್ತಡ.',
          bn: 'ঘাড়ের পেছনে অস্বস্তি, চোখের সামনে অন্ধকার ও মাথা ঘোরা।',
        },
        category: {
          en: 'Cardiovascular & General Medicine',
          mr: 'हृदयरोग व रक्तदाब (Cardiovascular)',
          hi: 'हृदय एवं रक्तचाप (Cardiovascular)',
          ta: 'இதயவியல்',
          kn: 'ಹೃದ್ರೋಗ',
          bn: 'হৃদরোগ',
        },
        rxGenericEn: 'Medical BP Monitoring + Regular Prescribed Anti-hypertensive',
        rxNameLocal: {
          en: 'Rest & Clinical BP Check (Doctor Evaluation)',
          mr: 'विश्रांती व बीपी तपासणी (डॉक्टरांचा सल्ला आवश्यक)',
          hi: 'आराम एवं बीपी की जांच (चिकित्सकीय परामर्श आवश्यक)',
          ta: 'ஓய்வு மற்றும் ரத்த அழுத்த பரிசோதனை',
          kn: 'ವಿಶ್ರಾಂತಿ ಮತ್ತು ಬಿಪಿ ತಪಾಸಣೆ',
          bn: 'বিশ্রাম ও রক্তচাপ পরীক্ষা',
        },
        dosage: 'As prescribed by Doctor',
        instructionsEn: 'Do not panic. Lie down quietly in a cool place. Visit nearest clinic for accurate BP measurement.',
        instructionsLocal: {
          en: 'Do not panic. Lie down quietly in a cool place. Visit nearest clinic for accurate BP measurement.',
          mr: 'घाबरू नका. शांत झोपून राहा. ताबडतोब जवळच्या डॉक्टर किंवा प्राथमिक आरोग्य केंद्रात जाऊन बीपी तपासा.',
          hi: 'घबराएं नहीं। शांत जगह पर लेट जाएं। तुरंत नजदीकी क्लिनिक में बीपी नपवाएं।',
          ta: 'பயப்படாமல் அமைதியாக படுக்கவும். உடனடியாக மருத்துவமனை செல்லவும்.',
          kn: 'ಶಾಂತವಾಗಿ ಮಲಗಿ, ತಕ್ಷಣವೇ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಬಿಪಿ ಪರೀಕ್ಷಿಸಿ.',
          bn: 'শান্ত হয়ে শুয়ে থাকুন। অবিলম্বে নিকটস্থ স্বাস্থ্যকেন্দ্রে যান।',
        },
        timing: { morning: true, afternoon: false, night: true },
        remedy: {
          en: 'Cut down table salt immediately, practice slow deep diaphragmatic breathing for 10 minutes.',
          mr: 'आहारातील मीठ तात्काळ कमी करा. १० मिनिटे शांत बसून हळूहळू दीर्घ श्वास घ्या.',
          hi: 'नमक का सेवन तुरंत कम करें। १० मिनट शांत बैठकर गहरी सांस लें।',
          ta: 'உணவில் உப்பை உடனடியாகக் குறைக்கவும். ஆழமாக மூச்சு விடவும்.',
          kn: 'ಉಪ್ಪಿನ ಬಳಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ, ದೀರ್ಘ ಶ್ವಾಸ ತೆಗೆದುಕೊಳ್ಳಿ.',
          bn: 'খাবারে নুন কমান, গভীরভাবে শ্বাস নিন।',
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
      },
      {
        id: 'snake_bite_scorpion_sting',
        name: {
          en: 'Snake Bite / Venomous Scorpion Sting',
          mr: 'सर्पदंश किंवा विंचू दंश (Snake Bite / Scorpion Sting)',
          hi: 'सांप का काटना / बिच्छू का डंक (Snake Bite)',
          ta: 'பாம்பு கடி / தேள் கொட்டு',
          kn: 'ಹಾವು ಕಡಿತ / ಚೇಳು ಕಡಿತ',
          bn: 'সাপের কামড় / কাঁকড়াবিছার হুল',
        },
        desc: {
          en: 'Two fang puncture marks, burning pain, swelling, ptosis (droopy eyelids), breathing difficulty.',
          mr: 'दोन दातांचे व्रण, तीव्र जळजळ, सूज, पापण्या जड होणे, बोलताना अडखळणे.',
          hi: 'दांतों के दो निशान, तेज जलन, सूजन, पलकों का झुकना, सांस लेने में तकलीफ।',
          ta: 'பல் தடங்கள், தீவிர எரிச்சல், வீக்கம் மற்றும் கண் இமைகள் தொங்குதல்.',
          kn: 'ಹಲ್ಲಿನ ಗುರುತುಗಳು, ತೀವ್ರ ಉರಿ, ಊತ ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ.',
          bn: 'দাঁতের ক্ষত, তীব্র জ্বালা, ফোলাভাব ও চোখের পাতা ভারী হয়ে যাওয়া।',
        },
        category: {
          en: 'Emergency Toxicology',
          mr: 'विषबाधा व सर्पदंश (Toxicology)',
          hi: 'विष विज्ञान एवं आपातकाल',
          ta: 'நச்சுயியல் அவசர சிகிச்சை',
          kn: 'ವಿಷಶಾಸ್ತ್ರ ತುರ್ತು ಘಟಕ',
          bn: 'বিষক্রিয়া জরুরি চিকিৎসা',
        },
        critical: true,
        specialty: {
          en: 'Emergency Physician (Anti-Snake Venom Unit)',
          mr: 'आपत्कालीन सर्पदंश विभाग (Anti-Snake Venom Unit)',
          hi: 'एंटी-वेनम आपातकालीन विशेषज्ञ',
          ta: 'பாம்பு விஷ முறிவு அவசர மருத்துவர்',
          kn: 'ಹಾವು ಕಡಿತ ತುರ್ತು ಚಿಕಿತ್ಸಾ ತಜ್ಞರು',
          bn: 'অ্যান্টি-ভেনম জরুরি বিশেষজ্ঞ',
        }
      },
      {
        id: 'pesticide_chemical_poisoning',
        name: {
          en: 'Agricultural Pesticide / Chemical Ingestion',
          mr: 'शेती कीटकनाशक पोटात जाणे / विषबाधा (Pesticide Poisoning)',
          hi: 'कीटनाशक निगलना / विषाक्तता (Pesticide Ingestion)',
          ta: 'பூச்சிக்கொல்லி விஷம் குடித்தல்',
          kn: 'ಕೀಟನಾಶಕ ಸೇವನೆ / ವಿಷಪ್ರಾಶನ',
          bn: 'কীটনাশক পান / বিষক্রিয়া',
        },
        desc: {
          en: 'Accidental ingestion or spray inhalation, excessive salivation, pinpoint pupils, convulsions.',
          mr: 'कीटकनाशक पोटात जाणे, तोंडून फेस/लाळ गळणे, डोळ्यांची बाहुली बारीक होणे, उलट्या.',
          hi: 'खेत की दवा निगलना, मुंह से अत्यधिक लार, पुतलियां सिकुड़ना, सांस रुकना।',
          ta: 'பூச்சிக்கொல்லி மருந்தால் ஏற்படும் அதிக உமிழ்நீர் மற்றும் மூச்சுத் திணறல்.',
          kn: 'ಬಾಯಲ್ಲಿ ನೊರೆ ಬರುವುದು, ಕಣ್ಣಿನ ಪಾಪೆ ಕಿರಿದಾಗುವುದು ಮತ್ತು ಉಸಿರುಗಟ್ಟುವುದು.',
          bn: 'মুখ থেকে অতিরিক্ত লালা পড়া, চোখের মণি ছোট হওয়া ও খিঁচুনি।',
        },
        category: {
          en: 'Critical Care Toxicology',
          mr: 'अतिदक्षता विषबाधा विभाग (ICU Toxicology)',
          hi: 'क्रिटिकल केयर एवं आईसीयू',
          ta: 'தீவிர சிகிச்சை நச்சுயியல்',
          kn: 'ತೀವ್ರ ನಿಗಾ ವಿಷಶಾಸ್ತ್ರ',
          bn: 'আইসিইউ বিষক্রিয়া ইউনিট',
        },
        critical: true,
        specialty: {
          en: 'Intensive Care (ICU) & Toxicology Specialist',
          mr: 'अतिदक्षता विभाग (ICU) प्रमुख व विषशास्त्रज्ञ',
          hi: 'आईसीयू एवं टॉक्सिकोलॉजी विशेषज्ञ',
          ta: 'தீவிர சிகிச்சைப் பிரிவு நிபுணர்',
          kn: 'ಐಸಿಯು ಮತ್ತು ಟಾಕ್ಸಿಕಾಲಜಿ ತಜ್ಞರು',
          bn: 'আইসিইউ ও টক্সিকোলজি বিশেষজ্ঞ',
        }
      },
      {
        id: 'severe_head_injury_vomiting',
        name: {
          en: 'Severe Head Injury & Projectile Vomiting',
          mr: 'डोक्याला गंभीर मार, बेशुद्धी व उलटी (Head Trauma)',
          hi: 'सिर पर गंभीर चोट व लगातार उल्टी',
          ta: 'தீவிர தலைக்காயம் மற்றும் வாந்தி',
          kn: 'ತಲೆಗೆ ತೀವ್ರ ಪೆಟ್ಟು ಮತ್ತು ವಾಂತಿ',
          bn: 'মাথায় গুরুতর আঘাত ও বমি',
        },
        desc: {
          en: 'Fall or vehicular impact to skull, disorientation, fluid or blood from ears/nose, repeated vomiting.',
          mr: 'डोक्यावर जोराचा आघात, कानातून किंवा नाकातून पाणी/रक्त येणे, सतत उलट्या होणे.',
          hi: 'सिर पर भारी चोट, कान या नाक से खून/पानी आना, लगातार उल्टियां होना।',
          ta: 'தலையில் பலத்த காயம், காது/மூக்கிலிருந்து ரத்தம் மற்றும் வாந்தி.',
          kn: 'ತಲೆಗೆ ಬಲವಾದ ಪೆಟ್ಟು, ಕಿವಿ ಅಥವಾ ಮೂಗಿನಿಂದ ರಕ್ತಸ್ರಾವ.',
          bn: 'মাথায় প্রচণ্ড আঘাত, কান বা নাক দিয়ে রক্তপাত ও অবিরাম বমি।',
        },
        category: {
          en: 'Neurosurgery & Trauma',
          mr: 'न्यूरोसर्जरी व हेड ट्रॉमा (Neurosurgery)',
          hi: 'न्यूरोसर्जरी एवं ट्रॉमा',
          ta: 'நரம்பியல் அறுவை சிகிச்சை',
          kn: 'ನ್ಯೂರೋಸರ್ಜರಿ ಮತ್ತು ಟ್ರಾಮಾ',
          bn: 'নিউরোসার্জারি ও ট্রমা',
        },
        critical: true,
        specialty: {
          en: 'Neurosurgeon / Emergency Trauma Specialist',
          mr: 'न्यूरोसर्जन व हेड ट्रॉमा विशेषज्ञ',
          hi: 'न्यूरोसर्जन एवं ट्रॉमा विशेषज्ञ',
          ta: 'நரம்பியல் அறுவை சிகிச்சை நிபுணர்',
          kn: 'ನ್ಯೂರೋಸರ್ಜನ್ ತಜ್ಞರು',
          bn: 'নিউরোসার্জন ও ট্রমা বিশেষজ্ঞ',
        }
      },
      {
        id: 'anaphylaxis_choking',
        name: {
          en: 'Severe Allergic Anaphylaxis & Throat Choking',
          mr: 'तीव्र ॲलर्जीचा झटका, घसा आवळणे व श्वास गुदमरणे (Anaphylaxis)',
          hi: 'तीव्र एलर्जी का दौरा, गला घुटना व सांस रुकना',
          ta: 'தீவிர ஒவ்வாமை மற்றும் மூச்சுத் திணறல்',
          kn: 'ತೀವ್ರ ಅಲರ್ಜಿ ಮತ್ತು ಉಸಿರುಗಟ್ಟುವಿಕೆ',
          bn: 'মারাত্মক অ্যালার্জি ও শ্বাসরোধ অবস্থা',
        },
        desc: {
          en: 'Sudden swelling of lips/tongue/throat after food/insect bite, wheezing, low BP — immediate risk of asphyxiation.',
          mr: 'कीटक किंवा औषधांनंतर ओठ, जीभ व घसा अचानक फुगणे, श्वास घेता न येणे, चक्कर — तातडीचा प्राणघातक धोका.',
          hi: 'दवा या कीड़े के काटने से होंठ, जीभ और गले में तेज सूजन, सांस न आना — जानलेवा स्थिति।',
          ta: 'உணவு அல்லது பூச்சிக் கடியால் உதடு மற்றும் தொண்டையில் திடீர் வீக்கம்.',
          kn: 'ತುಟಿ ಮತ್ತು ಗಂಟಲು ಊದಿಕೊಳ್ಳುವುದು, ಉಸಿರಾಡಲು ತೊಂದರೆ.',
          bn: 'ঠোঁট, জিহ্বা ও গলা ফুলে যাওয়া, চরম শ্বাসকষ্ট ও সংজ্ঞাহীনতা।',
        },
        category: {
          en: 'Emergency & Critical Care',
          mr: 'आणीबाणी व अतिदक्षता (Critical Care)',
          hi: 'आपातकालीन एवं क्रिटिकल केयर',
          ta: 'அவசர சிகிச்சை பிரிவு',
          kn: 'ತುರ್ತು ಚಿಕಿತ್ಸೆ',
          bn: 'জরুরি ও ক্রিটিক্যাল কেয়ার',
        },
        critical: true,
        specialty: {
          en: 'Emergency Physician / Critical Care Resuscitation',
          mr: 'आपत्कालीन अतिदक्षता तज्ज्ञ व आयसीयू प्रमुख',
          hi: 'आपातकालीन चिकित्सक एवं गहन चिकित्सा विशेषज्ञ',
          ta: 'அவசர சிகிச்சை மருத்துவர்',
          kn: 'ತುರ್ತು ಚಿಕಿತ್ಸಾ ತಜ್ಞರು',
          bn: 'জরুরি চিকিৎসক ও আইসিইউ বিশেষজ্ঞ',
        }
      },
      {
        id: 'open_fracture_trauma',
        name: {
          en: 'Open Bone Fracture & Severe Limb Deformity',
          mr: 'हाड मोडणे / उघडी फ्रॅक्चर जखम (Open Compound Fracture)',
          hi: 'हड्डी टूटना व गहरा घाव / खुला फ्रैक्चर',
          ta: 'எலும்பு முறிவு மற்றும் தீவிர காயம்',
          kn: 'ಮೂಳೆ ಮುರಿತ ಮತ್ತು ತೀವ್ರ ಗಾಯ',
          bn: 'হাড় ভাঙা ও উন্মুক্ত ক্ষত',
        },
        desc: {
          en: 'Bone pierced through skin after crash or fall, intense pain, bleeding, inability to bear weight.',
          mr: 'अपघातातून हाड त्वचेतून बाहेर येणे, पाय किंवा हात वाकडा होणे, असह्य वेदना व रक्तस्त्राव.',
          hi: 'दुर्घटना या गिरने से हड्डी का त्वचा से बाहर आना, अंग मुड़ना और असहनीय दर्द।',
          ta: 'விபத்தில் எலும்பு தோலை கிழித்து வெளியே வருதல் மற்றும் கடுமையான வலி.',
          kn: 'ಅಪಘಾತದಿಂದ ಮೂಳೆ ಚರ್ಮವನ್ನು ಸೀಳಿ ಹೊರಬರುವುದು.',
          bn: 'দুর্ঘটনায় হাড় চামড়া ভেদ করে বেরিয়ে আসা ও তীব্র যন্ত্রণা।',
        },
        category: {
          en: 'Orthopedic Trauma Surgery',
          mr: 'अस्थिव्यंग व ट्रॉमा सर्जरी (Orthopedic Trauma)',
          hi: 'अस्थि रोग एवं ट्रॉमा सर्जरी',
          ta: 'எலும்பியல் அறுவை சிகிச்சை',
          kn: 'ಮೂಳೆ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ',
          bn: 'অর্থোপেডিক ট্রমা সার্জারি',
        },
        critical: true,
        specialty: {
          en: 'Orthopedic Trauma Surgeon',
          mr: 'अस्थिव्यंग व ट्रॉमा सर्जन',
          hi: 'अस्थि रोग एवं ट्रॉमा सर्जन',
          ta: 'எலும்பியல் அறுவை சிகிச்சை நிபுணர்',
          kn: 'ಮೂಳೆ ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ತಜ್ಞರು',
          bn: 'অর্থোপেডিক ট্রমা সার্জন',
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
  onSelectMember,
  onKioskModalClose
}) {
  const { lang, t } = useLanguage();
  const isKioskOperator = currentUser?.role === 'kiosk_operator' || currentUser?.role === 'grampanchayat' || currentUser?.role === 'gram_panchayat';

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
    if (isKioskOperator) {
      try {
        const savedKiosk = sessionStorage.getItem('activeKioskPatient');
        if (savedKiosk) return JSON.parse(savedKiosk);
        const saved = localStorage.getItem('arogya_active_member');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.relation === 'Walk-in Patient' || parsed?.registeredVia === 'kiosk') {
            return parsed;
          }
        }
      } catch (e) {}
      return null;
    }
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

  // Strict guard for Gram Panchayat / Kiosk operator: cannot use triage without active registered patient
  useEffect(() => {
    if (isKioskOperator) {
      let activePat = activeMember;
      if (!activePat) {
        try {
          const savedKiosk = sessionStorage.getItem('activeKioskPatient');
          if (savedKiosk) {
            activePat = JSON.parse(savedKiosk);
          } else {
            const saved = localStorage.getItem('arogya_active_member');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed?.relation === 'Walk-in Patient' || parsed?.registeredVia === 'kiosk') {
                activePat = parsed;
              }
            }
          }
        } catch (e) {}
      }

      if (!activePat || !activePat.id) {
        alert(
          lang === 'mr'
            ? 'कृपया आधी रुग्णाची नोंदणी करा. नोंदणीशिवाय लक्षणे तपासणी करता येत नाही.'
            : lang === 'hi'
            ? 'कृपया पहले मरीज का पंजीकरण करें। बिना पंजीकरण लक्षण जांच संभव नहीं है।'
            : 'Please register the walk-in patient first before accessing symptoms triage.'
        );
        if (onKioskModalClose) {
          onKioskModalClose();
        } else if (onNavigateToHub) {
          onNavigateToHub();
        }
      } else {
        setSelectedMember(activePat);
      }
    }
  }, [isKioskOperator, activeMember]);

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
  const [customSymptomText, setCustomSymptomText] = useState('');
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState(false);
  const [customError, setCustomError] = useState('');

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
      const patientPhone = selectedMember?.phone || currentUser?.phone || '';
      const patientGender = selectedMember?.gender || 'Other';
      const patientVillage = selectedMember?.village || currentUser?.village || '';
      const patientRelation = selectedMember?.relation || (isKioskOperator ? 'Walk-in Patient' : 'Self');
      const patientArogya = selectedMember?.arogyaId || patientAbha;

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
            gender: patientGender,
            bloodGroup: patientBlood,
            phone: patientPhone,
            village: patientVillage,
            relation: patientRelation,
            arogyaId: patientArogya,
            abhaId: patientAbha,
          },
          createdBy: isKioskOperator ? 'kiosk_desk' : 'symptom_checklist',
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
          gender: selectedMember?.gender || 'Other',
          bloodGroup: selectedMember?.bloodGroup || 'B+',
          phone: selectedMember?.phone || '',
          village: selectedMember?.village || '',
          relation: selectedMember?.relation || (isKioskOperator ? 'Walk-in Patient' : 'Self'),
          arogyaId: selectedMember?.arogyaId || 'AR-2026-00001',
          abhaId: selectedMember?.abhaId || '14-2026-9812-4456'
        },
        createdBy: isKioskOperator ? 'kiosk_desk' : 'symptom_checklist',
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

  const handleAnalyzeCustomSymptom = async () => {
    const trimmed = customSymptomText.trim();
    if (!trimmed) {
      setCustomError(lang === 'mr' ? 'कृपया आपला त्रास येथे लिहा.' : lang === 'hi' ? 'कृपया अपनी समस्या यहाँ लिखें।' : 'Please describe your symptoms.');
      return;
    }
    setCustomError('');
    setIsAnalyzingCustom(true);

    try {
      const activeMemberId = selectedMember?.id || currentUser?.id || 'self_1';
      const patientName = selectedMember?.name || currentUser?.name || 'Self (Primary Citizen)';
      const patientAge = selectedMember?.age || 42;
      const patientBlood = selectedMember?.bloodGroup || 'B+';
      const patientAbha = selectedMember?.abhaId || '14-2026-9812-4456';

      const res = await fetch('http://localhost:5000/api/triage/custom-symptom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptomText: trimmed,
          language: lang || 'mr',
          familyMemberId: activeMemberId,
          patientDetails: {
            name: patientName,
            age: patientAge,
            bloodGroup: patientBlood,
            abhaId: patientAbha,
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const prescription = data.prescription;

        // Sync to localStorage
        try {
          const savedList = JSON.parse(localStorage.getItem('arogya_prescriptions') || '[]');
          savedList.unshift(prescription);
          localStorage.setItem('arogya_prescriptions', JSON.stringify(savedList));
        } catch (e) {}

        setGeneratedPrescription(prescription);
        setModalOpen(true);
        setCustomSymptomText('');
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.warn('[Custom Symptom Error, creating fallback prescription]', err);
      // Create local fallback prescription
      const isCritical = /छाती|हार्ट|साप|विष|रक्त|बेहोश|heart|chest|snake|poison|unconscious|stroke|breathing/i.test(customSymptomText);
      const risk = isCritical ? 'CRITICAL' : 'MODERATE';
      const fallbackRx = {
        _id: 'rx_custom_' + Date.now(),
        id: 'rx_custom_' + Date.now(),
        familyMemberId: selectedMember?.id || 'self_1',
        patientDetails: {
          name: selectedMember?.name || 'Self',
          age: selectedMember?.age || 42,
          gender: selectedMember?.gender || 'Other',
          bloodGroup: selectedMember?.bloodGroup || 'B+',
          phone: selectedMember?.phone || '',
          village: selectedMember?.village || '',
          relation: selectedMember?.relation || (isKioskOperator ? 'Walk-in Patient' : 'Self'),
          arogyaId: selectedMember?.arogyaId || 'AR-2026-00001',
          abhaId: selectedMember?.abhaId || '14-2026-9812-4456'
        },
        createdBy: isKioskOperator ? 'kiosk_desk' : 'symptom_checklist',
        durationDays: 2,
        medicines: isCritical ? [] : [
          {
            name: 'Tab. Paracetamol 650mg',
            nameLocal: 'पॅरासिटामॉल ६५० मि.ग्रॅ.',
            category: 'Analgesic / Antipyretic',
            dosage: '1 Tablet',
            dosageLocal: '१ गोळी',
            instructions: 'Take after meals with water for 2 days',
            instructionsLocal: 'जेवणानंतर पाण्यासोबत घ्या (२ दिवस)',
            timing: 'Morning & Night',
            timingSchedule: { morning: true, afternoon: false, night: true }
          }
        ],
        homeRemedies: isCritical
          ? ['रुग्णाला त्वरित जवळच्या ग्रामीण/जिल्हा रुग्णालयात हलवा (१०८ ला कॉल करा).', 'शांत ठेवा, कोणतीही गोळी किंवा पाणी जबरदस्तीने देऊ नका.']
          : ['कोमट पाणी प्या आणि पुरेसा आराम करा.', 'हलका व ताजा घरगुती आहार घ्या.'],
        ayurvedicRemedies: isCritical
          ? []
          : ['तुळशी व सुंठ काढा (Tulsi & Dry Ginger Kadha) दिवसातून २ वेळा प्यावा.', 'रात्री झोपताना हळदीचे दूध (Golden Turmeric Milk).'],
        diagnosisSummary: `AI Triage: ${customSymptomText.slice(0, 60)}...`,
        riskLevel: risk,
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString()
      };

      try {
        const savedList = JSON.parse(localStorage.getItem('arogya_prescriptions') || '[]');
        savedList.unshift(fallbackRx);
        localStorage.setItem('arogya_prescriptions', JSON.stringify(savedList));
      } catch (e) {}

      setGeneratedPrescription(fallbackRx);
      setModalOpen(true);
      setCustomSymptomText('');
    } finally {
      setIsAnalyzingCustom(false);
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

        {/* Dynamic Family Member / Kiosk Walk-in Patient Selector */}
        {isKioskOperator ? (
          <div className="space-y-2 self-start md:self-auto bg-gradient-to-r from-medical-blue/15 to-health-green/15 p-4 rounded-2xl border border-medical-blue/30 shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-medical-blue">
                <Users className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'नोंदणीकृत रुग्ण (Registered Patient)' : 'Registered Patient'}</span>
              </div>
              <button
                onClick={() => {
                  if (onKioskModalClose) onKioskModalClose();
                  else if (onNavigateToHub) onNavigateToHub();
                }}
                className="text-[11px] font-bold text-medical-blue hover:underline flex items-center gap-0.5"
                title="Return to Registration Desk"
              >
                <span>{lang === 'mr' ? 'नवीन नोंदणी' : 'New Registration'}</span>
                <span>→</span>
              </button>
            </div>
            <div className="font-display font-extrabold text-base text-deep-navy dark:text-clinical-white">
              {selectedMember?.name || 'Walk-in Patient'}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
              {selectedMember?.age ? `${selectedMember.age} yrs` : 'Age N/A'} • {selectedMember?.gender || 'Other'} • Blood: <strong className="text-alert-red">{selectedMember?.bloodGroup || 'Unknown'}</strong>
            </div>
          </div>
        ) : (
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
        )}
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
          AR ID: {selectedMember?.arogyaId || selectedMember?.abhaId || 'AR-2026-00001'}
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
                    {item.name[lang] || item.name.en || item.name.mr}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {item.desc[lang] || item.desc.en || item.desc.mr}
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
                    {item.name[lang] || item.name.en || item.name.mr}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {item.desc[lang] || item.desc.en || item.desc.mr}
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
                    {item.name[lang] || item.name.en || item.name.mr}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {item.desc[lang] || item.desc.en || item.desc.mr}
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

      {/* SECTION 4: WRITE-IN CUSTOM SYMPTOM (Gemini AI Powered) */}
      <div className="glass-card p-6 rounded-3xl border border-medical-blue/30 shadow-xl space-y-4 text-left bg-medical-blue/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-medical-blue/15">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-medical-blue/15 text-medical-blue">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
                {t('triage_custom_heading')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('triage_custom_desc')}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-medical-blue/20 text-medical-blue border border-medical-blue/30 self-start sm:self-auto">
            AI Triage
          </span>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <textarea
              id="custom-symptom-input"
              rows={3}
              value={customSymptomText}
              onChange={(e) => {
                setCustomSymptomText(e.target.value);
                if (customError) setCustomError('');
              }}
              placeholder={t('triage_custom_placeholder')}
              className="w-full p-4 rounded-2xl bg-white/80 dark:bg-dark-base/80 border border-deep-navy/15 dark:border-white/15 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none text-xs sm:text-sm text-deep-navy dark:text-clinical-white placeholder:text-slate-400 resize-none transition-all"
            />
          </div>

          {customError && (
            <div className="text-xs text-alert-red font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{customError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {t('triage_custom_hint')}
            </p>
            <button
              id="analyze-custom-symptom-btn"
              onClick={handleAnalyzeCustomSymptom}
              disabled={isAnalyzingCustom || !customSymptomText.trim()}
              className="px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-medical-blue hover:bg-blue-600 text-white shadow-lg hover:shadow-medical-blue/30 transition-all flex items-center justify-center gap-2 self-end sm:self-auto shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzingCustom ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{t('triage_custom_analyzing')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('triage_custom_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
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
        onClose={() => {
          setModalOpen(false);
          if (isKioskOperator) {
            setSelectedSymptomIds([]);
            setCustomSymptomText('');
            if (onKioskModalClose) {
              onKioskModalClose();
            } else if (onNavigateToHub) {
              onNavigateToHub();
            }
          }
        }}
        prescription={generatedPrescription}
        selectedMember={selectedMember}
        nearestDoctors={nearestDoctors}
        onNavigateToHospital={onNavigateToHospital}
      />

    </div>
  );
}
