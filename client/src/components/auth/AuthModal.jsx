import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Mail,
  Phone, 
  Lock, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Building,
  CreditCard,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';

// Password strength evaluator
function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', barClass: 'bg-alert-crimson', textClass: 'text-alert-crimson' };
  if (score === 2) return { score: 2, label: 'Fair', barClass: 'bg-sun-gold', textClass: 'text-sun-gold' };
  if (score === 3) return { score: 3, label: 'Good', barClass: 'bg-sky-mist', textClass: 'text-deep-teal dark:text-sky-mist' };
  return { score: 4, label: 'Strong', barClass: 'bg-leaf-green', textClass: 'text-leaf-green' };
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  defaultRole = 'citizen',
  promptMessage
}) {
  // Modes: 'login' | 'register' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState(defaultRole);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [kioskId, setKioskId] = useState('');
  const [village, setVillage] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check URL query parameters for reset token on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('resetToken');
      const emailParam = params.get('email');
      if (tokenParam) {
        setResetToken(tokenParam);
        if (emailParam) setEmail(emailParam);
        setAuthMode('reset');
      }
    } catch (e) {}
  }, []);

  if (!isOpen) return null;

  const passwordStrength = evaluatePasswordStrength(password);

  const resetFormState = () => {
    setError('');
    setSuccessMessage('');
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No account found with this email. Please sign up first.');
        return;
      }

      localStorage.setItem('arogya_token', data.token);
      localStorage.setItem('arogya_user', JSON.stringify(data.user));

      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.token);
      }
      onClose();
    } catch (err) {
      console.error('[Login API Error]', err);
      setError('Unable to reach authentication server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (phone.length < 10) {
      setError('Please provide a valid 10-digit mobile number for emergency SOS.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role,
          abhaId: role === 'citizen' ? abhaId : undefined,
          kioskId: role === 'kiosk_operator' ? kioskId : undefined,
          village,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please check your details.');
        return;
      }

      localStorage.setItem('arogya_token', data.token);
      localStorage.setItem('arogya_user', JSON.stringify(data.user));

      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.token);
      }
      onClose();
    } catch (err) {
      console.error('[Register API Error]', err);
      setError('Unable to reach registration server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to process reset request. Please check your email.');
        return;
      }

      setSuccessMessage('Reset link sent to your email. Enter the single-use verification code below:');
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      setAuthMode('reset');
    } catch (err) {
      console.error('[Forgot Password Error]', err);
      setError('Unable to reach server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!resetToken.trim()) {
      setError('Please enter the reset verification code.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          token: resetToken.trim(),
          newPassword: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Link expired, please request a new one.');
        return;
      }

      setSuccessMessage('Password updated successfully — please log in');
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
      setTimeout(() => {
        setAuthMode('login');
        setSuccessMessage('Password updated successfully! Please enter your credentials.');
      }, 1200);
    } catch (err) {
      console.error('[Reset Password Error]', err);
      setError('Unable to reach server to reset password.');
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
              {authMode === 'forgot' || authMode === 'reset' ? (
                <KeyRound className="w-6 h-6" />
              ) : role === 'citizen' ? (
                <UserCheck className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <h3 className="font-display font-bold text-2xl text-deep-teal dark:text-sky-mist">
              {authMode === 'login' && 'Access ArogyaRakshak'}
              {authMode === 'register' && 'Create Rural Health Account'}
              {authMode === 'forgot' && 'Reset Your Password'}
              {authMode === 'reset' && 'Set New Password'}
            </h3>

            <p className="text-xs text-deep-teal/70 dark:text-dark-muted">
              {authMode === 'login' && 'Enter your registered email address to log in'}
              {authMode === 'register' && 'Provide email, mobile for SOS, and health details'}
              {authMode === 'forgot' && 'We will send a single-use verification code to your email'}
              {authMode === 'reset' && 'Create a strong, memorable password for your account'}
            </p>
          </div>

          {/* Role Selector Tabs (Only on Register) */}
          {authMode === 'register' && (
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
          )}

          {/* Prompt Notification Banner */}
          {promptMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-terracotta/15 border border-terracotta/30 text-terracotta text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{promptMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-leaf-green/15 border border-leaf-green/30 text-leaf-green text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-alert-crimson/10 border border-alert-crimson/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-alert-crimson animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-alert-crimson" />
                <span className="font-semibold">{error}</span>
              </div>
              {authMode === 'login' && error.toLowerCase().includes('sign up') && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    resetFormState();
                  }}
                  className="font-bold underline text-terracotta hover:text-terracotta-hover shrink-0 self-end sm:self-auto"
                >
                  Sign Up Now →
                </button>
              )}
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Email Address / ईमेल
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. citizen@arogyarakshak.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist">
                    Password / पासवर्ड
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      resetFormState();
                    }}
                    className="text-[11px] font-semibold text-terracotta hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-deep-teal/40 hover:text-deep-teal dark:text-dark-muted"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-terracotta py-3 text-xs font-bold mt-2 disabled:opacity-50"
              >
                {loading ? 'Verifying Credentials...' : 'Login with Email'}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Full Name / पूर्ण नाव
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

              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Email Address / ईमेल पत्ता
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh.patil@arogyarakshak.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Mobile Number / मोबाईल नंबर (For 108 SOS & WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit emergency contact number"
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-deep-teal/40 hover:text-deep-teal dark:text-dark-muted"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {role === 'citizen' && (
                <div>
                  <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                    ABHA ID (Optional — Auto-Generated if left blank)
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

              {role === 'kiosk_operator' && (
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
                className="w-full btn-terracotta py-3 text-xs font-bold mt-2 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Create Account & Get ABHA Card'}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                  />
                </div>
                <p className="text-[11px] text-deep-teal/60 dark:text-dark-muted mt-1.5">
                  We'll generate a single-use verification code valid for 20 minutes. (Rate limit: max 3 per hour).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-terracotta py-3 text-xs font-bold mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Generating Code...' : 'Send Reset Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  resetFormState();
                }}
                className="w-full py-2.5 text-xs font-semibold text-deep-teal dark:text-sky-mist hover:text-terracotta flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </form>
          )}

          {/* 4. RESET PASSWORD FORM */}
          {authMode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Single-Use Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                    placeholder="6-character code"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs tracking-widest uppercase font-bold focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-deep-teal/40 hover:text-deep-teal dark:text-dark-muted"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-deep-teal/70 dark:text-dark-muted">Strength:</span>
                      <span className={`font-bold ${passwordStrength.textClass}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-deep-teal/10 dark:bg-white/10 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full transition-all ${passwordStrength.score >= 1 ? passwordStrength.barClass : 'bg-transparent'} w-1/4 rounded-full`} />
                      <div className={`h-full transition-all ${passwordStrength.score >= 2 ? passwordStrength.barClass : 'bg-transparent'} w-1/4 rounded-full`} />
                      <div className={`h-full transition-all ${passwordStrength.score >= 3 ? passwordStrength.barClass : 'bg-transparent'} w-1/4 rounded-full`} />
                      <div className={`h-full transition-all ${passwordStrength.score >= 4 ? passwordStrength.barClass : 'bg-transparent'} w-1/4 rounded-full`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-teal dark:text-sky-mist mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-deep-teal/40 dark:text-dark-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-dark-base border border-deep-teal/15 dark:border-white/10 text-xs focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-terracotta py-3 text-xs font-bold mt-2 disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  resetFormState();
                }}
                className="w-full py-2.5 text-xs font-semibold text-deep-teal dark:text-sky-mist hover:text-terracotta flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </form>
          )}

          {/* 1-Click Demo Profiles for Rapid Evaluation */}
          {authMode === 'login' && (
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
                      email: 'ramesh.patil@arogyarakshak.org',
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
                  <span className="truncate">Ramesh (Citizen)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const demoKiosk = {
                      id: 'usr_kiosk_sunita',
                      name: 'Sunita Deshmukh',
                      email: 'sunita.kiosk@arogyarakshak.org',
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
                  <span className="truncate">Sunita (Kiosk)</span>
                </button>
              </div>
            </div>
          )}

          {/* Toggle Login vs Register */}
          <div className="mt-4 text-center text-xs text-deep-teal/70 dark:text-dark-muted">
            {authMode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    resetFormState();
                  }}
                  className="font-bold text-terracotta hover:underline"
                >
                  Create Account
                </button>
              </p>
            ) : authMode === 'register' ? (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetFormState();
                  }}
                  className="font-bold text-terracotta hover:underline"
                >
                  Log In
                </button>
              </p>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}
