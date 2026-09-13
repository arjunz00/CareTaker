import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { PatientListItem } from '../../hooks/usePatients';

interface PatientTableProps {
  patients: PatientListItem[];
}

const patientAvatars: Record<string, string> = {
  "savita.sharma@gmail.com": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "ramesh.kumar@gmail.com": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  "priya.verma@gmail.com": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
  "default": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
};

export default function PatientTable({ patients }: PatientTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Stable' | 'Monitor' | 'Critical'>('all');
  const [sortByRisk, setSortByRisk] = useState<boolean>(true);

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.profile.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort patients by risk
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    return sortByRisk ? b.risk_score - a.risk_score : a.risk_score - b.risk_score;
  });

  const getStatusColor = (status: string) => {
    if (status === "Critical") return "bg-rose-950/60 text-rose-300 border border-rose-800";
    if (status === "Monitor") return "bg-amber-950/60 text-amber-300 border border-amber-800";
    return "bg-teal-950/60 text-teal-300 border border-teal-800";
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Controls: Search, Filters */}
      <div className="flex flex-col md:flex-row gap-3 select-none">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient Name or ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 placeholder-slate-500 font-sans"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex gap-2 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="all">All Triage Statuses</option>
              <option value="Stable">🟢 Stable</option>
              <option value="Monitor">🟡 Monitor Needed</option>
              <option value="Critical">🔴 Critical Triage</option>
            </select>
          </div>

          {/* Sort trigger */}
          <button
            onClick={() => setSortByRisk(!sortByRisk)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 hover:text-white flex items-center gap-1.5 transition active:scale-95 font-medium"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
            <span>Risk: {sortByRisk ? "Highest First" : "Lowest First"}</span>
          </button>
        </div>

      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-widest font-mono text-[9px] select-none">
            <tr>
              <th className="px-4 py-3">Patient Profile</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">AI Risk</th>
              <th className="px-4 py-3">Heart Rate</th>
              <th className="px-4 py-3">SpO₂ Level</th>
              <th className="px-4 py-3">Telemetry</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {sortedPatients.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 font-mono text-slate-500 text-xs">
                  No matching patient records found.
                </td>
              </tr>
            ) : (
              sortedPatients.map((p) => {
                const avatar = patientAvatars[p.id] || patientAvatars["default"];
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={avatar} 
                          alt={p.profile.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white block text-xs">{p.profile.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{p.profile.age} yrs</td>
                    <td className="px-4 py-3 font-mono font-bold text-white">{p.risk_score} / 100</td>
                    <td className="px-4 py-3 text-teal-400 font-mono font-semibold">
                      {p.vitals.heartRate > 0 ? `${p.vitals.heartRate} BPM` : "--"}
                    </td>
                    <td className="px-4 py-3 text-sky-400 font-mono font-semibold">
                      {p.vitals.spo2 > 0 ? `${p.vitals.spo2}%` : "--"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {p.vitals.heartRate > 0 ? (
                        <span className="inline-flex items-center gap-1 text-teal-400 font-semibold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold text-[10px]">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full font-mono uppercase tracking-wider ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right select-none">
                      <button
                        onClick={() => navigate(`/doctor/patients/${p.id}`)}
                        className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500 hover:text-slate-950 text-teal-400 font-bold rounded-lg transition inline-flex items-center gap-1 active:scale-95 text-xs"
                        title="Open Clinical Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
export type { PatientTableProps };
