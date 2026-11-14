import React from 'react';
import { AVAILABLE_PLACEHOLDERS } from '../constants';
import { Tag } from 'lucide-react';

interface PlaceholderPickerProps {
  onInsert: (placeholder: string) => void;
  targetFieldLabel?: string;
}

export default function PlaceholderPicker({ onInsert, targetFieldLabel = 'text field' }: PlaceholderPickerProps) {
  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#14532D]">
          <Tag className="w-3.5 h-3.5" />
          <span>Click placeholder to insert into {targetFieldLabel}:</span>
        </div>
        <span className="text-[10px] text-emerald-800 font-medium">Auto-filled from form</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {AVAILABLE_PLACEHOLDERS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onInsert(p.placeholder)}
            title={`${p.label}: ${p.description} (e.g. ${p.sampleValue})`}
            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-[#14532D] hover:text-[#0f4022] border border-emerald-300 rounded-lg text-[11px] font-mono font-semibold transition shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <span>{p.placeholder}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 mt-2">
        * Placeholders are dynamically replaced with real values when generating the Kasulatan. Empty values will trigger a warning.
      </p>
    </div>
  );
}
