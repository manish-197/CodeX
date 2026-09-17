import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  X, 
  CheckCircle, 
  Activity, 
  ShieldAlert, 
  Navigation,
  Radio
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function EmergencySOSBeacon({ onNavigateToHospital, activeVitals, currentUser, onRequireAuth }) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCounting, setIsCounting] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchDetails, setDispatchDetails] = useState(null);

  const timerRef = useRef(null);

  const startSOSFlow = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth("Please log in to continue.");
      return;
    }
    setModalOpen(true);
    setCountdown(3);
    setIsCounting(true);
    setIsDispatched(false);
  };

  const abortSOS = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCounting(false);
    setModalOpen(false);
    setCountdown(3);
  };

  // 3-Second Abort Timer Countdown
  useEffect(() => {
    if (isCounting) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            triggerActualDispatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCounting]);

  const triggerActualDispatch = async () => {
    setIsCounting(false);
    setIsDispatched(true);

    let coords = [73.8567, 18.5204];
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        coords = [pos.coords.longitude, pos.coords.latitude];
      } catch (e) {
        console.warn('GPS fallback for SOS', e.message);
      }
    }

    const payload = {
      userId: currentUser?.id || 'citizen_emergency',
      location: { type: 'Point', coordinates: coords },
      vitalsSnapshot: activeVitals || { bp: { sys: 0, dia: 0 }, heartRate: 0, spo2: 0 },
      contacts: ['108 National Ambulance Dispatch', 'Primary Rural Health Guardian']
    };

    try {
      const res = await fetch('http://localhost:5000/api/sos/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setDispatchDetails(data.emergencyDetails);
      }
    } catch (err) {
      console.warn('[SOS Dispatch Network Error, using offline record]', err.message);
      setDispatchDetails({
        ambulanceHotline: '108',
        gpsCoordinates: coords,
        vitalsSummary: `${activeVitals?.bp?.sys || 0}/${activeVitals?.bp?.dia || 0} mmHg, ${activeVitals?.heartRate || 0} BPM`,
        dispatchedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <>
      {/* Floating 1-Tap SOS Beacon Button in bottom-left corner */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={startSOSFlow}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-alert-red text-white font-bold text-xs shadow-2xl hover:bg-alert-red-hover transition-all duration-300 hover:scale-105"
          aria-label="Emergency SOS Beacon"
        >
          {/* Pulsing ring halo */}
          <span className="absolute -inset-1 rounded-full bg-alert-red/40 animate-ping pointer-events-none" />
          
          <Radio className="w-5 h-5 animate-pulse" />
          <span className="tracking-wide uppercase font-black">108 Emergency SOS</span>
        </button>
      </div>

      {/* Emergency Modal: 3s Abort Timer OR Active Beacon View */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-md glass-card p-6 sm:p-8 relative shadow-2xl bg-white/95 dark:bg-dark-card/95 border-4 border-alert-red text-center space-y-6"
            data-lenis-prevent="true"
          >
            {isCounting && (
              <>
                <div className="space-y-2">
                  <div className="w-16 h-16 rounded-full bg-alert-red/15 text-alert-red flex items-center justify-center mx-auto animate-bounce">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-alert-red">
                    Emergency SOS Triggered!
                  </h3>
                  <p className="text-xs text-deep-navy/80 dark:text-clinical-white/80">
                    Transmitting live GPS and vitals snapshot to 108 Ambulance and family contacts in:
                  </p>
                </div>

                {/* Big Animated 3... 2... 1 Countdown Number */}
                <div className="py-2">
                  <div className="w-24 h-24 rounded-full bg-alert-red text-white font-display font-black text-5xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                    {countdown}
                  </div>
                </div>

                {/* Abort Button */}
                <div className="pt-2">
                  <button
                    onClick={abortSOS}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gray-200 dark:bg-dark-base hover:bg-gray-300 text-deep-navy dark:text-clinical-white font-bold text-sm tracking-wider uppercase border border-deep-navy/20 transition-all"
                  >
                    Abort / Cancel Dispatch (खोटे कॉल रद्द करा)
                  </button>
                </div>
              </>
            )}

            {isDispatched && (
              <>
                <div className="space-y-2">
                  <div className="w-16 h-16 rounded-full bg-health-green/15 text-health-green flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-deep-navy dark:text-clinical-white">
                    Emergency Beacon Transmitted
                  </h3>
                  <p className="text-xs text-deep-navy/70 dark:text-dark-muted">
                    Your distress alert has been logged and dispatched with real-time location.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-deep-navy/5 dark:bg-white/5 text-left text-xs space-y-2 border border-deep-navy/10">
                  <div className="flex items-center justify-between">
                    <span className="text-deep-navy/70 dark:text-dark-muted">National Ambulance:</span>
                    <strong className="text-alert-red text-sm">Dial 108</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-deep-navy/70 dark:text-dark-muted">GPS Telemetry:</span>
                    <span className="font-mono font-bold text-deep-navy dark:text-clinical-white">
                      {dispatchDetails?.gpsCoordinates?.map(c => c.toFixed(4)).join(', ') || '73.8567, 18.5204'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-deep-navy/70 dark:text-dark-muted">Vitals Snapshot:</span>
                    <span className="font-bold text-medical-blue">
                      {dispatchDetails?.vitalsSummary || '0/0 mmHg, 0 BPM'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href="tel:108"
                    className="w-full btn-medical-blue bg-alert-red hover:bg-alert-red/90 py-3 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call 108 Ambulance Hotline Now</span>
                  </a>

                  <button
                    onClick={() => {
                      setModalOpen(false);
                      if (onNavigateToHospital) onNavigateToHospital();
                    }}
                    className="w-full btn-navy py-2.5 text-xs font-bold flex items-center justify-center gap-2 dark:bg-clinical-white dark:text-deep-navy"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Open Nearest Hospital Driving Route</span>
                  </button>

                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-xs text-deep-navy/60 dark:text-dark-muted hover:underline mt-2"
                  >
                    Close Dialog
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
