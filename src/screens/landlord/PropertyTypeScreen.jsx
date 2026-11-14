import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Home, Building2, Check, ChevronRight } from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

const PROPERTY_TYPES = [
  {
    id: 'Boarding House / Bedspace',
    title: 'Boarding House / Bedspace',
    desc: 'Room or bedspace with shared kitchen, bathroom, or common facilities.',
    icon: Home
  },
  {
    id: 'Entire Apartment / House',
    title: 'Entire Apartment / House',
    desc: 'Self-contained residential unit with private entrance and utilities.',
    icon: Building2
  },
  {
    id: 'Condo Unit / Studio',
    title: 'Condo Unit / Studio',
    desc: 'Private high-rise condominium unit or serviced studio dwelling.',
    icon: Building2
  },
  {
    id: 'Commercial / Retail Stall',
    title: 'Commercial / Retail Stall',
    desc: 'Barangay commercial stall, kiosk, or small street-level storefront.',
    icon: Building2
  }
];

export default function PropertyTypeScreen() {
  const { navigateBack, setCurrentScreen, propertyType, setPropertyType } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            type="button"
            onClick={navigateBack} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">New Lease Agreement</h2>
          <div className="w-10"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={0} />

        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">CATEGORY</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            What are you renting out?
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            We will customize statutory clauses based on property type.
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {PROPERTY_TYPES.map((pt) => {
            const Icon = pt.icon;
            const isSelected = propertyType === pt.id;
            return (
              <div 
                key={pt.id}
                onClick={() => setPropertyType(pt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? 'border-[#14532D] bg-white ring-2 ring-[#14532D]/20 shadow-sm' 
                    : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#14532D] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{pt.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug max-w-[230px]">{pt.desc}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                  isSelected ? 'border-[#14532D] bg-[#14532D] text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue CTA Button */}
      <div className="pt-4 pb-2">
        <button 
          onClick={() => setCurrentScreen('WIZARD_DETAILS')}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <span>Continue to Lease Terms</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
