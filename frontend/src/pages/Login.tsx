import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, HeartPulse, Phone, Mail, CheckCircle2, KeyRound, X } from 'lucide-react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('savita.sharma@gmail.com');
  const [password, setPassword] = useState('patient123');
  
  // Phone OTP states
  const [phone, setPhone] = useState('+91 99887 76655');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { loginWithEmail, sendPhoneOTP, verifyPhoneOTP, loginWithGoogle, resetPassword } = useAuth();

  // Handle Email Sign In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password, 'patient');
      navigate("/patient/dashboard");
    } catch (err: any) {
      setError(err.message || "Email authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Setup Recaptcha and send SMS OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let recaptchaVerifier = (window as any).recaptchaVerifier;
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
        (window as any).recaptchaVerifier = recaptchaVerifier;
      }

      const formattedPhone = phone.startsWith('+') ? phone.replace(/\s+/g, '') : `+91${phone.replace(/\D/g, '')}`;
      const confirmRes = await sendPhoneOTP(formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmRes);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send SMS OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Verify 6-digit SMS OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      await verifyPhoneOTP(confirmationResult, otpCode, 'patient', 'Savita Sharma');
      navigate("/patient/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid 6-digit OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle('patient');
      navigate("/patient/dashboard");
    } catch (err: any) {
      setError(err.message || "Google Auth failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    try {
      await resetPassword(resetEmail || email);
      setResetSent(true);
    } catch (err: any) {
      setResetError(err.message || "Failed to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100">
      
      {/* Recaptcha container for Phone Auth */}
      <div id="recaptcha-container" />

      {/* Left Media Banner */}
      <div className="relative lg:w-1/2 min-h-[320px] lg:min-h-screen bg-slate-900 flex flex-col justify-between p-8 lg:p-14 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200" 
          alt="Patient Health Telemetry" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
        
        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 font-heading font-extrabold text-xl tracking-tight text-white">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span>Aegis<span className="text-teal-400">Net</span></span>
          </Link>
        </div>

        {/* Banner Copy */}
        <div className="relative z-10 space-y-4 max-w-lg my-auto pt-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 bg-teal-950/80 px-3.5 py-1.5 rounded-full border border-teal-800">
            <ShieldCheck className="w-4 h-4" /> Firebase Authentication
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
            Secure Real-Time Care Authentication
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Sign in with verified Email credentials, Google OAuth, or instant Mobile Phone SMS OTP verification powered by Firebase.
          </p>

          <div className="pt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-teal-400 font-bold block">● Instant Phone OTP</span>
              <span className="text-slate-400 text-[11px]">Real-time SMS verification</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-sky-400 font-bold block">● Firebase Encrypted</span>
              <span className="text-slate-400 text-[11px]">HIPAA & JWT auth tokens</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-slate-500">
          © 2026 AegisNet Platform. Powered by Firebase Real-Time Auth.
        </p>
      </div>

      {/* Right Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-950">
        <div className="max-w-md w-full space-y-6">
          
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Patient Sign In</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">Access Your Health Portal</h2>
            <p className="text-xs text-slate-400 mt-1">Select your preferred login method below.</p>
          </div>

          {/* Auth Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setError(null); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === 'email' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" /> Email & Password
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('phone'); setError(null); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === 'phone' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" /> Mobile Phone OTP
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Form 1: Email Login */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono transition"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase block">Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setResetEmail(email); setShowForgotModal(true); }}
                    className="text-[10px] text-teal-400 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono transition"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition active:scale-98 flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating with Firebase..." : "Sign In with Firebase"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form 2: Mobile Phone SMS OTP */}
          {authMode === 'phone' && (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Mobile Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 99887 76655"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono transition"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending SMS OTP..." : "Send Verification Code"} <Phone className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800 text-teal-300 text-xs flex items-center justify-between">
                    <span>SMS OTP sent to <strong>{phone}</strong></span>
                    <button type="button" onClick={() => setOtpSent(false)} className="underline text-[10px]">Change</button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Enter 6-Digit SMS Code</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono text-center text-lg tracking-widest transition"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    {loading ? "Verifying Code..." : "Verify OTP & Sign In"} <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-950 px-3 text-slate-500 font-bold">Or</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleAuth} 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign In with Firebase Google OAuth
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Need an account? </span>
            <Link to="/patient/register" className="text-xs font-bold text-teal-400 hover:underline">Register New Patient</Link>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <Link to="/doctor/login" className="hover:text-teal-400 font-semibold">Clinician Portal →</Link>
            <Link to="/guardian/login" className="hover:text-teal-400 font-semibold">Guardian Portal →</Link>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Reset Password</h3>
              </div>
              <button 
                onClick={() => { setShowForgotModal(false); setResetSent(false); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSent ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto" />
                <p className="text-sm font-bold text-white">Password Reset Email Sent!</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We've sent a password reset link to <span className="text-teal-300 font-mono">{resetEmail || email}</span>. Check your inbox and follow the instructions.
                </p>
                <button
                  onClick={() => { setShowForgotModal(false); setResetSent(false); }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered email address and Firebase will send you a secure link to reset your account password.
                </p>

                {resetError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-bold text-center">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail || email}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
