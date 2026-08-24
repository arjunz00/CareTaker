import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { PatientListItem } from '../../hooks/usePatients';

interface PatientTableProps {
  patients: PatientListItem[];
}

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
    if (status === "Critical") return "bg-rose-950/40 text-rose-400 border border-rose-900/60";
    if (status === "Monitor") return "bg-amber-950/40 text-amber-400 border border-amber-900/60";
    return "bg-emerald-950/40 text-emerald-400 border border-emerald-900/60";
  };

  const getStatusLabel = (status: string) => {
    if (status === "Critical") return "🔴 CRITICAL";
    if (status === "Monitor") return "🟡 MONITOR";
    return "🟢 STABLE";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Controls: Search, Filters */}
      <div className="flex flex-col md:flex-row gap-3 select-none">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient Name or ID..."
            className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-sans"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex gap-2 text-xs">
          <div className="bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-350 focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="Stable">🟢 Stable</option>
              <option value="Monitor">🟡 Needs Monitor</option>
              <option value="Critical">🔴 Critical triage</option>
            </select>
          </div>

          {/* Sort trigger */}
          <button
            onClick={() => setSortByRisk(!sortByRisk)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-slate-350 hover:text-white flex items-center gap-1.5 transition active:scale-95"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Risk: {sortByRisk ? "High to Low" : "Low to High"}</span>
          </button>
        </div>

      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-850">
        <table className="min-w-full divide-y divide-slate-850 text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-500 uppercase tracking-widest font-mono text-[9px] select-none">
            <tr>
              <th className="px-4 py-3">Patient Profile</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">AI Risk</th>
              <th className="px-4 py-3">Heart Rate</th>
              <th className="px-4 py-3">Oxygen SpO₂</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Sensor Link</th>
              <th className="px-4 py-3">Triage</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 bg-slate-900/40">
            {sortedPatients.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 font-mono text-slate-500 text-[10px]">
                  No matching patients found.
                </td>
              </tr>
            ) : (
              sortedPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/30 transition">
                  <td className="px-4 py-3.5 font-bold text-white leading-normal">
                    <span className="block">{p.profile.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono font-medium block mt-0.5">{p.id}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono">{p.profile.age}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-white">{p.risk_score} / 100</td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono">
                    {p.vitals.heartRate > 0 ? `${p.vitals.heartRate} BPM` : "--"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono">
                    {p.vitals.spo2 > 0 ? `${p.vitals.spo2}%` : "--"}
                  </td>
                  <td className="px-4 py-3.5 text-indigo-400 font-semibold">{p.vitals.activity}</td>
                  <td className="px-4 py-3.5 font-mono">
                    {p.vitals.heartRate > 0 ? (
                      <span className="text-emerald-400 font-semibold">Online</span>
                    ) : (
                      <span className="text-rose-500 font-semibold">Offline</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded font-mono ${getStatusColor(p.status)}`}>
                      {getStatusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right select-none">
                    <button
                      onClick={() => navigate(`/doctor/patients/${p.id}`)}
                      className="p-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition inline-flex items-center gap-1 active:scale-95"
                      title="Inspect Patient Detail"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1">Open</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
export type { PatientTableProps };
