import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home } from 'lucide-react';

const SCREENS = [
  { id: 'SPLASH', label: '1. Welcome' },
  { id: 'LANDLORD_AUTH', label: '2. Landlord Auth' },
  { id: 'LANDLORD_HOME', label: '3. Landlord Dashboard' },
  { id: 'WIZARD_PROPERTY', label: '4. Property Type' },
  { id: 'WIZARD_DETAILS', label: '5. Lease Basics' },
  { id: 'WIZARD_REVIEW', label: '6. Review Summary' },
  { id: 'WIZARD_CONTRACT', label: '7. Kasulatan sa Abang' },
  { id: 'CUSTOMIZE_LEASE', label: '7b. Customize Presets' },
  { id: 'WIZARD_CHECK', label: '8. Smart Check AI' },
  { id: 'ALL_DONE', label: '9. Check-In Ready' },
  { id: 'LANDLORD_TENANTS', label: '10. Resident Directory' },
  { id: 'TENANT_DETAIL', label: '11. Verify GCash & Access' },
  { id: 'SETTINGS', label: '12. Settings' },
  { id: 'TENANT_AUTH', label: '13. Tenant Code Entry' },
  { id: 'TENANT_PORTAL', label: '14. Tenant Sign & Pay' },
  { id: 'SUCCESS_PIN', label: '15. Key Access View' },
  { id: 'TENANT_HOME', label: '16. Tenant Resident Hub' },
];

export default function PitchBar() {
  const { currentScreen, setCurrentScreen } = useApp();

  return (
    <header className="no-print w-full max-w-[420px] md:max-w-2xl bg-[#0F172A] text-white py-2 px-3.5 sm:px-4 rounded-2xl mb-2 sm:mb-3 shadow-xl flex items-center justify-between border border-slate-800 z-50">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-[#EAB308] flex items-center justify-center text-emerald-950 shadow-xs">
          <Home className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="font-extrabold text-xs tracking-tight text-white">
            <span className="text-emerald-400">RENT IN </span>PEACE
          </span>
          <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400">
            DevFest Buildathon 2026
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={currentScreen}
          onChange={(e) => setCurrentScreen(e.target.value)}
          aria-label="Demo Flow Jump"
          className="text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          {SCREENS.map(s => (
            <option key={s.id} value={s.id} className="bg-slate-900 text-white">
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
