import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, AlertTriangle, ShieldCheck, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { auditClauses } from '../../services/ai/gemini';

export default function SmartCheckScreen() {
  const { navigateBack, setCurrentScreen, saveFinalizedContract, contractClauses, propertyAddress, monthlyRent } = useApp();
  const [auditItems, setAuditItems] = useState([
    {
      title: "Visitor Curfew Policy",
      description: "Specify visitor hours (e.g. 10:00 PM) to avoid neighborhood noise complaints before the Barangay Lupon.",
      severity: "warning"
    },
    {
      title: "Utility Billing Transparency",
      description: "For sub-meters, state per-kWh rate clearly or specify water split to eliminate billing friction.",
      severity: "warning"
    },
    {
      title: "30-Day Move-Out Notice",
      description: "Enforcing minimum 30-day written notice pursuant to Philippine tenancy law protects both parties.",
      severity: "tip"
    }
  ]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const runAudit = async () => {
      setIsAuditing(true);
      try {
        const results = await auditClauses(contractClauses, { propertyAddress, monthlyRent });
        if (active && Array.isArray(results) && results.length > 0) {
          setAuditItems(results);
        }
      } catch (err) {
        // Keep baseline recommendations
      } finally {
        if (active) setIsAuditing(false);
      }
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
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        <div className="flex items-center justify-between mb-3">
          <button 
            type="button"
            onClick={navigateBack} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          
          <div className="flex items-center gap-1.5 bg-emerald-50 text-[#14532D] px-3 py-1 rounded-full text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>AI Legal Audit</span>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">COMPLIANCE REVIEW</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Smart Check Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validating terms against the Philippine Rent Control Act and Civil Code.
          </p>
        </div>

        {isAuditing && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center gap-3 text-xs text-emerald-950 mb-4 animate-pulse">
            <Loader2 className="w-5 h-5 text-[#14532D] animate-spin" />
            <div>
              <p className="font-bold">Analyzing clauses with Gemini...</p>
              <p className="text-[11px] text-emerald-800">Cross-referencing Philippine tenancy benchmarks</p>
            </div>
          </div>
        )}

        {/* Audit Findings Cards */}
        <div className="space-y-3">
          {auditItems.map((item, idx) => (
            <div 
              key={idx}
              className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs flex items-start gap-3"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                item.severity === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-[#14532D]'
              }`}>
                {item.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Finish CTA */}
      <div className="pt-3 pb-2">
        <button 
          type="button"
          onClick={handleApplyAndFinish}
          disabled={isSaving}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <span>Finalize & Preview Kasulatan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
