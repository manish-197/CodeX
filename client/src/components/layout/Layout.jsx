import React, { useEffect } from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import Lenis from 'lenis';

export default function Layout({ 
  children, 
  currentTab, 
  setCurrentTab, 
  userRole, 
  setUserRole, 
  darkMode, 
  setDarkMode,
  currentLang,
  onSelectLang
}) {
  // Initialize Lenis smooth scroll with support for data-lenis-prevent
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className={`relative min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Ambient background soft glowing blobs for soft neo-glass effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-terracotta/15 dark:bg-terracotta/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-sun-gold/15 dark:bg-sun-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-deep-teal/15 dark:bg-deep-teal/20 blur-3xl" />
      </div>

      {/* Global Navigation Bar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentLang={currentLang}
        onSelectLang={onSelectLang}
      />

      {/* Main Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
