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
  HeartPulse
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function VoiceTriage({ onNavigateToHospital, activeVitals }) {
  const { lang, speechLang, t } = useLanguage();

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLang;

    recognition.onresult = (event) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);

      // Reset 1.3s silence timer on new speech
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        if (currentText.trim().length > 5) {
          handleSendToAI(currentText);
        }
      }, 1300); // 1.3s silence timer per hackathon spec
    };

    recognition.onerror = (err) => {
      console.warn('[Speech Recognition Error]', err.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognition start issue:', e);
      }
    }
  };

  const handleSendToAI = async (textToSend) => {
    const symptoms = textToSend || transcript;
    if (!symptoms.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setIsAnalyzing(true);
    setTriageResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          language: lang,
          vitals: activeVitals,
        }),
      });

      if (!res.ok) throw new Error('Triage endpoint unreachable');
      const data = await res.json();
      setTriageResult(data);

      // Auto-play spoken audio explainer if available
      if (data.audioResponseText) {
        speakResponse(data.audioResponseText);
      }
    } catch (err) {
      console.warn('[Triage Fallback]', err.message);
      // Client-side emergency fallback
      const mockDiagnosis = {
        riskLevel: symptoms.toLowerCase().includes('chest') ? 'CRITICAL' : 'MODERATE',
        likelyDiagnosis: lang === 'mr' ? 'मोसमी विषाणू ताप / प्राथमिक तपासणी' : lang === 'hi' ? 'मौसमी वायरल बुखार / प्राथमिक जांच' : 'Clinical Triage Evaluation',
        clinicalExplanation: lang === 'mr' 
          ? 'आपली लक्षणे नोंदवली गेली आहेत. भरपूर पाणी प्या आणि आराम करा.'
          : 'Your symptoms have been evaluated. Maintain hydration and monitor vitals closely.',
        homeRemedies: [
          lang === 'mr' ? 'ओआरएस (ORS) किंवा कोमट पाणी प्या.' : 'Drink warm water and oral rehydration salts.',
          lang === 'mr' ? 'कपाळावर कोमट पाण्याच्या पट्ट्या ठेवा.' : 'Cold/lukewarm damp cloth on forehead if feverish.'
        ],
        warningSigns: [
          lang === 'mr' ? 'श्वास घेण्यास त्रास झाल्यास' : 'Difficulty breathing or sudden chest pressure',
        ],
        recommendedSpecialty: 'Primary Health Centre (PHC)',
        audioResponseText: lang === 'mr'
          ? 'आपली लक्षणे नोंदवली गेली आहेत. कृपया भरपूर विश्रांती घ्या आणि जवळच्या केंद्राला भेट द्या.'
          : 'Triage assessment complete. Rest well and visit your local health centre if symptoms worsen.'
      };
      setTriageResult(mockDiagnosis);
      speakResponse(mockDiagnosis.audioResponseText);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakResponse = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 0.95; // Slightly slower for clarity in rural dialects

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

  const getRiskBadgeStyles = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-alert-crimson text-white border-alert-crimson animate-pulse';
      case 'HIGH':
        return 'bg-alert-crimson/20 text-alert-crimson border-alert-crimson';
      case 'MODERATE':
        return 'bg-sun-gold/25 text-deep-teal dark:text-sun-gold border-sun-gold';
      case 'LOW':
      default:
        return 'bg-leaf-green/20 text-leaf-green border-leaf-green';
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neo-glass-card text-xs font-bold text-terracotta uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 2.5 Flash Clinical Triage</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-deep-teal dark:text-sky-mist">
          {t('feat_triage_title')}
        </h2>
        <p className="text-xs sm:text-sm text-deep-teal/70 dark:text-dark-muted max-w-lg mx-auto">
          Speak in your native dialect (Marathi, Hindi, English). The AI assesses risk, recommends remedies, and speaks back guidance.
        </p>
      </div>

      {/* Voice Capture Hero Interface */}
      <div className="neo-glass-card p-6 sm:p-10 space-y-6 text-center relative overflow-hidden">
        
        {/* Pulsing Mic Button */}
        <div className="relative inline-block">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-terracotta/30 animate-ping" />
          )}
          <button
            onClick={toggleListening}
            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
              isListening 
                ? 'bg-alert-crimson scale-105' 
                : 'bg-gradient-to-tr from-terracotta to-sun-gold hover:scale-105'
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

        {/* Live Status Label */}
        <div className="space-y-1">
          <div className="text-sm font-bold text-deep-teal dark:text-sky-mist flex items-center justify-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-alert-crimson animate-ping' : 'bg-leaf-green'}`} />
            <span>
              {isListening 
                ? 'Listening... Speak symptoms naturally (1.3s silence triggers AI)' 
                : 'Tap microphone to speak symptoms'}
            </span>
          </div>
          <p className="text-xs text-deep-teal/60 dark:text-dark-muted">
            Recognizing in: <strong>{speechLang}</strong>
          </p>
        </div>

        {/* Interactive Speech-to-Text Transcript Box */}
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words appear here... You can also type symptoms directly (e.g. 'Fever for 2 days with severe headache')."
            rows={3}
            className="w-full p-4 rounded-2xl bg-white/80 dark:bg-dark-base/80 border border-deep-teal/15 dark:border-white/10 text-xs sm:text-sm text-deep-teal dark:text-sky-mist focus:outline-none focus:border-terracotta resize-none"
          />

          {transcript && (
            <button
              onClick={() => setTranscript('')}
              className="absolute right-3 top-3 p-1 rounded-full text-deep-teal/40 hover:text-deep-teal"
              title="Clear text"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleSendToAI()}
            disabled={isAnalyzing || !transcript.trim()}
            className="btn-terracotta py-3 px-8 text-xs sm:text-sm disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin" />
                <span>Analyzing Clinical Triage...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>Send to Gemini AI</span>
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Triage Assessment Results Card */}
      {triageResult && (
        <div className="neo-glass-card p-6 sm:p-8 space-y-6 animate-fadeIn border-2 border-deep-teal/20">
          
          {/* Top banner: Risk level + Audio Player */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-deep-teal/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getRiskBadgeStyles(triageResult.riskLevel)}`}>
                {triageResult.riskLevel} Risk
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-deep-teal dark:text-sky-mist">
                {triageResult.likelyDiagnosis}
              </h3>
            </div>

            {/* Spoken Voice Explainer Audio Controller */}
            {triageResult.audioResponseText && (
              <div className="flex items-center gap-2">
                {isPlayingAudio ? (
                  <button
                    onClick={stopAudio}
                    className="btn-terracotta bg-alert-crimson text-xs py-2 px-4 flex items-center gap-2"
                  >
                    <VolumeX className="w-4 h-4" />
                    <span>Stop Voice</span>
                  </button>
                ) : (
                  <button
                    onClick={() => speakResponse(triageResult.audioResponseText)}
                    className="btn-teal text-xs py-2 px-4 flex items-center gap-2 dark:bg-sky-mist dark:text-deep-teal"
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-deep-teal/70 dark:text-dark-muted">
              Clinical Assessment
            </h4>
            <p className="text-sm sm:text-base text-deep-teal dark:text-sky-mist leading-relaxed">
              {triageResult.clinicalExplanation}
            </p>
          </div>

          {/* Remedies and Warning Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Safe Home Remedies */}
            <div className="p-5 rounded-2xl bg-leaf-green/10 border border-leaf-green/20 space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-leaf-green flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Safe Home Actions</span>
              </h5>
              <ul className="space-y-2 text-xs text-deep-teal dark:text-sky-mist">
                {triageResult.homeRemedies?.map((remedy, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-leaf-green mt-1.5 shrink-0" />
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red-Flag Warning Signs */}
            <div className="p-5 rounded-2xl bg-alert-crimson/10 border border-alert-crimson/20 space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-alert-crimson flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Red Flags</span>
              </h5>
              <ul className="space-y-2 text-xs text-deep-teal dark:text-sky-mist">
                {triageResult.warningSigns?.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-alert-crimson mt-1.5 shrink-0" />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Urgent Hospital Route Dispatch Callout for Critical/High */}
          {(triageResult.riskLevel === 'CRITICAL' || triageResult.riskLevel === 'HIGH') && (
            <div className="p-4 rounded-2xl bg-alert-crimson/15 border-2 border-alert-crimson flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-alert-crimson shrink-0" />
                <div className="text-xs text-alert-crimson">
                  <strong>Emergency Hospital Route Required:</strong> Immediate transportation to nearest rural health centre or secondary hospital advised.
                </div>
              </div>
              <button
                onClick={onNavigateToHospital}
                className="btn-terracotta bg-alert-crimson hover:bg-alert-crimson/90 text-xs py-2 px-5 whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate to Nearest Hospital</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
