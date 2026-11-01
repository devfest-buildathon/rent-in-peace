import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function MobileFrame({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
  });

  useEffect(() => {
    // Listen for PWA beforeinstallprompt event
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
    <div className="no-print w-full h-[100dvh] sm:h-[844px] sm:max-h-[94vh] sm:max-w-lg sm:my-auto sm:rounded-3xl bg-[#F4F8F5] sm:shadow-2xl sm:border sm:border-slate-300/70 flex flex-col relative overflow-hidden transition-all duration-200">
      {/* PWA Install Banner (only appears on browsers supporting install prompt when not yet installed) */}
      {installPrompt && !isInstalled && (
        <div className="bg-[#14532D] text-white px-4 py-2 flex items-center justify-between text-xs shadow-xs z-30 shrink-0">
          <div className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold">Install Rent in Peace as PWA App</span>
          </div>
          <button 
            onClick={handleInstallClick}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer"
          >
            Install
          </button>
        </div>
      )}

      {/* Main Screen Content Viewport - Natural responsive scrolling without mock bezels */}
      <main className="flex-1 flex flex-col overflow-y-auto relative scrollbar-none w-full min-h-0">
        {children}
      </main>
    </div>
  );
}
