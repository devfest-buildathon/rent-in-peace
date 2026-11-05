import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Check, 
  FileText, 
  ShieldCheck, 
  Handshake, 
  ChevronRight, 
  Building, 
  KeyRound,
  LogOut,
  UserCheck,
  CreditCard,
  Clock,
  CheckCircle2
} from 'lucide-react';
import BrandHeader from '../../components/layout/BrandHeader';

export default function SplashScreen() {
  const { 
    setCurrentScreen, 
    landlordProfile, 
    tenantProfile, 
    userRole, 
    logout,
    resetAppData,
    contracts,
    activeCode,
    setContractClauses
  } = useApp();

  // Find linked contract for signed-in tenant
  const tenantContract = contracts.find(
    c => (tenantProfile?.contractCode && (c.code === tenantProfile.contractCode || c.id === tenantProfile.contractCode)) ||
         (c.tenantUsername && c.tenantUsername === tenantProfile?.username) ||
         (c.tenantName && c.tenantName === tenantProfile?.name) ||
         (activeCode && (c.code === activeCode || c.id === activeCode))
  ) || null;

  const isVerified = Boolean(tenantContract?.paymentVerified);
  const isSigned = Boolean(tenantContract?.isSigned);
  const displayRoom = tenantContract?.roomNumber || 'Room Unit';

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-lg mx-auto w-full">
      <div>
        {/* Brand Header (Clean, no dev pills) */}
        <BrandHeader subtitle="Good contracts make good neighbors." />

        {/* Center Graphic */}
        <div className="relative w-52 h-40 mx-auto my-2 flex items-center justify-center">
          <div className="absolute right-2 top-1 w-36 h-36 rounded-full bg-[#FEF3C7] -z-0"></div>
          
          <div className="relative z-10 flex items-end gap-2">
            <div className="w-10 h-20 bg-[#14532D] rounded-t-full shadow-xs"></div>
            
            <div className="w-24 h-28 bg-white border border-slate-100 rounded-t-full shadow-md flex items-center justify-center relative">
              <div className="w-10 h-10 border-2 border-[#14532D] rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-[#14532D]" />
              </div>
              <div className="absolute bottom-5 right-2.5 w-5 h-5 bg-[#D97706] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            
            <div className="w-10 h-20 bg-[#D97706] rounded-t-full shadow-xs"></div>
          </div>
        </div>

        {/* Big Title & Subtitle */}
        <div className="text-center my-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Make a clear rental contract in minutes.
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-[290px] mx-auto leading-relaxed">
            Friendly, legally grounded lease agreements for landlords and boarding houses in Cagayan de Oro.
          </p>
        </div>

        {/* 3 Value Cards */}
        <div className="grid grid-cols-3 gap-2.5 my-3">
          <div className="p-2.5 bg-white border border-slate-200/80 rounded-2xl text-center shadow-2xs">
            <FileText className="w-4 h-4 text-[#14532D] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-900 leading-tight">Clear terms</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Civil Code Art. 1356</p>
          </div>
          <div className="p-2.5 bg-white border border-slate-200/80 rounded-2xl text-center shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#14532D] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-900 leading-tight">Spot risky terms</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Rent Control Act</p>
          </div>
          <div className="p-2.5 bg-white border border-slate-200/80 rounded-2xl text-center shadow-2xs">
            <Handshake className="w-4 h-4 text-[#14532D] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-900 leading-tight">Dual-signing</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Wet-ink or e-sign</p>
          </div>
        </div>
      </div>

      {/* Role Selection & Auth Entry */}
      <div className="space-y-2.5 pb-2">
        {/* If already signed in as Landlord */}
        {landlordProfile?.name && userRole === 'LANDLORD' ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#14532D] text-white flex items-center justify-center text-xs font-bold">
                  {landlordProfile.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">{landlordProfile.name}</p>
                  <p className="text-[10px] text-emerald-800">Signed in as Landlord</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-[10px] text-emerald-800 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>

            <button 
              onClick={() => setCurrentScreen('LANDLORD_HOME')}
              className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3 rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to Landlord Dashboard</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        ) : tenantProfile?.name && userRole === 'TENANT' ? (
          /* If already signed in as Tenant - Dedicated Tenant Hub */
          <div className="p-3.5 bg-white border border-emerald-300 rounded-3xl space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#DCFCE7] text-[#14532D] flex items-center justify-center text-sm font-black shadow-2xs">
                  {tenantProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-slate-900">{tenantProfile.name}</p>
                    {isVerified ? (
                      <span className="text-[9px] bg-emerald-100 text-[#14532D] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified
                      </span>
                    ) : isSigned ? (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse" /> Pending
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-slate-500">{displayRoom} · Tenant Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-[10px] text-slate-400 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer transition p-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Verification & Apartment Entry Status Alert */}
            {isVerified ? (
              <div className="p-2.5 bg-[#ECFDF5] border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-[#14532D]">
                <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold">Apartment key access is unlocked! PIN: 5829</span>
              </div>
            ) : isSigned ? (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-800">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <span className="text-[11px] font-semibold">Payment verification pending by landlord.</span>
              </div>
            ) : null}

            {/* Two Action Buttons: Dashboard/Pay Rent & Lease Agreement */}
            <div className="space-y-1.5 pt-1">
              <button 
                onClick={() => setCurrentScreen('TENANT_HOME')}
                className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3 px-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span className="font-black">Open Tenant Dashboard & Pay Rent</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-0.5 transition" />
              </button>

              <button 
                onClick={() => {
                  if (tenantContract?.contractClauses) {
                    setContractClauses(tenantContract.contractClauses);
                  }
                  setCurrentScreen(isSigned ? 'WIZARD_CONTRACT' : 'TENANT_PORTAL');
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{isSigned ? 'View Signed Lease Agreement' : 'Complete Lease Sign & Pay'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Flow: Two Primary Entry Roles */
          <>
            {/* Landlord Portal Button */}
            <button 
              onClick={() => setCurrentScreen('LANDLORD_AUTH')}
              className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-md transition flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-black text-sm">Landlord Portal</p>
                  <p className="text-[11px] text-emerald-200 font-normal">Sign in or register to manage leases & rooms</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Tenant Portal Button */}
            <button 
              onClick={() => setCurrentScreen('TENANT_AUTH')}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-bold py-3.5 px-4 rounded-2xl text-xs transition cursor-pointer shadow-2xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 text-[#14532D]" />
                </div>
                <div>
                  <p className="font-black text-sm text-slate-900">Tenant Portal</p>
                  <p className="text-[11px] text-slate-500 font-normal">Sign in or enter room code to review lease</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
            </button>
          </>
        )}

        <p className="text-[10px] text-slate-400 text-center pt-1">
          Progressive Web App · Works offline & printable under Article 1356 of the Civil Code.
        </p>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Wipe all local test accounts, contracts, and cached data? This resets the app to its fresh empty state.')) {
                resetAppData();
              }
            }}
            className="text-[10px] text-slate-400 hover:text-red-600 font-semibold transition cursor-pointer"
          >
            Clear Test Data (Start Fresh)
          </button>
        </div>
      </div>
    </div>
  );
}
