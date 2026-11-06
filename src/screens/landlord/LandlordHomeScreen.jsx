import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Plus, 
  ChevronRight, 
  User, 
  FilePlus, 
  Clock, 
  CreditCard,
  ShieldCheck,
  Home
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

  // Total collected or active monthly volume
  const totalMonthlyRoll = contracts.reduce((sum, c) => sum + (Number(c.monthlyRent) || 0), 0);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 bg-[#F4F8F5]">
      <div className="px-5 pt-3 overflow-y-auto scrollbar-none pb-4">
        
        {/* iOS Reference Top Bar: Avatar + Greeting + Bell */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setCurrentScreen('SETTINGS')}
              className="w-10 h-10 rounded-2xl bg-[#14532D] text-white font-extrabold text-sm flex items-center justify-center shadow-xs hover:opacity-95 transition cursor-pointer"
              title="Account Settings"
            >
              {landlordDisplayName.charAt(0)}
            </button>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Hello,</p>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                {landlordDisplayName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentScreen('SETTINGS')}
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs relative hover:bg-slate-50 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              {(activeRemindersCount > 0 || pendingContracts.length > 0) && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Total Rent Roll Balance Display */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-slate-500 tracking-tight">Active Monthly Rent Roll</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              ₱{totalMonthlyRoll.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#047857] ml-1">/ month</span>
          </div>
        </div>

        {/* CARDS Carousel */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PROPERTIES & LEASES</span>
            <button 
              onClick={startNewContract}
              className="text-xs font-bold text-[#14532D] hover:text-[#047857] flex items-center gap-0.5 cursor-pointer"
            >
              <span>Add</span>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Horizontal scroll cards */}
          <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            
            {/* Primary Featured Card */}
            <div className="min-w-[240px] max-w-[260px] h-[135px] rounded-3xl bg-gradient-to-tr from-[#14532D] via-[#047857] to-[#10b981] p-4 text-white shadow-[0_12px_28px_rgba(20,83,45,0.25)] flex flex-col justify-between shrink-0 snap-start relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                  {landlordProfile?.propertyName || 'Main Property'}
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">CDO</span>
              </div>

              <div className="z-10">
                <p className="text-[10px] text-emerald-100 font-medium">Total Leases</p>
                <p className="text-lg font-black text-white tracking-tight">{activeContractsCount} Units Enrolled</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-emerald-100 border-t border-white/15 pt-1.5 z-10">
                <span>Civil Code Compliant</span>
                <span className="font-bold text-white">Active</span>
              </div>
            </div>

            {/* Secondary Deep Forest Card */}
            <div className="min-w-[200px] h-[135px] rounded-3xl bg-[#052e16] p-4 text-white shadow-md flex flex-col justify-between shrink-0 snap-start border border-emerald-900/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">GCash Verified</span>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-300/80">Lockbox PIN Status</p>
                <p className="text-base font-black text-white tracking-tight">Protected: 5829</p>
              </div>
              <div className="text-[10px] text-amber-400 font-bold">
                Auto-releases on pay
              </div>
            </div>

            {/* Quick Add Card */}
            <button 
              onClick={startNewContract}
              className="min-w-[120px] h-[135px] rounded-3xl bg-white border-2 border-dashed border-slate-300 hover:border-[#14532D] flex flex-col items-center justify-center gap-2 p-3 text-slate-400 hover:text-[#14532D] transition shrink-0 snap-start cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-emerald-100 text-[#14532D] flex items-center justify-center transition">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">New Lease</span>
            </button>

          </div>
        </div>

        {/* QUICK ACTIONS 4-GRID with Emerald / Amber tones */}
        <div className="mb-5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">QUICK ACTIONS</span>
          
          <div className="grid grid-cols-4 gap-2.5">
            {/* Action 1: New Lease */}
            <button 
              onClick={startNewContract}
              className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center gap-1.5 hover:bg-slate-50 transition cursor-pointer active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#14532D] flex items-center justify-center">
                <Plus className="w-5 h-5 stroke-[3]" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Draft Lease</span>
            </button>

            {/* Action 2: View Tenants */}
            <button 
              onClick={() => setCurrentScreen('LANDLORD_TENANTS')}
              className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center gap-1.5 hover:bg-slate-50 transition cursor-pointer active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Tenants</span>
            </button>

            {/* Action 3: Reminders */}
            <button 
              onClick={() => setCurrentScreen('LANDLORD_TENANTS')}
              className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center gap-1.5 hover:bg-slate-50 transition cursor-pointer active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Reminders</span>
            </button>

            {/* Action 4: Settings */}
            <button 
              onClick={() => setCurrentScreen('SETTINGS')}
              className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center gap-1.5 hover:bg-slate-50 transition cursor-pointer active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">Rules</span>
            </button>
          </div>
        </div>

        {/* PENDING ACTIONS BANNER */}
        {pendingContracts.length > 0 && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-3xl mb-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                Action Required · {pendingContracts.length} Payment{pendingContracts.length > 1 ? 's' : ''}
              </span>
              <span className="text-[10px] font-bold text-amber-800">Pending Review</span>
            </div>

            <p className="text-xs font-black text-slate-900">
              Tenant submitted payment proof
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Verify GCash receipts to approve check-in and release door lockbox PIN 5829.
            </p>

            <div className="mt-3 space-y-2">
              {pendingContracts.map(c => (
                <div 
                  key={c.code || c.id}
                  className="p-3 bg-white rounded-2xl flex items-center justify-between text-xs shadow-2xs border border-amber-200 gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {c.gcashReceiptData ? (
                      <img 
                        src={c.gcashReceiptData} 
                        alt="Receipt" 
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shrink-0 bg-white shadow-2xs" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                        ₱
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{c.tenantName || 'Tenant'}</p>
                      <p className="text-[10px] text-slate-500">
                        {c.roomNumber} · ₱{(c.advancePaidAmount || c.advanceRent || c.monthlyRent || 0).toLocaleString()} · Ref: <span className="font-mono font-bold text-amber-900">{c.gcashRef || 'Submitted'}</span>
                      </p>
                    </div>
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
                        signingMode: c.signingMode || 'DIGITAL',
                        code: c.code || c.id,
                        gcashRef: c.gcashRef,
                        gcashReceiptData: c.gcashReceiptData,
                        contract: c
                      });
                      setCurrentScreen('TENANT_DETAIL');
                    }}
                    className="px-3 py-1.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer transition shadow-xs shrink-0"
                  >
                    <span>Review & Verify</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENT AGREEMENTS FEED */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              RECENT AGREEMENTS
            </span>
            {activeContractsCount > 0 && (
              <button 
                onClick={() => setCurrentScreen('LANDLORD_TENANTS')}
                className="text-xs font-bold text-[#14532D] hover:underline cursor-pointer"
              >
                See all ({activeContractsCount}) &gt;
              </button>
            )}
          </div>

          {activeContractsCount === 0 ? (
            <div className="p-6 border border-dashed border-slate-300 rounded-3xl text-center bg-white shadow-2xs">
              <FilePlus className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-70" />
              <p className="text-xs font-bold text-slate-700">No active contracts yet</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                Tap "Draft Lease" above to create your first legal agreement.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contracts.slice(0, 4).map((c) => (
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
                      signingMode: c.signingMode || 'DIGITAL',
                      code: c.code || c.id,
                      gcashRef: c.gcashRef,
                      gcashReceiptData: c.gcashReceiptData,
                      contract: c
                    });
                    setCurrentScreen('TENANT_DETAIL');
                  }}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-black text-xs flex items-center justify-center group-hover:bg-[#14532D] group-hover:text-white transition-all">
                      {c.tenantName ? c.tenantName.charAt(0).toUpperCase() : 'T'}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#14532D] transition">
                        {c.tenantName || 'Tenant'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {c.roomNumber} · Code: <span className="font-mono text-slate-600 font-bold">{c.code}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">
                      ₱{Number(c.monthlyRent || 0).toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-bold ${
                      c.paymentVerified 
                        ? 'text-emerald-700' 
                        : c.isSigned 
                        ? 'text-amber-600' 
                        : 'text-slate-400'
                    }`}>
                      {c.paymentVerified ? 'Verified' : c.isSigned ? 'Pending' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
