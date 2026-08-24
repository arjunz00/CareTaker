import React from 'react';
import { TrendingUp } from 'lucide-react';
import RiskForecastChart from '../../components/doctor/RiskForecastChart';
import AIExplanationCard from '../../components/doctor/AIExplanationCard';

export default function Risk() {
  return (
    <div className="p-6 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-center select-none border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            AI Safety & Forecast Risk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Check short-term risk trajectory forecasting models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <RiskForecastChart score={12} />
        <AIExplanationCard score={12} conditions="Mild Hypertension" />
      </div>

    </div>
  );
}
