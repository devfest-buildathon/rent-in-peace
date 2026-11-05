import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home,
  Check, 
  FileText, 
  ShieldCheck, 
  Handshake, 
  ChevronRight, 
  KeyRound,
  LogOut,
  ArrowRight
} from 'lucide-react';
import BrandHeader from '../../components/layout/BrandHeader';

export default function SplashScreen() {
  const { 
    setCurrentScreen, 
    landlordProfile, 
    tenantProfile, 
    userRole, 
    logout,
    contracts,
    activeCode
  } = useApp();

  const tenantContract = contracts.find(
    c => (tenantProfile?.contractCode && (c.code === tenantProfile.contractCode || c.id === tenantProfile.contractCode)) ||
         (c.tenantUsername && c.tenantUsername === tenantProfile?.username) ||
         (c.tenantName && c.tenantName === tenantProfile?.name) ||
         (activeCode && (c.code === activeCode || c.id === activeCode))
  ) || null;

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-lg mx-auto w-full relative">
      
      {/* Background ambient emerald & gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-emerald-200/40 via-green-100/30 to-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div>
        <BrandHeader subtitle="Good contracts make good neighbors." />

        {/* Hero Card Visual: Original Emerald/Gold palette in iOS FinTech Card architecture */}
        <div className="my-4 relative flex flex-col items-center justify-center">
          <div className="w-full max-w-[320px] h-[190px] rounded-[28px] bg-gradient-to-tr from-[#14532D] via-[#047857] to-[#10b981] p-5 text-white shadow-[0_16px_36px_rgba(20,83,45,0.30)] flex flex-col justify-between relative overflow-hidden group">
            {/* Soft geometric glows */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
            <div className="absolute right-6 top-6 w-20 h-20 rounded-full bg-amber-400/20 blur-md pointer-events-none"></div>

            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAB308] text-emerald-950 flex items-center justify-center shadow-xs">
                  <Home className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold tracking-wide text-white">Rent in Peace</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                Philippine Law
              </span>
            </div>

            <div className="z-10">
              <p className="text-[11px] font-medium text-emerald-100">Digital Kasulatan System</p>
              <h2 className="text-xl font-extrabold tracking-tight text-white mt-0.5">
                Friendly leases made simple.
              </h2>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-100/90 pt-2 border-t border-white/15 z-10">
              <span>Civil Code & Rent Control Act</span>
              <span className="font-bold text-amber-300">CDO Verified</span>
            </div>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center my-3 px-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
            Make a clear rental contract in minutes.
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-[280px] mx-auto">
            Friendly, legally grounded lease agreements for landlords and boarding houses in Cagayan de Oro.
          </p>
        </div>

        {/* 3 iOS Style Feature Pills with Original Forest Green / Amber */}
        <div className="grid grid-cols-3 gap-2.5 my-3.5">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center mb-1.5 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-slate-900">Clear Terms</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Civil Code Art. 1356</p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center mb-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-slate-900">Smart Check</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Rent Control AI</p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 shadow-2xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-bold text-slate-900">PIN Access</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Lockbox Ready</p>
          </div>
        </div>
      </div>

      {/* Role Selection / Direct Entry Button Group */}
      <div className="space-y-3 pt-2 pb-1">
        {landlordProfile?.name && userRole === 'LANDLORD' ? (
          <div className="p-4 bg-white rounded-3xl border border-emerald-200 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#14532D] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  {landlordProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{landlordProfile.name}</p>
                  <p className="text-[10px] text-emerald-800 font-semibold">Signed in as Lessor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-[10px] text-slate-400 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer transition"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>

            <button 
              onClick={() => setCurrentScreen('LANDLORD_HOME')}
              className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Go to Landlord Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Primary Action Button (Original Forest Green) */}
            <button 
              onClick={() => setCurrentScreen('LANDLORD_AUTH')}
              className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-[0_10px_25px_rgba(20,83,45,0.22)] transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
            >
              <div className="text-left">
                <span className="block text-xs font-extrabold text-white">I am a Landlord</span>
                <span className="block text-[10px] text-emerald-200">Manage rooms & create leases</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </button>

            {/* Secondary Action Button (Tenant Portal entry) */}
            <button 
              onClick={() => setCurrentScreen('TENANT_AUTH')}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-bold py-3.5 px-4 rounded-2xl text-xs shadow-sm transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
            >
              <div className="text-left">
                <span className="block text-xs font-extrabold text-slate-900">I am a Tenant</span>
                <span className="block text-[10px] text-slate-500">Enter room code, sign lease & pay</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14532D] group-hover:bg-emerald-100 flex items-center justify-center transition">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
