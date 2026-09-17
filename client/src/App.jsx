import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './components/home/HomePage';
import FamilyHub from './components/family/FamilyHub';
import KioskDashboard from './components/kiosk/KioskDashboard';
import VoiceTriage from './components/triage/VoiceTriage';
import HospitalNavigation from './components/navigation/HospitalNavigation';
import AuthModal from './components/auth/AuthModal';
import StateLanguageToast from './components/common/StateLanguageToast';
import EmergencySOSBeacon from './components/common/EmergencySOSBeacon';
import OfflineSyncIndicator from './components/common/OfflineSyncIndicator';
import WhatsAppBotModal from './components/common/WhatsAppBotModal';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AuthGuard from './auth/AuthGuard';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('home');
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

  const handleTabNavigation = (targetTab) => {
    if (targetTab === 'home') {
      setCurrentTab('home');
      return;
    }

    // Protected features require auth
    if (requireAuth(() => setCurrentTab(targetTab), `Please log in to access ${targetTab === 'hub' ? 'Family Hub' : targetTab === 'triage' ? 'Voice Triage' : 'Hospital Navigation'}.`)) {
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
    >
      {currentTab === 'home' && (
        <HomePage 
          onNavigate={handleTabNavigation} 
          heartRate={latestHeartRate}
        />
      )}

      {currentTab === 'hub' && (
        <AuthGuard onNavigateHome={() => setCurrentTab('home')} featureName="Family Hub & Digital Health Records">
          {currentUser?.role === 'kiosk_operator' ? (
            <KioskDashboard 
              currentUser={currentUser}
              onVitalsChange={handleVitalsChange}
              onTriggerDoctorDispatch={() => setCurrentTab('navigation')}
              onNavigateToTriage={() => setCurrentTab('triage')}
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
          <VoiceTriage 
            onNavigateToHospital={() => setCurrentTab('navigation')}
            onNavigateToHub={() => setCurrentTab('hub')}
            activeVitals={activeVitals}
            currentUser={currentUser}
            activeMember={activeMember}
            onSelectMember={setActiveMember}
          />
        </AuthGuard>
      )}

      {currentTab === 'navigation' && (
        <AuthGuard onNavigateHome={() => setCurrentTab('home')} featureName="Hospital Road Navigation">
          <HospitalNavigation />
        </AuthGuard>
      )}

      {/* Dual-Role Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeLogin}
        onAuthSuccess={(user, token) => login(token, user)}
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
