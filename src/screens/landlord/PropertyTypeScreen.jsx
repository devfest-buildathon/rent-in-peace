import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, HelpCircle, Home, Building2, FileText, Check, ChevronRight } from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

export default function PropertyTypeScreen() {
  const { currentScreen, setCurrentScreen, propertyType, setPropertyType } = useApp();

  const options = [
    {
      id: 'Boarding House / Bedspace',
      label: 'Boarding House / Bedspace',
      sub: 'A room or shared sleeping space',
      icon: Home,
    },
    {
      id: 'Apartment Unit',
      label: 'Apartment Unit',
      sub: 'A private unit in a small building',
      icon: Home,
    },
    {
      id: 'Condo',
      label: 'Condo',
      sub: 'A privately owned condominium unit',
      icon: FileText,
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-2">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentScreen('LANDLORD_HOME')} className="p-1 -ml-1 text-[#14532D] cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold cursor-pointer">
            <HelpCircle className="w-4 h-4 text-[#14532D]" /> Help
          </div>
        </div>

        {/* 4-Step Stepper */}
        <StepIndicator currentStep={1} />

        {/* Titles */}
        <p className="text-[10px] font-bold text-[#14532D] tracking-wider uppercase mb-1">PROPERTY DETAILS</p>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">What are you renting out?</h1>
        <p className="text-xs text-slate-500 mt-1 mb-6">Pick the option that best fits the property.</p>

        {/* Property Choices */}
        <div className="space-y-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = propertyType === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setPropertyType(opt.id)}
                className={`p-4 rounded-3xl border transition flex items-center justify-between cursor-pointer shadow-xs ${
                  isSelected 
                    ? 'border-[#14532D] bg-[#F4F8F5]' 
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#14532D]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{opt.label}</h3>
                    <p className="text-[11px] text-slate-500">{opt.sub}</p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition ${
                  isSelected 
                    ? 'bg-[#14532D] border-[#14532D] text-white' 
                    : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue CTA */}
      <div className="pb-3">
        <button 
          onClick={() => setCurrentScreen('WIZARD_DETAILS')}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
