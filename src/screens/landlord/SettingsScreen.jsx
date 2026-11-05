import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  RotateCcw, 
  LogOut, 
  KeyRound,
  Building,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function SettingsScreen() {
  const { 
    setCurrentScreen, 
    landlordProfile, 
    resetAppData, 
    logout,
    contracts 
  } = useApp();

  const handleReset = () => {
    if (window.confirm('Reset all app data? This will clear saved landlord profile and contracts, returning the app to its fresh first-time state.')) {
      resetAppData();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setCurrentScreen('LANDLORD_HOME')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Account Settings</h2>
          <div className="w-10"></div>
        </div>

        {/* Profile Card */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-3xl mb-4 flex items-center gap-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-black text-sm flex items-center justify-center shrink-0">
            {landlordProfile?.name ? landlordProfile.name.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-900 truncate">
              {landlordProfile?.name || 'Landlord Account'}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              {landlordProfile?.phone ? `${landlordProfile.phone} · ` : ''}{landlordProfile?.propertyName || 'Rental Property'}
            </p>
          </div>
          <button 
            onClick={() => setCurrentScreen('LANDLORD_AUTH')}
            className="text-xs text-[#14532D] font-bold px-2.5 py-1 bg-[#ECFDF5] rounded-xl hover:bg-emerald-100 transition cursor-pointer shrink-0"
          >
            Switch
          </button>
        </div>

        {/* Property & Account Summary */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
              <Building className="w-3.5 h-3.5 text-[#14532D]" />
              <span>Property</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {landlordProfile?.propertyName || 'Boarding House'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{landlordProfile?.city || 'Cagayan de Oro City'}</p>
          </div>

          <div className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
              <FileText className="w-3.5 h-3.5 text-[#14532D]" />
              <span>Contracts</span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              {contracts.length} active
            </p>
            <p className="text-[10px] text-slate-400">Cloud Synced</p>
          </div>
        </div>

        {/* Preferences & Navigation */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Options & Portals</p>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
            <div 
              onClick={() => setCurrentScreen('TENANT_AUTH')}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                <KeyRound className="w-4 h-4 text-[#14532D]" />
                <span>Switch to Tenant Portal (Room Code / Sign-In)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div 
              onClick={() => handleReset()}
              className="p-3.5 flex items-center justify-between hover:bg-red-50 cursor-pointer text-xs text-red-600"
            >
              <div className="flex items-center gap-2.5 font-semibold">
                <RotateCcw className="w-4 h-4 text-red-600" />
                <span>Reset app to first-time state</span>
              </div>
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Clear Cache</span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={logout}
          className="w-full p-3.5 bg-white border border-slate-300 text-slate-700 rounded-2xl font-bold text-xs text-center hover:bg-slate-50 transition cursor-pointer shadow-2xs flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Sign Out of Account</span>
        </button>
      </div>

      <div className="text-center pt-4 pb-2">
        <p className="text-[10px] text-slate-400">
          Rent in Peace (RIP) · Progressive Web App (PWA)
        </p>
      </div>
    </div>
  );
}
