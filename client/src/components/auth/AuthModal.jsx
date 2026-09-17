import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Phone, 
  Lock, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Building,
  CreditCard
} from 'lucide-react';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  defaultRole = 'citizen',
  promptMessage
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [kioskId, setKioskId] = useState('');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const payload = isLogin
      ? { phone, password }
      : {
          name,
          phone,
          password,
          role,
          abhaId: role === 'citizen' ? abhaId : undefined,
          kioskId: role === 'kiosk_operator' ? kioskId : undefined,
          village,
        };

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (isLogin ? 'No account found with this number. Please sign up first.' : 'Registration failed.'));
        return;
      }

      // Save verified token and user details to localStorage
      localStorage.setItem('arogya_token', data.token);
      localStorage.setItem('arogya_user', JSON.stringify(data.user));

      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.token);
      }
      onClose();
    } catch (err) {
      console.error('[Auth API Error]', err.message);
      setError('Unable to reach server. Please ensure the backend server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md max-h-[90vh] flex flex-col glass-card rounded-3xl relative shadow-2xl bg-white/95 dark:bg-dark-card/95 border border-deep-teal/15 dark:border-white/10 overflow-hidden"
        data-lenis-prevent="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-deep-teal/10 dark:hover:bg-white/10 text-deep-teal dark:text-sky-mist transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Inner Container */}
        <div className="overflow-y-auto p-6 sm:p-8 overscroll-contain">

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-terracotta to-sun-gold text-white shadow-md mx-auto">
            {role === 'citizen' ? <UserCheck className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h3 className="font-display font-bold text-2xl text-deep-teal dark:text-sky-mist">
            {isLogin ? 'Access ArogyaRakshak' : 'Create Rural Health Account'}
          </h3>
          <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
            {isLogin ? 'Enter your registered mobile number' : 'Get your digital health ABHA profile'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-deep-teal/5 dark:bg-white/5 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('citizen')}
            className={`py-2 rounded-xl transition-all ${
              role === 'citizen'
                ? 'bg-deep-teal text-white shadow-sm dark:bg-sky-mist dark:text-deep-teal'
                : 'text-deep-teal dark:text-sky-mist opacity-70'
            }`}
          >
            Citizen Account
          </button>
          <button
            type="button"
            onClick={() => setRole('kiosk_operator')}
            className={`py-2 rounded-xl transition-all ${
              role === 'kiosk_operator'
                ? 'bg-deep-teal text-white shadow-sm dark:bg-sky-mist dark:text-deep-teal'
                : 'text-deep-teal dark:text-sky-mist opacity-70'
            }`}
          >
            Gram Panchayat Kiosk
          </button>
        </div>

        {/* Prompt notification message */}
        {promptMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-terracotta/15 border border-terracotta/30 text-terracotta text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{promptMessage}</span>
          </div>
        )}

        {/* Error message with direct sign up action */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-alert-crimson/10 border border-alert-crimson/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-alert-crimson animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-alert-crimson" />
              <span className="font-semibold">{error}</span>
            </div>
            {isLogin && error.toLowerCase().includes('sign up') && (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className="font-bold underline text-terracotta hover:text-terracotta-hover shrink-0 self-end sm:self-auto"
              >
                Sign Up Now →
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                Full Name / नाव
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
              Mobile Number / मोबाईल नंबर
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
              Password / पासवर्ड
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>

          {!isLogin && role === 'citizen' && (
            <div>
              <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                ABHA ID (Optional - Auto-Generated if empty)
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="XX-XXXX-XXXX-XXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>
          )}

          {!isLogin && role === 'kiosk_operator' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Kiosk Terminal ID
                </label>
                <input
                  type="text"
                  required
                  value={kioskId}
                  onChange={(e) => setKioskId(e.target.value)}
                  placeholder="GP-KIOSK-01"
                  className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Village / गाव
                </label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village name"
                  className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-terracotta py-3 text-xs font-bold mt-2"
          >
            {loading ? 'Processing...' : isLogin ? 'Login Securely' : 'Complete Registration'}
          </button>
        </form>

        {/* 1-Click Demo Logins for Testing and Hackathon Review */}
        <div className="mt-5 pt-4 border-t border-deep-teal/10 dark:border-white/10 space-y-2">
          <p className="text-[11px] font-bold text-deep-teal/60 dark:text-dark-muted text-center uppercase tracking-wider">
            1-Click Demo Evaluation Profiles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const demoCitizen = {
                  id: 'usr_citizen_ramesh',
                  name: 'Ramesh Patil',
                  phone: '9876543210',
                  role: 'citizen',
                  abhaId: '91-4820-9182-3901',
                  village: 'Shirwal',
                  district: 'Satara',
                  state: 'Maharashtra',
                  preferredLanguage: 'mr'
                };
                const demoToken = 'demo_jwt_citizen_' + Date.now();
                localStorage.setItem('arogya_token', demoToken);
                localStorage.setItem('arogya_user', JSON.stringify(demoCitizen));
                if (onAuthSuccess) onAuthSuccess(demoCitizen, demoToken);
                onClose();
              }}
              className="px-2.5 py-2 rounded-xl bg-deep-teal/5 hover:bg-deep-teal/10 dark:bg-white/5 dark:hover:bg-white/10 border border-deep-teal/15 dark:border-white/10 text-[11px] font-semibold text-deep-teal dark:text-sky-mist text-left flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-leaf-green shrink-0" />
              <span className="truncate">Ramesh Patil (Citizen)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const demoKiosk = {
                  id: 'usr_kiosk_sunita',
                  name: 'Sunita Deshmukh',
                  phone: '9876543211',
                  role: 'kiosk_operator',
                  kioskId: 'GP-SHIRWAL-01',
                  village: 'Shirwal Gram Panchayat',
                  district: 'Satara',
                  state: 'Maharashtra',
                  preferredLanguage: 'mr'
                };
                const demoToken = 'demo_jwt_kiosk_' + Date.now();
                localStorage.setItem('arogya_token', demoToken);
                localStorage.setItem('arogya_user', JSON.stringify(demoKiosk));
                if (onAuthSuccess) onAuthSuccess(demoKiosk, demoToken);
                onClose();
              }}
              className="px-2.5 py-2 rounded-xl bg-terracotta/10 hover:bg-terracotta/15 border border-terracotta/20 text-[11px] font-semibold text-terracotta text-left flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-terracotta shrink-0" />
              <span className="truncate">Sunita (Kiosk Operator)</span>
            </button>
          </div>
        </div>

        {/* Toggle Login vs Register */}
        <div className="mt-4 text-center text-xs text-deep-teal/70 dark:text-dark-muted">
          {isLogin ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="font-bold text-terracotta hover:underline"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="font-bold text-terracotta hover:underline"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
