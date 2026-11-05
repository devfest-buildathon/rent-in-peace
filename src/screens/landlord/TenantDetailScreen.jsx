import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  CheckCircle2, 
  KeyRound, 
  Lock 
} from 'lucide-react';

export default function TenantDetailScreen() {
  const { 
    setCurrentScreen, 
    selectedTenant, 
    contracts, 
    verifyTenantPayment 
  } = useApp();

  const [verificationToast, setVerificationToast] = useState('');

  const tenant = selectedTenant || {
    name: 'Tenant Resident',
    unit: 'Room 3B · Bedspace',
    rent: 3500,
    due: 'Every 5th',
    phone: '09455195525',
    isSigned: true,
    paymentVerified: true,
    signingMode: 'DIGITAL',
    contract: contracts[0] || null
  };

  const liveContract = contracts.find(c => 
    (c.code && (c.code === tenant.contract?.code || c.code === tenant.code)) ||
    (c.tenantName && c.tenantName === tenant.name) ||
    (c.id && c.id === tenant.contract?.id)
  ) || tenant.contract || {};

  const isVerified = Boolean(liveContract.paymentVerified || tenant.paymentVerified);

  const handleVerify = async () => {
    if (liveContract.code || liveContract.id) {
      await verifyTenantPayment(liveContract.code || liveContract.id);
      setVerificationToast('Payment verified! Door lockbox PIN is unlocked.');
      setTimeout(() => setVerificationToast(''), 4000);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('LANDLORD_TENANTS')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Tenant Profile</h2>
          <div className="w-10"></div>
        </div>

        {/* Tenant Hero Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs mb-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#14532D] text-white font-black text-base flex items-center justify-center shadow-xs">
            {tenant.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 truncate">{tenant.name}</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{tenant.unit}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
            isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {isVerified ? 'Active Resident' : 'Pending Verification'}
          </span>
        </div>

        {/* Status verification alert banner if payment pending */}
        {liveContract.gcashRef && !isVerified && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-3xl mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                GCash Payment Submission
              </span>
              <span className="font-mono text-xs font-bold text-slate-900">
                Ref: {liveContract.gcashRef}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-snug mb-3">
              Tenant submitted proof of advance rent. Confirming will unlock their lockbox PIN.
            </p>
            <button 
              onClick={handleVerify}
              className="w-full py-2.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify GCash Payment & Release PIN</span>
            </button>
          </div>
        )}

        {verificationToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{verificationToast}</span>
          </div>
        )}

        {/* Lockbox Status Card in Forest Emerald palette */}
        <div className="p-4 bg-[#052e16] text-white rounded-3xl shadow-md border border-emerald-900/60 mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Lockbox Access PIN</span>
            </div>
            <p className="font-mono text-2xl font-black tracking-widest text-white mt-1">
              5829
            </p>
            <p className="text-[10px] text-emerald-200/80 mt-0.5">
              {isVerified ? 'Unlocked and visible to tenant' : 'Locked until payment verified'}
            </p>
          </div>

          <div className={`p-2 rounded-2xl ${isVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {isVerified ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
        </div>

        {/* Financial & Schedule Overview */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <h3 className="text-xs font-bold text-slate-900">Lease Terms</h3>
          
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-400">Monthly Rent</span>
            <span className="font-black text-[#14532D]">₱{Number(tenant.rent || 0).toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-400">Due Schedule</span>
            <span className="font-bold text-slate-900">{tenant.due}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Tenant Phone</span>
            <span className="font-mono font-bold text-slate-900">{tenant.phone || '—'}</span>
          </div>
        </div>

      </div>

      {/* Bottom Back Button */}
      <div className="pt-2 pb-2">
        <button 
          onClick={() => setCurrentScreen('LANDLORD_TENANTS')}
          className="w-full bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
        >
          Back to Directory
        </button>
      </div>
    </div>
  );
}
