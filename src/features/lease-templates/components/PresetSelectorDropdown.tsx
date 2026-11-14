import React, { useState, useEffect } from 'react';
import { LeasePreset } from '../types';
import { getPresets } from '../presetService';
import { FileText, ChevronDown, Check, SlidersHorizontal, Sparkles } from 'lucide-react';

interface PresetSelectorDropdownProps {
  landlordId?: string;
  selectedPresetId?: string;
  onSelectPreset: (preset: LeasePreset) => void;
  onNavigateToCustomize?: () => void;
}

export default function PresetSelectorDropdown({
  landlordId = 'default',
  selectedPresetId,
  onSelectPreset,
  onNavigateToCustomize
}: PresetSelectorDropdownProps) {
  const [presets, setPresets] = useState<LeasePreset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPresets(landlordId)
      .then((list) => {
        if (mounted) {
          setPresets(list);
          setLoading(false);
          // If no preset selected yet, default to first
          if (!selectedPresetId && list.length > 0) {
            onSelectPreset(list[0]);
          }
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [landlordId, selectedPresetId]);

  const activePreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#14532D]" />
          <span>Lease Agreement Preset (Kasulatan)</span>
        </label>
        {onNavigateToCustomize && (
          <button
            type="button"
            onClick={onNavigateToCustomize}
            className="text-[11px] font-bold text-[#14532D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Customize Presets</span>
          </button>
        )}
      </div>

      {/* Selector trigger */}
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-left shadow-2xs hover:border-emerald-600 transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#14532D] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 truncate">
                {activePreset?.name || 'Select Preset...'}
              </span>
              {activePreset?.isBuiltIn && (
                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                  Built-in
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {activePreset?.description || `${activePreset?.clauses?.length || 0} statutory clauses included`}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          {presets.map((preset) => {
            const isSelected = preset.id === activePreset?.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  setIsOpen(false);
                }}
                className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition ${
                  isSelected ? 'bg-emerald-50 text-[#14532D]' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate">{preset.name}</span>
                    {preset.isBuiltIn && (
                      <span className="text-[9px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        Built-in
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {preset.clauses.filter((c) => c.enabled !== false).length} clauses
                  </p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#14532D] shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
