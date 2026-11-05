import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import SignaturePad from '../../components/shared/SignaturePad';
import { 
  Home, 
  Sparkles, 
  Clock, 
  Send, 
  FileText, 
  Edit3, 
  Check, 
  ChevronLeft, 
  Plus, 
  Trash2,
  Loader2,
  Printer,
  PenTool,
  ShieldCheck
} from 'lucide-react';

export default function KasulatanScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    landlordName,
    contractClauses,
    setContractClauses,
    aiCustomPrompt,
    setAiCustomPrompt,
    aiIsCustomizing,
    aiUpdateToast,
    handleApplyAiCustomization,
    saveFinalizedContract,
    userRole,
    landlordSigningMode,
    setLandlordSigningMode,
    landlordSignature,
    setLandlordSignature
  } = useApp();

  const [showAddClause, setShowAddClause] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
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
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 105);
    ctx.lineTo(350, 105);
    ctx.stroke();
    const dataUrl = canvas.toDataURL('image/png');
    setLandlordSignature(dataUrl);
  };

  // Auto-scroll to bottom of clauses container when new clause is added
  useEffect(() => {
    if (contractClauses.length > 8) {
      clausesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [contractClauses.length]);

  const handleFinishAndSave = async () => {
    setIsSaving(true);
    await saveFinalizedContract();
    setIsSaving(false);
    setCurrentScreen('ALL_DONE');
  };

  const handleAddManualClause = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const nextNum = contractClauses.length + 1;
    const cleanTitle = newTitle.trim().replace(/^\d+\.\s*/, '');
    const newClause = {
      num: nextNum,
      title: `${nextNum}. ${cleanTitle}`,
      text: newText.trim()
    };

    setContractClauses([...contractClauses, newClause]);
    setNewTitle('');
    setNewText('');
    setShowAddClause(false);
  };

  const handleDeleteClause = (numToDelete) => {
    const updated = contractClauses
      .filter(c => c.num !== numToDelete)
      .map((c, idx) => ({
        ...c,
        num: idx + 1,
        title: c.title.replace(/^\d+\.\s*/, `${idx + 1}. `)
      }));
    setContractClauses(updated);
  };

  return (
    <div className="h-full flex flex-col justify-between max-w-lg mx-auto w-full overflow-hidden">
      {/* Scrollable Document Area - Never breaks viewport */}
      <div className="px-5 pt-3 pb-3 flex-1 overflow-y-auto min-h-0 scrollbar-none">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => setCurrentScreen(userRole === 'TENANT' ? 'TENANT_HOME' : 'WIZARD_REVIEW')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#EAB308] flex items-center justify-center shadow-xs">
              <Home className="w-4 h-4 text-emerald-950" />
            </div>
            <span className="text-xs font-black text-[#14532D]">Rent in Peace</span>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Stepper / Header Mode */}
        {userRole === 'TENANT' ? (
          <div className="flex items-center justify-between px-3 py-1 mb-2 text-[10px] font-bold text-[#14532D] bg-[#ECFDF5] border border-emerald-200 rounded-xl">
            <span>Official Rental Lease Agreement (Kasulatan)</span>
            <span className="font-mono">Certified</span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-bold">
            <span className="text-slate-400">Details</span>
            <span className="text-slate-400">Review</span>
            <span className="text-[#14532D] underline underline-offset-4 font-black">Contract</span>
            <span className="text-slate-400">Smart Check</span>
          </div>
        )}

        <div className="border-t border-slate-200 pt-2 mb-2.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RESIDENTIAL LEASE AGREEMENT</p>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">KASULATAN SA PAG-ABANG</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Prepared · {roomNumber || 'Residential Unit'}
          </p>
        </div>

        {/* AI Customization Toast Notification */}
        {aiUpdateToast && (
          <div className="mb-2.5 p-2 bg-emerald-100 border border-emerald-300 text-[#14532D] rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{aiUpdateToast}</span>
          </div>
        )}

        {/* Numbered Clauses Card - Fixed Contained Viewport */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs mb-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="font-bold text-xs text-slate-800">
              Contract Clauses ({contractClauses.length})
            </span>
            <button 
              type="button"
              onClick={() => setShowAddClause(!showAddClause)}
              className="text-[10px] bg-[#ECFDF5] text-[#14532D] hover:bg-emerald-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Custom Clause
            </button>
          </div>

          {showAddClause && (
            <form onSubmit={handleAddManualClause} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mb-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Clause Title</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Parking Privileges"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Clause Description / Terms</label>
                <textarea 
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. One motorcycle parking slot included at no additional charge."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  rows={2}
                  required
                />
              </div>
              <div className="flex justify-end gap-1.5">
                <button 
                  type="button" 
                  onClick={() => setShowAddClause(false)}
                  className="px-2 py-1 text-slate-500 font-bold text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1 bg-[#14532D] text-white rounded-md font-bold text-[10px]"
                >
                  Save Clause
                </button>
              </div>
            </form>
          )}

          {/* Internal scrollable viewport so screen height never expands */}
          <div className="max-h-[220px] sm:max-h-[250px] overflow-y-auto pr-1 space-y-2.5 divide-y divide-slate-100 text-xs text-slate-800 leading-relaxed font-sans scrollbar-thin">
            {contractClauses.map((clause) => (
              <div key={clause.num} className="pt-2 first:pt-0 flex items-start justify-between gap-2 group">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{clause.title}</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                    {clause.text}
                  </p>
                </div>
                {clause.num > 4 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteClause(clause.num)}
                    className="text-slate-300 hover:text-red-600 transition p-1 cursor-pointer shrink-0"
                    title="Remove clause"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <div ref={clausesEndRef} />
          </div>

          {contractClauses.length > 4 && (
            <div className="text-[9px] text-slate-400 font-medium pt-2 border-t border-slate-100 text-center">
              ↕ Scroll list inside card to review all {contractClauses.length} clauses
            </div>
          )}
        </div>

        {/* AI Clause Assistant Box Powered by Gemini (Landlord Only) */}
        {userRole !== 'TENANT' && (
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-emerald-300">Gemini AI Clause Customizer</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                gemini-3.5-flash
              </span>
            </div>

            <p className="text-[10px] text-slate-400 mb-2 leading-tight">
              Tap a quick prompt or type natural instructions to draft or adjust clauses:
            </p>

            {/* Quick AI Prompt Chips */}
            <div className="flex flex-wrap gap-1 mb-2.5">
              {[
                { label: '🚭 Strict No-Smoking', prompt: 'Add strict no-smoking policy with ₱1,000 penalty' },
                { label: '🐾 Small Pet Allowed', prompt: 'Allow 1 small pet with ₱1,500 deposit' },
                { label: '⚡ Sub-meter ₱15/kWh', prompt: 'Set electric sub-meter rate to ₱15/kWh read every 30th' },
                { label: '⏰ 5-Day Grace Period', prompt: 'Add 5-day grace period for rent payments with ₱50/day late penalty' },
                { label: '🇵🇭 Translate to Bisaya', prompt: 'Translate house rules into natural Bisaya for Cagayan de Oro' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleApplyAiCustomization(chip.prompt)}
                  disabled={aiIsCustomizing}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyAiCustomization()}
                placeholder="Ask Gemini (e.g. Add motorcycle parking, visitor curfew...)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button
                onClick={() => handleApplyAiCustomization()}
                disabled={aiIsCustomizing || !aiCustomPrompt.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {aiIsCustomizing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Lessor Execution & Signing Mode (Landlord) */}
        {userRole !== 'TENANT' ? (
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs mt-3 mb-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Lessor Signature & Execution (Nagpapaupa)
                </span>
                <span className="text-[10px] text-slate-500">
                  Select your legal execution method for this Kasulatan
                </span>
              </div>
              <span className="text-[9px] bg-emerald-100 text-[#14532D] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Philippine Law
              </span>
            </div>

            {/* Mode Selector Tabs: Digital E-Sign vs Wet-Ink Physical */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setLandlordSigningMode('DIGITAL')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  landlordSigningMode === 'DIGITAL'
                    ? 'border-[#14532D] bg-[#ECFDF5] text-[#14532D] shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
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
                  Draw or generate e-signature. Valid under RA 8792 E-Commerce Act.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLandlordSigningMode('WET_INK')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  landlordSigningMode === 'WET_INK'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <Printer className={`w-3.5 h-3.5 ${landlordSigningMode === 'WET_INK' ? 'text-amber-400' : 'text-slate-700'}`} />
                    <span>Wet-Ink Physical</span>
                  </span>
                  {landlordSigningMode === 'WET_INK' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </div>
                <p className={`text-[9.5px] leading-tight ${landlordSigningMode === 'WET_INK' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Print A4 copies to sign with ballpen. Valid under Civil Code Art. 1356.
                </p>
              </button>
            </div>

            {/* Mode Details & Controls */}
            {landlordSigningMode === 'DIGITAL' ? (
              <div className="space-y-2">
                <SignaturePad
                  onSave={(dataUrl) => setLandlordSignature(dataUrl)}
                  initialSignature={landlordSignature}
                />
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-[10px] text-slate-400">Draw with your finger, mouse, or stylus</span>
                  <button
                    type="button"
                    onClick={handleQuickLandlordSign}
                    className="text-[10px] bg-[#ECFDF5] hover:bg-emerald-100 text-[#14532D] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-2xs"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Sign with Legal Name</span>
                  </button>
                </div>
                {landlordSignature && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-[#14532D] font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                    <span>Your electronic signature is attached and will appear on the contract.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 space-y-2.5">
                <div className="flex items-start gap-2">
                  <Printer className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">Article 1356 Physical Execution (Wet-Ink)</h4>
                    <p className="text-[10px] text-amber-800 leading-snug mt-0.5">
                      The printed contract will feature an official blank signature line (_____________________) for your handwritten ballpen signature in the presence of 2 witnesses.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-amber-900 bg-white/70 p-2 rounded-lg border border-amber-200/60 space-y-1">
                  <p className="font-bold text-slate-800">Instructions for Wet-Ink Physical Signing:</p>
                  <p>1. Print 2 copies of this Kasulatan on standard Letter / A4 paper.</p>
                  <p>2. Sign both copies with dark ballpen above your printed name.</p>
                  <p>3. Have the tenant and two witnesses sign under 'Saksi'.</p>
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
          /* Tenant View: Landlord Execution Status */
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs mt-3 mb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#14532D]" />
                <span className="text-xs font-bold text-slate-900">Landlord Execution Status</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                landlordSigningMode === 'WET_INK' 
                  ? 'bg-amber-100 text-amber-900' 
                  : 'bg-emerald-100 text-[#14532D]'
              }`}>
                {landlordSigningMode === 'WET_INK' ? 'Physical Wet-Ink (Ballpen)' : 'Digital E-Sign'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {landlordSigningMode === 'WET_INK' 
                ? 'The landlord has prepared this contract for physical ballpen signing under Article 1356.'
                : 'The landlord has approved and digitally executed this contract under RA 8792.'}
            </p>
          </div>
        )}
      </div>

      {/* Docked Action Bar - Always pinned at bottom */}
      <div className="border-t border-slate-200 bg-white p-3 space-y-2 shrink-0 shadow-lg">
        {userRole === 'TENANT' ? (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => window.print()}
              className="py-3 px-3 bg-[#ECFDF5] border border-emerald-200 text-[#14532D] font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-[#14532D]" /> Save / Print PDF
            </button>
            <button 
              onClick={() => setCurrentScreen('TENANT_HOME')}
              className="py-3 px-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <span>Back to Tenant Dashboard</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => window.print()}
                className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <FileText className="w-4 h-4 text-[#14532D]" /> Save PDF
              </button>
              <button 
                onClick={() => setCurrentScreen('WIZARD_DETAILS')}
                className="py-2.5 px-3 bg-[#ECFDF5] rounded-xl text-xs font-bold text-[#14532D] flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-4 h-4 text-[#14532D]" /> Edit Terms
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setCurrentScreen('WIZARD_CHECK')}
                className="py-3 px-3 bg-[#ECFDF5] rounded-2xl text-xs font-bold text-[#14532D] flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" /> Smart Check
              </button>
              <button 
                onClick={handleFinishAndSave}
                disabled={isSaving}
                className="py-3 px-3 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-70 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Finish & Save'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
