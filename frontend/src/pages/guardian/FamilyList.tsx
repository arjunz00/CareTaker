import React from 'react';
import { useFamily, type FamilyMember } from '../../hooks/guardian/useFamily';
import FamilyMemberCard from '../../components/guardian/FamilyMemberCard';
import { Users } from 'lucide-react';

export default function FamilyList() {
  const { family, loading, error } = useFamily();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-rose-500 font-mono font-bold">
        Error loading family profiles: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            My Family Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Monitor active health telemetry for your authorized family members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {family.map((member: FamilyMember) => (
          <FamilyMemberCard key={member.id} member={member} />
        ))}
      </div>

    </div>
  );
}
