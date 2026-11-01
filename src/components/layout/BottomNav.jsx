import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Plus, User } from 'lucide-react';

export default function BottomNav() {
  const { currentScreen, setCurrentScreen, startNewContract } = useApp();

  return (
    <nav aria-label="Bottom Navigation" className="border-t border-slate-200/90 bg-white py-2 px-6 flex items-center justify-around relative shrink-0">
      <button 
        onClick={() => setCurrentScreen('LANDLORD_HOME')} 
        className={`flex flex-col items-center cursor-pointer transition ${
          currentScreen === 'LANDLORD_HOME' ? 'text-[#14532D]' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className={`text-[9px] mt-0.5 ${currentScreen === 'LANDLORD_HOME' ? 'font-bold' : 'font-medium'}`}>
          Home
        </span>
      </button>

      <button 
        onClick={startNewContract}
        className="flex flex-col items-center -mt-6 cursor-pointer group"
        title="Create New Contract"
      >
        <div className="w-12 h-12 rounded-full bg-[#14532D] text-white flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:bg-[#0f4022] transition">
          <Plus className="w-6 h-6 stroke-[3]" />
        </div>
        <span className="text-[9px] font-bold text-[#14532D] mt-1">New Lease</span>
      </button>

      <button 
        onClick={() => setCurrentScreen('LANDLORD_TENANTS')} 
        className={`flex flex-col items-center cursor-pointer transition ${
          currentScreen === 'LANDLORD_TENANTS' || currentScreen === 'TENANT_DETAIL' ? 'text-[#14532D]' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        <User className="w-5 h-5" />
        <span className={`text-[9px] mt-0.5 ${currentScreen === 'LANDLORD_TENANTS' ? 'font-bold' : 'font-medium'}`}>
          My Tenants
        </span>
      </button>
    </nav>
  );
}
