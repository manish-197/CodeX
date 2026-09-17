import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [userRole, setUserRole] = useState('citizen');
  const [darkMode, setDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

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
      <div className="py-12 text-center">
        <div className="neo-glass-card p-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-terracotta/15 text-terracotta">
            Soft Neo-Glass • Earth & Sky Design System
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-deep-teal dark:text-sky-mist">
            ArogyaRakshak AI
          </h1>
          <p className="text-deep-teal/80 dark:text-dark-muted text-sm sm:text-base leading-relaxed">
            Global layout shell loaded with humanist typography, custom Tailwind tokens, and Lenis smooth scrolling.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button className="btn-terracotta">
              Explore Platform
            </button>
            <button className="btn-glass">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
