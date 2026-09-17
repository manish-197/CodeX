import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, stateToLanguageMap, languageNames, getSpeechLangCode } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('arogya_lang') || 'en';
  });
  
  const [stateToast, setStateToast] = useState(null); // { state, langName }

  // Detect user's state from geolocation on first load if user hasn't explicitly chosen before
  useEffect(() => {
    const hasManualChoice = localStorage.getItem('arogya_lang_manual');
    if (hasManualChoice) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Nominatim reverse geocoding
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'ArogyaRakshak-RuralHealth/1.0'
                }
              }
            );
            if (!res.ok) return;
            const data = await res.json();
            const state = data?.address?.state;

            if (state && stateToLanguageMap[state]) {
              const matchedLang = stateToLanguageMap[state];
              setLangState(matchedLang);
              localStorage.setItem('arogya_lang', matchedLang);

              setStateToast({
                state,
                langName: languageNames[matchedLang] || matchedLang,
              });
            }
          } catch (err) {
            console.warn('[Auto Language Detect] Geocoding skipped:', err.message);
          }
        },
        (geoErr) => {
          console.warn('[Auto Language Detect] Geolocation permission denied or unavailable');
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('arogya_lang', newLang);
    localStorage.setItem('arogya_lang_manual', 'true');
    setStateToast(null); // Dismiss toast if user manually selects
  };

  // Translation helper with token replacement
  const t = (key, params = {}) => {
    const langDict = translations[lang] || translations.en;
    let str = langDict[key] || translations.en[key] || key;
    for (const [paramKey, paramVal] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      t,
      stateToast,
      closeStateToast: () => setStateToast(null),
      speechLang: getSpeechLangCode(lang),
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
