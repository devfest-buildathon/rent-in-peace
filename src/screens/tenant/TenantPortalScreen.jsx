import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Languages,
  AlertCircle,
  Loader2,
  PenTool,
  Printer,
  Check,
  CreditCard
} from 'lucide-react';
import SignaturePad from '../../components/shared/SignaturePad';
import FileUpload from '../../components/shared/FileUpload';

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
    setSigningMode,
    signatureData,
    setSignatureData,
    gcashFileData,
    setGcashFileData,
    gcashRefNumber,
    setGcashRefNumber,
    recordTenantCheckin
  } = useApp();

  const [explainBisaya, setExplainBisaya] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError('Please provide your digital e-signature below or tap Auto-Sign.');
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
            onClick={() => setCurrentScreen(tenantName || signingMode ? 'TENANT_HOME' : 'SPLASH')} 
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 mb-4 shadow-2xs">
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
              className="text-[11px] text-[#14532D] font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg"
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
                  {explainBisaya ? (c.bisaya || c.text || c.english) : (c.text || c.english)}
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
              <h3 className="text-xs font-bold text-slate-900">Lessee Signature Mode</h3>
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
              <span className="text-[9px] text-slate-500">Sign with finger or stylus</span>
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
                Article 1356: You can print 2 copies of this Kasulatan to physically sign with ballpen together with the landlord.
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 px-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Print Document for Physical Wet-Ink Signing (A4)</span>
              </button>
            </div>
          )}
        </div>

        {/* GCash Advance Rent Submission Card */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">GCash Advance Rent Payment</h3>
            </div>
            <span className="font-black text-[#14532D] text-sm">₱{displayAdvance.toLocaleString()}</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Attach your GCash payment screenshot receipt and reference number so the landlord can verify and release your door PIN.
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              GCash Receipt Screenshot
            </label>
            <FileUpload
              label="Upload GCash Screenshot Receipt"
              helperText="Upload GCash transfer screenshot with reference number"
              initialPreview={gcashFileData?.dataUrl || gcashFileData}
              onFileSelect={(data) => setGcashFileData(data)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">GCash Reference No.</label>
            <input 
              type="text" 
              value={gcashRefNumber} 
              onChange={(e) => setGcashRefNumber(e.target.value)} 
              placeholder="e.g. 9021481928" 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            />
          </div>
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
              <span>Sign Agreement & Submit Advance Payment</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
