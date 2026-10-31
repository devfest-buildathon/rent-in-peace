import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

export default function BasicsFormScreen() {
  const { 
    setCurrentScreen,
    landlordName, setLandlordName,
    contactNumber, setContactNumber,
    roomNumber, setRoomNumber,
    propertyAddress, setPropertyAddress,
    monthlyRent, setMonthlyRent,
    deposit, setDeposit,
    advanceRent, setAdvanceRent
  } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-2">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentScreen('WIZARD_PROPERTY')} className="p-1 -ml-1 text-[#14532D] cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-sm font-bold text-slate-800">Contract details</h2>
          <div className="w-6"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={1} />

        {/* Form Title */}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tell us the basics</h1>
        <p className="text-xs text-slate-500 mt-1 mb-5">We'll use these details to prepare your contract.</p>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-700 tracking-wider">Landlord</span>
            <div className="h-[1px] bg-slate-200 mt-1 mb-2"></div>

            <label className="block font-semibold text-slate-700 mb-1">Full name</label>
            <input 
              type="text"
              value={landlordName}
              onChange={(e) => setLandlordName(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200/90 rounded-2xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold shadow-2xs"
              placeholder="e.g. Maria Santos"
            />
            <p className="text-[10px] text-slate-400 mt-1">Use the name on your valid ID.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact number</label>
            <input 
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200/90 rounded-2xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold shadow-2xs"
              placeholder="09123333333"
            />
            <p className="text-[10px] text-slate-400 mt-1">For rent and contract updates.</p>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-700 tracking-wider">Property & Unit</span>
            <div className="h-[1px] bg-slate-200 mt-1 mb-2"></div>

            <label className="block font-semibold text-slate-700 mb-1">Room / Unit number</label>
            <input 
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200/90 rounded-2xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold shadow-2xs"
              placeholder="FA"
            />
            <p className="text-[10px] text-slate-400 mt-1">The specific room or unit to rent.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Property address</label>
            <input 
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200/90 rounded-2xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold shadow-2xs"
              placeholder="AFA"
            />
            <p className="text-[10px] text-slate-400 mt-1">Location of the rental property.</p>
          </div>

          {/* Financials Row */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 tracking-wider">Financial Terms</span>
            <div className="h-[1px] bg-slate-200 mt-1 mb-2"></div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Monthly Rent</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold">₱</span>
                  <input 
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200/90 rounded-xl text-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Deposit</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold">₱</span>
                  <input 
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200/90 rounded-xl text-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Advance</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold">₱</span>
                  <input 
                    type="number"
                    value={advanceRent}
                    onChange={(e) => setAdvanceRent(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200/90 rounded-xl text-slate-800 text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review CTA */}
      <div className="pt-4 pb-3">
        <p className="text-[10px] text-slate-400 text-center mb-2">Only include details you both agreed on.</p>
        <button 
          onClick={() => setCurrentScreen('WIZARD_REVIEW')}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Review details</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
