import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MapPin, Globe, X } from 'lucide-react';

export default function StateLanguageToast() {
  const { stateToast, closeStateToast, t } = useLanguage();

  if (!stateToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md neo-glass-card p-4 shadow-2xl border-2 border-terracotta/40 bg-white/95 dark:bg-dark-card/95 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center shrink-0 mt-0.5">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <h4 className="font-bold text-deep-teal dark:text-sky-mist flex items-center gap-1.5 mb-1">
            <Globe className="w-3.5 h-3.5 text-terracotta" />
            <span>Auto Language Switched</span>
          </h4>
          <p className="text-deep-teal/80 dark:text-sky-mist/80 leading-relaxed">
            {t('state_toast_detected', { 
              state: stateToast.state, 
              lang: stateToast.langName 
            })}
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <button
              onClick={closeStateToast}
              className="btn-terracotta text-[11px] py-1 px-3"
            >
              {t('state_toast_dismiss')}
            </button>
          </div>
        </div>
        <button
          onClick={closeStateToast}
          className="p-1 rounded-full hover:bg-deep-teal/10 text-deep-teal/60 dark:text-dark-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
