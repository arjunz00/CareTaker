import React, { useState, useEffect } from 'react';
import { Stethoscope, Calendar, Phone, MessageSquare, Star, CheckCircle2 } from 'lucide-react';

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
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 shadow-xl transition duration-200 flex flex-col justify-between">
      
      {/* Doctor Profile Header */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400" 
              alt={doctor.name} 
              className="w-13 h-13 rounded-2xl object-cover border border-slate-700 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-heading font-extrabold text-white">{doctor.name}</h4>
              <div className="flex text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 ml-0.5">4.9</span>
              </div>
            </div>
            <span className="text-xs text-teal-400 font-medium block">{doctor.specialization}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{doctor.hospital}</span>
          </div>
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="space-y-3 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Recent Consultation Notes
          </span>
          <p className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] italic">
            "{doctor.recent_consultation.notes}"
          </p>
        </div>
        
        {/* Follow-up Info */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-mono block">Last Consulted</span>
            <span className="text-xs font-bold text-slate-200 font-mono">{doctor.recent_consultation.date}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-mono block">Next Follow-Up</span>
            <span className="text-xs font-bold text-teal-400 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              {doctor.recent_consultation.follow_up_date}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex gap-2">
        <a 
          href={`tel:${doctor.contact}`}
          className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-[11px] py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition active:scale-95 uppercase tracking-wider"
        >
          <Phone className="w-3.5 h-3.5 text-teal-400" />
          Call Doctor
        </a>
        <button 
          onClick={() => alert(`Direct consultation request sent to ${doctor.name}.`)}
          className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 uppercase tracking-wider shadow-md shadow-teal-500/20"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Book Visit
        </button>
      </div>

    </div>
  );
}
