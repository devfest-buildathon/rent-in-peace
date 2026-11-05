import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  Bell, 
  Plus, 
  ChevronRight, 
  User, 
  FileText, 
  HelpCircle, 
  ShieldCheck, 
  FilePlus, 
  CheckCircle2,
  Clock,
  KeyRound,
  Check
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';

export default function LandlordHomeScreen() {
  const { 
    setCurrentScreen, 
    landlordProfile, 
    contracts, 
    startNewContract,
    setSelectedTenant
  } = useApp();

  const landlordDisplayName = landlordProfile?.name 
    ? landlordProfile.name.split(' ')[0] 
    : 'Landlord';

  const activeContractsCount = contracts.length;
  const activeRemindersCount = contracts.filter(c => c.rentReminderEnabled).length;
  const pendingContracts = contracts.filter(c => (c.isSigned || c.status === 'Pending Verification' || c.gcashRef) && !c.paymentVerified);

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="px-5 pt-3">
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

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentScreen('SETTINGS')}
              className="w-8 h-8 rounded-xl bg-[#14532D] text-white font-bold text-xs flex items-center justify-center hover:opacity-90 transition cursor-pointer shadow-xs"
              title="Account Settings"
            >
              {landlordDisplayName.charAt(0)}
            </button>
          </div>
        </div>

        {/* Greeting & Notification */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">
              {landlordProfile?.propertyName || 'DASHBOARD'}
            </p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Hi, {landlordDisplayName}.
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live rental contracts & payment ledger.
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-700 shadow-2xs relative">
            <Bell className="w-5 h-5 text-slate-600" />
            {(activeRemindersCount > 0 || pendingContracts.length > 0) && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </div>
        </div>

        {/* ================= PENDING PAYMENT VERIFICATION NOTIFICATION BANNER ================= */}
        {pendingContracts.length > 0 && (
          <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-3xl shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                Action Required · {pendingContracts.length} Tenant Payment{pendingContracts.length > 1 ? 's' : ''}
              </span>
              <span className="text-[10px] font-bold text-amber-800">Pending Verify</span>
            </div>

            <p className="text-sm font-black text-slate-900">
              Tenant submitted payment proof
            </p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Verify GCash receipts to approve check-in and release door lockbox PIN 5829.
            </p>

            <div className="mt-3 space-y-2">
              {pendingContracts.map(c => (
                <div 
                  key={c.code || c.id}
                  className="p-3 bg-white border border-amber-200 rounded-2xl flex items-center justify-between text-xs shadow-2xs"
                >
                  <div>
                    <p className="font-black text-slate-900">{c.tenantName || 'Tenant'}</p>
                    <p className="text-[10px] text-slate-500">
                      {c.roomNumber} · ₱{(c.advancePaidAmount || c.advanceRent || c.monthlyRent || 0).toLocaleString()} · Ref: <span className="font-mono font-bold text-amber-900">{c.gcashRef || 'Submitted'}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTenant({
                        name: c.tenantName,
                        unit: `${c.roomNumber} · ${c.propertyType}`,
                        rent: c.monthlyRent,
                        phone: c.contactNumber,
                        due: c.dueDay || 'Every 5th',
                        isSigned: c.isSigned,
                        paymentVerified: c.paymentVerified,
                        contract: c
                      });
                      setCurrentScreen('TENANT_DETAIL');
                    }}
                    className="px-3 py-1.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-[11px] rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition"
                  >
                    <span>Verify Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Big Action Banner (Create a new contract) */}
        <div 
          onClick={startNewContract}
          className="p-4 bg-[#14532D] hover:bg-[#0f4022] text-white rounded-3xl shadow-md mb-4 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5A93C] text-white flex items-center justify-center shadow-xs">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-sm font-black">Create a new contract</h3>
              <p className="text-[11px] text-emerald-200">Draft a legally grounded lease agreement</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-300" />
        </div>

        {/* Two Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 bg-white border border-slate-200/80 rounded-3xl shadow-2xs">
            <p className="text-2xl font-black text-slate-900">{activeContractsCount}</p>
            <p className="text-xs text-slate-400 mt-1">Active contracts</p>
          </div>
          <div className="p-3.5 bg-white border border-slate-200/80 rounded-3xl shadow-2xs">
            <p className="text-2xl font-black text-slate-900">{activeRemindersCount}</p>
            <p className="text-xs text-slate-400 mt-1">Rent reminders</p>
          </div>
        </div>

        {/* Contracts Section (Empty state vs Real List) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-700">Recent agreements</p>
            {activeContractsCount > 0 && (
              <button 
                onClick={() => setCurrentScreen('LANDLORD_TENANTS')}
                className="text-[11px] font-bold text-[#14532D] hover:underline cursor-pointer"
              >
                View all ({activeContractsCount})
              </button>
            )}
          </div>

          {activeContractsCount === 0 ? (
            <div className="p-5 border border-dashed border-slate-300 rounded-3xl text-center bg-white/60 shadow-2xs">
              <FilePlus className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-70" />
              <p className="text-xs font-bold text-slate-700">No active contracts yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-[240px] mx-auto leading-relaxed">
                You haven't created any lease contracts. Tap "Create a new contract" above to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contracts.slice(0, 3).map((c) => (
                <div 
                  key={c.code || c.id}
                  onClick={() => {
                    setSelectedTenant({
                      name: c.tenantName,
                      unit: `${c.roomNumber} · ${c.propertyType}`,
                      rent: c.monthlyRent,
                      phone: c.contactNumber,
                      due: c.dueDay || 'Every 5th',
                      isSigned: c.isSigned,
                      paymentVerified: c.paymentVerified,
                      contract: c
                    });
                    setCurrentScreen('TENANT_DETAIL');
                  }}
                  className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between hover:border-[#14532D] transition cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#14532D] font-bold text-xs flex items-center justify-center">
                      {(c.tenantName || 'T').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900">{c.tenantName || 'Tenant'}</p>
                        {c.paymentVerified ? (
                          <span className="text-[9px] bg-emerald-100 text-[#14532D] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified · PIN Active
                          </span>
                        ) : (c.isSigned || c.status === 'Pending Verification') ? (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse" /> Verify Payment
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[10px] text-slate-400">{c.roomNumber} · ₱{(c.monthlyRent || 0).toLocaleString()}/mo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-slate-100 text-slate-800 font-mono font-bold px-2 py-0.5 rounded-full">
                      {c.code}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-700 mb-2">Quick actions</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div 
              onClick={() => setCurrentScreen('LANDLORD_TENANTS')}
              className="p-2.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-[#14532D] transition shadow-2xs"
            >
              <User className="w-5 h-5 text-[#14532D] mx-auto mb-1" />
              <p className="text-[9px] font-bold text-slate-700">My tenants</p>
            </div>
            <div 
              onClick={startNewContract}
              className="p-2.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-[#14532D] transition shadow-2xs"
            >
              <FileText className="w-5 h-5 text-[#14532D] mx-auto mb-1" />
              <p className="text-[9px] font-bold text-slate-700">New draft</p>
            </div>
            <div 
              onClick={() => setCurrentScreen('LANDLORD_TENANTS')}
              className="p-2.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-[#14532D] transition shadow-2xs"
            >
              <Bell className="w-5 h-5 text-[#14532D] mx-auto mb-1" />
              <p className="text-[9px] font-bold text-slate-700">Reminders</p>
            </div>
            <div 
              onClick={() => setCurrentScreen('SETTINGS')}
              className="p-2.5 bg-white border border-slate-200/80 rounded-2xl cursor-pointer hover:border-[#14532D] transition shadow-2xs"
            >
              <HelpCircle className="w-5 h-5 text-[#14532D] mx-auto mb-1" />
              <p className="text-[9px] font-bold text-slate-700">Settings</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Docked Nav */}
      <BottomNav />
    </div>
  );
}
