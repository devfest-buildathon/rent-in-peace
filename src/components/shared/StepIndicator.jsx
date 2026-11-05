import React from 'react';

const STEPS = [
  { num: 1, label: 'Details' },
  { num: 2, label: 'Review' },
  { num: 3, label: 'Contract' },
  { num: 4, label: 'Check' },
];

export default function StepIndicator({ currentStep = 1 }) {
  return (
    <div className="flex items-center justify-between px-2 mb-4">
      {STEPS.map((s, idx) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
              s.num === currentStep
                ? 'bg-[#14532D] text-white shadow-xs'
                : s.num < currentStep
                ? 'bg-[#14532D] text-white'
                : 'border border-slate-300 text-slate-400 bg-white'
            }`}>
              {s.num}
            </div>
            <span className={`text-[9px] mt-1 transition ${
              s.num === currentStep ? 'text-[#14532D] font-bold' : 'text-slate-400'
            }`}>
              {s.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-[1.5px] mx-2 -mt-4 transition ${
              s.num < currentStep ? 'bg-[#14532D]' : 'bg-slate-200'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
