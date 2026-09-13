import { useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, BadgeCheck, BellRing, BrainCircuit, Building2, CircleUserRound, HeartPulse, LockKeyhole, Radio, ShieldCheck, Stethoscope, UsersRound, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
  { 
    title: 'Patient', 
    copy: 'Monitor your real-time vitals and connect directly with your care team.', 
    to: '/patient/login', 
    icon: CircleUserRound,
    img: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600',
    tag: 'Self Care'
  },
  { 
    title: 'Doctor', 
    copy: 'Review clinical AI telemetry, risk forecasts, and prescribe treatment.', 
    to: '/doctor/login', 
    icon: Stethoscope,
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    tag: 'Clinical Care'
  },
  { 
    title: 'Guardian', 
    copy: "Track your loved one's continuous safety status and live location.", 
    to: '/guardian/login', 
    icon: UsersRound,
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    tag: 'Family Safety'
  },
  { 
    title: 'Volunteer', 
    copy: 'Respond to nearby emergency dispatches and earn Care Credits.', 
    to: '/volunteer/login', 
    icon: HeartPulse,
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    tag: 'Community Response'
  },
  { 
    title: 'College', 
    copy: 'Verify student volunteers and issue official community care hours.', 
    to: '/college/login', 
    icon: Building2,
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
    tag: 'Institutional Portal'
  },
];

const features = [
  ['AI Emergency Detection', 'Fall, inactivity, and abnormal cardiac signals are evaluated in real time.', BrainCircuit],
  ['Predictive Health Trends', 'Personal baseline analysis detects risks before critical events occur.', Activity],
  ['Privacy-Preserving Sensing', 'Role-based encryption ensures zero unnecessary data exposure.', LockKeyhole],
  ['Human Response Network', 'Coordinates doctors, family guardians, and verified responders simultaneously.', BellRing],
  ['Verified Volunteer Care', 'College-verified responder credentials ensure safe community support.', BadgeCheck],
  ['Auditable Care Credits', 'Earn recognized community service rewards for emergency responses.', HeartPulse],
];

const steps = ['Sense', 'Understand', 'Predict', 'Verify', 'Alert', 'Respond', 'Learn'];

