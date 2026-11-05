import React from 'react';

const STEPS = [
  { num: 1, label: 'Type' },
  { num: 2, label: 'Terms' },
  { num: 3, label: 'Review' },
  { num: 4, label: 'Kasulatan' },
];

export default function StepIndicator({ currentStep = 1 }) {
  return (
    <div className="flex items-center justify-between px-2 mb-4">
      {STEPS.map((s, idx) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
              s.num === currentStep
                ? 'bg-[#14532D] text-white shadow-xs scale-110'
                : s.num < currentStep
                ? 'bg-[#14532D] text-white'
                : 'border border-slate-300 text-slate-400 bg-white'
            }`}>
              {s.num}
            </div>
            <span className={`text-[9px] mt-1.5 font-bold transition ${
              s.num === currentStep ? 'text-[#14532D]' : 'text-slate-400'
            }`}>
              {s.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-[2px] mx-2 -mt-4 transition-colors duration-200 ${
              s.num < currentStep ? 'bg-[#14532D]' : 'bg-slate-200'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
