// Password Strength Meter Component - Owned by Agent A per COORDINATION.md
import React from 'react';
import { Check, X } from 'lucide-react';
import { checkPasswordStrength } from './passwordStrength';

export default function PasswordStrengthMeter({ password = '', showChecks = true }) {
  const { score, label, color, isStrong, checks } = checkPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
      {/* Strength Bar */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 grid grid-cols-4 gap-1 h-1.5">
          <div className={`rounded-full transition-all duration-300 ${score >= 1 ? 'bg-red-500' : 'bg-slate-200'}`} style={{ backgroundColor: score >= 1 ? color : undefined }}></div>
          <div className={`rounded-full transition-all duration-300 ${score >= 2 ? 'bg-orange-500' : 'bg-slate-200'}`} style={{ backgroundColor: score >= 2 ? color : undefined }}></div>
          <div className={`rounded-full transition-all duration-300 ${score >= 3 ? 'bg-amber-500' : 'bg-slate-200'}`} style={{ backgroundColor: score >= 3 ? color : undefined }}></div>
          <div className={`rounded-full transition-all duration-300 ${score >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} style={{ backgroundColor: score >= 4 ? color : undefined }}></div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider shrink-0" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Live Requirement Checklist */}
      {showChecks && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-500 pt-1">
          <div className={`flex items-center gap-1 ${checks.hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            {checks.hasMinLength ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <X className="w-3 h-3 text-slate-300" />}
            <span>8+ characters</span>
          </div>

          <div className={`flex items-center gap-1 ${checks.hasUpper && checks.hasLower ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            {checks.hasUpper && checks.hasLower ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <X className="w-3 h-3 text-slate-300" />}
            <span>Upper & lowercase</span>
          </div>

          <div className={`flex items-center gap-1 ${checks.hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            {checks.hasNumber ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <X className="w-3 h-3 text-slate-300" />}
            <span>At least 1 number</span>
          </div>

          <div className={`flex items-center gap-1 ${checks.hasSymbol ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
            {checks.hasSymbol ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <X className="w-3 h-3 text-slate-300" />}
            <span>Symbol (!@#$...)</span>
          </div>
        </div>
      )}
    </div>
  );
}
