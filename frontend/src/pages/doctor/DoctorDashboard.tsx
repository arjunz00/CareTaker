import React, { useState, useEffect } from 'react';
import { usePatients } from '../../hooks/usePatients';
import PatientSummaryCard from '../../components/doctor/PatientSummaryCard';
import CriticalPatientCard from '../../components/doctor/CriticalPatientCard';
import PatientTable from '../../components/doctor/PatientTable';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function DoctorDashboard() {
  const { patients, loading, refetch } = usePatients();
  const [filter, setFilter] = useState('all');

  // Counts
  const total = patients.length;
  const stable = patients.filter(p => p.status === 'Stable').length;
  const monitor = patients.filter(p => p.status === 'Monitor').length;
  const critical = patients.filter(p => p.status === 'Critical').length;
  const offline = patients.filter(p => p.vitals.heartRate === 0).length;

  // Filter patients list for table
  const displayedPatients = patients.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'offline') return p.vitals.heartRate === 0;
    return p.status === filter;
  });

  const criticalList = patients.filter(p => p.status === 'Critical');

  // WebSocket active checks for demo triggers updates
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/telemetry`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      ws = new WebSocket(wsUrl);
      ws.onmessage = () => {
        // Refetch patient list on websocket event so status changes update table instantly
        refetch();
      };
      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [refetch]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white leading-tight">Good Evening, Dr. Arvind Swamy</h1>
          <p className="text-xs text-slate-500 mt-0.5">Here is your patient monitoring and triage overview.</p>
        </div>
      </div>

      {/* KPI Stats cards */}
      <PatientSummaryCard
        totalCount={total}
        stableCount={stable}
        monitorCount={monitor}
        criticalCount={critical}
        offlineCount={offline}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Critical triage panel */}
      {criticalList.length > 0 && (
        <div className="space-y-3.5">
          <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 select-none">
            <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
            Critical Attention Required ({criticalList.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {criticalList.map((p) => (
              <CriticalPatientCard key={p.id} patient={p} />
            ))}
          </div>
        </div>
      )}

      {/* Patient Directory list Table */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest select-none">
          Patient Directory & Telemetry Index
        </h3>
        <PatientTable patients={displayedPatients} />
      </div>

    </div>
  );
}
