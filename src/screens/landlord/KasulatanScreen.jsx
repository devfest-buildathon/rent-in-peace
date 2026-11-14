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
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Plus,
  Languages,
  ArrowUp,
  ArrowDown,
  Edit3,
  X,
  SlidersHorizontal,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

export default function KasulatanScreen() {
  const { 
    navigateBack,
    setCurrentScreen,
    landlordName,
    contractClauses,
    setContractClauses,
    aiCustomPrompt,
    setAiCustomPrompt,
    aiIsCustomizing,
    aiUpdateToast,
    setAiUpdateToast,
    aiError,
    setAiError,
    handleApplyAiCustomization,
    handleAddDirectCustomClause,
    generateKasulatanFromScratch,
    updateSingleClause,
    removeSingleClause,
    moveSingleClause,
    selectedPresetId,
    applyPreset,
    availablePresets,
    saveFinalizedContract,
    landlordSignature,
    setLandlordSignature,
    landlordSigningMode,
    setLandlordSigningMode,
    selectedTenant,
    userRole
  } = useApp();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [languageMode, setLanguageMode] = useState('bilingual'); // 'bilingual', 'english', 'bisaya'
  const clausesEndRef = useRef(null);

  // AI Create from Scratch Modal State
  const [showAiScratchModal, setShowAiScratchModal] = useState(false);
  const [scratchPrompt, setScratchPrompt] = useState('');
  const [isGeneratingScratch, setIsGeneratingScratch] = useState(false);
  const [scratchError, setScratchError] = useState('');

  // Template Picker Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Edit Clause Modal State
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editEnglish, setEditEnglish] = useState('');
  const [editBisaya, setEditBisaya] = useState('');

  // Add Clause Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newBisaya, setNewBisaya] = useState('');

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

  const handleStartEditClause = (idx, clause) => {
    setEditingIndex(idx);
    setEditTitle((clause.title || '').replace(/^\d+\.\s*/, ''));
    setEditEnglish(clause.english || clause.text || '');
    setEditBisaya(clause.bisaya || '');
  };

  const handleSaveEditedClause = () => {
    if (editingIndex === null) return;
    const cleanTitle = editTitle.trim() || `Clause ${editingIndex + 1}`;
    updateSingleClause(editingIndex, {
      num: editingIndex + 1,
      title: `${editingIndex + 1}. ${cleanTitle}`,
      english: editEnglish.trim(),
      bisaya: editBisaya.trim(),
      text: editEnglish.trim() || editBisaya.trim()
    });
    setEditingIndex(null);
    setAiUpdateToast(`Updated Clause ${editingIndex + 1}`);
    setTimeout(() => setAiUpdateToast(''), 3000);
  };

  const handleAddNewClause = () => {
    if (!newTitle.trim()) return;
    const nextNum = contractClauses.length + 1;
    const cleanTitle = newTitle.trim();
    const clauseObj = {
      num: nextNum,
      title: `${nextNum}. ${cleanTitle}`,
      english: newEnglish.trim(),
      bisaya: newBisaya.trim(),
      text: newEnglish.trim() || newBisaya.trim(),
      custom: true,
      isCustom: true
    };
    setContractClauses([...contractClauses, clauseObj]);
    setNewTitle('');
    setNewEnglish('');
    setNewBisaya('');
    setShowAddModal(false);
    setAiUpdateToast('Added new clause to Kasulatan');
    setTimeout(() => setAiUpdateToast(''), 3000);
  };

  const handleGenerateFromScratch = async () => {
    if (!scratchPrompt.trim()) {
      setScratchError('Please specify the rules, terms, or conditions you want.');
      return;
    }

    setIsGeneratingScratch(true);
    setScratchError('');
    try {
      const res = await generateKasulatanFromScratch(scratchPrompt);
      if (res.success) {
        setShowAiScratchModal(false);
        setScratchPrompt('');
      } else {
        setScratchError(res.error || 'Failed to generate Kasulatan with AI.');
      }
    } catch (e) {
      setScratchError(e.message || 'AI request failed.');
    } finally {
      setIsGeneratingScratch(false);
    }
  };

  const handleSelectTemplate = (presetId) => {
    applyPreset(presetId);
    setShowTemplateModal(false);
    setAiUpdateToast('Template applied with current property values!');
    setTimeout(() => setAiUpdateToast(''), 3500);
  };

  const handleSaveAndPreview = async () => {
    setSaveError('');
    if (landlordSigningMode === 'DIGITAL' && !landlordSignature) {
      setSaveError('Please draw your signature below or tap Auto-Sign before saving.');
      return;
    }
    setIsSaving(true);
    try {
      await saveFinalizedContract();
      // Navigate straight to Kasulatan preview page with PDF download and share link (Requirement 3 & 8)
      setCurrentScreen('ALL_DONE');
    } catch (err) {
      setSaveError(err.message || 'Failed to save Kasulatan.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalClauses = contractClauses.length;
  const isA4Optimal = totalClauses >= 6 && totalClauses <= 8;

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
          <h2 className="text-sm font-bold text-slate-900">Kasulatan Contract</h2>
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-2xs overflow-hidden">
            <img src="/assets/logo-icon.png" alt="Rent in Peace" className="w-full h-full object-contain rounded-xl" />
          </div>
        </div>

        {/* Stepper / Mode Header */}
        {userRole === 'TENANT' ? (
          <div className="flex items-center justify-between px-3 py-1.5 mb-3 text-[11px] font-bold text-[#14532D] bg-[#ECFDF5] border border-emerald-200 rounded-2xl">
            <span>Official Residential Lease Agreement (Kasulatan)</span>
            <span className="font-mono text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">Certified</span>
          </div>
        ) : selectedTenant ? (
          <div className="flex items-center justify-between px-3 py-1.5 mb-3 text-[11px] font-bold text-[#14532D] bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span>Viewing Signed Kasulatan sa Abang</span>
            <span className="font-mono text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded-full">Archived</span>
          </div>
        ) : (
          <StepIndicator currentStep={3} />
        )}

        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">LEGAL INSTRUMENT</span>
            {/* A4 Paper Fit Badge */}
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
              isA4Optimal 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              <FileCheck className="w-3 h-3" />
              <span>A4 Bond Paper Fit ({totalClauses} Clauses)</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Kasulatan sa Abang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Civil Code &amp; Rent Control Act compliant residential lease agreement.
          </p>
        </div>

        {/* Landlord Action Bar: AI Scratch Generator & Template Switcher (Landlord Only) */}
        {userRole !== 'TENANT' && !selectedTenant && (
          <div className="mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Option 1: Create from Scratch with AI */}
              <button
                type="button"
                onClick={() => {
                  setScratchError('');
                  setShowAiScratchModal(true);
                }}
                className="p-3 rounded-2xl bg-gradient-to-r from-[#14532D] via-[#047857] to-[#10b981] text-white shadow-xs hover:opacity-95 transition cursor-pointer flex flex-col justify-between text-left"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Gemini AI</span>
                  </span>
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-md font-bold">A4 Bond Fit</span>
                </div>
                <h3 className="text-xs font-black">Draft from Scratch</h3>
                <p className="text-[10px] text-emerald-100 mt-0.5 leading-tight">
                  Type your rules; AI generates the complete paper
                </p>
              </button>

              {/* Option 2: Apply Template / Preset */}
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="p-3 rounded-2xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:border-emerald-600 transition cursor-pointer flex flex-col justify-between text-left"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#14532D]" />
                    <span>Templates</span>
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-bold">Reusable</span>
                </div>
                <h3 className="text-xs font-black truncate">
                  {(availablePresets || []).find(p => p.id === selectedPresetId)?.name || 'Choose Preset'}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Bedspace, Private Room, Apartment
                </p>
              </button>
            </div>

            {/* Quick Single Clause AI Tweaker */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={aiCustomPrompt} 
                  onChange={(e) => { setAiCustomPrompt(e.target.value); setAiError(''); }} 
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyAiCustomization()}
                  placeholder="Ask AI to add or tweak a single rule (e.g. 10pm curfew)" 
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button 
                  type="button"
                  onClick={() => handleApplyAiCustomization()}
                  disabled={aiIsCustomizing || !aiCustomPrompt.trim()}
                  className="px-3 py-2 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  {aiIsCustomizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3 h-3" />}
                  <span>Add</span>
                </button>
              </div>

              {aiError && (
                <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                  <span>{aiError}</span>
                  <button
                    type="button"
                    onClick={() => handleApplyAiCustomization()}
                    className="text-[11px] font-bold text-red-700 underline cursor-pointer ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {aiUpdateToast && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-1.5 shadow-2xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                <span>{aiUpdateToast}</span>
              </div>
            )}
          </div>
        )}

        {/* Bilingual Language Control Bar & Add Clause */}
        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Languages className="w-4 h-4 text-[#14532D]" />
            <span>Language:</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setLanguageMode('bilingual')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  languageMode === 'bilingual' ? 'bg-[#14532D] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Both
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('english')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  languageMode === 'english' ? 'bg-[#14532D] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('bisaya')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  languageMode === 'bisaya' ? 'bg-[#14532D] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bisaya
              </button>
            </div>

            {userRole !== 'TENANT' && !selectedTenant && (
              <button
                type="button"
                onClick={() => {
                  setNewTitle('');
                  setNewEnglish('');
                  setNewBisaya('');
                  setShowAddModal(true);
                }}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#14532D] font-bold text-[11px] rounded-xl border border-emerald-300 flex items-center gap-1 cursor-pointer transition"
                title="Add custom clause"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Clause</span>
              </button>
            )}
          </div>
        </div>

        {/* Clauses List (100% Fully Editable, Deletable, and Reorderable) */}
        <div className="space-y-3 mb-4">
          {contractClauses.map((clause, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === contractClauses.length - 1;

            return (
              <div 
                key={clause.id || idx}
                className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-2 relative group hover:border-emerald-300 transition"
              >
                {/* Clause Header & Action Toolbar */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-900">
                    {idx + 1}. {(clause.title || '').replace(/^\d+\.\s*/, '')}
                  </span>

                  {userRole !== 'TENANT' && !selectedTenant && (
                    <div className="flex items-center gap-1">
                      {/* Reorder Up */}
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => moveSingleClause(idx, idx - 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => moveSingleClause(idx, idx + 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Clause Button */}
                      <button 
                        type="button"
                        onClick={() => handleStartEditClause(idx, clause)}
                        className="p-1 text-[#14532D] hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Edit Clause Text"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Clause Button (Allowed on ALL clauses) */}
                      <button 
                        type="button"
                        onClick={() => removeSingleClause(idx)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded-lg transition cursor-pointer"
                        title="Remove Clause"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* English Version */}
                {(languageMode === 'bilingual' || languageMode === 'english') && (
                  <p className="text-xs text-slate-800 leading-relaxed font-normal">
                    {clause.english || clause.text}
                  </p>
                )}

                {/* Bisaya Version */}
                {(languageMode === 'bilingual' || languageMode === 'bisaya') && clause.bisaya && (
                  <div className={`text-xs text-emerald-950 leading-relaxed bg-[#ECFDF5]/70 p-2.5 rounded-xl border border-emerald-200/60 ${
                    languageMode === 'bilingual' ? 'mt-2' : ''
                  }`}>
                    {languageMode === 'bilingual' && (
                      <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                        Sinugbuanong Binisaya:
                      </span>
                    )}
                    <p className="italic text-slate-700">{clause.bisaya}</p>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={clausesEndRef} />
        </div>

        {/* Landlord Signature & Execution Mode Section (Drafting View) */}
        {userRole !== 'TENANT' && !selectedTenant ? (
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Lessor Signature &amp; Execution</h3>
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

            {/* Signature Draw / Auto-Sign Container */}
            {landlordSigningMode === 'DIGITAL' && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Affix Lessor Signature:</span>
                  <button
                    type="button"
                    onClick={handleQuickLandlordSign}
                    className="text-[11px] font-bold text-[#14532D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Auto-Sign with Legal Name</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <SignaturePad 
                    onSave={(dataUrl) => setLandlordSignature(dataUrl)} 
                    initialData={landlordSignature}
                  />
                </div>
                {landlordSignature && (
                  <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Signature recorded</span>
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Execution Status */
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

        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 mb-4 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
      </div>

      {/* Footer CTA Bar */}
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
        ) : selectedTenant ? (
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
              onClick={() => setCurrentScreen('TENANT_DETAIL')}
              className="py-3.5 px-3 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Back to Tenant</span>
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
              <span>Print A4 PDF</span>
            </button>

            <button 
              type="button"
              onClick={handleSaveAndPreview}
              disabled={isSaving}
              className="py-3.5 px-3 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save Kasulatan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL: DRAFT FROM SCRATCH WITH AI ================= */}
      {showAiScratchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-900 to-[#14532D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Create Kasulatan from Scratch (AI)</h3>
                  <p className="text-[10px] text-emerald-200">Strictly fitted to single-page A4 bond paper</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiScratchModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe your boarding house rules, curfews, payment terms, and utility split. Gemini will draft all 6–8 tailored bilingual clauses to fit cleanly on a single A4 bond paper.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Your Property Rules &amp; Lease Terms
                </label>
                <textarea
                  rows={4}
                  value={scratchPrompt}
                  onChange={(e) => setScratchPrompt(e.target.value)}
                  placeholder="e.g. 4-person bedspace room. Quiet hours start at 10 PM. Sub-meter electricity billed monthly. Visitors allowed in lobby until 8 PM only, strictly no overnight guests. 1 month advance, 1 month deposit. 30 days notice before moving out."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
                />
              </div>

              {/* Quick Prompt Chips */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Quick Add Provisions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '10 PM Quiet Hours & Curfew',
                    'Electric Sub-meter Billing',
                    'No Overnight Guests',
                    'Strict No Pets & No Smoking',
                    '1 Month Deposit + 1 Month Advance',
                    '30 Days Move-Out Notice',
                    'Weekly CR Sanitation Duty'
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setScratchPrompt(prev => prev ? `${prev}. ${chip}` : chip)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#14532D] border border-emerald-200 rounded-lg text-[10.5px] font-semibold cursor-pointer transition"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {scratchError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scratchError}</span>
                </div>
              )}

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[10.5px] text-emerald-950 leading-snug">
                <span className="font-bold">A4 Bond Paper Guarantee: </span>
                Gemini will craft 6 to 8 concise clauses in both English and Bisaya sized so the resulting Kasulatan prints cleanly on 1 page without spilling onto page 2.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowAiScratchModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGeneratingScratch || !scratchPrompt.trim()}
                onClick={handleGenerateFromScratch}
                className="px-5 py-2.5 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                {isGeneratingScratch ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Kasulatan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate Complete Kasulatan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHOOSE TEMPLATE / PRESET ================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Select Kasulatan Template</h3>
                <p className="text-[10px] text-slate-400">Replaces current clauses with template rules</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2">
              {(availablePresets || []).map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectTemplate(preset.id)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#14532D] bg-[#ECFDF5] text-[#14532D] ring-1 ring-[#14532D] shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-emerald-400 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                        {preset.isBuiltIn && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                            Built-in
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{preset.description}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#14532D] shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CLAUSE ================= */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Edit Clause {editingIndex + 1}</h3>
                <p className="text-[10px] text-slate-400">Customize the English text and Bisaya translation</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Clause Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">English Clause Text</label>
                <textarea
                  rows={3}
                  value={editEnglish}
                  onChange={(e) => setEditEnglish(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Sinugbuanong Binisaya Translation</label>
                <textarea
                  rows={3}
                  value={editBisaya}
                  onChange={(e) => setEditBisaya(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedClause}
                className="px-5 py-2 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Save Clause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CLAUSE ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Add New Clause</h3>
                <p className="text-[10px] text-slate-400">Append a custom condition to the Kasulatan</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Clause Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Garbage Disposal & Recycling"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">English Clause Text</label>
                <textarea
                  rows={3}
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  placeholder="Enter clause in English..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Sinugbuanong Binisaya Translation</label>
                <textarea
                  rows={3}
                  value={newBisaya}
                  onChange={(e) => setNewBisaya(e.target.value)}
                  placeholder="Ibutang ang hubad sa Bisaya..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newTitle.trim()}
                onClick={handleAddNewClause}
                className="px-5 py-2 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Insert Clause
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
