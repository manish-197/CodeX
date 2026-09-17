import React, { useState } from 'react';
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
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function FamilyHub({ 
  currentUser, 
  onVitalsChange, 
  onTriggerDoctorDispatch
}) {
  const { t } = useLanguage();

  // Family members list: initializes with currentUser profile or empty list
  const [members, setMembers] = useState([
    {
      id: currentUser?.id || 'self_1',
      name: currentUser?.name || 'Self (Primary Citizen)',
      relation: 'Self',
      age: 42,
      gender: 'Male',
      bloodGroup: 'B+',
      abhaId: currentUser?.abhaId || '14-2026-9812-4456',
      medicalHistory: ['Mild Hypertension'],
      // Zero default vitals
      vitals: {
        bp: { sys: 0, dia: 0 },
        heartRate: 0,
        spo2: 0,
        recordedAt: null,
      }
    }
  ]);

  const [activeMemberId, setActiveMemberId] = useState(members[0]?.id || null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isBleModalOpen, setIsBleModalOpen] = useState(false);

  const activeMember = members.find(m => m.id === activeMemberId) || members[0];

  const handleSaveVitals = (newVitals) => {
    const updated = members.map(m => {
      if (m.id === activeMember.id) {
        const fullVitals = { ...newVitals, recordedAt: new Date().toISOString() };
        return { ...m, vitals: fullVitals };
      }
      return m;
    });
    setMembers(updated);

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
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
            {t('hub_badge')}
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-deep-teal dark:text-sky-mist">
            {t('hub_title')}
          </h2>
          <p className="text-xs sm:text-sm text-deep-teal/70 dark:text-dark-muted mt-1">
            {t('hub_desc')}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-terracotta text-xs py-2.5 px-4 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('hub_btn_add')}</span>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-deep-teal text-white border-deep-teal shadow-md dark:bg-sky-mist dark:text-deep-teal'
                  : 'neo-glass-card hover:border-terracotta/40 text-deep-teal dark:text-sky-mist'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                isActive ? 'bg-terracotta text-white' : 'bg-deep-teal/10 text-deep-teal dark:bg-white/10 dark:text-sky-mist'
              }`}>
                {member.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs leading-tight">{member.name}</div>
                <div className={`text-[10px] ${isActive ? 'opacity-80' : 'text-deep-teal/60 dark:text-dark-muted'}`}>
                  {member.relation} • {member.age ? `${member.age} yrs` : 'Age N/A'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activeMember ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Active Member Demographics & ABHA Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="neo-glass-card p-6 space-y-5">
              
              <div className="flex items-start justify-between border-b border-deep-teal/10 dark:border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-leaf-green/15 text-leaf-green">
                    {t('hub_active_profile')}
                  </span>
                  <h3 className="font-display font-bold text-xl text-deep-teal dark:text-sky-mist mt-1">
                    {activeMember.name}
                  </h3>
                  <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
                    {t('hub_relation')}: <strong>{activeMember.relation}</strong>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-terracotta to-sun-gold text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {activeMember.bloodGroup || 'N/A'}
                </div>
              </div>

              {/* ABHA ID details */}
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-dark-base/50 border border-deep-teal/10 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-deep-teal/70 dark:text-dark-muted">
                  <CreditCard className="w-3.5 h-3.5 text-terracotta" />
                  <span>{t('hub_abha_title')}</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold tracking-wider text-deep-teal dark:text-sky-mist">
                  {activeMember.abhaId || 'XX-XXXX-XXXX-XXXX'}
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-deep-teal dark:text-sky-mist">
                  {t('hub_medical_history')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMember.medicalHistory && activeMember.medicalHistory.length > 0 ? (
                    activeMember.medicalHistory.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-deep-teal/10 dark:bg-white/10 text-deep-teal dark:text-sky-mist">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-deep-teal/50 dark:text-dark-muted">
                      {t('hub_no_conditions')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-deep-teal/10 dark:border-white/10 space-y-2">
                <button
                  onClick={() => setIsCardModalOpen(true)}
                  className="w-full btn-teal text-xs py-2.5 px-3 flex items-center justify-center gap-2 dark:bg-sky-mist dark:text-deep-teal"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('hub_btn_pdf')}</span>
                </button>

                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="w-full btn-glass text-xs py-2.5 px-3 flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-terracotta" />
                  <span>{t('hub_btn_rx')}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Zero-Default Vitals & Diagnostics */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-deep-teal dark:text-sky-mist">
                  {t('vitals_title')}
                </h3>
                <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
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
            <div className="neo-glass-card p-4 flex items-start gap-3 text-xs text-deep-teal/80 dark:text-sky-mist/80">
              <ShieldCheck className="w-5 h-5 text-leaf-green shrink-0 mt-0.5" />
              <div>
                <strong className="block text-deep-teal dark:text-sky-mist font-bold mb-0.5">
                  Rural Clinical Baseline Protocol
                </strong>
                Readings above 140 mmHg systolic instantly trigger the village emergency doctor dispatch sequence. All readings sync with the 3D heart digital twin on your home screen.
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="neo-glass-card p-12 text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-terracotta mx-auto" />
          <h4 className="font-display font-bold text-lg text-deep-teal dark:text-sky-mist">
            {t('hub_empty_title')}
          </h4>
          <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
            {t('hub_empty_desc')}
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-terracotta text-xs"
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
