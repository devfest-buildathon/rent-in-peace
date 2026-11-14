import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { generateClause } from '../services/ai/gemini';
import { 
  registerLandlordUser, 
  loginLandlordUser, 
  registerTenantUser, 
  loginTenantUser, 
  requestPasswordReset, 
  signOutUser 
} from '../auth/authService';
import { createUniqueRoomCode } from '../features/lease/roomCode';
import { verifyPaymentAndIssueCode, regenerateAccessCode } from '../features/verification/accessCode';
import { getLogicalPreviousScreen, initHistoryRouter, pushScreenHistory } from '../router/navigation';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc 
} from 'firebase/firestore';

const AppContext = createContext();

// Helper to filter out legacy or mock generic placeholder names
export const isGenericTenantName = (name) => {
  if (!name || typeof name !== 'string') return true;
  const lower = name.trim().toLowerCase();
  return (
    lower.includes('prospective') || 
    lower.includes('lessee') || 
    lower === 'tenant' || 
    lower === 'unnamed' || 
    lower === 'new resident' || 
    lower === 'resident' || 
    lower === 'occupant' || 
    lower === 'user'
  );
};

// Helper to generate realistic legal clauses from entered data
export function generateDefaultClauses({
  landlord = '',
  tenant = '',
  room = '',
  address = '',
  propType = 'Boarding House / Bedspace',
  rent = '',
  dep = '',
  advance = '',
  duration = '6 months',
  startDate = new Date().toISOString().split('T')[0],
  electricity = 'Sub-meter',
  water = 'Shared split'
}) {
  const rentFormatted = rent ? `₱${Number(rent).toLocaleString()}` : '₱[Amount]';
  const depFormatted = dep ? `₱${Number(dep).toLocaleString()}` : '₱[Amount]';
  const advanceFormatted = advance ? `₱${Number(advance).toLocaleString()}` : '₱[Amount]';
  const cleanTenant = isGenericTenantName(tenant) ? '' : tenant;

  return [
    {
      num: 1,
      title: '1. Parties to the Agreement',
      text: `This residential lease agreement is entered into by ${landlord || '[Landlord Name]'} (Lessor) and ${cleanTenant || '[Tenant Name]'} (Lessee).`
    },
    {
      num: 2,
      title: '2. Leased Premises',
      text: `The Lessor hereby leases ${room || '[Unit/Room]'} located at ${address || '[Property Address]'} (${propType}) exclusively for peaceful residential dwelling.`
    },
    {
      num: 3,
      title: '3. Rent and Financial Obligations',
      text: `Monthly rent is ${rentFormatted}, payable on or before the 5th day of each calendar month. A security deposit of ${depFormatted} and advance rent of ${advanceFormatted} are required upon signing in accordance with the Rent Control Act of the Philippines.`
    },
    {
      num: 4,
      title: '4. Lease Term',
      text: `The lease commences on ${startDate} for an agreed initial duration of ${duration}, renewable upon mutual written agreement of both parties.`
    },
    {
      num: 5,
      title: '5. Utilities and Operational Expenses',
      text: `Electricity utility arrangement: ${electricity}. Water utility arrangement: ${water}. Tenant agrees to pay utility shares promptly upon statement delivery.`
    },
    {
      num: 6,
      title: '6. House Rules & Community Peace',
      text: 'Quiet hours begin at 10:00 PM. Common passageways and bathrooms must be kept clean and unobstructed. No unauthorized subleasing or assignment.'
    },
    {
      num: 7,
      title: '7. Maintenance & Care of Premises',
      text: 'The Lessee shall maintain the room in tenantable, sanitary condition and promptly notify the Lessor of any required structural or plumbing repairs.'
    },
    {
      num: 8,
      title: '8. Move-Out Notice & Termination',
      text: 'Either party may terminate this lease by providing at least 30 days prior written notice in accordance with Philippine law.'
    }
  ];
}

