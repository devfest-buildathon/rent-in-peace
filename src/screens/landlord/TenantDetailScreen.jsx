import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, FileText, Bell, Check } from 'lucide-react';

export default function TenantDetailScreen() {
  const { setCurrentScreen } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-2">
      <div>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setCurrentScreen('LANDLORD_TENANTS')} className="p-1 -ml-1 text-[#14532D] cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-6"></div>
        </div>

        {/* Profile Header */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-black text-sm flex items-center justify-center mx-auto mb-2">
            CK
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Charlie Kirk</h1>
          <p className="text-xs text-slate-500">1 · Boarding House / Bedspace</p>
          <span className="inline-block text-[9px] bg-[#ECFDF5] text-[#14532D] font-bold px-2.5 py-0.5 rounded-full mt-1.5">
            Active contract
          </span>
        </div>

        {/* Next Payment Card (Solid Emerald) */}
        <div className="p-4 bg-[#14532D] text-white rounded-3xl shadow-md mb-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">NEXT PAYMENT</span>
            <h2 className="text-lg font-black mt-0.5">Every 15th</h2>
            <p className="text-xs text-emerald-200/80 font-mono">09227128394</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">₱5,000</span>
          </div>
        </div>

        {/* Contract Summary */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700">Contract summary</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 text-xs shadow-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Lease term</span>
              <strong className="text-slate-800">1 month · Started 2026-10-30</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deposit</span>
              <strong className="text-slate-800">₱5,000</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Utilities</span>
              <strong className="text-slate-800">Included in rent + Included in rent</strong>
            </div>

            <button 
              onClick={() => setCurrentScreen('WIZARD_CONTRACT')}
              className="w-full mt-2 py-2.5 border border-[#14532D] text-[#14532D] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" /> View contract
            </button>
          </div>
        </div>

        {/* Payment Records */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700">Payment records</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Current cycle</p>
                  <p className="text-[10px] text-slate-400">Due Every 15th</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600">Pending</span>
            </div>

            <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#ECFDF5] text-[#14532D] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Previous cycle</p>
                  <p className="text-[10px] text-slate-400">Paid</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#14532D]">Paid</span>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => alert("Rent reminder SMS dispatched to Charlie Kirk (09227128394)!")}
        className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 mb-2 cursor-pointer"
      >
        <Bell className="w-4 h-4" /> Send reminder
      </button>
    </div>
  );
}
