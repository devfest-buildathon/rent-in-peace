import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  ArrowRight, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function LandlordAuthScreen({ initialTab = 'login' }) {
  const { 
    setCurrentScreen, 
    loginLandlord, 
    registerLandlord 
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  
  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regPropertyName, setRegPropertyName] = useState('');
  const [regCity, setRegCity] = useState('Cagayan de Oro City');

  // UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cleanPhoneNumber = (p) => {
    let clean = (p || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('63') && clean.length === 12) {
      clean = '0' + clean.slice(2);
    }
    return clean;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const phone = cleanPhoneNumber(loginPhone);
    if (phone.length < 10) {
      setError('Please enter a valid Philippine mobile number (e.g. 09171234567).');
      return;
    }

    setIsLoading(true);
    const result = await loginLandlord(phone, loginPin.trim());
    setIsLoading(false);

    if (result.success) {
      setCurrentScreen('LANDLORD_HOME');
    } else {
      setError(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!regName.trim()) {
      setError('Please enter your full legal name as lessor.');
      return;
    }

    const phone = cleanPhoneNumber(regPhone);
    if (phone.length < 10) {
      setError('Please enter a valid mobile number for GCash receipts.');
      return;
    }

    if (!regPin.trim() || regPin.length < 4) {
      setError('Please choose a 4 to 6 digit security PIN.');
      return;
    }

    setIsLoading(true);
    const result = await registerLandlord({
      name: regName.trim(),
      phone: phone,
      pin: regPin.trim(),
      propertyName: regPropertyName.trim() || 'Rental House',
      city: regCity.trim() || 'Cagayan de Oro City'
    });
    setIsLoading(false);

    if (result.success) {
      setCurrentScreen('LANDLORD_HOME');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setCurrentScreen('SPLASH')} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <span className="text-xs font-bold text-[#14532D] uppercase tracking-wider">Lessor Portal</span>
          <div className="w-10"></div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'login' ? 'Landlord Sign In' : 'Create Lessor Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access rental contracts, tenant ledgers, and key PINs.
          </p>
        </div>

        {/* Segmented iOS Control */}
        <div className="p-1 bg-slate-200/70 rounded-2xl flex items-center mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'login' ? 'bg-white text-[#14532D] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'register' ? 'bg-white text-[#14532D] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mobile Number (GCash)</label>
                <input 
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="0917 123 4567"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Security PIN</label>
                <input 
                  type="password"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="••••"
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Legal Name</label>
                <input 
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Maria Clara Santos"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Property Name</label>
                <input 
                  type="text"
                  value={regPropertyName}
                  onChange={(e) => setRegPropertyName(e.target.value)}
                  placeholder="e.g. Nazareth Boarding Villa"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mobile # (GCash)</label>
                  <input 
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="09171234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Create 4-digit PIN</label>
                  <input 
                    type="password"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="••••"
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#14532D] hover:bg-[#0f4022] text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="pt-2 text-center">
        <p className="text-[11px] text-slate-400">
          Philippine Civil Code Art. 1356 Compliant
        </p>
      </div>
    </div>
  );
}
