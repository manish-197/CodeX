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
import PrescriptionResultModal from './PrescriptionResultModal';

// Categorized Symptom Catalog (Level 1 to Level 3)
export const SYMPTOM_CATALOG = {
  level1: {
    level: 1,
    titleMr: 'Level 1: सौम्य व सामान्य आजार (Mild & Common)',
    titleEn: 'Level 1: Mild & Common Illnesses',
    badgeColor: 'bg-health-green/20 text-health-green border-health-green/30',
    items: [
      {
        id: 'cold_runny_nose',
        nameMr: 'सर्दी-पडसे (Common Cold / Runny Nose)',
        nameEn: 'Common Cold / Runny Nose',
        descMr: 'नाक वाहणे, सतत शिंका येणे, घसा कोरडा पडणे',
        category: 'श्वसन (Respiratory)',
        rxCategory: 'एंटी-हिस्टामाइन व सर्दी शामक (Mild Antihistamine)',
        rxInstructions: '१ गोळी रात्री झोपताना कोमट पाण्यासोबत [२ दिवस].',
        timing: { morning: false, afternoon: false, night: true },
        remedy: 'गरम पाण्याची वाफ (Steam inhalation) दिवसातून दोनदा घ्या.'
      },
      {
        id: 'mild_headache',
        nameMr: 'सौम्य डोकेदुखी (Mild Tension Headache)',
        nameEn: 'Mild Tension Headache',
        descMr: 'कपाळ किंवा डोके हलके दुखणे, थकवा, डोळ्यांवर ताण',
        category: 'सामान्य (General)',
        rxCategory: 'पॅरासिटामॉल सौम्य वेदनाशामक (Mild Paracetamol Analgesic)',
        rxInstructions: '१ गोळी जेवणानंतर, डोकेदुखी असल्यास [२ दिवस].',
        timing: { morning: true, afternoon: false, night: true },
        remedy: 'शांत अंधाऱ्या खोलीत ३० मिनिटे विश्रांती घ्या व भरपूर पाणी प्या.'
      },
      {
        id: 'acidity_heartburn',
        nameMr: 'ऍसिडिटी / छातीत जळजळ (Acidity / Heartburn)',
        nameEn: 'Acidity / Heartburn',
        descMr: 'छातीत व घशात जळजळ, आंबट ढेकर, मळमळ',
        category: 'पचनसंस्था (Digestive)',
        rxCategory: 'अँटासिड चघळण्याची गोळी (Antacid Chewable Category)',
        rxInstructions: '१ गोळी जेवणानंतर चघळून खावी [२ दिवस].',
        timing: { morning: true, afternoon: true, night: false },
        remedy: 'थंड दूध किंवा नारळ पाणी प्या आणि तिखट-मसालेदार अन्न टाळा.'
      },
      {
        id: 'fatigue_bodyache',
        nameMr: 'थकवा / अंगदुखी (Fatigue / Mild Body Ache)',
        nameEn: 'Fatigue / Mild Body Ache',
        descMr: 'कामाचा ताण किंवा शारीरिक थकव्यामुळे अंगदुखी',
        category: 'सामान्य (General)',
        rxCategory: 'ओआरएस इलेक्ट्रोलाइट रिहायड्रेशन (Oral Rehydration Category)',
        rxInstructions: 'स्वच्छ पाण्यात मिसळून दिवसभरात थोडे थोडे प्यावे [२ दिवस].',
        timing: { morning: true, afternoon: true, night: true },
        remedy: 'कोमट पाण्याने आंघोळ करा आणि रात्री पुरेशी ८ तासांची झोप घ्या.'
      },
      {
        id: 'mild_sore_throat',
        nameMr: 'घसा खवखवणे (Mild Sore Throat)',
        nameEn: 'Mild Sore Throat',
        descMr: 'गिळताना घशात टोचणे, कोरडी खाज',
        category: 'ईएनटी (ENT)',
        rxCategory: 'घसा आराम कफ ड्रॉप्स (Herbal Throat Soothing Lozenges)',
        rxInstructions: '१ गोळी दिवसातून २-३ वेळा चघळावी [२ दिवस].',
        timing: { morning: true, afternoon: true, night: true },
        remedy: 'कोमट पाण्यात थोडे मीठ आणि हळद घालून दिवसातून ३ वेळा गुळण्या करा.'
      }
    ]
  },

  level2: {
    level: 2,
    titleMr: 'Level 2: मध्यम आजार (Moderate Illnesses)',
    titleEn: 'Level 2: Moderate Illnesses',
    badgeColor: 'bg-caution-amber/25 text-deep-navy dark:text-caution-amber border-caution-amber/40',
    items: [
      {
        id: 'viral_fever_chills',
        nameMr: 'ताप (१०१°F पर्यंत) व हुडहुडी (Viral Fever with Chills)',
        nameEn: 'Viral Fever with Chills (up to 101°F)',
        descMr: 'अंगात तीव्र उष्णता, हुडहुडी, थंडी वाजून ताप येणे',
        category: 'संसर्गजन्य (Infectious)',
        rxCategory: 'पॅरासिटामॉल ज्वरनाशक वर्ग (Paracetamol Antipyretic Category)',
        rxInstructions: '१ गोळी जेवणानंतर, दिवसातून २ वेळा [२ दिवस].',
        timing: { morning: true, afternoon: false, night: true },
        remedy: 'कपाळावर आणि मानेवर कोमट ओल्या कापडाच्या घड्या ठेवा.'
      },
      {
        id: 'vomiting_diarrhea',
        nameMr: 'उलट्या / जुलाब (Vomiting / Loose Motions - Dehydration Risk)',
        nameEn: 'Vomiting / Loose Motions (Dehydration Risk)',
        descMr: 'दिवसातून ३ हून अधिक वेळा पातळ शौचास होणे किंवा उलट्या',
        category: 'पचनसंस्था (Digestive)',
        rxCategory: 'डब्ल्यूएचओ प्रमाणित ओआरएस द्रावण (WHO-Standard ORS Sachet)',
        rxInstructions: '१ लिटर स्वच्छ उकळून थंड केलेल्या पाण्यात १ पाकीट मिसळून सतत प्यावे [२ दिवस].',
        timing: { morning: true, afternoon: true, night: true },
        remedy: 'पातळ पेज, ताक, आणि नारळ पाणी वारंवार थोडे थोडे प्या.'
      },
      {
        id: 'persistent_cough',
        nameMr: 'तीव्र खोकला / कफ (Persistent Productive Cough)',
        nameEn: 'Persistent Productive Cough',
        descMr: 'छातीत कफ अडकणे, खोकताना छातीत जडपणा जाणवणे',
        category: 'श्वसन (Respiratory)',
        rxCategory: 'कफ निवारक सिरप गट (OTC Cough Expectorant Category)',
        rxInstructions: '२ चमचे कोमट पाण्यासोबत दिवसातून २ वेळा जेवणानंतर [२ दिवस].',
        timing: { morning: true, afternoon: false, night: true },
        remedy: 'आले-तुळशीचा रस मधासोबत दिवसातून दोनदा चाटण म्हणून घ्या.'
      },
      {
        id: 'severe_stomach_cramps',
        nameMr: 'पोटात मुरडा येऊन दुखणे (Severe Stomach Cramps)',
        nameEn: 'Severe Stomach Cramps',
        descMr: 'पोटात कळा येणे, गॅसमुळे पोट फुगणे किंवा मुरडा',
        category: 'पचनसंस्था (Digestive)',
        rxCategory: 'पोटदुखी शामक घटक (Mild Antispasmodic Supportive Care)',
        rxInstructions: 'गरज भासल्यास जेवणानंतर १ गोळी फार्मासिस्टच्या सल्ल्याने [२ दिवस].',
        timing: { morning: true, afternoon: false, night: true },
        remedy: 'पोटावर गरम पाण्याची पिशवी ठेवून शेका आणि गरम पाणी प्या.'
      },
      {
        id: 'skin_allergy_rash',
        nameMr: 'अंगावर पुरळ किंवा खाज (Skin Allergy / Urticaria)',
        nameEn: 'Skin Allergy / Urticaria',
        descMr: 'अंगावर लाल चट्टे उठणे, खाज येणे, कीटक चावल्यासारखी सूज',
        category: 'त्वचा (Dermatology)',
        rxCategory: 'अँटी-ऍलर्जिक घटक (OTC Antiallergic Category)',
        rxInstructions: '१ गोळी रात्री झोपताना जेवणानंतर [२ दिवस].',
        timing: { morning: false, afternoon: false, night: true },
        remedy: 'खाजणाऱ्या जागी कोरफड जेल किंवा खोबरेल तेल हलक्या हाताने लावा.'
      }
    ]
  },

  level3: {
    level: 3,
    titleMr: 'Level 3: अतिगंभीर / आणीबाणीचे आजार (Extreme / Critical Emergency)',
    titleEn: 'Level 3: Extreme / Critical Emergency',
    badgeColor: 'bg-alert-red text-white border-alert-red animate-pulse',
    items: [
      {
        id: 'chest_pain_radiating',
        nameMr: 'तीव्र छातीत कळ व डाव्या हातात दुखणे (Acute Severe Chest Pain)',
        nameEn: 'Acute Severe Chest Pain radiating to Left Arm',
        descMr: 'छातीवर वजन, प्रचंड घाम येणे, हृदयविकाराचा झटका संशय (Heart Attack Suspicion)',
        category: 'हृदयरोग (Cardiology)',
        critical: true,
        specialty: 'Cardiologist (हृदयरोग तज्ज्ञ)'
      },
      {
        id: 'shortness_of_breath',
        nameMr: 'तीव्र श्वास घेण्यास अडचण (Severe Shortness of Breath / Gasping)',
        nameEn: 'Severe Shortness of Breath / Gasping',
        descMr: 'श्वास कोंडणे, बोलताना दम लागणे, ओठ किंवा नखे निळी पडणे',
        category: 'श्वसन अतिदक्षता (Pulmonology)',
        critical: true,
        specialty: 'Pulmonologist / Critical Care (श्वसनरोग व अतिदक्षता)'
      },
      {
        id: 'stroke_slurred_speech',
        nameMr: 'अचानक अर्धांगवायू / बोलणे अडखळणे (Sudden Stroke Signs)',
        nameEn: 'Sudden Face Droop / Slurred Speech / Stroke',
        descMr: 'तोंड एका बाजूला वाकडे होणे, हात किंवा पाय लुळा पडणे (Paralysis)',
        category: 'मेंदूरोग (Neurology)',
        critical: true,
        specialty: 'Neurologist / Civil Hospital (मेंदूरोग व पक्षाघात विभाग)'
      },
      {
        id: 'syncope_unconscious',
        nameMr: 'चक्कर येऊन बेशुद्ध पडणे (Syncope / Unconsciousness)',
        nameEn: 'Syncope / Sudden Unconsciousness',
        descMr: 'अचानक अंधारी येऊन कोसळणे, हाक मारल्यास प्रतिसाद न देणे',
        category: 'आपत्कालीन (Emergency Medicine)',
        critical: true,
        specialty: 'Emergency Medicine (आपत्कालीन विभाग)'
      },
      {
        id: 'heavy_trauma_bleeding',
        nameMr: 'तीव्र अपघाती रक्तस्त्राव किंवा खोल जखम (Heavy Trauma Bleeding)',
        nameEn: 'Heavy Trauma / Uncontrolled Bleeding',
        descMr: 'शेतकाम किंवा रस्त्यावरील अपघातातून न थांबणारा रक्तस्त्राव',
        category: 'ट्रॉमा व शस्त्रक्रिया (Trauma Surgery)',
        critical: true,
        specialty: 'Trauma & Orthopedic Surgeon (ट्रॉमा व शस्त्रक्रिया विभाग)'
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

  // Selected Symptoms State (Set of IDs)
  const [selectedSymptomIds, setSelectedSymptomIds] = useState([]);
  const [isGeneratingRx, setIsGeneratingRx] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);
  const [nearestDoctors, setNearestDoctors] = useState([]);

  // Fetch or mock nearest doctors based on location
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/hospitals/nearest?limit=4');
        if (res.ok) {
          const data = await res.json();
          if (data.hospitals && data.hospitals.length > 0) {
            const mapped = data.hospitals.map((h, i) => ({
              id: h.id || `doc_${i}`,
              doctorName: i === 0 ? 'डॉ. सुहास जोशी (M.D. Cardiology)' : i === 1 ? 'डॉ. अनिता देशमुख (M.D. Pulmonology)' : i === 2 ? 'डॉ. राहुल पाटील (M.S. Trauma)' : 'डॉ. सचिन पवार (Medical Officer)',
              specialty: h.specialties?.[0] || 'Emergency Physician',
              hospitalName: h.name,
              phone: h.phone || '108 / 020-25880872',
              distanceKm: h.distanceKm || 7.2,
              location: h.location
            }));
            setNearestDoctors(mapped);
            return;
          }
        }
      } catch (e) {}

      // Default curated doctors fallback
      setNearestDoctors([
        {
          id: 'doc_1',
          doctorName: 'डॉ. सुहास जोशी (M.D. Cardiology)',
          specialty: 'Cardiologist & Emergency Care',
          hospitalName: 'District Civil Hospital Aundh',
          phone: '020-25880872 / 108',
          distanceKm: 7.2
        },
        {
          id: 'doc_2',
          doctorName: 'डॉ. अनिता देशमुख (M.D. Chest & Critical)',
          specialty: 'Pulmonology & ICU In-charge',
          hospitalName: 'Sub-District Hospital Shirur',
          phone: '02138-222108',
          distanceKm: 14.2
        },
        {
          id: 'doc_3',
          doctorName: 'डॉ. राहुल पाटील (M.S. General & Trauma)',
          specialty: 'Trauma & Emergency Surgeon',
          hospitalName: 'CHC Junnar Critical Unit',
          phone: '02132-222045',
          distanceKm: 18.5
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
      alert('कृपया किमान एक लक्षण निवडा.');
      return;
    }

    setIsGeneratingRx(true);

    try {
      const activeMemberId = selectedMember?.id || currentUser?.id || 'self_1';
      const patientName = selectedMember?.name || currentUser?.name || 'Self (Primary Citizen)';
      const patientAge = selectedMember?.age || 42;
      const patientBlood = selectedMember?.bloodGroup || 'B+';
      const patientAbha = selectedMember?.abhaId || '14-2026-9812-4456';

      // Build 2-day OTC medicines list (Strictly empty if CRITICAL)
      const medicinesList = hasLevel3 
        ? [] 
        : selectedItems.map(item => ({
            name: item.rxCategory || 'General OTC Relief',
            category: item.category || 'General Formulation',
            dosage: '१ गोळी',
            instructions: item.rxInstructions || 'जेवणानंतर कोमट पाण्यासोबत [२ दिवस].',
            timing: item.timing?.morning && item.timing?.night ? 'सकाळी व रात्री (२ वेळा)' : item.timing?.night ? 'रात्री (१ वेळा)' : 'सकाळी (१ वेळा)',
            timingSchedule: item.timing || { morning: true, afternoon: false, night: true }
          }));

      // Build Safe Home Remedies
      const remediesList = hasLevel3
        ? [
            'रुग्णाला हवेशीर जागी शांत बसवा किंवा आधार देऊन झोपवा.',
            'मानेवरील आणि छातीवरील घट्ट कपडे सैल करा.',
            'तातडीने १०८ रुग्णवाहिकेला कॉल करा आणि रुग्णाला त्वरित हलवा.'
          ]
        : Array.from(new Set(selectedItems.map(item => item.remedy).filter(Boolean)));

      const summaryText = hasLevel3
        ? `अतिगंभीर आजार संशय: ${selectedItems.map(i => i.nameMr).join(', ')}`
        : `२ दिवसांचे तात्पुरते प्राथमिक निदान: ${selectedItems.map(i => i.nameMr).join(', ')}`;

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
          medicines: medicinesList,
          homeRemedies: remediesList,
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
        const localKey = `arogya_rx_${activeMemberId}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([savedRecord, ...existing]));
      } catch (e) {}

      setGeneratedPrescription(savedRecord);
      setModalOpen(true);

    } catch (err) {
      console.warn('[Checklist Prescription Save Fallback]', err.message);

      const activeMemberId = selectedMember?.id || 'self_1';
      const localPresc = {
        _id: 'presc_' + Date.now(),
        id: 'presc_' + Date.now(),
        familyMemberId: activeMemberId,
        patientDetails: {
          name: selectedMember?.name || 'Self',
          age: selectedMember?.age || 42,
          bloodGroup: selectedMember?.bloodGroup || 'B+',
          abhaId: selectedMember?.abhaId || '14-2026-9812-4456'
        },
        createdBy: 'symptom_checklist',
        medicines: hasLevel3 ? [] : selectedItems.map(item => ({
          name: item.rxCategory || 'General OTC Relief',
          category: item.category || 'General',
          dosage: '१ गोळी',
          instructions: item.rxInstructions || 'जेवणानंतर [२ दिवस].',
          timing: 'सकाळी व रात्री',
          timingSchedule: item.timing || { morning: true, afternoon: false, night: true }
        })),
        homeRemedies: hasLevel3
          ? ['रुग्णाला हवेशीर जागी बसवा.', '१०८ वर कॉल करा.']
          : selectedItems.map(item => item.remedy),
        diagnosisSummary: `प्राथमिक मूल्यांकन (${selectedItems.length} लक्षणे)`,
        riskLevel: currentRisk,
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString()
      };

      try {
        const localKey = `arogya_rx_${activeMemberId}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([localPresc, ...existing]));
      } catch (e) {}

      setGeneratedPrescription(localPresc);
      setModalOpen(true);

    } finally {
      setIsGeneratingRx(false);
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-card text-xs font-bold text-medical-blue uppercase tracking-wider">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Symptom Checklist Triage & 2-Day Rx</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-deep-navy dark:text-clinical-white">
          आरोग्य लक्षणे व औषध तपासणी
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          खालील सामान्य ते अतिगंभीर लक्षणांमधून तुमच्या त्रासाचे चेकपॉईंट्स निवडा. तात्काळ २ दिवसांचे औषधोपचार, सुरक्षित घरगुती उपाय आणि आणीबाणीत थेट डॉक्टर मार्ग मिळवा.
        </p>
      </div>

      {/* Dynamic Family Profile Switcher Banner */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-deep-navy/10 dark:border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-medical-blue text-white flex items-center justify-center font-bold text-sm shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-medical-blue">
              सक्रिय रुग्ण (Active Patient Profile):
            </span>
            <div className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
              {selectedMember?.name} ({selectedMember?.relation || 'Self'} • {selectedMember?.age || 42} वर्षे • {selectedMember?.bloodGroup || 'B+'})
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              ABHA ID: {selectedMember?.abhaId || '14-2026-9812-4456'}
            </span>
          </div>
        </div>

        {/* Member Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" data-lenis-prevent="true">
          {allMembers.map((member) => {
            const isSelected = selectedMember?.id === member.id;
            return (
              <button
                key={member.id}
                type="button"
                id={`patient-pill-${member.id}`}
                onClick={() => handleSelectPatient(member)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'btn-navy text-white shadow-md'
                    : 'glass-card text-deep-navy dark:text-clinical-white hover:border-medical-blue/40 border-deep-navy/10'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-medical-blue text-white' : 'bg-deep-navy/10 text-deep-navy dark:bg-white/10 dark:text-clinical-white'
                }`}>
                  {member.name.charAt(0)}
                </span>
                <span>{member.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Symptom Levels */}
      <div className="space-y-6">

        {/* LEVEL 1: सौम्य / सामान्य आजार */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-health-green/30 space-y-4 shadow-lg text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-health-green" />
              <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
                {SYMPTOM_CATALOG.level1.titleMr}
              </h3>
            </div>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-health-green/15 text-health-green self-start sm:self-auto">
              सौम्य धोका • घरगुती व २-दिवसीय ओटीसी आराम
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
                      ? 'bg-health-green/15 border-health-green shadow-md scale-[1.01]'
                      : 'bg-white/60 dark:bg-dark-base/60 border-deep-navy/10 dark:border-white/10 hover:border-health-green/40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-health-green">
                    {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-xs sm:text-sm text-deep-navy dark:text-clinical-white leading-tight">
                      {item.nameMr}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {item.descMr}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEVEL 2: मध्यम आजार */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-caution-amber/40 space-y-4 shadow-lg text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-caution-amber" />
              <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
                {SYMPTOM_CATALOG.level2.titleMr}
              </h3>
            </div>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-caution-amber/25 text-deep-navy dark:text-caution-amber self-start sm:self-auto">
              मध्यम धोका • २-दिवसांचे तात्पुरते औषध व आशा सल्ला
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
                      ? 'bg-caution-amber/20 border-caution-amber shadow-md scale-[1.01]'
                      : 'bg-white/60 dark:bg-dark-base/60 border-deep-navy/10 dark:border-white/10 hover:border-caution-amber/40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-caution-amber">
                    {checked ? <CheckSquare className="w-5 h-5 text-amber-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-xs sm:text-sm text-deep-navy dark:text-clinical-white leading-tight">
                      {item.nameMr}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {item.descMr}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEVEL 3: अतिगंभीर / आणीबाणीचे आजार */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border-2 border-alert-red/50 bg-alert-red/5 space-y-4 shadow-xl text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-alert-red/20">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-alert-red animate-ping" />
              <h3 className="font-display font-bold text-lg text-alert-red flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <span>{SYMPTOM_CATALOG.level3.titleMr}</span>
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-alert-red text-white animate-pulse self-start sm:self-auto">
              अतिगंभीर आणीबाणी • थेट रुग्णालय नेव्हिगेशन
            </span>
          </div>

          <p className="text-xs text-alert-red font-medium">
            ⚠️ यापैकी कोणतेही लक्षण असल्यास औषध न घेता तात्काळ डॉक्टर किंवा १०८ रुग्णवाहिका बोलवा.
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
                      {item.nameMr}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {item.descMr}
                    </div>
                    <div className="text-[10px] font-bold text-medical-blue mt-1">
                      तज्ज्ञ: {item.specialty}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Floating Sticky Action Bar */}
      <div className="sticky bottom-6 z-30 p-4 sm:p-5 rounded-3xl glass-card border border-white/80 dark:border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-2xl bg-medical-blue/15 text-medical-blue">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-deep-navy dark:text-clinical-white">
              निवडलेली लक्षणे: <span className="text-medical-blue">{selectedItems.length} लक्षणे</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              गांभीर्य स्तर: {' '}
              {hasLevel3 ? (
                <span className="font-extrabold text-alert-red animate-pulse">अतिगंभीर (CRITICAL EMERGENCY)</span>
              ) : hasLevel2 ? (
                <span className="font-bold text-caution-amber">मध्यम (MODERATE)</span>
              ) : selectedItems.length > 0 ? (
                <span className="font-bold text-health-green">सौम्य / सामान्य (LOW)</span>
              ) : (
                <span>लक्षणे निवडा</span>
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
              <span>रीसेट</span>
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
            <span>{isGeneratingRx ? 'प्रिस्क्रिप्शन तयार होत आहे...' : 'तपासा व प्रिस्क्रिप्शन मिळवा (Apply)'}</span>
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
