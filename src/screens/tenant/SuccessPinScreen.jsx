import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, FileText, Home, Clock, Lock, KeyRound, ChevronRight, CreditCard } from 'lucide-react';

export default function SuccessPinScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    tenantName,
    propertyAddress,
    monthlyRent,
    activeCode,
    roomCodeInput,
    contracts,
    tenantProfile,
    gcashRefNumber
  } = useApp();

  const currentCode = activeCode || roomCodeInput || tenantProfile?.contractCode;
  const activeContract = contracts.find(c => c.code === currentCode || c.id === currentCode) || {};
  const isVerified = Boolean(activeContract.paymentVerified);

  const displayRoom = roomNumber || activeContract.roomNumber || 'Unit 1';
  const displayTenant = tenantName || activeContract.tenantName || tenantProfile?.name || 'Valued Tenant';
  const displayAddress = propertyAddress || activeContract.propertyAddress || 'Cagayan de Oro City';
  const displayRent = Number(monthlyRent || activeContract.monthlyRent || 0);
  const displayRef = activeContract.gcashRef || gcashRefNumber || 'Direct Payment';

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-lg mx-auto w-full">
      <div>
        {/* Success / Pending Status Badge */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto my-3 shadow-2xs ${
          isVerified ? 'bg-[#ECFDF5] text-[#14532D]' : 'bg-amber-100 text-amber-800'
        }`}>
          {isVerified ? (
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          ) : (
            <Clock className="w-10 h-10 stroke-[2.5] text-amber-600 animate-pulse" />
          )}
        </div>

        <div className="text-center mb-4">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            isVerified ? 'bg-emerald-100 text-[#14532D]' : 'bg-amber-100 text-amber-800'
          }`}>
            {isVerified ? 'Payment Verified · Ready to Move-In' : 'Lease Signed · Awaiting Landlord Verification'}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            {isVerified ? `Welcome to ${displayRoom}!` : 'Check-In Received!'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-[300px] mx-auto leading-relaxed">
            {isVerified 
              ? 'Your payment has been verified by the landlord. You are cleared for room entry.' 
              : 'Your signed contract and payment proof have been sent to your landlord for confirmation.'}
          </p>
        </div>

        {/* Lockbox Access Card: Unlocked vs Locked */}
        {isVerified ? (
          <div className="p-5 bg-gradient-to-br from-[#14532D] to-emerald-900 text-white rounded-3xl shadow-xl text-center mb-4">
            <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold">
              Smart Lockbox Access PIN
            </p>
            
            {/* 4-Digit PIN */}
            <div className="flex items-center justify-center gap-3 my-3">
              {['5', '8', '2', '9'].map((digit, idx) => (
                <div 
                  key={idx}
                  className="w-12 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-3xl font-black text-amber-300 shadow-inner font-mono"
                >
                  {digit}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-emerald-100 leading-snug">
              Enter this 4-digit code into the lockbox at the unit door to retrieve your physical keys.
            </p>
          </div>
        ) : (
          <div className="p-5 bg-amber-50 border border-amber-300 rounded-3xl shadow-md text-center mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-amber-800 uppercase tracking-widest font-black">
              Door Key PIN Locked
            </p>
            
            {/* Masked PIN */}
            <div className="flex items-center justify-center gap-2.5 my-3">
              {['●', '●', '●', '●'].map((dot, idx) => (
                <div 
                  key={idx}
                  className="w-11 h-12 bg-white border border-amber-300 rounded-xl flex items-center justify-center text-xl font-black text-slate-400 font-mono shadow-2xs"
                >
                  {dot}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-700 leading-snug">
              Your PIN will unlock immediately once your landlord verifies your GCash payment (Ref: <span className="font-mono font-bold">{displayRef}</span>).
            </p>
            <p className="text-[10px] text-amber-800 font-semibold mt-1.5">
              Track live verification status in your Tenant Dashboard.
            </p>
          </div>
        )}

        {/* Summary Details */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 text-xs shadow-2xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Tenant (Lessee)</span>
            <strong className="text-slate-800">{displayTenant}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Premises</span>
            <strong className="text-slate-800">{displayRoom}, {displayAddress}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Monthly Rent</span>
            <strong className="text-[#14532D]">₱{displayRent.toLocaleString()} (Due every 5th)</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Reference</span>
            <span className="font-mono font-bold text-slate-700">{displayRef}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pb-2 pt-3">
        <button 
          onClick={() => setCurrentScreen('TENANT_HOME')}
          className="w-full py-3.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4 text-amber-300" />
          <span>Go to Tenant Dashboard & Payments</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => window.print()}
            className="py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Signed PDF</span>
          </button>

          <button 
            onClick={() => setCurrentScreen('SPLASH')}
            className="py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
