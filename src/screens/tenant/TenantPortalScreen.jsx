import React, { useState } from 'react';
import { useApp, isGenericTenantName } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Languages, 
  AlertCircle, 
  Loader2, 
  PenTool, 
  Printer, 
  Check, 
  CreditCard,
  Clock,
  ShieldCheck,
  FileText,
  Lock,
  ArrowRight,
  QrCode,
  Edit3
} from 'lucide-react';
import SignaturePad from '../../components/shared/SignaturePad';
import FileUpload from '../../components/shared/FileUpload';

export default function TenantPortalScreen() {
  const { 
    navigateBack,
    setCurrentScreen,
    roomNumber,
    propertyAddress,
    monthlyRent,
    advanceRent,
    tenantName,
    setTenantName,
    contractClauses,
    tenantHasReadContract,
    setTenantHasReadContract,
    signingMode,
    setSigningMode,
    signatureData,
    setSignatureData,
    gcashFileData,
    setGcashFileData,
    gcashRefNumber,
    setGcashRefNumber,
    activeCode,
    roomCodeInput,
    tenantProfile,
    contracts,
    activeTenantContract,
    signTenantKasulatan,
    submitTenantPaymentProof
  } = useApp();

  const [explainBisaya, setExplainBisaya] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payChannel, setPayChannel] = useState('QRPH'); // 'QRPH' | 'CASH'

  const currentCode = activeCode || roomCodeInput || tenantProfile?.contractCode || tenantProfile?.leaseId;
  const activeContract = activeTenantContract || contracts.find(c => c.code === currentCode || c.id === currentCode) || {};

  const displayRent = Number(monthlyRent || activeContract.monthlyRent || 0);
  const displayAdvance = Number(advanceRent || activeContract.advanceRent || displayRent);
  const displayUnit = roomNumber || activeContract.roomNumber || 'Unit 1';
  const displayAddress = propertyAddress || activeContract.propertyAddress || 'Specified Property Address';

  const isSigned = Boolean(
    activeContract.isSigned || 
    activeContract.tenantSigned || 
    activeContract.status === 'pending_payment' || 
    activeContract.status === 'pending_verification' || 
    activeContract.status === 'active'
  );

  const isPendingVerification = activeContract.status === 'pending_verification';
  const isActive = activeContract.status === 'active' || Boolean(activeContract.paymentVerified);
  const rejectionReason = activeContract.paymentRejectionReason;

  const handleQuickNameSign = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic bold 28px Georgia, serif';
    ctx.fillStyle = '#14532D';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`~ ${tenantName || 'Tenant Signature'} ~`, 200, 75);
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 110);
    ctx.lineTo(340, 110);
    ctx.stroke();
    setSignatureData(canvas.toDataURL('image/png'));
  };

  // Step 4: Sign Kasulatan -> status becomes "pending_payment"
  const handleSignAgreement = async () => {
    setError('');
    if (!tenantName.trim() || isGenericTenantName(tenantName)) {
      setError('Please provide your full legal name as lessee.');
      return;
    }
    if (!tenantHasReadContract) {
      setError('Please confirm that you have read and understood the lease clauses.');
      return;
    }
    if (signingMode === 'DIGITAL' && !signatureData) {
      setError('Please draw your signature below or tap Auto-Sign.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signTenantKasulatan({
        signingMode,
        signatureData: signingMode === 'DIGITAL' ? signatureData : 'Wet-Ink Signatory'
      });
    } catch (err) {
      setError(err.message || 'Failed to sign Kasulatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5: Submit Payment Proof -> status becomes "pending_verification"
  const handleSubmitPayment = async () => {
    setError('');
    if (payChannel === 'CASH') {
      setIsSubmitting(true);
      try {
        await submitTenantPaymentProof({
          contractCode: currentCode,
          amount: displayAdvance,
          type: 'advance/deposit',
          gcashRef: 'CASH-HANDOVER',
          receiptData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="300" height="150" fill="%23fef3c7" rx="12"/><text x="150" y="65" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2378350f" text-anchor="middle">Physical Cash on Hand</text><text x="150" y="95" font-family="sans-serif" font-size="11" fill="%2392400e" text-anchor="middle">Handover to Landlord Pending</text></svg>',
          file: null
        });
        setCurrentScreen('SUCCESS_PIN');
      } catch (err) {
        setError(err.message || 'Failed to submit cash handover request.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!gcashRefNumber.trim()) {
      setError('Transaction reference number is required.');
      return;
    }
    if (!gcashFileData) {
      setError('Screenshot proof of payment is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTenantPaymentProof({
        contractCode: currentCode,
        amount: displayAdvance,
        type: 'advance/deposit',
        gcashRef: gcashRefNumber.trim(),
        receiptData: gcashFileData?.dataUrl || gcashFileData?.preview || (typeof gcashFileData === 'string' ? gcashFileData : null),
        file: gcashFileData?.file || null
      });
      setCurrentScreen('SUCCESS_PIN');
    } catch (err) {
      setError(err.message || 'Failed to submit payment proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            type="button"
            onClick={navigateBack} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">
            {isActive ? 'Active Lease' : isPendingVerification ? 'Verification In Progress' : isSigned ? 'Submit Payment Proof' : 'Sign Lease Agreement'}
          </h2>
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-2xs overflow-hidden">
            <img src="/assets/logo-icon.png" alt="Rent in Peace" className="w-full h-full object-contain rounded-xl" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">
            {isActive ? 'VERIFIED ACTIVE' : isPendingVerification ? 'STEP 5 OF 5: VERIFICATION PENDING' : isSigned ? 'STEP 5: GCASH PAYMENT PROOF' : 'STEP 4: REVIEW & SIGN'}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {displayUnit}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {displayAddress} · ₱{displayRent.toLocaleString()}/mo
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 mb-4 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ACTIVE LEASE NOTICE */}
        {isActive && (
          <div className="p-5 bg-white rounded-3xl border border-emerald-300 shadow-2xs text-center space-y-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#14532D] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Your Lease is Verified Active!</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
              Your landlord has verified your payment. You can now access your room code and digital ledger in your Resident Hub.
            </p>
            <button
              type="button"
              onClick={() => setCurrentScreen('TENANT_HOME')}
              className="w-full py-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer"
            >
              Open Resident Dashboard
            </button>
          </div>
        )}

        {/* STEP 5 (PENDING VERIFICATION STATE): WAITING FOR LANDLORD */}
        {isPendingVerification && !isActive && (
          <div className="p-5 bg-white rounded-3xl border border-amber-300 shadow-2xs space-y-3.5 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 stroke-[2.5] animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Status</span>
                <h3 className="text-sm font-black text-slate-900">Waiting for landlord to verify your payment.</h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
              Your signed Kasulatan and GCash payment proof have been successfully submitted. Once your landlord verifies the receipt, your door access code will be unlocked and your status will become <strong>Verified Active</strong>.
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">Advance Rent Paid</span>
                <span className="font-bold text-[#14532D]">₱{displayAdvance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">GCash Ref No.</span>
                <span className="font-mono font-bold text-slate-800">
                  {activeContract.gcashRef || activeContract.latestGcashRef || gcashRefNumber || 'Submitted'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Door Keypad Code</span>
                <span className="font-mono font-bold text-amber-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Protected (Unlocked upon verification)</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentScreen('TENANT_HOME')}
              className="w-full py-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer"
            >
              Go to Resident Hub
            </button>
          </div>
        )}

        {/* STEP 4: SIGN KASULATAN (Shown when lease is NOT signed yet) */}
        {!isSigned && !isActive && (
          <>
            {/* Legal Name Field */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-2 mb-4">
              <label className="block text-xs font-bold text-slate-900">Your Full Legal Name (Lessee)</label>
              <input 
                type="text" 
                value={tenantName} 
                onChange={(e) => setTenantName(e.target.value)} 
                placeholder="e.g. Elena P. Salvador" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            {/* Kasulatan Clauses Reader */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Kasulatan sa Abang Clauses</h3>
                <button
                  type="button"
                  onClick={() => setExplainBisaya(!explainBisaya)}
                  className="text-[11px] text-[#14532D] font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{explainBisaya ? 'English Terms' : 'Bisaya Translation'}</span>
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 scrollbar-none text-xs text-slate-700">
                {contractClauses.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-900 block">{i + 1}. {(c.title || '').replace(/^\d+\.\s*/, '')}</span>
                    <p className="mt-1 leading-relaxed text-slate-700">
                      {explainBisaya ? (c.bisaya || c.text || c.english) : (c.english || c.text)}
                    </p>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={tenantHasReadContract} 
                  onChange={(e) => setTenantHasReadContract(e.target.checked)} 
                  className="mt-0.5 rounded text-[#14532D] focus:ring-emerald-600 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-700 leading-snug">
                  I have read, understood, and voluntarily agree to all provisions of this Kasulatan sa Pag-abang.
                </span>
              </label>
            </div>

            {/* Tenant Signature & Execution Options */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Lessee Signature</h3>
                  <p className="text-[11px] text-slate-400">Sign digitally on screen or print physical wet-ink copy.</p>
                </div>
              </div>

              {/* Dual Mode Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSigningMode('DIGITAL')}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-0.5 ${
                    signingMode === 'DIGITAL'
                      ? 'border-[#14532D] bg-[#ECFDF5] text-[#14532D] shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Digital E-Sign</span>
                  </span>
                  <span className="text-[9px] text-slate-500">Sign on screen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSigningMode('WET_INK')}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-0.5 ${
                    signingMode === 'WET_INK'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <Printer className={`w-3.5 h-3.5 ${signingMode === 'WET_INK' ? 'text-amber-400' : 'text-slate-600'}`} />
                    <span>Wet-Ink Physical</span>
                  </span>
                  <span className={`text-[9px] ${signingMode === 'WET_INK' ? 'text-slate-300' : 'text-slate-500'}`}>Print A4 & ballpen sign</span>
                </button>
              </div>

              {signingMode === 'DIGITAL' ? (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-medium">Draw your signature below:</span>
                    <button 
                      type="button"
                      onClick={handleQuickNameSign}
                      className="px-2.5 py-1 bg-emerald-50 text-[#14532D] font-bold text-[10px] rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                    >
                      Auto-Sign
                    </button>
                  </div>

                  <SignaturePad 
                    value={signatureData}
                    onChange={setSignatureData}
                  />
                </div>
              ) : (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-950 space-y-2 mt-1">
                  <p className="text-[10px] text-amber-800 leading-snug">
                    Print this Kasulatan to physically sign with ballpen together with the landlord (Civil Code Art. 1356).
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 px-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Print Document (A4)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 400;
                        canvas.height = 150;
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#f8fafc';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.font = 'bold 14px sans-serif';
                        ctx.fillStyle = '#0f172a';
                        ctx.textAlign = 'center';
                        ctx.fillText('✓ Signed Physical Kasulatan Page Uploaded', 200, 60);
                        ctx.font = 'italic 12px serif';
                        ctx.fillStyle = '#14532D';
                        ctx.fillText(`~ ${tenantName || 'Tenant'} (Civil Code Art. 1356) ~`, 200, 95);
                        setSignatureData(canvas.toDataURL('image/png'));
                        setError('');
                      }}
                      className="py-2.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-[#14532D] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      ⚡ Fast Demo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4 CTA: Sign Agreement */}
            <div className="pt-2 pb-2">
              <button 
                onClick={handleSignAgreement}
                disabled={isSubmitting}
                className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>Sign Agreement</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* STEP 5: GCASH PAYMENT PROOF (Shown when Kasulatan is signed, but not yet verified) */}
        {isSigned && !isPendingVerification && !isActive && (
          <div className="space-y-4">
            {/* Signed status indicator */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-[#14532D]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="font-bold">Kasulatan Agreement Signed</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                Pending Payment
              </span>
            </div>

            {/* Rejection Alert if Landlord requested resubmission */}
            {rejectionReason && (
              <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl text-xs text-red-700 space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-red-900">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Payment Resubmission Required by Landlord</span>
                </div>
                <p className="text-[11px] text-red-800 leading-relaxed pl-5">
                  Reason: <strong>{rejectionReason}</strong>
                </p>
                <p className="text-[10px] text-red-600 pl-5">
                  Please upload your corrected screenshot and enter the valid reference number below.
                </p>
              </div>
            )}

            {/* Advance Rent Submission Card */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Advance Rent Settlement</h3>
                    <p className="text-[10px] text-slate-400">QR Ph, GCash, or Cash on Hand</p>
                  </div>
                </div>
                <span className="font-black text-[#14532D] text-base">₱{displayAdvance.toLocaleString()}</span>
              </div>

              {/* Settlement Mode Selector: QR Ph (GCash/Maya/Banks) vs Physical Cash */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPayChannel('QRPH');
                    if (gcashRefNumber === 'CASH-HANDOVER') setGcashRefNumber('');
                  }}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                    payChannel === 'QRPH' 
                      ? 'border-[#14532D] bg-[#ECFDF5] text-[#14532D] font-bold shadow-2xs' 
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-black">QR Ph / E-Wallet</div>
                  <p className="text-[9px] text-slate-500">GCash, Maya, BDO, Banks</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPayChannel('CASH');
                    setGcashRefNumber('CASH-HANDOVER');
                  }}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                    payChannel === 'CASH' 
                      ? 'border-[#14532D] bg-[#ECFDF5] text-[#14532D] font-bold shadow-2xs' 
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-black">Cash on Hand</div>
                  <p className="text-[9px] text-slate-500">Direct to Landlord</p>
                </button>
              </div>

              {payChannel === 'QRPH' ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                    Send ₱{displayAdvance.toLocaleString()} to your landlord via GCash / QR Ph. Then upload the screenshot receipt and enter the transaction reference number below.
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                      Receipt Screenshot <span className="text-red-500">*</span>
                    </label>
                    <FileUpload
                      label="Upload Screenshot Receipt"
                      helperText="Accepted: GCash, Maya, GoTyme, SeaBank, BDO, BPI"
                      initialPreview={gcashFileData?.dataUrl || gcashFileData}
                      onFileSelect={(data) => setGcashFileData(data)}
                    />
                  </div>

                  {/* Fast Demo GCash Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setGcashFileData({ 
                          name: 'qrph_receipt.png', 
                          dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="300" height="150" fill="%23007dfe" rx="12"/><text x="150" y="55" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">QR Ph Transfer Verified</text><text x="150" y="85" font-family="monospace" font-size="12" fill="white" text-anchor="middle">Ref: 902837491028</text><text x="150" y="115" font-family="sans-serif" font-size="11" fill="%23a7f3d0" text-anchor="middle">Status: Completed</text></svg>' 
                        });
                        setGcashRefNumber('902837491028');
                      }}
                      className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>⚡ Fast Demo QR Ph (Ref: 902837491028)</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Transaction / GCash Ref No. <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={gcashRefNumber} 
                      onChange={(e) => setGcashRefNumber(e.target.value)} 
                      placeholder="e.g. 9021481928" 
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-amber-950 text-xs">
                  <p className="font-bold text-[11px] flex items-center gap-1.5 text-amber-900">
                    <span>💵 Physical Cash Settlement (Customary Law):</span>
                  </p>
                  <p className="text-[10px] leading-relaxed text-amber-800">
                    You can hand physical banknotes directly to the landlord or designated property caretaker. Once received, the landlord will tap "Acknowledge Cash Received" on their dashboard to unlock your room PIN.
                  </p>
                  <div className="flex justify-between items-center pt-1.5 border-t border-amber-200">
                    <span className="text-[10px] text-amber-700 font-medium">Status: Marked for Cash Handover</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      Cash on Hand
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5 CTA: Submit Payment Proof */}
            <div className="pt-2 pb-2">
              <button 
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
                className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>{payChannel === 'CASH' ? 'Confirm Cash Handover & Request PIN' : 'Submit Payment Proof'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}