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
  const { setCurrentScreen, propertyType, setPropertyType } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('LANDLORD_HOME')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-sm font-bold text-slate-800">New Lease Contract</h2>
          <div className="w-10"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={0} />

        <div className="mb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">What are you renting out?</h1>
          <p className="text-xs text-slate-500 mt-1">Select the property type to format appropriate clauses.</p>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {PROPERTY_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = propertyType === t.id;
            return (
              <div 
                key={t.id}
                onClick={() => setPropertyType(t.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between shadow-2xs ${
                  isSelected 
                    ? 'border-[#14532D] bg-[#ECFDF5]/50 ring-1 ring-[#14532D]' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#14532D] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{t.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ml-2 ${
                  isSelected ? 'bg-[#14532D] border-[#14532D] text-white' : 'border-slate-300'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 pb-2">
        <button 
          onClick={() => setCurrentScreen('WIZARD_DETAILS')}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Contract Details</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
