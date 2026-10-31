import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, HelpCircle, Search, ChevronRight } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';

export default function MyTenantsScreen() {
  const { 
    setCurrentScreen,
    searchQuery,
    setSearchQuery,
    tenantFilter,
    setTenantFilter,
    filteredTenants
  } = useApp();

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
          <button onClick={() => setCurrentScreen('SETTINGS')} className="p-1 cursor-pointer">
            <HelpCircle className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">YOUR RENTALS</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">My tenants</h1>
          <p className="text-xs text-slate-500 mt-0.5">Rent dates and contracts, all in one place.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tenant name, room..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
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

        {/* 3 Exact Tenant Cards from Pia's Figma */}
        <div className="space-y-2.5">
          {filteredTenants.map(t => (
            <div 
              key={t.id}
              onClick={() => setCurrentScreen('TENANT_DETAIL')}
              className="p-3.5 bg-white border border-slate-200/90 rounded-2xl hover:border-[#14532D] transition cursor-pointer flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-bold text-xs flex items-center justify-center shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{t.name}</p>
                  <p className="text-[10px] text-slate-500">{t.unit}</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">₱{t.rent.toLocaleString()} / month</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[9px] bg-[#ECFDF5] text-[#14532D] font-bold px-2 py-0.5 rounded-full">
                    {t.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{t.due}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
