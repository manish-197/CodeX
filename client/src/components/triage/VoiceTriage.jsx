import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  RotateCcw,
  Sparkles,
  Navigation,
  ShieldAlert,
  Clock,
  HeartPulse,
  Info,
  Radio,
  Pill,
  FileText,
  Download,
  Globe,
  Users
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getSpeechLangCode } from '../../i18n/translations';

function detectSimpleScriptLang(text) {
  if (!text) return 'en';
  if (/[\u0900-\u097F]/.test(text)) {
    if (/[\u0933]|आहे|नाही|दुखत|डोके|ताप|मळमळ|पोटात|औषध|करा|माझे|माझ्या|त्रास|कपाळ|उलट्या|थंडी|लागणे/.test(text)) {
      return 'mr';
    }
    return 'hi';
  }
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  return 'en';
}

function buildComprehensiveSpokenText(data) {
  if (!data) return '';
  const lang = data.detectedLanguage || 'en';
  const parts = [];

  // 1. Diagnosis
  if (data.likelyDiagnosis) {
    const diagIntro = lang === 'mr' ? 'प्राथमिक मूल्यांकन:' : lang === 'hi' ? 'प्राथमिक आकलन:' : 'Clinical Assessment:';
    parts.push(`${diagIntro} ${data.likelyDiagnosis}`);
  } else if (data.clinicalExplanation) {
    parts.push(data.clinicalExplanation);
  }

  // 2. Safe Home Remedies
  if (Array.isArray(data.homeRemedies) && data.homeRemedies.length > 0) {
    const remIntro = lang === 'mr' ? 'घरगुती सुरक्षित उपाय:' : lang === 'hi' ? 'सुरक्षित घरेलू उपाय:' : 'Recommended home care:';
    const remediesSummary = data.homeRemedies.slice(0, 2).join('. ');
    parts.push(`${remIntro} ${remediesSummary}`);
  }

  // 3. Medicine suggestions (or emergency alert for critical)
  if (data.riskLevel === 'CRITICAL') {
    const critAlert = lang === 'mr' 
      ? 'ही आणीबाणीची परिस्थिती असू शकते. स्वतः कोणतेही औषध घेऊ नका. त्वरित १०८ रुग्णवाहिका किंवा डॉक्टरांशी संपर्क साधा.'
      : lang === 'hi'
      ? 'यह आपातकालीन स्थिति हो सकती है। कोई भी दवा खुद न लें। तुरंत १०८ एम्बुलेंस या डॉक्टर से संपर्क करें।'
      : 'Critical risk condition detected. Do not take self-medication. Call 108 or seek emergency medical care immediately.';
    parts.push(critAlert);
  } else if (Array.isArray(data.suggestedMedicines) && data.suggestedMedicines.length > 0) {
    const medIntro = lang === 'mr' 
      ? 'फार्मासिस्टशी चर्चा करण्यासाठी ओटीसी औषध गट:' 
      : lang === 'hi' 
      ? 'फार्मासिस्ट से परामर्श हेतु दवा वर्ग:' 
      : 'Over-the-counter medicine categories to discuss with your pharmacist:';
    const medList = data.suggestedMedicines.slice(0, 2).map(m => m.name).join(', ');
    parts.push(`${medIntro} ${medList}`);
  }

  // 4. Mandatory Disclaimer
  if (data.disclaimer) {
    parts.push(data.disclaimer);
  } else {
    const defaultDisc = lang === 'mr'
      ? 'हा कृत्रिम बुद्धिमत्ता सहाय्यित प्राथमिक सल्ला आहे, हे अंतिम निदान नाही. डॉक्टरांचा सल्ला घ्या.'
      : lang === 'hi'
      ? 'यह एआई आधारित प्राथमिक सलाह है, अंतिम चिकित्सा निदान नहीं। डॉक्टर से परामर्श लें।'
      : 'This is an AI-assisted preliminary triage, not a medical diagnosis. Please consult a doctor or pharmacist.';
    parts.push(defaultDisc);
  }

  return parts.join('. ');
}

