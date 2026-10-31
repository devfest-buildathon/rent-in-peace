import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Sparkles, Clock, Send, FileText, Edit3, Check } from 'lucide-react';

export default function KasulatanScreen() {
  const { 
    setCurrentScreen,
    roomNumber,
    contractClauses,
    aiCustomPrompt,
    setAiCustomPrompt,
    aiIsCustomizing,
    aiUpdateToast,
    handleApplyAiCustomization
  } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Scrollable Document Area */}
      <div className="px-5 pt-2 pb-4 flex-1">
        {/* Stepper */}
        <div className="flex items-center justify-between px-2 mb-3 text-[10px] font-bold">
          <span className="text-slate-400">Details</span>
          <span className="text-slate-400">Review</span>
          <span className="text-[#14532D] underline underline-offset-4 font-black">Contract</span>
          <span className="text-slate-400">Check</span>
        </div>

        {/* Logo & Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#EAB308] flex items-center justify-center shadow-xs">
            <Home className="w-5 h-5 text-emerald-950" />
          </div>
          <span className="text-sm font-black">
            <span className="text-[#14532D]">Rent in </span>
            <span className="text-[#047857]">Peace</span>
          </span>
        </div>

        <div className="border-t border-slate-200 pt-3 mb-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RESIDENTIAL LEASE AGREEMENT</p>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">KASULATAN SA PAG-ABANG</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Prepared 2026-10-31 · {roomNumber}</p>
        </div>

        {/* AI Customization Toast Notification */}
        {aiUpdateToast && (
          <div className="mb-3 p-2.5 bg-emerald-100 border border-emerald-300 text-[#14532D] rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{aiUpdateToast}</span>
          </div>
        )}

        {/* Numbered Clauses (1:1 with Pia's Image 5) */}
        <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-sans bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          {contractClauses.map((clause) => (
            <div key={clause.num} className="pb-2 border-b border-slate-100 last:border-b-0 last:pb-0">
              <h3 className="font-bold text-slate-900">{clause.title}</h3>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                {clause.text}
              </p>
            </div>
          ))}
        </div>

        {/* ====================================================
            JUSTINE'S AI CONTRACT CUSTOMIZER (System Prompt Box)
        ==================================================== */}
        <div className="mt-4 p-3.5 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-emerald-300">Gemini AI Contract Customizer</span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              Justine's Feature
            </span>
          </div>

          <p className="text-[10px] text-slate-400 mb-2 leading-tight">
            Type instructions to customize legal terms or tap quick prompts:
          </p>

          {/* Quick AI Prompt Chips */}
          <div className="flex flex-wrap gap-1 mb-2.5">
            {[
              { label: '🚭 Strict No-Smoking', prompt: 'Add strict no-smoking policy with penalty' },
              { label: '🐾 Small Pet Allowed', prompt: 'Allow 1 small pet with ₱1,500 deposit' },
              { label: '⚡ Sub-meter ₱15/kWh', prompt: 'Set electric sub-meter rate to ₱15/kWh' },
              { label: '⏰ 5-Day Grace Period', prompt: 'Add 5-day grace period for rent payments' },
              { label: '🇵🇭 Translate to Bisaya', prompt: 'Translate house rules to Bisaya' },
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
              placeholder="e.g. Add ₱100/day late penalty fee..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button
              onClick={() => handleApplyAiCustomization()}
              disabled={aiIsCustomizing || !aiCustomPrompt.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
            >
              {aiIsCustomizing ? <Clock className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>{aiIsCustomizing ? 'AI Updating...' : 'Apply'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Docked Action Bar (1:1 with Pia's Image 5: Save PDF, Edit Paper, Smart Check, Finish & Sign) */}
      <div className="border-t border-slate-200 bg-white p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => window.print()}
            className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#14532D]" /> Save PDF
          </button>
          <button 
            onClick={() => setCurrentScreen('WIZARD_DETAILS')}
            className="py-2.5 px-3 bg-[#ECFDF5] rounded-xl text-xs font-bold text-[#14532D] flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-[#14532D]" /> Edit Paper
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
            onClick={() => setCurrentScreen('ALL_DONE')}
            className="py-3 px-3 bg-[#14532D] hover:bg-[#0f4022] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Check className="w-4 h-4" /> Finish & Sign
          </button>
        </div>
      </div>
    </div>
  );
}