export default function Landing() {
  const [chooser, setChooser] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl h-20 px-6 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3 font-heading font-extrabold text-xl tracking-tight">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="flex flex-col">
              <span className="leading-none text-white font-extrabold">Aegis<span className="text-teal-400">Net</span></span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">AIoT Health & Emergency</span>
            </span>
          </a>

          <div className="hidden md:flex gap-8 text-xs font-semibold text-slate-400">
            <a href="#how" className="hover:text-teal-400 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-teal-400 transition-colors">Portals</a>
            <a href="#features" className="hover:text-teal-400 transition-colors">Platform Features</a>
            <a href="#privacy" className="hover:text-teal-400 transition-colors">Privacy Architecture</a>
            <a href="#community" className="hover:text-teal-400 transition-colors">Community Care</a>
          </div>

          <div className="flex gap-3 items-center">
            <button 
              onClick={() => setChooser(true)} 
              className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Sign In
            </button>
            <a 
              href="#roles" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Get Started
            </a>
          </div>
        </nav>
      </header>

      <main id="home">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-800/60 py-16 lg:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(20,184,166,0.15),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.12),transparent_45%)]" />
          
          <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex gap-2 items-center text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3.5 py-1.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                Privacy-Preserving AI Emergency Detection
              </div>

              <h1 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white leading-[1.08]">
                Intelligent sensing detects.<br />
                <span className="text-gradient-teal">Trusted humans respond.</span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
                AegisNet unifies wearable health sensors, predictive risk forecasting, role-based privacy, and a college-verified community response network for instant emergency assistance.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <a 
                  href="#roles" 
                  className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 font-bold text-sm text-slate-950 shadow-lg shadow-teal-500/25 transition active:scale-95 flex items-center gap-2"
                >
                  Explore Portals <ArrowRight className="w-4 h-4" />
                </a>
                <a 
                  href="#how" 
                  className="px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-bold text-sm transition"
                >
                  See How It Works
                </a>
              </div>

              <div className="pt-6 flex flex-wrap gap-6 text-xs text-slate-400 border-t border-slate-850">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> HIPAA-Compliant Architecture
                </span>
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> Continuous Wearable Telemetry
                </span>
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> Verified Volunteer Network
                </span>
              </div>
            </div>

            {/* Right Visual Image & Interactive Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200" 
                  alt="Healthcare AI Telemetry" 
                  className="w-full h-56 object-cover object-center opacity-70 group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                
                <div className="relative p-6 -mt-12 space-y-4">
                  <div className="flex justify-between items-center bg-slate-900/90 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-teal-400 animate-ping" />
                      <span className="text-xs font-bold text-white">Live Patient Sensor Sync</span>
                    </div>
                    <span className="text-[10px] text-teal-400 font-mono bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800">
                      99.4% Signal Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Heart Rate</span>
                      <span className="text-lg font-extrabold text-teal-400 font-mono">74 BPM</span>
                      <span className="text-[9px] text-emerald-400 block mt-0.5">● Normal</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">SpO2 Level</span>
                      <span className="text-lg font-extrabold text-sky-400 font-mono">98.5%</span>
                      <span className="text-[9px] text-emerald-400 block mt-0.5">● Optimal</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">AI Risk Index</span>
                      <span className="text-lg font-extrabold text-emerald-400 font-mono">18 / 100</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Low Risk</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-900/60 flex items-center gap-3 text-xs text-teal-200">
                    <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                    <span>Edge AI fusion verified fall prevention sensors are online.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Portals / Roles Section */}
        <section id="roles" className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest bg-teal-950/80 border border-teal-800/60 px-3 py-1 rounded-full">
              Unified Platform
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-heading font-extrabold text-white">
              Select Your Specialized Portal
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Custom-built workspaces tailored for patients, medical professionals, families, and community responders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
            {roles.map((r) => (
              <Link 
                to={r.to} 
                key={r.title} 
                className="group relative rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 transition duration-300 flex flex-col justify-between h-full"
              >
                {/* Image Header */}
                <div className="relative h-44 overflow-hidden">
                  <img 
                    src={r.img} 
                    alt={r.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                    {r.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <r.icon className="w-5 h-5 text-teal-400" />
                      <h3 className="font-heading font-bold text-lg text-white">{r.title} Portal</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      {r.copy}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
                    <span>Access Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Safety Workflow */}
        <section id="how" className="bg-slate-900/40 border-y border-slate-800/80 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">Safety Workflow</span>
              <h2 className="mt-2 text-3xl font-heading font-extrabold text-white">End-to-End Emergency Response Pipeline</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
              {steps.map((s, i) => (
                <div key={s} className="relative rounded-2xl p-5 bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition">
                  <span className="text-[10px] font-bold text-teal-400 font-mono bg-teal-950 px-2 py-0.5 rounded-md border border-teal-900">
                    0{i + 1}
                  </span>
                  <p className="font-heading font-extrabold text-white mt-3 text-sm">{s}</p>
                  <p className="mt-2 text-[11px] text-slate-400 leading-snug">
                    {['Wearable IoT telemetry', 'Edge AI feature calculation', 'Personal baseline forecast', 'Multi-sensor validation', 'Care network dispatch', 'Verified responder arrival', 'Clinical feedback loop'][i]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Features Grid */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Built for High Trust</span>
            <h2 className="mt-2 text-3xl font-heading font-extrabold text-white">Multi-Layered Protection System</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(([title, copy, Icon]: any) => (
              <article key={title} className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 hover:border-teal-500/40 transition flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-800/80 flex items-center justify-center text-teal-400 mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left">
          <div>
            <div className="flex items-center gap-2 font-heading font-bold text-lg text-white justify-center md:justify-start">
              <HeartPulse className="w-5 h-5 text-teal-400" />
              <span>AegisNet Health Platform</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Privacy-Preserving Intelligent Health Detection & Emergency Response</p>
          </div>
          <p className="text-[11px] text-slate-500 max-w-xl leading-relaxed">
            © 2026 AegisNet Platform. Prototype for clinical AI monitoring and community emergency dispatch. Not intended as a sole replacement for primary emergency services.
          </p>
        </div>
      </footer>

      {/* Portal Selection Modal */}
      {chooser && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md p-6 grid place-items-center">
          <div role="dialog" aria-modal="true" className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-white">Select Portal</h2>
                <p className="text-xs text-slate-400 mt-0.5">Choose your authorized workspace role.</p>
              </div>
              <button onClick={() => setChooser(false)} aria-label="Close" className="text-slate-400 hover:text-white text-2xl font-bold px-2">
                ×
              </button>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {roles.map((r) => (
                <Link 
                  onClick={() => setChooser(false)} 
                  to={r.to} 
                  key={r.title} 
                  className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-800 bg-slate-950 hover:border-teal-500 transition"
                >
                  <img src={r.img} alt={r.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-heading font-bold text-sm text-white">{r.title} Portal</p>
                    <p className="text-[11px] text-slate-400 leading-snug">{r.tag}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
