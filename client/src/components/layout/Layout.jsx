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
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenWhatsApp
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
      {/* Full-bleed continuous ambient background system with soft medical imagery and tinted overlays */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
        {/* Soft, low-contrast ambient medical texture with overlay blend */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 dark:opacity-15 transition-opacity duration-700 scale-105 filter blur-[2px]"
          style={{
            backgroundImage: "url('/images/medical_ambient_bg.jpg')",
          }}
        />

        {/* Continuous gradient tint overlay matching clinical palette tokens */}
        <div className="absolute inset-0 bg-gradient-to-b from-clinical-white/60 via-transparent to-clinical-white/80 dark:from-[#050E18]/70 dark:via-transparent dark:to-[#071524]/80" />

        {/* Ambient medical-blue and soft-cyan luminous glow nodes */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-medical-blue/20 dark:bg-medical-blue/15 blur-[120px] transition-all" />
        <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-soft-cyan/25 dark:bg-soft-cyan/12 blur-[130px] transition-all" />
        <div className="absolute bottom-10 left-1/4 w-[700px] h-[700px] rounded-full bg-health-green/12 dark:bg-health-green/8 blur-[140px] transition-all" />
        <div className="absolute top-3/4 right-1/4 w-[500px] h-[500px] rounded-full bg-medical-blue/15 dark:bg-deep-navy/30 blur-[120px] transition-all" />
      </div>

      {/* Global Navigation Bar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        onOpenWhatsApp={onOpenWhatsApp}
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
