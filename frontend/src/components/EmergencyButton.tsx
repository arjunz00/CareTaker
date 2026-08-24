import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';
import { useEmergency } from '../hooks/useEmergency';

export default function EmergencyButton() {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerSOS } = useEmergency();

  // Hide the floating SOS button on the login/register/emergency views to prevent overlay clutter
  const hiddenRoutes = ["/patient/login", "/patient/register", "/patient/emergency"];
  const isHidden = hiddenRoutes.includes(location.pathname);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setHolding(true);
    setProgress(0);
    
    const startTime = Date.now();
    const duration = 3000; // 3 seconds hold

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      
      if (elapsed >= duration) {
        triggerActivation();
      }
    }, 50);
  };

  const endHold = () => {
    setHolding(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const triggerActivation = () => {
    endHold();
    
    // Play sound feedback
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch(err) {
      console.warn("Audio Context blocked:", err);
    }

    triggerSOS();
    navigate("/patient/emergency");
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (isHidden) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 select-none">
      
      {holding && (
        <div className="absolute bottom-20 right-0 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl w-48 text-center animate-fadeIn">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hold for 3 seconds</p>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-800">
            <div 
              className="bg-rose-500 h-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-[9px] text-rose-400 font-bold block mt-1 font-mono">
            {(Math.max(0, 3 - (progress * 3) / 100)).toFixed(1)}s remaining
          </span>
        </div>
      )}

      <button
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white border-2 shadow-2xl active:scale-95 transition-all duration-300 relative select-none ${
          holding 
            ? 'bg-rose-700 border-white ripple-active scale-110' 
            : 'bg-rose-600 border-rose-500 hover:bg-rose-500'
        }`}
      >
        <AlertOctagon className={`w-6 h-6 ${holding ? 'animate-bounce' : 'animate-pulse'}`} />
        <span className="absolute -top-1.5 bg-rose-900 border border-rose-700 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full text-white">
          SOS
        </span>
      </button>
    </div>
  );
}
