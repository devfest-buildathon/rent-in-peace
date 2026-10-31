import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, QrCode, Copy, Check, Zap } from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

export default function ReviewShareScreen() {
  const { 
    setCurrentScreen,
    landlordName,
    contactNumber,
    roomNumber,
    propertyAddress,
    propertyType,
    monthlyRent,
    activeCode,
    copiedLink,
    handleCopyLink,
    setRoomCodeInput
  } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-2">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentScreen('WIZARD_DETAILS')} className="p-1 -ml-1 text-[#14532D] cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Review & Share</h2>
          <div className="w-6"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={2} />

        <div className="mb-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Review details</h1>
          <p className="text-xs text-slate-500 mt-0.5">Verified against PhilSys standards.</p>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2.5 text-xs mb-3 shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Landlord</span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              {landlordName}
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">FROM ID</span>
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Phone</span>
            <span className="font-mono font-bold text-slate-900">{contactNumber}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Premises</span>
            <span className="font-bold text-slate-900">{roomNumber} · {propertyAddress}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-slate-400">Type</span>
            <span className="font-bold text-slate-900">{propertyType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Monthly Rent</span>
            <span className="font-black text-sm text-[#14532D]">₱{monthlyRent}</span>
          </div>
        </div>

        {/* Shareable Code Box for Tenant */}
        <div className="p-4 bg-[#ECFDF5] border border-emerald-300 rounded-2xl mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-[#14532D] flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#14532D]" /> Single-Use Room Code
            </span>
            <span className="text-[9px] bg-[#14532D] text-white px-2 py-0.5 rounded font-mono font-bold">
              Expires in 24h
            </span>
          </div>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-200 mt-2">
            <span className="font-mono font-black text-base tracking-wider text-[#14532D]">
              {activeCode}
            </span>
            <button 
              onClick={handleCopyLink}
              className="text-xs bg-[#14532D] text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-[#0f4022] transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[10px] text-emerald-800 mt-2 leading-relaxed">
            Send this code to your tenant so they can review & e-sign the lease agreement directly on mobile web without installing any app.
          </p>
        </div>
      </div>

      <div className="space-y-2 pb-2">
        <button 
          onClick={() => setCurrentScreen('WIZARD_CONTRACT')}
          className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Generate Kasulatan</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
        <button 
          onClick={() => {
            setRoomCodeInput(activeCode);
            setCurrentScreen('TENANT_CODE_ENTRY');
          }}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Zap className="w-3.5 h-3.5" /> Open Tenant Invite Screen
        </button>
      </div>
    </div>
  );
}
