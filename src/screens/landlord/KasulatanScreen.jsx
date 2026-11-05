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
  ArrowRight
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
    setLandlordSignature
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
            onClick={() => setCurrentScreen('WIZARD_REVIEW')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Kasulatan Contract</h2>
          <div className="w-10"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={3} />

        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">LEGAL INSTRUMENT</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Kasulatan sa Abang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bilingual (English / Bisaya) enforceable rental contract clauses.
          </p>
        </div>

        {/* AI Customization Prompt Card */}
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
              placeholder="e.g. Add 10pm curfew or electric sub-meter rules" 
              className="flex-1 px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button 
              onClick={handleApplyAiCustomization}
              disabled={aiIsCustomizing || !aiCustomPrompt.trim()}
              className="px-3.5 py-2.5 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition cursor-pointer"
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

        {/* Clauses List */}
        <div className="space-y-3 mb-4">
          {contractClauses.map((clause, idx) => (
            <div 
              key={idx}
              className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-2 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {idx + 1}. {clause.title}
                </span>
                {clause.custom && (
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
                {clause.english}
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

        {/* Landlord Signature Section */}
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Lessor Signature</h3>
              <p className="text-[11px] text-slate-400">Sign digitally or choose physical wet-ink printing.</p>
            </div>
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

      </div>

      {/* Continue CTA */}
      <div className="pt-3 pb-2">
        <button 
          onClick={handleSmartCheck}
          disabled={isSaving}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <span>Run AI Smart Check</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
