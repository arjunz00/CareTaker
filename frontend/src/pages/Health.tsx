import React from 'react';
import { usePatient } from '../hooks/usePatient';
import ProfileForm from '../components/ProfileForm';
import LocationCard from '../components/LocationCard';
import { ShieldCheck, User } from 'lucide-react';

export default function Health() {
  const { profile, contacts, loading, error, updateProfile } = usePatient();

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
        Error loading health profile: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            My Clinical Health Record
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Edit patient physiological baselines, medical histories, and emergency coordinates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (8 cols) - Profile Form */}
        <div className="lg:col-span-8">
          {profile && (
            <ProfileForm 
              initialProfile={profile} 
              onSave={updateProfile} 
            />
          )}
        </div>

        {/* Right (4 cols) - Location Sharing GPS Map */}
        <div className="lg:col-span-4 space-y-6">
          <LocationCard 
            initialSharing={true} 
            emergencyLocation={profile?.emergency_location || "B-402, Seawoods Towers, Navi Mumbai"} 
          />
        </div>

      </div>

    </div>
  );
}
