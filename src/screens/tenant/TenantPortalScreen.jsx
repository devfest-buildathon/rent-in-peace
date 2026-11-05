import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Languages,
  AlertCircle,
  Loader2
} from 'lucide-react';
import SignaturePad from '../../components/shared/SignaturePad';

export default function TenantPortalScreen() {
  const { 
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
    signatureData,
    setSignatureData,
    gcashRefNumber,
    setGcashRefNumber,
    recordTenantCheckin
  } = useApp();

  const [explainBisaya, setExplainBisaya] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payChannel, setPayChannel] = useState('QRPH'); // 'QRPH' | 'CASH'

  const displayRent = Number(monthlyRent || 0);
  const displayAdvance = Number(advanceRent || displayRent);
  const displayUnit = roomNumber || 'Unit 1';
  const displayAddress = propertyAddress || 'Cagayan de Oro City';

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

  const handleSubmitAgreement = async () => {
    if (!tenantName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!tenantHasReadContract) {
      setError('Please confirm that you have read and understood the lease clauses.');
      return;
    }
    if (signingMode === 'DIGITAL' && !signatureData) {
      setError('Please provide your digital e-signature below or use Auto-Sign.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    await recordTenantCheckin();
    setIsSubmitting(false);
    setCurrentScreen('SUCCESS_PIN');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('TENANT_AUTH')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Sign Lease Agreement</h2>
          <div className="w-10"></div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">TENANT ONBOARDING</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {displayUnit}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {displayAddress} · ₱{displayRent.toLocaleString()}/mo
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Legal Name Field */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <label className="block text-xs font-bold text-slate-900">Your Full Legal Name (Lessee)</label>
          <input 
            type="text" 
            value={tenantName} 
            onChange={(e) => setTenantName(e.target.value)} 
            placeholder="e.g. Juan dela Cruz" 
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
              className="text-[11px] text-[#14532D] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{explainBisaya ? 'English Terms' : 'Bisaya Translation'}</span>
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-none text-xs text-slate-700">
            {contractClauses.map((c, i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-900 block">{i + 1}. {c.title}</span>
                <p className="mt-0.5 leading-relaxed text-slate-600">
                  {explainBisaya ? (c.bisaya || c.english) : c.english}
                </p>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={tenantHasReadContract} 
              onChange={(e) => setTenantHasReadContract(e.target.checked)} 
              className="mt-0.5 rounded text-[#14532D] focus:ring-emerald-600"
            />
            <span className="text-[11px] font-medium text-slate-600 leading-snug">
              I have read, understood, and voluntarily agree to all provisions of this Kasulatan.
            </span>
          </label>
        </div>

        {/* Step 3: Phygital Dual-Signing (Wet-Ink vs E-Sign) */}
        <div id="signature-section" className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-2xs">
          <div className="flex justify-between items-center mb-2.5">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#14532D]" />
              <span>3. Phygital Dual-Signing</span>
            </p>
            <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              Legal Options
            </span>
          </div>

          {/* Prominent Dual Card Option Selector */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div 
              onClick={() => setSigningMode('DIGITAL')} 
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                signingMode === 'DIGITAL' 
                  ? 'border-[#14532D] bg-[#ECFDF5] text-[#14532D] shadow-xs' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Digital E-Sign</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5 font-medium">RA 8792 E-Commerce Act</p>
            </div>

            <div 
              onClick={() => setSigningMode('WET_INK')} 
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                signingMode === 'WET_INK' 
                  ? 'border-[#14532D] bg-[#ECFDF5] text-[#14532D] shadow-xs' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                <FileText className="w-3.5 h-3.5" />
                <span>Wet-Ink Paper</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5 font-medium">Civil Code Art. 1356</p>
            </div>
          </div>

          {signingMode === 'DIGITAL' ? (
            <div className="space-y-2">
              <SignaturePad 
                onSave={(dataUrl) => {
                  setSignatureData(dataUrl);
                  setError('');
                }} 
                initialSignature={signatureData}
              />
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-400">Draw with your finger or stylus above</span>
                <button
                  type="button"
                  onClick={handleQuickNameSign}
                  className="text-[10px] bg-[#ECFDF5] hover:bg-emerald-100 text-[#14532D] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <PenTool className="w-3 h-3" />
                  <span>Sign with My Legal Name</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-[10px] leading-relaxed">
                <strong>Physical Wet-Ink Process (Article 1356):</strong>
                <p>1. Print the official A4 Kasulatan sa Pag-Abang using the button below.</p>
                <p>2. Affix signatures with a ballpen in front of the landlord or witnesses.</p>
                <p>3. Snap or upload a clear photo of the signed document page.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-white border border-[#14532D] text-[#14532D] hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Blank A4 Kasulatan
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
                    ctx.font = 'bold 15px sans-serif';
                    ctx.fillStyle = '#0f172a';
                    ctx.textAlign = 'center';
                    ctx.fillText('✓ Signed Physical Kasulatan Page Uploaded', 200, 60);
                    ctx.font = 'italic 12px serif';
                    ctx.fillStyle = '#14532D';
                    ctx.fillText(`~ ${tenantName || 'Tenant'} (Civil Code Art. 1356 Compliant) ~`, 200, 95);
                    setSignatureData(canvas.toDataURL('image/png'));
                    setError('');
                  }}
                  className="py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-[#14532D] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  ⚡ Fast Demo Signed Paper
                </button>
              </div>

              <FileUpload 
                label="Upload photo of physically signed paper contract"
                helperText="Showing signed notary or witness lines"
                onFileSelect={(data) => {
                  setSignatureData(data?.dataUrl || null);
                  setError('');
                }}
                initialPreview={signatureData}
              />
            </div>
          )}
        </div>

        {/* Step 4: Advance Rent Payment (QR Ph / Maya / GCash vs Physical Cash) */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-2xs space-y-2.5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#14532D]" />
              <span>4. Advance Rent Settlement (₱{displayAdvance.toLocaleString()})</span>
            </p>
            <span className="text-[9px] bg-emerald-100 text-[#14532D] font-bold px-2 py-0.5 rounded-full">
              Flexible Payment
            </span>
          </div>

          {/* Payment Method Selector: QR Ph (GCash/Maya/Banks) vs Physical Cash */}
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
              <p className="text-[9px] text-slate-500">Direct to Landlord / Caretaker</p>
            </button>
          </div>

          {payChannel === 'QRPH' ? (
            <div className="space-y-2 pt-1">
              <FileUpload 
                label="Upload QR Ph / Bank transfer screenshot receipt"
                helperText="Accepted: GCash, Maya, GoTyme, SeaBank, BDO, BPI"
                onFileSelect={(data) => setGcashFileData(data)}
                initialPreview={gcashFileData?.dataUrl}
              />

              {/* Fast Demo GCash Button */}
              <div className="pt-0.5 flex justify-end">
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Transaction / Trace Reference No.
                </label>
                <input 
                  type="text"
                  value={gcashRefNumber}
                  onChange={(e) => setGcashRefNumber(e.target.value)}
                  placeholder="e.g. 902837491028 or InstaPay Trace"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#14532D]"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-amber-950 text-xs">
              <p className="font-bold text-[11px] flex items-center gap-1.5 text-amber-900">
                <span>💵 Physical Cash Settlement (Customary Law):</span>
              </p>
              <p className="text-[10px] leading-relaxed text-amber-800">
                You can hand physical banknotes directly to the landlord or designated property caretaker. Once received, the landlord will tap "Acknowledge Cash Received" on their dashboard to unlock your room PIN.
              </p>
              <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                <span className="text-[10px] text-amber-700 font-medium">Status: Marked for Cash Handover</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  Cash on Hand
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Submit CTA */}
      <div className="pt-3 pb-2">
        <button 
          onClick={handleSubmitAgreement}
          disabled={isSubmitting}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <span>Sign Agreement & Request Key PIN</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
