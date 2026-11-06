import React, { useState, useEffect } from 'react';
import { useApp, isGenericTenantName } from '../../context/AppContext';
import { 
  ChevronLeft, 
  KeyRound, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  User,
  Lock,
  Building
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
    lookupContractByCode
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [regFullName, setRegFullName] = useState(() => {
    return isGenericTenantName(tenantName) ? '' : (tenantName || '');
  });
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCode, setRegCode] = useState(roomCodeInput || activeCode || '');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedContract, setDetectedContract] = useState(null);

  const displayCode = regCode || roomCodeInput || activeCode || '';

  // Auto-detect landlord contract details when room code is entered or loaded
  useEffect(() => {
    const code = (regCode || displayCode).trim().toUpperCase();
    if (code.length >= 6) {
      lookupContractByCode(code).then((found) => {
        if (found) {
          setDetectedContract(found);
          // Only auto-fill if it's a real person's name, NEVER a generic string like 'Prospective Lessee'
          if (found.tenantName && !isGenericTenantName(found.tenantName)) {
            setRegFullName(found.tenantName);
          } else {
            setRegFullName('');
          }
        }
      });
    }
  }, [regCode]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = regUsername.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPass = regPassword.trim();
    const cleanCode = (regCode || displayCode).trim().toUpperCase();
    
    // Fallback order: Explicit input > Real detected contract name > clean username
    let finalLegalName = regFullName.trim();
    if (isGenericTenantName(finalLegalName)) {
      finalLegalName = (!isGenericTenantName(detectedContract?.tenantName) ? detectedContract.tenantName : '') || 
                       (!isGenericTenantName(tenantName) ? tenantName : '') || 
                       cleanUser;
    }

    if (!cleanCode) {
      setError('Please enter your Landlord Invite / Room Code (e.g. RIP-4B92).');
      return;
    }
    if (!finalLegalName) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!cleanUser) {
      setError('Please choose a username.');
      return;
    }
    if (!cleanPass) {
      setError('Please choose a password.');
      return;
    }

    setIsLoading(true);
    const result = await registerTenant({
      username: cleanUser,
      password: cleanPass,
      code: cleanCode,
      name: finalLegalName
    });
    setIsLoading(false);

    if (result.success) {
      // Go directly to portal to review Kasulatan and submit GCash advance payment
      setCurrentScreen('TENANT_PORTAL');
    } else {
      setError(result.error || 'Failed to link room code. Please check code.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = loginUsername.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPass = loginPassword.trim();

    if (!cleanUser || !cleanPass) {
      setError('Please enter your tenant username and password.');
      return;
    }

    setIsLoading(true);
    const result = await loginTenant(cleanUser, cleanPass);
    setIsLoading(false);

    if (result.success) {
      setCurrentScreen('TENANT_HOME');
    } else {
      setError(result.error || 'Login failed. Please verify your credentials.');
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
          <span className="text-xs font-bold text-[#14532D] uppercase tracking-wider">Tenant Portal</span>
          <div className="w-10"></div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'register' ? 'Join Rental Unit' : 'Tenant Sign In'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your Kasulatan lease contract, pay rent, and view door PIN.
          </p>
        </div>

        {/* Segmented Tabs */}
        <div className="p-1 bg-slate-200/70 rounded-2xl flex items-center mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'register' ? 'bg-white text-[#14532D] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Enter Room Code
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'login' ? 'bg-white text-[#14532D] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600 mb-4 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        {activeTab === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Room Access Code from Landlord
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#14532D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={regCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setRegCode(val);
                      setRoomCodeInput(val);
                    }}
                    placeholder="e.g. RIP-4B92"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    required
                  />
                </div>
              </div>

              {detectedContract && (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold">{detectedContract.roomNumber || 'Room Unit'}</span> · {detectedContract.propertyAddress || 'Cagayan de Oro'}
                    <span className="block text-[10px] text-emerald-700">Lessor: {detectedContract.landlordName || 'Landlord'}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Full Legal Name (Lessee)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#14532D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Elena P. Salvador"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Choose Username</label>
                <input 
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. elena_salvador"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
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
                  <span>Review Lease & Sign</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Username</label>
                <input 
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. elena_salvador"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Password</label>
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
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
