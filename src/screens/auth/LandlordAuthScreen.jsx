import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  Home, 
  User, 
  Phone, 
  Lock, 
  Building, 
  MapPin, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
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
      setError('Please enter a valid 11-digit mobile number (e.g. 09171234567).');
      return;
    }

    setIsLoading(true);
    const result = await registerLandlord({
      name: regName.trim(),
      phone,
      pin: regPin.trim(),
      propertyName: regPropertyName.trim() || 'Residential Rental Unit',
      city: regCity.trim() || 'Cagayan de Oro City'
    });
    setIsLoading(false);

    if (result.success) {
      setCurrentScreen('LANDLORD_HOME');
    } else {
      setError(result.error || 'Registration failed. Please check your connection.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button"
            onClick={() => setCurrentScreen('SPLASH')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-[10px] bg-emerald-100 text-[#14532D] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Landlord Portal
          </span>
          <div className="w-10"></div>
        </div>

        {/* Brand Banner */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[#EAB308] flex items-center justify-center shadow-xs">
            <Home className="w-5 h-5 text-emerald-950" />
          </div>
          <div>
            <span className="text-sm font-black text-[#14532D]">Rent in Peace</span>
            <p className="text-[10px] text-slate-500">Boarding House & Rental Management</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-start gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 leading-snug">{error}</div>
          </div>
        )}

        {/* Form: Sign In */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#14532D]" />
                <span>Mobile Phone Number</span>
              </label>
              <input 
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="09171234567"
                className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Enter the mobile number you registered with.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#14532D]" />
                <span>Security PIN / Password (Optional)</span>
              </label>
              <input 
                type="password"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                placeholder="••••"
                maxLength={8}
                className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">If you set a PIN during registration, enter it here.</p>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Landlord</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                }}
                className="text-xs text-[#14532D] font-bold hover:underline cursor-pointer"
              >
                Don't have a landlord account yet? Create one
              </button>
            </div>
          </form>
        )}

        {/* Form: Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#14532D]" />
                <span>Full Legal Name</span>
              </label>
              <input 
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
                required
              />
              <p className="text-[10px] text-slate-400 mt-0.5">As stated on your PhilSys ID, Driver's License, or Passport.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#14532D]" />
                <span>Mobile Phone Number</span>
              </label>
              <input 
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="09171234567"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#14532D]" />
                <span>Set 4-Digit Security PIN (Optional)</span>
              </label>
              <input 
                type="password"
                value={regPin}
                onChange={(e) => setRegPin(e.target.value)}
                placeholder="e.g. 1234"
                maxLength={6}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#14532D]" />
                <span>Property or Dormitory Name</span>
              </label>
              <input 
                type="text"
                value={regPropertyName}
                onChange={(e) => setRegPropertyName(e.target.value)}
                placeholder="e.g. Santos Boarding House or Velez Dorm"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#14532D]" />
                <span>City / Municipality</span>
              </label>
              <input 
                type="text"
                value={regCity}
                onChange={(e) => setRegCity(e.target.value)}
                placeholder="Cagayan de Oro City"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className="text-xs text-[#14532D] font-bold hover:underline cursor-pointer"
              >
                Already have an account? Sign in here
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="text-center pt-4 pb-2">
        <p className="text-[10px] text-slate-400">
          Philippine Civil Code Art. 1356 & Data Privacy Act of 2012 (RA 10173).
        </p>
      </div>
    </div>
  );
}
