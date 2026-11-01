import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronLeft, 
  Home, 
  KeyRound, 
  User, 
  Lock,
  ArrowRight, 
  LogIn, 
  UserPlus,
  AlertCircle,
  Loader2,
  FileCheck,
  CheckCircle2,
  Edit2
} from 'lucide-react';

export default function TenantAuthScreen({ initialTab = 'register' }) {
  const { 
    setCurrentScreen, 
    loginTenant,
    registerTenant,
    roomCodeInput,
    setRoomCodeInput,
    activeCode,
    tenantName,
    setTenantName,
    roomNumber,
    propertyAddress,
    propertyType
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab); // 'register' | 'login'

  // Register State: By default, only Username & Password are required!
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showAdvancedEdit, setShowAdvancedEdit] = useState(false);
  const [regCustomName, setRegCustomName] = useState(tenantName || '');
  const [regCode, setRegCode] = useState(roomCodeInput || activeCode || '');

  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const displayCode = regCode || roomCodeInput || activeCode || '';
  const displayLegalName = regCustomName || tenantName || '';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = regUsername.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPass = regPassword.trim();
    const cleanCode = (regCode || displayCode).trim().toUpperCase();
    const cleanName = regCustomName.trim() || tenantName.trim();

    if (!cleanUser) {
      setError('Please choose a username.');
      return;
    }
    if (cleanUser.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (!cleanPass || cleanPass.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    if (cleanCode) setRoomCodeInput(cleanCode);

    const result = await registerTenant({
      username: cleanUser,
      password: cleanPass,
      name: cleanName,
      code: cleanCode
    });
    setIsLoading(false);

    if (result.success) {
      setCurrentScreen('TENANT_HOME');
    } else {
      setError(result.error || 'Registration failed. Please check your credentials.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = loginUsername.trim();
    const cleanPass = loginPassword.trim();
    const cleanCode = displayCode.trim().toUpperCase();

    if (!cleanUser) {
      setError('Please enter your username or mobile number.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const result = await loginTenant({
      username: cleanUser,
      password: cleanPass,
      code: cleanCode
    });
    setIsLoading(false);

    if (result.success) {
      setCurrentScreen('TENANT_HOME');
    } else {
      setError(result.error || 'Failed to sign in. Please check your username and password.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-4 max-w-lg mx-auto w-full">
      <div>
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-3">
          <button 
            type="button"
            onClick={() => setCurrentScreen('SPLASH')}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-[10px] bg-emerald-100 text-[#14532D] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Tenant Account
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
            <p className="text-[10px] text-slate-500">Tenant Registration & Lease Agreement</p>
          </div>
        </div>

        {/* Pre-filled Room Card (From Landlord's Link / Code) */}
        {displayCode && (
          <div className="p-3 bg-[#ECFDF5] border border-emerald-300 rounded-2xl mb-3 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] bg-[#14532D] text-white font-bold px-2 py-0.5 rounded font-mono">
                Code: {displayCode}
              </span>
              <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Lease Ready</span>
              </span>
            </div>
            <p className="text-xs font-black text-slate-900 mt-1">
              {roomNumber ? `${roomNumber} · ` : ''}{propertyAddress || 'Cagayan de Oro Paupahan'}
            </p>
            {displayLegalName ? (
              <p className="text-xs text-slate-700 mt-0.5">
                Tenant: <strong className="text-[#14532D] font-bold">{displayLegalName}</strong>
              </p>
            ) : null}
          </div>
        )}

        {/* Tab Switcher: Register vs Sign In */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-3 shadow-inner">
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
            <span>Register Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="flex-1 leading-snug">{error}</span>
          </div>
        )}

        {/* ==================== TAB 1: REGISTER ACCOUNT ==================== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="mb-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Register Your Account</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {displayLegalName ? (
                  <>Your landlord already entered your name. Just choose a username & password to register!</>
                ) : (
                  <>Create your tenant account with username and password to review your contract.</>
                )}
              </p>
            </div>

            {/* Choose Username */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Choose Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. mariasantos"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Create Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Room Code if not yet set */}
            {!displayCode && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Room Code (From Landlord)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                    placeholder="e.g. RIP-XXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Advanced Option to edit full legal name if needed */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedEdit(!showAdvancedEdit)}
                className="text-[11px] text-[#14532D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{showAdvancedEdit ? 'Hide name & code details' : 'Edit my full legal name or code'}</span>
              </button>

              {showAdvancedEdit && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mt-2 space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Full Legal Name
                    </label>
                    <input 
                      type="text"
                      value={regCustomName}
                      onChange={(e) => {
                        setRegCustomName(e.target.value);
                        setTenantName(e.target.value);
                      }}
                      placeholder="e.g. Maria Elena P. Santos"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Room Code
                    </label>
                    <input 
                      type="text"
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                      placeholder="e.g. RIP-XXXX"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Register Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Review My Lease</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className="text-xs text-[#14532D] font-bold hover:underline cursor-pointer"
              >
                Already have an account? Sign In here
              </button>
            </div>
          </form>
        )}

        {/* ==================== TAB 2: SIGN IN ==================== */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="mb-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Tenant Sign In</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your username and password to access your rental portal.
              </p>
            </div>

            {/* Username / Mobile Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Username or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. mariasantos"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532D] shadow-2xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#14532D] hover:bg-[#0f4022] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Tenant</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                }}
                className="text-xs text-[#14532D] font-bold hover:underline cursor-pointer"
              >
                Don't have an account yet? Register here
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="pt-3 text-center">
        <p className="text-[10px] text-slate-400">
          Rent in Peace · Autonomous Residential Lease Platform
        </p>
      </div>
    </div>
  );
}
