import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Smartphone, Zap } from 'lucide-react';

const SCREENS = [
  { id: 'SPLASH', label: '1. Splash' },
  { id: 'LANDLORD_HOME', label: '2. Home' },
  { id: 'WIZARD_PROPERTY', label: '3. Renting Out?' },
  { id: 'WIZARD_DETAILS', label: '4. Basics' },
  { id: 'WIZARD_REVIEW', label: '5. Review' },
  { id: 'WIZARD_CONTRACT', label: '6. Kasulatan' },
  { id: 'WIZARD_CHECK', label: '7. Check' },
  { id: 'ALL_DONE', label: '8. Ready!' },
  { id: 'LANDLORD_TENANTS', label: '9. My Tenants' },
  { id: 'TENANT_DETAIL', label: '10. Charlie Kirk' },
  { id: 'SETTINGS', label: '11. Settings' },
  { id: 'TENANT_CODE_ENTRY', label: '12. Invite Code' },
  { id: 'TENANT_PORTAL', label: '13. Tenant Sign' },
  { id: 'SUCCESS_PIN', label: '14. Key PIN' },
];

export default function PitchBar() {
  const { currentScreen, setCurrentScreen, layoutMode, setLayoutMode } = useApp();

  const isTenantMode = currentScreen === 'TENANT_CODE_ENTRY' || currentScreen === 'TENANT_PORTAL' || currentScreen === 'SUCCESS_PIN';

  return (
    <header className="no-print w-full max-w-[430px] md:max-w-2xl bg-slate-900 text-white py-2 px-3 sm:px-4 rounded-b-xl md:rounded-2xl mb-2 sm:mb-3 shadow-lg flex flex-col gap-2 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EAB308] flex items-center justify-center">
            <Home className="w-3.5 h-3.5 text-emerald-950" />
          </div>
          <div>
            <span className="font-extrabold text-xs tracking-wide text-emerald-400">
              RENT IN PEACE (RIP)
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400">
              GDG Cagayan de Oro Buildathon 2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle: App vs Phone Bezel */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'app' ? 'phone-bezel' : 'app')}
            className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 transition cursor-pointer"
            title="Toggle Phone Shell Bezel"
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span>{layoutMode === 'app' ? 'Bezel Off' : 'Bezel On'}</span>
          </button>

          {/* Quick Switch Landlord / Tenant Portal */}
          <button
            onClick={() => setCurrentScreen(isTenantMode ? 'LANDLORD_HOME' : 'TENANT_CODE_ENTRY')}
            className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              isTenantMode 
                ? 'bg-amber-500 text-slate-950 font-black' 
                : 'bg-[#14532D] text-white hover:bg-emerald-800'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{isTenantMode ? 'Exit Tenant' : 'Tenant Mode'}</span>
          </button>
        </div>
      </div>

      {/* Quick Screen Nav Switcher for Seamless Stage Pitching */}
      <div className="flex items-center gap-1 overflow-x-auto text-[10px] pb-1 scrollbar-none">
        <span className="text-slate-400 text-[10px] shrink-0 font-medium">Screens:</span>
        {SCREENS.map(s => (
          <button
            key={s.id}
            onClick={() => setCurrentScreen(s.id)}
            className={`px-2 py-0.5 rounded-md font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === s.id 
                ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </header>
  );
}
