import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation Screens:
  // Landlord: 'SPLASH' | 'LANDLORD_HOME' | 'WIZARD_PROPERTY' | 'WIZARD_DETAILS' | 'WIZARD_REVIEW' | 'WIZARD_CONTRACT' | 'WIZARD_CHECK' | 'ALL_DONE' | 'LANDLORD_TENANTS' | 'TENANT_DETAIL' | 'SETTINGS'
  // Tenant:   'TENANT_CODE_ENTRY' | 'TENANT_PORTAL' | 'SUCCESS_PIN'
  const [currentScreen, setCurrentScreen] = useState('SPLASH');
  
  // Layout mode: 'app' (fluid responsive mobile app) or 'phone-bezel' (mockup phone frame)
  const [layoutMode, setLayoutMode] = useState('app');

  // Landlord & Property Form State (1:1 with Pia's Figma)
  const [propertyType, setPropertyType] = useState('Boarding House / Bedspace');
  const [landlordName, setLandlordName] = useState('PEYA');
  const [contactNumber, setContactNumber] = useState('09623306167');
  const [roomNumber, setRoomNumber] = useState('FA');
  const [propertyAddress, setPropertyAddress] = useState('AFA');
  const [monthlyRent, setMonthlyRent] = useState(424);
  const [deposit, setDeposit] = useState(423);
  const [advanceRent, setAdvanceRent] = useState(243);
  const [leaseDuration, setLeaseDuration] = useState('6 months');
  const [rentReminderEnabled, setRentReminderEnabled] = useState(true);

  // Contract Clauses (Live editable & AI customizable)
  const [contractClauses, setContractClauses] = useState([
    {
      num: 1,
      title: '1. Parties',
      text: 'This residential lease agreement is entered into by PEYA (Lessor) and SDH (Lessee).'
    },
    {
      num: 2,
      title: '2. Leased Premises',
      text: 'The Lessor leases FA situated at AFA (Boarding House / Bedspace) strictly for residential dwelling.'
    },
    {
      num: 3,
      title: '3. Rent and Security Deposit',
      text: 'Monthly rent is ₱424, due on or before Every 5th. A security deposit of ₱423 and advance rent of ₱243 are due upon contract signing.'
    },
    {
      num: 4,
      title: '4. Term of Lease',
      text: 'The lease begins on 2026-10-31 for an initial duration of 6 months.'
    },
    {
      num: 5,
      title: '5. Utilities and Operating Expenses',
      text: 'Electricity billing is arranged via Sub-meter. Water utility is arranged via Shared split.'
    },
    {
      num: 6,
      title: '6. House Rules & Quiet Hours',
      text: 'Quiet hours from 10 PM. Clean common areas. No subleasing.'
    },
    {
      num: 7,
      title: '7. Maintenance & Repairs',
      text: 'The tenant shall maintain the premises in tenantable condition and promptly notify the landlord of any needed repairs.'
    },
    {
      num: 8,
      title: '8. Termination & Notice',
      text: 'At least 30 days written notice prior to termination pursuant to Article 1687 of the Civil Code.'
    }
  ]);

  // Justine's AI System Prompt / Contract Customizer State
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiIsCustomizing, setAiIsCustomizing] = useState(false);
  const [aiUpdateToast, setAiUpdateToast] = useState('');

  // Tenant State
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeCode, setActiveCode] = useState('RIP-4B92');
  const [tenantName, setTenantName] = useState('SDH');
  const [hasScannedId, setHasScannedId] = useState(false);
  const [tenantHasReadContract, setTenantHasReadContract] = useState(false);
  const [signingMode, setSigningMode] = useState('DIGITAL');
  const [hasSigned, setHasSigned] = useState(false);
  const [paymentUploaded, setPaymentUploaded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Tenants Directory List (1:1 with Pia's Figma Image 5)
  const tenantsList = [
    { id: 1, avatar: 'S', name: 'sad', unit: 'gasf · Condo', rent: 5423, status: 'Active', due: 'Every 5th' },
    { id: 2, avatar: 'A', name: 'a', unit: 'ad · Boarding House', rent: 42, status: 'Active', due: 'Every 5th' },
    { id: 3, avatar: 'CK', name: 'Charlie Kirk', unit: '1 · Boarding House', rent: 5000, status: 'Active', due: 'Every 15th' },
  ];

  const filteredTenants = tenantsList.filter(t => {
    if (tenantFilter === 'ACTIVE' && t.status !== 'Active') return false;
    if (tenantFilter === 'DUE' && !t.due.includes('5th')) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleApplyAiCustomization = (promptText) => {
    const query = promptText || aiCustomPrompt;
    if (!query.trim()) return;

    setAiIsCustomizing(true);
    setTimeout(() => {
      setAiIsCustomizing(false);
      let updated = [...contractClauses];

      if (query.toLowerCase().includes('smoking') || query.toLowerCase().includes('smoke')) {
        updated[5] = {
          num: 6,
          title: '6. House Rules & Quiet Hours',
          text: 'Strictly NO SMOKING inside premises (₱1,000 fine per violation). Quiet hours from 10 PM. Clean common areas.'
        };
        setAiUpdateToast('Added strict No-Smoking clause!');
      } else if (query.toLowerCase().includes('pet')) {
        updated.push({
          num: 9,
          title: '9. Pet Policy',
          text: 'One small domesticated pet allowed (under 10kg) with an additional refundable pet deposit of ₱1,500.'
        });
        setAiUpdateToast('Added Pet Policy clause (₱1,500 deposit)!');
      } else if (query.toLowerCase().includes('bisaya') || query.toLowerCase().includes('tagalog')) {
        updated[5] = {
          num: 6,
          title: '6. Patakaran sa Balay ug Tingog',
          text: 'Hilom sugod alas-10 sa gabii. Hinloan ang mga komon nga lugar. Bawal ang magpuyo nga dili nakalista sa kontrata.'
        };
        setAiUpdateToast('Translated House Rules to Bisaya!');
      } else if (query.toLowerCase().includes('electric') || query.toLowerCase().includes('kwh') || query.toLowerCase().includes('sub-meter')) {
        updated[4] = {
          num: 5,
          title: '5. Utilities and Operating Expenses',
          text: 'Electricity sub-meter rate pegged at ₱15.00/kWh read every 30th. Water utility split equally among occupants.'
        };
        setAiUpdateToast('Updated sub-meter rate to ₱15/kWh!');
      } else if (query.toLowerCase().includes('grace') || query.toLowerCase().includes('penalty')) {
        updated[2] = {
          num: 3,
          title: '3. Rent and Security Deposit',
          text: `Monthly rent is ₱${monthlyRent}, due every 5th with a 5-day grace period. Late payments incur ₱50/day penalty. Deposit: ₱${deposit}.`
        };
        setAiUpdateToast('Added 5-day grace period & penalty clause!');
      } else {
        updated.push({
          num: updated.length + 1,
          title: `${updated.length + 1}. Special Agreement`,
          text: `${query} (Enforceable under the Rent Control Act of the Philippines & Civil Code).`
        });
        setAiUpdateToast('Clause customized successfully by Gemini AI!');
      }

      setContractClauses(updated);
      setAiCustomPrompt('');
      setTimeout(() => setAiUpdateToast(''), 4000);
    }, 800);
  };

  return (
    <AppContext.Provider value={{
      currentScreen, setCurrentScreen,
      layoutMode, setLayoutMode,
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
      aiCustomPrompt, setAiCustomPrompt,
      aiIsCustomizing, setAiIsCustomizing,
      aiUpdateToast, setAiUpdateToast,
      handleApplyAiCustomization,
      roomCodeInput, setRoomCodeInput,
      activeCode, setActiveCode,
      tenantName, setTenantName,
      hasScannedId, setHasScannedId,
      tenantHasReadContract, setTenantHasReadContract,
      signingMode, setSigningMode,
      hasSigned, setHasSigned,
      paymentUploaded, setPaymentUploaded,
      copiedLink, setCopiedLink,
      handleCopyLink,
      tenantFilter, setTenantFilter,
      searchQuery, setSearchQuery,
      tenantsList, filteredTenants
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
