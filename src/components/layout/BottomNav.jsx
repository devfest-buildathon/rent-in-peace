import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Users, Plus } from 'lucide-react';

export default function BottomNav() {
  const { currentScreen, setCurrentScreen, startNewContract } = useApp();

  const isHome = currentScreen === 'LANDLORD_HOME';
  const isTenants = currentScreen === 'LANDLORD_TENANTS' || currentScreen === 'TENANT_DETAIL';

  return (
    <nav 
      aria-label="Bottom Navigation" 
      className="relative w-full shrink-0 select-none z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_25px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-center gap-10 sm:gap-12 py-3 px-6 max-w-sm mx-auto">
        
        {/* Left Button: Home (Increased size ~1.5x) */}
        <button 
          type="button"
          onClick={() => setCurrentScreen('LANDLORD_HOME')} 
          className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ${
            isHome 
              ? 'text-[#14532D] scale-105' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-2.5 rounded-2xl transition ${isHome ? 'bg-emerald-50 text-[#14532D]' : ''}`}>
            {/* 1.5x icon: w-7.5 h-7.5 / w-7 h-7 */}
            <Home className={`w-7 h-7 ${isHome ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] tracking-tight mt-0.5 ${isHome ? 'font-black text-[#14532D]' : 'font-semibold text-slate-400'}`}>
            Home
          </span>
        </button>

        {/* Center Button: Circular New Lease button, completely aligned level with other buttons */}
        <button 
          type="button"
          onClick={startNewContract}
          className="flex flex-col items-center justify-center cursor-pointer group"
          title="Create New Lease"
        >
          {/* Increased size ~1.5x: w-13 h-13 with w-7 h-7 plus icon */}
          <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#14532D] via-[#047857] to-[#10b981] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(20,83,45,0.35)] group-hover:scale-105 active:scale-95 transition-transform duration-150">
            <Plus className="w-7 h-7 stroke-[3]" />
          </div>
          <span className="text-[11px] font-bold text-[#14532D] mt-1 tracking-tight">
            New Lease
          </span>
        </button>

        {/* Right Button: Tenants (Increased size ~1.5x) */}
        <button 
          type="button"
          onClick={() => setCurrentScreen('LANDLORD_TENANTS')} 
          className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ${
            isTenants 
              ? 'text-[#14532D] scale-105' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-2.5 rounded-2xl transition ${isTenants ? 'bg-emerald-50 text-[#14532D]' : ''}`}>
            {/* 1.5x icon: w-7.5 h-7.5 / w-7 h-7 */}
            <Users className={`w-7 h-7 ${isTenants ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] tracking-tight mt-0.5 ${isTenants ? 'font-black text-[#14532D]' : 'font-semibold text-slate-400'}`}>
            Tenants
          </span>
        </button>

      </div>
    </nav>
  );
}
