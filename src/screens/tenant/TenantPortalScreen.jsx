import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Upload, 
  FileText, 
  Edit3, 
  QrCode, 
  KeyRound 
} from 'lucide-react';

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
    hasScannedId,
    setHasScannedId,
    tenantName,
    contractClauses,
    tenantHasReadContract,
    setTenantHasReadContract,
    signingMode,
    setSigningMode,
    hasSigned,
    setHasSigned,
    paymentUploaded,
    setPaymentUploaded
  } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-2">
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentScreen('TENANT_CODE_ENTRY')} className="p-1 -ml-1 text-[#14532D] cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-emerald-100 text-[#14532D] font-bold px-2 py-0.5 rounded-full">
              Tenant Check-In
            </span>
          </div>
        </div>

        {/* Unit Details Header Banner */}
        <div className="p-4 bg-[#14532D] text-white rounded-3xl shadow-md mb-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Code: {roomCodeInput || activeCode}
              </span>
              <h2 className="text-base font-black mt-1">Check-in: {roomNumber}</h2>
              <p className="text-[10px] text-emerald-200">{propertyAddress} · {propertyType}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-emerald-200 uppercase">Monthly Rent</p>
              <p className="text-lg font-black">₱{monthlyRent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Step 1: ID & Face Scan */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-xs">
          <p className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#14532D]" /> 1. ID & Biometrics (RA 10173 Protected)
          </p>
          {!hasScannedId ? (
            <button 
              onClick={() => setHasScannedId(true)}
              className="w-full py-2.5 bg-[#14532D] hover:bg-[#0f4022] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" /> Simulate Gemini ID & Selfie Scan
            </button>
          ) : (
            <div className="p-2.5 bg-[#DCFCE7] rounded-xl text-[11px] text-[#14532D] font-bold flex justify-between items-center">
              <span>✓ {tenantName} · PhilSys Verified</span>
              <span className="text-[9px] bg-[#14532D] text-white px-2 py-0.5 rounded-full">98% Match</span>
            </div>
          )}
        </div>

        {/* ====================================================
            STEP 2: FULL READABLE CONTRACT (KASULATAN SA PAG-ABANG)
            Addresses User Request: Full contract readable before signing!
        ==================================================== */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#14532D]" /> 2. Read Lease Agreement
            </p>
            <span className="text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Full Legal Text
            </span>
          </div>

          {/* Scrollable Complete Contract Document Box */}
          <div className="border border-slate-300/80 rounded-xl p-3 bg-slate-50 font-sans text-[11px] leading-relaxed max-h-56 overflow-y-auto mb-2 text-slate-800 space-y-2">
            <div className="text-center pb-2 border-b border-slate-200">
              <h4 className="font-black text-xs text-slate-900">KASULATAN SA PAG-ABANG</h4>
              <p className="text-[10px] text-slate-500">Residential Lease Contract · Cagayan de Oro City</p>
            </div>

            {contractClauses.map((c) => (
              <div key={c.num} className="pt-1">
                <strong className="text-slate-900 block">{c.title}</strong>
                <span className="text-slate-700 text-[10px] leading-snug">{c.text}</span>
              </div>
            ))}
          </div>

          {/* Mandatory Read & Agreement Checkbox */}
          <label className="flex items-start gap-2 p-1 cursor-pointer">
            <input 
              type="checkbox" 
              checked={tenantHasReadContract}
              onChange={(e) => setTenantHasReadContract(e.target.checked)}
              className="mt-0.5 rounded text-[#14532D] focus:ring-emerald-600"
            />
            <span className="text-[10px] font-medium text-slate-700 leading-tight">
              I have carefully read, reviewed, and agree to abide by all the clauses and house rules of this contract.
            </span>
          </label>
        </div>

        {/* Step 3: Signature Section */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#14532D]" /> 3. Affix Signature
            </p>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-bold">
              <button 
                onClick={() => setSigningMode('DIGITAL')}
                className={`px-2 py-0.5 rounded cursor-pointer ${signingMode === 'DIGITAL' ? 'bg-[#14532D] text-white' : 'text-slate-600'}`}
              >
                E-Sign
              </button>
              <button 
                onClick={() => setSigningMode('WET_INK')}
                className={`px-2 py-0.5 rounded cursor-pointer ${signingMode === 'WET_INK' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                Wet-Ink
              </button>
            </div>
          </div>

          {/* Signature Box */}
          {signingMode === 'DIGITAL' ? (
            <div 
              onClick={() => setHasSigned(!hasSigned)}
              className={`h-16 border-2 border-dashed rounded-xl bg-white flex items-center justify-center cursor-pointer transition ${
                hasSigned ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-300 hover:bg-slate-50'
              }`}
            >
              {hasSigned ? (
                <div className="text-center">
                  <span className="font-serif italic text-base text-[#14532D] font-bold">
                    ~ {tenantName} ~
                  </span>
                  <p className="text-[8px] text-emerald-700">Digitally Timestamped via SHA-256</p>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium">
                  Tap here to apply digital signature
                </span>
              )}
            </div>
          ) : (
            <div 
              onClick={() => setHasSigned(!hasSigned)}
              className="p-3 border border-slate-200 rounded-xl bg-slate-50 text-center cursor-pointer"
            >
              <p className="text-xs text-slate-700 font-bold">
                {hasSigned ? '✓ Signed physical Kasulatan uploaded' : '📷 Take photo of signed paper contract'}
              </p>
              <span className="text-[9px] text-slate-400">Civil Code Art. 1356 Paper Alternate</span>
            </div>
          )}
        </div>

        {/* Step 4: Advance Rent GCash Upload */}
        <div className="p-3 bg-white border border-slate-200/90 rounded-2xl mb-3 shadow-xs">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#14532D]" /> 4. Advance Rent (₱{advanceRent})
            </p>
            <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">GCash QR</span>
          </div>
          {!paymentUploaded ? (
            <button 
              onClick={() => setPaymentUploaded(true)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Simulate GCash Receipt Upload
            </button>
          ) : (
            <div className="p-2 bg-blue-50 text-blue-900 rounded-xl text-[10px] font-bold flex justify-between items-center">
              <span>✓ Ref: 902837491028 (₱{advanceRent}.00)</span>
              <span className="text-emerald-700">Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button -> Unlocks Key PIN */}
      <button 
        onClick={() => {
          if (!hasSigned) {
            alert("Please sign the contract first!");
            return;
          }
          setCurrentScreen('SUCCESS_PIN');
        }}
        disabled={!hasSigned}
        className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 mb-2 cursor-pointer"
      >
        <KeyRound className="w-4 h-4 text-amber-400" />
        <span>Complete Check-In & Get Key PIN</span>
        <ChevronRight className="w-4 h-4 ml-0.5" />
      </button>
    </div>
  );
}
