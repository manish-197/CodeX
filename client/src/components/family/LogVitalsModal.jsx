import React, { useState } from 'react';
import { X, Activity, Heart, Droplets, Bluetooth, Thermometer, FileText, Building2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function LogVitalsModal({ 
  isOpen, 
  onClose, 
  onSaveVitals,
  onSave, 
  memberName = 'Member', 
  currentVitals,
  isKioskOperator = false,
  onOpenBleModal
}) {
  const { t } = useLanguage();

  const [sys, setSys] = useState(currentVitals?.bp?.sys || '');
  const [dia, setDia] = useState(currentVitals?.bp?.dia || '');
  const [heartRate, setHeartRate] = useState(currentVitals?.heartRate || '');
  const [spo2, setSpo2] = useState(currentVitals?.spo2 || '');
  const [temperature, setTemperature] = useState(currentVitals?.temperature || '');
  const [notes, setNotes] = useState(currentVitals?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const saveFn = onSaveVitals || onSave;
    if (!saveFn) return;

    const payload = {};

    if (isKioskOperator) {
      const sysNum = Number(sys);
      const diaNum = Number(dia);
      const hrNum = Number(heartRate);

      if (!sys || !dia || sysNum < 40 || sysNum > 260 || diaNum < 30 || diaNum > 160) {
        setError('Please enter realistic blood pressure values (e.g. 120/80 mmHg).');
        return;
      }
      if (!heartRate || hrNum < 30 || hrNum > 220) {
        setError('Please enter a valid pulse rate (30 - 220 BPM).');
        return;
      }

      payload.sys = sysNum;
      payload.dia = diaNum;
      payload.bp = { sys: sysNum, dia: diaNum };
      payload.heartRate = hrNum;
    } else {
      // Citizen self-logging: BP and HR cannot be manually typed to prevent dummy estimations.
      // Retain existing validated device measurements or maintain zero-default.
      payload.bp = currentVitals?.bp || { sys: 0, dia: 0 };
      payload.sys = currentVitals?.bp?.sys ?? 0;
      payload.dia = currentVitals?.bp?.dia ?? 0;
      payload.heartRate = currentVitals?.heartRate ?? 0;
    }

    if (spo2) {
      const spo2Num = Number(spo2);
      if (spo2Num < 50 || spo2Num > 100) {
        setError('SpO2 blood oxygen must be between 50% and 100%.');
        return;
      }
      payload.spo2 = spo2Num;
    } else {
      payload.spo2 = currentVitals?.spo2 ?? 0;
    }

    if (temperature) {
      const tempNum = Number(temperature);
      if (tempNum < 90 || tempNum > 110) {
        setError('Please enter a realistic body temperature (90°F - 110°F).');
        return;
      }
      payload.temperature = tempNum;
    }

    if (notes) {
      payload.notes = notes.trim();
    }

    saveFn(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md glass-card vitals-meter-card p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]"
        data-lenis-prevent="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-deep-navy/10 dark:hover:bg-white/10 text-deep-navy dark:text-clinical-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-11 h-11 rounded-2xl bg-medical-blue text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl text-deep-navy dark:text-clinical-white">
            {isKioskOperator ? t('vitals_kiosk_operator_entry') : `Log Vitals for ${memberName}`}
          </h3>
          <p className="text-xs text-deep-navy/70 dark:text-dark-muted mt-0.5">
            {isKioskOperator 
              ? 'Enter verified clinical measurements from on-site diagnostic tools' 
              : 'Record supported home tests or connect your medical device'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-alert-red/15 border border-alert-red/30 text-alert-red text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Citizen Restriction Banner — No manual BP/HR entry */}
        {!isKioskOperator ? (
          <div className="mb-5 p-4 rounded-2xl bg-medical-blue/10 dark:bg-medical-blue/20 border border-medical-blue/25 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-medical-blue text-white shrink-0 mt-0.5 shadow-sm">
                <Bluetooth className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-deep-navy dark:text-clinical-white">
                  {t('vitals_manual_restricted_title')}
                </h4>
                <p className="text-[11px] leading-relaxed text-deep-navy/80 dark:text-dark-muted">
                  {t('vitals_manual_restricted_desc')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenBleModal) onOpenBleModal();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-medical-blue hover:bg-medical-blue/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Bluetooth className="w-4 h-4" />
              <span>{t('vitals_btn_pair_device')}</span>
            </button>
          </div>
        ) : (
          /* Gram Panchayat Kiosk Operator Badge */
          <div className="mb-4 p-3 rounded-xl bg-caution-amber/15 border border-caution-amber/35 flex items-center gap-2.5 text-xs text-deep-navy dark:text-caution-amber font-bold">
            <Building2 className="w-4 h-4 text-caution-amber shrink-0" />
            <span>{t('vitals_kiosk_operator_badge')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* BP & Heart Rate Manual Inputs ONLY for Gram Panchayat Kiosk Operator */}
          {isKioskOperator && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-deep-navy dark:text-clinical-white mb-1">
                    Systolic (mmHg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={sys}
                    onChange={(e) => setSys(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-navy/20 dark:border-white/20 text-xs focus:outline-none focus:border-medical-blue text-deep-navy dark:text-clinical-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-deep-navy dark:text-clinical-white mb-1">
                    Diastolic (mmHg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={dia}
                    onChange={(e) => setDia(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-navy/20 dark:border-white/20 text-xs focus:outline-none focus:border-medical-blue text-deep-navy dark:text-clinical-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-navy dark:text-clinical-white mb-1">
                  Heart Rate (BPM) *
                </label>
                <input
                  type="number"
                  required
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="e.g. 74"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-navy/20 dark:border-white/20 text-xs focus:outline-none focus:border-medical-blue text-deep-navy dark:text-clinical-white"
                />
              </div>
            </>
          )}

          {/* Permitted Self-Entry Fields for Citizens & Kiosks: SpO2, Temperature, Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-deep-navy dark:text-clinical-white mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-medical-blue" />
                <span>SpO2 (%)</span>
              </label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="e.g. 98"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-navy/20 dark:border-white/20 text-xs focus:outline-none focus:border-medical-blue text-deep-navy dark:text-clinical-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-deep-navy dark:text-clinical-white mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-caution-amber" />
                <span>Temp (°F)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g. 98.6"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-navy/20 dark:border-white/20 text-xs focus:outline-none focus:border-medical-blue text-deep-navy dark:text-clinical-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-deep-navy dark:text-clinical-white mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Symptom Notes / Observations</span>
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mild headache, took paracetamol in morning"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-navy/20 dark:border-white/20 text-xs focus:outline-none focus:border-medical-blue text-deep-navy dark:text-clinical-white resize-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 btn-glass py-2.5 text-xs font-bold"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              className="w-2/3 btn-medical-blue py-2.5 text-xs font-bold shadow-md"
            >
              {t('btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
