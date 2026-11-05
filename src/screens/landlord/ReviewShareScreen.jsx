import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, QrCode, Copy, Check, FileText } from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

export default function ReviewShareScreen() {
  const { 
    setCurrentScreen,
    landlordName,
    contactNumber,
    tenantName,
    roomNumber,
    propertyAddress,
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
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('WIZARD_DETAILS')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Review Terms</h2>
          <div className="w-10"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={2} />

        <div className="mb-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Review details</h1>
          <p className="text-xs text-slate-500 mt-0.5">Please confirm these lease terms before generating the Kasulatan.</p>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2.5 text-xs mb-3 shadow-2xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Landlord (Lessor)</span>
            <span className="font-bold text-slate-900">{landlordName || '—'}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Tenant (Lessee)</span>
            <span className="font-bold text-slate-900">{tenantName || '—'}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Phone Contact</span>
            <span className="font-mono font-bold text-slate-900">{contactNumber || '—'}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Premises</span>
            <span className="font-bold text-slate-900">{roomNumber} · {propertyAddress}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Property Type</span>
            <span className="font-bold text-slate-900">{propertyType}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Lease Term</span>
            <span className="font-bold text-slate-900">{leaseDuration}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Monthly Rent</span>
            <span className="font-black text-sm text-[#14532D]">₱{Number(monthlyRent || 0).toLocaleString()}</span>
          </div>
          {(deposit || advanceRent) && (
            <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
              <span>Deposit & Advance</span>
              <span>Deposit: ₱{Number(deposit || 0).toLocaleString()} · Advance: ₱{Number(advanceRent || 0).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Shareable Code Box for Tenant */}
        <div className="p-4 bg-[#ECFDF5] border border-emerald-300 rounded-2xl mb-3 shadow-2xs">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-[#14532D] flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#14532D]" /> Single-Use Room Code
            </span>
            <span className="text-[9px] bg-[#14532D] text-white px-2 py-0.5 rounded font-mono font-bold">
              Unique Passcode
            </span>
          </div>
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-emerald-200 mt-2">
            <span className="font-mono font-black text-base tracking-wider text-[#14532D]">
              {activeCode}
            </span>
            <button 
              onClick={handleCopyLink}
              className="text-xs bg-[#14532D] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#0f4022] transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[10px] text-emerald-800 mt-2 leading-relaxed">
            Your tenant can open this link in any browser or enter the code to review and sign the agreement without installing any app.
          </p>
        </div>
      </div>

      <div className="space-y-2 pb-2">
        <button 
          onClick={handleGenerateKasulatan}
          className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Kasulatan sa Pag-abang</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
