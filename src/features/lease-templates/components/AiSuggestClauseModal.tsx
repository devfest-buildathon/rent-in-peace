import React, { useState } from 'react';
import { suggestClauseWithGemini, AI_DISCLAIMER_NOTE, GeneratedClauseDraft } from '../aiClauseHelper';
import { Sparkles, Loader2, AlertCircle, RefreshCw, Check, X, ShieldAlert } from 'lucide-react';

interface AiSuggestClauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (clause: { title: string; english: string; bisaya: string }) => void;
}

export default function AiSuggestClauseModal({
  isOpen,
  onClose,
  onAccept
}: AiSuggestClauseModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<GeneratedClauseDraft | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please type what kind of rule or clause you want.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await suggestClauseWithGemini(prompt);
      setDraft(result);
    } catch (err) {
      // Clear error display with Retry; NO fake fallback text
      setError((err as Error).message || 'Failed to communicate with Gemini AI. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!draft) return;
    onAccept({
      title: draft.title.trim(),
      english: draft.english.trim(),
      bisaya: draft.bisaya.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200/80 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-[#14532D] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Gemini Clause Assistant</h3>
              <p className="text-[10px] text-emerald-200">
                Draft custom bilingual lease clauses in plain language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Statutory Disclaimer & Enforceability Notice */}
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900 leading-snug">
              <span className="font-bold">Important Notice: </span>
              {AI_DISCLAIMER_NOTE}
            </div>
          </div>

          {/* User Prompt Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              What clause would you like to draft?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                disabled={isLoading}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
                placeholder="e.g. Strict no pets policy with cleaning fee, or quiet hours after 9pm"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="px-4 py-2.5 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                <span>{draft ? 'Re-draft' : 'Draft'}</span>
              </button>
            </div>
          </div>

          {/* Error Message with Retry */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-bold">AI Generation Error</span>
              </div>
              <p className="text-[11px] text-red-600 pl-6 leading-relaxed">{error}</p>
              <div className="pl-6 pt-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry AI Request</span>
                </button>
              </div>
            </div>
          )}

          {/* Editable Draft Preview (Landlord must review and edit before accepting) */}
          {draft && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Editable AI Draft (Review before accepting)
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  Requires Landlord Approval
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Clause Title</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">English Text</label>
                <textarea
                  rows={3}
                  value={draft.english}
                  onChange={(e) => setDraft({ ...draft, english: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bisaya Translation</label>
                <textarea
                  rows={3}
                  value={draft.bisaya}
                  onChange={(e) => setDraft({ ...draft, bisaya: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
                />
              </div>

              <p className="text-[10px] text-slate-500 italic">
                * Review and edit the wording freely. Clicking &quot;Accept &amp; Insert&quot; will add this clause to your preset. It is never inserted automatically.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!draft}
            onClick={handleAccept}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept &amp; Insert Clause</span>
          </button>
        </div>
      </div>
    </div>
  );
}
