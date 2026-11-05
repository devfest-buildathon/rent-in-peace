import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
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
      setError('Please provide the lessor / landlord full legal name.');
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

    if (!tenantName.trim()) {
      setTenantName('Prospective Lessee');
    }

    setError('');
    refreshClausesFromDraft();
    setCurrentScreen('WIZARD_REVIEW');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div className="overflow-y-auto scrollbar-none pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setCurrentScreen('WIZARD_PROPERTY')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">Lease Terms</h2>
          <div className="w-10"></div>
        </div>

        {/* Stepper */}
        <StepIndicator currentStep={1} />

        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#14532D] uppercase tracking-wider">PARAMETERS</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Contract Basics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify rent terms, security deposit, and signatory details.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields grouped in iOS Card style */}
        <div className="space-y-4">
          
          {/* Card 1: Property & Room */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Unit Identification</h3>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Room or Unit #</label>
              <input 
                type="text" 
                value={roomNumber} 
                onChange={(e) => setRoomNumber(e.target.value)} 
                placeholder="e.g. Room 204 or Unit 3B" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Property Location / Address</label>
              <input 
                type="text" 
                value={propertyAddress} 
                onChange={(e) => setPropertyAddress(e.target.value)} 
                placeholder="e.g. Nazareth, Cagayan de Oro City" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>
          </div>

          {/* Card 2: Financial Terms */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Financial Schedule</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Monthly Rent (₱)</label>
                <input 
                  type="number" 
                  value={monthlyRent} 
                  onChange={(e) => {
                    setMonthlyRent(e.target.value);
                    if (!advanceRent) setAdvanceRent(e.target.value);
                  }} 
                  placeholder="3500" 
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">1 Month Advance (₱)</label>
                <input 
                  type="number" 
                  value={advanceRent} 
                  onChange={(e) => setAdvanceRent(e.target.value)} 
                  placeholder="3500" 
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Deposit (₱)</label>
                <input 
                  type="number" 
                  value={deposit} 
                  onChange={(e) => setDeposit(e.target.value)} 
                  placeholder="3500" 
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Duration</label>
                <select
                  value={leaseDuration}
                  onChange={(e) => setLeaseDuration(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                >
                  <option value="6 months">6 Months</option>
                  <option value="12 months">1 Year (12 Months)</option>
                  <option value="Month-to-month">Month-to-month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Lessor & Lessee Parties */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Signatory Parties</h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Landlord Legal Name (Lessor)</label>
              <input 
                type="text" 
                value={landlordName} 
                onChange={(e) => setLandlordName(e.target.value)} 
                placeholder="Full Legal Name" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Landlord Contact / GCash Mobile</label>
              <input 
                type="tel" 
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)} 
                placeholder="09171234567" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Prospective Tenant Name</label>
              <input 
                type="text" 
                value={tenantName} 
                onChange={(e) => setTenantName(e.target.value)} 
                placeholder="Leave blank if sharing link to unknown applicant" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Continue CTA */}
      <div className="pt-3 pb-2">
        <button 
          onClick={handleContinue}
          className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <span>Review Terms</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
