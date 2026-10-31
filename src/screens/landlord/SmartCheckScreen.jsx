import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

export default function SmartCheckScreen() {
  const { setCurrentScreen } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-2">
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentScreen('WIZARD_CONTRACT')} className="p-1 -ml-1 text-[#14532D] cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Smart Check</h2>
          <div className="w-6"></div>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Things to double-check</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gemini AI spotted 3 items to clarify before finalizing.</p>
        </div>

        {/* 3 AI Risk Warning Cards (Pia's exact cards) */}
        <div className="space-y-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">No rule about visitors</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                Consider specifying visitor hours or overnight policy to avoid dorm disputes.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">Utility payment not clear</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                Electricity is mentioned but not water. Recommend specifying submeter or fixed rate.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">No notice period</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                Set a move-out notice period (e.g., 30 days) so you have time to find a replacement.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 pb-2">
        <button 
          onClick={() => setCurrentScreen('ALL_DONE')}
          className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Apply Recommendations & Finish</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
        <button 
          onClick={() => setCurrentScreen('WIZARD_CONTRACT')}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
        >
          Back to Contract
        </button>
      </div>
    </div>
  );
}
