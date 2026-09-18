import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserPlus, 
  FileText, 
  Search, 
  Download, 
  Stethoscope, 
  Activity, 
  Heart, 
  Shield, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Users, 
  Pill, 
  Copy,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function KioskDashboard({ 
  currentUser, 
  onVitalsChange, 
  onTriggerDoctorDispatch,
  onNavigateToTriage 
}) {
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('intake'); // 'intake' | 'history'
  const [historySubTab, setHistorySubTab] = useState('patients'); // 'patients' | 'prescriptions'
  const [copiedId, setCopiedId] = useState(null);
  const [downloadingCardId, setDownloadingCardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL' | 'LOW' | 'MODERATE' | 'CRITICAL'
  const [successToast, setSuccessToast] = useState('');
  const [formError, setFormError] = useState('');

  // Walk-in Patient Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'Unknown',
    phone: '',
    village: currentUser?.village || 'Gram Panchayat Center',
    abhaId: '',
    complaint: '',
    bpSys: '',
    bpDia: '',
    heartRate: '',
    spo2: '',
    temperature: ''
  });

  // Kiosk Registered Walk-in Patients Queue
  const [walkInQueue, setWalkInQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('arogya_kiosk_patients');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Prescriptions History Ledger
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('arogya_prescriptions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Emergency Doctor Appointments List
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('arogya_appointments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Fetch patients, prescriptions, and appointments from backend API on mount
  useEffect(() => {
    const fetchBackendData = async () => {
      // 1. Fetch Prescriptions
      try {
        const res = await fetch('http://localhost:5000/api/prescriptions');
        if (res.ok) {
          const data = await res.json();
          if (data.prescriptions && Array.isArray(data.prescriptions)) {
            const localSaved = JSON.parse(localStorage.getItem('arogya_prescriptions') || '[]');
            const ids = new Set(data.prescriptions.map(p => p._id || p.id));
            const merged = [...data.prescriptions];
            for (const item of localSaved) {
              const id = item._id || item.id;
              if (id && !ids.has(id)) {
                merged.push(item);
                ids.add(id);
              }
            }
            merged.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            setPrescriptions(merged);
            localStorage.setItem('arogya_prescriptions', JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.warn('[Kiosk fetch prescriptions notice]', err.message);
      }

      // 2. Fetch Kiosk Patients from DB
      try {
        const resPat = await fetch('http://localhost:5000/api/kiosk/patients');
        if (resPat.ok) {
          const patData = await resPat.json();
          if (patData.patients && Array.isArray(patData.patients)) {
            const localSavedPat = JSON.parse(localStorage.getItem('arogya_kiosk_patients') || '[]');
            const patIds = new Set(patData.patients.map(p => p._id || p.id || p.arogyaId));
            const mergedPat = patData.patients.map(p => ({
              ...p,
              id: p._id || p.id,
              relation: 'Walk-in Patient'
            }));
            for (const item of localSavedPat) {
              const id = item._id || item.id || item.arogyaId;
              if (id && !patIds.has(id)) {
                mergedPat.push(item);
                patIds.add(id);
              }
            }
            mergedPat.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            setWalkInQueue(mergedPat);
            localStorage.setItem('arogya_kiosk_patients', JSON.stringify(mergedPat));
          }
        }
      } catch (patErr) {
        console.warn('[Kiosk fetch patients notice]', patErr.message);
      }

      // 3. Fetch Emergency Doctor Appointments from DB
      try {
        const resApp = await fetch('http://localhost:5000/api/appointments');
        if (resApp.ok) {
          const appData = await resApp.json();
          if (appData.appointments && Array.isArray(appData.appointments)) {
            const localSavedApp = JSON.parse(localStorage.getItem('arogya_appointments') || '[]');
            const appIds = new Set(appData.appointments.map(a => a._id || a.id || a.tokenNo));
            const mergedApp = [...appData.appointments];
            for (const item of localSavedApp) {
              const id = item._id || item.id || item.tokenNo;
              if (id && !appIds.has(id)) {
                mergedApp.push(item);
                appIds.add(id);
              }
            }
            mergedApp.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            setAppointments(mergedApp);
            localStorage.setItem('arogya_appointments', JSON.stringify(mergedApp));
          }
        }
      } catch (appErr) {
        console.warn('[Kiosk fetch appointments notice]', appErr.message);
      }
    };
    fetchBackendData();
  }, []);

  // Save walkInQueue changes
  useEffect(() => {
    try {
      localStorage.setItem('arogya_kiosk_patients', JSON.stringify(walkInQueue));
    } catch (e) {}
  }, [walkInQueue]);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (formError) setFormError('');
  };

  const handleCopyId = (idText) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegisterAndTriage = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError(lang === 'mr' ? 'रुग्णाचे नाव भरणे आवश्यक आहे.' : 'Patient name is required.');
      return;
    }
    if (!formData.age || Number(formData.age) <= 0) {
      setFormError(lang === 'mr' ? 'कृपया योग्य वय टाका.' : 'Please enter valid age.');
      return;
    }

    // Phone is optional; if entered, must be 10 digits
    const cleanPhone = formData.phone ? formData.phone.trim().replace(/\D/g, '') : '';
    if (formData.phone.trim() && cleanPhone.length < 10) {
      setFormError(lang === 'mr' ? 'मोबाईल नंबर दिल्यास कृपया १० अंकी वैध नंबर टाका.' : 'Please enter valid 10-digit phone number if providing one.');
      return;
    }

    const patientCount = walkInQueue.length + 1;
    const generatedArogyaId = `AR-2026-PAT-${String(patientCount).padStart(3, '0')}`;
    const newId = 'pat_' + Date.now();

    let walkInPatient = {
      id: newId,
      _id: newId,
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      phone: cleanPhone,
      village: formData.village.trim() || currentUser?.village || 'Gram Panchayat Center',
      arogyaId: generatedArogyaId,
      abhaId: formData.abhaId?.trim() || generatedArogyaId,
      relation: 'Walk-in Patient',
      registeredVia: 'kiosk',
      complaint: formData.complaint.trim(),
      medicalHistory: formData.complaint.trim() ? [formData.complaint.trim()] : [],
      registeredAt: new Date().toISOString(),
      vitals: {
        bp: { 
          sys: Number(formData.bpSys) || 0, 
          dia: Number(formData.bpDia) || 0 
        },
        heartRate: Number(formData.heartRate) || 0,
        spo2: Number(formData.spo2) || 0,
        temperature: Number(formData.temperature) || 0,
        recordedAt: (formData.bpSys || formData.heartRate) ? new Date().toISOString() : null
      }
    };

    // Attempt backend persistence to MongoDB
    try {
      const res = await fetch('http://localhost:5000/api/kiosk/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: Number(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          phone: cleanPhone,
          village: formData.village.trim() || currentUser?.village || 'Gram Panchayat Center',
          abhaId: formData.abhaId?.trim() || '',
          complaint: formData.complaint.trim(),
          vitals: walkInPatient.vitals,
          kioskOperatorId: currentUser?._id || currentUser?.id || '',
          kioskOperatorName: currentUser?.name || 'Kiosk Operator',
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.patient) {
          walkInPatient = {
            ...walkInPatient,
            ...data.patient,
            id: data.patient._id || data.patient.id || walkInPatient.id,
            _id: data.patient._id || data.patient.id || walkInPatient._id,
            relation: 'Walk-in Patient',
          };
        }
      }
    } catch (apiErr) {
      console.warn('[Backend patient registration notice, using client persistence fallback]', apiErr);
    }

    // Update state and persistence
    const updatedQueue = [walkInPatient, ...walkInQueue];
    setWalkInQueue(updatedQueue);
    try {
      localStorage.setItem('arogya_kiosk_patients', JSON.stringify(updatedQueue));
      localStorage.setItem('arogya_active_member', JSON.stringify(walkInPatient));
      localStorage.setItem('arogya_active_member_id', walkInPatient.id);
      localStorage.setItem('arogya_active_kiosk_patient', JSON.stringify(walkInPatient));
      sessionStorage.setItem('activeKioskPatient', JSON.stringify(walkInPatient));
    } catch (e) {}

    // Reset Form to 100% blank
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'Unknown',
      phone: '',
      village: currentUser?.village || 'Gram Panchayat Center',
      abhaId: '',
      complaint: '',
      bpSys: '',
      bpDia: '',
      heartRate: '',
      spo2: '',
      temperature: ''
    });

    setSuccessToast(
      lang === 'mr' 
        ? `'${walkInPatient.name}' यांची नोंदणी झाली. लक्षण तपासणी विभागात नेले जात आहे...` 
        : `Patient registered. Redirecting to Symptom Checklist Triage...`
    );

    // Auto-redirect to Symptom Checklist Triage
    setTimeout(() => {
      if (onNavigateToTriage) {
        onNavigateToTriage(walkInPatient);
      }
    }, 600);
  };

  const handleDownloadPatientCard = async (patient) => {
    const pId = patient._id || patient.id;
    setDownloadingCardId(pId);
    try {
      const res = await fetch('http://localhost:5000/api/health-card/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patient.name,
          arogyaId: patient.arogyaId || patient.abhaId || 'AR-2026-PAT-001',
          age: patient.age,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
          village: patient.village,
          phone: patient.phone
        })
      });

      if (!res.ok) throw new Error('Health card PDF generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ArogyaRakshak_Card_${(patient.name || 'Patient').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Health card error]', err);
      alert(lang === 'mr' ? 'आरोग्य ओळखपत्र डाउनलोड करताना त्रुटी आली.' : 'Failed to download health card PDF.');
    } finally {
      setDownloadingCardId(null);
    }
  };

  // Filtered Prescriptions History
  const filteredPrescriptions = prescriptions.filter(p => {
    const pName = p.patientDetails?.name || p.name || '';
    const pPhone = p.patientDetails?.phone || p.phone || '';
    const pVillage = p.patientDetails?.village || p.village || '';
    const pId = p.patientDetails?.arogyaId || p.patientDetails?.abhaId || '';

    const matchesSearch = 
      pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pPhone.includes(searchQuery) ||
      pVillage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRisk === 'ALL') return true;
    const risk = (p.riskLevel || '').toUpperCase();
    if (filterRisk === 'LOW') return risk === 'LOW' || risk.includes('1') || risk.includes('MILD');
    if (filterRisk === 'MODERATE') return risk === 'MODERATE' || risk.includes('2');
    if (filterRisk === 'CRITICAL') return risk === 'CRITICAL' || risk.includes('3') || risk.includes('EMERGENCY');
    return true;
  });

  // Filtered Walk-in Patients for Kiosk Patient History
  const filteredWalkInPatients = walkInQueue.filter(patient => {
    const pName = patient.name || '';
    const pPhone = patient.phone || '';
    const pVillage = patient.village || '';
    const pId = patient.arogyaId || patient.abhaId || '';
    const pComplaint = patient.complaint || '';

    return (
      pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pPhone.includes(searchQuery) ||
      pVillage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pComplaint.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Stats calculation
  const totalPatientsCount = walkInQueue.length;
  const otcPrescriptionsCount = prescriptions.filter(p => (p.riskLevel || '').toUpperCase() === 'LOW' || (p.riskLevel || '').includes('1')).length;
  const criticalReferralsCount = prescriptions.filter(p => (p.riskLevel || '').toUpperCase() === 'CRITICAL' || (p.riskLevel || '').includes('3')).length;

  return (
    <div className="space-y-6 py-4 animate-fadeIn pb-16 text-deep-navy dark:text-clinical-white">
      
      {/* Kiosk Operator Header Banner */}
      <div className="glass-card p-6 sm:p-7 relative overflow-hidden border border-medical-blue/30 shadow-xl bg-gradient-to-r from-medical-blue/10 via-clinical-white/60 to-health-green/10 dark:from-medical-blue/20 dark:via-dark-base/70 dark:to-health-green/15 rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-medical-blue to-health-green text-white flex items-center justify-center shadow-lg shadow-medical-blue/20 shrink-0 ring-4 ring-white/50 dark:ring-white/10">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-medical-blue/20 text-medical-blue border border-medical-blue/30">
                  {lang === 'mr' ? 'ग्रामपंचायत कियोस्क केंद्र' : 'Gram Panchayat Digital Health Kiosk'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  Operator: <strong>{currentUser?.name || 'Authorized Operator'}</strong>
                </span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white tracking-tight mt-1">
                {lang === 'mr' ? 'ग्रामपंचायत रुग्ण नोंदणी व प्रिस्क्रिप्शन डेस्क' : 'Gram Panchayat Patient Registration & Triage Desk'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {lang === 'mr' ? 'केंद्र:' : 'Center:'} <strong>{currentUser?.village || 'Gram Panchayat Center'}</strong> • {lang === 'mr' ? 'येणाऱ्या रुग्णाची नोंदणी करा, लक्षणे तपासा व २ दिवसांचे औषध पत्रक तयार करा' : 'Register walk-in patients, triage symptoms & issue 2-day prescriptions'}
              </p>
            </div>
          </div>

          {/* Tab Navigation Pill Switcher */}
          <div className="flex items-center gap-2 bg-white/70 dark:bg-dark-base/80 p-1.5 rounded-2xl border border-deep-navy/15 dark:border-white/15 self-start md:self-auto shadow-sm">
            <button
              onClick={() => {
                setActiveTab('intake');
                setFormData({
                  name: '',
                  age: '',
                  gender: 'Male',
                  bloodGroup: 'Unknown',
                  phone: '',
                  village: currentUser?.village || 'Gram Panchayat Center',
                  complaint: '',
                  bpSys: '',
                  bpDia: '',
                  heartRate: '',
                  spo2: '',
                  temperature: ''
                });
                setFormError('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'intake'
                  ? 'btn-medical-blue text-white shadow-md'
                  : 'text-deep-navy dark:text-clinical-white hover:bg-medical-blue/10'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'mr' ? 'रुग्ण नोंदणी (Registration)' : lang === 'hi' ? 'रोगी पंजीकरण (Registration)' : 'Patient Registration'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'btn-medical-blue text-white shadow-md'
                  : 'text-deep-navy dark:text-clinical-white hover:bg-medical-blue/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'mr' ? 'रुग्ण व प्रिस्क्रिप्शन इतिहास' : lang === 'hi' ? 'मरीज़ व प्रिस्क्रिप्शन इतिहास' : 'Patient & Prescription History'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-medical-blue/20 text-medical-blue">
                {prescriptions.length}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Success / Error Alerts */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-health-green/15 border border-health-green/30 text-health-green flex items-center gap-3 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {formError && (
        <div className="p-4 rounded-2xl bg-alert-red/15 border border-alert-red/30 text-alert-red flex items-center gap-3 animate-fadeIn shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{formError}</span>
        </div>
      )}

      {/* TAB 1: WALK-IN PATIENT INTAKE FORM */}
      {activeTab === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Columns: Registration Intake Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-6 sm:p-8 space-y-6 border border-white/80 dark:border-white/10 shadow-xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-deep-navy/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-medical-blue text-white">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
                      {lang === 'mr' ? 'नवीन रुग्ण नोंदणी फॉर्म' : 'Walk-in Patient Registration'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'mr' ? 'माहिती भरून लगेच लक्षण तपासणी सुरू करा' : 'Fill details and immediately begin symptom evaluation'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-extrabold text-medical-blue px-3 py-1 rounded-xl bg-medical-blue/10 border border-medical-blue/20">
                  Patient #{walkInQueue.length + 1}
                </span>
              </div>

              <form onSubmit={handleRegisterAndTriage} className="space-y-5">
                
                {/* Personal Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                      {lang === 'mr' ? 'रुग्णाचे पूर्ण नाव *' : 'Patient Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. बबनराव लक्ष्मण शिंदे"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                      {lang === 'mr' ? 'मोबाईल नंबर (ऐच्छिक)' : 'Phone Number (Optional)'}
                    </label>
                    <input
                      type="tel"
                      placeholder={lang === 'mr' ? '98XXXXXXXX (ऐच्छिक)' : '98XXXXXXXX (Optional)'}
                      maxLength="10"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-mono font-semibold focus:outline-none focus:border-medical-blue"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                      {lang === 'mr' ? 'वय (वर्षे) *' : 'Age (Years) *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      required
                      placeholder="उदा. 45"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                      {lang === 'mr' ? 'लिंग *' : 'Gender *'}
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                    >
                      <option value="Male">{lang === 'mr' ? 'पुरुष (Male)' : 'Male'}</option>
                      <option value="Female">{lang === 'mr' ? 'महिला (Female)' : 'Female'}</option>
                      <option value="Other">{lang === 'mr' ? 'इतर (Other)' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                      {lang === 'mr' ? 'रक्तगट (Blood Group)' : 'Blood Group'}
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                    >
                      <option value="Unknown">माहिती नाही (Unknown)</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                      {lang === 'mr' ? 'गाव / वाडी / वॉर्ड' : 'Village / Ward'}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. पाऊड, सातारा"
                      value={formData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                      {lang === 'mr' ? 'आभा आयडी / ABHA ID (ऐच्छिक)' : 'ABHA ID (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'mr' ? 'उदा. 14-XXXX-XXXX-XXXX (ऐच्छिक)' : 'e.g. 14-XXXX-XXXX-XXXX (Optional)'}
                      value={formData.abhaId}
                      onChange={(e) => handleInputChange('abhaId', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-mono font-semibold focus:outline-none focus:border-medical-blue"
                    />
                  </div>
                </div>

                {/* Chief Complaints / Preliminary Notes */}
                <div>
                  <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                    {lang === 'mr' ? 'प्राथमिक तक्रार / आजाराची लक्षणे' : 'Chief Complaints / Illness Notes'}
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. २ दिवसांपासून ताप व खोकला, डोकेदुखी..."
                    value={formData.complaint}
                    onChange={(e) => handleInputChange('complaint', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                  />
                </div>

                {/* Quick Vitals Check (Optional) */}
                <div className="p-4 rounded-2xl bg-medical-blue/5 border border-medical-blue/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-medical-blue flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      <span>{lang === 'mr' ? 'कियोस्क प्राथमिक तपासणी (ऐच्छिक)' : 'Kiosk Vitals Check (Optional)'}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {lang === 'mr' ? 'उपलब्ध असल्यास नोंदवा' : 'Record if measured'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">BP Sys (mmHg)</label>
                      <input
                        type="number"
                        placeholder="120"
                        value={formData.bpSys}
                        onChange={(e) => handleInputChange('bpSys', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-deep-navy/15 dark:border-white/15 bg-white dark:bg-dark-base text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">BP Dia (mmHg)</label>
                      <input
                        type="number"
                        placeholder="80"
                        value={formData.bpDia}
                        onChange={(e) => handleInputChange('bpDia', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-deep-navy/15 dark:border-white/15 bg-white dark:bg-dark-base text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">Pulse (BPM)</label>
                      <input
                        type="number"
                        placeholder="72"
                        value={formData.heartRate}
                        onChange={(e) => handleInputChange('heartRate', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-deep-navy/15 dark:border-white/15 bg-white dark:bg-dark-base text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block">SpO2 (%)</label>
                      <input
                        type="number"
                        placeholder="98"
                        value={formData.spo2}
                        onChange={(e) => handleInputChange('spo2', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-deep-navy/15 dark:border-white/15 bg-white dark:bg-dark-base text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit & Clear Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 btn-medical-blue py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all scale-[1.01]"
                  >
                    <Stethoscope className="w-5 h-5" />
                    <span>
                      {lang === 'mr' 
                        ? 'रुग्ण सेव्ह करा व लक्षणे तपासा →' 
                        : 'Save Patient & Proceed to Symptoms →'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: '',
                        age: '',
                        gender: 'Male',
                        bloodGroup: 'Unknown',
                        phone: '',
                        village: currentUser?.village || 'Gram Panchayat Center',
                        complaint: '',
                        bpSys: '',
                        bpDia: '',
                        heartRate: '',
                        spo2: '',
                        temperature: ''
                      });
                      setFormError('');
                    }}
                    className="w-full sm:w-auto btn-glass py-3.5 px-4 text-xs font-bold text-slate-500 hover:text-deep-navy dark:hover:text-clinical-white"
                  >
                    {lang === 'mr' ? 'फॉर्म साफ करा' : 'Clear Form'}
                  </button>
                </div>

              </form>

            </div>
          </div>

          {/* Right 5 Columns: Kiosk Center Stats & Today's Live Patient Queue */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4 rounded-2xl border border-medical-blue/20 bg-medical-blue/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {lang === 'mr' ? 'एकूण रुग्ण नोंदणी' : 'Patients Registered'}
                </span>
                <span className="font-display font-extrabold text-2xl text-medical-blue mt-1 block">
                  {walkInQueue.length}
                </span>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-health-green/20 bg-health-green/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {lang === 'mr' ? 'तयार प्रिस्क्रिप्शन' : 'Prescriptions Issued'}
                </span>
                <span className="font-display font-extrabold text-2xl text-health-green mt-1 block">
                  {prescriptions.length}
                </span>
              </div>
            </div>

            {/* Today's Live Walk-In Queue */}
            <div className="glass-card p-5 sm:p-6 space-y-4 border border-white/80 dark:border-white/10 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-deep-navy/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-medical-blue" />
                  <h4 className="font-display font-bold text-sm text-deep-navy dark:text-clinical-white">
                    {lang === 'mr' ? 'आजची रुग्ण रांग (Today\'s Walk-in Queue)' : 'Today\'s Walk-in Queue'}
                  </h4>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {walkInQueue.length} {lang === 'mr' ? 'रुग्ण' : 'Patients'}
                </span>
              </div>

              {walkInQueue.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'mr' 
                      ? 'अद्याप कोणताही रुग्ण नोंदवलेला नाही. डावीकडील फॉर्म वापरून नोंदणी करा.' 
                      : 'No walk-in patients registered yet. Use the intake form to register.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1" data-lenis-prevent="true">
                  {walkInQueue.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-base/60 border border-deep-navy/10 hover:border-medical-blue transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-deep-navy dark:text-clinical-white">
                            {patient.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {patient.age} yrs • {patient.gender} • <strong className="text-alert-red">{patient.bloodGroup}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            try {
                              localStorage.setItem('arogya_active_member', JSON.stringify(patient));
                              localStorage.setItem('arogya_active_member_id', patient.id);
                            } catch (e) {}
                            if (onNavigateToTriage) onNavigateToTriage(patient);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-medical-blue text-white text-[11px] font-bold flex items-center gap-1 hover:bg-medical-blue/90 shadow-sm"
                          title="Start Symptom Triage"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>{lang === 'mr' ? 'तपासा' : 'Triage'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-deep-navy/10 dark:border-white/10 text-slate-500">
                        <span className="font-mono">{patient.arogyaId}</span>
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PATIENT & PRESCRIPTION HISTORY LEDGER */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-medical-blue/30 bg-gradient-to-br from-medical-blue/10 to-transparent">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {lang === 'mr' ? 'एकूण तपासलेले रुग्ण' : 'Total Consultations'}
              </span>
              <span className="font-display font-black text-3xl text-medical-blue mt-1 block">
                {prescriptions.length}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {lang === 'mr' ? 'सर्व नोंदी सुरक्षित स्टोअर आहेत' : 'Saved in Kiosk History'}
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-health-green/30 bg-gradient-to-br from-health-green/10 to-transparent">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {lang === 'mr' ? '२ दिवसांचे ओटीसी प्रिस्क्रिप्शन' : '2-Day OTC Prescriptions'}
              </span>
              <span className="font-display font-black text-3xl text-health-green mt-1 block">
                {otcPrescriptionsCount}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {lang === 'mr' ? 'सामान्य आजारांसाठी औषधे' : 'Mild self-limiting conditions'}
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-alert-red/30 bg-gradient-to-br from-alert-red/10 to-transparent">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {lang === 'mr' ? 'तातडीचे डॉक्टर रेफरल' : 'Doctor / PHC Referrals'}
              </span>
              <span className="font-display font-black text-3xl text-alert-red mt-1 block">
                {criticalReferralsCount}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {lang === 'mr' ? 'मध्यम व आणीबाणी केसेस' : 'Moderate & Critical cases'}
              </span>
            </div>
          </div>

          {/* Sub-tab view switcher */}
          <div className="flex items-center gap-2 border-b border-deep-navy/10 dark:border-white/10 pb-2">
            <button
              onClick={() => setHistorySubTab('patients')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                historySubTab === 'patients'
                  ? 'btn-medical-blue text-white shadow-md'
                  : 'text-deep-navy dark:text-clinical-white hover:bg-medical-blue/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{lang === 'mr' ? 'नोंदणीकृत रुग्ण यादी' : 'Registered Patients'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
                {walkInQueue.length}
              </span>
            </button>

            <button
              onClick={() => setHistorySubTab('prescriptions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                historySubTab === 'prescriptions'
                  ? 'btn-medical-blue text-white shadow-md'
                  : 'text-deep-navy dark:text-clinical-white hover:bg-medical-blue/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'mr' ? 'सर्व प्रिस्क्रिप्शन नोंदी' : 'All Prescriptions'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
                {prescriptions.length}
              </span>
            </button>

            <button
              onClick={() => setHistorySubTab('appointments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                historySubTab === 'appointments'
                  ? 'btn-medical-blue text-white shadow-md'
                  : 'text-deep-navy dark:text-clinical-white hover:bg-medical-blue/10'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{lang === 'mr' ? 'आपत्कालीन अपॉइंटमेंट्स' : 'Doctor Appointments'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
                {appointments.length}
              </span>
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="glass-card p-4 rounded-2xl border border-deep-navy/15 dark:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'mr' ? 'रुग्णाचे नाव, फोन किंवा आयडीने शोधा...' : 'Search by patient name, phone, or ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-navy/15 dark:border-white/15 text-xs font-semibold focus:outline-none focus:border-medical-blue"
              />
            </div>

            {/* Filter by Risk Level (Only active for prescriptions view) */}
            {historySubTab === 'prescriptions' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{lang === 'mr' ? 'प्रकार:' : 'Filter:'}</span>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-dark-base border border-deep-navy/15 dark:border-white/15 text-xs font-bold focus:outline-none focus:border-medical-blue"
                >
                  <option value="ALL">{lang === 'mr' ? 'सर्व केसेस (All)' : 'All Records'}</option>
                  <option value="LOW">{lang === 'mr' ? 'लेव्हल १ (२-दिवस ओटीसी)' : 'Level 1 (2-Day OTC)'}</option>
                  <option value="MODERATE">{lang === 'mr' ? 'लेव्हल २ (मध्यम तपासणी)' : 'Level 2 (Moderate)'}</option>
                  <option value="CRITICAL">{lang === 'mr' ? 'लेव्हल ३ (आणीबाणी SOS)' : 'Level 3 (Critical SOS)'}</option>
                </select>
              </div>
            )}
          </div>

          {/* SUB-VIEW 1: REGISTERED PATIENTS LIST */}
          {historySubTab === 'patients' && (
            filteredWalkInPatients.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-3xl space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
                  {lang === 'mr' ? 'कोणताही रुग्ण सापडला नाही' : 'No Patients Found'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === 'mr'
                    ? 'नवीन रुग्णाची नोंदणी करा; नोंदणी केलेले सर्व रुग्ण येथे दिसतील.'
                    : 'Register walk-in patients to view their profiles and prescription history here.'}
                </p>
                <button
                  onClick={() => setActiveTab('intake')}
                  className="btn-medical-blue text-xs py-2 px-4 inline-flex items-center gap-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'नवीन रुग्ण नोंदणी करा' : 'Start Patient Intake'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWalkInPatients.map((patient) => {
                  const patId = patient._id || patient.id;
                  const patArogya = patient.arogyaId || patient.abhaId || 'AR-2026-PAT-001';
                  
                  // Find all prescriptions for this patient
                  const patientPrescriptions = prescriptions.filter(rx => 
                    rx.familyMemberId === patId ||
                    rx.userId === patId ||
                    rx.patientDetails?.arogyaId === patArogya ||
                    (rx.patientDetails?.name && rx.patientDetails.name.toLowerCase() === (patient.name || '').toLowerCase())
                  );

                  // Find all emergency appointments for this patient
                  const patientAppointments = appointments.filter(app =>
                    app.patientId === patId ||
                    app.arogyaId === patArogya ||
                    (app.patientName && app.patientName.toLowerCase() === (patient.name || '').toLowerCase())
                  );

                  return (
                    <div
                      key={patId}
                      className="glass-card p-5 sm:p-6 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg space-y-4 hover:border-medical-blue/40 transition-all text-left"
                    >
                      {/* Patient Row Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deep-navy/10 dark:border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-medical-blue to-teal-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                            {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-extrabold text-base sm:text-lg text-deep-navy dark:text-clinical-white">
                                {patient.name}
                              </h4>
                              <span className="font-mono text-xs font-bold text-medical-blue bg-medical-blue/10 px-2.5 py-0.5 rounded-lg border border-medical-blue/20">
                                {patArogya}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {patient.age} yrs • {patient.gender} • Blood: <strong className="text-alert-red">{patient.bloodGroup || 'Unknown'}</strong> • {patient.village || 'Gram Panchayat'} {patient.phone ? `• Ph: ${patient.phone}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            onClick={() => handleDownloadPatientCard(patient)}
                            disabled={downloadingCardId === patId}
                            className="btn-glass text-xs py-1.5 px-3 flex items-center gap-1.5"
                            title="Download Health Card PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-medical-blue" />
                            <span>{lang === 'mr' ? 'हेल्थ कार्ड' : 'Health Card'}</span>
                          </button>

                          <button
                            onClick={() => {
                              try {
                                localStorage.setItem('arogya_active_member', JSON.stringify(patient));
                                localStorage.setItem('arogya_active_member_id', patId);
                                localStorage.setItem('arogya_active_kiosk_patient', JSON.stringify(patient));
                                sessionStorage.setItem('activeKioskPatient', JSON.stringify(patient));
                              } catch (e) {}
                              if (onNavigateToTriage) onNavigateToTriage(patient);
                            }}
                            className="btn-medical-blue text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                            title="Start Symptom Triage"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{lang === 'mr' ? 'लक्षणे तपासा' : 'Triage Symptoms'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Complaint & Vitals summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-deep-navy/5 dark:bg-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            {lang === 'mr' ? 'नोंदणी तारीख व तक्रार:' : 'Registered & Chief Complaint:'}
                          </span>
                          <p className="font-semibold text-deep-navy dark:text-clinical-white">
                            {patient.complaint || 'सामान्य तपासणी (Routine Checkup)'}
                          </p>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(patient.createdAt || patient.registeredAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-deep-navy/5 dark:bg-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            {lang === 'mr' ? 'नोंदवलेली जीवनचिन्हे (Vitals):' : 'Recorded Vitals:'}
                          </span>
                          <div className="flex flex-wrap gap-2 pt-0.5">
                            <span className="px-2 py-0.5 rounded-lg bg-medical-blue/10 text-medical-blue font-mono font-bold text-[11px]">
                              BP: {patient.vitals?.bp?.sys || patient.vitals?.bpSys || '--'}/{patient.vitals?.bp?.dia || patient.vitals?.bpDia || '--'}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-health-green/10 text-health-green font-mono font-bold text-[11px]">
                              HR: {patient.vitals?.heartRate || '--'} bpm
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-caution-amber/10 text-caution-amber font-mono font-bold text-[11px]">
                              SpO2: {patient.vitals?.spo2 || '--'}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Prescriptions issued to this patient */}
                      <div className="space-y-2 pt-2 border-t border-deep-navy/10 dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-deep-navy dark:text-clinical-white flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-medical-blue" />
                            <span>{lang === 'mr' ? 'या रुग्णाचे प्रिस्क्रिप्शन रेकॉर्ड्स:' : 'Prescription Records for this Patient:'}</span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {patientPrescriptions.length} {lang === 'mr' ? 'प्रिस्क्रिप्शन' : 'Prescriptions'}
                          </span>
                        </div>

                        {patientPrescriptions.length === 0 ? (
                          <div className="p-3 rounded-xl bg-deep-navy/5 dark:bg-white/5 text-xs text-slate-500 italic">
                            {lang === 'mr' ? 'अद्याप कोणतेही प्रिस्क्रिप्शन दिलेले नाही. वरील "लक्षणे तपासा" बटणावर क्लिक करून ट्रायज सुरू करा.' : 'No prescriptions issued yet. Click "Triage Symptoms" above to evaluate.'}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {patientPrescriptions.map((rx) => {
                              const rxId = rx._id || rx.id;
                              const isCrit = (rx.riskLevel || '').toUpperCase() === 'CRITICAL';
                              return (
                                <div
                                  key={rxId}
                                  className="p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        isCrit ? 'bg-alert-red text-white' : 'bg-health-green/20 text-health-green'
                                      }`}>
                                        {rx.riskLevel || 'LOW'}
                                      </span>
                                      <span className="font-mono text-xs text-slate-500">{rxId}</span>
                                      <span className="text-xs text-slate-400">
                                        • {new Date(rx.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                    <p className="text-xs font-bold text-deep-navy dark:text-clinical-white">
                                      {rx.diagnosisSummary || 'Clinical Triage Evaluation'}
                                    </p>
                                  </div>

                                  <a
                                    href={`http://localhost:5000/api/prescriptions/${rxId}/pdf`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-medical-blue text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{lang === 'mr' ? 'Download Rx PDF' : 'Download Rx PDF'}</span>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Emergency Doctor Appointments for this patient */}
                      {patientAppointments.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-deep-navy/10 dark:border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-alert-red flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{lang === 'mr' ? 'बुक केलेल्या आपत्कालीन डॉक्टर अपॉइंटमेंट्स:' : 'Emergency Doctor Appointments:'}</span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {patientAppointments.length} {lang === 'mr' ? 'अपॉइंटमेंट' : 'Appointments'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {patientAppointments.map((app) => (
                              <div
                                key={app._id || app.id || app.tokenNo}
                                className="p-3 rounded-2xl bg-alert-red/5 border border-alert-red/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-alert-red text-white">
                                      {app.tokenNo}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-health-green/20 text-health-green">
                                      {app.status?.toUpperCase() || 'REQUESTED'}
                                    </span>
                                    <span className="text-slate-400">
                                      • {new Date(app.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <div className="font-bold text-deep-navy dark:text-clinical-white">
                                    {app.doctorName} <span className="text-medical-blue font-semibold">({app.specialty})</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{app.hospitalName}</span>
                                    <span>•</span>
                                    <span className="text-alert-red font-semibold">{app.requestedTime}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* SUB-VIEW 2: ALL PRESCRIPTIONS LEDGER */}
          {historySubTab === 'prescriptions' && (
            filteredPrescriptions.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-3xl space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
                  {lang === 'mr' ? 'कोणताही प्रिस्क्रिप्शन रेकॉर्ड सापडला नाही' : 'No Prescription Records Found'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === 'mr'
                    ? 'नवीन रुग्णाची नोंदणी करा आणि लक्षण चाचणी पूर्ण केल्यावर प्रिस्क्रिप्शन येथे ऑटोमॅटिक स्टोअर होईल.'
                    : 'Register a walk-in patient and complete the symptom checklist to generate and record prescriptions here.'}
                </p>
                <button
                  onClick={() => setActiveTab('intake')}
                  className="btn-medical-blue text-xs py-2 px-4 inline-flex items-center gap-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'नवीन रुग्ण नोंदणी करा' : 'Start New Patient Intake'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPrescriptions.map((presc) => {
                  const prescId = presc._id || presc.id;
                  const patient = presc.patientDetails || {};
                  const isCritical = (presc.riskLevel || '').toUpperCase() === 'CRITICAL' || (presc.riskLevel || '').includes('3');
                  const isModerate = (presc.riskLevel || '').toUpperCase() === 'MODERATE' || (presc.riskLevel || '').includes('2');
                  const pArogya = patient.arogyaId || patient.abhaId || 'AR-2026-PAT-001';

                  return (
                    <div
                      key={prescId}
                      className="glass-card p-5 sm:p-6 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg space-y-4 hover:border-medical-blue/50 transition-all text-left flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        
                        {/* Card Header: Patient Identity & Triage Badge */}
                        <div className="flex items-start justify-between gap-3 border-b border-deep-navy/10 dark:border-white/10 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-extrabold text-base sm:text-lg text-deep-navy dark:text-clinical-white">
                                {patient.name || presc.patientName || 'Walk-in Patient'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {patient.age ? `${patient.age} yrs` : ''} {patient.gender ? `• ${patient.gender}` : ''} {patient.bloodGroup ? `• Blood: ${patient.bloodGroup}` : ''}
                              {patient.village ? ` • ${patient.village}` : ''}
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                            isCritical
                              ? 'bg-alert-red text-white border-alert-red animate-pulse'
                              : isModerate
                              ? 'bg-caution-amber/25 text-deep-navy dark:text-caution-amber border-caution-amber/40'
                              : 'bg-health-green/20 text-health-green border-health-green/30'
                          }`}>
                            {isCritical 
                              ? (lang === 'mr' ? 'आणीबाणी रेफरल' : 'Critical SOS') 
                              : isModerate 
                              ? (lang === 'mr' ? 'मध्यम तपासणी' : 'Doctor Consult') 
                              : (lang === 'mr' ? '२-दिवस ओटीसी' : '2-Day OTC')}
                          </span>
                        </div>

                        {/* ArogyaRakshak ID and Timestamp */}
                        <div className="flex items-center justify-between text-[11px] bg-deep-navy/5 dark:bg-white/5 p-2 rounded-xl">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-medical-blue">
                            <span>{pArogya}</span>
                            <button
                              onClick={() => handleCopyId(pArogya)}
                              className="text-slate-400 hover:text-medical-blue"
                              title="Copy ID"
                            >
                              {copiedId === pArogya ? <Check className="w-3 h-3 text-health-green" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(presc.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Diagnosis / Symptoms Summary */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            {lang === 'mr' ? 'निदान / लक्षणे:' : 'Diagnosis / Symptoms:'}
                          </span>
                          <p className="text-xs font-semibold text-deep-navy dark:text-clinical-white leading-relaxed">
                            {presc.diagnosisSummary || 'General Health Triage Assessment'}
                          </p>
                        </div>

                        {/* Prescribed Medicines Pills */}
                        {presc.medicines && presc.medicines.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              {lang === 'mr' ? '२ दिवसांची औषधे (Medicines):' : 'Prescribed Medicines (2 Days):'}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {presc.medicines.map((med, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-medical-blue/10 text-medical-blue dark:bg-medical-blue/20 dark:text-soft-cyan border border-medical-blue/20"
                                >
                                  💊 {med.nameLocal || med.name} ({med.dosage || '1 Tab'})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="pt-3 border-t border-deep-navy/10 dark:border-white/10 flex items-center justify-between gap-2 mt-4">
                        
                        {/* Download Official Prescription PDF */}
                        <a
                          href={`http://localhost:5000/api/prescriptions/${prescId}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 btn-medical-blue text-xs py-2 px-3 flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{lang === 'mr' ? 'प्रिस्क्रिप्शन PDF' : 'Download Rx PDF'}</span>
                        </a>

                        {/* Download Health Card PDF for patient */}
                        <button
                          onClick={() => handleDownloadPatientCard(patient)}
                          disabled={downloadingCardId === prescId}
                          className="btn-glass text-xs py-2 px-3 flex items-center justify-center gap-1.5"
                          title="Download Health Card PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-medical-blue" />
                          <span>{lang === 'mr' ? 'हेल्थ कार्ड' : 'Health Card'}</span>
                        </button>

                        {/* Re-Triage Patient */}
                        <button
                          onClick={() => {
                            const reTriagePatient = {
                              id: presc.familyMemberId || 'pat_' + Date.now(),
                              name: patient.name || 'Patient',
                              age: patient.age,
                              gender: patient.gender,
                              bloodGroup: patient.bloodGroup,
                              phone: patient.phone,
                              village: patient.village,
                              arogyaId: pArogya,
                              relation: 'Walk-in Patient'
                            };
                            try {
                              localStorage.setItem('arogya_active_member', JSON.stringify(reTriagePatient));
                              localStorage.setItem('arogya_active_kiosk_patient', JSON.stringify(reTriagePatient));
                              sessionStorage.setItem('activeKioskPatient', JSON.stringify(reTriagePatient));
                            } catch (e) {}
                            if (onNavigateToTriage) onNavigateToTriage(reTriagePatient);
                          }}
                          className="p-2 rounded-xl bg-deep-navy/10 hover:bg-deep-navy/20 dark:bg-white/10 text-deep-navy dark:text-clinical-white transition-all"
                          title={lang === 'mr' ? 'पुन्हा तपासणी करा' : 'Re-triage Patient'}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* SUB-VIEW 3: EMERGENCY DOCTOR APPOINTMENTS LEDGER */}
          {historySubTab === 'appointments' && (
            (() => {
              const filteredAppointments = appointments.filter(a => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  (a.patientName && a.patientName.toLowerCase().includes(q)) ||
                  (a.doctorName && a.doctorName.toLowerCase().includes(q)) ||
                  (a.hospitalName && a.hospitalName.toLowerCase().includes(q)) ||
                  (a.tokenNo && a.tokenNo.toLowerCase().includes(q)) ||
                  (a.arogyaId && a.arogyaId.toLowerCase().includes(q)) ||
                  (a.phone && a.phone.includes(q))
                );
              });

              if (filteredAppointments.length === 0) {
                return (
                  <div className="glass-card p-12 text-center rounded-3xl space-y-3">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
                      {lang === 'mr' ? 'कोणतीही अपॉइंटमेंट सापडली नाही' : 'No Appointments Found'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      {lang === 'mr'
                        ? 'आणीबाणी किंवा गंभीर लक्षणे असलेल्या रुग्णांसाठी बुक केलेल्या अपॉइंटमेंट्स येथे दिसतील.'
                        : 'Doctor appointment requests generated from critical triage results will appear here.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filteredAppointments.map((app) => (
                    <div
                      key={app._id || app.id || app.tokenNo}
                      className="glass-card p-5 rounded-2xl border border-alert-red/25 bg-white/70 dark:bg-dark-base/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-alert-red text-white">
                            {app.tokenNo}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-health-green/20 text-health-green">
                            {app.status?.toUpperCase() || 'REQUESTED'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(app.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{lang === 'mr' ? 'रुग्ण:' : 'Patient:'}</span>
                          <strong className="text-sm text-deep-navy dark:text-clinical-white">{app.patientName}</strong>
                          {app.age ? <span className="text-xs text-slate-500">({app.age} yrs • {app.gender})</span> : null}
                          {app.arogyaId ? (
                            <span className="font-mono text-[11px] text-medical-blue font-bold">
                              {app.arogyaId}
                            </span>
                          ) : null}
                        </div>

                        <div className="text-xs text-deep-navy dark:text-clinical-white font-medium flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500">{lang === 'mr' ? 'डॉक्टर:' : 'Doctor:'}</span>
                          <strong className="text-medical-blue">{app.doctorName}</strong>
                          <span>({app.specialty})</span>
                          <span>•</span>
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.hospitalName}</span>
                        </div>

                        {app.triageSummary && (
                          <div className="text-[11px] text-slate-500 italic">
                            {app.triageSummary}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                        <div className="px-3 py-1.5 rounded-xl bg-alert-red/10 text-alert-red font-bold text-xs">
                          {app.requestedTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}

        </div>
      )}

    </div>
  );
}
