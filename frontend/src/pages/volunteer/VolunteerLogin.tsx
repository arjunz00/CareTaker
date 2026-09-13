import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function VolunteerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password, 'volunteer');
      navigate('/volunteer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Volunteer authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle('volunteer');
      navigate('/volunteer/dashboard');
    } catch (err: any) {
      setError('Google Sign In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 grid place-items-center p-6 font-sans text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        <div className="text-center">
          <span className="inline-flex p-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <Heart className="w-6 h-6" />
          </span>
          <h1 className="mt-3 text-xl font-black text-white">Volunteer Community Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Firebase Real-Time Auth & Community Network</p>
        </div>

        {error && (
          <p className="p-3 rounded-xl text-xs text-rose-300 bg-rose-950/30 border border-rose-900 text-center font-semibold">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="volunteer@community.org"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Enter your password..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition placeholder-slate-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/20 active:scale-98 flex items-center justify-center gap-2"
        >
          {loading ? 'Authenticating with Firebase…' : 'Sign In with Firebase'} <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google Sign In
        </button>

        <div className="text-center text-[11px] text-slate-400">
          <Link className="text-indigo-400 font-bold hover:underline" to="/volunteer/register">Apply to volunteer</Link>
        </div>

        <p className="border-t border-slate-800 pt-4 flex gap-2 text-[10px] text-slate-500 leading-relaxed">
          <Lock className="w-4 h-4 shrink-0 text-indigo-400" />
          Patient telemetry is anonymized and restricted strictly during active emergency dispatches.
        </p>
      </form>
    </div>
  );
}
