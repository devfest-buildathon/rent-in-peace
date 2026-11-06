import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Copy, Check, ArrowRight } from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

export default function ReviewShareScreen() {
  const { 
    setCurrentScreen,
    landlordName,
    tenantName,
    roomNumber,
    propertyType,
    monthlyRent,
    deposit,
    advanceRent,
    leaseDuration,
    activeCode,
    copiedLink,
    handleCopyLink,
    refreshClausesFromDraft
  } = useApp();

  const handleGenerateKasulatan = () => {
    refreshClausesFromDraft();
    setCurrentScreen('WIZARD_CONTRACT');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('WIZARD_DETAILS')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Summary</h2>
          <div className="w-10"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={2} />

        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">VERIFICATION</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Review Details
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Confirm terms before compiling the legal Kasulatan.
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Lessor (Landlord)</span>
            <span className="font-bold text-slate-900">{landlordName || '—'}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Lessee (Tenant)</span>
            <span className="font-bold text-slate-900">{tenantName || 'To be filled upon tenant link'}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Premises</span>
            <span className="font-bold text-slate-900">{roomNumber} · {propertyType}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Lease Term</span>
            <span className="font-bold text-slate-900">{leaseDuration}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Monthly Rent</span>
            <span className="font-black text-sm text-[#14532D]">₱{Number(monthlyRent || 0).toLocaleString()}</span>
          </div>

          {(deposit || advanceRent) && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Advance & Deposit</span>
              <span className="font-medium text-slate-700">
                Adv: ₱{Number(advanceRent || 0).toLocaleString()} · Dep: ₱{Number(deposit || 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Shareable Code Box for Tenant */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl mb-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Room Code</p>
              <p className="font-mono text-xl font-black text-[#14532D] mt-0.5">{activeCode || 'RIP-4B92'}</p>
            </div>
            <button 
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[11px] text-emerald-800/80 mt-2">
            Tenant can register with this code to review terms, e-sign the lease, and submit their advance rent.
          </p>
        </div>

      </div>

      {/* Generate Kasulatan CTA */}
      <div className="pt-3 pb-2">
        <button 
          onClick={handleGenerateKasulatan}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <span>Generate Kasulatan sa Abang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
