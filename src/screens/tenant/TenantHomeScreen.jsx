import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  KeyRound, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  FileText, 
  LogOut, 
  QrCode, 
  ChevronRight, 
  Phone, 
  Building, 
  AlertCircle, 
  Upload, 
  X, 
  Check, 
  Receipt,
  ShieldCheck,
  Calendar,
  Lock
} from 'lucide-react';
import FileUpload from '../../components/shared/FileUpload';

export default function TenantHomeScreen() {
  const { 
    setCurrentScreen, 
    tenantProfile, 
    tenantName,
    roomNumber,
    propertyAddress,
    propertyType,
    monthlyRent,
    advanceRent,
    deposit,
    landlordName,
    contactNumber,
    activeCode,
    roomCodeInput,
    contracts,
    payments,
    submitTenantPayment,
    setContractClauses,
    logout
  } = useApp();

  // Find active contract for this tenant
  const currentCode = activeCode || roomCodeInput || tenantProfile?.contractCode;
  const activeContract = contracts.find(c => c.code === currentCode || c.id === currentCode) || {};

  const isVerified = Boolean(activeContract.paymentVerified);
  const isPending = Boolean(activeContract.isSigned && !activeContract.paymentVerified);
  const hasSigned = Boolean(activeContract.isSigned);

  const displayRoom = roomNumber || activeContract.roomNumber || 'Room Unit';
  const displayAddress = propertyAddress || activeContract.propertyAddress || 'Cagayan de Oro City';
  const displayLandlord = landlordName || activeContract.landlordName || 'Landlord';
  const displayContact = contactNumber || activeContract.contactNumber || '';
  const displayRent = Number(monthlyRent || activeContract.monthlyRent || 0);

  // Parse total duration months ("how many times do they gotta pay")
  const leaseDurationStr = activeContract.leaseDuration || '6 months';
  const durationMatch = leaseDurationStr.match(/(\d+)\s*month/i);
  const totalMonths = durationMatch ? parseInt(durationMatch[1], 10) : leaseDurationStr.includes('year') ? 12 : 6;

  // In-app payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(displayRent ? displayRent.toString() : '3500');
  const [payCycle, setPayCycle] = useState('Monthly Rent Payment');
  const [payGcashRef, setPayGcashRef] = useState('');
  const [payReceiptData, setPayReceiptData] = useState(null);
  const [paySuccess, setPaySuccess] = useState(false);
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Filter payments for this room/contract
  const roomPayments = payments.filter(p => p.contractCode === currentCode || !p.contractCode);
  const verifiedPaymentsCount = roomPayments.filter(p => p.status === 'Verified').length;
  const paidMonthsCount = Math.min(totalMonths, Math.max(0, verifiedPaymentsCount));
  const remainingMonthsCount = Math.max(0, totalMonths - paidMonthsCount);
  const progressPercent = Math.min(100, Math.round((paidMonthsCount / totalMonths) * 100));

  const handleOpenPayModal = () => {
    setShowPayModal(true);
    setPaySuccess(false);
    setPayGcashRef('');
    setPayReceiptData(null);
  };

  const handleSendPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;
    if (!payGcashRef.trim()) {
      alert('Please enter your GCash reference number from your transaction receipt.');
      return;
    }

    setIsSubmittingPay(true);
    await submitTenantPayment({
      contractCode: currentCode,
      amount: Number(payAmount),
      cycleName: payCycle,
      gcashRef: payGcashRef.trim(),
      receiptData: payReceiptData
    });
    setIsSubmittingPay(false);
    setPaySuccess(true);
    setTimeout(() => {
      setShowPayModal(false);
      setPaySuccess(false);
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#DCFCE7] text-[#14532D] flex items-center justify-center font-black text-sm shadow-2xs">
              {(tenantProfile?.name || tenantName || 'T').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                {tenantProfile?.name || tenantName || 'Tenant Portal'}
              </h2>
              <p className="text-[10px] text-slate-500">{displayRoom} · {displayAddress}</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* ================= APARTMENT ACCESS & VERIFICATION STATUS ================= */}
        <div className="mb-4">
          {isVerified ? (
            /* CASE 1: VERIFIED BY LANDLORD - APARTMENT UNLOCKED! */
            <div className="p-4 bg-gradient-to-br from-[#14532D] to-emerald-900 text-white rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payment Verified by Landlord</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300">Room Ready</span>
              </div>

              <h3 className="text-base font-black mt-1">Apartment Key Access Granted</h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Your payment was verified by {displayLandlord}. You are cleared to move into {displayRoom}.
              </p>

              {/* Master 4-Digit Keybox PIN */}
              <div className="my-3 p-3 bg-white/10 border border-white/20 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1.5">
                  Smart Door Lockbox PIN
                </p>
                <div className="flex justify-center items-center gap-2.5">
                  {['5', '8', '2', '9'].map((digit, idx) => (
                    <div 
                      key={idx}
                      className="w-10 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-black font-mono text-amber-300 shadow-inner"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-emerald-200 mt-2">
                  Enter this code on the lockbox keypad at your door to retrieve keys.
                </p>
              </div>
            </div>
          ) : isPending ? (
            /* CASE 2: PAYMENT SUBMITTED - AWAITING LANDLORD VERIFICATION */
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-3xl shadow-2xs">
              <div className="flex items-center gap-2 text-amber-800 mb-1">
                <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Payment Verification Pending
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 mt-1">
                Awaiting Landlord Confirmation
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your check-in payment receipt has been submitted. Your landlord (<strong>{displayLandlord}</strong>) is verifying the transaction.
              </p>
              <div className="mt-3 p-2.5 bg-white border border-amber-200 rounded-xl flex items-center gap-2 text-xs">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] text-slate-700">
                  Apartment Key PIN will unlock immediately once your landlord approves your payment.
                </span>
              </div>
            </div>
          ) : (
            /* CASE 3: INITIAL PAYMENT / VERIFICATION PENDING */
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>PIN Locked (Advance Payment Needed)</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#14532D]">{currentCode}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">Door Key PIN Pending Payment</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Your 4-digit room key PIN will unlock immediately once your initial advance payment is verified by {displayLandlord}.
              </p>
              <button 
                onClick={handleOpenPayModal}
                className="w-full mt-3 py-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
              >
                <CreditCard className="w-4 h-4 text-amber-300" />
                <span>Pay Initial Rent / Deposit via GCash</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* ================= RENT SCHEDULE & PAYMENT TRACKER ("How many times you gotta pay") ================= */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-3xl mb-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MONTHLY RENT</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">₱{displayRent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT DUE</span>
              <p className="text-xs font-bold text-[#14532D] mt-1">Every 5th of each month</p>
            </div>
          </div>

          {/* Lease Schedule Progress Tracker */}
          <div className="p-3 bg-[#F0FDF4] border border-emerald-200 rounded-2xl mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Lease Schedule: {leaseDurationStr}</span>
              </span>
              <span className="text-[11px] font-black text-[#14532D]">
                {paidMonthsCount} of {totalMonths} payments recorded
              </span>
            </div>

            {/* Visual Schedule Progress Bar */}
            <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden my-1.5">
              <div 
                className="h-full bg-[#14532D] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-emerald-800 font-semibold pt-0.5">
              <span>Remaining payments: <strong>{remainingMonthsCount} month{remainingMonthsCount !== 1 ? 's' : ''}</strong></span>
              <span>Next cycle due: <strong>Every 5th</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Unit / Premises</span>
              <strong className="text-slate-800">{displayRoom} · {propertyType || 'Boarding House'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Landlord GCash Mobile</span>
              <strong className="text-slate-800 font-mono">{displayContact || '09455195525'}</strong>
            </div>
          </div>

          {/* Pay Rent In-App Button */}
          <button 
            onClick={handleOpenPayModal}
            className="w-full py-3.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-amber-300" />
            <span>Pay Rent (QR Ph, Cash, or Maya)</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* ================= LEASE AGREEMENT (KASULATAN) ================= */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-3xl shadow-2xs mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#14532D] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Kasulatan sa Pag-abang</p>
                <p className="text-[10px] text-slate-500">Official Signed Legal Residential Lease Agreement</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Your rental contract with <strong>{displayLandlord}</strong> for {displayRoom}. Enforceable under Philippine Civil Code Art. 1356.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => {
                if (activeContract?.contractClauses) {
                  setContractClauses(activeContract.contractClauses);
                }
                setCurrentScreen('WIZARD_CONTRACT');
              }}
              className="py-2.5 px-3 bg-[#ECFDF5] hover:bg-emerald-100 text-[#14532D] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#14532D]" />
              <span>View Full Contract</span>
            </button>

            <button 
              onClick={() => window.print()}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 rotate-180 text-slate-500" />
              <span>Save / Print PDF</span>
            </button>
          </div>
        </div>

        {/* ================= PAYMENT HISTORY & RECEIPT LEDGER ================= */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-700">Payment & Receipt Ledger</h3>
            <span className="text-[10px] text-slate-400 font-semibold">{roomPayments.length} recorded</span>
          </div>

          <div className="space-y-2">
            {roomPayments.length === 0 ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                <Receipt className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span>No rent payments recorded yet.</span>
              </div>
            ) : (
              roomPayments.map((p, idx) => (
                <div 
                  key={p.id || idx}
                  className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      p.status === 'Verified' ? 'bg-[#ECFDF5] text-[#14532D]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status === 'Verified' ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{p.cycleName || 'Rent Payment'}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.date} · Ref: <span className="font-mono">{p.gcashRef || '—'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-slate-900">₱{Number(p.amount || 0).toLocaleString()}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      p.status === 'Verified' ? 'bg-emerald-100 text-[#14532D]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= IN-APP PAYMENT MODAL ================= */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#14532D] text-white flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Pay Rent Settlement</h3>
                  <p className="text-[10px] text-slate-500">QR Ph, GCash, Maya, or Cash to Landlord</p>
                </div>
              </div>

              <button 
                onClick={() => setShowPayModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paySuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#14532D] flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-900">Payment Submitted!</h4>
                <p className="text-xs text-slate-600 max-w-[260px] mx-auto">
                  Your payment receipt has been delivered to your landlord ({displayLandlord}). Once approved, your receipt ledger will be marked verified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendPayment} className="space-y-3 text-xs">
                {/* Landlord Payment Info Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold block uppercase">LANDLORD GCASH RECIPIENT</span>
                    <strong className="text-sm font-black text-[#14532D] block mt-0.5">{displayLandlord}</strong>
                    <span className="text-xs font-mono font-bold text-slate-700">{displayContact || '09455195525'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] bg-[#14532D] text-white px-2 py-0.5 rounded font-bold uppercase">
                      QR Ph Ready
                    </span>
                  </div>
                </div>

                {/* Amount & Cycle */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Payment Amount (₱)
                    </label>
                    <input 
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Payment Cycle
                    </label>
                    <input 
                      type="text"
                      value={payCycle}
                      onChange={(e) => setPayCycle(e.target.value)}
                      placeholder="e.g. November 2026 Rent"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                      required
                    />
                  </div>
                </div>

                {/* Upload GCash Screenshot */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Upload GCash Screenshot Receipt
                  </label>
                  <FileUpload 
                    label="Attach transaction receipt screenshot"
                    helperText="Showing Ref Number & Amount"
                    onFileSelect={(data) => setPayReceiptData(data)}
                    initialPreview={payReceiptData?.dataUrl}
                  />
                </div>

                {/* GCash Reference Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    GCash Reference Number
                  </label>
                  <input 
                    type="text"
                    value={payGcashRef}
                    onChange={(e) => setPayGcashRef(e.target.value)}
                    placeholder="e.g. 902837491028"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                    required
                  />
                </div>

                {/* Submit Payment button */}
                <button 
                  type="submit"
                  disabled={isSubmittingPay}
                  className="w-full py-3.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingPay ? 'Submitting Payment...' : 'Submit Payment to Landlord'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
