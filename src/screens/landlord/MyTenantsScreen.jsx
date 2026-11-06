import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  ChevronRight, 
  Users, 
  ChevronLeft, 
  Plus 
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';

export default function MyTenantsScreen() {
  const { 
    setCurrentScreen,
    searchQuery,
    setSearchQuery,
    tenantFilter,
    setTenantFilter,
    tenantsList,
    filteredTenants,
    setSelectedTenant,
    startNewContract
  } = useApp();

  const totalCount = tenantsList.length;
  const verifiedCount = tenantsList.filter(t => t.paymentVerified).length;
  const pendingCount = tenantsList.filter(t => !t.paymentVerified || t.status === 'Pending Verification' || Boolean(t.gcashRef && !t.paymentVerified)).length;
  const dueCount = tenantsList.filter(t => !t.paymentVerified || (t.due && t.due.includes('5th'))).length;

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 bg-[#F4F8F5]">
      <div className="px-5 pt-3 overflow-y-auto scrollbar-none pb-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setCurrentScreen('LANDLORD_HOME')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-[#14532D] shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          
          <h2 className="text-sm font-bold text-slate-900">Tenants & Leases</h2>
          
          <button 
            onClick={startNewContract}
            className="w-10 h-10 rounded-2xl bg-[#EAB308] text-emerald-950 flex items-center justify-center shadow-xs hover:bg-amber-400 transition cursor-pointer"
            title="Create New Lease"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Title & Count */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">TENANT DIRECTORY</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Active Residents
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage contract compliance, reminders, and GCash payments.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by resident name, unit or code..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
          />
        </div>

        {/* Filter Pills with Real Counts */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: `All (${totalCount})` },
            { id: 'ACTIVE', label: `Verified (${verifiedCount})` },
            { id: 'PENDING', label: `Pending Verify (${pendingCount})` },
            { id: 'DUE', label: `Due Soon (${dueCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTenantFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                tenantFilter === f.id
                  ? 'bg-[#14532D] text-white shadow-xs'
                  : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tenants List */}
        <div className="space-y-2">
          {filteredTenants.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200/80 rounded-3xl text-center shadow-2xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No tenants found</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                No records match your selected filter.
              </p>
            </div>
          ) : (
            filteredTenants.map((t) => (
              <div
                key={t.id || t.name}
                onClick={() => {
                  setSelectedTenant(t);
                  setCurrentScreen('TENANT_DETAIL');
                }}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between hover:border-emerald-300 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-black text-sm flex items-center justify-center group-hover:bg-[#14532D] group-hover:text-white transition-all shadow-2xs">
                    {t.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#14532D] transition">
                      {t.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t.unit} · Due: <span className="font-semibold text-slate-600">{t.due}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-xs font-black text-slate-900">
                      ₱{(t.rent || 0).toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-bold ${
                      t.paymentVerified ? 'text-emerald-700' : 'text-amber-600'
                    }`}>
                      {t.paymentVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
