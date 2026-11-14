import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage, ref, uploadBytes, uploadString, getDownloadURL } from '../lib/firebase';
import { generateClause, generateFullKasulatan } from '../services/ai/gemini';
import { 
  registerLandlordUser, 
  loginLandlordUser, 
  registerTenantUser, 
  loginTenantUser, 
  requestPasswordReset, 
  signOutUser 
} from '../auth/authService';
import { createUniqueRoomCode } from '../features/lease/roomCode';
import { 
  verifyPaymentAndIssueCode, 
  regenerateAccessCode, 
  endLeaseAndRevokeCodes 
} from '../features/verification/accessCode';
import { getLogicalPreviousScreen, initHistoryRouter, pushScreenHistory } from '../router/navigation';
import { BUILTIN_PRESETS } from '../features/lease-templates/constants';
import { renderLease } from '../features/lease-templates/renderer';
import { getPresets } from '../features/lease-templates/presetService';
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

// Non-blocking timeout wrapper to ensure asynchronous cloud calls never freeze the UI
export const safeTimeout = (promise, ms = 2500, fallback = null) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);

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

// Helper to generate realistic bilingual legal clauses from entered data
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
      english: `This residential lease agreement is entered into by ${landlord || '[Landlord Name]'} (Lessor) and ${cleanTenant || '[Tenant Name]'} (Lessee).`,
      bisaya: `Kini nga kasulatan sa pag-abang gipirmahan nila ${landlord || '[Pangalan sa Tag-iya]'} (Lessor) ug ${cleanTenant || '[Pangalan sa Umuupa]'} (Lessee).`,
      text: `This residential lease agreement is entered into by ${landlord || '[Landlord Name]'} (Lessor) and ${cleanTenant || '[Tenant Name]'} (Lessee).`
    },
    {
      num: 2,
      title: '2. Leased Premises',
      english: `The Lessor hereby leases ${room || '[Unit/Room]'} located at ${address || '[Property Address]'} (${propType}) exclusively for peaceful residential dwelling.`,
      bisaya: `Ang Lessor nagpaabang sa ${room || '[Lawak/Unit]'} nga nahimutang sa ${address || '[Adres sa Property]'} (${propType}) alang lamang sa residential nga kapuy-an.`,
      text: `The Lessor hereby leases ${room || '[Unit/Room]'} located at ${address || '[Property Address]'} (${propType}) exclusively for peaceful residential dwelling.`
    },
    {
      num: 3,
      title: '3. Rent and Financial Obligations',
      english: `Monthly rent is ${rentFormatted}, payable on or before the 5th day of each calendar month. A security deposit of ${depFormatted} and advance rent of ${advanceFormatted} are required upon signing in accordance with the Rent Control Act of the Philippines.`,
      bisaya: `Ang binulan nga abang nagkantidad og ${rentFormatted}, bayaran sa o sa dili pa ang ika-5 nga adlaw sa matag bulan. Ang security deposit nga ${depFormatted} ug paunang abang nga ${advanceFormatted} gikinahanglan sa pagpirma sumala sa Rent Control Act.`,
      text: `Monthly rent is ${rentFormatted}, payable on or before the 5th day of each calendar month. A security deposit of ${depFormatted} and advance rent of ${advanceFormatted} are required upon signing in accordance with the Rent Control Act of the Philippines.`
    },
    {
      num: 4,
      title: '4. Lease Term',
      english: `The lease commences on ${startDate} for an agreed initial duration of ${duration}, renewable upon mutual written agreement of both parties.`,
      bisaya: `Ang abang magsugod sa ${startDate} sulod sa ${duration}, ug mahimong bag-ohon pinaagi sa sinulat nga kasabotan sa duha ka partido.`,
      text: `The lease commences on ${startDate} for an agreed initial duration of ${duration}, renewable upon mutual written agreement of both parties.`
    },
    {
      num: 5,
      title: '5. Utilities and Operational Expenses',
      english: `Electricity utility arrangement: ${electricity}. Water utility arrangement: ${water}. Tenant agrees to pay utility shares promptly upon statement delivery.`,
      bisaya: `Kahikayan sa kuryente: ${electricity}. Kahikayan sa tubig: ${water}. Ang umuupa uyon nga mobayad sa bahin sa bayronon sa oras nga madawat ang pahibalo.`,
      text: `Electricity utility arrangement: ${electricity}. Water utility arrangement: ${water}. Tenant agrees to pay utility shares promptly upon statement delivery.`
    },
    {
      num: 6,
      title: '6. House Rules & Community Peace',
      english: 'Quiet hours begin at 10:00 PM. Common passageways and bathrooms must be kept clean and unobstructed. No unauthorized subleasing or assignment.',
      bisaya: 'Ang oras sa kalinaw magsugod sa 10:00 sa gabii. Ang agianan ug kasilyas kinahanglang limpyo kanunay. Gidili ang pagpasublease nga walay pagtugot.',
      text: 'Quiet hours begin at 10:00 PM. Common passageways and bathrooms must be kept clean and unobstructed. No unauthorized subleasing or assignment.'
    },
    {
      num: 7,
      title: '7. Maintenance & Care of Premises',
      english: 'The Lessee shall maintain the room in tenantable, sanitary condition and promptly notify the Lessor of any required structural or plumbing repairs.',
      bisaya: 'Ang Lessee mag-atiman sa lawak sa limpyo ug maayong kahimtang ug magpahibalo gilayon sa Lessor kung may kinahanglang ayuhon sa istruktura o tubo.',
      text: 'The Lessee shall maintain the room in tenantable, sanitary condition and promptly notify the Lessor of any required structural or plumbing repairs.'
    },
    {
      num: 8,
      title: '8. Move-Out Notice & Termination',
      english: 'Either party may terminate this lease by providing at least 30 days prior written notice in accordance with Philippine law.',
      bisaya: 'Ang bisan kinsa nga partido mahimong motapos niini nga abang pinaagi sa paghatag og 30 ka adlaw nga sinulat nga pahibalo sumala sa balaod sa Pilipinas.',
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
  
  // Chosen Preset for the lease (Requirement 3: from landlord's chosen preset)
  const [selectedPresetId, setSelectedPresetId] = useState('builtin-bedspace');
  const [availablePresets, setAvailablePresets] = useState(BUILTIN_PRESETS);

  useEffect(() => {
    if (landlordProfile?.phone || landlordProfile?.id || landlordProfile?.uid) {
      const landlordId = landlordProfile.uid || landlordProfile.phone || landlordProfile.id;
      getPresets(landlordId).then(p => {
        if (Array.isArray(p) && p.length > 0) {
          setAvailablePresets(p);
        }
      }).catch(() => {});
    }
  }, [landlordProfile?.phone, landlordProfile?.id, landlordProfile?.uid]);

  // Persistent Room / Invite Code - ONLY generated after Kasulatan is finalized and saved (Requirement 3)
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

  // Persistence: Real Saved Contracts / Leases List (Loaded from Firestore)
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

  // Real-time Firestore Subscription for Landlord Contracts
  useEffect(() => {
    if (!landlordProfile) return;
    const landlordId = landlordProfile.uid || landlordProfile.phone || landlordProfile.id;
    if (!landlordId) return;

    try {
      const q = query(
        collection(db, 'contracts'),
        where('landlordId', '==', landlordId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveContracts = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
          code: d.data().code || d.data().roomCode || d.id
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
  }, [landlordProfile?.uid, landlordProfile?.phone, landlordProfile?.id]);

  // Real-time Firestore Subscription for Active Tenant Contract
  useEffect(() => {
    const codeToWatch = activeCode || tenantProfile?.contractCode || tenantProfile?.leaseId;
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
  }, [activeCode, tenantProfile?.contractCode, tenantProfile?.leaseId]);

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
            const timeA = new Date(a.submittedAt || a.createdAt || a.date || 0).getTime();
            const timeB = new Date(b.submittedAt || b.createdAt || b.date || 0).getTime();
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

      // Fetch landlord contracts from Firestore directly (Requirement 2: always loads from Firestore)
      try {
        const q = query(
          collection(db, 'contracts'),
          where('landlordId', '==', profile.uid || profile.phone || profile.id)
        );
        const querySnap = await getDocs(q);
        const liveContracts = querySnap.docs.map(d => ({
          ...d.data(),
          id: d.id,
          code: d.data().code || d.data().roomCode || d.id
        }));
        setContractsState(liveContracts);
        localStorage.setItem('rip_contracts', JSON.stringify(liveContracts));
      } catch (qErr) {}

      // Navigate to landlord home dashboard upon successful authentication
      setCurrentScreen('LANDLORD_HOME');

      return { success: true, profile };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Landlord Registration via Firebase Auth
  const registerLandlord = async ({ name, phone, email, password, propertyName, propertyAddress, barangay, city }) => {
    try {
      const profile = await registerLandlordUser({
        name,
        phone,
        email,
        password,
        propertyName,
        propertyAddress,
        barangay,
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

      // Navigate to landlord home dashboard upon successful registration
      setCurrentScreen('LANDLORD_HOME');

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

  const applyPreset = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = availablePresets.find(p => p.id === presetId) || BUILTIN_PRESETS[0];
    if (preset) {
      const cleanTenant = isGenericTenantName(tenantName) ? '' : tenantName;
      const values = {
        tenant_name: cleanTenant || 'Tenant',
        landlord_name: landlordName || landlordProfile?.name || 'Landlord',
        unit: roomNumber || 'Unit 1',
        property_address: propertyAddress || 'Property Address',
        rent: monthlyRent ? `₱${Number(monthlyRent).toLocaleString()}` : '₱[Amount]',
        deposit: deposit ? `₱${Number(deposit).toLocaleString()}` : '₱[Amount]',
        advance: advanceRent ? `₱${Number(advanceRent).toLocaleString()}` : '₱[Amount]',
        due_day: '5th',
        lease_duration: leaseDuration || '6 months',
        start_date: new Date().toISOString().split('T')[0]
      };
      const rendered = renderLease(preset, values);
      if (rendered.success && Array.isArray(rendered.clauses)) {
        setContractClauses(rendered.clauses);
        return;
      }
    }
    refreshClausesFromDraft();
  };

  // Generate a complete Kasulatan from scratch using Gemini AI fitted for single A4 bond paper
  const generateKasulatanFromScratch = async (requirements) => {
    setAiIsCustomizing(true);
    setAiError('');
    try {
      const generated = await generateFullKasulatan(requirements, {
        landlordName: landlordName || landlordProfile?.name || 'Landlord',
        tenantName: isGenericTenantName(tenantName) ? '' : tenantName,
        roomNumber,
        propertyAddress,
        propertyType,
        monthlyRent,
        deposit,
        advanceRent,
        leaseDuration
      });

      if (generated && Array.isArray(generated.clauses) && generated.clauses.length > 0) {
        setContractClauses(generated.clauses);
        setAiUpdateToast(`Generated complete Kasulatan (${generated.clauses.length} clauses) fitted for A4 bond paper!`);
        setTimeout(() => setAiUpdateToast(''), 4500);
        return { success: true, clauses: generated.clauses };
      }
      throw new Error('AI did not return valid clauses.');
    } catch (err) {
      console.warn('[Gemini AI] Full Kasulatan generation error:', err.message);
      setAiError(err.message || 'Failed to generate Kasulatan with AI. Please retry.');
      return { success: false, error: err.message };
    } finally {
      setAiIsCustomizing(false);
    }
  };

  // Clause manipulation helpers for full Kasulatan customization
  const updateSingleClause = (index, updatedFields) => {
    setContractClauses(prev => prev.map((c, i) => i === index ? { ...c, ...updatedFields } : c));
  };

  const removeSingleClause = (indexToRemove) => {
    setContractClauses(prev => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      return filtered.map((c, idx) => ({
        ...c,
        num: idx + 1,
        title: (c.title || '').replace(/^\d+\.\s*/, `${idx + 1}. `)
      }));
    });
  };

  const moveSingleClause = (fromIndex, toIndex) => {
    setContractClauses(prev => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((c, idx) => ({
        ...c,
        num: idx + 1,
        title: (c.title || '').replace(/^\d+\.\s*/, `${idx + 1}. `)
      }));
    });
  };

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

  // Start a new contract wizard: NO room code generated yet (Requirement 3)
  const startNewContract = () => {
    setActiveCode(''); // Strictly NO room code before Save!
    setPropertyType('Boarding House / Bedspace');
    setSelectedPresetId('builtin-bedspace');
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
    // Generate unique room code RIP-XXXX only on save (Requirement 3)
    let codeToUse = (activeCode && activeCode.trim()) || null;
    if (!codeToUse) {
      codeToUse = await createUniqueRoomCode(db);
    }
    setActiveCode(codeToUse);

    const cleanTenant = isGenericTenantName(tenantName) ? '' : tenantName;
    const now = new Date().toISOString();

    // Compile frozen copy of the contract text (Requirement 3: stored as a frozen copy)
    const frozenContractText = contractClauses.map(c => 
      `${c.num}. ${c.title}\nEnglish: ${c.english || c.text}\nBisaya: ${c.bisaya || c.text}`
    ).join('\n\n');

    const newContract = {
      id: codeToUse,
      leaseId: codeToUse,
      code: codeToUse,
      roomCode: codeToUse,
      accessCode: null, // Strictly null before landlord payment verification!
      createdAt: now,
      updatedAt: now,
      landlordId: landlordProfile?.uid || landlordProfile?.phone || landlordProfile?.id || contactNumber || 'LANDLORD-DEFAULT',
      landlordName: landlordName || landlordProfile?.name || 'Landlord',
      contactNumber: contactNumber || landlordProfile?.phone || '',
      tenantId: null, // No tenant yet until join
      tenantName: cleanTenant,
      roomNumber: roomNumber || 'Unit 1',
      propertyAddress: propertyAddress || landlordProfile?.propertyAddress || 'Specified Rental Unit',
      propertyType,
      monthlyRent: Number(monthlyRent) || 0,
      deposit: Number(deposit) || 0,
      advanceRent: Number(advanceRent) || 0,
      leaseDuration,
      rentReminderEnabled,
      presetId: selectedPresetId,
      contractClauses: JSON.parse(JSON.stringify(contractClauses)), // Frozen copy of clauses
      frozenContractText, // Frozen full text snapshot
      landlordSigningMode,
      landlordSignature,
      landlordSignedAt: now,
      status: 'open', // Requirement 3: Only on Save created with status "open"
      isSigned: false,
      tenantSigned: false,
      paymentVerified: false,
      dueDay: 'Every 5th',
      shareUrl: `${window.location.origin}?code=${codeToUse}`
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

    // Write to Firebase Cloud Firestore (both contracts and leases for relational compliance)
    try {
      await Promise.all([
        setDoc(doc(db, 'contracts', newContract.code), newContract, { merge: true }),
        setDoc(doc(db, 'leases', newContract.code), newContract, { merge: true })
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
          english: generated.text,
          bisaya: generated.bisaya || generated.text,
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
          english: generated.text,
          bisaya: generated.bisaya || generated.text,
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
        english: textToAdd,
        bisaya: textToAdd,
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
      const leaseDoc = await getDoc(doc(db, 'leases', cleanCode));
      if (leaseDoc.exists()) {
        const cloudData = { ...leaseDoc.data(), id: leaseDoc.id, code: leaseDoc.id };
        loadContractIntoActiveState(cloudData);
        setDbStatus('connected');
        return cloudData;
      }
    } catch (err) {
      if (err.code === 'permission-denied') setDbStatus('rules_needed');
    }

    const foundLocal = contracts.find(c => c.code?.toUpperCase() === cleanCode || c.id?.toUpperCase() === cleanCode);
    if (foundLocal) {
      loadContractIntoActiveState(foundLocal);
      return foundLocal;
    }

    return null;
  };

  // Tenant Register via Firebase Auth (Requirement 4: Verify code exists, check if room taken, link to lease only)
  const registerTenant = async ({ username, password, email, name, phone, code }) => {
    const cleanCode = (code || activeCode || roomCodeInput || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'Please enter a valid room code (e.g. RIP-XXXX).' };
    }

    // 1. Verify that the room code exists
    let existingLease = null;
    try {
      const contractSnap = await safeTimeout(getDoc(doc(db, 'contracts', cleanCode)), 2000, null);
      if (contractSnap && contractSnap.exists && contractSnap.exists()) {
        existingLease = contractSnap.data();
      } else {
        const leaseSnap = await safeTimeout(getDoc(doc(db, 'leases', cleanCode)), 1500, null);
        if (leaseSnap && leaseSnap.exists && leaseSnap.exists()) existingLease = leaseSnap.data();
      }
    } catch (e) {
      console.warn('[Register Tenant] Lease existence lookup notice:', e.message);
    }

    if (!existingLease) {
      const localFound = contracts.find(c => c.code === cleanCode || c.id === cleanCode);
      if (localFound) existingLease = localFound;
    }

    if (!existingLease) {
      return { 
        success: false, 
        error: `Room code "${cleanCode}" does not exist. Please check your room code or invite link.` 
      };
    }

    // 2. Check if the room slot is already taken (Requirement 4: "This room is already taken")
    const isAlreadyTaken = (existingLease.status && existingLease.status !== 'open') || 
                           (existingLease.tenantId && existingLease.tenantId !== username);
    if (isAlreadyTaken) {
      return { 
        success: false, 
        error: 'This room is already taken.' 
      };
    }

    // 3. Register Tenant in Firebase Auth & Cloud Firestore
    try {
      const tenantRecord = await registerTenantUser({
        username,
        password,
        email,
        name,
        phone,
        code: cleanCode
      });

      // Link lease to this tenant
      const tenantUid = tenantRecord.uid || tenantRecord.id;
      const leaseLinkUpdate = {
        tenantId: tenantUid,
        tenantUsername: tenantRecord.username,
        tenantName: tenantRecord.name,
        tenantPhone: tenantRecord.phone,
        updatedAt: new Date().toISOString()
      };

      try {
        const linkPromise = Promise.all([
          setDoc(doc(db, 'contracts', cleanCode), leaseLinkUpdate, { merge: true }),
          setDoc(doc(db, 'leases', cleanCode), leaseLinkUpdate, { merge: true })
        ]);
        await safeTimeout(linkPromise, 2000, null);
      } catch (linkErr) {}

      safeTimeout(lookupContractByCode(cleanCode), 1500, null).catch(() => {});
      setActiveCode(cleanCode);
      setTenantProfile(tenantRecord);
      setTenantName(tenantRecord.name);
      setUserRole('TENANT');
      localStorage.setItem('rip_user_role', 'TENANT');

      // Navigate to tenant portal for lease onboarding
      setCurrentScreen('TENANT_PORTAL');

      return { success: true, tenant: tenantRecord, hasContract: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Tenant Sign In via Firebase Auth
  const loginTenant = async (usernameOrEmail, password, code) => {
    try {
      const tenantData = await loginTenantUser({ identifier: usernameOrEmail, password, code });

      const targetCode = code || tenantData.contractCode || tenantData.leaseId || activeCode || roomCodeInput;
      if (targetCode) {
        await lookupContractByCode(targetCode);
        setActiveCode(targetCode);
      }

      setTenantProfile(tenantData);
      setTenantName(tenantData.name || tenantData.username);
      setUserRole('TENANT');
      localStorage.setItem('rip_user_role', 'TENANT');

      // Navigate to tenant home
      setCurrentScreen('TENANT_HOME');

      return { success: true, tenant: tenantData, hasContract: Boolean(targetCode) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Step 4 Completion: Tenant signs Kasulatan -> status becomes "pending_payment" (Requirement 4)
  const signTenantKasulatan = async ({ signingMode: sMode = 'DIGITAL', signatureData: sData = null }) => {
    const cleanCode = (activeCode || roomCodeInput || tenantProfile?.contractCode || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('No active room code found to sign.');

    const now = new Date().toISOString();
    const cleanTenant = tenantProfile?.name || tenantName || 'Tenant';

    const updatePayload = {
      status: 'pending_payment', // Requirement 4: The lease status becomes "pending_payment" (tenant signed, not paid)
      isSigned: true,
      tenantSigned: true,
      tenantSignedAt: now,
      tenantName: cleanTenant,
      signingMode: sMode,
      tenantSigningMode: sMode,
      tenantSignature: sData || 'Digital Signature Stored',
      signatureData: sData || null,
      updatedAt: now
    };

    setContracts(prev => prev.map(c => (c.code === cleanCode || c.id === cleanCode ? { ...c, ...updatePayload } : c)));
    if (activeTenantContract) {
      setActiveTenantContract(prev => ({ ...prev, ...updatePayload }));
    }

    try {
      await Promise.all([
        setDoc(doc(db, 'contracts', cleanCode), updatePayload, { merge: true }),
        setDoc(doc(db, 'leases', cleanCode), updatePayload, { merge: true })
      ]);
    } catch (err) {
      console.warn('[Firebase] Contract sign notice:', err.message);
    }

    return updatePayload;
  };

  // Legacy alias for checkin
  const recordTenantCheckin = async () => {
    return signTenantKasulatan({ signingMode, signatureData });
  };

  // Step 5: Tenant pays and submits proof (Requirement 5)
  // Validate: image required, reference number required, reference number not already used on another payment (duplicate = error)
  const submitTenantPaymentProof = async ({ contractCode, amount, type = 'advance/deposit', gcashRef, receiptData, file = null }) => {
    const cleanCode = (contractCode || activeCode || roomCodeInput || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('Lease code is missing.');

    const cleanRef = (gcashRef || '').trim();
    if (!cleanRef) {
      throw new Error('GCash reference number is required.');
    }

    const receiptImage = receiptData?.dataUrl || receiptData?.preview || (typeof receiptData === 'string' ? receiptData : null);
    if (!receiptImage && !file) {
      throw new Error('Screenshot proof of payment is required.');
    }

    // Duplicate reference number check across all payments (Requirement 5)
    const isDuplicateLocal = payments.some(p => 
      (p.referenceNumber && p.referenceNumber.toLowerCase() === cleanRef.toLowerCase()) ||
      (p.gcashRef && p.gcashRef.toLowerCase() === cleanRef.toLowerCase())
    );
    if (isDuplicateLocal) {
      throw new Error(`GCash reference number "${cleanRef}" has already been used on another payment. Duplicate reference numbers are not permitted.`);
    }

    try {
      const q = query(collection(db, 'payments'), where('referenceNumber', '==', cleanRef));
      const snap = await safeTimeout(getDocs(q), 2000, null);
      if (snap && !snap.empty) {
        throw new Error(`GCash reference number "${cleanRef}" has already been used on another payment. Duplicate reference numbers are not permitted.`);
      }
      const qAlt = query(collection(db, 'payments'), where('gcashRef', '==', cleanRef));
      const snapAlt = await safeTimeout(getDocs(qAlt), 2000, null);
      if (snapAlt && !snapAlt.empty) {
        throw new Error(`GCash reference number "${cleanRef}" has already been used on another payment. Duplicate reference numbers are not permitted.`);
      }
    } catch (fsErr) {
      if (fsErr.message?.includes('already been used')) throw fsErr;
    }

    // Upload receipt to Firebase Storage with safe timeout fallback
    let finalImageUrl = receiptImage;
    if (storage) {
      try {
        const uploadTask = (async () => {
          if (file) {
            const storageRef = ref(storage, `receipts/${cleanCode}/${Date.now()}_receipt.jpg`);
            const res = await uploadBytes(storageRef, file);
            return await getDownloadURL(res.ref);
          } else if (receiptImage && receiptImage.startsWith('data:')) {
            const storageRef = ref(storage, `receipts/${cleanCode}/${Date.now()}_receipt.jpg`);
            const res = await uploadString(storageRef, receiptImage, 'data_url');
            return await getDownloadURL(res.ref);
          }
          return receiptImage;
        })();
        const uploaded = await safeTimeout(uploadTask, 2500, null);
        if (uploaded) {
          finalImageUrl = uploaded;
        }
      } catch (stErr) {
        console.warn('[Firebase Storage] Notice:', stErr.message);
      }
    }

    const now = new Date().toISOString();
    const cleanTenant = (!isGenericTenantName(tenantName) ? tenantName : null) || tenantProfile?.name || 'Resident';
    const amountVal = Number(amount || advanceRent || monthlyRent || 0);
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Store payment record (Requirement 5: leaseId, tenantId, amount, type, reference number, image URL, submittedAt)
    const paymentRecord = {
      id: paymentId,
      paymentId,
      leaseId: cleanCode,
      contractCode: cleanCode,
      tenantId: tenantProfile?.uid || tenantProfile?.id || cleanTenant,
      landlordId: activeTenantContract?.landlordId || landlordProfile?.uid || landlordProfile?.id || '',
      amount: amountVal,
      type,
      referenceNumber: cleanRef,
      gcashRef: cleanRef,
      imageUrl: finalImageUrl || receiptImage,
      receiptData: finalImageUrl || receiptImage,
      status: 'pending_verification',
      submittedAt: now,
      date: new Date().toLocaleDateString(),
      createdAt: now
    };

    setPayments(prev => [paymentRecord, ...prev]);

    // Update lease status to "pending_verification" (Requirement 5)
    // NO access code or any code is visible or readable anywhere for the tenant at this stage
    const leaseUpdate = {
      status: 'pending_verification',
      paymentVerified: false,
      accessCode: null, // Strictly null
      latestPaymentId: paymentId,
      latestPaymentAmount: amountVal,
      latestGcashRef: cleanRef,
      gcashRef: cleanRef,
      gcashReceiptData: finalImageUrl || receiptImage,
      paymentRejectionReason: null,
      updatedAt: now
    };

    setContracts(prev => prev.map(c => (c.code === cleanCode || c.id === cleanCode ? { ...c, ...leaseUpdate } : c)));
    if (activeTenantContract) {
      setActiveTenantContract(prev => ({ ...prev, ...leaseUpdate }));
    }

    try {
      const syncWrites = Promise.all([
        setDoc(doc(db, 'payments', paymentId), paymentRecord),
        setDoc(doc(db, 'contracts', cleanCode), leaseUpdate, { merge: true }),
        setDoc(doc(db, 'leases', cleanCode), leaseUpdate, { merge: true })
      ]);
      await safeTimeout(syncWrites, 2500, null);
    } catch (err) {
      console.warn('[Firebase] Payment submission write notice:', err.message);
    }

    return paymentRecord;
  };

  const submitTenantPayment = async ({ contractCode, amount, cycleName, gcashRef, receiptData, file }) => {
    return submitTenantPaymentProof({
      contractCode,
      amount,
      type: cycleName?.toLowerCase().includes('advance') || cycleName?.toLowerCase().includes('deposit') ? 'advance/deposit' : 'monthly_rent',
      gcashRef,
      receiptData,
      file
    });
  };

  // Step 6: Landlord verification of tenant payment (Requirement 6)
  // On Verify:
  // a) Payment status = "verified", with verifiedAt and verifiedBy
  // b) Lease status = "active"
  // c) A NEW random access code (4-6 digits, crypto.getRandomValues) generated for this tenant and lease
  // d) Code stored LINKED (leaseId, paymentId, tenantId, landlordId, createdAt, status "active") and unique among landlord's active codes
  // e) Code shown first on landlord's screen
  // f) Tenant's app updates in real time to "Verified Active"
  const verifyTenantPayment = async (contractCode, paymentId = null) => {
    if (!contractCode) return null;
    const cleanCode = contractCode.trim().toUpperCase();

    const landlordId = landlordProfile?.uid || landlordProfile?.phone || landlordProfile?.id || 'landlord';
    const tenantId = selectedTenant?.id || activeTenantContract?.tenantId || null;

    // Generate secure random access code and persist to Firestore linked records
    const { accessCode: newCode, accessCodeId } = await verifyPaymentAndIssueCode(
      cleanCode, 
      paymentId, 
      db, 
      landlordId, 
      tenantId
    );

    const now = new Date().toISOString();

    // Update local state with the verified status and access code
    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return {
          ...c,
          status: 'active',
          paymentVerified: true,
          accessCode: newCode,
          accessCodeId,
          verifiedAt: now,
          verifiedBy: landlordId
        };
      }
      return c;
    }));

    setPayments(prev => prev.map(p => {
      if ((p.contractCode === cleanCode || p.leaseId === cleanCode) && (!paymentId || p.id === paymentId)) {
        return {
          ...p,
          status: 'verified',
          verifiedAt: now,
          verifiedBy: landlordId
        };
      }
      return p;
    }));

    if (activeTenantContract && (activeTenantContract.code === cleanCode || activeTenantContract.id === cleanCode)) {
      setActiveTenantContract(prev => ({
        ...prev,
        status: 'active',
        paymentVerified: true,
        accessCode: newCode,
        accessCodeId,
        verifiedAt: now
      }));
    }

    return newCode;
  };

  // Step 6: Landlord rejection with reason (Requirement 6: Reject with a reason tenant can see, and tenant can resubmit)
  const rejectTenantPayment = async (contractCode, reason = 'Payment proof invalid or unverified', paymentId = null) => {
    if (!contractCode) return;
    const cleanCode = contractCode.trim().toUpperCase();
    const now = new Date().toISOString();

    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return {
          ...c,
          paymentVerified: false,
          paymentRejectionReason: reason,
          status: 'pending_resubmission',
          updatedAt: now
        };
      }
      return c;
    }));

    setPayments(prev => prev.map(p => {
      if ((p.contractCode === cleanCode || p.leaseId === cleanCode) && (!paymentId || p.id === paymentId)) {
        return {
          ...p,
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: now
        };
      }
      return p;
    }));

    if (activeTenantContract && (activeTenantContract.code === cleanCode || activeTenantContract.id === cleanCode)) {
      setActiveTenantContract(prev => ({
        ...prev,
        paymentVerified: false,
        paymentRejectionReason: reason,
        status: 'pending_resubmission'
      }));
    }

    try {
      await Promise.all([
        setDoc(doc(db, 'contracts', cleanCode), {
          paymentVerified: false,
          paymentRejectionReason: reason,
          status: 'pending_resubmission',
          updatedAt: now
        }, { merge: true }),
        setDoc(doc(db, 'leases', cleanCode), {
          paymentVerified: false,
          paymentRejectionReason: reason,
          status: 'pending_resubmission',
          updatedAt: now
        }, { merge: true })
      ]);

      if (paymentId) {
        await setDoc(doc(db, 'payments', paymentId), {
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: now
        }, { merge: true });
      }
    } catch (err) {
      console.warn('[Reject Payment] Notice:', err.message);
    }
  };

  // Step 9: Landlord regenerates access code (old code becomes "revoked" immediately, history kept)
  const regenerateTenantAccessCode = async (contractCode) => {
    if (!contractCode) return null;
    const cleanCode = contractCode.trim().toUpperCase();

    const landlordId = landlordProfile?.uid || landlordProfile?.phone || landlordProfile?.id;
    const tenantId = selectedTenant?.id || activeTenantContract?.tenantId;

    const { accessCode: newCode, accessCodeId } = await regenerateAccessCode(cleanCode, db, landlordId, tenantId);

    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return { ...c, accessCode: newCode, accessCodeId };
      }
      return c;
    }));

    if (activeTenantContract && (activeTenantContract.code === cleanCode || activeTenantContract.id === cleanCode)) {
      setActiveTenantContract(prev => ({ ...prev, accessCode: newCode, accessCodeId }));
    }

    return newCode;
  };

  // Step 9: Landlord ends the lease (status becomes "ended", active code revoked)
  const endTenantLease = async (contractCode) => {
    if (!contractCode) return;
    const cleanCode = contractCode.trim().toUpperCase();
    const landlordId = landlordProfile?.uid || landlordProfile?.phone || landlordProfile?.id;

    await endLeaseAndRevokeCodes(cleanCode, db, landlordId);

    setContracts(prev => prev.map(c => {
      if (c.code === cleanCode || c.id === cleanCode) {
        return { ...c, status: 'ended', accessCode: null };
      }
      return c;
    }));

    if (activeTenantContract && (activeTenantContract.code === cleanCode || activeTenantContract.id === cleanCode)) {
      setActiveTenantContract(prev => ({ ...prev, status: 'ended', accessCode: null }));
    }
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

  // Step 8: Landlord search must connect everything
  // Accepts: access code, room code, tenant name, unit, GCash reference number.
  // Searching an access code must open one result page showing: contract (frozen copy & PDF), tenant, unit, every payment with receipts & ref numbers, verification date, code status.
  const tenantsList = contracts.map((c, idx) => {
    const rawName = c.tenantName || '';
    const cleanName = isGenericTenantName(rawName) ? (c.tenantUsername || 'Resident') : rawName;
    return {
      id: c.id || c.code || idx + 1,
      avatar: cleanName.substring(0, 2).toUpperCase(),
      name: cleanName,
      unit: `${c.roomNumber} · ${c.propertyType || 'Bedspace'}`,
      rent: c.monthlyRent || 0,
      status: c.status || 'open',
      isSigned: Boolean(c.isSigned),
      paymentVerified: Boolean(c.paymentVerified),
      accessCode: c.accessCode || null,
      signingMode: c.signingMode || 'DIGITAL',
      signatureData: c.signatureData || null,
      idFileData: c.idFileData || null,
      gcashRef: c.gcashRef || c.latestGcashRef || '',
      gcashReceiptData: c.gcashReceiptData || null,
      due: c.dueDay || 'Every 5th',
      phone: c.tenantPhone || c.contactNumber || '',
      contract: c
    };
  });

  const filteredTenants = tenantsList.filter(t => {
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = t.name && t.name.toLowerCase().includes(q);
      const matchUnit = t.unit && t.unit.toLowerCase().includes(q);
      const matchCode = t.contract?.code && t.contract.code.toLowerCase().includes(q);
      const matchAccessCode = t.accessCode && t.accessCode.toLowerCase().includes(q);
      const matchGcash = (t.gcashRef && t.gcashRef.toLowerCase().includes(q)) ||
        payments.some(p => (p.contractCode === t.contract?.code || p.leaseId === t.contract?.code) && (
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q)) ||
          (p.gcashRef && p.gcashRef.toLowerCase().includes(q))
        ));

      if (!matchName && !matchUnit && !matchCode && !matchAccessCode && !matchGcash) {
        return false;
      }
    }

    if (tenantFilter === 'ACTIVE') {
      return Boolean(t.paymentVerified) || t.status === 'active';
    }
    if (tenantFilter === 'PENDING') {
      return t.status === 'pending_payment' || t.status === 'pending_verification' || !t.paymentVerified;
    }
    if (tenantFilter === 'DUE') {
      return !t.paymentVerified || (t.due && t.due.includes('5th'));
    }

    return true;
  });

  const handleCopyLink = (codeOverride) => {
    const code = codeOverride || activeCode;
    if (!code) return;
    const url = `${window.location.origin}?code=${code}`;
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

  // --- [Branding, Demo & Docs Agent] Start: Demo Pitch Data Loader ---
  const loadDemoPitchData = async (role = 'LANDLORD') => {
    try {
      let seedData = null;
      try {
        const res = await fetch('/demo-seed.json');
        if (res.ok) {
          seedData = await res.json();
        }
      } catch (e) {}

      if (seedData) {
        if (role === 'LANDLORD') {
          setLandlordProfile(seedData.landlord);
          setUserRole('LANDLORD');
          setContracts(seedData.contracts || []);
          setPayments(seedData.payments || []);
          if (seedData.presets) {
            try {
              localStorage.setItem(`rip_lease_presets_${seedData.landlord.id}`, JSON.stringify(seedData.presets));
            } catch (e) {}
          }
          setCurrentScreen('LANDLORD_HOME');
        } else {
          setTenantProfile(seedData.tenant);
          setUserRole('TENANT');
          setActiveCode('RIP-ACTV');
          setRoomCodeInput('RIP-ACTV');
          setContracts(seedData.contracts || []);
          setPayments(seedData.payments || []);
          const activeC = seedData.contracts.find(c => c.code === 'RIP-ACTV');
          if (activeC) {
            setActiveTenantContract(activeC);
            setTenantName(seedData.tenant.name);
            setRoomNumber(activeC.roomNumber);
            setPropertyAddress(activeC.propertyAddress);
            setMonthlyRent(activeC.monthlyRent);
          }
          setCurrentScreen('TENANT_HOME');
        }
        return true;
      }
    } catch (err) {
      console.warn('[DemoLoader] Could not load demo seed:', err);
    }
    return false;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__appContext = {
        setCurrentScreen,
        loadDemoPitchData,
        setSelectedTenant,
        setSearchQuery,
        resetAppData,
        setActiveTenantContract,
        setActiveCode,
        setTenantName,
        setTenantHasReadContract,
        setSigningMode,
        setSignatureData,
        setGcashRefNumber,
        setGcashFileData
      };
    }
  }, [
    setCurrentScreen, 
    setSelectedTenant, 
    setSearchQuery,
    setActiveTenantContract,
    setActiveCode,
    setTenantName,
    setTenantHasReadContract,
    setSigningMode,
    setSignatureData,
    setGcashRefNumber,
    setGcashFileData
  ]);
  // --- [Branding, Demo & Docs Agent] End ---

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
      verifyTenantPayment, rejectTenantPayment, regenerateTenantAccessCode, endTenantLease,
      submitTenantPayment, submitTenantPaymentProof, signTenantKasulatan,
      propertyType, setPropertyType,
      selectedPresetId, setSelectedPresetId, applyPreset, availablePresets,
      generateKasulatanFromScratch, updateSingleClause, removeSingleClause, moveSingleClause,
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
      resetAppData,
      loadDemoPitchData
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
