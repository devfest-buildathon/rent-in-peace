import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wifi, Signal, Battery } from 'lucide-react';

export default function MobileFrame({ children }) {
  const { layoutMode } = useApp();

  return (
    <div className={`no-print w-full max-w-[430px] bg-[#F4F8F5] flex flex-col relative transition-all duration-200 ${
      layoutMode === 'phone-bezel'
        ? 'h-[890px] rounded-[48px] shadow-2xl border-[10px] border-slate-900 overflow-hidden my-2'
        : 'min-h-[820px] rounded-none sm:rounded-[36px] shadow-xl sm:border sm:border-slate-300/80 overflow-hidden'
    }`}>
      {/* iOS Top Status Bar (9:41) */}
      <div className="pt-2 px-6 pb-1 flex items-center justify-between text-slate-800 text-xs font-semibold select-none bg-[#F4F8F5]">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 text-slate-800">
          <Signal className="w-3.5 h-3.5 fill-current" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 fill-current" />
        </div>
      </div>

      {/* Main Screen Content Viewport */}
      <main className="flex-1 flex flex-col overflow-y-auto relative scrollbar-none">
        {children}
      </main>

      {/* Mobile Device Home Bar (Indicator) */}
      <div className="py-2 flex justify-center bg-[#F4F8F5]">
        <div className="w-32 h-1 bg-slate-900/20 rounded-full"></div>
      </div>
    </div>
  );
}
