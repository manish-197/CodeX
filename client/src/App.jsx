import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './components/home/HomePage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [userRole, setUserRole] = useState('citizen');
  const [darkMode, setDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  // Latest recorded heart rate (0 BPM default per zero dummy data discipline)
  const [latestHeartRate, setLatestHeartRate] = useState(0);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      userRole={userRole}
      setUserRole={setUserRole}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      currentLang={currentLang}
      onSelectLang={setCurrentLang}
    >
      {currentTab === 'home' && (
        <HomePage 
          onNavigate={(tab) => setCurrentTab(tab)} 
          heartRate={latestHeartRate}
        />
      )}

      {currentTab !== 'home' && (
        <div className="py-12 neo-glass-card p-8 text-center space-y-3 max-w-xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-deep-teal dark:text-sky-mist capitalize">
            {currentTab === 'hub' ? 'Family Health Hub' : currentTab === 'triage' ? 'Voice AI Clinical Triage' : 'Hospital Navigation'}
          </h2>
          <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
            Section ready for incremental activation in upcoming build slice.
          </p>
          <button 
            onClick={() => setCurrentTab('home')}
            className="btn-terracotta text-xs mt-2"
          >
            Back to Home
          </button>
        </div>
      )}
    </Layout>
  );
}
