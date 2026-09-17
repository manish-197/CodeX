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
      {/* Ambient background glowing gradient blobs for Soft Neo-Glass, Earth & Sky */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#E4714E]/20 dark:bg-[#E4714E]/12 blur-[100px]" />
        <div className="absolute top-1/4 -right-32 w-[520px] h-[520px] rounded-full bg-[#F4B942]/25 dark:bg-[#F4B942]/10 blur-[110px]" />
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] rounded-full bg-[#0F5E5E]/15 dark:bg-[#0F5E5E]/20 blur-[120px]" />
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
