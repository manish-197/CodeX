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
  LogOut,
  LogIn,
  Check,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  userRole = 'citizen', 
  setUserRole, 
  darkMode, 
  setDarkMode,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenWhatsApp
}) {
  const { lang, setLang, t } = useLanguage();
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
    { id: 'home', label: t('nav_home'), icon: Activity },
    { id: 'hub', label: t('nav_hub'), icon: UserCheck },
    { id: 'triage', label: t('nav_triage'), icon: PhoneCall },
    { id: 'navigation', label: t('nav_navigation'), icon: Navigation },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto glass-card px-4 sm:px-6 py-3 flex items-center justify-between border border-white/80 dark:border-white/10 shadow-lg">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentTab('home')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-terracotta to-sun-gold flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-deep-teal dark:text-sky-mist">
                ArogyaRakshak
              </span>
              <span className="bg-sun-gold/25 text-deep-teal dark:text-sun-gold text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-deep-teal/70 dark:text-dark-muted hidden sm:block font-medium">
              {t('nav_subtitle')}
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  isActive 
                    ? 'btn-teal shadow-md' 
                    : 'text-deep-teal dark:text-sky-mist hover:bg-deep-teal/8 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Control Bar: WhatsApp Bot, Role Switch, Language Picker, Auth, Dark Mode */}
        <div className="flex items-center gap-2">
          
          {/* WhatsApp Elder Bot Launch Button */}
          <button
            onClick={onOpenWhatsApp}
            title="Launch WhatsApp Voice Bot for Senior Citizens"
            className="px-3 py-1.5 rounded-full hover:bg-leaf-green/15 text-leaf-green transition-colors border border-leaf-green/30 flex items-center gap-1.5 bg-leaf-green/10"
            aria-label="WhatsApp Elder Voice Bot"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-bold">WhatsApp Bot</span>
          </button>

          {/* Dual-Role Indicator / Toggle */}
          <button
            onClick={() => setUserRole(userRole === 'citizen' ? 'kiosk' : 'citizen')}
            title="Toggle between Citizen and Gram Panchayat Kiosk mode"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-deep-teal/20 dark:border-white/10 hover:border-terracotta transition-colors glass-card"
          >
            <span className={`w-2 h-2 rounded-full ${userRole === 'kiosk' ? 'bg-sun-gold animate-pulse' : 'bg-leaf-green'}`} />
            <span className="text-deep-teal dark:text-sky-mist">
              {userRole === 'kiosk' ? t('nav_kiosk_mode') : t('nav_citizen_mode')}
            </span>
          </button>

          {/* Regional Script Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-full hover:bg-deep-teal/10 dark:hover:bg-white/10 text-deep-teal dark:text-sky-mist transition-colors flex items-center gap-1.5 border border-deep-teal/15 glass-card"
              aria-label="Language selector"
            >
              <Globe className="w-4 h-4 text-terracotta" />
              <span className="text-xs font-bold uppercase tracking-wider">{lang}</span>
            </button>

            {langMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 glass-card shadow-2xl py-2 z-50 animate-fadeIn bg-white/95 dark:bg-dark-card/95 border border-deep-teal/15 rounded-3xl"
                data-lenis-prevent="true"
              >
                <div className="px-3 py-1 text-[10px] font-bold text-deep-teal/60 dark:text-dark-muted uppercase tracking-wider">
                  Select Language / भाषा निवडा
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-deep-teal/10 dark:hover:bg-white/10 transition-colors ${
                      lang === l.code ? 'font-bold text-terracotta bg-terracotta/10' : 'text-deep-teal dark:text-sky-mist'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs">{l.name}</span>
                      <span className="text-[10px] opacity-60">{l.label}</span>
                    </div>
                    {lang === l.code && <Check className="w-3.5 h-3.5 text-terracotta" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-deep-teal/10 dark:hover:bg-white/10 text-deep-teal dark:text-sky-mist transition-colors glass-card border border-deep-teal/15"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-sun-gold" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth status & Single Clean Logout */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-bold text-deep-teal dark:text-sky-mist px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-white/10">
                {currentUser.name.split(' ')[0]}
              </span>
              <button
                onClick={onLogout}
                title={t('nav_logout')}
                className="p-2 rounded-full text-alert-crimson hover:bg-alert-crimson/10 transition-colors"
                aria-label={t('nav_logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-terracotta text-xs py-2 px-4"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav_sign_in')}</span>
            </button>
          )}

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
        <div className="md:hidden mt-2 glass-card p-4 mx-auto max-w-7xl animate-fadeIn space-y-2 border border-white/80">
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
                    ? 'btn-teal text-white w-full' 
                    : 'text-deep-teal dark:text-sky-mist hover:bg-deep-teal/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              if (onOpenWhatsApp) onOpenWhatsApp();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-leaf-green bg-leaf-green/15"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Launch WhatsApp Elder Bot</span>
          </button>

          <div className="pt-2 border-t border-deep-teal/10 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-deep-teal/70 dark:text-dark-muted">Mode</span>
            <button
              onClick={() => setUserRole(userRole === 'citizen' ? 'kiosk' : 'citizen')}
              className="px-3 py-1 rounded-full text-xs font-medium bg-terracotta/15 text-terracotta"
            >
              {userRole === 'kiosk' ? t('nav_citizen_mode') : t('nav_kiosk_mode')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
