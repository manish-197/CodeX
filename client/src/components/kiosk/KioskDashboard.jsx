import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Activity, 
  UserPlus, 
  Search, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Heart, 
  CreditCard,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import VitalsCard from '../family/VitalsCard';
import LogVitalsModal from '../family/LogVitalsModal';
import AddMemberModal from '../family/AddMemberModal';
import HealthCardModal from '../family/HealthCardModal';
import BleDeviceModal from '../family/BleDeviceModal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function KioskDashboard({ 
  currentUser, 
  onVitalsChange, 
  onTriggerDoctorDispatch,
  onNavigateToTriage
}) {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'vitals'

  // Village Citizen Registry managed by this Kiosk Operator
  const [citizens, setCitizens] = useState([
    {
      id: 'cit_01',
      name: 'Rameshwar Jadhav',
      phone: '9822012345',
      age: 63,
      gender: 'Male',
      bloodGroup: 'O+',
      village: 'Paud Village',
      abhaId: '14-2026-1002-3341',
      medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
      vitals: {
        bp: { sys: 138, dia: 88 },
        heartRate: 74,
        spo2: 97,
        recordedAt: '2026-09-17T09:30:00Z',
      }
    },
    {
      id: 'cit_02',
      name: 'Anusaya More',
      phone: '9822054321',
      age: 58,
      gender: 'Female',
      bloodGroup: 'B+',
      village: 'Paud Village',
      abhaId: '14-2026-4451-8902',
      medicalHistory: ['Joint Pain', 'Mild Asthma'],
      vitals: {
        bp: { sys: 120, dia: 78 },
        heartRate: 70,
        spo2: 98,
        recordedAt: '2026-09-17T10:15:00Z',
      }
    },
    {
      id: 'cit_03',
      name: 'Baburao Shinde',
      phone: '9423098765',
      age: 72,
      gender: 'Male',
      bloodGroup: 'AB+',
      village: 'Kashig Budruk',
      abhaId: '14-2026-7890-1123',
      medicalHistory: ['Chronic Kidney Disease', 'Hypertension'],
      vitals: {
        bp: { sys: 146, dia: 94 },
        heartRate: 82,
        spo2: 95,
        recordedAt: '2026-09-17T11:00:00Z',
      }
    }
  ]);

  const [selectedCitizenId, setSelectedCitizenId] = useState(citizens[0]?.id || null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isBleModalOpen, setIsBleModalOpen] = useState(false);

  const selectedCitizen = citizens.find(c => c.id === selectedCitizenId) || citizens[0];

  const filteredCitizens = citizens.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.abhaId.includes(searchQuery)
  );

  const handleSaveVitals = (newVitals) => {
    const updated = citizens.map(c => {
      if (c.id === selectedCitizen.id) {
        const full = { ...newVitals, recordedAt: new Date().toISOString() };
        return { ...c, vitals: full };
      }
      return c;
    });
    setCitizens(updated);

    if (onVitalsChange) {
      onVitalsChange(newVitals.heartRate, newVitals);
    }
  };

  const handleRegisterCitizen = (newMemberData) => {
    const newId = 'cit_' + Date.now();
    const created = {
      id: newId,
      ...newMemberData,
      village: currentUser?.village || 'Paud Village',
      abhaId: '14-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      vitals: {
        bp: { sys: 0, dia: 0 },
        heartRate: 0,
        spo2: 0,
        recordedAt: null,
      }
    };
    setCitizens([created, ...citizens]);
    setSelectedCitizenId(newId);
  };

  return (
    <div className="space-y-8 py-4 animate-fadeIn">
      
      {/* Kiosk Operator Header Banner */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden border-2 border-caution-amber/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-deep-navy to-health-green text-white flex items-center justify-center shadow-lg shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-caution-amber/30 text-deep-navy dark:text-caution-amber">
                  Gram Panchayat Kiosk Operator
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  ID: {currentUser?.kioskId || 'GP-KIOSK-042'}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white tracking-tight mt-1">
                Village Digital Health Desk
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Center: <strong>{currentUser?.village || 'Paud Gram Panchayat Centre'}</strong> • Assisting rural villagers with ABHA onboarding, vitals, and emergency triage.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-medical-blue py-3 px-6 text-xs sm:text-sm font-bold flex items-center gap-2 self-start sm:self-auto shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Walking Villager (नागरिक नोंदणी)</span>
          </button>
        </div>
      </div>

      {/* Main Kiosk Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Villager Directory & Search */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white flex items-center gap-2">
                <Users className="w-4 h-4 text-medical-blue" />
                <span>Village Citizen Registry</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white">
                {citizens.length} Citizens
              </span>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen by name, phone, or ABHA..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/80 dark:bg-dark-base/80 border border-deep-navy/15 text-xs text-deep-navy dark:text-clinical-white focus:outline-none focus:border-medical-blue"
              />
            </div>

            {/* List of citizens */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1" data-lenis-prevent="true">
              {filteredCitizens.map((citizen) => {
                const isSelected = citizen.id === selectedCitizen.id;
                const isHighBp = citizen.vitals?.bp?.sys > 140;

                return (
                  <div
                    key={citizen.id}
                    onClick={() => {
                      setSelectedCitizenId(citizen.id);
                      if (onVitalsChange) {
                        onVitalsChange(citizen.vitals.heartRate, citizen.vitals);
                      }
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-deep-navy text-white border-deep-navy shadow-md dark:bg-clinical-white dark:text-deep-navy'
                        : 'bg-white/60 dark:bg-dark-base/60 border-deep-navy/10 hover:border-medical-blue text-deep-navy dark:text-clinical-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm leading-snug">{citizen.name}</div>
                        <div className="text-[11px] opacity-75 mt-0.5 flex items-center gap-2">
                          <span>{citizen.age} yrs • {citizen.gender}</span>
                          <span>•</span>
                          <span>{citizen.village}</span>
                        </div>
                      </div>
                      {isHighBp && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-alert-red text-white animate-pulse">
                          BP Alert
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-current/10">
                      <span className="font-mono text-[10px] opacity-85">
                        {citizen.abhaId}
                      </span>
                      <span className="font-bold">
                        {citizen.vitals.bp.sys > 0 
                          ? `${citizen.vitals.bp.sys}/${citizen.vitals.bp.dia} mmHg`
                          : '0/0 mmHg'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Citizen Health Record, Kiosk Vitals Station, and ABDM Card */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Citizen Profile Card */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-deep-navy/10 dark:border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-medical-blue block">
                  Active Consultation Profile
                </span>
                <h3 className="font-display font-bold text-2xl text-deep-navy dark:text-clinical-white">
                  {selectedCitizen.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ABHA ID: {selectedCitizen.abhaId} • Phone: {selectedCitizen.phone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCardModalOpen(true)}
                  className="btn-navy text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print ABDM Card</span>
                </button>

                <button
                  onClick={() => onNavigateToTriage && onNavigateToTriage()}
                  className="btn-medical-blue text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Voice Triage</span>
                </button>
              </div>
            </div>

            {/* Vitals Station for this Citizen */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-deep-navy dark:text-clinical-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-health-green" />
                  <span>Kiosk Quick Vitals Station (0-Default Protocol)</span>
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBleModalOpen(true)}
                    className="text-xs font-semibold text-medical-blue hover:underline"
                  >
                    Pair Bluetooth Cuff
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="text-xs font-bold text-deep-navy dark:text-clinical-white hover:underline"
                  >
                    + Record Vitals
                  </button>
                </div>
              </div>

              <VitalsCard 
                vitals={selectedCitizen.vitals}
                onOpenLogModal={() => setIsLogModalOpen(true)}
                onOpenBleModal={() => setIsBleModalOpen(true)}
                onTriggerDoctorDispatch={onTriggerDoctorDispatch}
              />
            </div>

            {/* Medical History & Chronic Conditions */}
            <div className="p-4 rounded-2xl bg-deep-navy/5 dark:bg-white/5 border border-deep-navy/10 text-xs space-y-2">
              <div className="font-bold text-deep-navy dark:text-clinical-white">
                Recorded Village Medical History:
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCitizen.medicalHistory?.map((h, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white font-medium text-[11px]">
                    {h}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modals for Kiosk */}
      <LogVitalsModal 
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSave={handleSaveVitals}
        memberName={selectedCitizen?.name}
      />

      <AddMemberModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleRegisterCitizen}
      />

      <HealthCardModal 
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        member={selectedCitizen}
      />

      <BleDeviceModal 
        isOpen={isBleModalOpen}
        onClose={() => setIsBleModalOpen(false)}
        onDeviceVitals={(liveVitals) => handleSaveVitals(liveVitals)}
      />

    </div>
  );
}
