import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { useGuardian } from '../../hooks/guardian/useGuardian';

export default function GuardianLogin() {
  const [email, setEmail] = useState('rahul.sharma@gmail.com');
  const [password, setPassword] = useState('guardian123');
  const [rememberMe, setRememberMe] = useState(true);
  const { login, loading, error } = useGuardian();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/guardian/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-650 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-900/30">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Guardian Portal Gateway</h2>
          <p className="text-xs text-slate-400 mt-1">Authenticate to monitor family member safety telemetry.</p>
          <div className="mt-2 text-center flex justify-center gap-3">
            <Link to="/patient/login" className="text-[10px] text-indigo-400 hover:underline font-semibold uppercase tracking-wider">
              Patient Portal →
            </Link>
            <span className="text-slate-600 text-[10px]">|</span>
            <Link to="/doctor/login" className="text-[10px] text-indigo-400 hover:underline font-semibold uppercase tracking-wider">
              Clinician Hub →
            </Link>
          </div>
        </div>

        {error && (
          <p className="bg-rose-950/20 border border-rose-900/50 p-2.5 rounded-xl text-[10px] text-rose-500 font-mono font-bold animate-pulse text-center">{error}</p>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs select-none">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Guardian Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Secure Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-indigo-650"
              />
              Remember me
            </label>
            <a href="#" className="hover:underline text-indigo-400">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl border border-indigo-500 shadow-md transition active:scale-98 uppercase tracking-wider"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="border-t border-slate-850 pt-4 flex gap-2.5 items-start text-[10px] text-slate-500 select-none">
          <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Secure family access:</strong> Session access logs are recorded for security auditing. Health telemetry indices are shared strictly under consent parameters.
          </p>
        </div>

      </div>
    </div>
  );
}
