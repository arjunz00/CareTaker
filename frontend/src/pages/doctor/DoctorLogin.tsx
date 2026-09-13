import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, Lock, Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function DoctorLogin() {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('arvind.swamy@narayana.org');
  const [password, setPassword] = useState('doctor123');
  
  // Phone OTP states
  const [phone, setPhone] = useState('+91 91234 56789');
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
      await loginWithEmail(email, password, 'doctor');
      navigate("/doctor/dashboard");
    } catch (err: any) {
      setError(err.message || "Clinician authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let recaptchaVerifier = (window as any).recaptchaVerifierDoc;
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(auth, 'doc-recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
        (window as any).recaptchaVerifierDoc = recaptchaVerifier;
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
      await verifyPhoneOTP(confirmationResult, otpCode, 'doctor', 'Dr. Arvind Swamy');
      navigate("/doctor/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid 6-digit OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100">
      
      <div id="doc-recaptcha-container" />

      {/* Left Media Banner */}
      <div className="relative lg:w-1/2 min-h-[320px] lg:min-h-screen bg-slate-900 flex flex-col justify-between p-8 lg:p-14 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200" 
          alt="Clinician Telemetry Portal" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
        
        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 font-heading font-extrabold text-xl tracking-tight text-white">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span>Aegis<span className="text-teal-400">Net Clinician</span></span>
          </Link>
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-4 max-w-lg my-auto pt-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 bg-teal-950/80 px-3.5 py-1.5 rounded-full border border-teal-800">
            <Lock className="w-4 h-4" /> HIPAA Real-Time Firebase Auth
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
            Clinical Decision-Support Telemetry Portal
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Review real-time AI risk forecasts, vital indices, and sensor fusion alerts for your assigned patients.
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © 2026 AegisNet Medical Systems. HIPAA Compliant Firebase Authentication.
        </p>
      </div>

      {/* Right Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-950">
        <div className="max-w-md w-full space-y-6">
          
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Clinician Workspace</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">Firebase Doctor Portal</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in with email credentials or mobile SMS OTP.</p>
          </div>

          {/* Selector Tabs */}
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
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Clinician Email</label>
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
                {loading ? "Authenticating..." : "Sign In to Clinician Console"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Registered Doctor Phone</label>
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
            <Link to="/guardian/login" className="hover:text-teal-400 font-semibold">Guardian Portal →</Link>
          </div>

        </div>
      </div>

    </div>
  );
}
