import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Heart, 
  Calendar, 
  Activity, 
  Save, 
  Sparkles,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../auth/AuthContext';

export default function ProfileCompletionModal({ 
  isOpen, 
  currentUser, 
  onProfileComplete, 
  onProfileCompleted 
}) {
  const { t } = useLanguage();
  const { updateUser: authUpdateUser, token: authToken } = useAuth();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    age: currentUser?.age || '',
    gender: currentUser?.gender || 'Male',
    bloodGroup: currentUser?.bloodGroup && currentUser.bloodGroup !== 'Unknown' ? currentUser.bloodGroup : 'B+',
    phone: currentUser?.phone || '',
    village: currentUser?.village || '',
    district: currentUser?.district || '',
    state: currentUser?.state || 'Maharashtra',
    pincode: currentUser?.pincode || '',
    emergencyContactName: currentUser?.emergencyContact?.name || '',
    emergencyContactPhone: currentUser?.emergencyContact?.phone || '',
    emergencyContactRel: currentUser?.emergencyContact?.relation || 'Spouse',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Re-sync form data whenever currentUser loads or changes
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        name: currentUser.name || prev.name || '',
        age: currentUser.age || prev.age || '',
        gender: currentUser.gender || prev.gender || 'Male',
        bloodGroup: currentUser.bloodGroup && currentUser.bloodGroup !== 'Unknown' ? currentUser.bloodGroup : (prev.bloodGroup || 'B+'),
        phone: currentUser.phone || prev.phone || '',
        village: currentUser.village || prev.village || '',
        district: currentUser.district || prev.district || '',
        state: currentUser.state || prev.state || 'Maharashtra',
        pincode: currentUser.pincode || prev.pincode || '',
        emergencyContactName: currentUser.emergencyContact?.name || prev.emergencyContactName || '',
        emergencyContactPhone: currentUser.emergencyContact?.phone || prev.emergencyContactPhone || '',
        emergencyContactRel: currentUser.emergencyContact?.relation || prev.emergencyContactRel || 'Spouse',
      }));
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(t('profile_name_label') + ' is required.');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.age || Number(formData.age) <= 0) {
      setError('Please enter a valid age (वय).');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.bloodGroup || formData.bloodGroup === 'Unknown') {
      setError('Please select a blood group (रक्तगट).');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide a mobile number (मोबाईल नंबर).');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.village.trim() || !formData.district.trim()) {
      setError('Please provide your village and district (गाव व जिल्हा).');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = authToken || localStorage.getItem('arogya_token');
      const emergencyPhone = formData.emergencyContactPhone.trim() || formData.phone.trim();
      const emergencyName = formData.emergencyContactName.trim() || 'Family Contact';

      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: Number(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          phone: formData.phone.trim(),
          village: formData.village.trim(),
          district: formData.district.trim(),
          state: formData.state.trim() || 'Maharashtra',
          pincode: formData.pincode.trim() || '',
          emergencyContact: {
            name: emergencyName,
            phone: emergencyPhone,
            relation: formData.emergencyContactRel
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setSuccess(true);

      const callback = onProfileComplete || onProfileCompleted;
      if (data.user) {
        if (authUpdateUser) {
          authUpdateUser(data.user);
        }
        if (callback) {
          callback(data.user);
        }
      }
    } catch (err) {
      console.error('[Profile Completion Error]', err);
      setError(err.message || 'Could not save profile. Please check details.');
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-navy/80 backdrop-blur-md animate-fadeIn"
      data-lenis-prevent="true"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-dark-base rounded-3xl shadow-2xl border border-medical-blue/30 overflow-hidden flex flex-col max-h-[92vh]"
        data-lenis-prevent="true"
      >
        {/* Header Band */}
        <div className="bg-gradient-to-r from-medical-blue to-teal-700 text-white p-6 shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Award className="w-7 h-7 text-caution-amber" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight">
                  {t('profile_complete_title')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-alert-red text-white uppercase tracking-wider animate-pulse">
                  Required
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                {t('profile_complete_subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} ref={formRef} className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-left">
          {error && (
            <div className="p-3.5 rounded-2xl bg-alert-red/10 border border-alert-red/30 text-xs font-semibold text-alert-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Citizen Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-medical-blue flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Personal & Medical Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_name_label')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Ramesh Shankar Patil"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_phone_label')} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_age_label')} *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_gender_label')} *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                >
                  <option value="Male">{t('profile_gender_male')}</option>
                  <option value="Female">{t('profile_gender_female')}</option>
                  <option value="Other">{t('profile_gender_other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1 text-alert-red">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{t('profile_blood_label')} *</span>
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none font-bold"
                >
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_pincode_label')} *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="e.g. 412206"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rural Address & Jurisdiction */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/10">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-medical-blue flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Village & District Location (ग्रामीण पत्ता)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_village_label')} *
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => handleChange('village', e.target.value)}
                  placeholder="e.g. Paud / Shirur"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_district_label')} *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="e.g. Pune / Satara"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_state_label')} *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency SOS Contact */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-alert-red flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>{t('profile_emergency_title')} *</span>
              </h3>
              <span className="text-[10px] text-slate-500">Auto-contacted on 108 SOS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_emergency_name')} *
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  placeholder="e.g. Sunita Patil"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_emergency_phone')} *
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('profile_emergency_rel')}
                </label>
                <select
                  value={formData.emergencyContactRel}
                  onChange={(e) => handleChange('emergencyContactRel', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                >
                  <option value="Spouse">Spouse (पती / पत्नी)</option>
                  <option value="Father">Father (वडील)</option>
                  <option value="Mother">Mother (आई)</option>
                  <option value="Son">Son (मुलगा)</option>
                  <option value="Daughter">Daughter (मुलगी)</option>
                  <option value="Brother">Brother (भाऊ)</option>
                  <option value="Other">Other Relative (नातेवाईक)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              🔒 Information is cryptographically secured under your ArogyaRakshak Health Card ID.
            </p>
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                success 
                  ? 'bg-health-green' 
                  : 'bg-gradient-to-r from-medical-blue to-teal-600 hover:from-blue-600 hover:to-teal-700'
              } disabled:opacity-75`}
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                  <span>✓ {t('profile_success_activated') || 'ArogyaRakshak Health Card Activated!'}</span>
                </>
              ) : loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>{t('profile_saving_btn')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('profile_save_btn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
