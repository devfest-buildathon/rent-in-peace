import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  LogOut, 
  KeyRound,
  Building,
  ShieldCheck,
  // --- [Agent C] Start ---
  FileText
  // --- [Agent C] End ---
} from 'lucide-react';

export default function SettingsScreen() {
  const { 
    navigateBack,
    setCurrentScreen, 
    landlordProfile, 
    resetAppData, 
    logout 
  } = useApp();

  const handleReset = () => {
    if (window.confirm('Reset all app data? This will clear saved landlord profile and contracts, returning the app to its fresh first-time state.')) {
      resetAppData();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button"
            onClick={navigateBack} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Account Settings</h2>
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-2xs overflow-hidden">
            <img src="/assets/logo-icon.png" alt="Rent in Peace" className="w-full h-full object-contain rounded-xl" />
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs mb-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-black text-sm flex items-center justify-center shadow-xs shrink-0">
            {landlordProfile?.name ? landlordProfile.name.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {landlordProfile?.name || 'Landlord Account'}
            </h3>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {landlordProfile?.phone ? `${landlordProfile.phone} · ` : ''}{landlordProfile?.propertyName || 'Rental Property'}
            </p>
          </div>
          <button 
            onClick={() => setCurrentScreen('LANDLORD_AUTH')}
            className="text-xs text-[#14532D] font-bold px-3 py-1.5 bg-[#ECFDF5] rounded-xl hover:bg-emerald-100 transition cursor-pointer shrink-0"
          >
            Edit
          </button>
        </div>

        {/* Settings Group */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1">Preferences & Compliance</h4>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#14532D]" />
              <span className="font-semibold text-slate-700">Philippine Rent Control Act</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">Active Rules</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-[#14532D]" />
              <span className="font-semibold text-slate-700">Municipality Jurisdiction</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{landlordProfile?.city || landlordProfile?.propertyAddress || 'Configured on lease'}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold text-slate-700">Door Access Codes</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-700">Dynamic (per verified tenant)</span>
          </div>
        </div>

        {/* --- [Agent C] Start: Customize Lease Presets Link --- */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-2 mb-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1">Kasulatan Lease Agreements</h4>
          <button
            type="button"
            onClick={() => setCurrentScreen('CUSTOMIZE_LEASE')}
            className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100 flex items-center justify-between text-xs text-[#14532D] font-bold transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#14532D]" />
              <div className="text-left">
                <span className="block leading-tight">Customize Lease Presets</span>
                <span className="text-[10px] text-slate-500 font-normal">Design clauses, placeholders, &amp; languages</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#14532D]" />
          </button>
        </div>
        {/* --- [Agent C] End --- */}

        {/* Data & Session Actions */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-2 mb-4">
          <button
            onClick={handleReset}
            className="w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset Demo App Data</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-xs text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4" />
              <span className="font-bold">Sign Out Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </button>
        </div>

      </div>

      <div className="pt-2 text-center">
        <p className="text-[10px] text-slate-400">Rent in Peace v2.0</p>
      </div>
    </div>
  );
}
