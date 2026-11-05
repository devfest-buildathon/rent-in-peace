import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, Copy, KeyRound, Share2, Home } from 'lucide-react';

export default function AllDoneScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    tenantName,
    activeCode,
    copiedLink,
    handleCopyLink,
    landlordSigningMode
  } = useApp();

  const [copiedAll, setCopiedAll] = useState(false);
  const displayCode = activeCode || 'RIP-KEY1';
  const lockboxPin = '5829';

  const handleCopyAllCheckinDetails = () => {
    const url = `${window.location.origin}?code=${displayCode}`;
    const text = `Hi ${tenantName || 'Tenant'}! Your lease agreement for ${roomNumber || 'the unit'} is ready:\n\n1. Room Access Code: ${displayCode}\n2. Smart Lockbox Key PIN: ${lockboxPin}\n\nReview terms and complete check-in here:\n${url}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Modern Success Graphic */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#14532D] to-emerald-600 text-white flex items-center justify-center mx-auto my-3 shadow-[0_10px_25px_rgba(20,83,45,0.3)]">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>

        <div className="text-center mb-5">
          <span className="text-[10px] bg-emerald-100 text-[#14532D] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {landlordSigningMode === 'WET_INK' ? 'Contract Ready · Wet-Ink' : 'Contract Saved · E-Sign'}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Credentials Issued
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Provide the tenant with their room code to sign the Kasulatan and view their lockbox PIN.
          </p>
        </div>

        {/* 1. Smart Lockbox Key PIN Card */}
        <div className="p-5 rounded-3xl bg-[#052e16] text-white shadow-lg mb-3 text-center border border-emerald-900/60 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

          <p className="text-[10px] text-amber-300 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Smart Lockbox Master PIN</span>
          </p>
          <div className="my-2">
            <span className="font-mono text-4xl font-black tracking-widest text-white">
              {lockboxPin}
            </span>
          </div>
          <p className="text-[11px] text-emerald-200/80 leading-snug">
            Protected. Released automatically to tenant after you verify their advance rent payment.
          </p>
        </div>

        {/* 2. Tenant Room Code Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenant Link Code</p>
              <p className="font-mono text-xl font-black text-[#14532D] mt-0.5">{displayCode}</p>
            </div>
            <button 
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#14532D] font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <button 
            onClick={handleCopyAllCheckinDetails}
            className="w-full py-2.5 bg-[#EAB308] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            {copiedAll ? <Check className="w-4 h-4 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedAll ? 'Check-in instructions copied!' : 'Share instructions via SMS / WhatsApp'}</span>
          </button>
        </div>

      </div>

      {/* Done CTA */}
      <div className="pt-2 pb-2">
        <button 
          onClick={() => setCurrentScreen('LANDLORD_HOME')}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