export default function VoiceTriage({ onNavigateToHospital, onNavigateToHub, activeVitals, currentUser, activeMember, onSelectMember }) {
  const { lang, t } = useLanguage();

  // Family Member Context: synchronized with Family Hub Dynamic Profile Switcher
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
    return allMembers[0] || {
      id: currentUser?.id || 'self_1',
      name: currentUser?.name || 'Self (Primary Citizen)',
      relation: 'Self',
      age: 42,
      bloodGroup: 'B+',
      abhaId: currentUser?.abhaId || '14-2026-9812-4456',
    };
  });

  useEffect(() => {
    if (activeMember) {
      setSelectedMember(activeMember);
    }
  }, [activeMember]);

  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem('arogya_family_members');
      if (savedMembers) {
        const parsed = JSON.parse(savedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) setAllMembers(parsed);
      }
      const savedActive = localStorage.getItem('arogya_active_member');
      if (savedActive && !activeMember) {
        setSelectedMember(JSON.parse(savedActive));
      }
    } catch (e) {}
  }, []);

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

  // Spoken Language Mode: 'auto' | 'mr' | 'hi' | 'en' | 'ta' (Independent from UI language)
  const [spokenLangMode, setSpokenLangMode] = useState('auto');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  // Pipeline status: 'idle' | 'listening' | 'speech-detected' | 'silence-counting' | 'processing-symptoms' | 'getting-ai-response' | 'complete' | 'error'
  const [pipelineStage, setPipelineStage] = useState('idle');
  const [pipelineErrorMessage, setPipelineErrorMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [savedPrescription, setSavedPrescription] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const latestTranscriptRef = useRef('');
  const handleSendToAIRef = useRef(null);
  const retryCountRef = useRef(0);
  const textareaRef = useRef(null);

  // Mic recognition language is independent of static UI language
  const activeRecognitionLang = spokenLangMode === 'auto'
    ? (navigator.language || 'en-IN')
    : getSpeechLangCode(spokenLangMode);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Voice AI Stage 1: Mic Capture] Web Speech API not supported in this browser environment.');
      setSpeechSupported(false);
      return;
    }

    // Clean up previous instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = activeRecognitionLang;

    recognition.onstart = () => {
      console.log('[Voice AI Stage 1: Mic Capture] Speech recognition started. Listening on language:', activeRecognitionLang, 'Mode:', spokenLangMode);
      setPipelineStage('listening');
      setPipelineErrorMessage('');
      retryCountRef.current = 0;
    };

    recognition.onresult = (event) => {
      console.log('[Voice AI Stage 1: Mic Capture] onresult fired with results length:', event.results.length);
      let interim = '';
      let currentFinal = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const combinedText = (currentFinal + interim).trim();
      console.log('[Voice AI Stage 2: Transcript Accumulation] Spoken text accumulated:', combinedText);
      latestTranscriptRef.current = combinedText;
      setTranscript(combinedText);

      // Only begin the 1.3s silence countdown AFTER actual speech is detected
      if (combinedText.length >= 2) {
        setPipelineStage('speech-detected');

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // 1.3s silence timer per clinical triage specification
        silenceTimerRef.current = setTimeout(() => {
          console.log('[Voice AI Stage 3: Silence Timer Triggered] 1.3s silence completed after voice input. Text to send:', latestTranscriptRef.current);
          if (isListeningRef.current && latestTranscriptRef.current.trim().length >= 3) {
            setPipelineStage('silence-counting');
            if (handleSendToAIRef.current) {
              handleSendToAIRef.current(latestTranscriptRef.current);
            }
          }
        }, 1300);
      }
    };

    recognition.onerror = (err) => {
      console.warn('[Voice AI Stage 1: Mic Capture Notice]', err.error);

      // Log full diagnostic error object to console to confirm underlying cause (sandbox vs connectivity vs permissions)
      console.error('[Voice AI SpeechRecognition Error Details]', {
        error: err.error,
        message: err.message,
        event: err,
        online: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
        secureContext: typeof window !== 'undefined' ? window.isSecureContext : 'unknown',
        origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
        inIframe: typeof window !== 'undefined' ? (window.self !== window.top) : false,
        retryCount: retryCountRef.current
      });

      // In Chrome/Edge, 'no-speech' is expected during conversational pauses or before user speaks.
      if (err.error === 'no-speech') {
        if (isListeningRef.current) {
          setPipelineStage('listening');
        }
        return;
      }

      // Handle 'network' error with automatic 1-time retry before falling back
      if (err.error === 'network') {
        if (retryCountRef.current < 1) {
          retryCountRef.current += 1;
          console.log('[Voice AI Stage 1] SpeechRecognition network error encountered. Attempting 1-time automatic restart in ~1s...');
          setPipelineStage('listening');
          setPipelineErrorMessage('Voice service reconnecting...');
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try { recognitionRef.current.abort(); } catch (e) {}
              try {
                recognitionRef.current.lang = activeRecognitionLang;
                recognitionRef.current.start();
                console.log('[Voice AI Stage 1] Automatic retry session started.');
              } catch (retryErr) {
                console.warn('[Voice AI Stage 1] Retry restart exception:', retryErr.message);
              }
            }
          }, 1000);
          return;
        }

        // Persistent network error after retry: clearly advise user and auto-focus text input
        console.warn('[Voice AI Stage 1] Network error persisted after retry. Falling back to text input.');
        isListeningRef.current = false;
        setIsListening(false);
        setPipelineStage('error');
        setPipelineErrorMessage('Voice service unavailable right now — check your connection, or type your symptoms below.');
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        return;
      }

      console.error('[Voice AI Stage 1 Error] Recognition failed:', err.error);
      if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
        setPipelineStage('error');
        setPipelineErrorMessage('Microphone permission blocked or unavailable. Please click "Allow" in browser settings.');
      } else if (err.error === 'audio-capture') {
        isListeningRef.current = false;
        setIsListening(false);
        setPipelineStage('error');
        setPipelineErrorMessage('No microphone detected. Please connect an audio input device.');
      } else {
        setPipelineErrorMessage(`Voice recognition notice: ${err.error}. You can also type symptoms directly.`);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };

    recognition.onend = () => {
      console.log('[Voice AI Stage 1: Mic Capture] recognition session ended. Still listening?:', isListeningRef.current);
      // If user still intends to listen and didn't manually stop, auto-restart
      if (isListeningRef.current) {
        try {
          recognition.start();
          setPipelineStage('listening');
        } catch (e) {
          // If already active or transitioning, ignore
        }
      } else {
        setIsListening(false);
        if (pipelineStage === 'listening') {
          setPipelineStage('idle');
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeRecognitionLang, spokenLangMode]);

  const toggleListening = () => {
    if (!speechSupported) {
      setPipelineErrorMessage('Speech recognition is not supported in this browser. Please type symptoms into the box.');
      return;
    }

    if (!recognitionRef.current) return;

    if (isListening) {
      // User manually stopped
      console.log('[Voice AI] User manually paused microphone listening.');
      isListeningRef.current = false;
      setIsListening(false);
      setPipelineStage('idle');
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      // User explicitly started listening
      console.log('[Voice AI] User started microphone listening.');
      setTranscript('');
      latestTranscriptRef.current = '';
      setPipelineErrorMessage('');
      retryCountRef.current = 0;
      isListeningRef.current = true;
      setIsListening(true);
      setPipelineStage('listening');

      try {
        recognitionRef.current.lang = activeRecognitionLang;
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start exception, retrying:', e.message);
        try {
          recognitionRef.current.abort();
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (err) {}
      }
    }
  };

  const handleSendToAI = async (textToSend) => {
    const symptoms = (textToSend !== undefined ? textToSend : (transcript || latestTranscriptRef.current)).trim();
    if (!symptoms) {
      console.warn('[Voice AI Stage 3: Notice] Cannot submit empty symptoms.');
      return;
    }

    // Gracefully stop recognition and reset timers
    isListeningRef.current = false;
    setIsListening(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setIsAnalyzing(true);
    setPipelineStage('processing-symptoms');
    setPipelineErrorMessage('');
    setTriageResult(null);

    try {
      setPipelineStage('getting-ai-response');
      console.log('[Voice AI Stage 4: Backend Endpoint Call] Sending symptoms to /api/triage:', {
        symptoms,
        spokenLangMode,
        vitals: activeVitals
      });

      const res = await fetch('http://localhost:5000/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          language: spokenLangMode === 'auto' ? 'auto' : spokenLangMode,
          vitals: activeVitals,
        }),
      });

      if (!res.ok) {
        throw new Error(`Triage endpoint returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('[Voice AI Stage 6: Response Rendering] Triage response received successfully:', data);
      
      setTriageResult(data);
      setPipelineStage('complete');

      // Auto-play spoken audio explainer in the detected response language covering diagnosis, remedies, medicines, disclaimer
      const spokenSummary = buildComprehensiveSpokenText(data);
      speakResponse(spokenSummary, data.detectedLanguage);

      // Smooth scroll into view
      setTimeout(() => {
        const resultElem = document.getElementById('triage-result-container');
        if (resultElem) {
          resultElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);

    } catch (err) {
      console.error('[Voice AI Stage 4/5 Error] Endpoint call failed:', err.message);
      setPipelineErrorMessage(`Backend communication note: ${err.message}. Using offline clinical triage safety guard.`);
      
      // Clinical Emergency Rules Engine Fallback with Auto-Detected Spoken Language
      const fallbackLang = detectSimpleScriptLang(symptoms);
      const isMr = fallbackLang === 'mr';
      const isHi = fallbackLang === 'hi';
      const isCritical = (symptoms.toLowerCase().includes('chest') || symptoms.includes('छातीत') || symptoms.includes('सीने'));

      const mockDiagnosis = {
        riskLevel: isCritical ? 'CRITICAL' : 'MODERATE',
        detectedLanguage: fallbackLang,
        detectedLanguageName: isMr ? 'Marathi' : isHi ? 'Hindi' : 'English',
        likelyDiagnosis: isMr ? 'मोसमी विषाणू ताप / प्राथमिक तपासणी' : isHi ? 'मौसमी वायरल बुखार / प्राथमिक जांच' : 'Clinical Triage Evaluation',
        clinicalExplanation: isMr 
          ? 'आपली लक्षणे नोंदवली गेली आहेत. भरपूर पाणी प्या आणि आराम करा.'
          : isHi
          ? 'आपके लक्षण दर्ज कर लिए गए हैं। पर्याप्त पानी पिएं और विश्राम करें।'
          : 'Your symptoms have been evaluated. Maintain hydration and monitor vitals closely.',
        homeRemedies: [
          isMr ? 'ओआरएस (ORS) किंवा कोमट पाणी प्या.' : isHi ? 'ओआरएस या गुनगुना पानी पिएं।' : 'Drink warm water and oral rehydration salts.',
          isMr ? 'कपाळावर कोमट पाण्याच्या पट्ट्या ठेवा.' : isHi ? 'माथे पर ठंडी/गुनगुनी पट्टी रखें।' : 'Cold/lukewarm damp cloth on forehead if feverish.'
        ],
        suggestedMedicines: isCritical
          ? []
          : [
              {
                name: isMr ? 'पॅरासिटामॉल सौम्य वेदनाशामक गट' : isHi ? 'पैरासिटामोल हल्का दर्द निवारक वर्ग' : 'Paracetamol-based Mild Pain Reliever Category',
                category: isMr ? 'ताप व वेदना शामक' : isHi ? 'बुखार व दर्द निवारक' : 'Antipyretic / Analgesic Category',
                instructions: isMr ? 'औषध घेण्यापूर्वी स्थानिक फार्मासिस्ट किंवा आशा सेविकेशी चर्चा करा.' : isHi ? 'दवा लेने से पहले फार्मासिस्ट या आशा कार्यकर्ता से सलाह लें।' : 'Consult local pharmacist or health worker before taking any medication.',
                timing: isMr ? 'जेवणानंतर, आवश्यकतेनुसार' : isHi ? 'भोजन के बाद, आवश्यकतानुसार' : 'Post-meals as advised by pharmacist'
              },
              {
                name: isMr ? 'ओआरएस (ORS) द्रावण गट' : isHi ? 'ओआरएस (ORS) घोल वर्ग' : 'Oral Rehydration Salts (ORS) Category',
                category: isMr ? 'इलेक्ट्रोलाइट संतुलन' : isHi ? 'इलेक्ट्रोलाइट संतुलन' : 'Electrolyte Replenisher Category',
                instructions: isMr ? 'शरीरातील पाणी टिकवण्यासाठी स्वच्छ पाण्यात मिसळून प्यावे.' : isHi ? 'शरीर में पानी की कमी रोकने के लिए पिएं।' : 'Drink with clean water to maintain hydration.',
                timing: isMr ? 'दिवसभरात थोडे थोडे' : isHi ? 'दिनभर आवश्यकतानुसार' : 'Throughout the day'
              }
            ],
        warningSigns: [
          isMr ? 'श्वास घेण्यास त्रास झाल्यास किंवा तीव्र छातीत दुखल्यास' : isHi ? 'सांस लेने में दिक्कत या सीने में तेज दर्द होने पर' : 'Difficulty breathing, severe chest tightness, or prolonged high fever',
        ],
        recommendedSpecialty: isMr ? 'प्राथमिक आरोग्य केंद्र (PHC)' : isHi ? 'प्राथमिक स्वास्थ्य केंद्र (PHC)' : 'Primary Health Centre (PHC)',
        audioResponseText: isMr
          ? 'आपली लक्षणे नोंदवली गेली आहेत. कृपया भरपूर विश्रांती घ्या आणि जवळच्या आरोग्य केंद्राला भेट द्या.'
          : isHi
          ? 'आपके लक्षण दर्ज कर लिए गए हैं। कृपया पर्याप्त विश्राम करें और स्वास्थ्य केंद्र जाएं।'
          : 'Triage assessment complete. Rest well and visit your local health centre if symptoms worsen.',
        disclaimer: isMr
          ? 'हा कृत्रिम बुद्धिमत्ता (AI) सहाय्यित प्राथमिक सल्ला आहे, हे अंतिम वैद्यकीय निदान नाही. आणीबाणीत १०८ वर संपर्क साधा.'
          : 'This is an AI-assisted preliminary triage, not a medical diagnosis. For any emergency or worsening symptoms, contact a doctor or call 108 immediately.'
      };
      setTriageResult(mockDiagnosis);
      setPipelineStage('complete');
      const spokenSummary = buildComprehensiveSpokenText(mockDiagnosis);
      speakResponse(spokenSummary, fallbackLang);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Keep ref up to date on every render so timeouts never call stale function
  handleSendToAIRef.current = handleSendToAI;

  const speakResponse = (text, responseLang) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    // Dynamically match detected response language, NEVER static UI language!
    const targetLangCode = getSpeechLangCode(responseLang || triageResult?.detectedLanguage || detectSimpleScriptLang(text));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLangCode;
    utterance.rate = 0.95; // Slightly slower for clarity in rural dialects

    // Dynamically look up speech synthesis voices matching the target language
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => v.lang === targetLangCode || v.lang.startsWith(targetLangCode.slice(0, 2)));
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const handleGetVerifiedPrescription = async () => {
    if (!triageResult) return;
    setIsSavingPrescription(true);

    try {
      const activeFamilyMemberId = selectedMember?.id || currentUser?.activeFamilyMemberId || currentUser?.id || 'self_1';
      const patientName = selectedMember?.name || currentUser?.name || 'Self (Primary Citizen)';
      const patientAge = selectedMember?.age || currentUser?.age || 42;
      const patientBlood = selectedMember?.bloodGroup || currentUser?.bloodGroup || 'B+';
      const patientAbha = selectedMember?.abhaId || currentUser?.abhaId || '14-2026-9812-4456';

      const res = await fetch('http://localhost:5000/api/prescriptions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyMemberId: activeFamilyMemberId,
          userId: currentUser?.id,
          patientDetails: {
            name: patientName,
            age: patientAge,
            bloodGroup: patientBlood,
            abhaId: patientAbha,
          },
          createdBy: 'ai_triage',
          medicines: triageResult.suggestedMedicines || [],
          diagnosisSummary: triageResult.likelyDiagnosis,
          riskLevel: triageResult.riskLevel,
          verificationStatus: 'unverified'
        }),
      });

      if (!res.ok) throw new Error('Failed to save prescription to server');
      const data = await res.json();
      const savedDoc = data.prescription || data;
      setSavedPrescription(savedDoc);

      // Local storage cache under specific family member
      try {
        const localKey = `arogya_rx_${activeFamilyMemberId}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([savedDoc, ...existing]));
      } catch (e) {}

    } catch (err) {
      console.warn('[Prescription Save]', err.message);
      // Fallback local representation
      const activeFamilyMemberId = selectedMember?.id || currentUser?.activeFamilyMemberId || currentUser?.id || 'self_1';
      const localPrescription = {
        _id: 'presc_' + Date.now(),
        id: 'presc_' + Date.now(),
        familyMemberId: activeFamilyMemberId,
        patientDetails: {
          name: selectedMember?.name || currentUser?.name || 'Self (Primary Citizen)',
          age: selectedMember?.age || currentUser?.age || 42,
          bloodGroup: selectedMember?.bloodGroup || currentUser?.bloodGroup || 'B+',
          abhaId: selectedMember?.abhaId || currentUser?.abhaId || '14-2026-9812-4456',
        },
        createdBy: 'ai_triage',
        medicines: triageResult.suggestedMedicines || [],
        diagnosisSummary: triageResult.likelyDiagnosis,
        riskLevel: triageResult.riskLevel,
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
      };
      setSavedPrescription(localPrescription);
      try {
        const localKey = `arogya_rx_${activeFamilyMemberId}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([localPrescription, ...existing]));
      } catch (e) {}
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const getRiskBadgeStyles = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-alert-red text-white border-alert-red animate-pulse';
      case 'HIGH':
        return 'bg-alert-red/20 text-alert-red border-alert-red';
      case 'MODERATE':
        return 'bg-caution-amber/25 text-deep-navy dark:text-caution-amber border-caution-amber';
      case 'LOW':
      default:
        return 'bg-health-green/20 text-health-green border-health-green';
    }
  };

  const renderMicStatusBadge = () => {
    switch (pipelineStage) {
      case 'listening':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-health-green/20 text-health-green border border-health-green/30 text-xs font-semibold animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>Listening continuously... Speak symptoms now</span>
          </div>
        );
      case 'speech-detected':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-clinical-white/30 dark:bg-dark-base text-deep-navy dark:text-clinical-white border border-deep-navy/20 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse text-medical-blue" />
            <span>Voice detected & transcribing symptoms...</span>
          </div>
        );
      case 'silence-counting':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-caution-amber/25 text-deep-navy dark:text-caution-amber border border-caution-amber/40 text-xs font-semibold animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>Pause detected: Auto-submitting in 1.3s (keep speaking to continue)...</span>
          </div>
        );
      case 'processing-symptoms':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-blue/20 text-medical-blue border border-medical-blue/30 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>Processing your symptoms...</span>
          </div>
        );
      case 'getting-ai-response':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-blue/20 text-medical-blue border border-medical-blue/30 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Getting AI response from Gemini 3.6 Flash...</span>
          </div>
        );
      case 'complete':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-health-green/20 text-health-green border border-health-green/30 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Triage evaluation complete</span>
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-alert-red/20 text-alert-red border border-alert-red/30 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{pipelineErrorMessage || 'Microphone issue'}</span>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-medium text-deep-navy/70 dark:text-dark-muted">
            <span className="w-2 h-2 rounded-full bg-health-green" />
            <span>Ready for voice or text input</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-bold text-medical-blue uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.6 Flash Clinical Triage</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-deep-navy dark:text-clinical-white">
          {t('feat_triage_title')}
        </h2>
        <p className="text-xs sm:text-sm text-deep-navy/70 dark:text-dark-muted max-w-lg mx-auto">
          Speak in your native dialect (Marathi, Hindi, English). The AI assesses risk, recommends non-prescriptive remedies, and speaks back audio guidance.
        </p>
      </div>

      {/* Patient Profile Selector: Ties Triage Session & Prescriptions to Active Member */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-deep-navy/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-medical-blue" />
          <span className="text-xs font-bold uppercase tracking-wider text-deep-navy/80 dark:text-clinical-white">
            Active Patient Profile:
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" data-lenis-prevent="true">
          {allMembers.map((member) => {
            const isSelected = selectedMember?.id === member.id;
            return (
              <button
                key={member.id}
                type="button"
                id={`patient-select-${member.id}`}
                onClick={() => handleSelectPatient(member)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'btn-navy text-white shadow-sm'
                    : 'glass-card text-deep-navy dark:text-clinical-white hover:border-medical-blue/40 border-deep-navy/10'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-medical-blue text-white' : 'bg-deep-navy/10 text-deep-navy dark:bg-white/10 dark:text-clinical-white'
                }`}>
                  {member.name.charAt(0)}
                </span>
                <span>{member.name} ({member.relation || `${member.age || 42}y`})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Capture Hero Interface */}
      <div className="glass-card p-6 sm:p-10 space-y-6 text-center relative overflow-hidden">
        
        {/* Visible Mic / Pipeline Status Indicator */}
        <div className="flex justify-center">
          {renderMicStatusBadge()}
        </div>

        {/* Visible Error Banner if stage failed */}
        {pipelineErrorMessage && (
          <div className="p-3.5 rounded-xl bg-alert-red/15 border border-alert-red/30 flex items-center justify-between text-xs text-alert-red text-left max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{pipelineErrorMessage}</span>
            </div>
            <button 
              onClick={() => setPipelineErrorMessage('')}
              className="underline hover:text-white font-bold ml-2 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Pulsing Mic Button */}
        <div className="relative inline-block">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-medical-blue/30 animate-ping pointer-events-none" />
          )}
          <button
            id="voice-mic-trigger-btn"
            onClick={toggleListening}
            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
              isListening 
                ? 'bg-alert-red scale-105 shadow-alert-red/30 ring-4 ring-alert-red/30' 
                : 'bg-gradient-to-tr from-medical-blue to-caution-amber hover:scale-105 shadow-medical-blue/30'
            }`}
            aria-label="Voice input toggle"
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Status helper text & Alexa-style Independent Voice Language Selector */}
        <div className="space-y-2.5">
          <p className="text-xs sm:text-sm font-semibold text-deep-navy dark:text-clinical-white">
            {isListening 
              ? 'Mic is LIVE & continuously listening. Speak naturally in any language.'
              : 'Click the mic button to speak symptoms in your native tongue.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs font-bold text-deep-navy/70 dark:text-dark-muted flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-medical-blue" />
              Spoken Dialect:
            </span>
            <div className="inline-flex rounded-full p-0.5 glass-card border border-deep-navy/15 dark:border-white/15 shadow-sm">
              {[
                { id: 'auto', label: 'Auto-Detect' },
                { id: 'mr', label: 'मराठी' },
                { id: 'hi', label: 'हिन्दी' },
                { id: 'en', label: 'English' },
                { id: 'ta', label: 'தமிழ்' }
              ].map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSpokenLangMode(l.id)}
                  className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
                    spokenLangMode === l.id 
                      ? 'bg-medical-blue text-white shadow-sm' 
                      : 'text-deep-navy/70 dark:text-dark-muted hover:text-medical-blue'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-deep-navy/60 dark:text-dark-muted">
            Voice AI detects whatever language you speak and responds completely in that language, regardless of UI settings.
          </p>
        </div>

        {/* Interactive Speech-to-Text Transcript Box */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="symptom-input-textarea"
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              latestTranscriptRef.current = e.target.value;
            }}
            placeholder="Spoken symptoms appear here automatically in real time... You can also edit or type directly (e.g., 'Fever of 101°F with body ache for 2 days')."
            rows={3}
            className="w-full p-4 rounded-2xl bg-white/80 dark:bg-dark-base/80 border border-deep-navy/15 dark:border-white/10 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:outline-none focus:border-medical-blue resize-none"
          />

          {transcript && (
            <button
              onClick={() => {
                setTranscript('');
                latestTranscriptRef.current = '';
              }}
              className="absolute right-3 top-3 p-1 rounded-full text-deep-navy/40 hover:text-deep-navy dark:text-dark-muted dark:hover:text-white"
              title="Clear text"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="send-to-ai-btn"
            onClick={() => handleSendToAI()}
            disabled={isAnalyzing || !transcript.trim()}
            className="btn-medical-blue py-3 px-8 text-xs sm:text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Analyzing Clinical Triage...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send to Gemini AI</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Triage Assessment Results Card */}
      {triageResult && (
        <div id="triage-result-container" className="glass-card p-6 sm:p-8 space-y-6 animate-fadeIn border-2 border-deep-navy/20">
          
          {/* Top banner: Risk level + Detected Language + Audio Player */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-deep-navy/10 dark:border-white/10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getRiskBadgeStyles(triageResult.riskLevel)}`}>
                  {triageResult.riskLevel} Risk
                </span>
                {triageResult.detectedLanguage && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-medical-blue/15 text-medical-blue border border-medical-blue/30 flex items-center gap-1.5 shadow-sm">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Spoken Language Detected: {triageResult.detectedLanguageName || (triageResult.detectedLanguage === 'mr' ? 'मराठी (Marathi)' : triageResult.detectedLanguage === 'hi' ? 'हिन्दी (Hindi)' : 'English')}</span>
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-deep-navy dark:text-clinical-white">
                {triageResult.likelyDiagnosis}
              </h3>
            </div>

            {/* Spoken Voice Explainer Audio Controller */}
            {triageResult.audioResponseText && (
              <div className="flex items-center gap-2">
                {isPlayingAudio ? (
                  <button
                    onClick={stopAudio}
                    className="btn-medical-blue bg-alert-red text-xs py-2 px-4 flex items-center gap-2"
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>Stop Voice</span>
                  </button>
                ) : (
                  <button
                    onClick={() => speakResponse(buildComprehensiveSpokenText(triageResult), triageResult.detectedLanguage)}
                    className="btn-navy text-xs py-2 px-4 flex items-center gap-2 dark:bg-clinical-white dark:text-deep-navy"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen Spoken Audio</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Clinical Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-deep-navy/70 dark:text-dark-muted">
              Clinical Assessment
            </h4>
            <p className="text-sm sm:text-base text-deep-navy dark:text-clinical-white leading-relaxed">
              {triageResult.clinicalExplanation}
            </p>
          </div>

          {/* Remedies and Warning Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Safe Home Remedies */}
            <div className="p-5 rounded-2xl bg-health-green/10 border border-health-green/20 space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-health-green flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Safe Home Actions (Non-Prescriptive)</span>
              </h5>
              <ul className="space-y-2 text-xs text-deep-navy dark:text-clinical-white">
                {triageResult.homeRemedies?.map((remedy, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-health-green mt-1.5 shrink-0" />
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red-Flag Warning Signs */}
            <div className="p-5 rounded-2xl bg-alert-red/10 border border-alert-red/20 space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-alert-red flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Red Flags & Escalation</span>
              </h5>
              <ul className="space-y-2 text-xs text-deep-navy dark:text-clinical-white">
                {triageResult.warningSigns?.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-alert-red mt-1.5 shrink-0" />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Section 3: AI Medicine Suggestion Card */}
          {triageResult.suggestedMedicines && triageResult.suggestedMedicines.length > 0 && (
            <div id="ai-medicine-suggestion-card" className="p-6 rounded-2xl bg-gradient-to-br from-caution-amber/10 via-clinical-white/10 to-health-green/10 border-2 border-caution-amber/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-deep-navy/10 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-caution-amber/25 text-deep-navy dark:text-caution-amber">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
                      AI-Suggested Medicine Categories (Over-the-Counter)
                    </h4>
                    <p className="text-xs text-deep-navy/70 dark:text-dark-muted">
                      Safe generic categories only — consult a pharmacist or medical officer before taking
                    </p>
                  </div>
                </div>
                <button
                  id="get-verified-prescription-btn"
                  onClick={handleGetVerifiedPrescription}
                  disabled={isSavingPrescription}
                  className="btn-navy text-xs py-2.5 px-4 flex items-center gap-2 shadow-sm whitespace-nowrap self-start sm:self-auto disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{savedPrescription ? 'Prescription Generated ✓' : isSavingPrescription ? 'Saving Record...' : 'Get Verified Prescription'}</span>
                </button>
              </div>

              {/* Medicine Categories List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {triageResult.suggestedMedicines.map((med, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/80 dark:bg-dark-base/80 border border-deep-navy/15 dark:border-white/10 space-y-2 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bold text-xs sm:text-sm text-deep-navy dark:text-clinical-white">
                        {med.name}
                      </h5>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white">
                        {med.category}
                      </span>
                    </div>
                    <p className="text-xs text-deep-navy/80 dark:text-dark-muted leading-relaxed">
                      <strong>Pharmacist Guidance:</strong> {med.instructions}
                    </p>
                    {med.timing && (
                      <p className="text-[11px] text-medical-blue font-medium">
                        ⏰ {med.timing}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Mandatory Medical Safety Disclaimer */}
              <div className="p-3 rounded-xl bg-caution-amber/20 border border-caution-amber/40 flex items-start gap-2.5 text-xs text-deep-navy dark:text-caution-amber">
                <AlertTriangle className="w-4 h-4 text-caution-amber shrink-0 mt-0.5" />
                <span className="font-medium">
                  <strong>Mandatory Medical Disclaimer:</strong> This is an AI-generated suggestion, not a prescription. Please verify with a doctor or pharmacist before taking any medicine.
                </span>
              </div>

              {/* Instant PDF Download & History Routing Callout */}
              {savedPrescription && (
                <div className="p-3.5 rounded-xl bg-health-green/15 border border-health-green/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-health-green">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-health-green shrink-0" />
                    <span>Verifiable prescription record generated and linked to your family profile!</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <a
                      id="download-triage-pdf-btn"
                      href={`http://localhost:5000/api/prescriptions/${savedPrescription._id || savedPrescription.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-medical-blue text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                    {onNavigateToHub && (
                      <button
                        onClick={onNavigateToHub}
                        className="text-xs text-deep-navy dark:text-clinical-white underline hover:text-medical-blue font-semibold"
                      >
                        Prescription History →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Critical Risk Emergency Notice (No OTC Medicines) */}
          {triageResult.riskLevel === 'CRITICAL' && (
            <div className="p-4 rounded-xl bg-alert-red/15 border border-alert-red/30 flex items-center gap-3 text-xs text-alert-red">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <strong>No OTC Medication Permitted:</strong> For critical emergencies, do not take oral medicines. Immediate emergency care via 108 ambulance is required.
              </div>
            </div>
          )}
          {(triageResult.riskLevel === 'CRITICAL' || triageResult.riskLevel === 'HIGH') && (
            <div className="p-4 rounded-2xl bg-alert-red/15 border-2 border-alert-red flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-alert-red shrink-0" />
                <div className="text-xs text-alert-red">
                  <strong>Emergency Hospital Route Required:</strong> Immediate transportation to nearest rural health centre or secondary hospital advised.
                </div>
              </div>
              <button
                onClick={onNavigateToHospital}
                className="btn-medical-blue bg-alert-red hover:bg-alert-red/90 text-xs py-2 px-5 whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate to Nearest Hospital</span>
              </button>
            </div>
          )}

          {/* Persistent Mandatory Clinical Disclaimer */}
          <div className="p-3.5 rounded-xl bg-deep-navy/5 dark:bg-white/5 border border-deep-navy/10 dark:border-white/10 flex items-start gap-2 text-xs text-deep-navy/80 dark:text-dark-muted">
            <Info className="w-4 h-4 text-medical-blue shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Notice:</strong> This is an AI-assisted preliminary triage, not a medical diagnosis. For any emergency or worsening symptoms, contact a doctor or call 108 immediately.
            </span>
          </div>

        </div>
      )}

      {/* Static Footer Clinical Disclaimer */}
      <div className="text-center p-3 rounded-xl bg-deep-navy/5 dark:bg-white/5 border border-deep-navy/10 dark:border-white/10 text-xs text-deep-navy/70 dark:text-dark-muted">
        <p>
          🩺 <strong>ArogyaRakshak AI Triage Guard:</strong> Designed for rural first-line assessment. Never provides unsupervised prescription drug dosages. In life-threatening emergencies, tap the floating <strong>Emergency SOS 108</strong> button.
        </p>
      </div>

    </div>
  );
}
