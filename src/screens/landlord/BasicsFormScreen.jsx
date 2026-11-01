import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import StepIndicator from '../../components/shared/StepIndicator';

export default function BasicsFormScreen() {
  const { 
    setCurrentScreen,
    landlordName, setLandlordName,
    contactNumber, setContactNumber,
    tenantName, setTenantName,
    roomNumber, setRoomNumber,
    propertyAddress, setPropertyAddress,
    monthlyRent, setMonthlyRent,
    deposit, setDeposit,
    advanceRent, setAdvanceRent,
    leaseDuration, setLeaseDuration,
    refreshClausesFromDraft
  } = useApp();

  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!landlordName.trim()) {
      setError('Please provide the landlord full legal name.');
      return;
    }
    if (!tenantName.trim()) {
      setError('Please provide the tenant full legal name.');
      return;
    }
    if (!roomNumber.trim()) {
      setError('Please specify the room or unit identifier (e.g. Room 3B).');
      return;
    }
    if (!monthlyRent || Number(monthlyRent) <= 0) {
      setError('Please enter a valid monthly rent amount.');
      return;
    }

    setError('');
    refreshClausesFromDraft();
    setCurrentScreen('WIZARD_REVIEW');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('WIZARD_PROPERTY')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-sm font-bold text-slate-800">Contract Basics</h2>
          <div className="w-10"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={1} />

        {/* Form Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tell us the terms</h1>
          <p className="text-xs text-slate-500 mt-1">We'll use these exact terms to generate your legal Kasulatan.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          {/* Parties Box */}
          <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
            <span className="text-[11px] font-bold text-[#14532D] uppercase tracking-wider block border-b border-slate-100 pb-1.5">
              Parties to the Lease
            </span>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Landlord full legal name</label>
              <input 
                type="text"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold"
                placeholder="e.g. Maria Santos"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tenant full legal name</label>
              <input 
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold"
                placeholder="e.g. Juan Miguel Dela Cruz"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">As indicated on tenant's government-issued identification.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Landlord contact number</label>
              <input 
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold font-mono"
                placeholder="09171234567"
              />
            </div>
          </div>

          {/* Premises Box */}
          <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
            <span className="text-[11px] font-bold text-[#14532D] uppercase tracking-wider block border-b border-slate-100 pb-1.5">
              Leased Premises
            </span>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room / Unit number</label>
              <input 
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold"
                placeholder="e.g. Room 204 or Bed 2A"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Property address / Location</label>
              <input 
                type="text"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#14532D] focus:ring-1 focus:ring-[#14532D] outline-none text-slate-800 text-xs font-semibold"
                placeholder="e.g. 12 Velez St., Barangay 29, Cagayan de Oro City"
              />
            </div>
          </div>

          {/* Financials Box */}
          <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
            <span className="text-[11px] font-bold text-[#14532D] uppercase tracking-wider block border-b border-slate-100 pb-1.5">
              Rent & Deposit Terms (PHP)
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Monthly Rent</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold">₱</span>
                  <input 
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    placeholder="3500"
                    className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-bold outline-none focus:border-[#14532D]"
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
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="3500"
                    className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-bold outline-none focus:border-[#14532D]"
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
                    onChange={(e) => setAdvanceRent(e.target.value)}
                    placeholder="3500"
                    className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-bold outline-none focus:border-[#14532D]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#14532D]" />
                <span>Lease Duration</span>
              </label>
              <select 
                value={leaseDuration}
                onChange={(e) => setLeaseDuration(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:border-[#14532D] outline-none"
              >
                <option value="1 month">1 month</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months (Standard)</option>
                <option value="1 year">1 year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Review CTA */}
      <div className="pt-4 pb-2">
        <p className="text-[10px] text-slate-400 text-center mb-2">
          Complies with maximum 2-month deposit limit under the Philippine Rent Control Act.
        </p>
        <button 
          onClick={handleContinue}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Review</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
