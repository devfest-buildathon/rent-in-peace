import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  CheckCircle2, 
  KeyRound, 
  Lock, 
  FileText, 
  CreditCard, 
  ZoomIn, 
  X, 
  HelpCircle, 
  Loader2 
} from 'lucide-react';

export default function TenantDetailScreen() {
  const { 
    setCurrentScreen, 
    selectedTenant, 
    contracts, 
    payments,
    verifyTenantPayment,
    lookupContractByCode
  } = useApp();

  const [verificationToast, setVerificationToast] = useState('');
  const [zoomReceiptUrl, setZoomReceiptUrl] = useState(null);
  const [confirmVerifyModal, setConfirmVerifyModal] = useState(false);
  const [pendingTargetPayment, setPendingTargetPayment] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const tenant = selectedTenant || {
    name: 'Tenant Resident',
    unit: 'Room Unit',
    rent: 3500,
    due: 'Every 5th',
    phone: '09XXXXXXXXX',
    isSigned: false,
    paymentVerified: false,
    signingMode: 'DIGITAL',
    contract: null
  };

  const liveContract = contracts.find(c => 
    (c.code && (c.code === tenant.contract?.code || c.code === tenant.code)) ||
    (c.tenantName && c.tenantName === tenant.name) ||
    (c.id && c.id === tenant.contract?.id)
  ) || tenant.contract || {};

  const isVerified = Boolean(liveContract.paymentVerified || tenant.paymentVerified);

  // Filter every payment recorded for this resident / contract
  const tenantPayments = payments.filter(p => 
    (liveContract.code && p.contractCode === liveContract.code) || 
    (liveContract.id && p.contractCode === liveContract.id) ||
    (tenant.contract?.code && p.contractCode === tenant.contract?.code) ||
    (tenant.code && p.contractCode === tenant.code) ||
    (tenant.name && p.tenantName && p.tenantName.toLowerCase() === tenant.name.toLowerCase())
  );

  const receiptImage = liveContract.gcashReceiptData || 
    tenant.gcashReceiptData || 
    tenantPayments.find(p => p.receiptData)?.receiptData || 
    null;

  const gcashRef = liveContract.gcashRef || 
    tenant.gcashRef || 
    tenantPayments.find(p => p.gcashRef)?.gcashRef || 
    null;

  const paymentAmount = liveContract.advancePaidAmount || 
    liveContract.latestPaymentAmount || 
    liveContract.advanceRent || 
    tenant.rent || 
    0;

  const triggerVerifyConfirmation = (payment = null) => {
    setPendingTargetPayment(payment);
    setConfirmVerifyModal(true);
  };

  const confirmAndExecuteVerification = async () => {
    setIsVerifying(true);
    const code = liveContract.code || liveContract.id || tenant.contract?.code;
    const paymentId = pendingTargetPayment?.id || null;
    if (code) {
      await verifyTenantPayment(code, paymentId);
      setVerificationToast('Payment verified! Door lockbox PIN (5829) is now released to tenant.');
      setTimeout(() => setVerificationToast(''), 4500);
    }
    setIsVerifying(false);
    setConfirmVerifyModal(false);
  };

  const handleOpenKasulatan = async () => {
    const code = liveContract.code || liveContract.id;
    if (code) {
      await lookupContractByCode(code);
    }
    setCurrentScreen('WIZARD_CONTRACT');
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
            {(tenant.name || 'T').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 truncate">{tenant.name}</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{tenant.unit}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
            isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isVerified ? 'Active Resident' : 'Pending Verification'}
          </span>
        </div>

        {verificationToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold mb-4 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{verificationToast}</span>
          </div>
        )}

        {/* GCash Latest Payment Submission Card */}
        {(gcashRef || receiptImage) && (
          <div className="p-4 bg-white border-2 border-emerald-600/30 rounded-3xl mb-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latest Payment Proof</span>
                  <p className="text-xs font-bold text-slate-900">₱{Number(paymentAmount).toLocaleString()}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Reference No.</span>
                <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {gcashRef || 'Submitted'}
                </span>
              </div>
            </div>

            {/* Uploaded Screenshot Preview */}
            <div>
              <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
                GCash Screenshot Receipt
              </span>
              {receiptImage ? (
                <div 
                  onClick={() => setZoomReceiptUrl(receiptImage)}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xs"
                  title="Click to view full size"
                >
                  <img 
                    src={receiptImage} 
                    alt="GCash Payment Receipt Screenshot" 
                    className="w-full max-h-72 object-contain mx-auto group-hover:scale-102 transition duration-200" 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-bold gap-1.5 backdrop-blur-2xs">
                    <ZoomIn className="w-4 h-4" />
                    <span>Tap to zoom receipt</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
                  Tenant provided reference number <span className="font-mono font-bold">{gcashRef}</span> without screenshot attachment.
                </div>
              )}
            </div>

            {/* Verification trigger */}
            {!isVerified ? (
              <div className="pt-1">
                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                  Confirm receipt match to unlock the apartment key lockbox PIN for {tenant.name}.
                </p>
                <button 
                  type="button"
                  onClick={() => triggerVerifyConfirmation(null)}
                  className="w-full py-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify GCash Payment & Release PIN</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-[#14532D] font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Payment Verified · Lockbox PIN Released</span>
                </div>
                <span className="font-mono text-[11px] bg-white text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-200">
                  PIN: 5829
                </span>
              </div>
            )}
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
              {isVerified ? 'Unlocked and visible on tenant dashboard' : 'Locked until payment verified'}
            </p>
          </div>

          <div className={`p-2.5 rounded-2xl ${isVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {isVerified ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
        </div>

        {/* All Payments Ledger & Audit Trail for this Resident */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Resident Payment History</h3>
              <p className="text-[10px] text-slate-400">All payments logged for {tenant.name}</p>
            </div>
            <span className="text-xs font-bold text-[#14532D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {tenantPayments.length} recorded
            </span>
          </div>

          {tenantPayments.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">No individual payment logs recorded yet.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Payments submitted by this resident will appear here with GCash receipt proofs.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tenantPayments.map((p, idx) => {
                const itemReceipt = p.receiptData || (p.cycleName?.includes('Advance') ? liveContract.gcashReceiptData : null);
                const isItemVerified = p.status === 'Verified';

                return (
                  <div key={p.id || idx} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {itemReceipt ? (
                        <div 
                          onClick={() => setZoomReceiptUrl(itemReceipt)}
                          className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-300 shrink-0 cursor-pointer relative group bg-white shadow-2xs"
                          title="Click to view full receipt"
                        >
                          <img src={itemReceipt} alt="Receipt Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-emerald-100/70 text-[#14532D] flex items-center justify-center font-bold text-xs shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.cycleName || p.cycle || 'Rent Payment'}</p>
                        <p className="text-[10px] text-slate-500">
                          Ref: <span className="font-mono font-bold text-slate-800">{p.gcashRef || '—'}</span>
                          {p.date && <span className="ml-1.5 text-slate-400">· {p.date}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-xs font-black text-slate-900">₱{Number(p.amount || 0).toLocaleString()}</p>
                        <span className={`text-[10px] font-bold ${
                          isItemVerified ? 'text-emerald-700' : 'text-amber-600'
                        }`}>
                          {p.status || 'Pending Verification'}
                        </span>
                      </div>

                      {!isItemVerified && (
                        <button
                          type="button"
                          onClick={() => triggerVerifyConfirmation(p)}
                          className="px-2.5 py-1 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-[10px] rounded-lg shadow-xs transition cursor-pointer"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial & Schedule Overview */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <h3 className="text-xs font-bold text-slate-900">Lease Terms</h3>
          
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-400">Monthly Rent</span>
            <span className="font-black text-[#14532D]">₱{Number(tenant.rent || liveContract.monthlyRent || 0).toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-400">Due Schedule</span>
            <span className="font-bold text-slate-900">{tenant.due}</span>
          </div>

          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-400">Room Code</span>
            <span className="font-mono font-bold text-slate-900">{liveContract.code || tenant.code || '—'}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Tenant Phone</span>
            <span className="font-mono font-bold text-slate-900">{tenant.phone || '—'}</span>
          </div>
        </div>

        {/* View Official Kasulatan */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Signed Kasulatan Agreement</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {liveContract.signingMode === 'WET_INK' ? 'Wet-Ink Signatory' : 'Digital E-Sign'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenKasulatan}
            className="w-full py-3 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#14532D] font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-emerald-200"
          >
            <FileText className="w-4 h-4" />
            <span>View & Print Kasulatan (A4)</span>
          </button>
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

      {/* Confirmation Modal: Are You Sure? */}
      {confirmVerifyModal && (
        <div 
          onClick={() => setConfirmVerifyModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Confirm Payment Verification?</h3>
                <p className="text-[11px] text-slate-500">Please review before approving</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Resident</span>
                <span className="font-bold text-slate-900">{tenant.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Unit</span>
                <span className="font-bold text-slate-900">{tenant.unit}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Reference No.</span>
                <span className="font-mono font-bold text-emerald-800">{pendingTargetPayment?.gcashRef || gcashRef || 'Submitted'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Amount</span>
                <span className="font-black text-[#14532D] text-sm">
                  ₱{Number(pendingTargetPayment?.amount || paymentAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-snug">
              Approving will mark this payment as <strong>Verified</strong> and immediately unlock the physical master lockbox PIN (<strong>5829</strong>) on the resident's app.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmVerifyModal(false)}
                className="py-3 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVerifying}
                onClick={confirmAndExecuteVerification}
                className="py-3 px-3 rounded-xl bg-[#14532D] hover:bg-[#0f4022] text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Verify</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomReceiptUrl && (
        <div 
          onClick={() => setZoomReceiptUrl(null)} 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-sm w-full bg-white rounded-3xl p-3 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">GCash Screenshot Receipt</span>
              <button 
                onClick={() => setZoomReceiptUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img 
              src={zoomReceiptUrl} 
              alt="Receipt Preview" 
              className="w-full max-h-[75vh] object-contain rounded-2xl bg-slate-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
