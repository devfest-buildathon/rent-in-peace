import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Check, Bell } from 'lucide-react';

export default function AllDoneScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    monthlyRent,
    rentReminderEnabled,
    setRentReminderEnabled
  } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-4">
      <div>
        {/* Graphic: Document with Check badge & floating confetti dots */}
        <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-[#ECFDF5] flex items-center justify-center relative">
            <FileText className="w-14 h-14 text-[#14532D]" />
            <div className="absolute bottom-2 right-3 w-8 h-8 rounded-full bg-[#E5A93C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>

          {/* Confetti Accent Dots */}
          <div className="absolute top-4 left-8 w-2 h-2 rounded-full bg-emerald-600"></div>
          <div className="absolute top-8 right-6 w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-emerald-400"></div>
          <div className="absolute bottom-10 right-10 w-2.5 h-2.5 rounded-full bg-emerald-700"></div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold text-[#14532D] uppercase tracking-widest">ALL DONE</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Your contract is ready.</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
            Your clear, friendly contract for {roomNumber} is ready to sign.
          </p>
        </div>

        {/* Monthly Rent Reminder Card with Toggle (Pia's Image 4) */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between mb-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#14532D] flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#14532D]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Monthly rent reminder</p>
              <p className="text-[10px] text-slate-400">Every 5th of the month · ₱{monthlyRent}</p>
            </div>
          </div>

          {/* Interactive Toggle Switch */}
          <div 
            onClick={() => setRentReminderEnabled(!rentReminderEnabled)}
            className={`w-11 h-6 rounded-full transition cursor-pointer p-0.5 flex items-center ${
              rentReminderEnabled ? 'bg-[#14532D] justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pb-2">
        <button 
          onClick={() => window.print()}
          className="w-full py-3.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" /> Save PDF
        </button>

        <button 
          onClick={() => alert("Rent reminder added to Google Sheets & Calendar!")}
          className="w-full py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Bell className="w-4 h-4 text-[#14532D]" /> Add rent reminder
        </button>

        <button 
          onClick={() => setCurrentScreen('LANDLORD_HOME')}
          className="block text-center text-xs font-bold text-[#14532D] hover:underline pt-2 w-full cursor-pointer"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
