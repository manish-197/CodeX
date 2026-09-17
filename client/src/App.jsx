import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './components/home/HomePage';
import FamilyHub from './components/family/FamilyHub';
import VoiceTriage from './components/triage/VoiceTriage';
import HospitalNavigation from './components/navigation/HospitalNavigation';
import AuthModal from './components/auth/AuthModal';
import StateLanguageToast from './components/common/StateLanguageToast';
import EmergencySOSBeacon from './components/common/EmergencySOSBeacon';
import { LanguageProvider } from './i18n/LanguageContext';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('home');
  const [userRole, setUserRole] = useState('citizen');
  const [darkMode, setDarkMode] = useState(false);
  
  // Latest recorded heart rate (strictly 0 BPM initial per zero dummy data rule)
  const [latestHeartRate, setLatestHeartRate] = useState(0);
  const [activeVitals, setActiveVitals] = useState({
    bp: { sys: 0, dia: 0 },
    heartRate: 0,
    spo2: 0,
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Restore existing session from localStorage if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('arogya_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role) setUserRole(parsed.role === 'kiosk_operator' ? 'kiosk' : 'citizen');
      }
    } catch (e) {
      console.warn('Session restore skipped', e);
    }
  }, []);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('arogya_token');
    localStorage.removeItem('arogya_user');
    setCurrentUser(null);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user.role) {
      setUserRole(user.role === 'kiosk_operator' ? 'kiosk' : 'citizen');
    }
  };

  const handleVitalsChange = (bpm, fullVitals) => {
    setLatestHeartRate(bpm || 0);
    if (fullVitals) setActiveVitals(fullVitals);
  };

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      userRole={userRole}
      setUserRole={setUserRole}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      currentUser={currentUser}
      onOpenAuth={() => setAuthModalOpen(true)}
      onLogout={handleLogout}
    >
      {currentTab === 'home' && (
        <HomePage 
          onNavigate={(tab) => setCurrentTab(tab)} 
          heartRate={latestHeartRate}
        />
      )}

      {currentTab === 'hub' && (
        <FamilyHub 
          currentUser={currentUser}
          onVitalsChange={handleVitalsChange}
          onNavigateToPrescription={() => alert('Prescription OCR activates in Slice 11')}
          onOpenBleModal={() => alert('Web Bluetooth BLE sync activates in Slice 12')}
          onTriggerDoctorDispatch={() => setCurrentTab('navigation')}
        />
      )}

      {currentTab === 'triage' && (
        <VoiceTriage 
          onNavigateToHospital={() => setCurrentTab('navigation')}
          activeVitals={activeVitals}
        />
      )}

      {currentTab === 'navigation' && (
        <HospitalNavigation />
      )}

      {/* Dual-Role Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultRole={userRole === 'kiosk' ? 'kiosk_operator' : 'citizen'}
      />

      {/* Persistent 1-Tap Emergency SOS Floating Beacon with 3s abort timer */}
      <EmergencySOSBeacon 
        onNavigateToHospital={() => setCurrentTab('navigation')}
        activeVitals={activeVitals}
        currentUser={currentUser}
      />

      {/* State-Based Auto Language Notification Toast */}
      <StateLanguageToast />
    </Layout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
