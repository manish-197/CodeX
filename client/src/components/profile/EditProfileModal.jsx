import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Heart, 
  Save, 
  Activity, 
  CheckCircle2,
  Shield
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function EditProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRel: 'Spouse',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        age: currentUser.age || '',
        gender: currentUser.gender || 'Male',
        bloodGroup: currentUser.bloodGroup && currentUser.bloodGroup !== 'Unknown' ? currentUser.bloodGroup : 'B+',
        phone: currentUser.phone || '',
        village: currentUser.village || '',
        district: currentUser.district || '',
        state: currentUser.state || 'Maharashtra',
        pincode: currentUser.pincode || '',
        emergencyContactName: currentUser.emergencyContact?.name || '',
        emergencyContactPhone: currentUser.emergencyContact?.phone || '',
        emergencyContactRel: currentUser.emergencyContact?.relation || 'Spouse',
      });
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
      return;
    }
    if (!formData.age || Number(formData.age) <= 0) {
      setError('Please enter a valid age (वय).');
      return;
    }
    if (!formData.bloodGroup) {
      setError('Please select a blood group (रक्तगट).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('arogya_token');
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
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          emergencyContact: {
            name: formData.emergencyContactName.trim() || 'Emergency Contact',
            phone: formData.emergencyContactPhone.trim(),
            relation: formData.emergencyContactRel
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setSuccessToast('Profile updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated(data.user);
      }
      setTimeout(() => {
        setSuccessToast('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('[Profile Update Error]', err);
      setError(err.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-navy/70 backdrop-blur-md animate-fadeIn"
      data-lenis-prevent="true"
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-dark-base rounded-3xl shadow-2xl border border-deep-navy/15 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        data-lenis-prevent="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-deep-navy/10 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-dark-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-medical-blue/15 text-medical-blue flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-deep-navy dark:text-clinical-white">
                {t('profile_edit_title')}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 font-mono">
                  {currentUser?.arogyaId || 'AR-2026-00001'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-health-green/20 text-health-green font-extrabold">
                  Active Credential
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0 text-left">
          {error && (
            <div className="p-3 rounded-2xl bg-alert-red/10 border border-alert-red/30 text-xs text-alert-red font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successToast && (
            <div className="p-3 rounded-2xl bg-health-green/15 border border-health-green/30 text-xs text-health-green font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_name_label')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_phone_label')} *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_age_label')} *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_gender_label')}
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
              <label className="block text-xs font-bold text-alert-red mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>{t('profile_blood_label')} *</span>
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none font-bold"
              >
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_pincode_label')}
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10">
            <h4 className="text-xs font-bold text-medical-blue uppercase mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location Address (पत्ता)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {t('profile_village_label')}
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => handleChange('village', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {t('profile_district_label')}
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {t('profile_state_label')}
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                />
              </div>
            </div>
          </div>

          {/* Emergency SOS Contact */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10">
            <h4 className="text-xs font-bold text-alert-red uppercase mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{t('profile_emergency_title')}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {t('profile_emergency_name')}
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {t('profile_emergency_phone')}
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {t('profile_emergency_rel')}
                </label>
                <select
                  value={formData.emergencyContactRel}
                  onChange={(e) => handleChange('emergencyContactRel', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
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

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-medical-blue hover:bg-blue-600 text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
