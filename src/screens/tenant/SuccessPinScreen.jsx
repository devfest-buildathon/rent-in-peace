import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Clock, Lock, KeyRound, ArrowRight } from 'lucide-react';

export default function SuccessPinScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    propertyAddress,
    monthlyRent,
    activeCode,
    roomCodeInput,
    contracts,
    tenantProfile
  } = useApp();

  const currentCode = activeCode || roomCodeInput || tenantProfile?.contractCode;
  const activeContract = contracts.find(c => c.code === currentCode || c.id === currentCode) || {};
  const isVerified = Boolean(activeContract.paymentVerified);

  const displayRoom = roomNumber || activeContract.roomNumber || 'Unit 1';
  const displayAddress = propertyAddress || activeContract.propertyAddress || 'Cagayan de Oro City';
  const displayRent = Number(monthlyRent || activeContract.monthlyRent || 0);

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Status Badge */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto my-3 shadow-md ${
          isVerified 
            ? 'bg-[#DCFCE7] text-[#14532D]' 
            : 'bg-amber-100 text-amber-800'
        }`}>
          {isVerified ? (
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          ) : (
            <Clock className="w-10 h-10 stroke-[2.5] text-amber-600 animate-pulse" />
          )}
        </div>

        <div className="text-center mb-5">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            isVerified ? 'bg-emerald-100 text-[#14532D]' : 'bg-amber-100 text-amber-800'
          }`}>
            {isVerified ? 'Payment Verified · Ready to Move-In' : 'Lease Signed · Awaiting Landlord Approval'}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            {isVerified ? `Welcome to ${displayRoom}!` : 'Check-In Received!'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-[290px] mx-auto leading-relaxed">
            {isVerified 
              ? 'Your payment is approved. Use your PIN to retrieve keys from the physical lockbox.' 
              : 'Your signed Kasulatan and payment reference have been sent to your landlord for confirmation.'}
          </p>
        </div>

        {/* Lockbox Access Card */}
        {isVerified ? (
          <div className="p-5 rounded-3xl bg-[#052e16] text-white shadow-lg border border-emerald-900/60 text-center mb-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

            <p className="text-[10px] text-amber-300 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Smart Lockbox Master PIN</span>
            </p>
            <div className="my-2">
              <span className="font-mono text-4xl font-black tracking-widest text-emerald-400">
                5829
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-snug">
              Punch 5829 into the lockbox on {displayRoom}'s door to retrieve your physical keys.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs text-center mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-900">Lockbox PIN is Protected</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Once your lessor confirms your advance rent payment on their dashboard, PIN 5829 will unlock here.
            </p>
          </div>
        )}

        {/* Unit Info Summary Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-2.5 text-xs mb-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Assigned Room</span>
            <span className="font-bold text-slate-900">{displayRoom}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Property Location</span>
            <span className="font-bold text-slate-900">{displayAddress}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Monthly Rent</span>
            <span className="font-black text-[#14532D]">₱{displayRent.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Continue to Tenant Hub CTA */}
      <div className="pt-2 pb-2">
        <button 
          onClick={() => setCurrentScreen('TENANT_HOME')}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <span>Open Tenant Resident Hub</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
