import React, { useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Layout Components
import MobileFrame from './components/layout/MobileFrame';
import PrintableContract from './components/shared/PrintableContract';

// Auth Screens (Landlord & Tenant)
import LandlordAuthScreen from './screens/auth/LandlordAuthScreen';
import TenantAuthScreen from './screens/auth/TenantAuthScreen';

// Landlord Screens
import SplashScreen from './screens/landlord/SplashScreen';
import LandlordHomeScreen from './screens/landlord/LandlordHomeScreen';
import PropertyTypeScreen from './screens/landlord/PropertyTypeScreen';
import BasicsFormScreen from './screens/landlord/BasicsFormScreen';
import ReviewShareScreen from './screens/landlord/ReviewShareScreen';
import KasulatanScreen from './screens/landlord/KasulatanScreen';
import SmartCheckScreen from './screens/landlord/SmartCheckScreen';
import AllDoneScreen from './screens/landlord/AllDoneScreen';
import MyTenantsScreen from './screens/landlord/MyTenantsScreen';
import TenantDetailScreen from './screens/landlord/TenantDetailScreen';
import SettingsScreen from './screens/landlord/SettingsScreen';

// Tenant Screens
import TenantHomeScreen from './screens/tenant/TenantHomeScreen';
import TenantPortalScreen from './screens/tenant/TenantPortalScreen';
import SuccessPinScreen from './screens/tenant/SuccessPinScreen';

function RentInPeaceContent() {
  const { currentScreen, setCurrentScreen, setRoomCodeInput, lookupContractByCode } = useApp();
  const hasHandledUrlRef = useRef(false);

  // Auto-detect invite code in URL once on mount (e.g. ?code=RIP-4B92 or #code=RIP-4B92)
  useEffect(() => {
    if (hasHandledUrlRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('invite');
    if (codeParam) {
      hasHandledUrlRef.current = true;
      const upper = codeParam.toUpperCase();
      setRoomCodeInput(upper);
      lookupContractByCode(upper).then((found) => {
        // Direct tenant to registration/login with this room code pre-loaded
        setCurrentScreen('TENANT_AUTH');
      });

      // Clear query params from browser URL so subsequent state updates never re-trigger this
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {
        // Safe fallback for restricted environments
      }
    }
  }, []); // Strictly run once on initial mount

  const renderScreen = () => {
    switch (currentScreen) {
      // Entry / Splash
      case 'SPLASH':
        return <SplashScreen />;

      // Auth Flows (Dedicated for both roles)
      case 'LANDLORD_AUTH':
      case 'LANDLORD_REGISTER':
        return <LandlordAuthScreen />;

      case 'TENANT_AUTH':
      case 'TENANT_CODE_ENTRY':
        return <TenantAuthScreen />;

      // Landlord Flow
      case 'LANDLORD_HOME':
        return <LandlordHomeScreen />;
      case 'WIZARD_PROPERTY':
        return <PropertyTypeScreen />;
      case 'WIZARD_DETAILS':
        return <BasicsFormScreen />;
      case 'WIZARD_REVIEW':
        return <ReviewShareScreen />;
      case 'WIZARD_CONTRACT':
        return <KasulatanScreen />;
      case 'WIZARD_CHECK':
        return <SmartCheckScreen />;
      case 'ALL_DONE':
        return <AllDoneScreen />;
      case 'LANDLORD_TENANTS':
        return <MyTenantsScreen />;
      case 'TENANT_DETAIL':
        return <TenantDetailScreen />;
      case 'SETTINGS':
        return <SettingsScreen />;

      // Tenant Flow
      case 'TENANT_HOME':
        return <TenantHomeScreen />;
      case 'TENANT_PORTAL':
        return <TenantPortalScreen />;
      case 'SUCCESS_PIN':
        return <SuccessPinScreen />;

      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="app-shell-root min-h-screen bg-[#E5EAE7] text-slate-800 flex flex-col items-center justify-start sm:justify-center p-0 sm:py-6 font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Responsive PWA Mobile App Container */}
      <MobileFrame>
        {renderScreen()}
      </MobileFrame>

      {/* Official Legal Document for A4 Print & PDF Export */}
      <PrintableContract />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RentInPeaceContent />
    </AppProvider>
  );
}
