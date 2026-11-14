import React from 'react';

export default function BrandHeader({ subtitle = "Good contracts make good neighbors.", showFullLogo = false }) {
  if (showFullLogo) {
    return (
      <div className="flex flex-col items-center justify-center text-center mb-4">
        <img 
          src="/assets/logo-full.png" 
          alt="Rent in Peace" 
          className="h-16 w-auto object-contain drop-shadow-xs mb-1" 
        />
        {subtitle && (
          <p className="text-[11px] text-brand-700 font-medium">{subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <img 
          src="/assets/logo-icon.png" 
          alt="Rent in Peace" 
          className="w-10 h-10 rounded-2xl object-contain shadow-xs border border-emerald-100/80 bg-white" 
        />
        <div>
          <h2 className="text-base font-extrabold tracking-tight leading-none text-slate-900">
            <span className="text-[#144C2E]">Rent in </span>
            <span className="text-[#449567]">Peace</span>
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
