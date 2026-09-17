import React, { useEffect, useRef } from 'react';
import HeartDigitalTwin from './HeartDigitalTwin';
import { 
  PhoneCall, 
  Navigation, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import gsap from 'gsap';
import { useLanguage } from '../../i18n/LanguageContext';

export default function HomePage({ onNavigate, heartRate = 0 }) {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-fade-in', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      gsap.from('.feature-card', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      title: t('feat_triage_title'),
      description: t('feat_triage_desc'),
      icon: PhoneCall,
      actionText: t('hero_cta_triage'),
      tab: 'triage',
      badge: 'Gemini 2.5 Flash',
    },
    {
      title: t('feat_nav_title'),
      description: t('feat_nav_desc'),
      icon: Navigation,
      actionText: t('hero_cta_hospital'),
      tab: 'navigation',
      badge: 'OSRM + Leaflet',
    },
    {
      title: t('feat_hub_title'),
      description: t('feat_hub_desc'),
      icon: Users,
      actionText: t('nav_hub'),
      tab: 'hub',
      badge: 'ABDM',
    },
    {
      title: t('feat_kiosk_title'),
      description: t('feat_kiosk_desc'),
      icon: ShieldCheck,
      actionText: t('nav_kiosk_mode'),
      tab: 'hub',
      badge: 'Senior Care',
    },
  ];

  return (
    <div ref={heroRef} className="space-y-16 py-4 sm:py-8">
      
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Col: Hero Copy */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full neo-glass-card text-xs font-semibold text-deep-teal dark:text-sky-mist">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <span>{t('hero_badge')}</span>
          </div>

          <h1 className="hero-fade-in font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-deep-teal dark:text-sky-mist leading-[1.12] tracking-tight">
            {t('hero_headline')}
          </h1>

          <p className="hero-fade-in text-base sm:text-lg text-deep-teal/80 dark:text-sky-mist/80 leading-relaxed font-sans max-w-2xl">
            {t('hero_subheadline')}
          </p>

          <div className="hero-fade-in flex flex-wrap items-center gap-4 pt-2">
            <button 
              onClick={() => onNavigate('triage')}
              className="btn-terracotta text-sm sm:text-base py-3.5 px-7"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{t('hero_cta_triage')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button 
              onClick={() => onNavigate('navigation')}
              className="btn-teal text-sm sm:text-base py-3.5 px-6 dark:bg-sky-mist dark:text-deep-teal"
            >
              <Navigation className="w-5 h-5" />
              <span>{t('hero_cta_hospital')}</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="hero-fade-in pt-4 flex flex-wrap items-center gap-6 text-xs text-deep-teal/70 dark:text-dark-muted font-medium border-t border-deep-teal/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-leaf-green" />
              <span>{t('hero_zero_vitals_badge')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sun-gold" />
              <span>{t('hero_state_detect_badge')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terracotta" />
              <span>{t('hero_sos_badge')}</span>
            </div>
          </div>

        </div>

        {/* Right Col: 3D Anatomical Heart Digital Twin */}
        <div className="hero-fade-in lg:col-span-5 flex flex-col items-center">
          <div className="w-full neo-glass-card p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta">
                  {t('hero_3d_tag')}
                </span>
                <h3 className="font-display font-bold text-lg text-deep-teal dark:text-sky-mist">
                  {t('hero_3d_title')}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-deep-teal/10 dark:bg-white/10 text-deep-teal dark:text-sky-mist">
                Three.js
              </span>
            </div>

            {/* Three.js Canvas Container */}
            <HeartDigitalTwin heartRate={heartRate} />

            <div className="mt-4 pt-3 border-t border-deep-teal/10 dark:border-white/10 flex items-center justify-between text-xs text-deep-teal/70 dark:text-dark-muted">
              <span>{t('hero_3d_sub')}</span>
              <span className="text-terracotta font-semibold">{heartRate > 0 ? t('hero_3d_pulse_live') : t('hero_3d_idle')}</span>
            </div>
          </div>
        </div>

      </section>

      {/* Feature Pillar Grid */}
      <section ref={cardsRef} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
              Platform Capabilities
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-deep-teal dark:text-sky-mist">
              Engineered for Bharat's Real Healthcare Challenges
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                onClick={() => onNavigate(item.tab)}
                className="feature-card neo-glass-card p-6 flex flex-col justify-between cursor-pointer group hover:border-terracotta/50 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-terracotta to-sun-gold flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-deep-teal/10 dark:bg-white/10 text-deep-teal dark:text-sky-mist">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-deep-teal dark:text-sky-mist group-hover:text-terracotta transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-deep-teal/75 dark:text-dark-muted mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-deep-teal/10 dark:border-white/10 flex items-center justify-between text-xs font-bold text-deep-teal dark:text-sky-mist group-hover:text-terracotta transition-colors">
                  <span>{item.actionText}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
