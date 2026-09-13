import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Phone, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function GuardianLogin() {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('rahul.sharma@gmail.com');
  const [password, setPassword] = useState('guardian123');
  
  // Phone OTP states
  const [phone, setPhone] = useState('+91 99887 76655');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithEmail, sendPhoneOTP, verifyPhoneOTP } = useAuth();

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
            <p className="text-xs text-slate-400 mt-1">Authenticate using Email or Phone SMS OTP.</p>
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono transition"
                />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Password</label>
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-teal-400 font-mono transition"
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

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <Link to="/patient/login" className="hover:text-teal-400 font-semibold">Patient Portal →</Link>
            <Link to="/doctor/login" className="hover:text-teal-400 font-semibold">Clinician Portal →</Link>
          </div>

        </div>
      </div>

    </div>
  );
}
