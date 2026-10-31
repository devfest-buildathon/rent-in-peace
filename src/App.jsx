import React from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Layout Components
import PitchBar from './components/layout/PitchBar';
import MobileFrame from './components/layout/MobileFrame';
import PrintableContract from './components/shared/PrintableContract';

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
import InviteCodeScreen from './screens/tenant/InviteCodeScreen';
import TenantPortalScreen from './screens/tenant/TenantPortalScreen';
import SuccessPinScreen from './screens/tenant/SuccessPinScreen';

function RentInPeaceContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      // Landlord Flow
      case 'SPLASH':
        return <SplashScreen />;
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
      case 'TENANT_CODE_ENTRY':
        return <InviteCodeScreen />;
      case 'TENANT_PORTAL':
        return <TenantPortalScreen />;
      case 'SUCCESS_PIN':
        return <SuccessPinScreen />;

      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E9EE] text-slate-800 flex flex-col items-center justify-start sm:justify-center p-0 md:p-4 font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Demo & Pitch Controller Bar */}
      <PitchBar />

      {/* Responsive Mobile Phone Container */}
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
