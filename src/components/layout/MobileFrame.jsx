import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function MobileFrame({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
  });

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="no-print w-full h-[100dvh] sm:h-[880px] sm:max-h-[96vh] sm:max-w-[420px] sm:my-auto sm:rounded-[44px] bg-[#F4F8F5] sm:shadow-[0_25px_70px_rgba(20,83,45,0.14)] sm:border-[8px] sm:border-[#1E2922] flex flex-col relative overflow-hidden transition-all duration-300">
      
      {/* iOS Dynamic Island & Status Bar Header */}
      <div className="hidden sm:flex items-center justify-between px-7 pt-3.5 pb-2 shrink-0 select-none pointer-events-none z-40 bg-transparent">
        <span className="text-[13px] font-semibold tracking-tight text-slate-800">9:41</span>
        
        {/* Dynamic Island Pill */}
        <div className="w-24 h-6 bg-black rounded-full flex items-center justify-center -mt-0.5 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-2.5"></div>
        </div>

        {/* Status Icons: Cellular, Wifi, Battery */}
        <div className="flex items-center gap-1.5 text-slate-800">
          {/* Signal */}
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
            <rect x="1" y="11" width="2" height="4" rx="0.5"/>
            <rect x="5" y="8" width="2" height="7" rx="0.5"/>
            <rect x="9" y="5" width="2" height="10" rx="0.5"/>
            <rect x="13" y="2" width="2" height="13" rx="0.5"/>
          </svg>
          {/* Wifi */}
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
            <path d="M8 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.24-2.83a6 6 0 0 1 8.48 0 .75.75 0 1 0 1.06-1.06 7.5 7.5 0 0 0-10.6 0 .75.75 0 0 0 1.06 1.06zm-2.83-2.83a10 10 0 0 1 14.14 0 .75.75 0 1 0 1.06-1.06 11.5 11.5 0 0 0-16.26 0 .75.75 0 1 0 1.06 1.06z"/>
          </svg>
          {/* Battery */}
          <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-0.5 flex items-center">
            <div className="h-full w-full bg-slate-800 rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* PWA Install Banner */}
      {installPrompt && !isInstalled && (
        <div className="bg-[#14532D] text-white px-4 py-2.5 flex items-center justify-between text-xs shadow-lg z-50 shrink-0">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-300" />
            <span className="font-semibold text-slate-100">Add to Home Screen</span>
          </div>
          <button 
            onClick={handleInstallClick}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-full text-[11px] transition cursor-pointer"
          >
            Install
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative scrollbar-none w-full min-h-0 bg-[#F4F8F5]">
        {children}
      </main>

      {/* iOS Home Indicator Bar at the bottom */}
      <div className="hidden sm:flex justify-center py-2 shrink-0 bg-transparent pointer-events-none select-none z-40">
        <div className="w-32 h-1 bg-slate-400/50 rounded-full"></div>
      </div>
    </div>
  );
}
