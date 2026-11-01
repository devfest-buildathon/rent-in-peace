import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Check, Bell, QrCode, Copy, KeyRound, Share2, MessageSquare, ArrowRight } from 'lucide-react';

export default function AllDoneScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    monthlyRent,
    tenantName,
    activeCode,
    copiedLink,
    handleCopyLink,
    rentReminderEnabled,
    setRentReminderEnabled
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
    <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-lg mx-auto w-full">
      <div>
        {/* Graphic: Document with Check badge */}
        <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-[#ECFDF5] flex items-center justify-center relative shadow-xs">
            <FileText className="w-12 h-12 text-[#14532D]" />
            <div className="absolute bottom-1 right-2 w-7 h-7 rounded-full bg-[#E5A93C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <span className="text-[10px] bg-emerald-100 text-[#14532D] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Contract Saved & Live
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Check-In Credentials Ready
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Give these two credentials to your tenant to access their lease and physical keys.
          </p>
        </div>

        {/* 1. Smart Lockbox Key PIN Card */}
        <div className="p-4 bg-gradient-to-br from-[#14532D] to-emerald-950 text-white rounded-3xl shadow-md mb-3 text-center border border-emerald-800">
          <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Lockbox Door PIN</span>
          </p>
          
          {/* 4 Big Digits */}
          <div className="flex items-center justify-center gap-2.5 my-2.5">
            {lockboxPin.split('').map((digit, idx) => (
              <div 
                key={idx}
                className="w-11 h-13 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-2xl font-black text-amber-300 shadow-inner font-mono"
              >
                {digit}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-emerald-100 font-medium">
            Tenant enters this 4-digit PIN on the lockbox to retrieve unit keys.
          </p>
        </div>

        {/* 2. Tenant Single-Use Room Code Card */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-[#14532D]" />
              <span>Tenant Room Invite Code</span>
            </span>
            <span className="text-[9px] bg-emerald-100 text-[#14532D] px-2 py-0.5 rounded font-mono font-bold">
              Ready to Share
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 mt-2">
            <span className="font-mono font-black text-base tracking-wider text-[#14532D]">
              {displayCode}
            </span>
            <button 
              onClick={handleCopyLink}
              className="text-xs bg-[#14532D] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#0f4022] transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Copy All Details for Tenant */}
        <button 
          onClick={handleCopyAllCheckinDetails}
          className="w-full mb-3 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
        >
          {copiedAll ? <Check className="w-4 h-4 text-emerald-700" /> : <Share2 className="w-4 h-4 text-amber-800" />}
          <span>{copiedAll ? 'Check-In Details Copied to Clipboard!' : 'Copy Complete Check-In SMS (Code + PIN)'}</span>
        </button>

        {/* Monthly Rent Reminder Card with Toggle */}
        <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#14532D] flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#14532D]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Monthly rent reminder</p>
              <p className="text-[10px] text-slate-400">
                Every 5th · ₱{Number(monthlyRent || 0).toLocaleString()}
              </p>
            </div>
          </div>

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
      <div className="space-y-2.5 pb-2 pt-3">
        <button 
          onClick={() => window.print()}
          className="w-full py-3.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" /> Save PDF / Print A4 Copy
        </button>

        <button 
          onClick={() => setCurrentScreen('LANDLORD_HOME')}
          className="w-full py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
