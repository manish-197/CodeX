import React, { useState } from 'react';
import { 
  Heart, 
  Globe, 
  Sun, 
  Moon, 
  UserCheck, 
  Menu, 
  X, 
  Activity, 
  Navigation, 
  PhoneCall,
  ShieldAlert
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  userRole = 'citizen', 
  setUserRole, 
  darkMode, 
  setDarkMode,
  currentLang = 'en',
  onSelectLang
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: 'mr', name: 'मराठी', label: 'Marathi' },
    { code: 'hi', name: 'हिन्दी', label: 'Hindi' },
    { code: 'en', name: 'English', label: 'English' },
    { code: 'ta', name: 'தமிழ்', label: 'Tamil' },
    { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada' },
    { code: 'bn', name: 'বাংলা', label: 'Bengali' },
  ];

  const navItems = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'hub', label: 'Family Hub', icon: UserCheck },
    { id: 'triage', label: 'Voice AI Triage', icon: PhoneCall },
    { id: 'navigation', label: 'Hospital Route', icon: Navigation },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto neo-glass-card px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentTab('home')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-terracotta to-sun-gold flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-deep-teal dark:text-sky-mist">
                ArogyaRakshak
              </span>
              <span className="bg-sun-gold/20 text-deep-teal dark:text-sun-gold text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-deep-teal/70 dark:text-dark-muted hidden sm:block font-medium">
              आरोग्यरक्षक • Rural Healthcare Hub
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive 
                    ? 'bg-deep-teal text-white shadow-sm dark:bg-sky-mist dark:text-deep-teal' 
                    : 'text-deep-teal/80 dark:text-sky-mist/80 hover:bg-deep-teal/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Control Bar: Role Switch, Language Picker, Dark Mode Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Dual-Role Indicator / Toggle */}
          <button
            onClick={() => setUserRole(userRole === 'citizen' ? 'kiosk' : 'citizen')}
            title="Toggle between Citizen and Gram Panchayat Kiosk mode"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-deep-teal/15 dark:border-white/10 hover:border-terracotta transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${userRole === 'kiosk' ? 'bg-sun-gold animate-pulse' : 'bg-leaf-green'}`} />
            <span className="text-deep-teal dark:text-sky-mist">
              {userRole === 'kiosk' ? 'Gram Panchayat Kiosk' : 'Citizen Mode'}
            </span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-full hover:bg-deep-teal/5 dark:hover:bg-white/5 text-deep-teal dark:text-sky-mist transition-colors flex items-center gap-1"
              aria-label="Language selector"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{currentLang}</span>
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-44 neo-glass-card shadow-xl py-2 z-50 animate-fadeIn"
                data-lenis-prevent="true"
              >
                <div className="px-3 py-1 text-[11px] font-bold text-deep-teal/60 dark:text-dark-muted uppercase">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      if (onSelectLang) onSelectLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-deep-teal/10 dark:hover:bg-white/10 transition-colors ${
                      currentLang === l.code ? 'font-bold text-terracotta' : 'text-deep-teal dark:text-sky-mist'
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className="text-[10px] opacity-60">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-deep-teal/5 dark:hover:bg-white/5 text-deep-teal dark:text-sky-mist transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-sun-gold" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-deep-teal/5 dark:hover:bg-white/5 text-deep-teal dark:text-sky-mist"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 neo-glass-card p-4 mx-auto max-w-7xl animate-fadeIn space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-deep-teal text-white' 
                    : 'text-deep-teal dark:text-sky-mist hover:bg-deep-teal/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-deep-teal/10 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-deep-teal/70 dark:text-dark-muted">Mode</span>
            <button
              onClick={() => setUserRole(userRole === 'citizen' ? 'kiosk' : 'citizen')}
              className="px-3 py-1 rounded-full text-xs font-medium bg-terracotta/10 text-terracotta"
            >
              {userRole === 'kiosk' ? 'Switch to Citizen' : 'Switch to Kiosk Operator'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
