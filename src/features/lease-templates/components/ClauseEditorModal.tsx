import React, { useState, useRef } from 'react';
import { LeaseClause } from '../types';
import PlaceholderPicker from './PlaceholderPicker';
import { X, AlertTriangle, Check, Sparkles } from 'lucide-react';

interface ClauseEditorModalProps {
  isOpen: boolean;
  clause?: LeaseClause | null;
  onSave: (clauseData: { title: string; english: string; bisaya: string }) => void;
  onClose: () => void;
  onOpenAiSuggest?: () => void;
}

export default function ClauseEditorModal({
  isOpen,
  clause,
  onSave,
  onClose,
  onOpenAiSuggest
}: ClauseEditorModalProps) {
  const [title, setTitle] = useState(clause?.title || '');
  const [english, setEnglish] = useState(clause?.english || '');
  const [bisaya, setBisaya] = useState(clause?.bisaya || '');
  const [activeField, setActiveField] = useState<'english' | 'bisaya'>('english');
  const [validationError, setValidationError] = useState('');

  const englishInputRef = useRef<HTMLTextAreaElement>(null);
  const bisayaInputRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const isEnglishEmpty = !english.trim();
  const isBisayaEmpty = !bisaya.trim();

  const handleInsertPlaceholder = (placeholder: string) => {
    if (activeField === 'english') {
      const el = englishInputRef.current;
      if (el) {
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const updated = english.substring(0, start) + placeholder + english.substring(end);
        setEnglish(updated);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + placeholder.length, start + placeholder.length);
        }, 50);
      } else {
        setEnglish((prev) => (prev ? `${prev} ${placeholder}` : placeholder));
      }
    } else {
      const el = bisayaInputRef.current;
      if (el) {
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const updated = bisaya.substring(0, start) + placeholder + bisaya.substring(end);
        setBisaya(updated);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + placeholder.length, start + placeholder.length);
        }, 50);
      } else {
        setBisaya((prev) => (prev ? `${prev} ${placeholder}` : placeholder));
      }
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setValidationError('Please provide a title for this clause.');
      return;
    }
    if (isEnglishEmpty && isBisayaEmpty) {
      setValidationError('Please enter clause text in at least one language.');
      return;
    }

    setValidationError('');
    onSave({
      title: title.trim(),
      english: english.trim(),
      bisaya: bisaya.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-200/80 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {clause ? 'Edit Lease Clause' : 'Add New Lease Clause'}
            </h3>
            <p className="text-[11px] text-slate-400">
              Support both English and Bisaya for bilingual Kasulatan sa Abang.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Clause Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clause Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visitors & Curfew Policy"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            />
          </div>

          {/* Placeholders Picker Toolbar */}
          <PlaceholderPicker
            onInsert={handleInsertPlaceholder}
            targetFieldLabel={activeField === 'english' ? 'English text' : 'Bisaya text'}
          />

          {/* English Version */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span>English Clause Text</span>
                <span className="text-[10px] text-slate-400 font-normal">(Primary)</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveField('english')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                  activeField === 'english'
                    ? 'bg-[#14532D] text-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {activeField === 'english' ? 'Targeting English' : 'Focus'}
              </button>
            </div>
            <textarea
              ref={englishInputRef}
              rows={4}
              value={english}
              onFocus={() => setActiveField('english')}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="Enter clause in English. You can use placeholders like {{rent}}, {{unit}}, {{due_day}}..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
            />
            {isEnglishEmpty && (
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Warning: English text is empty. Both English and Bisaya are recommended.</span>
              </div>
            )}
          </div>

          {/* Bisaya Version */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span>Bisaya Translation</span>
                <span className="text-[10px] text-emerald-800 font-normal">(Cebuano dialect)</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveField('bisaya')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                  activeField === 'bisaya'
                    ? 'bg-[#14532D] text-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {activeField === 'bisaya' ? 'Targeting Bisaya' : 'Focus'}
              </button>
            </div>
            <textarea
              ref={bisayaInputRef}
              rows={4}
              value={bisaya}
              onFocus={() => setActiveField('bisaya')}
              onChange={(e) => setBisaya(e.target.value)}
              placeholder="Ibutang diri ang hubad sa Bisaya. Mahimong gamiton ang placeholders sama sa {{rent}}, {{unit}}..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532D] leading-relaxed"
            />
            {isBisayaEmpty && (
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Warning: Bisaya translation is empty. Both languages are recommended for local tenants.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          {onOpenAiSuggest ? (
            <button
              type="button"
              onClick={onOpenAiSuggest}
              className="text-xs font-bold text-[#14532D] hover:text-[#0f4022] flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Draft with AI</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#14532D] hover:bg-[#0f4022] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Clause</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
