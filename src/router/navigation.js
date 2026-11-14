// History-based Navigation Router - Owned by Agent A per COORDINATION.md

/**
 * Returns the logical back screen for any given screen and context
 */
export function getLogicalPreviousScreen(currentScreen, context = {}) {
  const { userRole, selectedTenant } = context;

  switch (currentScreen) {
    // Auth Screens
    case 'LANDLORD_AUTH':
    case 'LANDLORD_REGISTER':
    case 'TENANT_AUTH':
    case 'TENANT_CODE_ENTRY':
      return 'SPLASH';

    // Landlord Wizard
    case 'WIZARD_PROPERTY':
      return 'LANDLORD_HOME';
    case 'WIZARD_DETAILS':
      return 'WIZARD_PROPERTY';
    case 'WIZARD_REVIEW':
      return 'WIZARD_DETAILS';
    case 'WIZARD_CONTRACT':
      if (userRole === 'TENANT') return 'TENANT_HOME';
      if (selectedTenant) return 'TENANT_DETAIL';
      return 'WIZARD_REVIEW';
    case 'WIZARD_CHECK':
      return 'WIZARD_CONTRACT';
    case 'ALL_DONE':
      return 'LANDLORD_HOME';

    // Landlord Management
    case 'LANDLORD_TENANTS':
      return 'LANDLORD_HOME';
    case 'TENANT_DETAIL':
      return 'LANDLORD_TENANTS';
    case 'SETTINGS':
      return userRole === 'TENANT' ? 'TENANT_HOME' : 'LANDLORD_HOME';

    // Tenant Flow
    case 'TENANT_PORTAL':
      return 'TENANT_AUTH';
    case 'SUCCESS_PIN':
      return 'TENANT_HOME';
    case 'TENANT_HOME':
      return 'SPLASH';

    default:
      return 'SPLASH';
  }
}

/**
 * Initialize history listeners for browser back/forward and gestures
 */
export function initHistoryRouter(onScreenChange) {
  if (typeof window === 'undefined') return () => {};

  const handlePopState = (event) => {
    if (event.state && event.state.screen) {
      onScreenChange(event.state.screen, false); // false = do not pushState again
    }
  };

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}

/**
 * Push new screen onto browser history stack without changing URL route
 */
export function pushScreenHistory(screen) {
  if (typeof window === 'undefined' || !screen) return;
  try {
    const currentState = window.history.state;
    if (currentState?.screen !== screen) {
      window.history.pushState({ screen, timestamp: Date.now() }, '', window.location.href);
    }
  } catch (e) {}
}
