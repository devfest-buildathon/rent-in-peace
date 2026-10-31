import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Check, FileText, ShieldCheck, Handshake, ChevronRight } from 'lucide-react';
import BrandHeader from '../../components/layout/BrandHeader';

export default function SplashScreen() {
  const { setCurrentScreen } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-4">
      <div>
        {/* Brand Header */}
        <BrandHeader subtitle="Good contracts make good neighbors." />

        {/* Center Pastel Graphic (3 Arches with House & Checkmark) */}
        <div className="relative w-52 h-44 mx-auto my-3 flex items-center justify-center">
          {/* Pale Ochre Circle Backdrop */}
          <div className="absolute right-2 top-1 w-40 h-40 rounded-full bg-[#FEF3C7] -z-0"></div>
          
          {/* 3 Arches */}
          <div className="relative z-10 flex items-end gap-2">
            {/* Left Arch: Dark Green */}
            <div className="w-11 h-24 bg-[#14532D] rounded-t-full shadow-xs"></div>
            
            {/* Center Arch: White with House icon & Gold Checkmark */}
            <div className="w-28 h-32 bg-white border border-slate-100 rounded-t-full shadow-md flex items-center justify-center relative">
              <div className="w-12 h-12 border-2 border-[#14532D] rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-[#14532D]" />
              </div>
              <div className="absolute bottom-6 right-3 w-6 h-6 bg-[#D97706] rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            
            {/* Right Arch: Ochre Gold */}
            <div className="w-11 h-24 bg-[#D97706] rounded-t-full shadow-xs"></div>
          </div>
        </div>

        {/* Big Title & Subtitle */}
        <div className="text-center my-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Make a clear rental contract in minutes.
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-[280px] mx-auto leading-relaxed">
            Friendly guidance for landlords and tenants in Cagayan de Oro.
          </p>
        </div>

        {/* 3 Feature Cards in a row */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="p-3 bg-white border border-slate-200/80 rounded-2xl text-center shadow-xs">
            <FileText className="w-5 h-5 text-[#14532D] mx-auto mb-1.5" />
            <p className="text-[11px] font-bold text-slate-900 leading-tight">Clear contracts</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Easy to review</p>
          </div>
          <div className="p-3 bg-white border border-slate-200/80 rounded-2xl text-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#14532D] mx-auto mb-1.5" />
            <p className="text-[11px] font-bold text-slate-900 leading-tight">Spot risky terms</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Helpful checks</p>
          </div>
          <div className="p-3 bg-white border border-slate-200/80 rounded-2xl text-center shadow-xs">
            <Handshake className="w-5 h-5 text-[#14532D] mx-auto mb-1.5" />
            <p className="text-[11px] font-bold text-slate-900 leading-tight">Editable contract</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Customize anytime</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-2">
        <button 
          onClick={() => setCurrentScreen('LANDLORD_HOME')}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>I'm a landlord</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>

        <button 
          onClick={() => setCurrentScreen('TENANT_CODE_ENTRY')}
          className="w-full bg-white hover:bg-slate-50 border-2 border-[#14532D] text-[#14532D] font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-xs"
        >
          I have a code from my landlord
        </button>

        <p className="text-[10px] text-slate-400 text-center pt-0.5">
          Template for review, not legal advice.
        </p>
      </div>
    </div>
  );
}
