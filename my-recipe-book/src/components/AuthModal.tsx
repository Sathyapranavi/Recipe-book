import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const { isAuthModalOpen, closeAuthModal, sendOtp, verifyOtp, t } = useAuth();

  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(email.trim(), name.trim());
    setLoading(false);

    if (res.success) {
      if (res.devOtp) setDevOtp(res.devOtp);
      setStep('verify');
      setCountdown(30);
    } else {
      setErrorMessage(res.error || 'Failed to send verification code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(email.trim(), otp.trim());
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Incorrect OTP code.');
    } else {
      // Successfully authenticated! Modal closes automatically via AuthContext
      setName('');
      setEmail('');
      setOtp('');
      setDevOtp(null);
      setStep('request');
      onLoginSuccess?.();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setErrorMessage('');
    const res = await sendOtp(email.trim(), name.trim());
    setLoading(false);
    if (res.success) {
      if (res.devOtp) setDevOtp(res.devOtp);
      setCountdown(30);
    } else {
      setErrorMessage(res.error || 'Failed to resend code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          aria-label={t.closeBtn}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {step === 'request' ? (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3 text-amber-700 border border-amber-100">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                  {t.authModalTitle}
                </h2>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {t.authModalSubtitle}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.authNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.authNamePlaceholder}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.authEmailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.authEmailPlaceholder}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? t.sendingOtp : t.sendOtpBtn}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-start gap-2.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.persistentSessionNotice}</span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3 text-amber-700 border border-amber-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                  {t.enterOtpTitle}
                </h2>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {t.enterOtpSubtitle} <strong className="text-stone-800 font-semibold">{email}</strong>
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Dev / Demo verification helper banner */}
              {devOtp && (
                <div className="mb-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      {t.devOtpNotice}
                    </span>
                    <span className="font-mono font-bold tracking-widest text-amber-950 text-sm bg-white px-2 py-0.5 rounded border border-amber-200">
                      {devOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="text-[11px] font-medium text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    {t.useQuickCode}
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.otpLabel}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3.5 py-3 text-center text-xl tracking-widest font-mono bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-300"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? t.verifyingBtn : t.verifyBtn}
                  </button>
                </div>
              </form>

              <div className="mt-5 flex items-center justify-between text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="hover:text-stone-900 underline cursor-pointer"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className={`cursor-pointer ${
                    countdown > 0 ? 'text-stone-400' : 'text-stone-800 font-semibold hover:underline'
                  }`}
                >
                  {countdown > 0 ? `${t.resendCountdown} ${countdown}s` : t.resendOtp}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
