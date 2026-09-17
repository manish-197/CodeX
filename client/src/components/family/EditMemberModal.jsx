import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Heart, 
  Save, 
  Activity, 
  AlertCircle,
  FileText,
  Phone
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function EditMemberModal({ isOpen, onClose, member, onMemberUpdated }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    relation: 'Other',
    age: '',
    gender: 'Other',
    bloodGroup: 'Unknown',
    phone: '',
    emergencyContact: '',
    medicalHistory: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        relation: member.relation || 'Other',
        age: member.age || '',
        gender: member.gender || 'Other',
        bloodGroup: member.bloodGroup || 'Unknown',
        phone: member.phone || '',
        emergencyContact: member.emergencyContact || '',
        medicalHistory: Array.isArray(member.medicalHistory) ? member.medicalHistory.join(', ') : (member.medicalHistory || '')
      });
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Member name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('arogya_token');
      const medHistoryArray = formData.medicalHistory
        ? formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const res = await fetch(`http://localhost:5000/api/family/${member.id || member._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          relation: formData.relation,
          age: formData.age ? Number(formData.age) : undefined,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          phone: formData.phone.trim(),
          emergencyContact: formData.emergencyContact.trim(),
          medicalHistory: medHistoryArray
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update family member.');
      }

      if (onMemberUpdated) {
        onMemberUpdated(data.member);
      }
      onClose();
    } catch (err) {
      console.error('[Edit Member Error]', err);
      // Fallback local update if offline or network error
      const updatedLocal = {
        ...member,
        name: formData.name.trim(),
        relation: formData.relation,
        age: formData.age ? Number(formData.age) : member.age,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        medicalHistory: formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean)
      };
      if (onMemberUpdated) {
        onMemberUpdated(updatedLocal);
      }
      onClose();
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
        className="w-full max-w-lg bg-white dark:bg-dark-base rounded-3xl shadow-2xl border border-deep-navy/15 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        data-lenis-prevent="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-deep-navy/10 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-dark-muted/20 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-medical-blue/15 text-medical-blue flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
                {t('member_edit_title')}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {member.arogyaId || member.abhaId || 'AR-2026-00001-01'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 min-h-0 text-left">
          {error && (
            <div className="p-3 rounded-2xl bg-alert-red/10 border border-alert-red/30 text-xs text-alert-red font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('profile_name_label')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('hub_relation')}
              </label>
              <select
                value={formData.relation}
                onChange={(e) => handleChange('relation', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
              >
                <option value="Self">Self (स्वतः)</option>
                <option value="Father">Father (वडील)</option>
                <option value="Mother">Mother (आई)</option>
                <option value="Grandfather">Grandfather (आजोबा)</option>
                <option value="Grandmother">Grandmother (आजी)</option>
                <option value="Spouse">Spouse (पती / पत्नी)</option>
                <option value="Child">Child (मुलगा / मुलगी)</option>
                <option value="Other">Other (इतर)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_age_label')}
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_gender_label')}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
              >
                <option value="Male">{t('profile_gender_male')}</option>
                <option value="Female">{t('profile_gender_female')}</option>
                <option value="Other">{t('profile_gender_other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-alert-red mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>{t('profile_blood_label')}</span>
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none font-bold"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-medical-blue" />
              <span>Contact Mobile (मोबाईल)</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-medical-blue" />
              <span>Medical History & Chronic Conditions (मागील आजार / व्याधी)</span>
            </label>
            <input
              type="text"
              value={formData.medicalHistory}
              onChange={(e) => handleChange('medicalHistory', e.target.value)}
              placeholder="e.g. Diabetes, Hypertension, Asthma (comma separated)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-dark-muted/20 text-xs sm:text-sm text-deep-navy dark:text-clinical-white focus:ring-2 focus:ring-medical-blue outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-medical-blue hover:bg-blue-600 text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('btn_save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
