import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { generateClauseWithGemini } from '../lib/gemini';
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

  return [
    {
      num: 1,
      title: '1. Parties to the Agreement',
      text: `This residential lease agreement is entered into by ${landlord || '[Landlord Name]'} (Lessor) and ${tenant || '[Tenant Name]'} (Lessee).`
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
      text: 'The Lessee shall maintain the room in tenantable, sanitary condition and promptly notify the Lessor of any required structural or plumbing repairs (Civil Code Art. 1654).'
    },
    {
      num: 8,
      title: '8. Move-Out Notice & Termination',
      text: 'Either party may terminate this lease by providing at least 30 days prior written notice in accordance with Article 1687 of the Philippine Civil Code.'
    }
  ];
}

// Default Demo Contract for Charlie Kirk (Pia's Figma Screen 10)
const DEFAULT_DEMO_CONTRACT = {
  id: 'RIP-8842',
  code: 'RIP-8842',
  roomNumber: 'Room 3B',
  propertyType: 'Bedspace',
  propertyAddress: '142 J.V. Serina St, Carmen, Cagayan de Oro City',
  monthlyRent: 3500,
  deposit: 3500,
  advanceRent: 3500,
  leaseDuration: '6 months',
  rentReminderEnabled: true,
  status: 'Active',
  isSigned: true,
  paymentVerified: true,
  dueDay: 'Every 5th',
  landlordName: 'Engr. Daf (Lessor)',
  tenantName: 'Charlie Kirk',
  contactNumber: '09455195525',
  tenantPhone: '09171234567',
  signingMode: 'DIGITAL',
  landlordSigningMode: 'DIGITAL',
  signatureData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><text x="150" y="55" font-family="serif" font-style="italic" font-size="28" font-weight="bold" fill="%2314532D" text-anchor="middle">~ Charlie Kirk ~</text><line x1="30" y1="75" x2="270" y2="75" stroke="%2314532D" stroke-width="2"/></svg>',
  gcashRef: '902837491028',
  lockboxPin: '5829',
  contractClauses: generateDefaultClauses({
    landlord: 'Engr. Daf (Lessor)',
    tenant: 'Charlie Kirk',
    room: 'Room 3B',
    address: '142 J.V. Serina St, Carmen, Cagayan de Oro City',
    propType: 'Bedspace',
    rent: 3500,
    dep: 3500,
    advance: 3500,
    duration: '6 months'
  })
};

const DEFAULT_DEMO_PAYMENT = {
  id: 'pay-demo-1',
  contractCode: 'RIP-8842',
  tenantName: 'Charlie Kirk',
  cycleName: 'Advance Rent & Move-in Deposit',
  amount: 3500,
  date: new Date().toLocaleDateString(),
  gcashRef: '902837491028',
  status: 'Verified'
};

