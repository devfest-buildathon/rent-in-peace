import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  Copy, 
  Share2, 
  Home, 
  FileText, 
  Printer, 
  ShieldCheck, 
  KeyRound,
  Download
} from 'lucide-react';

export default function AllDoneScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    tenantName,
    propertyAddress,
    landlordName,
    activeCode,
    copiedLink,
    handleCopyLink,
    contractClauses,
    landlordSigningMode,
    landlordSignature,
    monthlyRent,
    deposit,
    advanceRent,
    leaseDuration
  } = useApp();

  const [copiedShareText, setCopiedShareText] = useState(false);
  const displayCode = activeCode || 'RIP-PENDING';

  const handleCopyShareInstructions = () => {
    const url = `${window.location.origin}?code=${displayCode}`;
    const text = `Hi ${tenantName || 'Tenant'}! Your residential lease agreement (Kasulatan) for ${roomNumber || 'the rental unit'} at ${propertyAddress || 'our property'} is ready for review and signing.\n\nRoom Access Code: ${displayCode}\n\nReview terms, sign the Kasulatan, and submit advance rent here:\n${url}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Success Header Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#14532D] to-emerald-600 text-white flex items-center justify-center mx-auto my-2 shadow-[0_10px_25px_rgba(20,83,45,0.25)]">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="text-center mb-4">
          <span className="text-[10px] bg-emerald-100 text-[#14532D] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {landlordSigningMode === 'WET_INK' ? 'Kasulatan Finalized · Wet-Ink' : 'Kasulatan Finalized · E-Sign'}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Agreement Saved & Ready
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-[290px] mx-auto leading-relaxed">
            Your legal Kasulatan is archived in Firestore. Share the room code with your tenant to begin onboarding.
          </p>
        </div>

        {/* 1. Tenant Room Link Code Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenant Room Code</p>
              <p className="font-mono text-2xl font-black text-[#14532D] mt-0.5">{displayCode}</p>
            </div>
            <button 
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#14532D] font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-emerald-200"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
            </button>
          </div>

          <button 
            onClick={handleCopyShareInstructions}
            className="w-full py-2.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
          >
            {copiedShareText ? <Check className="w-4 h-4 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedShareText ? 'Instructions Copied to Clipboard!' : 'Share Tenant Instructions'}</span>
          </button>
        </div>

        {/* 2. Key Access Policy Notice */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-3xl mb-4 text-xs text-emerald-900 flex items-start gap-2.5 shadow-2xs">
          <KeyRound className="w-4 h-4 text-[#14532D] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-slate-900 block mb-0.5">Secure Keypad Lock Access</span>
            A unique random door code will be generated for the tenant once you manually verify their GCash advance payment receipt on your dashboard.
          </div>
        </div>

        {/* 3. Kasulatan Agreement Preview Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Signed Kasulatan Agreement</h3>
              <p className="text-[10px] text-slate-400">Full legally compliant residential lease document</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {contractClauses.length} Clauses
            </span>
          </div>

          {/* Quick Contract Summary Details */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Lessor:</span>
              <span className="font-bold text-slate-800">{landlordName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unit / Premises:</span>
              <span className="font-bold text-slate-800">{roomNumber || 'Unit'} · {propertyAddress || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly Rent:</span>
              <span className="font-black text-[#14532D]">₱{Number(monthlyRent || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Term Duration:</span>
              <span className="font-bold text-slate-800">{leaseDuration || '6 months'}</span>
            </div>
          </div>

          {/* Preview of Clauses */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-none text-[11px] text-slate-700">
            {contractClauses.map((c, i) => (
              <div key={i} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block">{i + 1}. {(c.title || '').replace(/^\d+\.\s*/, '')}</span>
                <p className="mt-0.5 text-slate-600 leading-snug">{c.text || c.english}</p>
              </div>
            ))}
          </div>

          {/* Landlord Signature Status */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Lessor Execution:</span>
            {landlordSignature ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Digitally Signed
              </span>
            ) : (
              <span className="text-amber-700 font-bold">Prepared for Wet-Ink Ballpen Signing</span>
            )}
          </div>
        </div>

      </div>

      {/* Action Buttons: Download PDF + Return to Dashboard */}
      <div className="space-y-2 pt-2 pb-2">
        <button 
          onClick={() => window.print()}
          className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
        >
          <Printer className="w-4 h-4 text-[#14532D]" />
          <span>Download & Print Kasulatan PDF (A4)</span>
        </button>

        <button 
          onClick={() => setCurrentScreen('LANDLORD_HOME')}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          <span>Return to Landlord Dashboard</span>
        </button>
      </div>
    </div>
  );
}
