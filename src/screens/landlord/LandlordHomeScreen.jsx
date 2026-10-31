import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Bell, Plus, ChevronRight, User, FileText, HelpCircle, ShieldCheck } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';

export default function LandlordHomeScreen() {
  const { setCurrentScreen } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="px-5 pt-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAB308] flex items-center justify-center shadow-xs">
              <Home className="w-5 h-5 text-emerald-950" />
            </div>
            <span className="text-sm font-black">
              <span className="text-[#14532D]">Rent in </span>
              <span className="text-[#047857]">Peace</span>
            </span>
          </div>
          <button 
            onClick={() => setCurrentScreen('SETTINGS')}
            className="w-8 h-8 rounded-xl bg-[#14532D] text-white font-bold text-xs flex items-center justify-center hover:opacity-90 transition cursor-pointer shadow-xs"
            title="Account Settings"
          >
            L
          </button>
        </div>

        {/* Greeting & Notification */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">GOOD MORNING</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Hi, Landlord.</h1>
            <p className="text-xs text-slate-500 mt-0.5">Everything about your rentals, in one place.</p>
          </div>
          <div className="w-10 h-10 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-700 shadow-xs relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
        </div>

        {/* Big Action Banner (Create a new contract) */}
        <div 
          onClick={() => setCurrentScreen('WIZARD_PROPERTY')}
          className="p-4 bg-[#14532D] hover:bg-[#0f4022] text-white rounded-3xl shadow-md mb-4 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5A93C] text-white flex items-center justify-center shadow-xs">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-sm font-black">Create a new contract</h3>
              <p className="text-[11px] text-emerald-200">Guided, clear, and ready in minutes</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-300" />
        </div>

        {/* Two Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            <p className="text-2xl font-black text-slate-900">0</p>
            <p className="text-xs text-slate-400 mt-1">Active contracts</p>
          </div>
          <div className="p-3.5 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            <p className="text-2xl font-black text-slate-900">0</p>
            <p className="text-xs text-slate-400 mt-1">Rent reminders</p>
          </div>
        </div>

        {/* Coming Up Section */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-700 mb-2">Coming up</p>
          <div className="p-4 border border-dashed border-slate-300 rounded-3xl text-center bg-slate-50/50">
            <p className="text-xs text-slate-400">
              No active contracts yet. Tap above to create your first contract.
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-700 mb-2">Quick actions</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div 
              onClick={() => setCurrentScreen('LANDLORD_TENANTS')}
              className="p-2.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-[#14532D] transition shadow-xs"
            >
              <User className="w-5 h-5 text-[#14532D] mx-auto mb-1" />
              <p className="text-[9px] font-bold text-slate-700">My tenants</p>
            </div>
            <div 
              onClick={() => setCurrentScreen('WIZARD_CONTRACT')}
              className="p-2.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-[#14532D] transition shadow-xs"
            >
              <FileText className="w-5 h-5 text-[#14532D] mx-auto mb-1" />
              <p className="text-[9px] font-bold text-slate-700">Contracts</p>
            </div>
            <div 
              onClick={() => alert("Rent reminders automatically integrate with your Google Calendar!")}
              className="p-2.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-[#14532D] transition shadow-xs"
            >
              <Bell className="w-5 h-5 text-[#14532D] mx-auto mb-1" />
              <p className="text-[9px] font-bold text-slate-700">Reminders</p>
            </div>
            <div 
              onClick={() => setCurrentScreen('SETTINGS')}
              className="p-2.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-[#14532D] transition shadow-xs"
            >
              <HelpCircle className="w-5 h-5 text-[#14532D] mx-auto mb-1" />
              <p className="text-[9px] font-bold text-slate-700">Help & privacy</p>
            </div>
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="p-3 bg-[#ECFDF5] border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-[#14532D]">
          <ShieldCheck className="w-4 h-4 text-[#14532D] shrink-0" />
          <div>
            <p className="text-xs font-bold leading-none">Your records are private.</p>
            <p className="text-[10px] text-emerald-800 mt-0.5">ID photos are never saved.</p>
          </div>
        </div>
      </div>

      {/* Bottom Docked Nav */}
      <BottomNav />
    </div>
  );
}
