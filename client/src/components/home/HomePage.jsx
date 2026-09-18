import React, { useEffect, useRef } from 'react';
import HeartDigitalTwin from './HeartDigitalTwin';
import { 
  Stethoscope, 
  Navigation, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  ArrowUpRight,
  Activity,
  Globe,
  Radio,
  FileText,
  Clock,
  Heart,
  Bluetooth,
  WifiOff,
  MessageSquare,
  UserPlus
} from 'lucide-react';
import gsap from 'gsap';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../auth/AuthContext';

export default function HomePage({ onNavigate, heartRate = 0 }) {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();
  const heroRef = useRef(null);
  const cardsRef = useRef(null);

  const isGramPanchayat = Boolean(
    currentUser?.role === 'kiosk_operator' ||
    currentUser?.role === 'grampanchayat' ||
    currentUser?.role === 'gram_panchayat' ||
    currentUser?.role === 'kiosk' ||
    currentUser?.role === 'operator' ||
    currentUser?.kioskId ||
    (currentUser?.email && (currentUser.email.includes('kiosk') || currentUser.email.includes('grampanchayat')))
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-fade-in', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'all',
      });

      gsap.from('.feature-card', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.25,
        clearProps: 'all',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = isGramPanchayat ? [
    {
      title: lang === 'mr' ? 'रुग्ण नोंदणी डेस्क' : lang === 'hi' ? 'रोगी पंजीकरण डेस्क' : 'Patient Registration Desk',
      description: lang === 'mr' 
        ? 'येणाऱ्या रुग्णांचे सर्व तपशील भरा, जीवनचिन्हे नोंदवा व लक्षण तपासणीसाठी पुढे पाठवा.' 
        : 'Register walk-in citizens, record vitals, and proceed to clinical triage.',
      icon: UserPlus,
      actionText: lang === 'mr' ? 'नोंदणी करा →' : 'Register Patient →',
      tab: 'hub',
      badge: lang === 'mr' ? 'ग्रामपंचायत किओस्क' : 'Kiosk Terminal',
      badgeColor: 'bg-medical-blue/15 text-medical-blue',
    },
    {
      title: t('feat_triage_title'),
      description: t('feat_triage_desc'),
      icon: Stethoscope,
      actionText: t('hero_cta_triage'),
      tab: 'triage',
      badge: 'Checklist & 2-Day Rx',
      badgeColor: 'bg-medical-blue/15 text-medical-blue',
    },
    {
      title: t('feat_nav_title'),
      description: t('feat_nav_desc'),
      icon: Navigation,
      actionText: t('hero_cta_hospital'),
      tab: 'navigation',
      badge: 'OSRM + Leaflet',
      badgeColor: 'bg-deep-navy/15 text-deep-navy dark:text-clinical-white',
    },
    {
      title: lang === 'mr' ? 'रुग्ण व प्रिस्क्रिप्शन इतिहास' : 'Patient & Rx History',
      description: lang === 'mr'
        ? 'केंद्रात तपासलेल्या सर्व रुग्णांची यादी, औषध पत्रके व आरोग्य कार्ड्स PDF डाउनलोड करा.'
        : 'View registered walk-in patients and download consultation Rx PDFs.',
      icon: ShieldCheck,
      actionText: lang === 'mr' ? 'इतिहास पहा →' : 'View History →',
      tab: 'hub',
      badge: 'Kiosk Records',
      badgeColor: 'bg-caution-amber/20 text-deep-navy dark:text-caution-amber',
    },
  ] : [
    {
      title: t('feat_triage_title'),
      description: t('feat_triage_desc'),
      icon: Stethoscope,
      actionText: t('hero_cta_triage'),
      tab: 'triage',
      badge: 'Checklist & 2-Day Rx',
      badgeColor: 'bg-medical-blue/15 text-medical-blue',
    },
    {
      title: t('feat_nav_title'),
      description: t('feat_nav_desc'),
      icon: Navigation,
      actionText: t('hero_cta_hospital'),
      tab: 'navigation',
      badge: 'OSRM + Leaflet',
      badgeColor: 'bg-deep-navy/15 text-deep-navy dark:text-clinical-white',
    },
    {
      title: t('feat_hub_title'),
      description: t('feat_hub_desc'),
      icon: Users,
      actionText: t('nav_hub'),
      tab: 'hub',
      badge: 'ABDM Compatible',
      badgeColor: 'bg-health-green/15 text-health-green',
    },
    {
      title: t('feat_kiosk_title'),
      description: t('feat_kiosk_desc'),
      icon: ShieldCheck,
      actionText: t('nav_kiosk_mode'),
      tab: 'hub',
      badge: 'Senior Care',
      badgeColor: 'bg-caution-amber/20 text-deep-navy dark:text-caution-amber',
    },
  ];

  return (
    <div ref={heroRef} className="space-y-16 py-4 sm:py-8">
      
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Hero Copy & CTA */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Mission Pill */}
          <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-bold text-deep-navy dark:text-clinical-white shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-medical-blue animate-pulse" />
            <span>
              {isGramPanchayat 
                ? (lang === 'mr' ? 'ग्रामपंचायत डिजिटल हेल्थ किओस्क ऑपरेटर केंद्र' : 'Gram Panchayat Digital Health Kiosk Operator Center') 
                : t('hero_badge')}
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="hero-fade-in font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-deep-navy dark:text-clinical-white leading-[1.14] tracking-tight">
            {isGramPanchayat 
              ? (lang === 'mr' ? 'ग्रामपंचायत रुग्ण नोंदणी व डिजिटल आरोग्य डेस्क' : 'Gram Panchayat Patient Registration & Digital Health Desk')
              : t('hero_headline')}
          </h1>

          {/* Subheadline */}
          <p className="hero-fade-in text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-2xl">
            {isGramPanchayat 
              ? (lang === 'mr' ? 'गावातील नागरिकांची आरोग्य नोंदणी करा, लक्षणे तपासून तात्पुरते औषध पत्रक द्या व आवश्यकतेनुसार रुग्णालय मार्गदर्शन करा.' : 'Register village citizens, evaluate symptoms for safe 2-day OTC prescriptions, and provide instant emergency hospital routing.')
              : t('hero_subheadline')}
          </p>

          {/* Action CTAs */}
          <div className="hero-fade-in flex flex-wrap items-center gap-4 pt-2">
            {isGramPanchayat ? (
              <button 
                onClick={() => onNavigate('hub')}
                className="btn-medical-blue text-sm sm:text-base py-3.5 px-8 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>{lang === 'mr' ? 'रुग्ण नोंदणी डेस्क (Registration)' : 'Patient Registration Desk'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('triage')}
                className="btn-medical-blue text-sm sm:text-base py-3.5 px-8 flex items-center gap-2"
              >
                <Stethoscope className="w-5 h-5" />
                <span>{t('hero_cta_triage')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button 
              onClick={() => onNavigate('navigation')}
              className="btn-navy text-sm sm:text-base py-3.5 px-7 flex items-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              <span>{t('hero_cta_hospital')}</span>
            </button>
          </div>

          {/* Distinct Feature Highlight Chips with generous spacing */}
          <div className="hero-fade-in pt-2">
            <div className="flex flex-wrap gap-3">
              <div className="glass-card px-4 py-2.5 flex items-center gap-2.5 text-xs font-bold text-deep-navy dark:text-clinical-white shadow-sm">
                <Activity className="w-4 h-4 text-health-green shrink-0" />
                <span>{t('hero_zero_vitals_badge')}</span>
              </div>
              
              <div className="glass-card px-4 py-2.5 flex items-center gap-2.5 text-xs font-bold text-deep-navy dark:text-clinical-white shadow-sm">
                <Globe className="w-4 h-4 text-caution-amber shrink-0" />
                <span>{t('hero_state_detect_badge')}</span>
              </div>
              
              <div className="glass-card px-4 py-2.5 flex items-center gap-2.5 text-xs font-bold text-deep-navy dark:text-clinical-white shadow-sm">
                <Radio className="w-4 h-4 text-alert-red shrink-0" />
                <span>{t('hero_sos_badge')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: 3D Anatomical Heart Digital Twin wrapped in a styled .glass-card */}
        <div className="hero-fade-in lg:col-span-5 flex flex-col items-center">
          <div className="w-full glass-card p-6 sm:p-7 relative overflow-hidden shadow-2xl border border-white/70 dark:border-white/10 group">
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-medical-blue block">
                  {t('hero_3d_tag')}
                </span>
                <h3 className="font-display font-bold text-xl text-deep-navy dark:text-clinical-white">
                  {t('hero_3d_title')}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white">
                Three.js WebGL
              </span>
            </div>

            {/* Three.js Anatomical Heart Canvas */}
            <div className="relative rounded-2xl overflow-hidden py-2">
              <HeartDigitalTwin heartRate={heartRate} />
            </div>

            <div className="mt-4 pt-3 border-t border-deep-navy/10 dark:border-white/10 flex items-center justify-between text-xs text-deep-navy/80 dark:text-dark-muted">
              <span>{t('hero_3d_sub')}</span>
              <span className="text-medical-blue font-bold">
                {heartRate > 0 ? t('hero_3d_pulse_live') : t('hero_3d_idle')}
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* Feature Pillar Grid */}
      <section ref={cardsRef} className="space-y-6 pt-10 sm:pt-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-medical-blue">
              {t('home_platform_tag')}
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white">
              {t('home_platform_title')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
            {t('home_platform_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                onClick={() => onNavigate(item.tab)}
                className="feature-card glass-card p-6 flex flex-col justify-between cursor-pointer group hover:border-medical-blue/60"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medical-blue to-caution-amber flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-deep-navy dark:text-clinical-white group-hover:text-medical-blue transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-deep-navy/10 dark:border-white/10 flex items-center justify-between text-xs font-bold text-deep-navy dark:text-clinical-white group-hover:text-medical-blue transition-colors">
                  <span>{item.actionText}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Six Extra Features Overview Strip */}
      <section className="glass-card p-6 sm:p-8 space-y-5 border-l-4 border-medical-blue shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-medical-blue">
              {t('home_ecosystem_tag')}
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-deep-navy dark:text-clinical-white">
              {t('home_ecosystem_title')}
            </h3>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-health-green/20 text-health-green self-start sm:self-auto">
            {t('home_ecosystem_badge')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl glass-card border border-deep-navy/10 dark:border-white/10 shadow-sm">
            <span className="font-bold text-deep-navy dark:text-clinical-white block">{t('home_feat_ocr_title')}</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">{t('home_feat_ocr_sub')}</span>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-alert-red/20 shadow-sm">
            <span className="font-bold text-alert-red block">{t('home_feat_sos_title')}</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">{t('home_feat_sos_sub')}</span>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-deep-navy/10 dark:border-white/10 shadow-sm">
            <span className="font-bold text-deep-navy dark:text-clinical-white block">{t('home_feat_pwa_title')}</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">{t('home_feat_pwa_sub')}</span>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-deep-navy/10 dark:border-white/10 shadow-sm">
            <span className="font-bold text-deep-navy dark:text-clinical-white block">{t('home_feat_wa_title')}</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">{t('home_feat_wa_sub')}</span>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-deep-navy/10 dark:border-white/10 shadow-sm">
            <span className="font-bold text-deep-navy dark:text-clinical-white block">{t('home_feat_card_title')}</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">{t('home_feat_card_sub')}</span>
          </div>
          <div className="p-3.5 rounded-2xl glass-card border border-deep-navy/10 dark:border-white/10 shadow-sm">
            <span className="font-bold text-deep-navy dark:text-clinical-white block">{t('home_feat_ble_title')}</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">{t('home_feat_ble_sub')}</span>
          </div>
        </div>
      </section>

    </div>
  );
}
