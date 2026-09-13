import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Phone, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function GuardianLogin() {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone OTP states
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithEmail, sendPhoneOTP, verifyPhoneOTP, loginWithGoogle } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password, 'guardian');
      navigate("/guardian/dashboard");
    } catch (err: any) {
      setError(err.message || "Guardian authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let recaptchaVerifier = (window as any).recaptchaVerifierGuard;
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(auth, 'guard-recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
        (window as any).recaptchaVerifierGuard = recaptchaVerifier;
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      await verifyPhoneOTP(confirmationResult, otpCode, 'guardian', 'Rahul Sharma');
      navigate("/guardian/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid 6-digit OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle('guardian');
      navigate("/guardian/dashboard");
    } catch (err: any) {
      setError(err.message || "Google Auth failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100">
      
      <div id="guard-recaptcha-container" />

      {/* Left Media Banner */}
      <div className="relative lg:w-1/2 min-h-[320px] lg:min-h-screen bg-slate-900 flex flex-col justify-between p-8 lg:p-14 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=1200" 
          alt="Family Guardian Safety" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 font-heading font-extrabold text-xl tracking-tight text-white">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Users className="w-6 h-6" />
            </div>
            <span>Aegis<span className="text-teal-400">Net Guardian</span></span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4 max-w-lg my-auto pt-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 bg-teal-950/80 px-3.5 py-1.5 rounded-full border border-teal-800">
            <ShieldCheck className="w-4 h-4" /> Real-Time Family Sync
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
            Family Member Safety & Location Triage
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Stay continuously notified about your family member's vitals, safety risks, and live location updates.
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © 2026 AegisNet Platform. Powered by Firebase Real-Time Auth.
        </p>
      </div>

      {/* Right Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-950">
        <div className="max-w-md w-full space-y-6">
          
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Guardian Console</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">Firebase Guardian Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">Authenticate using Email, Google OAuth, or Phone SMS OTP.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setAuthMode('email'); setError(null); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === 'email' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" /> Email Sign In
            </button>
            <button
              onClick={() => { setAuthMode('phone'); setError(null); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                authMode === 'phone' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" /> Mobile OTP
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-bold text-center animate-pulse">
              {error}
            </div>
          )}

          {authMode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Guardian Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guardian@example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono transition placeholder-slate-600"
                />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono transition placeholder-slate-600"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition active:scale-98 flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "Sign In to Guardian Portal"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Guardian Mobile Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono transition placeholder-slate-600"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending Code..." : "Send Verification SMS"} <Phone className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800 text-teal-300 text-xs flex items-center justify-between">
                    <span>SMS OTP sent to <strong>{phone}</strong></span>
                    <button type="button" onClick={() => setOtpSent(false)} className="underline text-[10px]">Edit</button>
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
                    {loading ? "Verifying..." : "Verify OTP & Sign In"} <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="relative my-4">
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
            Sign In with Guardian Google OAuth
          </button>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <Link to="/patient/login" className="hover:text-teal-400 font-semibold">Patient Portal →</Link>
            <Link to="/doctor/login" className="hover:text-teal-400 font-semibold">Clinician Portal →</Link>
          </div>

        </div>
      </div>

    </div>
  );
}