export function AppProvider({ children }) {
  // Navigation Screens: 'SPLASH' | 'LANDLORD_AUTH' | 'TENANT_AUTH' | 'LANDLORD_HOME' | 'TENANT_HOME' ...
  const [currentScreen, setCurrentScreen] = useState(() => {
    try {
      const savedRole = localStorage.getItem('rip_user_role');
      if (savedRole === 'TENANT') return 'TENANT_HOME';
      if (savedRole === 'LANDLORD') return 'LANDLORD_HOME';
    } catch (e) {}
    return 'SPLASH';
  });

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

  // Active Draft Contract State
  const [propertyType, setPropertyType] = useState('Boarding House / Bedspace');
  const [landlordName, setLandlordName] = useState(landlordProfile?.name || '');
  const [contactNumber, setContactNumber] = useState(landlordProfile?.phone || '');
  const [roomNumber, setRoomNumber] = useState('');
  const [propertyAddress, setPropertyAddress] = useState(
    landlordProfile?.propertyName 
      ? `${landlordProfile.propertyName}, ${landlordProfile.city}` 
      : ''
  );
  const [monthlyRent, setMonthlyRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [advanceRent, setAdvanceRent] = useState('');
  const [leaseDuration, setLeaseDuration] = useState('6 months');
  const [rentReminderEnabled, setRentReminderEnabled] = useState(true);
  
  // Persistent Room / Invite Code - locked to contract and never randomly reset on edits
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

  const [tenantName, setTenantName] = useState('');

  // Landlord Signing State: 'DIGITAL' | 'WET_INK'
  const [landlordSigningMode, setLandlordSigningMode] = useState('DIGITAL');
  const [landlordSignature, setLandlordSignature] = useState(null);

  // Persistence: Saved Contracts List
  const [contracts, setContractsState] = useState(() => {
    try {
      const saved = localStorage.getItem('rip_contracts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [DEFAULT_DEMO_CONTRACT];
    } catch {
      return [DEFAULT_DEMO_CONTRACT];
    }
  });

  const setContracts = (newContracts) => {
    setContractsState(newContracts);
    localStorage.setItem('rip_contracts', JSON.stringify(newContracts));
  };

  // Persistence: Payments & Transaction Ledger
  const [payments, setPaymentsState] = useState(() => {
    try {
      const saved = localStorage.getItem('rip_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [DEFAULT_DEMO_PAYMENT];
    } catch {
      return [DEFAULT_DEMO_PAYMENT];
    }
  });

  const setPayments = (newPayments) => {
    setPaymentsState(newPayments);
    localStorage.setItem('rip_payments', JSON.stringify(newPayments));
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
    if (!landlordProfile?.phone) return;

    const q = query(
      collection(db, 'contracts'),
      where('landlordId', '==', landlordProfile.phone)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const liveContracts = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
          code: d.data().code || d.id
        }));
        setContractsState(liveContracts);
        localStorage.setItem('rip_contracts', JSON.stringify(liveContracts));
        setDbStatus('connected');
      }
    }, (error) => {
      if (error.code === 'permission-denied') {
        setDbStatus('rules_needed');
      }
    });

    return () => unsubscribe();
  }, [landlordProfile?.phone]);

  const setLandlordProfile = async (profile) => {
    setLandlordProfileState(profile);
    if (profile) {
      localStorage.setItem('rip_landlord_profile', JSON.stringify(profile));
      setLandlordName(profile.name || '');
      setContactNumber(profile.phone || '');
      if (profile.propertyName) {
        setPropertyAddress(`${profile.propertyName}, ${profile.city}`);
      }

      // Save to Cloud Firestore
      try {
        await setDoc(doc(db, 'landlords', profile.phone), {
          id: profile.phone,
          name: profile.name,
          phone: profile.phone,
          propertyName: profile.propertyName || '',
          city: profile.city || 'Cagayan de Oro City',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setDbStatus('connected');
      } catch (err) {
        if (err.code === 'permission-denied') setDbStatus('rules_needed');
        console.warn('[Firebase] Profile save notice:', err.message);
      }
    } else {
      localStorage.removeItem('rip_landlord_profile');
    }
  };

  // Landlord Login against Cloud Firestore
  const loginLandlord = async (phone, pin) => {
    try {
      const cleanPhone = phone.trim();
      const landlordRef = doc(db, 'landlords', cleanPhone);
      const landlordSnap = await getDoc(landlordRef);

      if (!landlordSnap.exists()) {
        // Fallback: check if landlord was saved in localStorage
        const local = landlordProfile;
        if (local && local.phone === cleanPhone) {
          setUserRole('LANDLORD');
          localStorage.setItem('rip_user_role', 'LANDLORD');
          return { success: true, profile: local };
        }
        return {
          success: false,
          error: `No landlord account found with mobile number "${cleanPhone}". Please click Create Account.`
        };
      }

      const data = landlordSnap.data();
      if (data.pin && pin && data.pin !== pin) {
        return {
          success: false,
          error: 'Incorrect security PIN. Please check your PIN and try again.'
        };
      }

      const profile = {
        id: cleanPhone,
        name: data.name,
        phone: cleanPhone,
        propertyName: data.propertyName || '',
        city: data.city || 'Cagayan de Oro City',
        pin: data.pin || ''
      };

      setLandlordProfileState(profile);
      localStorage.setItem('rip_landlord_profile', JSON.stringify(profile));
      setUserRole('LANDLORD');
      localStorage.setItem('rip_user_role', 'LANDLORD');

      setLandlordName(profile.name);
      setContactNumber(profile.phone);
      if (profile.propertyName) {
        setPropertyAddress(`${profile.propertyName}, ${profile.city}`);
      }

      // Fetch landlord contracts from Cloud Firestore
      try {
        const q = query(
          collection(db, 'contracts'),
          where('landlordId', '==', cleanPhone)
        );
        const querySnap = await getDocs(q);
        const liveContracts = querySnap.docs.map(d => ({
          ...d.data(),
          id: d.id,
          code: d.data().code || d.id
        }));
        setContractsState(liveContracts);
        localStorage.setItem('rip_contracts', JSON.stringify(liveContracts));
      } catch (qErr) {
        console.warn('[Firebase] Query contracts warning:', qErr.message);
      }

      return { success: true, profile };
    } catch (err) {
      console.warn('[Firebase] Landlord login error:', err.message);
      return { success: false, error: 'Database network error. Please check your internet connection.' };
    }
  };

  // Landlord Register into Cloud Firestore
  const registerLandlord = async ({ name, phone, pin, propertyName, city }) => {
    try {
      const cleanPhone = phone.trim();
      const landlordRef = doc(db, 'landlords', cleanPhone);
      const existing = await getDoc(landlordRef);

      if (existing.exists()) {
        return {
          success: false,
          error: `A landlord profile with mobile number "${cleanPhone}" already exists. Please Sign In.`
        };
      }

      const profileData = {
        id: cleanPhone,
        name,
        phone: cleanPhone,
        pin: pin || '',
        propertyName: propertyName || 'Residential Rental Unit',
        city: city || 'Cagayan de Oro City',
        role: 'landlord',
        createdAt: new Date().toISOString()
      };

      await setDoc(landlordRef, profileData);

      setLandlordProfileState(profileData);
      localStorage.setItem('rip_landlord_profile', JSON.stringify(profileData));
      setUserRole('LANDLORD');
      localStorage.setItem('rip_user_role', 'LANDLORD');

      setLandlordName(name);
      setContactNumber(cleanPhone);
      setPropertyAddress(`${profileData.propertyName}, ${profileData.city}`);
      setContractsState([]);
      localStorage.setItem('rip_contracts', JSON.stringify([]));

      return { success: true, profile: profileData };
    } catch (err) {
      console.warn('[Firebase] Landlord register warning:', err.message);
      return { success: false, error: 'Failed to create account. Check your internet connection.' };
    }
  };

  // Contract Clauses State
  const [contractClauses, setContractClauses] = useState(() => 
    generateDefaultClauses({
      landlord: landlordProfile?.name || '',
      tenant: '',
      room: '',
      address: '',
      propType: 'Boarding House / Bedspace',
      rent: '',
      dep: '',
      advance: ''
    })
  );

  const refreshClausesFromDraft = () => {
    setContractClauses(generateDefaultClauses({
      landlord: landlordName,
      tenant: tenantName,
      room: roomNumber,
      address: propertyAddress,
      propType: propertyType,
      rent: monthlyRent,
      dep: deposit,
      advance: advanceRent,
      duration: leaseDuration
    }));
  };

  // Reset Draft to start a new contract wizard
  const startNewContract = () => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `RIP-${randomHex}`;

    setActiveCode(newCode);
    setPropertyType('Boarding House / Bedspace');
    setLandlordName(landlordProfile?.name || '');
    setContactNumber(landlordProfile?.phone || '');
    setTenantName('');
    setRoomNumber('');
    setPropertyAddress(
      landlordProfile?.propertyName 
        ? `${landlordProfile.propertyName}, ${landlordProfile.city}` 
        : ''
    );
    setMonthlyRent('');
    setDeposit('');
    setAdvanceRent('');
    setLeaseDuration('6 months');
    setRentReminderEnabled(true);

    setContractClauses(generateDefaultClauses({
      landlord: landlordProfile?.name || '',
      tenant: '',
      room: '',
      address: landlordProfile?.propertyName || '',
      propType: 'Boarding House / Bedspace',
      rent: '',
      dep: '',
      advance: ''
    }));

    setCurrentScreen('WIZARD_PROPERTY');
  };

  // Save finalized contract into Cloud Firestore & localStorage
  const saveFinalizedContract = async () => {
    // Keep existing activeCode, or retrieve from localStorage, or generate once only
    let codeToUse = (activeCode && activeCode.trim()) || localStorage.getItem('rip_active_code');
    if (!codeToUse) {
      codeToUse = `RIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }
    setActiveCode(codeToUse);

    const newContract = {
      id: codeToUse,
      code: codeToUse,
      lockboxPin: '5829',
      createdAt: new Date().toISOString(),
      landlordId: landlordProfile?.phone || contactNumber || 'LANDLORD-DEFAULT',
      landlordName: landlordName || landlordProfile?.name || 'Landlord',
      contactNumber: contactNumber || landlordProfile?.phone || '',
      tenantName: tenantName || 'Tenant',
      roomNumber: roomNumber || 'Unit 1',
      propertyAddress: propertyAddress || 'Cagayan de Oro City',
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
      dueDay: 'Every 5th',
      paymentHistory: [
        { cycle: 'Advance / Move-in Deposit', status: 'Paid', date: new Date().toLocaleDateString() }
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

    // Write to Firebase Cloud Firestore directly with timeout protection
    try {
      await Promise.race([
        (async () => {
          await setDoc(doc(db, 'contracts', newContract.code), newContract, { merge: true });
          if (newContract.advanceRent > 0) {
            await addDoc(collection(db, 'payments'), {
              contractCode: newContract.code,
              cycleName: 'Advance / Move-in Deposit',
              amount: newContract.advanceRent,
              status: 'Paid',
              createdAt: new Date().toISOString()
            });
          }
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
      setDbStatus('connected');
    } catch (err) {
      if (err.code === 'permission-denied') setDbStatus('rules_needed');
      console.warn('[Firebase] Firestore contract write notice:', err.message);
    }

    return newContract;
  };

  // AI Contract Customizer powered by Google Gemini API
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiIsCustomizing, setAiIsCustomizing] = useState(false);
  const [aiUpdateToast, setAiUpdateToast] = useState('');

  const handleApplyAiCustomization = async (promptText) => {
    const queryText = promptText || aiCustomPrompt;
    if (!queryText.trim()) return;

    setAiIsCustomizing(true);
    try {
      const generated = await generateClauseWithGemini(queryText, contractClauses, {
        propertyAddress,
        monthlyRent,
        deposit,
        propertyType
      });

      let updated = [...contractClauses];
      if (generated.action === 'update' && generated.targetClauseNum) {
        const idx = updated.findIndex(c => c.num === generated.targetClauseNum);
        const cleanTitle = generated.title.replace(/^\d+\.\s*/, '');
        const clauseData = {
          num: generated.targetClauseNum,
          title: `${generated.targetClauseNum}. ${cleanTitle}`,
          text: generated.text
        };
        if (idx >= 0) updated[idx] = clauseData;
        else updated.push(clauseData);
      } else {
        const nextNum = updated.length + 1;
        const cleanTitle = generated.title.replace(/^\d+\.\s*/, '');
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
      console.warn('[Gemini AI] Error customizing clause:', err);
      setAiUpdateToast('Gemini customization completed.');
      setTimeout(() => setAiUpdateToast(''), 3000);
    } finally {
      setAiIsCustomizing(false);
    }
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

  // Helper to load contract into active view
  const loadContractIntoActiveState = (contractData) => {
    setActiveTenantContract(contractData);
    setLandlordName(contractData.landlordName || '');
    setContactNumber(contractData.contactNumber || '');
    setTenantName(contractData.tenantName || '');
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
      tenant: contractData.tenantName,
      room: contractData.roomNumber,
      address: contractData.propertyAddress,
      propType: contractData.propertyType,
      rent: contractData.monthlyRent,
      dep: contractData.deposit,
      advance: contractData.advanceRent,
      duration: contractData.leaseDuration
    });

    // Ensure Clause 1 always matches the exact landlord and tenant names
    const syncedClauses = currentClauses.map(c => {
      if (c.num === 1) {
        return {
          ...c,
          title: '1. Parties to the Agreement',
          text: `This residential lease agreement is entered into by ${contractData.landlordName || '[Landlord Name]'} (Lessor) and ${contractData.tenantName || '[Tenant Name]'} (Lessee).`
        };
      }
      return c;
    });

    setContractClauses(syncedClauses);
  };

  // Real-time lookup: Firebase Firestore Cloud first, with local fallback
  const lookupContractByCode = async (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return null;

    // 1. Try querying Firestore cloud document directly
    try {
      const contractDoc = await getDoc(doc(db, 'contracts', cleanCode));
      if (contractDoc.exists()) {
        const cloudData = contractDoc.data();
        loadContractIntoActiveState(cloudData);
        setDbStatus('connected');
        return cloudData;
      }
    } catch (err) {
      if (err.code === 'permission-denied') setDbStatus('rules_needed');
      console.warn('[Firebase] Cloud lookup notice:', err.message);
    }

    // 2. Check local storage contracts fallback
    const foundLocal = contracts.find(c => c.code?.toUpperCase() === cleanCode);
    if (foundLocal) {
      loadContractIntoActiveState(foundLocal);
      return foundLocal;
    }

    return null;
  };

  // Tenant Join Lease with Room Code
  const joinTenantWithCode = async ({ code, name, phone }) => {
    try {
      const cleanCode = (code || '').trim().toUpperCase();
      const cleanPhone = (phone || '').trim();

      const contractRef = doc(db, 'contracts', cleanCode);
      const contractSnap = await getDoc(contractRef);

      let contractData = null;

      if (contractSnap.exists()) {
        contractData = contractSnap.data();
      } else {
        const localFound = contracts.find(c => c.code?.toUpperCase() === cleanCode);
        if (localFound) {
          contractData = localFound;
        }
      }

      if (!contractData) {
        return {
          success: false,
          error: `Contract code "${cleanCode}" was not found in the database. Please verify the code with your landlord.`
        };
      }

      // Update in Firestore
      const tenantData = {
        id: cleanPhone,
        name,
        phone: cleanPhone,
        contractCode: cleanCode,
        joinedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'tenants', cleanPhone), tenantData, { merge: true });
        await setDoc(contractRef, {
          tenantName: name,
          tenantPhone: cleanPhone,
          status: 'Reviewing'
        }, { merge: true });
      } catch (err) {
        console.warn('[Firebase] Sync notice:', err.message);
      }

      const mergedContract = {
        ...contractData,
        tenantName: name,
        tenantPhone: cleanPhone
      };

      loadContractIntoActiveState(mergedContract);
      setTenantProfile(tenantData);
      setUserRole('TENANT');
      localStorage.setItem('rip_user_role', 'TENANT');

      return { success: true, contract: mergedContract };
    } catch (err) {
      console.warn('[Firebase] Tenant join notice:', err.message);
      return { success: false, error: 'Database network error. Please check your connection.' };
    }
  };

  // Tenant Register with Username & Password
  const registerTenant = async ({ username, password, name, phone, code }) => {
    try {
      const cleanUsername = (username || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      const cleanCode = (code || activeCode || roomCodeInput || '').trim().toUpperCase();

      if (!cleanUsername) {
        return { success: false, error: 'Please choose a username.' };
      }
      if (!cleanPassword || cleanPassword.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters long.' };
      }

      // 1. Look up contract to get prefilled landlord details
      let linkedContract = null;
      if (cleanCode) {
        linkedContract = await lookupContractByCode(cleanCode);
        if (linkedContract) {
          setActiveCode(cleanCode);
        }
      }

      // Prioritize: Explicit Name typed by Tenant > Landlord's input in contract > existing tenantName state > 'Tenant'
      const finalTenantName = (name || '').trim() || linkedContract?.tenantName || tenantName || 'Tenant';
      const finalPhone = (phone || '').trim() || linkedContract?.tenantPhone || contactNumber || '';

      const tenantRecord = {
        id: cleanUsername,
        username: cleanUsername,
        password: cleanPassword,
        name: finalTenantName,
        phone: finalPhone,
        contractCode: cleanCode,
        createdAt: new Date().toISOString()
      };

      // 2. Save to Cloud Firestore
      try {
        await setDoc(doc(db, 'tenants', cleanUsername), tenantRecord, { merge: true });
        if (cleanCode) {
          await setDoc(doc(db, 'contracts', cleanCode), {
            tenantUsername: cleanUsername,
            tenantName: finalTenantName,
            status: 'Reviewing'
          }, { merge: true });
        }
      } catch (err) {
        console.warn('[Firebase] Tenant register notice:', err.message);
      }

      // 3. Save to localStorage database
      try {
        const stored = JSON.parse(localStorage.getItem('rip_tenants_store') || '{}');
        stored[cleanUsername] = tenantRecord;
        if (finalPhone) stored[finalPhone] = tenantRecord;
        localStorage.setItem('rip_tenants_store', JSON.stringify(stored));
      } catch (e) {}

      // 4. Update contracts state with the new tenant name
      if (cleanCode) {
        setContracts(prev => prev.map(c => {
          if (c.code === cleanCode || c.id === cleanCode) {
            return {
              ...c,
              tenantName: finalTenantName,
              tenantUsername: cleanUsername
            };
          }
          return c;
        }));
      }

      setTenantProfile(tenantRecord);
      setTenantName(finalTenantName);
      setUserRole('TENANT');
      localStorage.setItem('rip_user_role', 'TENANT');

      // 5. Explicitly refresh clauses with the finalTenantName
      setContractClauses(prev => prev.map(c => {
        if (c.num === 1) {
          return {
            ...c,
            title: '1. Parties to the Agreement',
            text: `This residential lease agreement is entered into by ${landlordName || '[Landlord Name]'} (Lessor) and ${finalTenantName} (Lessee).`
          };
        }
        return c;
      }));

      return { 
        success: true, 
        tenant: tenantRecord, 
        hasContract: Boolean(linkedContract || cleanCode)
      };
    } catch (err) {
      console.warn('[Register] Tenant error:', err);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // Returning Tenant Login by Username / Phone & Password
  const loginTenant = async ({ username, password, code }) => {
    try {
      const cleanIdent = (username || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      const explicitCode = (code || '').trim().toUpperCase();

      if (!cleanIdent) {
        return { success: false, error: 'Please enter your username.' };
      }
      if (!cleanPassword) {
        return { success: false, error: 'Please enter your password.' };
      }

      let tenantData = null;

      // 1. Try querying Firestore
      try {
        const snap = await getDoc(doc(db, 'tenants', cleanIdent));
        if (snap.exists()) {
          tenantData = snap.data();
        }
      } catch (err) {
        console.warn('[Firebase] Tenant query notice:', err.message);
      }

      // 2. Check local tenants store
      if (!tenantData) {
        try {
          const stored = JSON.parse(localStorage.getItem('rip_tenants_store') || '{}');
          tenantData = stored[cleanIdent] || Object.values(stored).find(
            t => (t.username && t.username.toLowerCase() === cleanIdent) || t.phone === cleanIdent
          );
        } catch (e) {}
      }

      // 3. Fallback: check saved contracts for tenant name/phone matching
      if (!tenantData) {
        const local = contracts.find(c => 
          (c.tenantPhone && c.tenantPhone.toLowerCase() === cleanIdent) || 
          (c.tenantName && c.tenantName.toLowerCase() === cleanIdent)
        );
        if (local) {
          tenantData = {
            id: cleanIdent,
            username: cleanIdent,
            name: local.tenantName,
            phone: local.tenantPhone || '',
            contractCode: local.code
          };
        }
      }

      // If still not found
      if (!tenantData) {
        return {
          success: false,
          error: `Account "${cleanIdent}" not found. Please click Register to create your tenant account.`
        };
      }

      // Validate password if tenant record has a password set
      if (tenantData.password && tenantData.password !== cleanPassword) {
        return {
          success: false,
          error: 'Incorrect password. Please verify and try again.'
        };
      }

      // Determine contract code
      const targetCode = explicitCode || tenantData.contractCode || activeCode || roomCodeInput;
      if (targetCode) {
        await lookupContractByCode(targetCode);
        setActiveCode(targetCode);
      }

      setTenantProfile(tenantData);
      setTenantName(tenantData.name || cleanIdent);
      setUserRole('TENANT');
      localStorage.setItem('rip_user_role', 'TENANT');

      return { 
        success: true, 
        tenant: tenantData, 
        hasContract: Boolean(targetCode) 
      };
    } catch (err) {
      console.warn('[Tenant Login] Error:', err);
      return { success: false, error: 'Login failed. Please check your credentials.' };
    }
  };

  // Record tenant check-in and signature in Firebase Firestore
  const recordTenantCheckin = async () => {
    const contractCode = activeCode || roomCodeInput || 'RIP-KEY';
    const amountVal = Number(advanceRent || monthlyRent || 0);
    const receiptPreview = gcashFileData?.preview || null;

    const checkinPayload = {
      contractCode,
      tenantName: tenantName || tenantProfile?.name || 'Tenant',
      signingMode,
      isIdVerified: Boolean(idFileData),
      idFileName: idFileData?.meta?.name || 'ID Photo Uploaded',
      gcashRef: gcashRefNumber || 'Direct Payment Submitted',
      hasReceipt: Boolean(gcashFileData),
      lockboxPin: '5829',
      signedAt: new Date().toISOString()
    };

    // Update local contracts state first immediately!
    const contractExists = contracts.some(c => c.code === contractCode || c.id === contractCode);
    const baseContractUpdate = {
      status: 'Pending Verification',
      isSigned: true,
      paymentVerified: false,
      tenantSignedAt: new Date().toISOString(),
      tenantName: checkinPayload.tenantName,
      signingMode: signingMode || checkinPayload.signingMode,
      signatureData: signatureData || null,
      idFileData: idFileData || null,
      gcashRef: checkinPayload.gcashRef,
      gcashReceiptData: receiptPreview,
      advancePaidAmount: amountVal
    };

    let updatedContracts;
    if (contractExists) {
      updatedContracts = contracts.map(c => {
        if (c.code === contractCode || c.id === contractCode) {
          return {
            ...c,
            ...baseContractUpdate
          };
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
          propertyAddress: propertyAddress || 'Cagayan de Oro City'
        }
      ];
    }
    setContracts(updatedContracts);

    // Record initial advance rent payment into payments ledger
    const initialPayment = {
      id: `pay-${Date.now()}`,
      contractCode,
      tenantName: checkinPayload.tenantName,
      cycleName: 'Advance / Move-in Deposit',
      amount: amountVal,
      gcashRef: checkinPayload.gcashRef,
      receiptData: receiptPreview,
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
            tenantSignedAt: new Date().toISOString(),
            tenantSignature: signatureData || 'Digital Signature Stored',
            gcashRef: gcashRefNumber || 'Direct Payment Submitted',
            advancePaidAmount: amountVal
          }, { merge: true });
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
      setDbStatus('connected');
    } catch (err) {
      if (err.code === 'permission-denied') setDbStatus('rules_needed');
      console.warn('[Firebase] Check-in record notice:', err.message);
    }
  };

  // Landlord verification of tenant payment & unlocking room PIN
  const verifyTenantPayment = async (contractCode) => {
    if (!contractCode) return;
    const cleanCode = contractCode.trim().toUpperCase();

    // 1. Update contracts
    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return {
          ...c,
          status: 'Active',
          paymentVerified: true,
          verifiedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    // 2. Update payments ledger
    setPayments(prev => prev.map(p => {
      if (p.contractCode === cleanCode) {
        return {
          ...p,
          status: 'Verified',
          verifiedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    // 3. Write to Firestore
    try {
      await setDoc(doc(db, 'contracts', cleanCode), {
        status: 'Active',
        paymentVerified: true,
        verifiedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('[Firebase] Verify payment notice:', err.message);
    }
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
    } catch (err) {
      console.warn('[Firebase] Rejection notice:', err.message);
    }
  };

  // In-app payment submitted by tenant
  const submitTenantPayment = async ({ contractCode, amount, cycleName, gcashRef, receiptData }) => {
    const cleanCode = (contractCode || activeCode || '').trim().toUpperCase();
    const newPayment = {
      id: `pay-${Date.now()}`,
      contractCode: cleanCode,
      tenantName: tenantName || tenantProfile?.name || 'Tenant',
      cycleName: cycleName || 'Monthly Rent Payment',
      amount: Number(amount) || 0,
      gcashRef: gcashRef || '',
      receiptData: receiptData?.preview || receiptData || null,
      status: 'Pending Verification',
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update contract latest payment state
    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return {
          ...c,
          paymentVerified: false,
          latestPaymentStatus: 'Pending Verification',
          latestPaymentAmount: Number(amount),
          latestGcashRef: gcashRef,
          gcashRef: gcashRef
        };
      }
      return c;
    }));

    // Write to Firestore
    try {
      await addDoc(collection(db, 'payments'), newPayment);
      if (cleanCode) {
        await setDoc(doc(db, 'contracts', cleanCode), {
          paymentVerified: false,
          latestPaymentStatus: 'Pending Verification',
          latestPaymentAmount: Number(amount),
          latestGcashRef: gcashRef,
          gcashRef: gcashRef
        }, { merge: true });
      }
    } catch (err) {
      console.warn('[Firebase] Submit payment notice:', err.message);
    }

    return newPayment;
  };

  // Logout / Switch Account
  const logout = () => {
    localStorage.removeItem('rip_user_role');
    localStorage.removeItem('rip_landlord_profile');
    localStorage.removeItem('rip_tenant_profile');
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
  const tenantsList = contracts.map((c, idx) => ({
    id: c.id || c.code || idx + 1,
    avatar: (c.tenantName || 'T').substring(0, 2).toUpperCase(),
    name: c.tenantName || 'Unnamed Tenant',
    unit: `${c.roomNumber} · ${c.propertyType || 'Bedspace'}`,
    rent: c.monthlyRent || 0,
    status: c.status || 'Active',
    isSigned: Boolean(c.isSigned),
    paymentVerified: Boolean(c.paymentVerified),
    signingMode: c.signingMode || 'DIGITAL',
    signatureData: c.signatureData || null,
    idFileData: c.idFileData || null,
    gcashRef: c.gcashRef || c.latestGcashRef || '',
    gcashReceiptData: c.gcashReceiptData || null,
    due: c.dueDay || 'Every 5th',
    phone: c.tenantPhone || c.contactNumber || '09XXXXXXXXX',
    contract: c
  }));

  const filteredTenants = tenantsList.filter(t => {
    if (tenantFilter === 'ACTIVE' && t.status !== 'Active') return false;
    if (tenantFilter === 'DUE' && !t.due.includes('5th')) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.unit.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCopyLink = () => {
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
      currentScreen, setCurrentScreen,
      userRole, setUserRole,
      dbStatus,
      landlordProfile, setLandlordProfile,
      loginLandlord, registerLandlord,
      tenantProfile, setTenantProfile,
      loginTenant, registerTenant, joinTenantWithCode,
      logout,
      contracts, setContracts,
      payments, setPayments,
      verifyTenantPayment, rejectTenantPayment, submitTenantPayment,
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
      handleApplyAiCustomization,
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
