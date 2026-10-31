import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Handshake, User, Bell, ShieldCheck } from 'lucide-react';

export default function SettingsScreen() {
  const { setCurrentScreen, contactNumber } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-2">
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentScreen('LANDLORD_HOME')} className="p-1 -ml-1 text-[#14532D] cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Account & settings</h2>
          <div className="w-6"></div>
        </div>

        {/* Profile Box */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-3xl mb-3 flex items-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-black text-sm flex items-center justify-center">
            L
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Landlord</h3>
            <p className="text-[11px] text-slate-500">Landlord account · {contactNumber}</p>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="p-3.5 bg-[#ECFDF5] border border-emerald-200 rounded-2xl mb-4 flex items-start gap-2.5 text-xs text-[#14532D]">
          <Handshake className="w-4 h-4 text-[#14532D] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">This app is for the landlord.</p>
            <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
              Tenants receive shared summaries or PDFs—no account or app download needed.
            </p>
          </div>
        </div>

        {/* Account Actions List */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500">Account</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-xs">
            <div 
              onClick={() => alert(`Landlord profile: PEYA (${contactNumber})`)}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                <User className="w-4 h-4 text-[#14532D]" /> Personal information
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div 
              onClick={() => alert("Google Calendar and SMS automated rent reminders are ACTIVE.")}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                <Bell className="w-4 h-4 text-[#14532D]" /> Rent reminders
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div 
              onClick={() => alert("Rent in Peace strictly complies with RA 10173 (Data Privacy Act of 2012). No ID photos are retained.")}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#14532D]" /> Privacy & help
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Sign Out Card */}
        <button 
          onClick={() => setCurrentScreen('SPLASH')}
          className="w-full p-3.5 bg-[#FEF2F2] border border-red-200 text-red-600 rounded-2xl font-bold text-xs text-center hover:bg-red-100 transition cursor-pointer"
        >
          Sign out of Rent in Peace
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Signing out will not delete your tenants or contracts.
        </p>
      </div>
    </div>
  );
}
