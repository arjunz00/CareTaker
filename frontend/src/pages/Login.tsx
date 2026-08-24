import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MessageSquare, AlertOctagon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('savita.sharma@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [googleModal, setGoogleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Patient credentials not registered.");
      const data = await res.json();
      
      localStorage.setItem("aegis_session", JSON.stringify(data.session));
      navigate("/patient/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleModal(true);
  };

  const confirmGoogleLogin = () => {
    const session = {
      authenticated: true,
      email: "savita.sharma@gmail.com",
      name: "Savita Sharma",
      role: "patient",
      token: "mock-jwt-token-google-auth"
    };
    localStorage.setItem("aegis_session", JSON.stringify(session));
    setGoogleModal(false);
    navigate("/patient/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-650 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-900/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Patient Portal Gateway</h2>
          <p className="text-xs text-slate-400 mt-1">Authenticate to monitor your active wearable telemetry.</p>
          <div className="mt-2 text-center flex justify-center gap-3">
            <Link to="/doctor/login" className="text-[10px] text-indigo-400 hover:underline font-semibold uppercase tracking-wider">
              Clinician Hub →
            </Link>
            <span className="text-slate-600 text-[10px]">|</span>
            <Link to="/guardian/login" className="text-[10px] text-indigo-400 hover:underline font-semibold uppercase tracking-wider">
              Guardian Portal →
            </Link>
          </div>
        </div>

        {error && (
          <p className="bg-rose-950/20 border border-rose-900/50 p-2.5 rounded-xl text-[10px] text-rose-500 font-mono font-bold animate-pulse text-center">{error}</p>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl border border-indigo-500 shadow-md transition active:scale-98 uppercase tracking-wider"
          >
            {loading ? "Authenticating..." : "Sign In with Email"}
          </button>
        </form>

        <div className="relative my-4 select-none">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-850"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-900 px-2 text-slate-500 font-bold">Or</span></div>
        </div>

        {/* Google OAuth Button */}
        <button 
          onClick={handleGoogleLogin} 
          className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs py-2.5 rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-[10px] text-slate-500 text-center select-none">
          Don't have a care account?{" "}
          <Link to="/patient/register" className="text-indigo-400 hover:underline font-bold">Register Profile baseline</Link>
        </p>

        {/* GOOGLE MOCK OAUTH MODAL */}
        {googleModal && (
          <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full space-y-4 select-none">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="font-bold text-xs text-slate-700">Sign in with Google</span>
                </div>
                <button onClick={() => setGoogleModal(false)} className="text-slate-400 hover:text-slate-600 transition"><i data-lucide="x" className="w-4 h-4"></i></button>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">AegisNet App Integration</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Select a mock account to authorize.</p>
              </div>
              <button onClick={confirmGoogleLogin} className="w-full flex items-center justify-between p-3 border border-slate-200 hover:bg-slate-50 rounded-xl transition duration-200 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs uppercase font-mono">S</div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Savita Sharma</span>
                    <span className="text-[9px] text-slate-500 block font-mono">savita.sharma@gmail.com</span>
                  </div>
                </div>
                <i data-lucide="check-circle" className="w-4 h-4 text-indigo-600"></i>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
