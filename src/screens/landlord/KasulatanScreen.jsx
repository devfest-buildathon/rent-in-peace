import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import SignaturePad from '../../components/shared/SignaturePad';
import { 
  Sparkles, 
  Send, 
  Check, 
  ChevronLeft, 
  Trash2, 
  Loader2, 
  ArrowRight,
  Printer,
  PenTool,
  FileText,
  Edit3,
  ShieldCheck
} from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

export default function KasulatanScreen() {
  const { 
    setCurrentScreen,
    landlordName,
    contractClauses,
    setContractClauses,
    aiCustomPrompt,
    setAiCustomPrompt,
    aiIsCustomizing,
    aiUpdateToast,
    handleApplyAiCustomization,
    saveFinalizedContract,
    landlordSignature,
    setLandlordSignature,
    landlordSigningMode,
    setLandlordSigningMode,
    userRole
  } = useApp();

  const [isSaving, setIsSaving] = useState(false);
  const clausesEndRef = useRef(null);

  // Quick signature generator using landlord's legal name
  const handleQuickLandlordSign = () => {
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
    ctx.fillText(`~ ${landlordName || 'Landlord Signature'} ~`, 200, 75);
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 110);
    ctx.lineTo(340, 110);
    ctx.stroke();
    setLandlordSignature(canvas.toDataURL('image/png'));
  };

  const handleRemoveClause = (indexToRemove) => {
    setContractClauses(contractClauses.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSmartCheck = async () => {
    setIsSaving(true);
    await saveFinalizedContract();
    setIsSaving(false);
    setCurrentScreen('WIZARD_CHECK');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen(userRole === 'TENANT' ? 'TENANT_HOME' : 'WIZARD_REVIEW')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Kasulatan Contract</h2>
          <div className="w-10"></div>
        </div>

        {/* Stepper / Mode Header */}
        {userRole === 'TENANT' ? (
          <div className="flex items-center justify-between px-3 py-1.5 mb-3 text-[11px] font-bold text-[#14532D] bg-[#ECFDF5] border border-emerald-200 rounded-2xl">
            <span>Official Rental Lease Agreement (Kasulatan)</span>
            <span className="font-mono text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">Certified</span>
          </div>
        ) : (
          <StepIndicator currentStep={3} />
        )}

        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">LEGAL INSTRUMENT</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Kasulatan sa Abang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bilingual (English / Bisaya) legally grounded rental contract clauses for CDO.
          </p>
        </div>

        {/* AI Customization Prompt Card (Landlord Only) */}
        {userRole !== 'TENANT' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl mb-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#14532D] text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span className="text-xs font-bold text-[#14532D]">AI Contract Clause Assistant</span>
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={aiCustomPrompt} 
                onChange={(e) => setAiCustomPrompt(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleApplyAiCustomization()}
                placeholder="e.g. Add 10pm curfew or electric sub-meter rules" 
                className="flex-1 px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button 
                onClick={() => handleApplyAiCustomization()}
                disabled={aiIsCustomizing || !aiCustomPrompt.trim()}
                className="px-3.5 py-2.5 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition cursor-pointer shrink-0"
              >
                {aiIsCustomizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Apply</span>
              </button>
            </div>

            {aiUpdateToast && (
              <p className="text-[11px] font-bold text-emerald-800 mt-2 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{aiUpdateToast}</span>
              </p>
            )}
          </div>
        )}

        {/* Clauses List */}
        <div className="space-y-3 mb-4">
          {contractClauses.map((clause, idx) => (
            <div 
              key={idx}
              className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-2 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {idx + 1}. {(clause.title || '').replace(/^\d+\.\s*/, '')}
                </span>
                {clause.custom && userRole !== 'TENANT' && (
                  <button 
                    onClick={() => handleRemoveClause(idx)}
                    className="text-slate-300 hover:text-red-500 transition cursor-pointer"
                    title="Remove custom clause"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {clause.text || clause.english}
              </p>

              {clause.bisaya && (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  <span className="font-bold not-italic text-[#14532D]">Bisaya: </span>
                  {clause.bisaya}
                </div>
              )}
            </div>
          ))}
          <div ref={clausesEndRef} />
        </div>

        {/* Landlord Signature & Execution Mode Section (Landlord View) */}
        {userRole !== 'TENANT' ? (
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Lessor Signature & Execution</h3>
                <p className="text-[11px] text-slate-400">Choose between paperless digital e-sign or physical wet-ink print.</p>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-[#14532D] px-2 py-0.5 rounded-full border border-emerald-200">
                Philippine Law
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLandlordSigningMode('DIGITAL')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  landlordSigningMode === 'DIGITAL'
                    ? 'border-[#14532D] bg-[#ECFDF5] text-[#14532D] shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Digital E-Sign</span>
                  </span>
                  {landlordSigningMode === 'DIGITAL' && (
                    <span className="w-2 h-2 rounded-full bg-[#14532D]"></span>
                  )}
                </div>
                <p className="text-[9.5px] leading-tight text-slate-500">
                  Affix signature on screen. Valid under RA 8792 E-Commerce Act.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLandlordSigningMode('WET_INK')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  landlordSigningMode === 'WET_INK'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <Printer className={`w-3.5 h-3.5 ${landlordSigningMode === 'WET_INK' ? 'text-amber-400' : 'text-slate-600'}`} />
                    <span>Wet-Ink Physical</span>
                  </span>
                  {landlordSigningMode === 'WET_INK' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </div>
                <p className={`text-[9.5px] leading-tight ${landlordSigningMode === 'WET_INK' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Print A4 copies to sign with ballpen. Civil Code Art. 1356.
                </p>
              </button>
            </div>

            {/* Mode Controls */}
            {landlordSigningMode === 'DIGITAL' ? (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">Draw signature below:</span>
                  <button 
                    type="button"
                    onClick={handleQuickLandlordSign}
                    className="px-2.5 py-1 bg-emerald-50 text-[#14532D] font-bold text-[10px] rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                  >
                    Auto-Sign
                  </button>
                </div>
                <SignaturePad 
                  value={landlordSignature}
                  onChange={setLandlordSignature}
                />
              </div>
            ) : (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-950 space-y-2 mt-1">
                <div className="flex items-start gap-2">
                  <Printer className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">Article 1356 Physical Execution</h4>
                    <p className="text-[10px] text-amber-800 leading-snug mt-0.5">
                      On the printed A4 Kasulatan, a clean blank line (_____________________) will be prepared for your handwritten ballpen signature in the presence of 2 witnesses.
                    </p>
                  </div>
                </div>

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
        ) : (
          /* Tenant View: Execution Status */
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Execution Status</p>
                <p className="text-[10px] text-slate-400">
                  {landlordSigningMode === 'WET_INK' ? 'Prepared for Physical Ballpen Signing' : 'Electronically Signed & Verified'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              landlordSigningMode === 'WET_INK' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-[#14532D]'
            }`}>
              {landlordSigningMode === 'WET_INK' ? 'Wet-Ink' : 'Digital E-Sign'}
            </span>
          </div>
        )}

      </div>

      {/* Action CTA Bar */}
      <div className="pt-3 pb-2">
        {userRole === 'TENANT' ? (
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button"
              onClick={() => window.print()}
              className="py-3.5 px-3 bg-white border border-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-[#14532D]" />
              <span>Save / Print PDF</span>
            </button>
            <button 
              type="button"
              onClick={() => setCurrentScreen('TENANT_HOME')}
              className="py-3.5 px-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button"
              onClick={() => window.print()}
              className="py-3.5 px-3 bg-white border border-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-[#14532D]" />
              <span>Save PDF</span>
            </button>

            <button 
              type="button"
              onClick={handleSmartCheck}
              disabled={isSaving}
              className="py-3.5 px-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <span>Smart Check</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
