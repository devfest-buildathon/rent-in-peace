import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, FileText } from 'lucide-react';

export default function SuccessPinScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    tenantName,
    propertyAddress,
    monthlyRent
  } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-4">
      <div>
        {/* Success Animation Badge */}
        <div className="w-20 h-20 rounded-full bg-[#ECFDF5] text-[#14532D] flex items-center justify-center mx-auto my-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="text-center mb-6">
          <span className="text-[10px] bg-emerald-100 text-[#14532D] font-bold px-3 py-1 rounded-full uppercase">
            Check-in Successful
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            Welcome to Room {roomNumber}!
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">
            Your Kasulatan sa Pag-abang is officially signed and registered.
          </p>
        </div>

        {/* Master PIN Box */}
        <div className="p-5 bg-gradient-to-br from-[#14532D] to-emerald-900 text-white rounded-3xl shadow-xl text-center mb-4">
          <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold">
            Smart Lockbox Access PIN
          </p>
          
          {/* Giant 4-Digit PIN */}
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

          <p className="text-[11px] text-emerald-100">
            Enter this 4-digit code into the smart lockbox at the unit door to retrieve your physical keys.
          </p>
          <p className="text-[9px] text-emerald-300/80 mt-1">
            PIN expires automatically at 11:59 PM today.
          </p>
        </div>

        {/* Summary Details */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 text-xs shadow-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Tenant</span>
            <strong className="text-slate-800">{tenantName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Address</span>
            <strong className="text-slate-800">{roomNumber}, {propertyAddress}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Monthly Rent</span>
            <strong className="text-[#14532D]">₱{monthlyRent} (Due every 5th)</strong>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pb-2">
        <button 
          onClick={() => window.print()}
          className="w-full py-3.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" /> Download Signed PDF Contract
        </button>

        <button 
          onClick={() => setCurrentScreen('LANDLORD_HOME')}
          className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl transition cursor-pointer"
        >
          Return to Landlord Home
        </button>
      </div>
    </div>
  );
}
