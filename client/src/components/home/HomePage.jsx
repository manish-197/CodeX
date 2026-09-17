import React, { useEffect, useRef } from 'react';
import HeartDigitalTwin from './HeartDigitalTwin';
import { 
  PhoneCall, 
  Navigation, 
  ShieldCheck, 
  Users, 
  FileText, 
  WifiOff, 
  Radio, 
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import gsap from 'gsap';

export default function HomePage({ onNavigate, heartRate = 0 }) {
  const heroRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero elements entrance animation
      gsap.from('.hero-fade-in', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // Feature cards stagger reveal
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
      title: 'Bilingual Voice AI Triage',
      titleLocal: 'द्विभाषिक व्हॉइस एआय ट्रायज',
      description: 'Speak symptoms in Marathi, Hindi, or English. Gemini 2.5 Flash triages urgency and speaks home remedies.',
      icon: PhoneCall,
      actionText: 'Start Triage',
      tab: 'triage',
      badge: 'Gemini 2.5 Flash',
      color: 'from-terracotta/20 to-sun-gold/20'
    },
    {
      title: 'Real Road-to-Road Navigation',
      titleLocal: 'खरा रस्ता-नेव्हिगेशन',
      description: 'Accurate OSRM driving routes to the nearest rural PHC or hospital — street roads, not misleading straight lines.',
      icon: Navigation,
      actionText: 'Find Hospital',
      tab: 'navigation',
      badge: 'OSRM + Leaflet',
      color: 'from-deep-teal/20 to-sky-mist'
    },
    {
      title: 'ABDM Health Records Hub',
      titleLocal: 'कुटुंब आरोग्य केंद्र',
      description: 'Full family health management with ABHA ID. Download verifiable PDF health cards with encrypted QR tokens.',
      icon: Users,
      actionText: 'Family Hub',
      tab: 'hub',
      badge: 'ABDM Compatible',
      color: 'from-leaf-green/20 to-deep-teal/10'
    },
    {
      title: 'Gram Panchayat Kiosk Terminal',
      titleLocal: 'ग्रामपंचायत किओस्क',
      description: 'Dedicated assisted mode for village operators to perform vitals checkups for elderly citizens without smartphones.',
      icon: ShieldCheck,
      actionText: 'Kiosk Terminal',
      tab: 'hub',
      badge: 'Senior Care',
      color: 'from-sun-gold/25 to-terracotta/10'
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
            <span>ग्रामीण आरोग्य क्रांती • Rural Healthcare Accessibility</span>
          </div>

          <h1 className="hero-fade-in font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-deep-teal dark:text-sky-mist leading-[1.12] tracking-tight">
            Healthcare that speaks <span className="text-terracotta italic">Bharat's</span> languages, reaches Bharat's roads.
          </h1>

          <p className="hero-fade-in text-base sm:text-lg text-deep-teal/80 dark:text-sky-mist/80 leading-relaxed font-sans max-w-2xl">
            Empowering 65%+ of India's population with bilingual voice AI clinical triage, true road-geometry emergency hospital routing, zero-default vitals monitoring, and offline-capable digital records.
          </p>

          <div className="hero-fade-in flex flex-wrap items-center gap-4 pt-2">
            <button 
              onClick={() => onNavigate('triage')}
              className="btn-terracotta text-sm sm:text-base py-3.5 px-7"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Voice AI Triage</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button 
              onClick={() => onNavigate('navigation')}
              className="btn-teal text-sm sm:text-base py-3.5 px-6 dark:bg-sky-mist dark:text-deep-teal"
            >
              <Navigation className="w-5 h-5" />
              <span>Nearest Hospital Route</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="hero-fade-in pt-4 flex flex-wrap items-center gap-6 text-xs text-deep-teal/70 dark:text-dark-muted font-medium border-t border-deep-teal/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-leaf-green" />
              <span>Zero-Default Vitals (0/0 mmHg, 0 BPM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sun-gold" />
              <span>State-Wise Auto Language Detection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terracotta" />
              <span>1-Tap 108 Emergency SOS</span>
            </div>
          </div>

        </div>

        {/* Right Col: 3D Anatomical Heart Digital Twin */}
        <div className="hero-fade-in lg:col-span-5 flex flex-col items-center">
          <div className="w-full neo-glass-card p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta">
                  Interactive WebGL Twin
                </span>
                <h3 className="font-display font-bold text-lg text-deep-teal dark:text-sky-mist">
                  Anatomical Heart Twin
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-deep-teal/10 dark:bg-white/10 text-deep-teal dark:text-sky-mist">
                Three.js
              </span>
            </div>

            {/* Three.js Canvas Container */}
            <HeartDigitalTwin heartRate={heartRate} />

            <div className="mt-4 pt-3 border-t border-deep-teal/10 dark:border-white/10 flex items-center justify-between text-xs text-deep-teal/70 dark:text-dark-muted">
              <span>Drag to rotate 3D heart</span>
              <span className="text-terracotta font-semibold">Pulse synced to real BPM</span>
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
          <p className="text-xs sm:text-sm text-deep-teal/70 dark:text-dark-muted max-w-md">
            Solving the doctor shortage, dialect hurdles, and rural navigation gaps with inclusive AI and offline sync.
          </p>
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
                    <p className="text-[11px] font-semibold text-terracotta/90 dark:text-sun-gold">
                      {item.titleLocal}
                    </p>
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

      {/* Six Extra Features Overview Strip */}
      <section className="neo-glass-card p-6 sm:p-8 space-y-4 border-l-4 border-terracotta">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
              Complete Rural Ecosystem
            </span>
            <h3 className="font-display font-bold text-xl text-deep-teal dark:text-sky-mist">
              Six Specialized Accessibility Features Integrated End-to-End
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-leaf-green/15 text-leaf-green">
            All 6 Slices Activated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-dark-card/60 border border-deep-teal/10">
            <span className="font-bold text-deep-teal dark:text-sky-mist block">Prescription OCR</span>
            <span className="text-[11px] text-deep-teal/70 dark:text-dark-muted">Gemini Vision Rx scanner</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-dark-card/60 border border-deep-teal/10">
            <span className="font-bold text-alert-crimson block">1-Tap SOS Beacon</span>
            <span className="text-[11px] text-deep-teal/70 dark:text-dark-muted">3s abort + 108 dispatch</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-dark-card/60 border border-deep-teal/10">
            <span className="font-bold text-deep-teal dark:text-sky-mist block">Offline PWA</span>
            <span className="text-[11px] text-deep-teal/70 dark:text-dark-muted">IndexedDB background sync</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-dark-card/60 border border-deep-teal/10">
            <span className="font-bold text-deep-teal dark:text-sky-mist block">WhatsApp Bot</span>
            <span className="text-[11px] text-deep-teal/70 dark:text-dark-muted">Voice note elder triage</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-dark-card/60 border border-deep-teal/10">
            <span className="font-bold text-deep-teal dark:text-sky-mist block">ABDM Health Card</span>
            <span className="text-[11px] text-deep-teal/70 dark:text-dark-muted">Signed JWT QR PDF</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-dark-card/60 border border-deep-teal/10">
            <span className="font-bold text-deep-teal dark:text-sky-mist block">Bluetooth BLE</span>
            <span className="text-[11px] text-deep-teal/70 dark:text-dark-muted">Live GATT vitals pairing</span>
          </div>
        </div>
      </section>

    </div>
  );
}