export function AppProvider({ children }) {
  // Navigation Screens: Persisted to localStorage & synchronized with browser history
  const [currentScreen, setCurrentScreenState] = useState(() => {
    try {
      const savedScreen = localStorage.getItem('rip_current_screen');
      if (savedScreen) return savedScreen;
      const savedRole = localStorage.getItem('rip_user_role');
      if (savedRole === 'TENANT') return 'TENANT_HOME';
      if (savedRole === 'LANDLORD') return 'LANDLORD_HOME';
    } catch (e) {}
    return 'SPLASH';
  });

  const setCurrentScreen = (screen, pushHistory = true) => {
    setCurrentScreenState(screen);
    try {
      if (screen) {
        localStorage.setItem('rip_current_screen', screen);
        if (pushHistory) {
          pushScreenHistory(screen);
        }
      } else {
        localStorage.removeItem('rip_current_screen');
      }
    } catch (e) {}
  };

  // Logical Back Button Navigation
  const navigateBack = () => {
    const prev = getLogicalPreviousScreen(currentScreen, { userRole, selectedTenant });
    setCurrentScreen(prev);
  };

  // Wire browser popstate listener for back gesture/button
  useEffect(() => {
    const cleanup = initHistoryRouter((poppedScreen) => {
      setCurrentScreen(poppedScreen, false);
    });
    return cleanup;
  }, []);

  // Active Role: 'LANDLORD' | 'TENANT' | null
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('rip_user_role') || null;
  });

  // Database Connection Status: 'checking' | 'connected' | 'rules_needed' | 'offline'
  const [dbStatus, setDbStatus] = useState('checking');

  // Persistence: Landlord Profile
  const [landlordProfile, setLandlordProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem('rip_landlord_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persistence: Tenant Profile
  const [tenantProfile, setTenantProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem('rip_tenant_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setTenantProfile = (profile) => {
    setTenantProfileState(profile);
    if (profile) {
      localStorage.setItem('rip_tenant_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('rip_tenant_profile');
    }
  };

  // Active Draft Contract State (persisted to prevent state loss on back/forward/refresh)
  const [propertyType, setPropertyTypeState] = useState(() => {
    return localStorage.getItem('rip_draft_propertyType') || 'Boarding House / Bedspace';
  });
  const setPropertyType = (val) => {
    setPropertyTypeState(val);
    try { localStorage.setItem('rip_draft_propertyType', val); } catch (e) {}
  };

  const [landlordName, setLandlordName] = useState(landlordProfile?.name || '');
  const [contactNumber, setContactNumber] = useState(landlordProfile?.phone || '');

  const [roomNumber, setRoomNumberState] = useState(() => {
    return localStorage.getItem('rip_draft_roomNumber') || '';
  });
  const setRoomNumber = (val) => {
    setRoomNumberState(val);
    try { localStorage.setItem('rip_draft_roomNumber', val); } catch (e) {}
  };

  const [propertyAddress, setPropertyAddressState] = useState(() => {
    return localStorage.getItem('rip_draft_propertyAddress') || 
      landlordProfile?.propertyAddress || 
      (landlordProfile?.propertyName ? `${landlordProfile.propertyName}, ${landlordProfile.city || ''}` : '');
  });
  const setPropertyAddress = (val) => {
    setPropertyAddressState(val);
    try { localStorage.setItem('rip_draft_propertyAddress', val); } catch (e) {}
  };

  const [monthlyRent, setMonthlyRentState] = useState(() => {
    return localStorage.getItem('rip_draft_monthlyRent') || '';
  });
  const setMonthlyRent = (val) => {
    setMonthlyRentState(val);
    try { localStorage.setItem('rip_draft_monthlyRent', val); } catch (e) {}
  };

  const [deposit, setDepositState] = useState(() => {
    return localStorage.getItem('rip_draft_deposit') || '';
  });
  const setDeposit = (val) => {
    setDepositState(val);
    try { localStorage.setItem('rip_draft_deposit', val); } catch (e) {}
  };

  const [advanceRent, setAdvanceRentState] = useState(() => {
    return localStorage.getItem('rip_draft_advanceRent') || '';
  });
  const setAdvanceRent = (val) => {
    setAdvanceRentState(val);
    try { localStorage.setItem('rip_draft_advanceRent', val); } catch (e) {}
  };

  const [leaseDuration, setLeaseDurationState] = useState(() => {
    return localStorage.getItem('rip_draft_leaseDuration') || '6 months';
  });
  const setLeaseDuration = (val) => {
    setLeaseDurationState(val);
    try { localStorage.setItem('rip_draft_leaseDuration', val); } catch (e) {}
  };

  const [rentReminderEnabled, setRentReminderEnabled] = useState(true);
  
  // Persistent Room / Invite Code - ONLY generated after Kasulatan is finalized and saved
  const [activeCode, setActiveCodeState] = useState(() => {
    return localStorage.getItem('rip_active_code') || '';
  });

  const setActiveCode = (code) => {
    const clean = (code || '').trim().toUpperCase();
    setActiveCodeState(clean);
    if (clean) {
      localStorage.setItem('rip_active_code', clean);
    } else {
      localStorage.removeItem('rip_active_code');
    }
  };

  const [tenantName, setTenantNameState] = useState(() => {
    const saved = localStorage.getItem('rip_draft_tenantName') || '';
    return isGenericTenantName(saved) ? '' : saved;
  });
  const setTenantName = (val) => {
    const clean = isGenericTenantName(val) ? '' : val;
    setTenantNameState(clean);
    try { 
      if (clean) localStorage.setItem('rip_draft_tenantName', clean);
      else localStorage.removeItem('rip_draft_tenantName');
    } catch (e) {}
  };

  // Landlord Signing State: 'DIGITAL' | 'WET_INK'
  const [landlordSigningMode, setLandlordSigningMode] = useState('DIGITAL');
  const [landlordSignature, setLandlordSignature] = useState(null);

  // Persistence: Real Saved Contracts List (Strictly NO fake demo data fallback)
  const [contracts, setContractsState] = useState(() => {
    try {
      const saved = localStorage.getItem('rip_contracts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const setContracts = (newContracts) => {
    setContractsState(newContracts);
    try {
      localStorage.setItem('rip_contracts', JSON.stringify(newContracts));
    } catch (e) {}
  };

  // Persistence: Real Payments & Transaction Ledger
  const [payments, setPaymentsState] = useState(() => {
    try {
      const saved = localStorage.getItem('rip_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const setPayments = (newPayments) => {
    setPaymentsState(newPayments);
    try {
      localStorage.setItem('rip_payments', JSON.stringify(newPayments));
    } catch (e) {}
  };

  // Test live connection to Firestore on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDoc(doc(db, '_connection_test', 'status'));
        setDbStatus('connected');
      } catch (err) {
        if (err.code === 'permission-denied') {
          setDbStatus('rules_needed');
        } else if (err.message?.includes('network') || err.code === 'unavailable') {
          setDbStatus('offline');
        } else {
          setDbStatus('connected');
        }
      }
    };
    testConnection();
  }, []);

  // Real-time Firestore Subscription for Landlord Contracts
  useEffect(() => {
    if (!landlordProfile?.phone && !landlordProfile?.id) return;
    const landlordId = landlordProfile.phone || landlordProfile.id;

    try {
      const q = query(
        collection(db, 'contracts'),
        where('landlordId', '==', landlordId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveContracts = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
          code: d.data().code || d.id
        }));
        setContractsState(liveContracts);
        try {
          localStorage.setItem('rip_contracts', JSON.stringify(liveContracts));
        } catch (e) {}
        setDbStatus('connected');
      }, (error) => {
        if (error.code === 'permission-denied') {
          setDbStatus('rules_needed');
        }
      });

      return () => unsubscribe();
    } catch (e) {}
  }, [landlordProfile?.phone, landlordProfile?.id]);

  // Real-time Firestore Subscription for Active Tenant Contract
  useEffect(() => {
    const codeToWatch = activeCode || tenantProfile?.contractCode;
    if (!codeToWatch) return;

    try {
      const docRef = doc(db, 'contracts', codeToWatch);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = { ...docSnap.data(), id: docSnap.id, code: docSnap.data().code || docSnap.id };
          setActiveTenantContract(data);
          setContractsState(prev => {
            const idx = prev.findIndex(c => c.code === data.code || c.id === data.code);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = data;
              return copy;
            }
            return [data, ...prev];
          });
        }
      }, (err) => {
        console.warn('[Firebase] Contract listener notice:', err.message);
      });

      return () => unsubscribe();
    } catch (e) {}
  }, [activeCode, tenantProfile?.contractCode]);

  // Real-time Firestore Subscription for Payments Ledger
  useEffect(() => {
    try {
      const paymentsCol = collection(db, 'payments');
      const unsubscribe = onSnapshot(paymentsCol, (snapshot) => {
        if (!snapshot.empty) {
          const livePayments = snapshot.docs.map(d => ({
            ...d.data(),
            id: d.id
          }));
          livePayments.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.date || 0).getTime();
            const timeB = new Date(b.createdAt || b.date || 0).getTime();
            return timeB - timeA;
          });
          setPaymentsState(livePayments);
          try {
            localStorage.setItem('rip_payments', JSON.stringify(livePayments));
          } catch (e) {}
        }
      }, (err) => {
        console.warn('[Firebase] Payments listener notice:', err.message);
      });

      return () => unsubscribe();
    } catch (e) {}
  }, []);

  const setLandlordProfile = async (profile) => {
    setLandlordProfileState(profile);
    if (profile) {
      localStorage.setItem('rip_landlord_profile', JSON.stringify(profile));
      setLandlordName(profile.name || '');
      setContactNumber(profile.phone || '');
      if (profile.propertyAddress) {
        setPropertyAddress(profile.propertyAddress);
      }
    } else {
      localStorage.removeItem('rip_landlord_profile');
    }
  };

  // Landlord Login via Firebase Auth
  const loginLandlord = async (phoneOrEmail, password) => {
    try {
      const profile = await loginLandlordUser({ identifier: phoneOrEmail, password });
      setLandlordProfileState(profile);
      localStorage.setItem('rip_landlord_profile', JSON.stringify(profile));
      setUserRole('LANDLORD');
      localStorage.setItem('rip_user_role', 'LANDLORD');

      setLandlordName(profile.name || '');
      setContactNumber(profile.phone || '');
      if (profile.propertyAddress) {
        setPropertyAddress(profile.propertyAddress);
      }

      // Fetch landlord contracts
      try {
        const q = query(
          collection(db, 'contracts'),
          where('landlordId', '==', profile.phone || profile.id)
        );
        const querySnap = await getDocs(q);
        const liveContracts = querySnap.docs.map(d => ({
          ...d.data(),
          id: d.id,
          code: d.data().code || d.id
        }));
        setContractsState(liveContracts);
        localStorage.setItem('rip_contracts', JSON.stringify(liveContracts));
      } catch (qErr) {}

      return { success: true, profile };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Landlord Registration via Firebase Auth
  const registerLandlord = async ({ name, phone, email, password, propertyName, propertyAddress, city }) => {
    try {
      const profile = await registerLandlordUser({
        name,
        phone,
        email,
        password,
        propertyName,
        propertyAddress,
        city
      });

      setLandlordProfileState(profile);
      localStorage.setItem('rip_landlord_profile', JSON.stringify(profile));
      setUserRole('LANDLORD');
      localStorage.setItem('rip_user_role', 'LANDLORD');

      setLandlordName(profile.name);
      setContactNumber(profile.phone);
      setPropertyAddress(profile.propertyAddress || `${profile.propertyName}, ${profile.city}`);
      setContractsState([]);
      localStorage.setItem('rip_contracts', JSON.stringify([]));

      return { success: true, profile };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Password reset request
  const resetPasswordWithEmail = async (email) => {
    try {
      await requestPasswordReset(email);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Contract Clauses State
  const [contractClauses, setContractClauses] = useState(() => 
    generateDefaultClauses({
      landlord: landlordProfile?.name || '',
      tenant: '',
      room: '',
      address: landlordProfile?.propertyAddress || '',
      propType: 'Boarding House / Bedspace',
      rent: '',
      dep: '',
      advance: ''
    })
  );

  const refreshClausesFromDraft = () => {
    setContractClauses(generateDefaultClauses({
      landlord: landlordName,
      tenant: isGenericTenantName(tenantName) ? '' : tenantName,
      room: roomNumber,
      address: propertyAddress,
      propType: propertyType,
      rent: monthlyRent,
      dep: deposit,
      advance: advanceRent,
      duration: leaseDuration
    }));
  };

  // Start a new contract wizard: NO room code generated yet (per Requirement 3)
  const startNewContract = () => {
    setActiveCode(''); // Do NOT generate room code until Kasulatan is saved!
    setPropertyType('Boarding House / Bedspace');
    setLandlordName(landlordProfile?.name || '');
    setContactNumber(landlordProfile?.phone || '');
    setTenantName('');
    setRoomNumber('');
    setPropertyAddress(
      landlordProfile?.propertyAddress || 
      (landlordProfile?.propertyName ? `${landlordProfile.propertyName}, ${landlordProfile.city || ''}` : '')
    );
    setMonthlyRent('');
    setDeposit('');
    setAdvanceRent('');
    setLeaseDuration('6 months');
    setRentReminderEnabled(true);

    // Clear draft storage keys
    localStorage.removeItem('rip_active_code');
    localStorage.removeItem('rip_draft_tenantName');
    localStorage.removeItem('rip_draft_roomNumber');
    localStorage.removeItem('rip_draft_monthlyRent');
    localStorage.removeItem('rip_draft_deposit');
    localStorage.removeItem('rip_draft_advanceRent');

    setContractClauses(generateDefaultClauses({
      landlord: landlordProfile?.name || '',
      tenant: '',
      room: '',
      address: landlordProfile?.propertyAddress || '',
      propType: 'Boarding House / Bedspace',
      rent: '',
      dep: '',
      advance: ''
    }));

    setCurrentScreen('WIZARD_PROPERTY');
  };

  // Save finalized contract into Cloud Firestore: Room code generated ONLY here (Requirement 3)
  const saveFinalizedContract = async () => {
    let codeToUse = (activeCode && activeCode.trim()) || null;
    if (!codeToUse) {
      codeToUse = await createUniqueRoomCode(db);
    }
    setActiveCode(codeToUse);

    const cleanTenant = isGenericTenantName(tenantName) ? '' : tenantName;

    const newContract = {
      id: codeToUse,
      code: codeToUse,
      accessCode: null, // No access code before landlord payment verification!
      createdAt: new Date().toISOString(),
      landlordId: landlordProfile?.phone || landlordProfile?.id || contactNumber || 'LANDLORD-DEFAULT',
      landlordName: landlordName || landlordProfile?.name || 'Landlord',
      contactNumber: contactNumber || landlordProfile?.phone || '',
      tenantName: cleanTenant,
      roomNumber: roomNumber || 'Unit 1',
      propertyAddress: propertyAddress || landlordProfile?.propertyAddress || 'Specified Rental Unit',
      propertyType,
      monthlyRent: Number(monthlyRent) || 0,
      deposit: Number(deposit) || 0,
      advanceRent: Number(advanceRent) || 0,
      leaseDuration,
      rentReminderEnabled,
      contractClauses,
      landlordSigningMode,
      landlordSignature,
      status: 'Active',
      isSigned: false,
      paymentVerified: false,
      dueDay: 'Every 5th',
      paymentHistory: [
        { cycle: 'Advance / Move-in Deposit', status: 'Pending Verification', date: new Date().toLocaleDateString() }
      ]
    };

    const existingIndex = contracts.findIndex(c => c.code === newContract.code);
    let updated;
    if (existingIndex >= 0) {
      updated = [...contracts];
      updated[existingIndex] = newContract;
    } else {
      updated = [newContract, ...contracts];
    }
    setContracts(updated);

    // Write to Firebase Cloud Firestore directly
    try {
      await Promise.race([
        (async () => {
          await setDoc(doc(db, 'contracts', newContract.code), newContract, { merge: true });
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
      ]);
      setDbStatus('connected');
    } catch (err) {
      if (err.code === 'permission-denied') setDbStatus('rules_needed');
      console.warn('[Firebase] Firestore contract write notice:', err.message);
    }

    return newContract;
  };

  // AI Contract Customizer powered by Google Gemini API (Agent D)
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiIsCustomizing, setAiIsCustomizing] = useState(false);
  const [aiUpdateToast, setAiUpdateToast] = useState('');
  const [aiError, setAiError] = useState('');

  const handleApplyAiCustomization = async (promptText) => {
    const queryText = (promptText || aiCustomPrompt).trim();
    if (!queryText) return;

    setAiIsCustomizing(true);
    setAiError('');
    try {
      const generated = await generateClause(queryText, contractClauses, {
        propertyAddress,
        monthlyRent,
        deposit,
        propertyType
      });

      let updated = [...contractClauses];
      if (generated.action === 'update' && generated.targetClauseNum) {
        const idx = updated.findIndex(c => c.num === generated.targetClauseNum);
        const cleanTitle = (generated.title || 'Clause').replace(/^\d+\.\s*/, '');
        const clauseData = {
          num: generated.targetClauseNum,
          title: `${generated.targetClauseNum}. ${cleanTitle}`,
          text: generated.text
        };
        if (idx >= 0) updated[idx] = clauseData;
        else updated.push(clauseData);
      } else {
        const nextNum = updated.length + 1;
        const cleanTitle = (generated.title || 'Special Clause').replace(/^\d+\.\s*/, '');
        updated.push({
          num: nextNum,
          title: `${nextNum}. ${cleanTitle}`,
          text: generated.text
        });
      }

      setContractClauses(updated);
      setAiUpdateToast(generated.toast || 'Clause generated with Gemini AI!');
      setAiCustomPrompt('');
      setTimeout(() => setAiUpdateToast(''), 4500);
    } catch (err) {
      console.warn('[Gemini AI] Clause generation exception:', err.message);
      setAiError(err.message || 'Gemini AI failed to generate clause. Please check your API key and retry.');
    } finally {
      setAiIsCustomizing(false);
    }
  };

  // Directly add custom clause as written by the landlord (Requirement 7)
  const handleAddDirectCustomClause = (customText) => {
    const textToAdd = (customText || aiCustomPrompt).trim();
    if (!textToAdd) return;

    const nextNum = contractClauses.length + 1;
    const updated = [
      ...contractClauses,
      {
        num: nextNum,
        title: `${nextNum}. Special Landlord Condition`,
        text: textToAdd,
        custom: true,
        isCustom: true
      }
    ];

    setContractClauses(updated);
    setAiCustomPrompt('');
    setAiError('');
    setAiUpdateToast('Added custom landlord clause.');
    setTimeout(() => setAiUpdateToast(''), 3000);
  };

  // Tenant Portal State
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeTenantContract, setActiveTenantContract] = useState(null);
  const [tenantHasReadContract, setTenantHasReadContract] = useState(false);
  const [signingMode, setSigningMode] = useState('DIGITAL');
  const [signatureData, setSignatureData] = useState(null);
  const [idFileData, setIdFileData] = useState(null);
  const [gcashFileData, setGcashFileData] = useState(null);
  const [gcashRefNumber, setGcashRefNumber] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load contract into active view
  const loadContractIntoActiveState = (contractData) => {
    setActiveTenantContract(contractData);
    setLandlordName(contractData.landlordName || '');
    setContactNumber(contractData.contactNumber || '');
    
    const cleanTenant = isGenericTenantName(contractData.tenantName) ? '' : contractData.tenantName;
    setTenantName(cleanTenant);
    setRoomNumber(contractData.roomNumber || '');
    setPropertyAddress(contractData.propertyAddress || '');
    setPropertyType(contractData.propertyType || 'Boarding House / Bedspace');
    setMonthlyRent(contractData.monthlyRent || '');
    setDeposit(contractData.deposit || '');
    setAdvanceRent(contractData.advanceRent || '');
    setActiveCode(contractData.code || contractData.id || '');
    setLandlordSigningMode(contractData.landlordSigningMode || 'DIGITAL');
    setLandlordSignature(contractData.landlordSignature || null);

    const currentClauses = contractData.contractClauses || generateDefaultClauses({
      landlord: contractData.landlordName,
      tenant: cleanTenant,
      room: contractData.roomNumber,
      address: contractData.propertyAddress,
      propType: contractData.propertyType,
      rent: contractData.monthlyRent,
      dep: contractData.deposit,
      advance: contractData.advanceRent,
      duration: contractData.leaseDuration
    });

    setContractClauses(currentClauses);
  };

  // Real-time lookup: Firebase Firestore first
  const lookupContractByCode = async (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return null;

    try {
      const contractDoc = await getDoc(doc(db, 'contracts', cleanCode));
      if (contractDoc.exists()) {
        const cloudData = { ...contractDoc.data(), id: contractDoc.id, code: contractDoc.id };
        loadContractIntoActiveState(cloudData);
        setDbStatus('connected');
        return cloudData;
      }
    } catch (err) {
      if (err.code === 'permission-denied') setDbStatus('rules_needed');
    }

    const foundLocal = contracts.find(c => c.code?.toUpperCase() === cleanCode);
    if (foundLocal) {
      loadContractIntoActiveState(foundLocal);
      return foundLocal;
    }

    return null;
  };

  // Tenant Register via Firebase Auth
  const registerTenant = async ({ username, password, email, name, phone, code }) => {
    try {
      const tenantRecord = await registerTenantUser({
        username,
        password,
        email,
        name,
        phone,
        code: code || activeCode || roomCodeInput
      });

      const cleanCode = tenantRecord.contractCode;
      if (cleanCode) {
        await lookupContractByCode(cleanCode);
        setActiveCode(cleanCode);
        setContracts(prev => prev.map(c => {
          if (c.code === cleanCode || c.id === cleanCode) {
            return {
              ...c,
              tenantName: tenantRecord.name,
              tenantUsername: tenantRecord.username
            };
          }
          return c;
        }));
      }

      setTenantProfile(tenantRecord);
      setTenantName(tenantRecord.name);
      setUserRole('TENANT');
      localStorage.setItem('rip_user_role', 'TENANT');

      return { success: true, tenant: tenantRecord, hasContract: Boolean(cleanCode) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Tenant Sign In via Firebase Auth
  const loginTenant = async (usernameOrEmail, password, code) => {
    try {
      const tenantData = await loginTenantUser({ identifier: usernameOrEmail, password, code });

      const targetCode = code || tenantData.contractCode || activeCode || roomCodeInput;
      if (targetCode) {
        await lookupContractByCode(targetCode);
        setActiveCode(targetCode);
      }

      setTenantProfile(tenantData);
      setTenantName(tenantData.name || tenantData.username);
      setUserRole('TENANT');
      localStorage.setItem('rip_user_role', 'TENANT');

      return { success: true, tenant: tenantData, hasContract: Boolean(targetCode) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Record tenant check-in: Access code is NOT generated or sent here (Requirement 4 & 5)
  const recordTenantCheckin = async () => {
    const contractCode = activeCode || roomCodeInput || 'RIP-KEY';
    const amountVal = Number(advanceRent || monthlyRent || 0);
    const receiptImage = gcashFileData?.dataUrl || gcashFileData?.preview || (typeof gcashFileData === 'string' ? gcashFileData : null);
    const cleanTenant = (!isGenericTenantName(tenantName) ? tenantName : null) || tenantProfile?.name || 'Resident';

    const checkinPayload = {
      contractCode,
      tenantName: cleanTenant,
      signingMode,
      isIdVerified: Boolean(idFileData),
      idFileName: idFileData?.meta?.name || 'ID Photo Uploaded',
      gcashRef: gcashRefNumber || 'Direct Payment Submitted',
      hasReceipt: Boolean(receiptImage),
      receiptData: receiptImage,
      signedAt: new Date().toISOString()
    };

    const baseContractUpdate = {
      status: 'Pending Verification',
      isSigned: true,
      paymentVerified: false,
      accessCode: null, // Explicitly null until landlord verifies!
      tenantSignedAt: new Date().toISOString(),
      tenantName: cleanTenant,
      signingMode: signingMode || checkinPayload.signingMode,
      signatureData: signatureData || null,
      idFileData: idFileData || null,
      gcashRef: checkinPayload.gcashRef,
      gcashReceiptData: receiptImage,
      advancePaidAmount: amountVal
    };

    let updatedContracts;
    const contractExists = contracts.some(c => c.code === contractCode || c.id === contractCode);
    if (contractExists) {
      updatedContracts = contracts.map(c => {
        if (c.code === contractCode || c.id === contractCode) {
          return { ...c, ...baseContractUpdate };
        }
        return c;
      });
    } else {
      updatedContracts = [
        ...contracts,
        {
          id: contractCode,
          code: contractCode,
          ...baseContractUpdate,
          roomNumber: roomNumber || 'Unit 1',
          monthlyRent: monthlyRent || 0,
          deposit: deposit || 0,
          propertyAddress: propertyAddress || 'Specified Property Address'
        }
      ];
    }
    setContracts(updatedContracts);

    // Initial advance rent payment log
    const initialPayment = {
      id: `pay-${Date.now()}`,
      contractCode,
      tenantName: cleanTenant,
      cycleName: 'Advance / Move-in Deposit',
      amount: amountVal,
      gcashRef: checkinPayload.gcashRef,
      receiptData: receiptImage,
      status: 'Pending Verification',
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [initialPayment, ...prev.filter(p => !(p.contractCode === contractCode && p.cycleName === 'Advance / Move-in Deposit'))]);

    try {
      await Promise.race([
        (async () => {
          await addDoc(collection(db, 'checkins'), checkinPayload);
          await addDoc(collection(db, 'payments'), initialPayment);
          await setDoc(doc(db, 'contracts', contractCode), {
            status: 'Pending Verification',
            isSigned: true,
            paymentVerified: false,
            accessCode: null,
            tenantSignedAt: new Date().toISOString(),
            tenantSignature: signatureData || 'Digital Signature Stored',
            gcashRef: gcashRefNumber || 'Direct Payment Submitted',
            gcashReceiptData: receiptImage,
            advancePaidAmount: amountVal
          }, { merge: true });
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
      ]);
      setDbStatus('connected');
    } catch (err) {
      if (err.code === 'permission-denied') setDbStatus('rules_needed');
      console.warn('[Firebase] Check-in record notice:', err.message);
    }
  };

  // Landlord verification of tenant payment: Generates secure random access code (Requirement 4 & 5)
  const verifyTenantPayment = async (contractCode, paymentId = null) => {
    if (!contractCode) return null;
    const cleanCode = contractCode.trim().toUpperCase();

    // Generate cryptographically secure access code and persist to Firestore
    const { accessCode: newCode } = await verifyPaymentAndIssueCode(cleanCode, paymentId, db);

    // Update local state with the newly verified status and access code
    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return {
          ...c,
          status: 'Active',
          paymentVerified: true,
          accessCode: newCode,
          verifiedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    setPayments(prev => prev.map(p => {
      if (p.contractCode === cleanCode && (!paymentId || p.id === paymentId)) {
        return {
          ...p,
          status: 'Verified',
          verifiedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    if (activeTenantContract && (activeTenantContract.code === cleanCode || activeTenantContract.id === cleanCode)) {
      setActiveTenantContract(prev => ({
        ...prev,
        status: 'Active',
        paymentVerified: true,
        accessCode: newCode
      }));
    }

    return newCode;
  };

  // Landlord regeneration of access code (invalidates old code) (Requirement 4)
  const regenerateTenantAccessCode = async (contractCode) => {
    if (!contractCode) return null;
    const cleanCode = contractCode.trim().toUpperCase();

    const { accessCode: newCode } = await regenerateAccessCode(cleanCode, db);

    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return { ...c, accessCode: newCode };
      }
      return c;
    }));

    if (activeTenantContract && (activeTenantContract.code === cleanCode || activeTenantContract.id === cleanCode)) {
      setActiveTenantContract(prev => ({ ...prev, accessCode: newCode }));
    }

    return newCode;
  };

  // Landlord rejection or request for new payment proof
  const rejectTenantPayment = async (contractCode, reason = 'Payment proof invalid or not found') => {
    if (!contractCode) return;
    const cleanCode = contractCode.trim().toUpperCase();

    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return {
          ...c,
          paymentVerified: false,
          paymentRejectionReason: reason,
          status: 'Payment Resubmission Required'
        };
      }
      return c;
    }));

    try {
      await setDoc(doc(db, 'contracts', cleanCode), {
        paymentVerified: false,
        paymentRejectionReason: reason,
        status: 'Payment Resubmission Required'
      }, { merge: true });
    } catch (err) {}
  };

  // In-app tenant payment submission
  const submitTenantPayment = async ({ contractCode, amount, cycleName, gcashRef, receiptData }) => {
    const cleanCode = (contractCode || activeCode || '').trim().toUpperCase();
    const receiptImage = receiptData?.dataUrl || receiptData?.preview || (typeof receiptData === 'string' ? receiptData : null);
    const cleanTenant = (!isGenericTenantName(tenantName) ? tenantName : null) || tenantProfile?.name || 'Resident';

    const newPayment = {
      id: `pay-${Date.now()}`,
      contractCode: cleanCode,
      tenantName: cleanTenant,
      cycleName: cycleName || 'Monthly Rent Payment',
      amount: Number(amount) || 0,
      gcashRef: gcashRef || '',
      receiptData: receiptImage,
      status: 'Pending Verification',
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    };

    setPayments(prev => [newPayment, ...prev]);

    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return {
          ...c,
          paymentVerified: false,
          latestPaymentStatus: 'Pending Verification',
          latestPaymentAmount: Number(amount),
          latestGcashRef: gcashRef,
          gcashRef: gcashRef,
          gcashReceiptData: receiptImage
        };
      }
      return c;
    }));

    try {
      await addDoc(collection(db, 'payments'), newPayment);
      if (cleanCode) {
        await setDoc(doc(db, 'contracts', cleanCode), {
          paymentVerified: false,
          latestPaymentStatus: 'Pending Verification',
          latestPaymentAmount: Number(amount),
          latestGcashRef: gcashRef,
          gcashRef: gcashRef,
          gcashReceiptData: receiptImage
        }, { merge: true });
      }
    } catch (err) {}

    return newPayment;
  };

  // Logout / Switch Account
  const logout = async () => {
    await signOutUser();
    localStorage.removeItem('rip_user_role');
    localStorage.removeItem('rip_landlord_profile');
    localStorage.removeItem('rip_tenant_profile');
    localStorage.removeItem('rip_current_screen');
    setUserRole(null);
    setLandlordProfileState(null);
    setTenantProfileState(null);
    setActiveTenantContract(null);
    setCurrentScreen('SPLASH');
  };

  // Selected Tenant for Landlord Details Screen
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Filter & Search in Tenants Screen
  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Tenants derived from live contracts
  const tenantsList = contracts.map((c, idx) => {
    const rawName = c.tenantName || '';
    const cleanName = isGenericTenantName(rawName) ? (c.tenantUsername || 'Resident') : rawName;
    return {
      id: c.id || c.code || idx + 1,
      avatar: cleanName.substring(0, 2).toUpperCase(),
      name: cleanName,
      unit: `${c.roomNumber} · ${c.propertyType || 'Bedspace'}`,
      rent: c.monthlyRent || 0,
      status: c.status || 'Active',
      isSigned: Boolean(c.isSigned),
      paymentVerified: Boolean(c.paymentVerified),
      accessCode: c.accessCode || null,
      signingMode: c.signingMode || 'DIGITAL',
      signatureData: c.signatureData || null,
      idFileData: c.idFileData || null,
      gcashRef: c.gcashRef || c.latestGcashRef || '',
      gcashReceiptData: c.gcashReceiptData || null,
      due: c.dueDay || 'Every 5th',
      phone: c.tenantPhone || c.contactNumber || '09XXXXXXXXX',
      contract: c
    };
  });

  const filteredTenants = tenantsList.filter(t => {
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = t.name && t.name.toLowerCase().includes(q);
      const matchUnit = t.unit && t.unit.toLowerCase().includes(q);
      const matchCode = t.contract?.code && t.contract.code.toLowerCase().includes(q);
      if (!matchName && !matchUnit && !matchCode) return false;
    }

    if (tenantFilter === 'ACTIVE') {
      return Boolean(t.paymentVerified);
    }
    if (tenantFilter === 'PENDING') {
      return !t.paymentVerified || t.status === 'Pending Verification' || Boolean(t.gcashRef && !t.paymentVerified);
    }
    if (tenantFilter === 'DUE') {
      return !t.paymentVerified || (t.due && t.due.includes('5th'));
    }

    return true;
  });

  const handleCopyLink = () => {
    if (!activeCode) return;
    const url = `${window.location.origin}?code=${activeCode}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Reset entire application data for clean testing
  const resetAppData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}

    setUserRole(null);
    setLandlordProfileState(null);
    setTenantProfileState(null);
    setContractsState([]);
    setPaymentsState([]);
    setSelectedTenant(null);
    setActiveTenantContract(null);
    setRoomCodeInput('');
    setActiveCode('');
    setLandlordName('');
    setContactNumber('');
    setTenantName('');
    setRoomNumber('');
    setPropertyAddress('');
    setMonthlyRent('');
    setDeposit('');
    setAdvanceRent('');
    setLandlordSigningMode('DIGITAL');
    setLandlordSignature(null);
    setSignatureData(null);
    setIdFileData(null);
    setGcashFileData(null);
    setGcashRefNumber('');
    setTenantHasReadContract(false);
    setCurrentScreen('SPLASH');
  };

  return (
    <AppContext.Provider value={{
      currentScreen, setCurrentScreen, navigateBack,
      userRole, setUserRole,
      dbStatus,
      landlordProfile, setLandlordProfile,
      loginLandlord, registerLandlord, resetPasswordWithEmail,
      tenantProfile, setTenantProfile,
      loginTenant, registerTenant,
      logout,
      contracts, setContracts,
      payments, setPayments,
      verifyTenantPayment, rejectTenantPayment, regenerateTenantAccessCode, submitTenantPayment,
      propertyType, setPropertyType,
      landlordName, setLandlordName,
      contactNumber, setContactNumber,
      roomNumber, setRoomNumber,
      propertyAddress, setPropertyAddress,
      monthlyRent, setMonthlyRent,
      deposit, setDeposit,
      advanceRent, setAdvanceRent,
      leaseDuration, setLeaseDuration,
      rentReminderEnabled, setRentReminderEnabled,
      contractClauses, setContractClauses,
      refreshClausesFromDraft,
      startNewContract,
      saveFinalizedContract,
      aiCustomPrompt, setAiCustomPrompt,
      aiIsCustomizing, setAiIsCustomizing,
      aiUpdateToast, setAiUpdateToast,
      aiError, setAiError,
      handleApplyAiCustomization,
      handleAddDirectCustomClause,
      roomCodeInput, setRoomCodeInput,
      activeCode, setActiveCode,
      tenantName, setTenantName,
      activeTenantContract,
      lookupContractByCode,
      recordTenantCheckin,
      idFileData, setIdFileData,
      gcashFileData, setGcashFileData,
      gcashRefNumber, setGcashRefNumber,
      signatureData, setSignatureData,
      landlordSigningMode, setLandlordSigningMode,
      landlordSignature, setLandlordSignature,
      tenantHasReadContract, setTenantHasReadContract,
      signingMode, setSigningMode,
      copiedLink, setCopiedLink,
      handleCopyLink,
      selectedTenant, setSelectedTenant,
      tenantFilter, setTenantFilter,
      searchQuery, setSearchQuery,
      tenantsList, filteredTenants,
      resetAppData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
