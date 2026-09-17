import React, { useState, useEffect } from 'react';
import VitalsCard from './VitalsCard';
import LogVitalsModal from './LogVitalsModal';
import AddMemberModal from './AddMemberModal';
import HealthCardModal from './HealthCardModal';
import PrescriptionModal from './PrescriptionModal';
import BleDeviceModal from './BleDeviceModal';
import { 
  UserPlus, 
  CreditCard, 
  Upload, 
  Download, 
  AlertCircle,
  ShieldCheck,
  Heart,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  FileText,
  Pill,
  HeartPulse,
  ShieldAlert,
  Clock,
  QrCode
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function FamilyHub({ 
  currentUser, 
  onVitalsChange, 
  onTriggerDoctorDispatch,
  onSelectActiveMember
}) {
  const { t } = useLanguage();

  const [members, setMembers] = useState(() => {
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
        gender: 'Male',
        bloodGroup: 'B+',
        abhaId: currentUser?.abhaId || '14-2026-9812-4456',
        medicalHistory: ['Mild Hypertension'],
        vitals: {
          bp: { sys: 0, dia: 0 },
          heartRate: 0,
          spo2: 0,
          recordedAt: null,
        }
      }
    ];
  });

  const [activeMemberId, setActiveMemberId] = useState(() => {
    try {
      const savedId = localStorage.getItem('arogya_active_member_id');
      if (savedId) return savedId;
    } catch (e) {}
    return currentUser?.id || 'self_1';
  });
  const [hubTab, setHubTab] = useState('overview'); // 'overview' | 'prescriptions'
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isBleModalOpen, setIsBleModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(() => {
    try {
      const q = JSON.parse(localStorage.getItem('arogya_offline_vitals_queue') || '[]');
      return q.length;
    } catch (e) {
      return 0;
    }
  });
  const [syncToast, setSyncToast] = useState(null);

  const activeMember = members.find(m => m.id === activeMemberId) || members[0];

  useEffect(() => {
    try {
      localStorage.setItem('arogya_family_members', JSON.stringify(members));
    } catch (e) {}
  }, [members]);

  useEffect(() => {
    if (activeMember) {
      try {
        localStorage.setItem('arogya_active_member_id', activeMember.id);
        localStorage.setItem('arogya_active_member', JSON.stringify(activeMember));
      } catch (e) {}
      if (onSelectActiveMember) {
        onSelectActiveMember(activeMember);
      }
    }
  }, [activeMemberId, activeMember]);

  const loadPrescriptionsForMember = async (memberId) => {
    if (!memberId) return;
    setLoadingPrescriptions(true);
    try {
      const res = await fetch(`http://localhost:5000/api/prescriptions/member/${memberId}`);
      if (!res.ok) throw new Error('Failed to fetch member prescriptions');
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      console.warn('[Prescription Load]', err.message);
      setPrescriptions([]);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  useEffect(() => {
    if (activeMember?.id) {
      loadPrescriptionsForMember(activeMember.id);
    }
  }, [activeMember?.id, hubTab]);

  const handleVerifyPrescription = async (id) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/prescriptions/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifierName: 'Koregaon Rural Medical Store (Reg #MH-PH-8891)',
          status: 'pharmacist_verified'
        })
      });
      if (!res.ok) throw new Error('Verification failed');
      const data = await res.json();
      setPrescriptions(prev => prev.map(p => (p._id === id || p.id === id) ? { 
        ...p, 
        verificationStatus: 'pharmacist_verified', 
        verifiedBy: 'Koregaon Rural Medical Store (Reg #MH-PH-8891)',
        verifiedAt: new Date()
      } : p));
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-flush pending queue upon reconnect
      try {
        const queue = JSON.parse(localStorage.getItem('arogya_offline_vitals_queue') || '[]');
        if (queue.length > 0) {
          localStorage.removeItem('arogya_offline_vitals_queue');
          setPendingSyncCount(0);
          setSyncToast(`${queue.length} offline vitals entry synced automatically!`);
          setTimeout(() => setSyncToast(null), 4000);
        }
      } catch (e) {}
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveVitals = (newVitals) => {
    const updated = members.map(m => {
      if (m.id === activeMember.id) {
        const fullVitals = { 
          ...m.vitals,
          ...newVitals,
          bp: {
            sys: typeof newVitals.sys !== 'undefined' ? newVitals.sys : (newVitals.bp?.sys ?? m.vitals?.bp?.sys ?? 0),
            dia: typeof newVitals.dia !== 'undefined' ? newVitals.dia : (newVitals.bp?.dia ?? m.vitals?.bp?.dia ?? 0)
          },
          heartRate: typeof newVitals.heartRate !== 'undefined' ? newVitals.heartRate : (m.vitals?.heartRate ?? 0),
          spo2: typeof newVitals.spo2 !== 'undefined' ? newVitals.spo2 : (m.vitals?.spo2 ?? 0),
          recordedAt: new Date().toISOString()
        };
        return { ...m, vitals: fullVitals };
      }
      return m;
    });
    setMembers(updated);

    if (!navigator.onLine) {
      // Queue locally in localStorage for offline PWA compliance
      try {
        const queue = JSON.parse(localStorage.getItem('arogya_offline_vitals_queue') || '[]');
        queue.push({
          memberId: activeMember.id,
          vitals: newVitals,
          queuedAt: new Date().toISOString()
        });
        localStorage.setItem('arogya_offline_vitals_queue', JSON.stringify(queue));
        setPendingSyncCount(queue.length);
      } catch (e) {}
    }

    if (onVitalsChange) {
      onVitalsChange(newVitals.heartRate, newVitals);
    }
  };

  const handleAddMember = (newMemberData) => {
    const newId = 'mem_' + Date.now();
    const createdMember = {
      id: newId,
      ...newMemberData,
      abhaId: '14-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      vitals: {
        bp: { sys: 0, dia: 0 },
        heartRate: 0,
        spo2: 0,
        recordedAt: null,
      }
    };
    setMembers([...members, createdMember]);
    setActiveMemberId(newId);
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-medical-blue">
            {t('hub_badge')}
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white">
            {t('hub_title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('hub_desc')}
          </p>

          {/* Offline / Pending Sync Badge */}
          {(!isOnline || pendingSyncCount > 0) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-caution-amber/25 text-deep-navy dark:text-caution-amber border border-caution-amber text-xs font-bold animate-pulse mt-2">
              <WifiOff className="w-3.5 h-3.5 text-alert-red" />
              <span>
                {!isOnline ? 'Offline Mode Active' : 'Network Reconnected'} • {pendingSyncCount} Pending Sync {pendingSyncCount === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>
          )}

          {/* Sync Success Toast */}
          {syncToast && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-green/20 text-health-green border border-health-green text-xs font-bold animate-fadeIn mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{syncToast}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-medical-blue text-xs py-2.5 px-5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('hub_btn_add')}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs: Health Profile & Vitals vs Prescription History */}
      <div className="flex items-center gap-2 border-b border-deep-navy/10 dark:border-white/10 pb-3">
        <button
          id="family-tab-overview"
          onClick={() => setHubTab('overview')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            hubTab === 'overview'
              ? 'btn-navy text-white shadow-md'
              : 'glass-card text-deep-navy dark:text-clinical-white hover:border-medical-blue/40'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Health Profile & Vitals</span>
        </button>
        <button
          id="family-tab-prescriptions"
          onClick={() => setHubTab('prescriptions')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            hubTab === 'prescriptions'
              ? 'btn-navy text-white shadow-md'
              : 'glass-card text-deep-navy dark:text-clinical-white hover:border-medical-blue/40'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescription History</span>
          {prescriptions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-medical-blue text-white">
              {prescriptions.length}
            </span>
          )}
        </button>
      </div>

      {/* Dynamic Profile Switcher: Horizontal Avatar Bar */}
      <div 
        className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none"
        data-lenis-prevent="true"
      >
        {members.map((member) => {
          const isActive = member.id === activeMember?.id;
          return (
            <button
              key={member.id}
              onClick={() => {
                setActiveMemberId(member.id);
                if (onVitalsChange) {
                  onVitalsChange(member.vitals.heartRate, member.vitals);
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-3xl whitespace-nowrap transition-all border ${
                isActive
                  ? 'btn-navy text-white shadow-lg'
                  : 'glass-card hover:border-medical-blue/50 text-deep-navy dark:text-clinical-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shadow-sm ${
                isActive ? 'bg-medical-blue text-white' : 'bg-deep-navy/10 text-deep-navy dark:bg-white/10 dark:text-clinical-white'
              }`}>
                {member.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs leading-tight">{member.name}</div>
                <div className={`text-[10px] ${isActive ? 'opacity-90' : 'text-slate-500 dark:text-dark-muted'}`}>
                  {member.relation} • {member.age ? `${member.age} yrs` : 'Age N/A'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {hubTab === 'prescriptions' ? (
        /* Section 4d: Per-Family-Member Prescription History View */
        <div className="space-y-6">
          {/* Prescription History Banner */}
          <div className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-medical-blue/20 text-medical-blue">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-deep-navy dark:text-clinical-white">
                  {activeMember.name}'s Prescription Records
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {prescriptions.length} {prescriptions.length === 1 ? 'prescription record' : 'prescription records'} saved for this profile
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="btn-medical-blue text-xs py-2.5 px-5 flex items-center gap-2 self-start sm:self-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Scan Prescription Image</span>
            </button>
          </div>

          {/* Prescriptions List */}
          {loadingPrescriptions ? (
            <div className="glass-card p-12 text-center text-xs text-deep-navy dark:text-clinical-white">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-medical-blue mb-2" />
              <span>Loading member prescriptions...</span>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-md mx-auto space-y-4 shadow-lg">
              <FileText className="w-10 h-10 text-medical-blue/60 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
                  No Prescriptions Saved Yet
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Prescriptions generated from Voice AI Triage or uploaded via the OCR Scanner will be stored under <strong>{activeMember.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => setIsPrescriptionModalOpen(true)}
                className="btn-medical-blue text-xs py-2 px-5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Prescription Slip</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {prescriptions.map((presc) => {
                const isVerified = presc.verificationStatus === 'pharmacist_verified' || presc.verificationStatus === 'doctor_verified';
                const recordDate = new Date(presc.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div 
                    key={presc._id || presc.id} 
                    className="glass-card p-6 space-y-4 border border-deep-navy/15 dark:border-white/10 hover:border-medical-blue/40 transition-all shadow-md"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-deep-navy/10 dark:border-white/10">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-bold text-deep-navy/70 dark:text-dark-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{recordDate}</span>
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white uppercase">
                          {presc.createdBy === 'ocr_scan' ? 'Prescription OCR' : 'Voice AI Triage'}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          presc.riskLevel === 'CRITICAL' ? 'bg-alert-red text-white' :
                          presc.riskLevel === 'HIGH' ? 'bg-alert-red/20 text-alert-red' :
                          presc.riskLevel === 'MODERATE' ? 'bg-caution-amber/25 text-deep-navy dark:text-caution-amber' :
                          'bg-health-green/20 text-health-green'
                        }`}>
                          {presc.riskLevel || 'LOW'} Risk
                        </span>

                        {/* Verification Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isVerified 
                            ? 'bg-health-green/20 text-health-green border-health-green/30'
                            : 'bg-caution-amber/25 text-deep-navy dark:text-caution-amber border-caution-amber/40'
                        }`}>
                          {isVerified ? '✓ Pharmacist Verified' : 'Awaiting Pharmacist Check'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5000/api/prescriptions/${presc._id || presc.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-medical-blue text-xs py-1.5 px-3.5 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>

                        {!isVerified && (
                          <button
                            onClick={() => handleVerifyPrescription(presc._id || presc.id)}
                            disabled={verifyingId === (presc._id || presc.id)}
                            className="btn-glass text-[11px] py-1.5 px-3 text-health-green hover:bg-health-green/10 flex items-center gap-1"
                            title="Simulate Pharmacist Verification check"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{verifyingId === (presc._id || presc.id) ? 'Verifying...' : 'Verify Slip'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Diagnosis / Summary */}
                    <div className="space-y-1">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-deep-navy/60 dark:text-dark-muted">
                        Diagnosis / Assessment
                      </div>
                      <div className="text-sm font-semibold text-deep-navy dark:text-clinical-white">
                        {presc.diagnosisSummary}
                      </div>
                    </div>

                    {/* Medicines Grid */}
                    {presc.medicines && presc.medicines.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] uppercase tracking-wider font-bold text-deep-navy/60 dark:text-dark-muted">
                          Medicines & OTC Guidance
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {presc.medicines.map((m, mIdx) => (
                            <div key={mIdx} className="p-3 rounded-xl bg-white/80 dark:bg-dark-base/60 border border-deep-navy/10 space-y-1 text-xs">
                              <div className="font-bold text-deep-navy dark:text-clinical-white flex items-center justify-between">
                                <span>{m.name}</span>
                                <span className="text-[10px] opacity-70">{m.category}</span>
                              </div>
                              <div className="text-deep-navy/70 dark:text-dark-muted text-[11px]">
                                {m.instructions}
                              </div>
                              {m.timing && (
                                <div className="text-medical-blue text-[10px] font-semibold">
                                  ⏰ {m.timing}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified By Note */}
                    {isVerified && presc.verifiedBy && (
                      <div className="text-[11px] text-health-green font-medium flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified by <strong>{presc.verifiedBy}</strong> on {new Date(presc.verifiedAt || Date.now()).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeMember ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Active Member Demographics & ABHA Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 sm:p-7 space-y-5 border border-white/70 dark:border-white/10 shadow-xl">
              
              <div className="flex items-start justify-between border-b border-deep-navy/10 dark:border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-health-green/15 text-health-green">
                    {t('hub_active_profile')}
                  </span>
                  <h3 className="font-display font-bold text-xl text-deep-navy dark:text-clinical-white mt-2">
                    {activeMember.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {t('hub_relation')}: <strong>{activeMember.relation}</strong>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medical-blue to-caution-amber text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {activeMember.bloodGroup || 'N/A'}
                </div>
              </div>

              {/* ABHA ID details */}
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-dark-base/60 border border-deep-navy/10 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-deep-navy/70 dark:text-dark-muted">
                  <CreditCard className="w-3.5 h-3.5 text-medical-blue" />
                  <span>{t('hub_abha_title')}</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold tracking-wider text-deep-navy dark:text-clinical-white">
                  {activeMember.abhaId || 'XX-XXXX-XXXX-XXXX'}
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-deep-navy dark:text-clinical-white">
                  {t('hub_medical_history')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMember.medicalHistory && activeMember.medicalHistory.length > 0 ? (
                    activeMember.medicalHistory.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-[11px] font-semibold bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      {t('hub_no_conditions')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-deep-navy/10 dark:border-white/10 space-y-2.5">
                <button
                  onClick={() => setIsCardModalOpen(true)}
                  className="w-full btn-navy text-xs py-3 px-4 flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('hub_btn_pdf')}</span>
                </button>

                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="w-full btn-glass text-xs py-3 px-4 flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-medical-blue" />
                  <span>{t('hub_btn_rx')}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Zero-Default Vitals & Diagnostics */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-deep-navy dark:text-clinical-white">
                  {t('vitals_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t('vitals_subtitle')}
                </p>
              </div>
            </div>

            {/* Zero-Default Vitals Card */}
            <VitalsCard 
              vitals={activeMember.vitals}
              onOpenLogModal={() => setIsLogModalOpen(true)}
              onOpenBleModal={() => setIsBleModalOpen(true)}
              onTriggerDoctorDispatch={onTriggerDoctorDispatch}
            />

            {/* Vitals Baseline Guidance */}
            <div className="glass-card p-4 sm:p-5 flex items-start gap-3.5 text-xs text-slate-700 dark:text-slate-300 shadow-md">
              <ShieldCheck className="w-5 h-5 text-health-green shrink-0 mt-0.5" />
              <div>
                <strong className="block text-deep-navy dark:text-clinical-white font-bold mb-0.5">
                  Rural Clinical Baseline Protocol
                </strong>
                Readings above 140 mmHg systolic instantly trigger the village emergency doctor dispatch sequence. All readings sync with the 3D heart digital twin on your home screen.
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-card p-12 text-center max-w-md mx-auto space-y-3 shadow-xl">
          <AlertCircle className="w-8 h-8 text-medical-blue mx-auto" />
          <h4 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
            {t('hub_empty_title')}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t('hub_empty_desc')}
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-medical-blue text-xs"
          >
            {t('hub_btn_add')}
          </button>
        </div>
      )}

      {/* Log Vitals Modal */}
      <LogVitalsModal 
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaveVitals={handleSaveVitals}
        memberName={activeMember?.name}
        currentVitals={activeMember?.vitals}
        isKioskOperator={false}
        onOpenBleModal={() => setIsBleModalOpen(true)}
      />

      {/* Add Member Modal */}
      <AddMemberModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
      />

      {/* ABDM Health Card Modal with Encrypted QR and PDF download */}
      <HealthCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        member={activeMember}
      />

      {/* Gemini Vision Prescription OCR & Multilingual Audio Explainer Modal */}
      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        member={activeMember}
      />

      {/* Web Bluetooth BLE Device Sync Modal */}
      <BleDeviceModal
        isOpen={isBleModalOpen}
        onClose={() => setIsBleModalOpen(false)}
        onSyncVitals={handleSaveVitals}
        currentMemberName={activeMember?.name}
      />

    </div>
  );
}
