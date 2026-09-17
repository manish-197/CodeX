import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Volume2, 
  VolumeX, 
  Sun, 
  Sunrise, 
  Moon, 
  Clock, 
  CheckCircle, 
  Activity, 
  Sparkles,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PrescriptionModal({ isOpen, onClose, member }) {
  const { lang, speechLang, t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
    }
  };

  const handleRunOCR = async () => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('prescriptionImage', selectedFile);
      }
      formData.append('familyMemberId', member?.id || 'self');
      formData.append('language', lang);

      const res = await fetch('http://localhost:5000/api/prescriptions/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('OCR failed');
      const data = await res.json();
      setOcrResult(data);

      if (data.audioExplanationText) {
        speakAudio(data.audioExplanationText);
      }
    } catch (err) {
      console.warn('[Prescription OCR Error]', err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const speakAudio = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 0.92;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl glass-card p-6 sm:p-8 relative shadow-2xl bg-white/95 dark:bg-dark-card/95 max-h-[90vh] overflow-y-auto"
        data-lenis-prevent="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-deep-teal/10 text-deep-teal dark:text-sky-mist"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/15 text-terracotta text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini 2.5 Flash Vision OCR</span>
          </div>
          <h3 className="font-display font-bold text-2xl text-deep-teal dark:text-sky-mist">
            Prescription Scanner & Audio Explainer
          </h3>
          <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
            Upload doctor's prescription for {member?.name || 'Patient'}. AI converts handwriting into dosage cards and speaks instructions.
          </p>
        </div>

        {/* Upload Box */}
        {!ocrResult && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-deep-teal/20 dark:border-white/20 hover:border-terracotta rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-deep-teal/5 dark:bg-white/5">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-deep-teal dark:text-sky-mist">
                {selectedFile ? selectedFile.name : 'Upload Prescription Photo / कॅमेऱ्याने फोटो काढा'}
              </span>
              <span className="text-xs text-deep-teal/60 dark:text-dark-muted mt-1">
                PNG, JPG, WEBP up to 8MB
              </span>
            </label>

            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden max-h-48 border border-deep-teal/10 flex justify-center bg-black/5">
                <img src={previewUrl} alt="Prescription preview" className="object-contain max-h-48" />
              </div>
            )}

            <button
              onClick={handleRunOCR}
              disabled={analyzing}
              className="w-full btn-terracotta py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Gemini Vision Extracting Prescriptions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Prescription with AI</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* OCR Result View */}
        {ocrResult && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header with Spoken Explainer Button */}
            <div className="p-4 rounded-2xl bg-deep-teal/5 dark:bg-white/5 border border-deep-teal/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta block">
                  Prescription Summary
                </span>
                <h4 className="font-display font-bold text-base text-deep-teal dark:text-sky-mist">
                  {ocrResult.extractedSummary}
                </h4>
              </div>

              {ocrResult.audioExplanationText && (
                <div className="shrink-0">
                  {isPlayingAudio ? (
                    <button
                      onClick={stopAudio}
                      className="btn-terracotta bg-alert-crimson text-xs py-2 px-3 flex items-center gap-1.5"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => speakAudio(ocrResult.audioExplanationText)}
                      className="btn-teal text-xs py-2 px-3 flex items-center gap-1.5 dark:bg-sky-mist dark:text-deep-teal"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Listen Spoken Schedule</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Structured Dosage Schedule Cards */}
            <div className="space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-deep-teal dark:text-sky-mist">
                Medication Schedule ({ocrResult.medicines?.length || 0} Medicines)
              </h5>

              <div className="grid grid-cols-1 gap-3">
                {ocrResult.medicines?.map((med, idx) => (
                  <div 
                    key={idx}
                    className="neo-glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-deep-teal/10 hover:border-terracotta/40"
                  >
                    <div className="space-y-1">
                      <div className="font-display font-bold text-sm text-deep-teal dark:text-sky-mist">
                        {med.medicineName}
                      </div>
                      <div className="text-xs text-deep-teal/70 dark:text-dark-muted flex items-center gap-2">
                        <span className="font-semibold text-terracotta">{med.dosage}</span>
                        <span>•</span>
                        <span>{med.timing}</span>
                        <span>•</span>
                        <span>{med.durationDays} Days Course</span>
                      </div>
                    </div>

                    {/* Morning / Afternoon / Night Dosage Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`flex flex-col items-center px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        med.schedule?.morning 
                          ? 'bg-sun-gold/25 text-deep-teal dark:text-sun-gold border border-sun-gold' 
                          : 'opacity-30 border border-gray-200 dark:border-gray-700'
                      }`}>
                        <Sunrise className="w-3.5 h-3.5 mb-0.5" />
                        <span>Morning</span>
                      </div>

                      <div className={`flex flex-col items-center px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        med.schedule?.afternoon 
                          ? 'bg-sun-gold/25 text-deep-teal dark:text-sun-gold border border-sun-gold' 
                          : 'opacity-30 border border-gray-200 dark:border-gray-700'
                      }`}>
                        <Sun className="w-3.5 h-3.5 mb-0.5" />
                        <span>Afternoon</span>
                      </div>

                      <div className={`flex flex-col items-center px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        med.schedule?.night 
                          ? 'bg-deep-teal text-white dark:bg-sky-mist dark:text-deep-teal' 
                          : 'opacity-30 border border-gray-200 dark:border-gray-700'
                      }`}>
                        <Moon className="w-3.5 h-3.5 mb-0.5" />
                        <span>Night</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={() => setOcrResult(null)}
                className="text-terracotta hover:underline font-bold"
              >
                Scan Another Prescription
              </button>

              <button
                onClick={onClose}
                className="btn-glass text-xs py-2 px-4"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
