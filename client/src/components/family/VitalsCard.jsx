import React from 'react';
import { Activity, Heart, Droplets, AlertTriangle, Clock, Bluetooth } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function VitalsCard({ 
  vitals = { bp: { sys: 0, dia: 0 }, heartRate: 0, spo2: 0, recordedAt: null },
  onOpenLogModal,
  onOpenBleModal,
  onTriggerDoctorDispatch
}) {
  const { t } = useLanguage();
  const { bp = { sys: 0, dia: 0 }, heartRate = 0, spo2 = 0, recordedAt } = vitals;
  const isHypertensive = bp.sys > 140;

  return (
    <div className="space-y-4">
      
      {/* Hypertensive Emergency Alert Banner */}
      {isHypertensive && (
        <div className="p-4 rounded-3xl bg-alert-crimson/15 border-2 border-alert-crimson flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-alert-crimson text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-alert-crimson">
                {t('vitals_hypertension_alert', { sys: bp.sys, dia: bp.dia })}
              </h4>
              <p className="text-xs text-alert-crimson/90">
                {t('vitals_hypertension_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onTriggerDoctorDispatch && onTriggerDoctorDispatch()}
            className="btn-terracotta bg-alert-crimson hover:bg-alert-crimson/90 text-xs py-2 px-4 whitespace-nowrap"
          >
            {t('vitals_btn_dispatch')}
          </button>
        </div>
      )}

      {/* Grid of 3 Zero-Default Vitals Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Blood Pressure Meter */}
        <div className="neo-glass-card p-5 relative overflow-hidden group hover:border-terracotta/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-teal/70 dark:text-dark-muted">
              {t('vitals_bp')}
            </span>
            <div className={`p-2 rounded-xl ${isHypertensive ? 'bg-alert-crimson/15 text-alert-crimson' : 'bg-deep-teal/10 text-deep-teal dark:text-sky-mist'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${bp.sys === 0 ? 'text-deep-teal/40 dark:text-dark-muted' : isHypertensive ? 'text-alert-crimson' : 'text-deep-teal dark:text-sky-mist'}`}>
              {bp.sys}/{bp.dia}
            </span>
            <span className="text-xs text-deep-teal/60 dark:text-dark-muted font-medium">
              mmHg
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-deep-teal/10 dark:border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-deep-teal/70 dark:text-dark-muted">{t('vitals_status')}</span>
            <span className={`font-bold ${bp.sys === 0 ? 'text-deep-teal/40 dark:text-dark-muted' : isHypertensive ? 'text-alert-crimson' : 'text-leaf-green'}`}>
              {bp.sys === 0 ? t('vitals_idle') : isHypertensive ? t('vitals_hypertensive') : t('vitals_normal')}
            </span>
          </div>
        </div>

        {/* Heart Rate Meter */}
        <div className="neo-glass-card p-5 relative overflow-hidden group hover:border-terracotta/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-teal/70 dark:text-dark-muted">
              {t('vitals_heart')}
            </span>
            <div className={`p-2 rounded-xl ${heartRate > 100 ? 'bg-alert-crimson/15 text-alert-crimson' : 'bg-terracotta/15 text-terracotta'}`}>
              <Heart className={`w-4 h-4 ${heartRate > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${heartRate === 0 ? 'text-deep-teal/40 dark:text-dark-muted' : 'text-terracotta'}`}>
              {heartRate}
            </span>
            <span className="text-xs text-deep-teal/60 dark:text-dark-muted font-medium">
              BPM
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-deep-teal/10 dark:border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-deep-teal/70 dark:text-dark-muted">{t('vitals_status')}</span>
            <span className={`font-bold ${heartRate === 0 ? 'text-deep-teal/40 dark:text-dark-muted' : heartRate > 100 ? 'text-alert-crimson' : 'text-leaf-green'}`}>
              {heartRate === 0 ? t('vitals_idle') : heartRate > 100 ? t('vitals_tachycardia') : t('vitals_resting')}
            </span>
          </div>
        </div>

        {/* SpO2 Blood Oxygen Meter */}
        <div className="neo-glass-card p-5 relative overflow-hidden group hover:border-terracotta/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-teal/70 dark:text-dark-muted">
              {t('vitals_spo2')}
            </span>
            <div className={`p-2 rounded-xl ${spo2 > 0 && spo2 < 94 ? 'bg-alert-crimson/15 text-alert-crimson' : 'bg-sun-gold/20 text-deep-teal dark:text-sun-gold'}`}>
              <Droplets className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${spo2 === 0 ? 'text-deep-teal/40 dark:text-dark-muted' : spo2 < 94 ? 'text-alert-crimson' : 'text-deep-teal dark:text-sky-mist'}`}>
              {spo2}
            </span>
            <span className="text-xs text-deep-teal/60 dark:text-dark-muted font-medium">
              % SpO2
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-deep-teal/10 dark:border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-deep-teal/70 dark:text-dark-muted">{t('vitals_status')}</span>
            <span className={`font-bold ${spo2 === 0 ? 'text-deep-teal/40 dark:text-dark-muted' : spo2 < 94 ? 'text-alert-crimson' : 'text-leaf-green'}`}>
              {spo2 === 0 ? t('vitals_idle') : spo2 < 94 ? t('vitals_hypoxemia') : t('vitals_optimal')}
            </span>
          </div>
        </div>

      </div>

      {/* Control bar & Recorded At status */}
      <div className="neo-glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-deep-teal/70 dark:text-dark-muted">
          <Clock className="w-4 h-4" />
          <span>
            {recordedAt ? t('vitals_last_logged', { time: new Date(recordedAt).toLocaleString() }) : t('vitals_no_tests')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLogModal}
            className="btn-terracotta text-xs py-2 px-4"
          >
            {t('vitals_btn_log')}
          </button>
          <button
            onClick={onOpenBleModal}
            className="btn-glass text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Bluetooth className="w-3.5 h-3.5 text-deep-teal dark:text-sky-mist" />
            <span>{t('vitals_btn_ble')}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
