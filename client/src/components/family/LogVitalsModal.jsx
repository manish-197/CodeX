import React, { useState } from 'react';
import { X, Activity, Heart, Droplets, CheckCircle } from 'lucide-react';

export default function LogVitalsModal({ 
  isOpen, 
  onClose, 
  onSaveVitals, 
  memberName = 'Member', 
  currentVitals 
}) {
  const [sys, setSys] = useState(currentVitals?.bp?.sys || '');
  const [dia, setDia] = useState(currentVitals?.bp?.dia || '');
  const [heartRate, setHeartRate] = useState(currentVitals?.heartRate || '');
  const [spo2, setSpo2] = useState(currentVitals?.spo2 || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const sysNum = Number(sys);
    const diaNum = Number(dia);
    const hrNum = Number(heartRate);
    const spo2Num = Number(spo2);

    if (sysNum < 40 || sysNum > 260 || diaNum < 30 || diaNum > 160) {
      setError('Please enter realistic blood pressure values (e.g. 120/80 mmHg).');
      return;
    }
    if (hrNum < 30 || hrNum > 220) {
      setError('Please enter a valid pulse rate (30 - 220 BPM).');
      return;
    }
    if (spo2Num < 50 || spo2Num > 100) {
      setError('SpO2 blood oxygen must be between 50% and 100%.');
      return;
    }

    onSaveVitals({
      sys: sysNum,
      dia: diaNum,
      heartRate: hrNum,
      spo2: spo2Num,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md glass-card p-6 relative shadow-2xl bg-white/95 dark:bg-dark-card/95"
        data-lenis-prevent="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-deep-teal/10 dark:hover:bg-white/10 text-deep-teal dark:text-sky-mist"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-2xl bg-terracotta text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl text-deep-teal dark:text-sky-mist">
            Log Vitals for {memberName}
          </h3>
          <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
            All fields replace zero-default meters with live measurements
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-alert-crimson/10 text-alert-crimson text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                Systolic (mmHg)
              </label>
              <input
                type="number"
                required
                value={sys}
                onChange={(e) => setSys(e.target.value)}
                placeholder="e.g. 120"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                Diastolic (mmHg)
              </label>
              <input
                type="number"
                required
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                placeholder="e.g. 80"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                required
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="e.g. 74"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                SpO2 (%)
              </label>
              <input
                type="number"
                required
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="e.g. 98"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-terracotta py-2.5 text-xs font-bold mt-2"
          >
            Save Vitals
          </button>
        </form>
      </div>
    </div>
  );
}
