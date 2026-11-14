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
  Building,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2
} from 'lucide-react';
import PasswordStrengthMeter from '../../auth/PasswordStrengthMeter';
import { checkPasswordStrength } from '../../auth/passwordStrength';

export default function TenantAuthScreen({ initialTab = 'register' }) {
  const { 
    navigateBack,
    loginTenant,
    registerTenant,
    roomCodeInput,
    setRoomCodeInput,
    activeCode,
    tenantName,
    lookupContractByCode,
    resetPasswordWithEmail
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [regFullName, setRegFullName] = useState(() => {
    return isGenericTenantName(tenantName) ? '' : (tenantName || '');
  });
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCode, setRegCode] = useState(roomCodeInput || activeCode || '');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedContract, setDetectedContract] = useState(null);

  const displayCode = regCode || roomCodeInput || activeCode || '';
  const regStrength = checkPasswordStrength(regPassword);

  // Auto-detect landlord contract details when room code is entered or loaded
  useEffect(() => {
    const code = (regCode || displayCode).trim().toUpperCase();
    if (code.length >= 6) {
      lookupContractByCode(code).then((found) => {
        if (found) {
          setDetectedContract(found);
          // Never prefill generic strings like 'Prospective Lessee'
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
    const cleanCode = (regCode || displayCode).trim().toUpperCase();
    const cleanLegalName = regFullName.trim();

    if (!cleanCode) {
      setError('Please enter your Landlord Room Code (e.g. RIP-XXXX).');
      return;
    }
    if (!cleanLegalName || isGenericTenantName(cleanLegalName)) {
      setError('Please enter your full legal name as lessee.');
      return;
    }
    if (!cleanUser) {
      setError('Please choose a username.');
      return;
    }

    // Strict live password strength requirement
    if (!regStrength.isStrong) {
      setError('Password is too weak. It must have 8+ characters, uppercase, lowercase, a number, and a symbol.');
      return;
    }

    setIsLoading(true);
    const result = await registerTenant({
      username: cleanUser,
      password: regPassword,
      email: regEmail.trim(),
      code: cleanCode,
      name: cleanLegalName
    });
    setIsLoading(false);

    if (result.success) {
      // Transition handled in AppContext
    } else {
      setError(result.error || 'Failed to join rental unit. Please verify your room code.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = loginUsername.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUser || !loginPassword) {
      setError('Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    const result = await loginTenant(cleanUser, loginPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Login failed. Please verify your credentials.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsSendingForgot(true);
    const res = await resetPasswordWithEmail(forgotEmail.trim());
    setIsSendingForgot(false);

    if (res.success) {
      setForgotSent(true);
      setTimeout(() => {
        setForgotSent(false);
        setShowForgotModal(false);
        setForgotEmail('');
      }, 3000);
    } else {
      setError(res.error || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-lg mx-auto w-full bg-[#F4F8F5]">
      <div>
        {/* Header with Logical Back Button */}
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button"
            onClick={navigateBack} 
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#14532D] hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <span className="text-xs font-bold text-[#14532D] uppercase tracking-wider">Tenant Portal</span>
          <div className="w-10"></div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'register' ? 'Join Rental Unit' : 'Tenant Sign In'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your Kasulatan lease contract, pay rent, and view door access code.
          </p>
        </div>

        {/* Segmented Tabs */}
        <div className="p-1 bg-slate-200/70 rounded-2xl flex items-center mb-4">
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
                  <div className="min-w-0">
                    <span className="font-bold">{detectedContract.roomNumber || 'Room Unit'}</span> · {detectedContract.propertyAddress || 'Rental Property'}
                    <span className="block text-[10px] text-emerald-700 truncate">Lessor: {detectedContract.landlordName || 'Landlord'}</span>
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

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Choose Username</label>
                  <input 
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="elena_salvador"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address</label>
                  <input 
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="elena@email.com"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              {/* Password with Live Strength Meter (Requirement 1) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars with upper, lower, #, & symbol"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={regPassword} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !regStrength.isStrong}
              className="w-full bg-[#14532D] hover:bg-[#0f4022] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
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
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Username or Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="e.g. elena_salvador"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-500">Password</label>
                  <button 
                    type="button"
                    onClick={() => { setShowForgotModal(true); setError(''); }}
                    className="text-[11px] text-[#14532D] hover:underline font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div 
          onClick={() => setShowForgotModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-3.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#14532D] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset Password</h3>
                <p className="text-[11px] text-slate-400">Firebase Auth password recovery</p>
              </div>
            </div>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset link sent to your email!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered email address to receive password reset instructions.
                </p>
                <input 
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="tenant@email.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  required
                />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingForgot}
                    className="py-2.5 px-3 rounded-xl bg-[#14532D] hover:bg-[#0f4022] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isSendingForgot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Send Reset Link</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="pt-2 text-center">
        <p className="text-[11px] text-slate-400">
          Philippine Civil Code Compliant · Secure Authentication
        </p>
      </div>
    </div>
  );
}
