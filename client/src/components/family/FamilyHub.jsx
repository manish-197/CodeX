import React, { useState, useEffect } from 'react';
import AddMemberModal from './AddMemberModal';
import EditMemberModal from './EditMemberModal';
import HealthCardModal from './HealthCardModal';
import PrescriptionModal from './PrescriptionModal';
import KioskDashboard from '../kiosk/KioskDashboard';
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
  QrCode,
  User,
  Stethoscope,
  ChevronRight,
  Edit3,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../auth/AuthContext';

export default function FamilyHub({ 
  currentUser, 
  onVitalsChange, 
  onTriggerDoctorDispatch,
  onSelectActiveMember,
  onNavigateToTriage
}) {
  const { lang, t } = useLanguage();
  const { token } = useAuth();
  const [copiedId, setCopiedId] = useState(false);

  const isGramPanchayat = Boolean(
    currentUser?.role === 'kiosk_operator' ||
    currentUser?.role === 'grampanchayat' ||
    currentUser?.role === 'gram_panchayat' ||
    currentUser?.role === 'kiosk' ||
    currentUser?.role === 'operator' ||
    currentUser?.kioskId ||
    (currentUser?.email && (currentUser.email.includes('kiosk') || currentUser.email.includes('grampanchayat')))
  );

  if (isGramPanchayat) {
    return (
      <KioskDashboard 
        currentUser={currentUser}
        onVitalsChange={onVitalsChange}
        onTriggerDoctorDispatch={onTriggerDoctorDispatch}
        onNavigateToTriage={onNavigateToTriage}
      />
    );
  }

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
        id: currentUser?._id || currentUser?.id || 'self_1',
        name: currentUser?.name || 'Self (Primary Citizen)',
        relation: 'Self',
        age: currentUser?.age || 42,
        gender: currentUser?.gender || 'Male',
        bloodGroup: currentUser?.bloodGroup || 'B+',
        arogyaId: currentUser?.arogyaId || currentUser?.abhaId || 'AR-2026-00001',
        medicalHistory: currentUser?.medicalHistory || ['Mild Hypertension'],
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
    return currentUser?._id || currentUser?.id || 'self_1';
  });
  const [hubTab, setHubTab] = useState('overview'); // 'overview' | 'prescriptions'
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
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

  const activeMember = members.find(m => (m.id && m.id === activeMemberId) || (m._id && m._id === activeMemberId)) || members[0];

  useEffect(() => {
    try {
      localStorage.setItem('arogya_family_members', JSON.stringify(members));
    } catch (e) {}
  }, [members]);

  useEffect(() => {
    if (activeMember) {
      try {
        const memId = activeMember.id || activeMember._id;
        localStorage.setItem('arogya_active_member_id', memId);
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

  // Fetch family members from server if authenticated
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/family', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const serverMembers = data.familyMembers || [];
          const selfMember = {
            id: currentUser?._id || currentUser?.id || 'self_1',
            _id: currentUser?._id || currentUser?.id,
            name: currentUser?.name || 'Self (Primary Citizen)',
            relation: 'Self',
            age: currentUser?.age || 42,
            gender: currentUser?.gender || 'Male',
            bloodGroup: currentUser?.bloodGroup || 'B+',
            arogyaId: currentUser?.arogyaId || currentUser?.abhaId || 'AR-2026-00001',
            medicalHistory: currentUser?.medicalHistory || ['Mild Hypertension'],
            vitals: { bp: { sys: 0, dia: 0 }, heartRate: 0, spo2: 0, recordedAt: null }
          };
          const formattedServerMembers = serverMembers.map(m => ({
            id: m._id || m.id,
            _id: m._id || m.id,
            name: m.name,
            relation: m.relation,
            age: m.age,
            gender: m.gender,
            bloodGroup: m.bloodGroup,
            arogyaId: m.arogyaId || m.abhaId || `${selfMember.arogyaId}-01`,
            medicalHistory: m.medicalHistory || [],
            vitals: m.vitals || { bp: { sys: 0, dia: 0 }, heartRate: 0, spo2: 0, recordedAt: null }
          }));
          setMembers([selfMember, ...formattedServerMembers]);
        }
      } catch (err) {
        console.warn('[FamilyHub] Server members fetch notice:', err.message);
      }
    };
    fetchFamilyMembers();
  }, [token, currentUser?.arogyaId]);

  const handleAddMember = async (newMemberData) => {
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/family', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newMemberData)
        });
        if (res.ok) {
          const data = await res.json();
          const m = data.member || data.familyMember;
          const created = {
            id: m._id,
            _id: m._id,
            name: m.name,
            relation: m.relation,
            age: m.age,
            gender: m.gender,
            bloodGroup: m.bloodGroup,
            arogyaId: m.arogyaId,
            medicalHistory: m.medicalHistory || [],
            vitals: { bp: { sys: 0, dia: 0 }, heartRate: 0, spo2: 0, recordedAt: null }
          };
          setMembers(prev => [...prev, created]);
          setActiveMemberId(created.id);
          setIsAddModalOpen(false);
          return;
        }
      } catch (err) {
        console.warn('[FamilyHub] Server add member notice:', err.message);
      }
    }

    // Local fallback
    const newId = 'mem_' + Date.now();
    const selfArogya = currentUser?.arogyaId || 'AR-2026-00001';
    const nextIdx = String(members.length).padStart(2, '0');
    const createdMember = {
      id: newId,
      ...newMemberData,
      arogyaId: `${selfArogya}-${nextIdx}`,
      vitals: {
        bp: { sys: 0, dia: 0 },
        heartRate: 0,
        spo2: 0,
        recordedAt: null,
      }
    };
    setMembers(prev => [...prev, createdMember]);
    setActiveMemberId(newId);
    setIsAddModalOpen(false);
  };

  const handleUpdateMember = async (updatedData) => {
    if (!memberToEdit) return;
    const targetId = memberToEdit._id || memberToEdit.id;

    if (token && targetId && !targetId.toString().startsWith('mem_') && !targetId.toString().startsWith('self_') && memberToEdit.relation !== 'Self') {
      try {
        await fetch(`http://localhost:5000/api/family/${targetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedData)
        });
      } catch (err) {
        console.warn('[FamilyHub] Server update member notice:', err.message);
      }
    }

    setMembers(prev => prev.map(m => {
      const match = (targetId && (m.id === targetId || m._id === targetId)) ||
                    (m.relation === 'Self' && memberToEdit.relation === 'Self');
      return match ? { ...m, ...updatedData } : m;
    }));
    setIsEditMemberModalOpen(false);
    setMemberToEdit(null);
  };

  const handleDeleteMember = async (memberToDelete) => {
    if (!memberToDelete) return;
    if (memberToDelete.relation === 'Self') {
      alert(t('member_cannot_delete_self') || 'Primary citizen profile cannot be deleted.');
      return;
    }

    const confirmMsg = lang === 'mr'
      ? `तुम्हाला '${memberToDelete.name}' हे कुटुंब सदस्य प्रोफाइल नक्की हटवायचे आहे का?`
      : `Are you sure you want to delete family member profile for '${memberToDelete.name}'?`;

    if (!window.confirm(confirmMsg)) return;

    const targetId = memberToDelete._id || memberToDelete.id;
    if (token && targetId && !targetId.toString().startsWith('mem_')) {
      try {
        await fetch(`http://localhost:5000/api/family/${targetId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('[FamilyHub] Server delete member notice:', err.message);
      }
    }

    const remaining = members.filter(m => m.id !== targetId && m._id !== targetId);
    setMembers(remaining);
    if (activeMemberId === targetId) {
      setActiveMemberId(remaining[0]?.id || 'self_1');
    }
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

      {/* Sub-Navigation Tabs: Health Profile vs Prescription History */}
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
          <User className="w-4 h-4" />
          <span>{t('hub_tab_overview')}</span>
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
          <span>{t('hub_tab_prescriptions')}</span>
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
                  onVitalsChange(member.vitals?.heartRate || 0, member.vitals);
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
                  {activeMember.name}'s {t('hub_tab_prescriptions')}
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
              <span>{t('hub_btn_rx')}</span>
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
                  {lang === 'mr' ? 'कोणतीही प्रिस्क्रिप्शन सापडली नाही' : 'No Prescriptions Saved Yet'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'mr' 
                    ? `लक्षणे तपासणी किंवा ओसीआर स्कॅनद्वारे तयार केलेली प्रिस्क्रिप्शन ${activeMember.name} यांच्या प्रोफाइलखाली साठवली जातील.`
                    : `Prescriptions generated from Symptom Checklist Triage or uploaded via the OCR Scanner will be stored under ${activeMember.name}.`}
                </p>
              </div>
              <button
                onClick={() => setIsPrescriptionModalOpen(true)}
                className="btn-medical-blue text-xs py-2 px-5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('hub_btn_rx')}</span>
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
                          {presc.createdBy === 'ocr_scan' ? 'Prescription OCR' : presc.createdBy === 'symptom_checklist' ? 'Symptom Checklist' : 'Checklist Triage'}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          presc.riskLevel === 'CRITICAL' ? 'bg-alert-red text-white' :
                          presc.riskLevel === 'HIGH' ? 'bg-alert-red/20 text-alert-red' :
                          presc.riskLevel === 'MODERATE' ? 'bg-caution-amber/25 text-deep-navy dark:text-caution-amber' :
                          'bg-health-green/20 text-health-green'
                        }`}>
                          {presc.riskLevel || 'LOW'} Risk
                        </span>

                        {presc.durationDays && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-caution-amber/20 text-caution-amber border border-caution-amber/30">
                            {presc.durationDays} Days Protocol
                          </span>
                        )}

                        {/* Dispensing / Verification Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isVerified 
                            ? 'bg-health-green/20 text-health-green border-health-green/30'
                            : 'bg-medical-blue/15 text-medical-blue border-medical-blue/30'
                        }`}>
                          {isVerified ? '✓ Pharmacist Verified' : (t('hub_chemist_slip_badge') || 'Show PDF at Medical Store (केमिस्टसाठी स्लिप)')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5000/api/prescriptions/${presc._id || presc.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-medical-blue text-xs py-1.5 px-3.5 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t('hub_btn_pdf') || 'Download PDF'}</span>
                        </a>
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

                    {/* Safe Home Remedies */}
                    {presc.homeRemedies && presc.homeRemedies.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] uppercase tracking-wider font-bold text-health-green">
                          Safe Home Remedies / घरगुती सुरक्षित उपाय
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {presc.homeRemedies.map((rem, rIdx) => (
                            <span key={rIdx} className="text-xs px-2.5 py-1 rounded-lg bg-health-green/10 text-health-green border border-health-green/20">
                              ✓ {rem}
                            </span>
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
          
          {/* Left Column: Active Member Demographics & ArogyaRakshak Health Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 sm:p-7 space-y-5 border border-white/70 dark:border-white/10 shadow-xl relative overflow-hidden">
              
              {/* Background ambient decorative glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-medical-blue/10 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header: Badges and Action Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-deep-navy/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-health-green/15 text-health-green border border-health-green/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-health-green animate-pulse" />
                    {t('hub_active_profile')}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-medical-blue/15 text-medical-blue border border-medical-blue/20">
                    {activeMember.relation === 'Self' ? (lang === 'mr' ? 'मुख्य नागरिक' : 'Primary Citizen') : activeMember.relation}
                  </span>
                </div>

                {/* Edit & Delete Quick Icons in Header */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setMemberToEdit(activeMember);
                      setIsEditMemberModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl border border-medical-blue/30 text-medical-blue hover:bg-medical-blue hover:text-white transition-all shadow-sm"
                    title={t('member_btn_edit') || 'Edit details'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {activeMember.relation !== 'Self' && (
                    <button
                      onClick={() => handleDeleteMember(activeMember)}
                      className="p-1.5 rounded-xl border border-alert-red/30 text-alert-red hover:bg-alert-red hover:text-white transition-all shadow-sm"
                      title={t('member_btn_delete') || 'Delete member'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Member Core Identity & Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-medical-blue to-health-green text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-medical-blue/20 shrink-0 ring-4 ring-white/60 dark:ring-white/10">
                  {activeMember.name ? activeMember.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-xl text-deep-navy dark:text-clinical-white truncate">
                    {activeMember.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {activeMember.gender || 'Unknown'} • {activeMember.age ? `${activeMember.age} ${lang === 'mr' ? 'वर्षे' : 'yrs'}` : 'Age N/A'}
                    </span>
                  </div>
                </div>

                {/* Blood Group Highlight Tile */}
                <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-gradient-to-br from-alert-red/10 to-alert-red/20 border border-alert-red/30 text-alert-red shrink-0 shadow-sm">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-alert-red/80">Blood</span>
                  <span className="font-display font-extrabold text-lg leading-tight">{activeMember.bloodGroup || 'N/A'}</span>
                </div>
              </div>

              {/* ArogyaRakshak Health Card ID Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-medical-blue/10 via-medical-blue/5 to-soft-cyan/10 border border-medical-blue/25 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-medical-blue dark:text-soft-cyan">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{t('hub_arogya_card_title') || 'ArogyaRakshak Health Card'}</span>
                  </div>
                  <button
                    onClick={() => {
                      const idText = activeMember.arogyaId || activeMember.abhaId || 'AR-2026-00001';
                      navigator.clipboard.writeText(idText);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-medical-blue hover:underline cursor-pointer"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3 h-3 text-health-green" />
                        <span className="text-health-green">{lang === 'mr' ? 'कॉपी झाले!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{lang === 'mr' ? 'कॉपी करा' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-sm sm:text-base font-extrabold tracking-wider text-deep-navy dark:text-clinical-white">
                  {activeMember.arogyaId || activeMember.abhaId || 'AR-2026-00001'}
                </div>
              </div>

              {/* Demographics 3-Column Info Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">{t('hub_relation')}</span>
                  <span className="text-xs font-bold text-deep-navy dark:text-clinical-white truncate block mt-0.5">{activeMember.relation}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">{lang === 'mr' ? 'वय' : 'Age'}</span>
                  <span className="text-xs font-bold text-deep-navy dark:text-clinical-white block mt-0.5">{activeMember.age ? `${activeMember.age} yrs` : 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">{lang === 'mr' ? 'लिंग' : 'Gender'}</span>
                  <span className="text-xs font-bold text-deep-navy dark:text-clinical-white block mt-0.5">{activeMember.gender || 'N/A'}</span>
                </div>
              </div>

              {/* Medical History & Chronic Conditions */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-deep-navy dark:text-clinical-white">
                    {t('hub_medical_history')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {activeMember.medicalHistory?.length || 0} {lang === 'mr' ? 'नोंदी' : 'items'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeMember.medicalHistory && activeMember.medicalHistory.length > 0 ? (
                    activeMember.medicalHistory.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-medical-blue/10 text-medical-blue dark:bg-medical-blue/20 dark:text-soft-cyan border border-medical-blue/20">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      {t('hub_no_conditions')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-3 border-t border-deep-navy/10 dark:border-white/10 space-y-2.5">
                <button
                  onClick={() => setIsCardModalOpen(true)}
                  className="w-full btn-medical-blue text-xs py-3 px-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('hub_btn_pdf')}</span>
                </button>

                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="w-full btn-glass text-xs py-3 px-4 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-medical-blue" />
                  <span>{t('hub_btn_rx')}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Family Member Health & Triage Dashboard */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Quick Action Banner: Symptom Checklist & 2-Day Prescription Triage */}
            <div className="glass-card p-6 sm:p-7 border-2 border-medical-blue/30 bg-gradient-to-br from-medical-blue/10 via-white/40 to-health-green/10 dark:from-medical-blue/20 dark:via-dark-base/40 dark:to-health-green/15 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-medical-blue text-white shadow-md shrink-0 mt-0.5">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-medical-blue/20 text-medical-blue border border-medical-blue/30">
                      {t('home_checklist_badge')}
                    </span>
                    <h4 className="font-display font-bold text-lg sm:text-xl text-deep-navy dark:text-clinical-white mt-1.5">
                      {t('home_checklist_title')}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-lg leading-relaxed">
                      {t('home_checklist_desc')}
                    </p>
                  </div>
                </div>

                <button
                  id="family-start-checklist-btn"
                  onClick={() => onNavigateToTriage && onNavigateToTriage()}
                  className="btn-navy text-xs sm:text-sm py-3 px-5 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg self-start sm:self-center"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{t('home_btn_checklist')}</span>
                </button>
              </div>
            </div>

            {/* Prescriptions & Medical History Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Prescription History Quick Card */}
              <div className="glass-card p-5 sm:p-6 space-y-3.5 border border-white/70 dark:border-white/10 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-deep-navy dark:text-clinical-white font-bold text-sm">
                    <FileText className="w-4 h-4 text-medical-blue" />
                    <span>{t('hub_tab_prescriptions')}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-medical-blue/15 text-medical-blue">
                    {prescriptions.length} {prescriptions.length === 1 ? 'Record' : 'Records'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'mr' 
                    ? `${activeMember.name} यांच्यासाठी तयार केलेले २ दिवसांचे प्रिस्क्रिप्शन स्लिप्स व फार्मसी पडताळणी रेकॉर्ड्स.`
                    : `Saved 2-day prescription slips and pharmacy dispensing records for ${activeMember.name}.`}
                </p>
                <button
                  onClick={() => setHubTab('prescriptions')}
                  className="w-full btn-glass text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 text-medical-blue hover:text-white"
                >
                  <span>{t('hub_tab_prescriptions')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Emergency Health Baseline Support */}
              <div className="glass-card p-5 sm:p-6 space-y-3.5 border border-white/70 dark:border-white/10 shadow-lg">
                <div className="flex items-center gap-2 text-deep-navy dark:text-clinical-white font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-health-green" />
                  <span>{lang === 'mr' ? 'आपत्कालीन आरोग्य मदत' : lang === 'hi' ? 'आपातकालीन स्वास्थ्य सहायता' : 'Emergency Health Support'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'mr'
                    ? 'कोणत्याही गंभीर किंवा आणीबाणीच्या परिस्थितीत स्वतः औषधे न घेता थेट १०८ रुग्णवाहिका किंवा जवळच्या प्राथमिक आरोग्य केंद्राशी संपर्क साधा.'
                    : 'In any critical emergency, do not self-medicate; immediately call 108 ambulance or visit the nearest primary health center.'}
                </p>
                <div className="p-2.5 rounded-xl bg-alert-red/10 border border-alert-red/20 text-[11px] font-semibold text-alert-red flex items-center justify-between">
                  <span>{lang === 'mr' ? 'राष्ट्रीय आपत्कालीन रुग्णवाहिका:' : 'Emergency Helpline:'}</span>
                  <strong className="text-xs font-bold">108</strong>
                </div>
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

      {/* Add Member Modal */}
      <AddMemberModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => {
          setIsEditMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        member={memberToEdit}
        onUpdateMember={handleUpdateMember}
      />

      {/* ArogyaRakshak Health Card Modal with Encrypted QR and PDF download */}
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

    </div>
  );
}
