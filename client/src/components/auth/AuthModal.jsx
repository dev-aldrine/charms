import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldCheck, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authStep,
    pendingEmail,
    loading,
    error,
    devCodeNotice,
    sendOtp,
    verifyOtp
  } = useAuthStore();

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (pendingEmail) {
      setEmailInput(pendingEmail);
    }
  }, [pendingEmail]);

  useEffect(() => {
    let timer;
    if (authStep === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  if (!isAuthModalOpen) return null;

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    const ok = await sendOtp(emailInput);
    if (ok) {
      setCountdown(60);
      setOtpInput(['', '', '', '', '', '']);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    // Extract only digits
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    const newOtp = ['', '', '', '', '', ''];
    digits.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtpInput(newOtp);

    // Focus last filled box or next empty box
    const focusIndex = Math.min(digits.length, 5);
    const targetInput = document.getElementById(`otp-input-${focusIndex}`);
    if (targetInput) targetInput.focus();

    // If full 6 digits pasted, trigger verify automatically
    if (digits.length === 6) {
      verifyOtp(digits, nameInput);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only accept numbers
    const cleanVal = value.replace(/\D/g, '');

    if (cleanVal.length > 1) {
      // Handled in onPaste or multi-char input
      const digits = cleanVal.slice(0, 6).split('');
      const newOtp = [...otpInput];
      digits.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpInput(newOtp);
      const targetInput = document.getElementById(`otp-input-${Math.min(digits.length, 5)}`);
      if (targetInput) targetInput.focus();
      return;
    }

    const newOtp = [...otpInput];
    newOtp[index] = cleanVal;
    setOtpInput(newOtp);

    // Auto focus next box
    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpInput[index] && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
          const newOtp = [...otpInput];
          newOtp[index - 1] = '';
          setOtpInput(newOtp);
        }
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = otpInput.join('');
    if (fullCode.length !== 6) return;
    await verifyOtp(fullCode, nameInput);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-forest/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-8 border border-botanical-stone shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-botanical-bg flex items-center justify-center text-botanical-forest/60 hover:text-botanical-forest hover:bg-botanical-stone transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-botanical-bg flex items-center justify-center text-botanical-sage border border-botanical-stone">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-botanical-forest">
              {authStep === 'email' && 'Welcome to Joy’s Atelier'}
              {authStep === 'otp' && 'Verify Your Email'}
              {authStep === 'success' && 'Signed In!'}
            </h2>
            <p className="text-xs text-botanical-forest/70 font-sans">
              {authStep === 'email' && 'Enter your email to sign in or create an account with a secure one-time password.'}
              {authStep === 'otp' && `We sent a 6-digit code to ${pendingEmail}`}
              {authStep === 'success' && 'Welcome back. Your account is ready.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Email Input */}
          {authStep === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-botanical-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white text-xs uppercase tracking-widest font-semibold transition-colors duration-300 flex items-center justify-center gap-2 shadow-botanical-sm disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue with One-Time Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Step 2: 6-Digit OTP Input */}
          {authStep === 'otp' && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-botanical-stone text-xs font-sans focus:outline-none focus:border-botanical-forest focus:ring-1 focus:ring-botanical-forest transition-all mb-4"
                />

                <label className="block text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 mb-2 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-between gap-2">
                  {otpInput.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onPaste={handlePaste}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className="w-12 h-13 text-center text-lg font-bold font-mono border border-botanical-stone rounded-2xl focus:outline-none focus:border-botanical-forest focus:ring-2 focus:ring-botanical-forest/20 transition-all bg-botanical-bg/40"
                    />
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || otpInput.join('').length !== 6}
                className="w-full py-3.5 rounded-full bg-botanical-forest hover:bg-botanical-terracotta text-white text-xs uppercase tracking-widest font-semibold transition-colors duration-300 flex items-center justify-center gap-2 shadow-botanical-sm disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </motion.button>

              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <span className="text-[11px] text-botanical-forest/60">
                    Resend code in <strong className="font-mono text-botanical-forest">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendOtp(pendingEmail)}
                    className="text-[11px] uppercase tracking-wider font-semibold text-botanical-terracotta hover:underline"
                  >
                    Resend 6-Digit Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Step 3: Success Screen */}
          {authStep === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-14 h-14 rounded-full bg-botanical-sage/20 text-botanical-forest flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-botanical-sage" />
              </motion.div>
              <p className="text-sm font-semibold text-botanical-forest">
                Authentication Successful
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
