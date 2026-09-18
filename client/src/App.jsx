import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './components/home/HomePage';
import FamilyHub from './components/family/FamilyHub';
import KioskDashboard from './components/kiosk/KioskDashboard';
import SymptomChecklistTriage from './components/triage/SymptomChecklistTriage';
import HospitalNavigation from './components/navigation/HospitalNavigation';
import AuthModal from './components/auth/AuthModal';
import StateLanguageToast from './components/common/StateLanguageToast';
import EmergencySOSBeacon from './components/common/EmergencySOSBeacon';
import OfflineSyncIndicator from './components/common/OfflineSyncIndicator';
import WhatsAppBotModal from './components/common/WhatsAppBotModal';
import ProfileCompletionModal from './components/profile/ProfileCompletionModal';
import EditProfileModal from './components/profile/EditProfileModal';
import ProfilePage from './components/profile/ProfilePage';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthGuard from './auth/AuthGuard';

function AppContent() {
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('arogya_user') || 'null');
      const role = (savedUser?.role || '').toLowerCase();
      const isGP = role === 'kiosk_operator' || role === 'grampanchayat' || role === 'gram_panchayat' || role === 'kiosk' || role === 'operator' || Boolean(savedUser?.kioskId);
      if (isGP) return 'hub';
    } catch (e) {}
    return 'home';
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('arogya_theme') === 'dark';
    } catch {
      return false;
    }
  });
  
  // Auth state from AuthContext
  const { 
    currentUser, 
    userRole, 
    authModalOpen, 
    authToast, 
    login, 
    logout, 
    updateUser,
    openLogin, 
    closeLogin, 
    requireAuth,
    isAuthenticated 
  } = useAuth();

  // Latest recorded heart rate (strictly 0 BPM initial per zero dummy data rule)
  const [latestHeartRate, setLatestHeartRate] = useState(0);
  const [activeVitals, setActiveVitals] = useState({
    bp: { sys: 0, dia: 0 },
    heartRate: 0,
    spo2: 0,
  });

  // Active family member selection
  const [activeMember, setActiveMember] = useState(() => {
    try {
      const saved = localStorage.getItem('arogya_active_member');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [targetHospital, setTargetHospital] = useState(null);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  // Sync dark class and data-theme on document element and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('arogya_theme', darkMode ? 'dark' : 'light');
    } catch (e) {}
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  const handleVitalsChange = (bpm, fullVitals) => {
    setLatestHeartRate(bpm || 0);
    if (fullVitals) setActiveVitals(fullVitals);
  };

  const isGramPanchayat = Boolean(
    currentUser?.role === 'kiosk_operator' || 
    currentUser?.role === 'grampanchayat' || 
    currentUser?.role === 'gram_panchayat' ||
    currentUser?.role === 'kiosk' ||
    currentUser?.role === 'operator' ||
    Boolean(currentUser?.kioskId) ||
    Boolean(currentUser?.email && (currentUser.email.includes('kiosk') || currentUser.email.includes('grampanchayat')))
  );

  const handleTabNavigation = (targetTab) => {
    if (targetTab === 'home') {
      setCurrentTab('home');
      return;
    }

    // Gram Panchayat / Kiosk Operator restriction:
    // Cannot access 'triage' (symptoms) without registering a patient first
    if (isGramPanchayat && targetTab === 'triage') {
      let activePat = activeMember;
      if (!activePat) {
        try {
          const fromSession = sessionStorage.getItem('activeKioskPatient');
          if (fromSession) {
            activePat = JSON.parse(fromSession);
          } else {
            activePat = JSON.parse(localStorage.getItem('arogya_active_member') || 'null');
          }
        } catch (e) {}
      }
      if (!activePat || (activePat.relation !== 'Walk-in Patient' && activePat.registeredVia !== 'kiosk') || !activePat.id) {
        alert('कृपया आधी रुग्णाची नोंदणी (Registration) करा. नोंदणीशिवाय लक्षणे तपासता येणार नाहीत.');
        setCurrentTab('hub');
        return;
      }
    }

    // Protected features require auth
    if (requireAuth(() => setCurrentTab(targetTab), `Please log in to access ${targetTab === 'hub' ? (isGramPanchayat ? 'Patient Registration' : 'Family Hub') : targetTab === 'triage' ? 'Symptom Checklist Triage' : targetTab === 'profile' ? 'My Health Profile' : 'Hospital Navigation'}.`)) {
      setCurrentTab(targetTab);
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={handleTabNavigation}
      userRole={userRole}
      setUserRole={() => {}}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      currentUser={currentUser}
      onOpenAuth={() => openLogin('Please log in to continue.')}
      onLogout={() => {
        logout();
        setCurrentTab('home');
      }}
      onOpenWhatsApp={() => setWhatsAppModalOpen(true)}
      onOpenEditProfile={() => handleTabNavigation('profile')}
    >
      {currentTab === 'home' && (
        <HomePage 
          onNavigate={handleTabNavigation} 
          heartRate={latestHeartRate}
        />
      )}

      {currentTab === 'hub' && (
        <AuthGuard onNavigateHome={() => setCurrentTab('home')} featureName={isGramPanchayat ? 'Patient Registration Desk' : 'Family Hub & Digital Health Records'}>
          {isGramPanchayat ? (
            <KioskDashboard 
              currentUser={currentUser}
              onVitalsChange={handleVitalsChange}
              onTriggerDoctorDispatch={() => setCurrentTab('navigation')}
              onNavigateToTriage={(walkInPatient) => {
                if (walkInPatient) {
                  setActiveMember(walkInPatient);
                  try {
                    localStorage.setItem('arogya_active_member', JSON.stringify(walkInPatient));
                    sessionStorage.setItem('activeKioskPatient', JSON.stringify(walkInPatient));
                  } catch (e) {}
                }
                setCurrentTab('triage');
              }}
            />
          ) : (
            <FamilyHub 
              currentUser={currentUser}
              onVitalsChange={handleVitalsChange}
              onTriggerDoctorDispatch={() => setCurrentTab('navigation')}
              onSelectActiveMember={setActiveMember}
              onNavigateToTriage={() => setCurrentTab('triage')}
            />
          )}
        </AuthGuard>
      )}

      {currentTab === 'triage' && (
        <AuthGuard onNavigateHome={() => setCurrentTab('home')} featureName="Symptom Checklist & 2-Day Rx Triage">
          <SymptomChecklistTriage 
            onNavigateToHospital={(hosp) => {
              if (hosp) setTargetHospital(hosp);
              setCurrentTab('navigation');
            }}
            onNavigateToHub={() => setCurrentTab('hub')}
            onKioskModalClose={() => {
              if (isGramPanchayat) {
                setActiveMember(null);
                try {
                  localStorage.removeItem('arogya_active_member');
                  localStorage.removeItem('arogya_active_member_id');
                  localStorage.removeItem('arogya_active_kiosk_patient');
                  sessionStorage.removeItem('activeKioskPatient');
                } catch (e) {}
                setCurrentTab('hub');
              }
            }}
            activeVitals={activeVitals}
            currentUser={currentUser}
            activeMember={activeMember}
            onSelectMember={setActiveMember}
          />
        </AuthGuard>
      )}

      {currentTab === 'navigation' && (
        <AuthGuard onNavigateHome={() => setCurrentTab('home')} featureName="Hospital Road Navigation">
          <HospitalNavigation targetHospital={targetHospital} />
        </AuthGuard>
      )}

      {currentTab === 'profile' && (
        <AuthGuard onNavigateHome={() => setCurrentTab('home')} featureName="My Health Profile">
          <ProfilePage 
            onNavigateHome={() => setCurrentTab('home')}
            onNavigate={handleTabNavigation}
          />
        </AuthGuard>
      )}

      {/* Dual-Role Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeLogin}
        onAuthSuccess={(user, token) => {
          login(token, user);
          const role = (user?.role || '').toLowerCase();
          const isGP = role === 'kiosk_operator' || role === 'grampanchayat' || role === 'gram_panchayat' || role === 'kiosk' || role === 'operator' || Boolean(user?.kioskId);
          if (isGP) {
            setCurrentTab('hub');
          }
        }}
        defaultRole={userRole === 'kiosk_operator' ? 'kiosk_operator' : 'citizen'}
        promptMessage={authToast}
      />

      {/* Persistent 1-Tap Emergency SOS Floating Beacon with 3s abort timer */}
      <EmergencySOSBeacon 
        onNavigateToHospital={() => handleTabNavigation('navigation')}
        activeVitals={activeVitals}
        currentUser={currentUser}
        onRequireAuth={(msg) => openLogin(msg || 'Please log in to continue.')}
      />

      {/* WhatsApp Voice Bot Simulator for Elderly Citizens */}
      <WhatsAppBotModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
      />

      {/* Offline PWA Status and Background Sync Queue Indicator */}
      <OfflineSyncIndicator />

      {/* State-Based Auto Language Notification Toast */}
      <StateLanguageToast />

      {/* Mandatory Profile Completion Gate for New Registered Users */}
      {currentUser && currentUser.role === 'citizen' && !currentUser.isProfileComplete && (
        <ProfileCompletionModal
          isOpen={true}
          currentUser={currentUser}
          onProfileComplete={(updatedUser) => updateUser(updatedUser)}
        />
      )}

      {/* Standalone Citizen Profile Edit Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updatedUser) => updateUser(updatedUser)}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
