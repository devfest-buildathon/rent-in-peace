import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { auditClausesWithGemini } from '../../lib/gemini';

export default function SmartCheckScreen() {
  const { setCurrentScreen, saveFinalizedContract, contractClauses, propertyAddress, monthlyRent } = useApp();
  const [auditItems, setAuditItems] = useState([
    {
      title: "Quiet hours & visitor policy",
      description: "Specify visitor curfew hours (e.g. 10:00 PM) to avoid neighborhood noise complaints before the Barangay Lupon.",
      severity: "warning"
    },
    {
      title: "Utility billing transparency",
      description: "For electric sub-meters, state the per-kWh rate clearly or specify shared split for water to prevent billing friction.",
      severity: "warning"
    },
    {
      title: "30-day move-out notice period",
      description: "Enforcing a minimum 30-day written notice pursuant to Article 1687 of the Civil Code protects both parties during turnover.",
      severity: "tip"
    }
  ]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const runAudit = async () => {
      setIsAuditing(true);
      const results = await auditClausesWithGemini(contractClauses, { propertyAddress, monthlyRent });
      if (active && Array.isArray(results) && results.length > 0) {
        setAuditItems(results);
      }
      if (active) setIsAuditing(false);
    };
    runAudit();
    return () => { active = false; };
  }, [contractClauses, propertyAddress, monthlyRent]);

  const handleApplyAndFinish = async () => {
    setIsSaving(true);
    await saveFinalizedContract();
    setIsSaving(false);
    setCurrentScreen('ALL_DONE');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('WIZARD_CONTRACT')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-[#14532D] px-2.5 py-1 rounded-full text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-emerald-700" />
            <span>Gemini Clause Audit</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-[#14532D] font-bold text-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-[#14532D]" />
            <span>Smart Check Analysis</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dispute-prevention checklist</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key items verified under the Philippine Civil Code & CDO tenancy practices before signing.
          </p>
        </div>

        {isAuditing && (
          <div className="p-3 bg-slate-900 text-white rounded-2xl mb-3 flex items-center gap-2.5 text-xs shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span className="text-[11px] font-medium text-slate-200">
              Gemini AI is reviewing your {contractClauses.length} contract clauses for legal risks...
            </span>
          </div>
        )}

        {/* AI Risk Warning Cards */}
        <div className="space-y-3 mb-4">
          {auditItems.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-3.5 rounded-2xl border flex items-start gap-3 shadow-2xs ${
                item.severity === 'tip' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {item.severity === 'tip' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-bold leading-tight">{item.title}</p>
                <p className={`text-[11px] mt-0.5 leading-snug ${item.severity === 'tip' ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pb-2">
        <button 
          onClick={handleApplyAndFinish}
          disabled={isSaving}
          className="w-full py-4 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{isSaving ? 'Saving to Database...' : 'Confirm & Finish Contract'}</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
        <button 
          onClick={() => setCurrentScreen('WIZARD_CONTRACT')} 
          className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer shadow-2xs"
        >
          Back to Kasulatan
        </button>
      </div>
    </div>
  );
}
