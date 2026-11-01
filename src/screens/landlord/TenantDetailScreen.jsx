import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  FileText, 
  Bell, 
  Check, 
  Phone, 
  ShieldCheck, 
  Plus, 
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  Image as ImageIcon,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function TenantDetailScreen() {
  const { 
    setCurrentScreen, 
    selectedTenant, 
    setContractClauses,
    contracts,
    payments,
    verifyTenantPayment,
    rejectTenantPayment
  } = useApp();

  const [reminderCopied, setReminderCopied] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCycle, setPaymentCycle] = useState('Monthly Rent Payment');
  const [customPayments, setCustomPayments] = useState([]);
  const [verificationToast, setVerificationToast] = useState('');
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  const tenant = selectedTenant || {
    name: 'Tenant Details',
    unit: 'Unit 1 · Boarding House',
    rent: 0,
    due: 'Every 5th',
    phone: '09XXXXXXXXX',
    contract: null
  };

  // Get freshest live contract state
  const liveContract = contracts.find(c => 
    (tenant.contract?.code && (c.code === tenant.contract.code || c.id === tenant.contract.code)) ||
    (c.tenantName && c.tenantName === tenant.name)
  ) || tenant.contract;

  const isVerified = Boolean(liveContract?.paymentVerified);
  const hasSubmittedPayment = Boolean(liveContract?.isSigned || liveContract?.gcashRef || liveContract?.status === 'Pending Verification');
  const gcashRef = liveContract?.gcashRef || liveContract?.latestGcashRef || '';
  
  // Find receipt preview from payments or contract
  const contractPayments = payments.filter(p => p.contractCode === liveContract?.code);
  const latestPayment = contractPayments[0];
  const receiptImg = liveContract?.gcashReceiptData || latestPayment?.receiptData;

  const handleVerify = async () => {
    if (!liveContract?.code) return;
    await verifyTenantPayment(liveContract.code);
    setVerificationToast('Payment verified! Room Key PIN 5829 released to tenant.');
    setTimeout(() => setVerificationToast(''), 4000);
  };

  const handleReject = async () => {
    if (!liveContract?.code) return;
    await rejectTenantPayment(liveContract.code, 'GCash reference not found in statement');
    setVerificationToast('Tenant requested to re-submit payment proof.');
    setTimeout(() => setVerificationToast(''), 4000);
  };

  const handleSendReminder = () => {
    const message = `Hi ${tenant.name}, friendly reminder that your rent of ₱${Number(tenant.rent || 0).toLocaleString()} for ${tenant.unit} is due on ${tenant.due}. Thank you! - Rent in Peace`;
    navigator.clipboard?.writeText(message).catch(() => {});
    setReminderCopied(true);
    setTimeout(() => setReminderCopied(false), 3000);

    // Also trigger native SMS client if available on mobile
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && tenant.phone) {
      window.location.href = `sms:${tenant.phone}?body=${encodeURIComponent(message)}`;
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;

    const newPayment = {
      id: Date.now().toString(),
      cycle: paymentCycle,
      amount: Number(paymentAmount),
      date: new Date().toLocaleDateString(),
      status: 'Paid'
    };

    setCustomPayments([newPayment, ...customPayments]);
    setShowAddPayment(false);
    setPaymentAmount('');

    // Write payment to Cloud Firestore
    try {
      if (tenant.contract?.code) {
        await addDoc(collection(db, 'payments'), {
          contractCode: tenant.contract.code,
          cycleName: paymentCycle,
          amount: Number(paymentAmount),
          status: 'Paid',
          paymentDate: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('[Firebase] Payment log notice:', err.message);
    }
  };

  const handleViewContract = () => {
    if (tenant.contract?.contractClauses) {
      setContractClauses(tenant.contract.contractClauses);
    }
    setCurrentScreen('WIZARD_CONTRACT');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => setCurrentScreen('LANDLORD_TENANTS')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-xs font-bold text-slate-500">Tenant Profile</span>
          <div className="w-10"></div>
        </div>

        {/* Profile Header */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] text-[#14532D] font-black text-sm flex items-center justify-center mx-auto mb-2">
            {(tenant.name || 'T').substring(0, 2).toUpperCase()}
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{tenant.name}</h1>
          <p className="text-xs text-slate-500">{tenant.unit}</p>
          <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 ${
            isVerified ? 'bg-emerald-100 text-[#14532D]' : hasSubmittedPayment ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {isVerified ? 'Payment Verified · PIN Unlocked' : hasSubmittedPayment ? 'Payment Verification Pending' : 'Awaiting Tenant Check-In'}
          </span>
        </div>

        {/* Verification Toast Banner */}
        {verificationToast && (
          <div className="mb-3 p-3 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#14532D] shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{verificationToast}</span>
          </div>
        )}

        {/* ================= PAYMENT VERIFICATION & ROOM KEY ACCESS ================= */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700">Payment verification & Room key access</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {isVerified ? (
            /* VERIFIED STATE */
            <div className="p-4 bg-gradient-to-br from-[#14532D] to-emerald-900 text-white rounded-3xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payment Verified by Landlord</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300">Room Key Released</span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-xs text-emerald-100">Smart Lockbox PIN Active</p>
                  <p className="text-xl font-black font-mono text-amber-300 tracking-wider">PIN: 5829</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-emerald-200">GCash Ref Verified</p>
                  <p className="text-xs font-mono font-bold text-white">{gcashRef || 'Verified'}</p>
                </div>
              </div>
            </div>
          ) : hasSubmittedPayment ? (
            /* PENDING VERIFICATION STATE */
            <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                  <span>Action Needed: Verify Payment</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800">PIN Locked</span>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Tenant Submitted Payment Proof
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Verify the transfer in your GCash account before releasing the physical keybox PIN to the tenant.
                </p>
              </div>

              <div className="p-3 bg-white border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">GCASH REFERENCE NO.</span>
                  <span className="font-mono font-black text-sm text-slate-900">{gcashRef || 'Submitted'}</span>
                </div>
                {receiptImg && (
                  <button
                    type="button"
                    onClick={() => setShowReceiptPreview(!showReceiptPreview)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>{showReceiptPreview ? 'Hide Receipt' : 'View Receipt'}</span>
                  </button>
                )}
              </div>

              {/* Receipt Preview Thumbnail */}
              {showReceiptPreview && receiptImg && (
                <div className="p-2 bg-slate-900 rounded-2xl overflow-hidden text-center">
                  <img 
                    src={receiptImg} 
                    alt="Tenant Receipt" 
                    className="max-h-56 mx-auto rounded-xl object-contain" 
                  />
                  <p className="text-[10px] text-slate-300 mt-1">Tenant GCash Receipt Attachment</p>
                </div>
              )}

              {/* Action Buttons: 1-Click Verify or Re-submit */}
              <div className="pt-1 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handleVerify}
                  className="w-full py-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Verify Payment & Grant Room Key Access</span>
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className="w-full py-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  <span>Request Re-submission (Payment Not Found)</span>
                </button>
              </div>
            </div>
          ) : (
            /* AWAITING TENANT CHECK-IN */
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Tenant has not yet completed check-in and payment submission.</span>
              </div>
            </div>
          )}
        </div>

        {/* Next Payment Card */}
        <div className="p-4 bg-[#14532D] text-white rounded-3xl shadow-md mb-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">NEXT RENT DUE</span>
            <h2 className="text-lg font-black mt-0.5">{tenant.due}</h2>
            <p className="text-xs text-emerald-200/80 font-mono flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{tenant.phone || '09XXXXXXXXX'}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">₱{Number(tenant.rent || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Contract Summary */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700">Contract summary</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-2 text-xs shadow-2xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Lease term</span>
              <strong className="text-slate-800">{tenant.contract?.leaseDuration || '6 months'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deposit</span>
              <strong className="text-slate-800">₱{Number(tenant.contract?.deposit || tenant.rent || 0).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Room Code</span>
              <strong className="text-[#14532D] font-mono">{tenant.contract?.code || 'RIP-LINK'}</strong>
            </div>

            <button 
              onClick={handleViewContract}
              className="w-full mt-2 py-2.5 border border-[#14532D] text-[#14532D] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <FileText className="w-4 h-4" /> View full agreement
            </button>
          </div>
        </div>

        {/* Payment Records with real Record Payment button */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Payment ledger</span>
            <button 
              onClick={() => setShowAddPayment(!showAddPayment)}
              className="text-[11px] text-[#14532D] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>

          {showAddPayment && (
            <form onSubmit={handleRecordPayment} className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl mb-2.5 space-y-2 text-xs shadow-2xs">
              <p className="font-bold text-[#14532D]">Record Received Payment</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Amount (PHP)</label>
                  <input 
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={tenant.rent || '3500'}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#14532D]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Payment For</label>
                  <input 
                    type="text"
                    value={paymentCycle}
                    onChange={(e) => setPaymentCycle(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#14532D]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button 
                  type="button" 
                  onClick={() => setShowAddPayment(false)}
                  className="px-2.5 py-1 text-slate-500 font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1 bg-[#14532D] text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {/* Real contract payments from tenant submissions */}
            {contractPayments.map(p => (
              <div key={p.id} className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    p.status === 'Verified' ? 'bg-[#ECFDF5] text-[#14532D]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status === 'Verified' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3.5 h-3.5 animate-pulse" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{p.cycleName || 'Payment'}</p>
                    <p className="text-[10px] text-slate-400">{p.date} · Ref: <span className="font-mono">{p.gcashRef || '—'}</span></p>
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
            ))}

            {/* Custom recorded payments by landlord */}
            {customPayments.map((p) => (
              <div key={p.id} className="p-3 bg-white border border-emerald-200 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#ECFDF5] text-[#14532D] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{p.cycle}</p>
                    <p className="text-[10px] text-slate-400">{p.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">₱{p.amount.toLocaleString()}</p>
                  <span className="text-[9px] text-[#14532D] font-bold">Paid</span>
                </div>
              </div>
            ))}

            {contractPayments.length === 0 && customPayments.length === 0 && (
              <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Current cycle</p>
                    <p className="text-[10px] text-slate-400">Due {tenant.due}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600">Pending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        {reminderCopied ? (
          <div className="w-full py-3.5 bg-emerald-100 border border-emerald-300 text-[#14532D] font-bold text-xs rounded-2xl text-center mb-2 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Reminder text copied & opened in SMS!</span>
          </div>
        ) : (
          <button 
            onClick={handleSendReminder}
            className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 mb-2 cursor-pointer"
          >
            <Bell className="w-4 h-4" /> Send rent reminder via SMS / Messenger
          </button>
        )}
      </div>
    </div>
  );
}
