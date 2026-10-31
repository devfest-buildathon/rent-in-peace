import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Home, ShieldCheck } from 'lucide-react';

export default function InviteCodeScreen() {
  const { 
    setCurrentScreen, 
    roomCodeInput, 
    setRoomCodeInput, 
    activeCode 
  } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-3">
      <div>
        {/* Back button (White rounded card with shadow) */}
        <button 
          onClick={() => setCurrentScreen('SPLASH')}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer mb-3"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#EAB308] flex items-center justify-center shadow-xs">
            <Home className="w-5 h-5 text-emerald-950" />
          </div>
          <span className="text-sm font-black">
            <span className="text-[#14532D]">Rent in </span>
            <span className="text-[#047857]">Peace</span>
          </span>
        </div>

        {/* Section Tag & Title */}
        <div className="mb-4">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">TENANT PORTAL</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Enter your invite code</h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your landlord gave you this code or sent an invite link via SMS or Messenger.
          </p>
        </div>

        {/* Blue Info Notice Card */}
        <div className="p-4 bg-[#EFF6FF] border border-blue-200/80 rounded-2xl mb-5 flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-950">No account needed:</h4>
            <p className="text-[11px] text-blue-900 mt-0.5 leading-relaxed">
              As a tenant, you don't need to sign up or create passwords. Simply enter your code to view and review your contract.
            </p>
          </div>
        </div>

        {/* Invite Code Input Field */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-800 mb-1.5">Invite Code</label>
          <input 
            type="text" 
            value={roomCodeInput} 
            onChange={(e) => setRoomCodeInput(e.target.value)}
            placeholder="e.g. CDO-7890" 
            className="w-full px-4 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm font-mono font-bold text-slate-900 placeholder:font-sans placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs uppercase"
          />
          <p className="text-[10px] text-slate-400 mt-1.5 pl-1">
            Demo Code: <span className="font-mono font-bold text-[#14532D] cursor-pointer hover:underline" onClick={() => setRoomCodeInput(activeCode)}>{activeCode}</span> (Tap to auto-fill)
          </p>
        </div>

        {/* Continue Button */}
        <button 
          onClick={() => setCurrentScreen('TENANT_PORTAL')}
          className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* Bottom Footer Link */}
      <div className="text-center pb-2 pt-6">
        <span className="text-xs text-slate-500">Are you a landlord? </span>
        <button 
          onClick={() => setCurrentScreen('LANDLORD_HOME')} 
          className="text-xs font-bold text-[#14532D] hover:underline cursor-pointer"
        >
          Go to Landlord Portal
        </button>
      </div>
    </div>
  );
}
