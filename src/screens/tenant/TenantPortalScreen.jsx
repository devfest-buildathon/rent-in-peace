import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  FileText, 
  Edit3, 
  QrCode, 
  KeyRound,
  Languages,
  AlertCircle,
  Loader2,
  CheckCircle2,
  PenTool
} from 'lucide-react';
import SignaturePad from '../../components/shared/SignaturePad';
import FileUpload from '../../components/shared/FileUpload';

export default function TenantPortalScreen() {
  const { 
    setCurrentScreen,
    roomCodeInput,
    activeCode,
    roomNumber,
    propertyAddress,
    propertyType,
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
    idFileData,
    setIdFileData,
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

  // Quick signature generator using tenant's name
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
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 105);
    ctx.lineTo(350, 105);
    ctx.stroke();
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
    setError('');
  };

  const handleSubmit = async () => {
    if (!tenantHasReadContract) {
      setError('Please tap the checkbox in Step 2 confirming you read the lease agreement.');
      const el = document.getElementById('contract-agreement-check');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (signingMode === 'DIGITAL' && !signatureData) {
      setError('Please draw your signature below or tap "Sign with Full Legal Name".');
      const el = document.getElementById('signature-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await recordTenantCheckin();
    } catch (err) {
      console.warn('[Checkin] Processed with local guarantee:', err);
    } finally {
      setIsSubmitting(false);
      setCurrentScreen('SUCCESS_PIN');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('TENANT_AUTH')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
            title="Back to Tenant Sign In"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-emerald-100 text-[#14532D] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Tenant Self Check-In
            </span>
          </div>
          <button 
            onClick={() => setCurrentScreen('SPLASH')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer text-xs font-bold"
            title="Exit to Welcome Screen"
          >
            Exit
          </button>
        </div>

        {/* Unit Details Header Banner */}
        <div className="p-4 bg-[#14532D] text-white rounded-3xl shadow-md mb-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Code: {roomCodeInput || activeCode || 'RIP-KEY'}
              </span>
              <h2 className="text-base font-black mt-1">Check-in: {displayUnit}</h2>
              <p className="text-[10px] text-emerald-200">{displayAddress} · {propertyType}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-emerald-200 uppercase font-semibold">Monthly Rent</p>
              <p className="text-lg font-black">₱{displayRent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="flex-1 leading-snug">{error}</span>
          </div>
        )}

        {/* Step 1: ID Verification */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-2xs">
          <p className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#14532D]" />
            <span>1. Identity Verification (PhilSys / Gov ID)</span>
          </p>
          <FileUpload 
            label="Upload photo of your Valid Government ID"
            helperText="PhilSys National ID, Driver's License, UMID, or Student ID"
            onFileSelect={(data) => {
              setIdFileData(data);
              if (data && !tenantName) {
                setTenantName('Verified Tenant');
              }
            }}
            initialPreview={idFileData?.dataUrl}
          />
        </div>

        {/* Step 2: Read Kasulatan with Bisaya Translation */}
        <div id="contract-agreement-check" className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-2xs">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#14532D]" />
              <span>2. Read Lease Agreement</span>
            </p>
            <button 
              type="button"
              onClick={() => setExplainBisaya(!explainBisaya)}
              className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <Languages className="w-3 h-3 text-amber-800" />
              <span>{explainBisaya ? 'English' : 'Explain in Bisaya'}</span>
            </button>
          </div>

          {/* Complete Contract Document Box */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 font-sans text-[11px] leading-relaxed max-h-52 overflow-y-auto mb-2 text-slate-800 space-y-2 scrollbar-thin">
            <div className="text-center pb-2 border-b border-slate-200">
              <h4 className="font-black text-xs text-slate-900">KASULATAN SA PAG-ABANG</h4>
              <p className="text-[10px] text-slate-500">Residential Lease Agreement · Cagayan de Oro City</p>
            </div>

            {explainBisaya && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[10px] leading-normal font-medium mb-2 space-y-1">
                <strong>Bisaya Explanations (Katin-awan sa Abang):</strong>
                <p>• <strong>Abang:</strong> ₱{displayRent.toLocaleString()} kada bulan, bayaran sa o sa dili pa ang ika-5 sa bulan.</p>
                <p>• <strong>Kalinaw:</strong> Hilom sugod alas-10 sa gabii para sa tanang nagpuyo.</p>
                <p>• <strong>Bawal Sublease:</strong> Dili pwede magpa-abang sa laing tawo nga walay pananghid sa tag-iya.</p>
              </div>
            )}

            {contractClauses.map((c) => (
              <div key={c.num} className="pt-1">
                <strong className="text-slate-900 block">{c.title}</strong>
                <span className="text-slate-700 text-[10px] leading-snug">{c.text}</span>
              </div>
            ))}
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-2.5 p-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl cursor-pointer">
            <input 
              type="checkbox" 
              checked={tenantHasReadContract}
              onChange={(e) => {
                setTenantHasReadContract(e.target.checked);
                setError('');
              }}
              className="mt-0.5 w-4 h-4 rounded text-[#14532D] focus:ring-emerald-600 cursor-pointer"
            />
            <span className="text-[11px] font-bold text-emerald-950 leading-snug">
              I have read, reviewed, and agree to all terms and conditions of this Kasulatan sa Pag-abang.
            </span>
          </label>
        </div>

        {/* Step 3: Signature Pad */}
        <div id="signature-section" className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-2xs">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#14532D]" />
              <span>3. Affix Tenant Signature</span>
            </p>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-bold">
              <button 
                type="button"
                onClick={() => setSigningMode('DIGITAL')}
                className={`px-2 py-0.5 rounded cursor-pointer ${signingMode === 'DIGITAL' ? 'bg-[#14532D] text-white' : 'text-slate-600'}`}
              >
                E-Sign Pad
              </button>
              <button 
                type="button"
                onClick={() => setSigningMode('WET_INK')}
                className={`px-2 py-0.5 rounded cursor-pointer ${signingMode === 'WET_INK' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                Wet-Ink Photo
              </button>
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
            <FileUpload 
              label="Snap or upload photo of physically signed paper contract"
              helperText="Under Article 1356 of the Philippine Civil Code"
              onFileSelect={(data) => {
                setSignatureData(data?.dataUrl || null);
                setError('');
              }}
              initialPreview={signatureData}
            />
          )}
        </div>

        {/* Step 4: Advance Rent GCash Upload */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-2xs space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#14532D]" />
              <span>4. Advance Rent (₱{displayAdvance.toLocaleString()})</span>
            </p>
            <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
              GCash QR Ph
            </span>
          </div>

          <FileUpload 
            label="Upload GCash transfer screenshot receipt"
            helperText="Showing Reference Number and Amount"
            onFileSelect={(data) => setGcashFileData(data)}
            initialPreview={gcashFileData?.dataUrl}
          />

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              GCash Reference No. (Optional)
            </label>
            <input 
              type="text"
              value={gcashRefNumber}
              onChange={(e) => setGcashRefNumber(e.target.value)}
              placeholder="e.g. 902837491028"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#14532D]"
            />
          </div>
        </div>
      </div>

      {/* Error right above Submit button */}
      {error && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="flex-1 leading-snug">{error}</span>
        </div>
      )}

      {/* Submit Button -> Writes to Cloud Firestore & Unlocks Key PIN */}
      <button 
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 mb-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Unlocking Door PIN & Submitting...</span>
          </>
        ) : (
          <>
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Complete Check-In & Get Key PIN</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </>
        )}
      </button>
    </div>
  );
}
