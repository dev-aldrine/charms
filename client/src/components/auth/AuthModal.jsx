import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    setAuthMode,
    authStep,
    pendingEmail,
    loading,
    error,
    successNotice,
    login,
    register,
    verifyEmail,
    verify2FA,
    resendVerificationCode
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [twoFaInput, setTwoFaInput] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, [pendingEmail]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      await login(email, password);
    } else {
      await register(email, password, name);
    }
  };

  const handleVerifyEmail = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = otpInput.join('');
    if (code.length === 6) {
      await verifyEmail(code);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (twoFaInput.trim().length >= 6) {
      await verify2FA(twoFaInput.trim());
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const ok = await resendVerificationCode();
    if (ok) setResendCooldown(60);
  };

  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split('');
      const newOtp = [...otpInput];
      digits.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpInput(newOtp);
      const targetInput = document.getElementById(`email-otp-${Math.min(digits.length, 5)}`);
      if (targetInput) targetInput.focus();
      if (digits.length === 6) {
        verifyEmail(digits.join(''));
      }
      return;
    }

    const newOtp = [...otpInput];
    newOtp[index] = cleanVal;
    setOtpInput(newOtp);

    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`email-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    if (cleanVal && index === 5 && newOtp.every(d => d !== '')) {
      verifyEmail(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`email-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-forest/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-4xl p-6 sm:p-8 shadow-2xl border border-botanical-stone overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 w-8 h-8 rounded-full border border-botanical-stone flex items-center justify-center text-botanical-forest/60 hover:text-botanical-forest hover:bg-botanical-bg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="w-12 h-12 rounded-full bg-botanical-bg border border-botanical-stone flex items-center justify-center mx-auto mb-3 text-botanical-sage shadow-xs">
            {authStep === '2fa' ? (
              <Smartphone className="w-6 h-6 text-botanical-forest" />
            ) : authStep === 'verify-email' ? (
              <ShieldCheck className="w-6 h-6 text-botanical-forest" />
            ) : (
              <Sparkles className="w-6 h-6 text-botanical-forest" />
            )}
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-botanical-sage font-bold">
            Customer Sanctuary
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-botanical-forest">
            {authStep === 'verify-email' 
              ? 'Verify Email Address' 
              : authStep === '2fa' 
              ? 'Two-Factor Authentication' 
              : authMode === 'login' 
              ? 'Welcome Back' 
              : 'Create Atelier Account'}
          </h2>
          <p className="text-xs font-sans text-botanical-clay max-w-xs mx-auto">
            {authStep === 'verify-email'
              ? `We sent a 6-digit verification code to ${email}`
              : authStep === '2fa'
              ? 'Enter the 6-digit code from your Google Authenticator or Authy app'
              : authMode === 'login'
              ? 'Sign in securely with your password.'
              : 'Join to craft bespoke bracelets and save delivery locations.'}
          </p>
        </div>

        {/* Error / Success Notice Banners */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-50 text-red-700 text-xs px-4 py-2.5 rounded-2xl border border-red-200 mb-4 font-sans text-center"
            >
              {error}
            </motion.div>
          )}
          {successNotice && authStep !== 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2.5 rounded-2xl border border-emerald-200 mb-4 font-sans text-center"
            >
              {successNotice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: Email + Password Form */}
        {authStep === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-botanical-bg p-1 rounded-full border border-botanical-stone/80 mb-2">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  authMode === 'login' ? 'bg-botanical-forest text-white shadow-xs' : 'text-botanical-forest/60 hover:text-botanical-forest'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  authMode === 'register' ? 'bg-botanical-forest text-white shadow-xs' : 'text-botanical-forest/60 hover:text-botanical-forest'
                }`}
              >
                Register
              </button>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-botanical-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Maria Santos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-botanical-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80">
                  Password
                </label>
                {authMode === 'login' && (
                  <span className="text-[10px] text-botanical-sage font-medium hover:underline cursor-pointer">
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-botanical-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-botanical-forest/40 hover:text-botanical-forest"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-sm flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-botanical-sage" />
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
                  <ArrowRight className="w-4 h-4 text-botanical-sage" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: One-Time Email Verification Code */}
        {authStep === 'verify-email' && (
          <div className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otpInput.map((digit, index) => (
                <input
                  key={index}
                  id={`email-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e.key)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-2xl border-2 border-botanical-stone focus:border-botanical-forest focus:outline-none bg-botanical-bg/40 text-botanical-forest"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyEmail}
              disabled={loading || otpInput.some(d => d === '')}
              className="w-full py-3.5 px-6 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-botanical-sage" />
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <ArrowRight className="w-4 h-4 text-botanical-sage" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-xs font-semibold text-botanical-forest/70 hover:text-botanical-terracotta disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TOTP 2FA Verification (Google Authenticator) */}
        {authStep === '2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5 text-center">
                Authenticator Security Code
              </label>
              <div className="relative max-w-xs mx-auto">
                <KeyRound className="w-4 h-4 text-botanical-forest/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="123456"
                  value={twoFaInput}
                  onChange={(e) => setTwoFaInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-4 py-3.5 text-center font-mono text-xl tracking-[0.25em] font-bold rounded-2xl border-2 border-botanical-stone focus:border-botanical-forest focus:outline-none bg-botanical-bg/40 text-botanical-forest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || twoFaInput.length < 6}
              className="w-full py-3.5 px-6 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-botanical-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-botanical-sage" />
              ) : (
                <>
                  <span>Verify 2FA Token</span>
                  <ArrowRight className="w-4 h-4 text-botanical-sage" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success Banner */}
        {authStep === 'success' && (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-botanical-forest">
              Authenticated Successfully!
            </h3>
            <p className="text-xs text-botanical-forest/70 font-sans">
              Welcome to your Joy's Fairy Charms Atelier sanctuary.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
