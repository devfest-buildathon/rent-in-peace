import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, HelpCircle, Search, ChevronRight, UserPlus, Users, CheckCircle2, Clock } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';

export default function MyTenantsScreen() {
  const { 
    setCurrentScreen,
    searchQuery,
    setSearchQuery,
    tenantFilter,
    setTenantFilter,
    filteredTenants,
    setSelectedTenant,
    startNewContract
  } = useApp();

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
          <button onClick={() => setCurrentScreen('SETTINGS')} className="p-1 cursor-pointer">
            <HelpCircle className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">DIRECTORY</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">My tenants</h1>
          <p className="text-xs text-slate-500 mt-0.5">Payment schedules and active lease terms.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tenant name or room..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mb-4">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'DUE', label: 'Due soon' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTenantFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                tenantFilter === f.id
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tenants List or Empty State */}
        {filteredTenants.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-300 rounded-3xl text-center bg-white/60 shadow-2xs my-4">
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-bold text-slate-800">No tenants registered yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
              When you create a contract and share it, your tenant's status and payment cycle will appear here.
            </p>
            <button 
              onClick={startNewContract}
              className="mt-4 px-4 py-2.5 bg-[#14532D] hover:bg-[#0f4022] text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create New Contract</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTenants.map(t => (
              <div 
                key={t.id}
                onClick={() => {
                  setSelectedTenant(t);
                  setCurrentScreen('TENANT_DETAIL');
                }}
                className="p-3.5 bg-white border border-slate-200/90 rounded-2xl hover:border-[#14532D] transition cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-bold text-xs flex items-center justify-center shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-500">{t.unit}</p>
                    <p className="text-xs font-black text-slate-800 mt-0.5">₱{Number(t.rent || 0).toLocaleString()} / month</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {t.paymentVerified ? (
                      <span className="text-[9px] bg-emerald-100 text-[#14532D] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified · PIN Active
                      </span>
                    ) : (t.contract?.isSigned || t.status === 'Pending Verification') ? (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse" /> Verify Payment
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                        {t.status || 'Active'}
                      </span>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">{t.due}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
