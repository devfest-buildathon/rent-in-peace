import React, { useState } from 'react';
import { LeasePreset } from '../types';
import { renderLease } from '../renderer';
import { SAMPLE_PLACEHOLDER_VALUES } from '../constants';
import { X, Globe, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  preset: LeasePreset;
  onClose: () => void;
}

export default function LivePreviewModal({
  isOpen,
  preset,
  onClose
}: LivePreviewModalProps) {
  const [languageMode, setLanguageMode] = useState<'bilingual' | 'english' | 'bisaya'>('bilingual');
  const [useCustomValues, setUseCustomValues] = useState(false);
  const [customValues, setCustomValues] = useState({ ...SAMPLE_PLACEHOLDER_VALUES });

  if (!isOpen) return null;

  const renderResult = renderLease(preset, useCustomValues ? customValues : SAMPLE_PLACEHOLDER_VALUES);
  const clauses = renderResult.clauses || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#14532D] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Kasulatan Live Preview</span>
                <span className="text-[10px] bg-emerald-100 text-[#14532D] font-mono font-bold px-2 py-0.5 rounded-full">
                  {preset.name}
                </span>
              </h3>
              <p className="text-[10px] text-slate-500">
                Matches the final printable A4 paper &amp; tenant view
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Controls Bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Language Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLanguageMode('bilingual')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                languageMode === 'bilingual'
                  ? 'bg-white text-[#14532D] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bilingual (Both)
            </button>
            <button
              type="button"
              onClick={() => setLanguageMode('english')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                languageMode === 'english'
                  ? 'bg-white text-[#14532D] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguageMode('bisaya')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                languageMode === 'bisaya'
                  ? 'bg-white text-[#14532D] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bisaya
            </button>
          </div>

          {/* Sample Data Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sample Data Applied (Maria Santos, Room 2B, ₱2,800)</span>
          </div>
        </div>

        {/* Printable Paper Canvas View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/70">
          <div className="bg-white max-w-xl mx-auto shadow-md border border-slate-300/80 p-6 sm:p-8 rounded-md text-black font-serif text-[11px] leading-relaxed">
            
            {/* Document Legal Caption */}
            <div className="text-center pb-2 mb-3 border-b-2 border-black">
              <p className="font-sans font-bold text-[9px] uppercase tracking-wider text-black">
                Republika ng Pilipinas · Cagayan de Oro City
              </p>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-black mt-1">
                KASULATAN SA PAG-ABANG NG PAUPAHAN
              </h1>
              <p className="font-sans font-bold text-[9.5px] uppercase tracking-wide text-slate-800">
                (RESIDENTIAL LEASE AGREEMENT — {preset.name.toUpperCase()})
              </p>
              <p className="text-[8px] italic text-slate-600 font-sans mt-0.5">
                Batas Republika Blg. 386 (Kodigo Sibil) at Rent Control Act
              </p>
            </div>

            {/* Parties Summary Box */}
            <div className="border border-black p-2.5 mb-3 bg-slate-50/50 font-sans text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[8px] block">NAGPAPAUPA (Lessor):</span>
                  <span className="font-bold text-slate-900">{SAMPLE_PLACEHOLDER_VALUES.landlord_name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[8px] block">UMUUPA (Lessee):</span>
                  <span className="font-bold text-slate-900">{SAMPLE_PLACEHOLDER_VALUES.tenant_name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[8px] block">PAUPAHAN (Premises):</span>
                  <span className="font-bold text-slate-900">{SAMPLE_PLACEHOLDER_VALUES.unit}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[8px] block">ABANG (Monthly Rent):</span>
                  <span className="font-bold text-emerald-800">{SAMPLE_PLACEHOLDER_VALUES.rent} / month (Due day: {SAMPLE_PLACEHOLDER_VALUES.due_day})</span>
                </div>
              </div>
            </div>

            {/* Error in rendering clauses */}
            {!renderResult.success && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded mb-3 font-sans">
                {renderResult.error}
              </div>
            )}

            {/* Clauses List */}
            <div className="space-y-3.5 mb-5">
              {clauses.map((c) => (
                <div key={c.id} className="border-b border-slate-100 pb-2.5 last:border-0">
                  <h4 className="font-sans font-bold text-[10.5px] text-black uppercase tracking-tight mb-1">
                    {c.title}
                  </h4>

                  {/* English Clause */}
                  {(languageMode === 'bilingual' || languageMode === 'english') && c.english && (
                    <p className="text-justify indent-3 text-slate-900">
                      {c.english}
                    </p>
                  )}

                  {/* Bisaya Clause */}
                  {(languageMode === 'bilingual' || languageMode === 'bisaya') && c.bisaya && (
                    <p className={`text-justify indent-3 text-slate-700 ${
                      languageMode === 'bilingual' ? 'italic text-[10px] text-slate-600 mt-1 pl-2 border-l-2 border-emerald-600' : ''
                    }`}>
                      {languageMode === 'bilingual' && (
                        <span className="font-sans font-bold not-italic text-[#14532D] mr-1">[Bisaya]:</span>
                      )}
                      {c.bisaya}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Signature Blocks */}
            <div className="pt-3 border-t border-black font-sans text-center mt-4">
              <p className="text-[9px] uppercase tracking-wider font-bold mb-4">
                SA KATUNAYAN NG LAHAT, ang mga partido ay lumagda ngayong araw:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="border-b border-black w-36 mx-auto h-8 mb-1 flex items-end justify-center">
                    <span className="text-[8px] italic text-slate-400">[Lessor Signature]</span>
                  </div>
                  <p className="font-bold text-[9.5px]">{SAMPLE_PLACEHOLDER_VALUES.landlord_name}</p>
                  <p className="text-[8px] text-slate-500 uppercase">Nagpapaupa (Lessor)</p>
                </div>
                <div>
                  <div className="border-b border-black w-36 mx-auto h-8 mb-1 flex items-end justify-center">
                    <span className="text-[8px] italic text-slate-400">[Lessee Signature]</span>
                  </div>
                  <p className="font-bold text-[9.5px]">{SAMPLE_PLACEHOLDER_VALUES.tenant_name}</p>
                  <p className="text-[8px] text-slate-500 uppercase">Umuupa (Lessee)</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <span className="text-xs text-slate-500">
            {clauses.length} active clause{clauses.length === 1 ? '' : 's'} in this preset
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#14532D] hover:bg-[#0f4022] transition shadow-xs cursor-pointer"
          >
            Done Previewing
          </button>
        </div>
      </div>
    </div>
  );
}
