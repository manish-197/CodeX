import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ShieldAlert, LogIn, Lock, ArrowLeft, UserCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function AuthGuard({ 
  children, 
  requiredRole, 
  onNavigateHome,
  featureName = 'this feature'
}) {
  const { isAuthenticated, currentUser, isLoading, openLogin } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLogin('Please log in to continue.');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-medical-blue border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-deep-navy dark:text-clinical-white">
          Verifying ABDM security credentials...
        </p>
      </div>
    );
  }

  // Not authenticated: Render protective Neo-Glass gate card
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="glass-card p-8 sm:p-10 text-center space-y-6 border-2 border-medical-blue/40 shadow-2xl">
          
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-medical-blue to-caution-amber text-white flex items-center justify-center mx-auto shadow-xl">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-medical-blue/15 text-medical-blue text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Authentication Required • लॉगिन आवश्यक आहे</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white">
              Please Log In to Access {featureName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Under National Health Authority (ABDM) guidelines, personal digital health records, AI clinical triage, and emergency routes are protected by authenticated citizen profiles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openLogin('Please log in to continue.')}
              className="w-full sm:w-auto btn-medical-blue py-3.5 px-8 text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In or Create Account / लॉगिन करा</span>
            </button>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="w-full sm:w-auto btn-glass py-3.5 px-6 text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Role restriction check if specified
  if (requiredRole && currentUser?.role !== requiredRole) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 animate-fadeIn">
        <div className="glass-card p-8 text-center space-y-4 border border-alert-red/30">
          <div className="w-14 h-14 rounded-2xl bg-alert-red/15 text-alert-red flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-xl text-deep-navy dark:text-clinical-white">
            Role Restricted Access
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This screen requires <strong>{requiredRole === 'kiosk_operator' ? 'Gram Panchayat Kiosk Operator' : 'Citizen'}</strong> role authorization.
          </p>
          {onNavigateHome && (
            <button onClick={onNavigateHome} className="btn-navy text-xs py-2 px-6 mt-2">
              Go to Home Screen
            </button>
          )}
        </div>
      </div>
    );
  }

  return children;
}
