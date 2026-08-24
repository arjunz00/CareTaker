import React, { useState, useEffect } from 'react';
import { Stethoscope, Calendar, Phone, ArrowRight, MessageSquare } from 'lucide-react';

export interface DoctorInfo {
  name: string;
  specialization: string;
  hospital: string;
  contact: string;
  email: string;
  availability: string;
  recent_consultation: {
    date: string;
    notes: string;
    follow_up_date: string;
  };
}

export default function DoctorCard() {
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const getEmail = () => {
    const sessionStr = localStorage.getItem("aegis_session");
    if (sessionStr) {
      try {
        return JSON.parse(sessionStr).email;
      } catch (e) {
        return "savita.sharma@gmail.com";
      }
    }
    return "savita.sharma@gmail.com";
  };

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const email = getEmail();
        const res = await fetch(`/api/patient/doctor?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setDoctor(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-48 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition duration-200 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-850 pb-3 mb-4 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-900 text-blue-400">
            <Stethoscope className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white block">{doctor.name}</h4>
            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{doctor.specialization}</span>
          </div>
        </div>
      </div>

      {/* Clinical Notes Summary */}
      <div className="space-y-3.5 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Recent consultation notes:</span>
          <p className="text-slate-300 leading-relaxed font-sans bg-slate-950 p-3 rounded-xl border border-slate-850 text-[11px] italic">
            "{doctor.recent_consultation.notes}"
          </p>
        </div>
        
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/50">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-mono block">Consulted Date</span>
            <span className="text-xs font-bold text-white font-mono">{doctor.recent_consultation.date}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-mono block">Follow-up Date</span>
            <span className="text-xs font-bold text-indigo-400 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {doctor.recent_consultation.follow_up_date}
            </span>
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="mt-4 pt-3.5 border-t border-slate-850 flex gap-2">
        <a 
          href={`tel:${doctor.contact}`}
          className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10px] py-2 rounded-xl text-center flex items-center justify-center gap-1 transition active:scale-95 uppercase tracking-wider"
        >
          <Phone className="w-3 h-3" />
          Call Doctor
        </a>
        <button 
          onClick={() => alert("Dr. Swamy's office has been queried. For secure medical issues, consultations can be booked via app portal.")}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 transition active:scale-95 uppercase tracking-wider shadow-lg shadow-indigo-600/10"
        >
          <MessageSquare className="w-3 h-3" />
          Book Appointment
        </button>
      </div>

    </div>
  );
}
