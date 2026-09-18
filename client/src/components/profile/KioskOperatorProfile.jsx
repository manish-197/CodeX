import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Edit3, 
  CheckCircle2, 
  Users, 
  FileText, 
  Calendar, 
  Activity, 
  ArrowRight,
  X,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../auth/AuthContext';

export default function KioskOperatorProfile({ onNavigate, onLogout }) {
  const { lang, t } = useLanguage();
  const { currentUser, token, updateUser, logout } = useAuth();

  // Statistics State
  const [stats, setStats] = useState({
    patientsCount: 0,
    prescriptionsCount: 0,
    appointmentsCount: 0,
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    emergencyPhone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState('');
  const [saveError, setSaveError] = useState('');

  // Load stats from localStorage and backend
  useEffect(() => {
    try {
      const savedPatients = JSON.parse(localStorage.getItem('arogya_kiosk_patients') || '[]');
      const savedPrescriptions = JSON.parse(localStorage.getItem('arogya_prescriptions') || '[]');
      const savedAppointments = JSON.parse(localStorage.getItem('arogya_appointments') || '[]');

      setStats({
        patientsCount: Array.isArray(savedPatients) ? savedPatients.length : 0,
        prescriptionsCount: Array.isArray(savedPrescriptions) ? savedPrescriptions.length : 0,
        appointmentsCount: Array.isArray(savedAppointments) ? savedAppointments.length : 0,
      });
    } catch (e) {}

    // Also fetch live counts from APIs
    const fetchLiveCounts = async () => {
      try {
        const [patRes, rxRes, appRes] = await Promise.allSettled([
          fetch('http://localhost:5000/api/kiosk/patients'),
          fetch('http://localhost:5000/api/prescriptions'),
          fetch('http://localhost:5000/api/appointments')
        ]);

        let pCount = 0;
        let rCount = 0;
        let aCount = 0;

        if (patRes.status === 'fulfilled' && patRes.value.ok) {
          const d = await patRes.value.json();
          if (d.patients) pCount = d.patients.length;
        }
        if (rxRes.status === 'fulfilled' && rxRes.value.ok) {
          const d = await rxRes.value.json();
          if (d.prescriptions) rCount = d.prescriptions.length;
        }
        if (appRes.status === 'fulfilled' && appRes.value.ok) {
          const d = await appRes.value.json();
          if (d.appointments) aCount = d.appointments.length;
        }

        setStats(prev => ({
          patientsCount: Math.max(prev.patientsCount, pCount),
          prescriptionsCount: Math.max(prev.prescriptionsCount, rCount),
          appointmentsCount: Math.max(prev.appointmentsCount, aCount),
        }));
      } catch (err) {
        console.warn('[Profile stats notice]', err.message);
      }
    };

    fetchLiveCounts();
  }, []);

  // Hydrate edit form when modal opens
  const openEditModal = () => {
    setEditFormData({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      village: currentUser?.village || '',
      district: currentUser?.district || 'Pune',
      state: currentUser?.state || 'Maharashtra',
      emergencyPhone: currentUser?.emergencyContact?.phone || ''
    });
    setSaveError('');
    setIsEditModalOpen(true);
  };

  // Submit profile edits to MongoDB via PUT /api/auth/profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      setSaveError(lang === 'mr' ? 'नाव भरणे आवश्यक आहे.' : 'Name is required.');
      return;
    }
    if (editFormData.phone && editFormData.phone.replace(/\D/g, '').length < 10) {
      setSaveError(lang === 'mr' ? 'कृपया १० अंकी वैध संपर्क नंबर टाका.' : 'Please enter valid 10-digit phone number.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          phone: editFormData.phone.trim(),
          village: editFormData.village.trim(),
          district: editFormData.district.trim(),
          state: editFormData.state.trim(),
          emergencyContact: {
            phone: editFormData.emergencyPhone.trim(),
            relation: 'Gram Panchayat Office'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          updateUser(data.user);
        }
        setSaveSuccessToast(
          lang === 'mr' ? 'ऑपरेटर प्रोफाइल यशस्वीरीत्या अपडेट झाले!' : 'Operator profile updated successfully!'
        );
        setIsEditModalOpen(false);
        setTimeout(() => setSaveSuccessToast(''), 3500);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update profile');
      }
    } catch (err) {
      console.warn('[Profile update notice, saving locally]', err.message);
      const updatedLocal = {
        ...currentUser,
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        village: editFormData.village.trim(),
        district: editFormData.district.trim(),
        state: editFormData.state.trim()
      };
      updateUser(updatedLocal);
      setSaveSuccessToast(
        lang === 'mr' ? 'प्रोफाइल अपडेट झाले (Local).' : 'Profile updated locally.'
      );
      setIsEditModalOpen(false);
      setTimeout(() => setSaveSuccessToast(''), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      if (onNavigate) onNavigate('home');
    }
  };

  const opName = currentUser?.name || 'Gram Panchayat Operator';
  const opArogyaId = currentUser?.arogyaId || currentUser?.abhaId || currentUser?.kioskId || 'AR-2026-GP-001';
  const opVillage = currentUser?.village || 'Gram Panchayat Kendra';
  const opPhone = currentUser?.phone || 'Not Specified';
  const opEmail = currentUser?.email || 'kiosk.operator@arogyarakshak.gov.in';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fadeIn text-deep-navy dark:text-clinical-white">
      
      {/* Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-health-green text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/80 dark:border-white/10 shadow-xl relative overflow-hidden text-left bg-gradient-to-br from-white/90 via-medical-blue/5 to-teal-500/10 dark:from-dark-card/90 dark:to-medical-blue/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-medical-blue to-teal-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg ring-4 ring-medical-blue/20 shrink-0">
              {opName.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-medical-blue/15 text-medical-blue border border-medical-blue/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'ग्रामपंचायत आरोग्य केंद्र चालक' : 'Gram Panchayat Kiosk Operator'}</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white tracking-tight">
                {opName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-semibold flex-wrap">
                <span className="font-mono text-medical-blue font-bold bg-medical-blue/10 px-2.5 py-0.5 rounded-lg border border-medical-blue/20">
                  ID: {opArogyaId}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-alert-red" />
                  <span>{opVillage}</span>
                </span>
                <span className="flex items-center gap-1 text-health-green font-bold">
                  <span className="w-2 h-2 rounded-full bg-health-green animate-ping" />
                  <span>{lang === 'mr' ? 'प्रमाणित ऑपरेटर' : 'Verified Operator'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={openEditModal}
              className="btn-medical-blue text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'प्रोफाइल संपादित करा' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={handleLogoutClick}
              className="btn-glass text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 text-alert-red border-alert-red/30 hover:bg-alert-red/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'लॉग आउट' : 'Sign Out'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Operator Live Performance Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        
        <div className="glass-card p-5 rounded-3xl border border-medical-blue/30 bg-gradient-to-br from-medical-blue/10 to-transparent shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === 'mr' ? 'एकूण रुग्ण नोंदणी' : 'Patients Registered'}
            </span>
            <div className="p-2 rounded-xl bg-medical-blue/15 text-medical-blue">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-3xl text-medical-blue">
            {stats.patientsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {lang === 'mr' ? 'केंद्रावर नोंदवलेले walk-in रुग्ण' : 'Walk-in patients registered at kiosk'}
          </span>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-health-green/30 bg-gradient-to-br from-health-green/10 to-transparent shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === 'mr' ? 'तयार प्रिस्क्रिप्शन्स' : 'Prescriptions Issued'}
            </span>
            <div className="p-2 rounded-xl bg-health-green/15 text-health-green">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-3xl text-health-green">
            {stats.prescriptionsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {lang === 'mr' ? '२-दिवसीय प्राथमिक तपासणी प्रिस्क्रिप्शन्स' : '2-Day OTC Preliminary prescriptions'}
          </span>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-alert-red/30 bg-gradient-to-br from-alert-red/10 to-transparent shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === 'mr' ? 'आपत्कालीन डॉक्टर अपॉइंटमेंट्स' : 'Emergency Appointments'}
            </span>
            <div className="p-2 rounded-xl bg-alert-red/15 text-alert-red">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-black text-3xl text-alert-red">
            {stats.appointmentsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {lang === 'mr' ? 'रुग्णालयाला पाठवलेल्या आपत्कालीन केसेस' : 'Critical referrals dispatched to hospital'}
          </span>
        </div>

      </div>

      {/* Operator Details & Assigned Kendra Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Card 1: Official Profile Details */}
        <div className="glass-card p-6 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
            <User className="w-4 h-4 text-medical-blue" />
            <h3 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
              {lang === 'mr' ? 'ऑपरेटर अधिकृत माहिती' : 'Operator Official Information'}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'पूर्ण नाव:' : 'Full Name:'}</span>
              <strong className="text-deep-navy dark:text-clinical-white">{opName}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'ऑपरेटर आयडी:' : 'Operator ID:'}</span>
              <strong className="font-mono text-medical-blue font-bold">{opArogyaId}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'संपर्क मोबाईल नंबर:' : 'Contact Phone:'}</span>
              <strong className="font-mono text-deep-navy dark:text-clinical-white">{opPhone}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'ईमेल पत्ता:' : 'Email Address:'}</span>
              <strong className="text-deep-navy dark:text-clinical-white truncate max-w-[200px]">{opEmail}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'भूमिका (Role):' : 'System Role:'}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-medical-blue/15 text-medical-blue">
                Gram Panchayat Kiosk Operator
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Assigned Gram Panchayat Center Details */}
        <div className="glass-card p-6 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h3 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
              {lang === 'mr' ? 'आरोग्य केंद्र व अधिकार क्षेत्र' : 'Assigned Health Center & Jurisdiction'}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'ग्रामपंचायत गाव:' : 'Gram Panchayat Village:'}</span>
              <strong className="text-deep-navy dark:text-clinical-white">{opVillage}</strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'जिल्हा व राज्य:' : 'District & State:'}</span>
              <strong className="text-deep-navy dark:text-clinical-white">
                {currentUser?.district || 'Pune'}, {currentUser?.state || 'Maharashtra'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'कियोस्क टर्मिनल कोड:' : 'Terminal Code:'}</span>
              <strong className="font-mono text-medical-blue font-bold">
                {currentUser?.kioskId || 'KIOSK-GP-001'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'डिव्हाइस हार्डवेअर:' : 'Hardware Terminal:'}</span>
              <span className="text-health-green font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active & Synced</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-dark-base/70 border border-deep-navy/10 dark:border-white/10">
              <span className="text-slate-500 font-medium">{lang === 'mr' ? 'सपोर्ट डेस्क:' : 'Toll-Free Support:'}</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                1800-233-0108
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Navigation Action Cards */}
      <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-white/10 shadow-lg text-left space-y-4">
        <h4 className="font-display font-bold text-sm text-deep-navy dark:text-clinical-white">
          {lang === 'mr' ? 'कियोस्क जलद कृती (Quick Actions)' : 'Kiosk Quick Actions'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate && onNavigate('hub')}
            className="p-4 rounded-2xl bg-medical-blue/10 hover:bg-medical-blue/20 border border-medical-blue/25 transition-all text-left space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-medical-blue">
                {lang === 'mr' ? 'रुग्ण नोंदणी डेस्क' : 'Patient Registration Desk'}
              </span>
              <ArrowRight className="w-4 h-4 text-medical-blue group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {lang === 'mr' ? 'नवीन येणाऱ्या walk-in रुग्णाची नोंदणी करा.' : 'Register incoming walk-in patients.'}
            </p>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('hub')}
            className="p-4 rounded-2xl bg-health-green/10 hover:bg-health-green/20 border border-health-green/25 transition-all text-left space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-health-green">
                {lang === 'mr' ? 'रुग्ण व प्रिस्क्रिप्शन इतिहास' : 'Patient & Rx History'}
              </span>
              <ArrowRight className="w-4 h-4 text-health-green group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {lang === 'mr' ? 'नोंदणी केलेले रुग्ण व जुनी प्रिस्क्रिप्शन्स पहा.' : 'View past consults and Rx records.'}
            </p>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('navigation')}
            className="p-4 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 transition-all text-left space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-teal-700 dark:text-teal-400">
                {lang === 'mr' ? 'रुग्णालय नेव्हिगेशन' : 'Hospital Road Route'}
              </span>
              <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {lang === 'mr' ? 'जवळच्या ग्रामीण/जिल्हा रुग्णालयाचा मार्ग.' : 'Emergency road routing to nearest PHC/DH.'}
            </p>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-navy/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl space-y-5 bg-white dark:bg-dark-card text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-deep-navy/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-medical-blue/15 text-medical-blue">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white">
                  {lang === 'mr' ? 'ऑपरेटर प्रोफाइल संपादित करा' : 'Edit Operator Profile'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-deep-navy/10 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-alert-red/10 border border-alert-red/30 text-alert-red text-xs font-semibold">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-deep-navy dark:text-clinical-white block mb-1">
                  {lang === 'mr' ? 'ऑपरेटरचे पूर्ण नाव *' : 'Operator Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                />
              </div>

              <div>
                <label className="font-bold text-deep-navy dark:text-clinical-white block mb-1">
                  {lang === 'mr' ? 'संपर्क मोबाईल नंबर' : 'Contact Phone Number'}
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="98XXXXXXXX"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-mono font-semibold focus:outline-none focus:border-medical-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-deep-navy dark:text-clinical-white block mb-1">
                    {lang === 'mr' ? 'गाव / ग्रामपंचायत' : 'Village / Panchayat'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.village}
                    onChange={(e) => setEditFormData({ ...editFormData, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                  />
                </div>

                <div>
                  <label className="font-bold text-deep-navy dark:text-clinical-white block mb-1">
                    {lang === 'mr' ? 'जिल्हा' : 'District'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-deep-navy dark:text-clinical-white block mb-1">
                  {lang === 'mr' ? 'ग्रामपंचायत कार्यालय संपर्क' : 'Gram Panchayat Office Emergency Phone'}
                </label>
                <input
                  type="tel"
                  placeholder="020-XXXXXXX or Mobile"
                  value={editFormData.emergencyPhone}
                  onChange={(e) => setEditFormData({ ...editFormData, emergencyPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/80 dark:bg-dark-base/80 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-deep-navy/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-glass text-xs py-2.5 px-4 font-semibold"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-medical-blue text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isSaving ? (lang === 'mr' ? 'जतन करत आहे...' : 'Saving...') : (lang === 'mr' ? 'बदल जतन करा' : 'Save Changes')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
