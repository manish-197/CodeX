import React from 'react';
import { Activity, Heart, Droplets, AlertTriangle, Clock, Bluetooth } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function VitalsCard({ 
  vitals = { bp: { sys: 0, dia: 0 }, heartRate: 0, spo2: 0, recordedAt: null },
  onOpenLogModal,
  onOpenBleModal,
  onTriggerDoctorDispatch,
  isKioskOperator = false
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
        <div className="glass-card vitals-meter-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider vitals-label">
              {t('vitals_bp')}
            </span>
            <div className={`p-2.5 rounded-2xl ${isHypertensive ? 'vitals-badge-alert' : 'vitals-icon-idle'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${bp.sys === 0 ? 'vitals-zero' : isHypertensive ? 'text-alert-red' : 'vitals-val'}`}>
              {bp.sys}/{bp.dia}
            </span>
            <span className="text-xs vitals-unit">
              mmHg
            </span>
          </div>

          <div className="mt-3 pt-3 vitals-divider flex items-center justify-between text-[11px]">
            <span className="vitals-label font-normal text-[11px] opacity-80">{t('vitals_status')}</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
              bp.sys === 0 
                ? 'vitals-badge-idle' 
                : isHypertensive 
                ? 'vitals-badge-alert' 
                : 'vitals-badge-normal'
            }`}>
              {bp.sys === 0 ? t('vitals_idle') : isHypertensive ? t('vitals_hypertensive') : t('vitals_normal')}
            </span>
          </div>

          {bp.sys === 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenBleModal) onOpenBleModal();
              }}
              className="mt-3 w-full py-1.5 px-3 rounded-xl bg-medical-blue/10 hover:bg-medical-blue/20 text-medical-blue border border-medical-blue/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Bluetooth className="w-3.5 h-3.5 shrink-0" />
              <span>{t('vitals_btn_connect_device')}</span>
            </button>
          )}
        </div>

        {/* Heart Rate Meter */}
        <div className="glass-card vitals-meter-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider vitals-label">
              {t('vitals_heart')}
            </span>
            <div className={`p-2.5 rounded-2xl ${heartRate > 100 ? 'vitals-badge-alert' : 'vitals-icon-idle'}`}>
              <Heart className={`w-4 h-4 ${heartRate > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${heartRate === 0 ? 'vitals-zero' : heartRate > 100 ? 'text-alert-red' : 'vitals-val'}`}>
              {heartRate}
            </span>
            <span className="text-xs vitals-unit">
              BPM
            </span>
          </div>

          <div className="mt-3 pt-3 vitals-divider flex items-center justify-between text-[11px]">
            <span className="vitals-label font-normal text-[11px] opacity-80">{t('vitals_status')}</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
              heartRate === 0 
                ? 'vitals-badge-idle' 
                : heartRate > 100 
                ? 'vitals-badge-alert' 
                : 'vitals-badge-normal'
            }`}>
              {heartRate === 0 ? t('vitals_idle') : heartRate > 100 ? t('vitals_tachycardia') : t('vitals_resting')}
            </span>
          </div>

          {heartRate === 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenBleModal) onOpenBleModal();
              }}
              className="mt-3 w-full py-1.5 px-3 rounded-xl bg-medical-blue/10 hover:bg-medical-blue/20 text-medical-blue border border-medical-blue/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Bluetooth className="w-3.5 h-3.5 shrink-0" />
              <span>{t('vitals_btn_connect_device')}</span>
            </button>
          )}
        </div>

        {/* SpO2 Blood Oxygen Meter */}
        <div className="glass-card vitals-meter-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider vitals-label">
              {t('vitals_spo2')}
            </span>
            <div className={`p-2.5 rounded-2xl ${spo2 > 0 && spo2 < 94 ? 'vitals-badge-alert' : 'vitals-badge-caution'}`}>
              <Droplets className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-display font-black text-3xl sm:text-4xl ${spo2 === 0 ? 'vitals-zero' : spo2 < 94 ? 'text-alert-red' : 'vitals-val'}`}>
              {spo2}
            </span>
            <span className="text-xs vitals-unit">
              % SpO2
            </span>
          </div>

          <div className="mt-3 pt-3 vitals-divider flex items-center justify-between text-[11px]">
            <span className="vitals-label font-normal text-[11px] opacity-80">{t('vitals_status')}</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
              spo2 === 0 
                ? 'vitals-badge-idle' 
                : spo2 < 94 
                ? 'vitals-badge-alert' 
                : 'vitals-badge-normal'
            }`}>
              {spo2 === 0 ? t('vitals_idle') : spo2 < 94 ? t('vitals_hypoxemia') : t('vitals_optimal')}
            </span>
          </div>
        </div>

      </div>

      {/* Control bar & Recorded At status */}
      <div className="glass-card vitals-meter-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 vitals-label font-medium text-xs normal-case opacity-90">
          <Clock className="w-4 h-4 text-medical-blue shrink-0" />
          <span>
            {recordedAt ? t('vitals_last_logged', { time: new Date(recordedAt).toLocaleString() }) : t('vitals_no_tests')}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenLogModal}
            className="btn-medical-blue text-xs py-2 px-4"
          >
            {isKioskOperator ? t('vitals_kiosk_operator_entry') : t('vitals_btn_log')}
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
