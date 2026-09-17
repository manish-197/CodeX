import React from 'react';
import { Heart, Phone, Shield, WifiOff, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-deep-teal/10 dark:border-white/10 bg-white/40 dark:bg-dark-card/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Platform identity */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-terracotta to-sun-gold flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="font-display font-bold text-xl text-deep-teal dark:text-sky-mist">
                ArogyaRakshak AI
              </span>
            </div>
            <p className="text-sm text-deep-teal/70 dark:text-dark-muted max-w-md leading-relaxed">
              Democratizing quality healthcare access for India's 65%+ rural population through bilingual voice AI clinical triage, true road-level emergency dispatch, and digital health empowerment.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-deep-teal/80 dark:text-sky-mist/80">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-leaf-green/15 text-leaf-green">
                <Shield className="w-3.5 h-3.5" /> ABDM Aligned
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sun-gold/15 text-deep-teal dark:text-sun-gold">
                <WifiOff className="w-3.5 h-3.5" /> Offline-First PWA
              </span>
            </div>
          </div>

          {/* Col 2: Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-wide uppercase text-deep-teal dark:text-sky-mist">
              Rural Helplines
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-alert-crimson font-bold">
                <Phone className="w-4 h-4" />
                <span>108 — National Ambulance</span>
              </li>
              <li className="flex items-center gap-2 text-deep-teal/80 dark:text-sky-mist/80">
                <Phone className="w-4 h-4" />
                <span>104 — Health Information Line</span>
              </li>
              <li className="flex items-center gap-2 text-deep-teal/80 dark:text-sky-mist/80">
                <Phone className="w-4 h-4" />
                <span>1800-11-4477 — Tele-MANAS</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Gram Panchayat Support */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm tracking-wide uppercase text-deep-teal dark:text-sky-mist">
              Kiosk Network
            </h4>
            <p className="text-xs text-deep-teal/70 dark:text-dark-muted leading-relaxed">
              Gram Panchayat health kiosks provide assisted telemedicine and vitals synchronization for illiterate and non-smartphone citizens.
            </p>
            <div className="text-xs font-medium text-terracotta">
              Open 24/7 at Village Secretariats
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-deep-teal/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-deep-teal/60 dark:text-dark-muted gap-4">
          <p>© 2026 ArogyaRakshak AI. Engineered for Bharat's underserved communities.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-alert-crimson fill-alert-crimson" /> for Rural Health Accessibility
          </p>
        </div>
      </div>
    </footer>
  );
}
