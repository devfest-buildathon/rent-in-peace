import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  FileText, 
  LogOut, 
  KeyRound, 
  Receipt,
  X, 
  Check 
} from 'lucide-react';

export default function TenantHomeScreen() {
  const { 
    setCurrentScreen,
    tenantProfile,
    tenantName,
    roomNumber,
    propertyAddress,
    monthlyRent,
    landlordName,
    activeCode,
    roomCodeInput,
    contracts,
    payments,
    submitTenantPayment,
    logout
  } = useApp();

  const currentCode = activeCode || roomCodeInput || tenantProfile?.contractCode;
  const activeContract = contracts.find(c => c.code === currentCode || c.id === currentCode) || {};

  const isVerified = Boolean(activeContract.paymentVerified);
  const hasSigned = Boolean(activeContract.isSigned);

  const displayRoom = roomNumber || activeContract.roomNumber || 'Room Unit';
  const displayAddress = propertyAddress || activeContract.propertyAddress || 'Cagayan de Oro City';
  const displayLandlord = landlordName || activeContract.landlordName || 'Landlord';
  const displayRent = Number(monthlyRent || activeContract.monthlyRent || 0);

  // In-app payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(displayRent ? displayRent.toString() : '3500');
  const [payCycle, setPayCycle] = useState('Monthly Rent Payment');
  const [payGcashRef, setPayGcashRef] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const roomPayments = payments.filter(p => p.contractCode === currentCode || !p.contractCode);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;
    if (!payGcashRef.trim()) return;

    setIsSubmittingPay(true);
    await submitTenantPayment({
      amount: Number(payAmount),
      cycleName: payCycle,
      cycle: payCycle,
      gcashRef: payGcashRef.trim(),
      contractCode: currentCode
    });
    setIsSubmittingPay(false);
    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setShowPayModal(false);
      setPayGcashRef('');
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 bg-[#F4F8F5]">
      <div className="px-5 pt-3 overflow-y-auto scrollbar-none pb-4">
        
        {/* Top Header: Avatar + Sign Out */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#14532D] text-white font-black text-sm flex items-center justify-center shadow-xs">
              {(tenantProfile?.name || tenantName || 'Tenant').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Resident</p>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                {tenantProfile?.name || tenantName || 'Valued Resident'}
              </h2>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-red-600 shadow-2xs transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Total Rent Balance Display */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-slate-500 tracking-tight">Active Monthly Rent</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              ₱{displayRent.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#047857] ml-1">/ month</span>
          </div>
        </div>

        {/* Featured Resident Card */}
        <div className="w-full h-[165px] rounded-3xl bg-gradient-to-tr from-[#14532D] via-[#047857] to-[#10b981] p-5 text-white shadow-[0_12px_28px_rgba(20,83,45,0.25)] flex flex-col justify-between mb-5 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
              {displayRoom}
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
              isVerified ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30' : 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
            }`}>
              {isVerified ? 'Verified Active' : 'Pending Approval'}
            </span>
          </div>

          <div className="z-10">
            <p className="text-[10px] text-emerald-100 font-medium">Master Lockbox Key PIN</p>
            <p className="font-mono text-2xl font-black text-white tracking-widest mt-0.5">
              {isVerified ? '5829' : '•••• (Locked)'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-100 border-t border-white/15 pt-2 z-10">
            <span>{displayAddress}</span>
            <span className="font-bold text-white">Lessor: {displayLandlord}</span>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <button 
            type="button"
            onClick={() => setShowPayModal(true)}
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center gap-1.5 hover:bg-slate-50 transition cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#14532D] flex items-center justify-center">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Pay Rent</span>
          </button>

          <button 
            type="button"
            onClick={() => setCurrentScreen(hasSigned ? 'WIZARD_CONTRACT' : 'TENANT_PORTAL')}
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center gap-1.5 hover:bg-slate-50 transition cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Kasulatan</span>
          </button>

          <button 
            type="button"
            onClick={() => setCurrentScreen('SUCCESS_PIN')}
            className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center gap-1.5 hover:bg-slate-50 transition cursor-pointer active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Lockbox PIN</span>
          </button>
        </div>

        {/* Payment History / Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              PAYMENT LEDGER
            </span>
            <span className="text-xs font-bold text-[#14532D]">
              {roomPayments.length} recorded
            </span>
          </div>

          {roomPayments.length === 0 ? (
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 text-center shadow-2xs">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No payment logs yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tap "Pay Rent" above to log your GCash confirmation receipt.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {roomPayments.map((p, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#14532D] flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.cycleName || p.cycle || 'Rent Payment'}</p>
                      <p className="text-[10px] text-slate-400">Ref: <span className="font-mono text-slate-700 font-bold">{p.gcashRef || '—'}</span></p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">₱{Number(p.amount || 0).toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-emerald-700">{p.status || 'Verified'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Pay Rent Modal */}
      {showPayModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Submit GCash Payment</h3>
              <button 
                onClick={() => setShowPayModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Amount (₱)</label>
                <input 
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Payment Cycle</label>
                <input 
                  type="text"
                  value={payCycle}
                  onChange={(e) => setPayCycle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">GCash Reference No.</label>
                <input 
                  type="text"
                  value={payGcashRef}
                  onChange={(e) => setPayGcashRef(e.target.value)}
                  placeholder="e.g. 1029482910"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              {paySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>Payment logged successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingPay}
                className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3 rounded-xl text-xs shadow-md transition cursor-pointer active:scale-[0.98]"
              >
                {isSubmittingPay ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
