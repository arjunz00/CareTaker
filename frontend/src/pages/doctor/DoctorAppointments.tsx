import React from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { Calendar, CheckCircle, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorAppointments() {
  const { appointments, loading, markCompleted } = useAppointments();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const upcoming = appointments.filter(a => a.status === 'Upcoming');
  const completed = appointments.filter(a => a.status === 'Completed');

  const getStatusBadge = (status: string) => {
    return status === 'Completed'
      ? <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded text-[9px] font-mono">COMPLETED</span>
      : <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded text-[9px] font-mono animate-pulse">UPCOMING</span>;
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Clinic Appointment Agenda
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Manage schedules, mark completed sessions, and review follow-up reasons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none text-xs">
        
        {/* Upcoming appointments list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-405 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
            <Clock className="w-4.5 h-4.5 text-indigo-405" />
            Upcoming Schedules ({upcoming.length})
          </h4>
          
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-6 font-mono text-slate-500 text-[10px]">No upcoming appointments scheduled today.</div>
            ) : (
              upcoming.map((a) => (
                <div key={a.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block text-sm">{a.patient_name}</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">{a.reason}</span>
                    <span className="text-[9px] text-slate-400 font-mono block mt-1.5">{a.time}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    {getStatusBadge(a.status)}
                    <div className="flex gap-1.5 mt-1">
                      <button 
                        onClick={() => navigate(`/doctor/patients/${a.patient_id}`)}
                        className="p-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => markCompleted(a.id)}
                        className="p-1 bg-emerald-950/40 border border-emerald-900/60 text-emerald-450 hover:bg-emerald-900 hover:text-white rounded-lg transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed appointments list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-405 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-2.5">
            <CheckCircle className="w-4.5 h-4.5 text-indigo-405" />
            Completed Sessions ({completed.length})
          </h4>
          
          <div className="space-y-3">
            {completed.length === 0 ? (
              <div className="text-center py-6 font-mono text-slate-500 text-[10px]">No completed appointments logged yet.</div>
            ) : (
              completed.map((a) => (
                <div key={a.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 flex justify-between items-center opacity-70">
                  <div>
                    <span className="font-bold text-white block text-sm">{a.patient_name}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{a.reason}</span>
                    <span className="text-[9px] text-slate-400 font-mono block mt-1.5">{a.time}</span>
                  </div>
                  <div>
                    {getStatusBadge(a.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
