import React, { useState } from 'react';
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
  Copy, 
  Check, 
  Share2,
  Search,
  FileText,
  AlertCircle
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';

export default function LandlordHomeScreen() {
  const { 
    setCurrentScreen, 
    landlordProfile, 
    contracts, 
    payments,
    startNewContract,
    setSelectedTenant,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [copiedCode, setCopiedCode] = useState('');

  const landlordDisplayName = landlordProfile?.name 
    ? landlordProfile.name.split(' ')[0] 
    : 'Landlord';

  const activeContractsCount = contracts.length;
  const activeRemindersCount = contracts.filter(c => c.rentReminderEnabled).length;
  const pendingContracts = contracts.filter(c => 
    c.status === 'pending_verification' || 
    (!c.paymentVerified && (c.isSigned || c.gcashRef))
  );

  // Total collected or active monthly volume
  const totalMonthlyRoll = contracts.reduce((sum, c) => sum + (Number(c.monthlyRent) || 0), 0);

  const handleCopyShareLink = (code, e) => {
    e.stopPropagation();
    if (!code) return;
    const url = `${window.location.origin}?code=${code}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Step 8: Search filtering across access code, room code, tenant name, unit, and GCash reference number
  const filteredContracts = contracts.filter(c => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();

    const matchRoomCode = c.code && c.code.toLowerCase().includes(q);
    const matchAccessCode = c.accessCode && c.accessCode.toLowerCase().includes(q);
    const matchTenant = c.tenantName && c.tenantName.toLowerCase().includes(q);
    const matchUnit = (c.roomNumber && c.roomNumber.toLowerCase().includes(q)) ||
                      (c.propertyAddress && c.propertyAddress.toLowerCase().includes(q));
    const matchGcash = (c.gcashRef && c.gcashRef.toLowerCase().includes(q)) ||
      (c.latestGcashRef && c.latestGcashRef.toLowerCase().includes(q)) ||
      payments.some(p => (p.contractCode === c.code || p.leaseId === c.code) && (
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q)) ||
        (p.gcashRef && p.gcashRef.toLowerCase().includes(q))
      ));

    return matchRoomCode || matchAccessCode || matchTenant || matchUnit || matchGcash;
  });

  const getStatusBadge = (c) => {
    if (c.status === 'active' || c.paymentVerified) {
      return { label: 'Verified Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (c.status === 'pending_verification' || (c.gcashRef && !c.paymentVerified)) {
      return { label: 'Action Required: Verify GCash', cls: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (c.status === 'pending_payment' || (c.isSigned && !c.gcashRef)) {
      return { label: 'Pending Payment', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (c.status === 'pending_resubmission') {
      return { label: 'Payment Resubmission Required', cls: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (c.status === 'ended') {
      return { label: 'Lease Ended', cls: 'bg-slate-200 text-slate-700 border-slate-300' };
    }
    return { label: 'Open (Ready for Tenant)', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 bg-[#F4F8F5]">
      <div className="px-5 pt-3 overflow-y-auto scrollbar-none pb-4">
        
        {/* iOS Reference Top Bar: Brand Icon + Greeting + Bell */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setCurrentScreen('SETTINGS')}
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-2xs hover:bg-slate-50 transition cursor-pointer overflow-hidden"
              title="Account Settings & Profile"
            >
              <img src="/assets/logo-icon.png" alt="Rent in Peace" className="w-full h-full object-contain rounded-xl" />
            </button>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Hello, {landlordDisplayName}</p>
              <h2 className="text-sm font-extrabold text-[#144C2E] leading-tight flex items-center gap-1.5">
                <span>Landlord Portal</span>
                {landlordProfile?.demo && (
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-300">
                    Demo Mode
                  </span>
                )}
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

        {/* Step 2 & 8: Search Bar (accepts access code, room code, tenant name, unit, GCash ref #) */}
        <div className="relative mb-3.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search access code, room code, tenant, unit, or GCash ref..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Step 2: "Create Lease" Button */}
        <div className="mb-4">
          <button 
            type="button"
            onClick={startNewContract}
            className="w-full py-3.5 px-4 bg-[#14532D] hover:bg-[#0f4022] text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Lease</span>
          </button>
        </div>

        {/* Total Rent Roll Balance Display */}
        <div className="mb-4 p-3.5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Monthly Rent Roll</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ₱{totalMonthlyRoll.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-[#047857]">/ month</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Leases</span>
            <span className="text-base font-black text-slate-800">{activeContractsCount} Units</span>
          </div>
        </div>

        {/* PENDING ACTIONS BANNER (Step 6) */}
        {pendingContracts.length > 0 && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-3xl mb-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                Action Required · {pendingContracts.length} Payment{pendingContracts.length > 1 ? 's' : ''}
              </span>
              <span className="text-[10px] font-bold text-amber-800">Pending Review</span>
            </div>

            <p className="text-xs font-black text-slate-900">
              Tenant submitted advance payment proof
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Verify GCash receipts to approve check-in and issue secure door access code.
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
                        {c.roomNumber} · ₱{(c.advancePaidAmount || c.advanceRent || c.monthlyRent || 0).toLocaleString()} · Ref: <span className="font-mono font-bold text-amber-900">{c.gcashRef || c.latestGcashRef || 'Submitted'}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTenant({
                        name: c.tenantName,
                        unit: `${c.roomNumber} · ${c.propertyType}`,
                        rent: c.monthlyRent,
                        phone: c.contactNumber || c.tenantPhone,
                        due: c.dueDay || 'Every 5th',
                        isSigned: c.isSigned,
                        paymentVerified: c.paymentVerified,
                        signingMode: c.signingMode || 'DIGITAL',
                        code: c.code || c.id,
                        gcashRef: c.gcashRef || c.latestGcashRef,
                        gcashReceiptData: c.gcashReceiptData,
                        accessCode: c.accessCode || null,
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

        {/* LEASES & ROOM CODES LIST (Step 2 & 3: dashboard always shows each lease's room code and Share/Copy Link button) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              YOUR LEASES ({filteredContracts.length})
            </span>
            {searchQuery && (
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                Filtered
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mb-2.5">
            Share the room code or link with your tenant to review, sign, and submit GCash payment.
          </p>

          {filteredContracts.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-300 rounded-3xl text-center bg-white shadow-2xs">
              <FilePlus className="w-9 h-9 text-slate-400 mx-auto mb-2 opacity-70" />
              <p className="text-xs font-bold text-slate-700">
                {searchQuery ? 'No leases match your search' : 'No leases created yet'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                {searchQuery 
                  ? 'Try searching by room code (RIP-XXXX), access code, or GCash reference number.' 
                  : 'Tap "Create Lease" above to start your first residential agreement.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredContracts.map((c) => {
                const badge = getStatusBadge(c);
                return (
                  <div 
                    key={c.code || c.id}
                    onClick={() => {
                      setSelectedTenant({
                        name: c.tenantName,
                        unit: `${c.roomNumber} · ${c.propertyType}`,
                        rent: c.monthlyRent,
                        phone: c.contactNumber || c.tenantPhone,
                        due: c.dueDay || 'Every 5th',
                        isSigned: c.isSigned,
                        paymentVerified: c.paymentVerified,
                        signingMode: c.signingMode || 'DIGITAL',
                        code: c.code || c.id,
                        gcashRef: c.gcashRef || c.latestGcashRef,
                        gcashReceiptData: c.gcashReceiptData,
                        accessCode: c.accessCode || null,
                        contract: c
                      });
                      setCurrentScreen('TENANT_DETAIL');
                    }}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-black text-xs flex items-center justify-center group-hover:bg-[#14532D] group-hover:text-white transition-all shrink-0">
                          {c.tenantName ? c.tenantName.charAt(0).toUpperCase() : 'U'}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#14532D] transition truncate">
                            {c.tenantName || 'Pending Tenant Join'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {c.roomNumber} · ₱{Number(c.monthlyRent || 0).toLocaleString()}/mo
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Room Code & Copy Share Link Bar (Requirement 3: dashboard always shows each lease's room code and Share/Copy Link button) */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Code:</span>
                        <span className="font-mono font-extrabold text-[#14532D] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {c.code}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {c.accessCode && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Lock:</span>
                            <span className="font-mono font-bold text-emerald-800 bg-slate-100 px-1.5 py-0.5 rounded">
                              {c.accessCode}
                            </span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleCopyShareLink(c.code, e)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#14532D] font-bold text-[11px] rounded-xl flex items-center gap-1 transition cursor-pointer border border-emerald-200 active:scale-95"
                          title="Copy invite link to send to tenant"
                        >
                          {copiedCode === c.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              <span className="text-emerald-700">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3" />
                              <span>Share Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
