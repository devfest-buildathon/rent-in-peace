import React from 'react';
import { Home } from 'lucide-react';

export default function BrandHeader({ subtitle = "Good contracts make good neighbors." }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-2xl bg-[#EAB308] flex items-center justify-center shadow-xs">
          <Home className="w-6 h-6 text-emerald-950" />
        </div>
        <div>
          <h2 className="text-base font-black tracking-tight leading-none">
            <span className="text-[#14532D]">Rent in </span>
            <span className="text-[#047857]">Peace</span>
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
