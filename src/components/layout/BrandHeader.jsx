import React from 'react';
import { Home } from 'lucide-react';

export default function BrandHeader({ subtitle = "Good contracts make good neighbors." }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EAB308] flex items-center justify-center shadow-xs text-emerald-950">
          <Home className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base font-extrabold tracking-tight leading-none text-slate-900">
            <span className="text-[#14532D]">Rent in </span>
            <span className="text-[#047857]">Peace</span>
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
