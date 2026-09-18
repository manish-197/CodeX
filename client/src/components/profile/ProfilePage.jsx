import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  Heart, 
  Download, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Users, 
  FileText,
  Activity,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../auth/AuthContext';

export default function ProfilePage({ onNavigateHome, onNavigate }) {
  const { lang, t } = useLanguage();
  const { currentUser, updateUser, token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Other',
    bloodGroup: 'Unknown',
    village: '',
    taluka: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
    emergencyName: '',
    emergencyRelation: 'Family',
    emergencyPhone: '',
    medicalConditions: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        age: currentUser.age || '',
        gender: currentUser.gender || 'Other',
        bloodGroup: currentUser.bloodGroup || 'Unknown',
        village: currentUser.village || '',
        taluka: currentUser.taluka || '',
        district: currentUser.district || '',
        state: currentUser.state || 'Maharashtra',
        pincode: currentUser.pincode || '',
        emergencyName: currentUser.emergencyContact?.name || '',
        emergencyRelation: currentUser.emergencyContact?.relation || 'Family',
        emergencyPhone: currentUser.emergencyContact?.phone || '',
        medicalConditions: Array.isArray(currentUser.medicalConditions) 
          ? currentUser.medicalConditions.join(', ') 
          : (currentUser.medicalConditions || '')
      });

      // Fetch QR Code preview for digital health card
      const fetchQr = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/health-card/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: currentUser.name,
              arogyaId: currentUser.arogyaId || currentUser.abhaId || 'AR-2026-00001',
              gender: currentUser.gender,
              age: currentUser.age,
              bloodGroup: currentUser.bloodGroup,
              village: currentUser.village
            })
          });
          if (res.ok) {
            const data = await res.json();
            setQrUrl(data.qrDataUrl);
          }
        } catch (e) {
          console.warn('[Profile QR load notice]', e);
        }
      };
      fetchQr();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <AlertCircle className="w-12 h-12 text-alert-red" />
        <h2 className="font-display font-bold text-2xl text-deep-navy dark:text-clinical-white">
          {lang === 'mr' ? 'कृपया प्रथम लॉगिन करा' : 'Please Log In First'}
        </h2>
        <button onClick={onNavigateHome} className="btn-medical-blue text-sm">
          {lang === 'mr' ? 'मुख्य पृष्ठावर जा' : 'Return Home'}
        </button>
      </div>
    );
  }

  const arogyaId = currentUser.arogyaId || currentUser.abhaId || currentUser.kioskId || 'AR-2026-00001';

  const handleCopyId = () => {
    navigator.clipboard.writeText(arogyaId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadCard = async () => {
    setDownloadingCard(true);
    try {
      const res = await fetch('http://localhost:5000/api/health-card/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          arogyaId: arogyaId,
          age: currentUser.age,
          gender: currentUser.gender,
          bloodGroup: currentUser.bloodGroup,
          village: currentUser.village,
          taluka: currentUser.taluka,
          district: currentUser.district,
          state: currentUser.state,
          phone: currentUser.phone
        })
      });

      if (!res.ok) throw new Error('Failed to generate Health Card PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ArogyaRakshak_Card_${arogyaId.replace(/-/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Health Card Download error]', err);
      alert(lang === 'mr' ? 'आरोग्यरक्षक कार्ड डाउनलोड करताना त्रुटी आली.' : 'Failed to download health card PDF.');
    } finally {
      setDownloadingCard(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg(lang === 'mr' ? 'नाव भरणे अनिवार्य आहे.' : 'Full name is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const medArray = formData.medicalConditions
      ? formData.medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      age: formData.age ? Number(formData.age) : undefined,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      village: formData.village.trim(),
      taluka: formData.taluka.trim(),
      district: formData.district.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      emergencyContact: {
        name: formData.emergencyName.trim(),
        relation: formData.emergencyRelation.trim(),
        phone: formData.emergencyPhone.trim()
      },
      medicalConditions: medArray
    };

    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      updateUser(data.user);
      setIsEditing(false);
      setSuccessMsg(lang === 'mr' ? 'तुमचे आरोग्य प्रोफाइल यशस्वीरीत्या अपडेट झाले!' : 'Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('[Profile update error]', err);
      // Fallback local update
      const updatedLocal = { ...currentUser, ...payload };
      updateUser(updatedLocal);
      setIsEditing(false);
      setSuccessMsg(lang === 'mr' ? 'तुमचे आरोग्य प्रोफाइल अपडेट झाले!' : 'Profile updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-4 animate-fadeIn pb-12">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-deep-navy/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="p-2 rounded-xl border border-deep-navy/20 hover:bg-deep-navy/10 dark:border-white/20 transition-all text-deep-navy dark:text-clinical-white"
            title={lang === 'mr' ? 'मागे जा' : 'Go Back'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white">
                {lang === 'mr' ? 'माझे आरोग्य प्रोफाइल' : lang === 'hi' ? 'मेरी स्वास्थ्य प्रोफ़ाइल' : 'My Health Profile'}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-health-green/15 text-health-green border border-health-green/30">
                {currentUser.role === 'kiosk_operator' ? 'Kiosk Operator' : 'Verified Citizen'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {lang === 'mr' 
                ? 'तुमचे अधिकृत आरोग्य ओळखपत्र, वैयक्तिक माहिती व आपत्कालीन संपर्क तपशील' 
                : 'Your official ArogyaRakshak Health ID, rural jurisdiction and emergency contacts'}
            </p>
          </div>
        </div>

        {/* Edit Profile Toggle Button */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-medical-blue text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2 shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>{lang === 'mr' ? 'माहिती बदला / संपादित करा' : 'Edit Profile'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="btn-glass text-xs sm:text-sm py-2.5 px-4 flex items-center gap-2"
            >
              <X className="w-4 h-4 text-alert-red" />
              <span>{lang === 'mr' ? 'रद्द करा' : 'Cancel'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast feedback alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-health-green/15 border border-health-green/30 text-health-green flex items-center gap-3 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-alert-red/15 border border-alert-red/30 text-alert-red flex items-center gap-3 animate-fadeIn shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Grid: Digital Card & Health Stats on Left, Form/Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Digital ArogyaRakshak Health Card Hero & Quick Navigation */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Official ArogyaRakshak Smart Card Preview */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#082F35] via-[#0D7E73] to-[#059669] text-white shadow-2xl relative overflow-hidden border border-white/20">
            {/* Hologram / Ambient overlay shapes */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              
              {/* Card Header with Govt / ArogyaRakshak Branding */}
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/30">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-extrabold text-white/80 block">
                      Government of Maharashtra
                    </span>
                    <span className="text-xs font-black tracking-wide text-white block">
                      आरोग्यरक्षक डिजिटल हेल्थ कार्ड
                    </span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/30">
                  ABHA Compliant
                </div>
              </div>

              {/* Smart Chip & Encrypted QR code preview */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  {/* EMV Gold Smart Chip Sim */}
                  <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-600/40 shadow-inner flex items-center justify-center">
                    <div className="w-7 h-5 border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5 opacity-60">
                      <div className="border-r border-amber-800/40"></div>
                      <div></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/70 font-mono tracking-wider block">
                    NFC / RFID READY
                  </span>
                </div>

                {/* QR Code */}
                <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-lg shrink-0 flex items-center justify-center">
                  {qrUrl ? (
                    <img src={qrUrl} alt="Arogya Health QR" className="w-full h-full object-contain" />
                  ) : (
                    <CreditCard className="w-10 h-10 text-medical-blue" />
                  )}
                </div>
              </div>

              {/* Sequential ID Display & Copy Button */}
              <div className="p-3 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">
                    ArogyaRakshak Health ID
                  </span>
                  <span className="font-mono font-extrabold text-base sm:text-lg tracking-wider text-white block">
                    {arogyaId}
                  </span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Citizen Details Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/15 text-white">
                <div>
                  <span className="text-[9px] text-white/70 block uppercase font-bold">Name / नाव</span>
                  <span className="text-xs font-extrabold truncate block">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/70 block uppercase font-bold">Gender / वय</span>
                  <span className="text-xs font-extrabold block">{currentUser.gender} • {currentUser.age || 'N/A'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/70 block uppercase font-bold">Blood Group</span>
                  <span className="text-sm font-extrabold text-amber-300 block">{currentUser.bloodGroup || 'Unknown'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Download 1-Click PDF Button */}
          <button
            onClick={handleDownloadCard}
            disabled={downloadingCard}
            className="w-full btn-navy py-3 px-4 flex items-center justify-center gap-2 shadow-lg text-sm"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloadingCard 
                ? (lang === 'mr' ? 'कार्ड डाउनलोड होत आहे...' : 'Generating Official PDF...') 
                : (lang === 'mr' ? 'अधिकृत आरोग्य ओळखपत्र डाउनलोड करा (PDF)' : 'Download Digital Health Card PDF')}
            </span>
          </button>

          {/* Quick Stats & Family Navigation */}
          <div className="glass-card p-5 space-y-4 border border-deep-navy/10 dark:border-white/10">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-deep-navy/70 dark:text-dark-muted">
              {lang === 'mr' ? 'आरोग्य जोडणी' : 'Connected Health Records'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {!(currentUser?.role === 'kiosk_operator' || currentUser?.role === 'grampanchayat' || currentUser?.role === 'gram_panchayat' || currentUser?.kioskId) && (
                <button
                  onClick={() => onNavigate && onNavigate('hub')}
                  className="p-3.5 rounded-2xl bg-medical-blue/10 hover:bg-medical-blue/20 transition-all text-left border border-medical-blue/20 group"
                >
                  <div className="flex items-center justify-between text-medical-blue mb-1">
                    <Users className="w-4 h-4" />
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-deep-navy dark:text-clinical-white block">
                    {lang === 'mr' ? 'कुटुंब सदस्य' : 'Family Hub'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'mr' ? 'सदस्य व्यवस्थापित करा' : 'Manage family profiles'}
                  </span>
                </button>
              )}

              <button
                onClick={() => onNavigate && onNavigate('triage')}
                className="p-3.5 rounded-2xl bg-health-green/10 hover:bg-health-green/20 transition-all text-left border border-health-green/20 group"
              >
                <div className="flex items-center justify-between text-health-green mb-1">
                  <Activity className="w-4 h-4" />
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-xs font-bold text-deep-navy dark:text-clinical-white block">
                  {lang === 'mr' ? 'लक्षण चाचणी' : 'Symptom Triage'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {lang === 'mr' ? '२ दिवसांचे प्रिस्क्रिप्शन' : '2-Day OTC Rx'}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Full Personal, Jurisdiction & Emergency Contact Details */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card p-6 sm:p-8 space-y-6 border border-white/70 dark:border-white/10 shadow-xl">
            
            {isEditing ? (
              /* Editable Profile Form Mode */
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* Panel 1: Personal Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
                    <User className="w-4 h-4 text-medical-blue" />
                    <h3 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
                      {lang === 'mr' ? '१. वैयक्तिक माहिती' : '1. Personal Information'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'पूर्ण नाव *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'वय (वर्षे)' : 'Age (Years)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'लिंग' : 'Gender'}
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
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
                        onChange={(e) => handleChange('bloodGroup', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      >
                        <option value="Unknown">Unknown / माहिती नाही</option>
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
                        {lang === 'mr' ? 'ईमेल (ऐच्छिक)' : 'Email (Optional)'}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel 2: Rural Location & Jurisdiction */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
                    <MapPin className="w-4 h-4 text-health-green" />
                    <h3 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
                      {lang === 'mr' ? '२. गाव व कार्यक्षेत्र (Rural Jurisdiction)' : '2. Rural Location & Jurisdiction'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'गाव / शहर (Village / Town)' : 'Village / Town'}
                      </label>
                      <input
                        type="text"
                        value={formData.village}
                        onChange={(e) => handleChange('village', e.target.value)}
                        placeholder="उदा. शिरवळ"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'तालुका (Taluka / Block)' : 'Taluka / Block'}
                      </label>
                      <input
                        type="text"
                        value={formData.taluka}
                        onChange={(e) => handleChange('taluka', e.target.value)}
                        placeholder="उदा. खंडाळा"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'जिल्हा (District)' : 'District'}
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        placeholder="उदा. सातारा"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'पिनकोड (Pincode)' : 'Pincode'}
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        value={formData.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        placeholder="412801"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel 3: Emergency SOS Contact */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
                    <Shield className="w-4 h-4 text-alert-red" />
                    <h3 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
                      {lang === 'mr' ? '३. आपत्कालीन SOS संपर्क (Emergency Contact)' : '3. Emergency SOS Contact'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'संपर्क व्यक्तीचे नाव' : 'Contact Person Name'}
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyName}
                        onChange={(e) => handleChange('emergencyName', e.target.value)}
                        placeholder="उदा. रमेश पाटील"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'नाते (Relation)' : 'Relation'}
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyRelation}
                        onChange={(e) => handleChange('emergencyRelation', e.target.value)}
                        placeholder="उदा. भाऊ / मित्र"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                        {lang === 'mr' ? 'आपत्कालीन फोन *' : 'Emergency Phone *'}
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel 4: Chronic Medical Conditions */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-deep-navy/10 dark:border-white/10">
                    <Heart className="w-4 h-4 text-caution-amber" />
                    <h3 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
                      {lang === 'mr' ? '४. जुने आजार व मेडिकल इतिहास' : '4. Chronic Conditions & Medical History'}
                    </h3>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-deep-navy dark:text-clinical-white block mb-1">
                      {lang === 'mr' ? 'आजार किंवा ॲलर्जी (स्वल्पविरामाने वेगळे करा)' : 'Conditions or Allergies (comma separated)'}
                    </label>
                    <input
                      type="text"
                      value={formData.medicalConditions}
                      onChange={(e) => handleChange('medicalConditions', e.target.value)}
                      placeholder="उदा. Diabetes, High Blood Pressure, Penicillin Allergy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-deep-navy/20 dark:border-white/20 bg-white/70 dark:bg-dark-base/70 text-xs font-semibold focus:outline-none focus:border-medical-blue"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-deep-navy/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-glass text-xs py-2.5 px-5"
                  >
                    {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-medical-blue text-xs py-2.5 px-6 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? (lang === 'mr' ? 'जतन होत आहे...' : 'Saving...') : (lang === 'mr' ? 'बदल जतन करा' : 'Save Changes')}</span>
                  </button>
                </div>

              </form>
            ) : (
              /* Display Profile Mode */
              <div className="space-y-8">
                
                {/* Identity Summary Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-deep-navy/10 dark:border-white/10">
                    <span className="text-xs font-black uppercase tracking-wider text-medical-blue dark:text-soft-cyan">
                      {lang === 'mr' ? 'वैयक्तिक माहिती' : 'Personal Demographics'}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-medical-blue font-bold hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'संपादित करा' : 'Edit'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Name</span>
                      <strong className="text-sm text-deep-navy dark:text-clinical-white block mt-0.5">{currentUser.name}</strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone</span>
                      <strong className="text-sm font-mono text-deep-navy dark:text-clinical-white block mt-0.5">{currentUser.phone || 'N/A'}</strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Age & Gender</span>
                      <strong className="text-sm text-deep-navy dark:text-clinical-white block mt-0.5">
                        {currentUser.age ? `${currentUser.age} yrs` : 'N/A'} • {currentUser.gender || 'Other'}
                      </strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Blood Group</span>
                      <strong className="text-sm font-extrabold text-alert-red block mt-0.5">{currentUser.bloodGroup || 'Unknown'}</strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Email</span>
                      <strong className="text-sm text-deep-navy dark:text-clinical-white block mt-0.5 truncate">{currentUser.email || 'Not provided'}</strong>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">ArogyaRakshak ID</span>
                      <strong className="text-sm font-mono text-medical-blue block mt-0.5">{arogyaId}</strong>
                    </div>
                  </div>
                </div>

                {/* Rural Location & Jurisdiction */}
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-health-green block pb-2 border-b border-deep-navy/10 dark:border-white/10">
                    {lang === 'mr' ? 'गाव व कार्यक्षेत्र (Rural Jurisdiction)' : 'Rural Location & Jurisdiction'}
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">{lang === 'mr' ? 'गाव' : 'Village'}</span>
                      <strong className="text-xs font-bold text-deep-navy dark:text-clinical-white block mt-0.5">{currentUser.village || 'N/A'}</strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">{lang === 'mr' ? 'तालुका' : 'Taluka'}</span>
                      <strong className="text-xs font-bold text-deep-navy dark:text-clinical-white block mt-0.5">{currentUser.taluka || 'N/A'}</strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">{lang === 'mr' ? 'जिल्हा' : 'District'}</span>
                      <strong className="text-xs font-bold text-deep-navy dark:text-clinical-white block mt-0.5">{currentUser.district || 'N/A'}</strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-navy/10 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">{lang === 'mr' ? 'पिनकोड' : 'Pincode'}</span>
                      <strong className="text-xs font-mono font-bold text-deep-navy dark:text-clinical-white block mt-0.5">{currentUser.pincode || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Emergency SOS Contact */}
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-alert-red block pb-2 border-b border-deep-navy/10 dark:border-white/10">
                    {lang === 'mr' ? 'आपत्कालीन SOS संपर्क (Emergency Contact)' : 'Emergency SOS Contact'}
                  </span>

                  <div className="p-4 rounded-2xl bg-alert-red/10 border border-alert-red/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-alert-red text-white">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-deep-navy dark:text-clinical-white block">
                          {currentUser.emergencyContact?.name || 'Primary Guardian'} ({currentUser.emergencyContact?.relation || 'Family'})
                        </span>
                        <span className="text-xs font-mono text-alert-red font-bold block mt-0.5">
                          {currentUser.emergencyContact?.phone || 'No emergency number set'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-dark-base text-xs font-bold border border-alert-red/30 text-alert-red hover:bg-alert-red/10 transition-all self-start sm:self-center"
                    >
                      {lang === 'mr' ? 'अपडेट करा' : 'Update SOS Contact'}
                    </button>
                  </div>
                </div>

                {/* Chronic Medical Conditions */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-caution-amber block pb-2 border-b border-deep-navy/10 dark:border-white/10">
                    {lang === 'mr' ? 'वैद्यकीय पार्श्वभूमी (Medical History)' : 'Medical History & Chronic Conditions'}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {currentUser.medicalConditions && currentUser.medicalConditions.length > 0 ? (
                      currentUser.medicalConditions.map((cond, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-medical-blue/10 text-medical-blue dark:bg-medical-blue/20 dark:text-soft-cyan border border-medical-blue/25"
                        >
                          {cond}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        {lang === 'mr' ? 'कोणताही जुना आजार नोंदवलेला नाही.' : 'No chronic conditions or allergies recorded.'}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
