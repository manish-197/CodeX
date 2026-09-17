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
        <div className="p-5 rounded-3xl bg-alert-red/15 border-2 border-alert-red flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-bounce shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-alert-red text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-alert-red">
                {t('vitals_hypertension_alert', { sys: bp.sys, dia: bp.dia })}
              </h4>
              <p className="text-xs text-alert-red/95 mt-0.5">
                {t('vitals_hypertension_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onTriggerDoctorDispatch && onTriggerDoctorDispatch()}
            className="btn-medical-blue bg-alert-red hover:bg-alert-red/90 text-xs py-2.5 px-5 whitespace-nowrap shadow-lg"
          >
            {t('vitals_btn_dispatch')}
          </button>
        </div>
      )}

      {/* Grid of 3 Zero-Default Vitals Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Blood Pressure Meter */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-medical-blue/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-navy/70 dark:text-dark-muted">
              {t('vitals_bp')}
            </span>
            <div className={`p-2.5 rounded-2xl ${isHypertensive ? 'bg-alert-red/15 text-alert-red' : 'bg-deep-navy/10 text-deep-navy dark:text-clinical-white'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${bp.sys === 0 ? 'text-deep-navy/30 dark:text-dark-muted/40' : isHypertensive ? 'text-alert-red' : 'text-deep-navy dark:text-clinical-white'}`}>
              {bp.sys}/{bp.dia}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              mmHg
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-deep-navy/10 dark:border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-deep-navy/70 dark:text-dark-muted">{t('vitals_status')}</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              bp.sys === 0 
                ? 'bg-deep-navy/10 text-deep-navy/60 dark:text-dark-muted' 
                : isHypertensive 
                ? 'bg-alert-red/15 text-alert-red' 
                : 'bg-health-green/20 text-health-green'
            }`}>
              {bp.sys === 0 ? t('vitals_idle') : isHypertensive ? t('vitals_hypertensive') : t('vitals_normal')}
            </span>
          </div>
        </div>

        {/* Heart Rate Meter */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-medical-blue/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-navy/70 dark:text-dark-muted">
              {t('vitals_heart')}
            </span>
            <div className={`p-2.5 rounded-2xl ${heartRate > 100 ? 'bg-alert-red/15 text-alert-red' : 'bg-medical-blue/15 text-medical-blue'}`}>
              <Heart className={`w-4 h-4 ${heartRate > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${heartRate === 0 ? 'text-deep-navy/30 dark:text-dark-muted/40' : 'text-medical-blue'}`}>
              {heartRate}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              BPM
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-deep-navy/10 dark:border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-deep-navy/70 dark:text-dark-muted">{t('vitals_status')}</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              heartRate === 0 
                ? 'bg-deep-navy/10 text-deep-navy/60 dark:text-dark-muted' 
                : heartRate > 100 
                ? 'bg-alert-red/15 text-alert-red' 
                : 'bg-health-green/20 text-health-green'
            }`}>
              {heartRate === 0 ? t('vitals_idle') : heartRate > 100 ? t('vitals_tachycardia') : t('vitals_resting')}
            </span>
          </div>
        </div>

        {/* SpO2 Blood Oxygen Meter */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-medical-blue/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-navy/70 dark:text-dark-muted">
              {t('vitals_spo2')}
            </span>
            <div className={`p-2.5 rounded-2xl ${spo2 > 0 && spo2 < 94 ? 'bg-alert-red/15 text-alert-red' : 'bg-caution-amber/25 text-deep-navy dark:text-caution-amber'}`}>
              <Droplets className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${spo2 === 0 ? 'text-deep-navy/30 dark:text-dark-muted/40' : spo2 < 94 ? 'text-alert-red' : 'text-deep-navy dark:text-clinical-white'}`}>
              {spo2}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              % SpO2
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-deep-navy/10 dark:border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-deep-navy/70 dark:text-dark-muted">{t('vitals_status')}</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              spo2 === 0 
                ? 'bg-deep-navy/10 text-deep-navy/60 dark:text-dark-muted' 
                : spo2 < 94 
                ? 'bg-alert-red/15 text-alert-red' 
                : 'bg-health-green/20 text-health-green'
            }`}>
              {spo2 === 0 ? t('vitals_idle') : spo2 < 94 ? t('vitals_hypoxemia') : t('vitals_optimal')}
            </span>
          </div>
        </div>

      </div>

      {/* Control bar & Recorded At status */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-deep-navy/80 dark:text-dark-muted">
          <Clock className="w-4 h-4 text-medical-blue" />
          <span>
            {recordedAt ? t('vitals_last_logged', { time: new Date(recordedAt).toLocaleString() }) : t('vitals_no_tests')}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenLogModal}
            className="btn-medical-blue text-xs py-2 px-4"
          >
            {t('vitals_btn_log')}
          </button>
          <button
            onClick={onOpenBleModal}
            className="btn-glass text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Bluetooth className="w-3.5 h-3.5 text-deep-navy dark:text-clinical-white" />
            <span>{t('vitals_btn_ble')}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
