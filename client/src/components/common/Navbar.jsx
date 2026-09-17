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
  Stethoscope,
  LogOut,
  LogIn,
  Check,
  MessageCircle,
  ShieldCheck,
  User,
  Edit3
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../auth/AuthContext';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  darkMode, 
  setDarkMode,
  onOpenAuth,
  onLogout,
  onOpenWhatsApp,
  onOpenEditProfile
}) {
  const { lang, setLang, t } = useLanguage();
  const { currentUser, isAuthenticated, logout, openLogin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const languages = [
    { code: 'mr', name: 'मराठी', label: 'Marathi' },
    { code: 'hi', name: 'हिन्दी', label: 'Hindi' },
    { code: 'en', name: 'English', label: 'English' },
    { code: 'ta', name: 'தமிழ்', label: 'Tamil' },
    { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada' },
    { code: 'bn', name: 'বাংলা', label: 'Bengali' },
  ];

  // Feature navigation items
  const allNavItems = [
    { id: 'home', label: t('nav_home'), icon: Activity, public: true },
    { id: 'hub', label: t('nav_hub'), icon: UserCheck, public: false },
    { id: 'triage', label: t('nav_triage'), icon: Stethoscope, public: false },
    { id: 'navigation', label: t('nav_navigation'), icon: Navigation, public: false },
  ];

  // Pre-login: ONLY Home is visible. Post-login: All feature links appear.
  const visibleNavItems = isAuthenticated 
    ? allNavItems 
    : allNavItems.filter((item) => item.public);

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      setCurrentTab('home');
    }
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleOpenLogin = () => {
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      openLogin('Please log in to continue.');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto glass-card px-4 sm:px-6 py-3 flex items-center justify-between border border-white/80 dark:border-white/10 shadow-lg">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentTab('home')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-medical-blue to-caution-amber flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-deep-navy dark:text-clinical-white">
                ArogyaRakshak
              </span>
              <span className="bg-caution-amber/25 text-deep-navy dark:text-caution-amber text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-deep-navy/70 dark:text-dark-muted hidden sm:block font-medium">
              {t('nav_subtitle')}
            </p>
          </div>
        </div>

        {/* Desktop Nav Items (Gated strictly behind authentication) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  isActive 
                    ? 'btn-navy shadow-md' 
                    : 'text-deep-navy dark:text-clinical-white hover:bg-deep-navy/8 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Control Bar: WhatsApp Bot (Logged-In only), Language Picker, Auth, Dark Mode */}
        <div className="flex items-center gap-2">
          
          {/* WhatsApp Elder Bot Launch Button - Visible ONLY when logged in */}
          {isAuthenticated && (
            <button
              onClick={onOpenWhatsApp}
              title="Launch WhatsApp Voice Bot for Senior Citizens"
              className="px-3 py-1.5 rounded-full hover:bg-health-green/15 text-health-green transition-colors border border-health-green/30 flex items-center gap-1.5 bg-health-green/10"
              aria-label="WhatsApp Elder Voice Bot"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-bold">WhatsApp Bot</span>
            </button>
          )}

          {/* Regional Script Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-full hover:bg-deep-navy/10 dark:hover:bg-white/10 text-deep-navy dark:text-clinical-white transition-colors flex items-center gap-1.5 border border-deep-navy/15 glass-card"
              aria-label="Language selector"
            >
              <Globe className="w-4 h-4 text-medical-blue" />
              <span className="text-xs font-bold uppercase tracking-wider">{lang}</span>
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 glass-card shadow-2xl py-2 z-50 animate-fadeIn bg-white/95 dark:bg-dark-card/95 border border-deep-navy/15 rounded-3xl"
                data-lenis-prevent="true"
              >
                <div className="px-3 py-1 text-[10px] font-bold text-deep-navy/60 dark:text-dark-muted uppercase tracking-wider">
                  Select Language / भाषा निवडा
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-deep-navy/10 dark:hover:bg-white/10 transition-colors ${
                      lang === l.code ? 'font-bold text-medical-blue bg-medical-blue/10' : 'text-deep-navy dark:text-clinical-white'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs">{l.name}</span>
                      <span className="text-[10px] opacity-60">{l.label}</span>
                    </div>
                    {lang === l.code && <Check className="w-3.5 h-3.5 text-medical-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-deep-navy/10 dark:hover:bg-white/10 text-deep-navy dark:text-clinical-white transition-colors glass-card border border-deep-navy/15"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-caution-amber" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth Status & Profile Dropdown */}
          {isAuthenticated && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-deep-navy/20 hover:border-medical-blue transition-all shadow-sm group"
                aria-label="User profile menu"
              >
                {/* Avatar with initials */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-medical-blue to-caution-amber text-white font-bold text-xs flex items-center justify-center shadow-inner">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-deep-navy dark:text-clinical-white leading-tight">
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
                  </div>
                  <div className="text-[10px] text-medical-blue font-semibold uppercase tracking-wider leading-none">
                    {currentUser.role === 'kiosk_operator' ? 'Kiosk' : 'Citizen'}
                  </div>
                </div>

                <span className="text-[10px] text-deep-navy/60 dark:text-dark-muted ml-0.5">▼</span>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 glass-card shadow-2xl p-4 z-50 animate-fadeIn bg-white/95 dark:bg-dark-card/95 border border-deep-navy/15 rounded-3xl space-y-3"
                  data-lenis-prevent="true"
                >
                  {/* User Profile Header with Role Tag */}
                  <div className="flex items-start gap-3 pb-3 border-b border-deep-navy/10 dark:border-white/10">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-medical-blue to-caution-amber text-white font-bold text-base flex items-center justify-center shadow-md shrink-0">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-display font-bold text-sm text-deep-navy dark:text-clinical-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {currentUser.phone}
                      </div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white border border-deep-navy/15 dark:border-white/15">
                        {currentUser.role === 'kiosk_operator' ? 'Gram Panchayat Kiosk Operator' : 'Citizen Account'}
                      </span>
                    </div>
                  </div>

                  {/* Identification Details */}
                  <div className="p-2.5 rounded-2xl bg-deep-navy/5 dark:bg-white/5 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ArogyaRakshak ID:</span>
                      <strong className="font-mono text-medical-blue">
                        {currentUser.arogyaId || currentUser.abhaId || currentUser.kioskId || 'AR-2026-00001'}
                      </strong>
                    </div>
                    {currentUser.village && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Village:</span>
                        <strong className="text-deep-navy dark:text-clinical-white">{currentUser.village}</strong>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-1 pt-1">
                    {currentUser.role !== 'kiosk_operator' && (
                      <button
                        onClick={() => {
                          if (onOpenEditProfile) onOpenEditProfile();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-deep-navy dark:text-clinical-white hover:bg-deep-navy/10 transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Edit3 className="w-3.5 h-3.5 text-medical-blue" />
                          <span>{t('profile_edit_title') || 'Edit Profile / प्रोफाइल बदला'}</span>
                        </span>
                        <span className="text-medical-blue">→</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCurrentTab('hub');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-deep-navy dark:text-clinical-white hover:bg-deep-navy/10 transition-colors flex items-center justify-between"
                    >
                      <span>{currentUser.role === 'kiosk_operator' ? 'Kiosk Operator Desk' : 'Switch Family Member'}</span>
                      <span className="text-medical-blue">→</span>
                    </button>

                    <button
                      onClick={handleLogoutAction}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-alert-red hover:bg-alert-red/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / लॉग आउट</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleOpenLogin}
              className="btn-medical-blue text-xs py-2 px-4 shadow-md flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav_sign_in')}</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-deep-navy/5 dark:hover:bg-white/5 text-deep-navy dark:text-clinical-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 glass-card p-4 mx-auto max-w-7xl animate-fadeIn space-y-3 border border-white/80 bg-white/95 dark:bg-dark-card/95">
          
          {/* Navigation Links: ONLY Home when logged out; Full list when logged in */}
          <div className="space-y-1">
            {visibleNavItems.map((item) => {
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
                      ? 'btn-navy text-white w-full' 
                      : 'text-deep-navy dark:text-clinical-white hover:bg-deep-navy/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* WhatsApp Elder Bot: Only visible when logged in */}
          {isAuthenticated && (
            <button
              onClick={() => {
                if (onOpenWhatsApp) onOpenWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-health-green bg-health-green/15"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Launch WhatsApp Elder Bot</span>
            </button>
          )}

          {/* Mobile Auth Bar: Sign In button if logged out; Profile & Sign Out if logged in */}
          <div className="pt-2 border-t border-deep-navy/10 dark:border-white/10">
            {isAuthenticated && currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-medical-blue to-caution-amber text-white font-bold text-xs flex items-center justify-center">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-xs font-bold text-deep-navy dark:text-clinical-white truncate max-w-[150px]">
                      {currentUser.name}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white">
                    {currentUser.role === 'kiosk_operator' ? 'Kiosk' : 'Citizen'}
                  </span>
                </div>
                {currentUser.role !== 'kiosk_operator' && (
                  <button
                    onClick={() => {
                      if (onOpenEditProfile) onOpenEditProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-4 rounded-xl text-xs font-bold text-medical-blue bg-medical-blue/10 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('profile_edit_title') || 'Edit Profile / प्रोफाइल बदला'}</span>
                  </button>
                )}
                <button
                  onClick={handleLogoutAction}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-alert-red bg-alert-red/10 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / लॉग आउट</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenLogin}
                className="w-full btn-medical-blue py-2.5 text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('nav_sign_in')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
