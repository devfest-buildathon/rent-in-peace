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
    <div className="no-print w-full min-h-[100dvh] sm:min-h-0 sm:h-[860px] sm:max-h-[94vh] sm:max-w-md sm:my-auto sm:rounded-3xl bg-[#F4F8F5] sm:shadow-2xl sm:border sm:border-slate-300/80 flex flex-col relative overflow-hidden transition-all duration-200">
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
    </div>
  );
}
