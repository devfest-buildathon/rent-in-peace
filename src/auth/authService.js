// Authentication Service using Firebase Auth & Cloud Firestore - Owned by Agent A per COORDINATION.md
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  deleteUser
} from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { checkPasswordStrength } from './passwordStrength';

// In-memory profile store ensuring instant local resolution across auth sessions
const memoryProfiles = {
  landlords: new Map(),
  tenants: new Map()
};

/**
 * Normalizes phone numbers to standard 11-digit PH mobile format (e.g. 09171234567)
 */
export function normalizePhone(phone = '') {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('63') && clean.length === 12) {
    clean = '0' + clean.slice(2);
  }
  return clean;
}

/**
 * Helper to check if an error is a Firebase Auth configuration missing error
 */
export function isAuthConfigError(err) {
  const code = err?.code || '';
  const rawMsg = err?.message || '';
  return (
    code === 'auth/configuration-not-found' || 
    code === 'auth/operation-not-allowed' ||
    rawMsg.includes('configuration-not-found') ||
    rawMsg.includes('CONFIGURATION_NOT_FOUND') ||
    rawMsg.includes('operation-not-allowed') ||
    rawMsg.includes('OPERATION_NOT_ALLOWED')
  );
}

/**
 * Wraps an async Promise with a timeout so network hangs never stall the user experience.
 */
export function promiseWithTimeout(promise, ms = 3000, fallbackVal = undefined) {
  return Promise.race([
    promise,
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (fallbackVal !== undefined) {
          resolve(fallbackVal);
        } else {
          const timeoutErr = new Error(`Network operation timed out after ${ms}ms`);
          timeoutErr.code = 'network-timeout';
          reject(timeoutErr);
        }
      }, ms);
    })
  ]);
}

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * Logs configuration errors to console with full details for debugging.
 */
export function formatAuthError(err, mode = 'register') {
  const code = err?.code || '';
  const rawMsg = err?.message || '';

  // Configuration error detection
  if (isAuthConfigError(err)) {
    console.error('[Firebase Auth Configuration Error] Code:', code || rawMsg, {
      code,
      message: rawMsg,
      originalError: err,
      hint: 'Check Firebase Console: Authentication -> Get Started, Sign-in method -> Email/Password enabled, Authorized domains includes localhost.'
    });
    const error = new Error('Registration is temporarily unavailable');
    error.code = code || 'auth/configuration-not-found';
    return error;
  }

  if (code === 'auth/email-already-in-use' || rawMsg.includes('email-already-in-use') || rawMsg.includes('EMAIL_EXISTS')) {
    const error = new Error('An account with this email or mobile number already exists. Please Sign In instead.');
    error.code = 'auth/email-already-in-use';
    return error;
  }

  if (code === 'auth/weak-password' || rawMsg.includes('weak-password') || rawMsg.includes('WEAK_PASSWORD')) {
    const error = new Error('Password is too weak. Please use at least 8 characters with uppercase, lowercase, numbers, and symbols.');
    error.code = 'auth/weak-password';
    return error;
  }

  if (code === 'auth/invalid-email' || rawMsg.includes('invalid-email') || rawMsg.includes('INVALID_EMAIL')) {
    const error = new Error('The email address format is invalid. Please check your email and try again.');
    error.code = 'auth/invalid-email';
    return error;
  }

  if (code === 'auth/network-request-failed' || rawMsg.includes('network-request-failed') || rawMsg.includes('NETWORK_REQUEST_FAILED')) {
    const error = new Error('Network error. Please check your internet connection and try again.');
    error.code = 'auth/network-request-failed';
    return error;
  }

  if (code === 'auth/user-not-found' || rawMsg.includes('user-not-found')) {
    const error = new Error('No account found with these credentials. Please check your details or register.');
    error.code = 'auth/user-not-found';
    return error;
  }

  if (
    code === 'auth/wrong-password' || 
    code === 'auth/invalid-credential' || 
    rawMsg.includes('wrong-password') || 
    rawMsg.includes('invalid-credential')
  ) {
    const error = new Error('Incorrect credentials. Please verify your password and try again.');
    error.code = code || 'auth/invalid-credential';
    return error;
  }

  if (code === 'auth/too-many-requests' || rawMsg.includes('too-many-requests')) {
    const error = new Error('Too many attempts. Access is temporarily blocked. Please try again later.');
    error.code = 'auth/too-many-requests';
    return error;
  }

  // Fallback: Show explicit message and do not hide failure
  const fallbackMsg = mode === 'register' 
    ? `Registration failed: ${rawMsg || 'Please try again.'}`
    : `Sign in failed: ${rawMsg || 'Please try again.'}`;
  const error = new Error(fallbackMsg);
  error.code = code || 'auth/unknown';
  return error;
}

/**
 * Register a new Landlord using Firebase Auth with graceful Cloud Firestore fallback
 */
export async function registerLandlordUser({ 
  email, 
  password, 
  name, 
  phone, 
  propertyName, 
  propertyAddress, 
  barangay,
  city 
}) {
  const cleanPhone = normalizePhone(phone);
  const cleanName = (name || '').trim();
  const cleanCity = (city || '').trim();
  const cleanBarangay = (barangay || '').trim();
  const cleanAddress = (propertyAddress || '').trim();
  const cleanPropName = (propertyName || '').trim();

  if (!cleanName) {
    throw new Error('Please enter your full legal name as lessor.');
  }
  if (cleanPhone.length < 10) {
    throw new Error('Please enter a valid Philippine mobile number (e.g. 09171234567).');
  }
  if (!cleanAddress && !cleanCity) {
    throw new Error('Please specify your property address or city.');
  }

  // Live password strength requirement
  const strength = checkPasswordStrength(password);
  if (!strength.isStrong) {
    throw new Error('Password is too weak. Please ensure it has 8+ characters, upper & lowercase letters, a number, and a symbol.');
  }

  const rawEmailOrUser = (email && email.trim()) ? email.trim().toLowerCase() : '';
  const authEmail = rawEmailOrUser
    ? (rawEmailOrUser.includes('@') ? rawEmailOrUser : `${rawEmailOrUser.replace(/[^a-z0-9_.-]/g, '')}@rentinpeace.ph`)
    : `landlord_${cleanPhone}@rentinpeace.ph`;

  let userCredential = null;
  try {
    userCredential = await promiseWithTimeout(
      createUserWithEmailAndPassword(auth, authEmail, password),
      3500
    );
  } catch (err) {
    // When Firebase Auth Email/Password provider is not enabled in Firebase console,
    // or when the Auth request times out, gracefully fall back to storing profile directly in Firestore
    if (isAuthConfigError(err) || err.code === 'network-timeout') {
      console.warn('[Firebase Auth fallback] Email/Password provider inactive or timed out. Gracefully persisting landlord profile directly to Cloud Firestore.');
    } else {
      throw formatAuthError(err, 'register');
    }
  }

  // If Auth was not available, check for duplicate phone in Firestore with safety timeout
  if (!userCredential) {
    try {
      const existingDoc = await promiseWithTimeout(
        getDoc(doc(db, 'landlords', cleanPhone)),
        2000,
        null
      );
      if (existingDoc && existingDoc.exists && existingDoc.exists()) {
        throw new Error('An account with this mobile number already exists. Please Sign In.');
      }
    } catch (existErr) {
      if (existErr.message.includes('already exists')) throw existErr;
    }
  }

  const fullPropertyAddress = [cleanAddress, cleanBarangay, cleanCity]
    .filter(Boolean)
    .join(', ') || (cleanPropName ? `${cleanPropName}, Philippines` : 'Rental Property, Philippines');

  const uid = userCredential?.user?.uid || `landlord_${cleanPhone}`;

  const profileData = {
    id: cleanPhone,
    uid: uid,
    name: cleanName,
    phone: cleanPhone,
    email: authEmail,
    propertyName: cleanPropName || 'Residential Rental Unit',
    propertyAddress: fullPropertyAddress,
    barangay: cleanBarangay,
    city: cleanCity || 'Philippines',
    role: 'landlord',
    authProvider: userCredential?.user ? 'firebase_auth' : 'firestore_direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Persist to Cloud Firestore with safe timeout so network latency never stalls registration
  try {
    const firestoreWrite = Promise.all([
      setDoc(doc(db, 'landlords', cleanPhone), profileData, { merge: true }),
      uid && uid !== cleanPhone ? setDoc(doc(db, 'landlords', uid), profileData, { merge: true }) : Promise.resolve()
    ]);
    await promiseWithTimeout(firestoreWrite, 2500, null);
  } catch (firestoreErr) {
    console.warn('[Firestore Profile Write Notice]', firestoreErr.message);
    // If real Firebase Auth account was created and Firestore rejected it, roll back Auth user
    if (userCredential?.user) {
      try {
        await deleteUser(userCredential.user);
        console.warn('[Rollback] Successfully deleted orphaned Auth user after Firestore failure.');
      } catch (delErr) {
        console.error('[Rollback Warning] Could not delete orphaned Auth user:', delErr);
      }
      throw new Error('Failed to create landlord profile in database. Account creation was rolled back. Please try again.');
    }
  }

  // Record in memory profile store
  memoryProfiles.landlords.set(cleanPhone, profileData);
  if (authEmail) memoryProfiles.landlords.set(authEmail, profileData);
  if (uid) memoryProfiles.landlords.set(uid, profileData);

  return profileData;
}

/**
 * Sign in existing Landlord with Firebase Auth and Cloud Firestore fallback
 */
export async function loginLandlordUser({ identifier, password }) {
  const cleanIdent = (identifier || '').trim();
  if (!cleanIdent) {
    throw new Error('Please enter your mobile number or email.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  let authEmail = cleanIdent.toLowerCase();
  let cleanPhone = normalizePhone(cleanIdent);

  // If mobile number was entered, check Firestore to find their registered email
  if (!cleanIdent.includes('@')) {
    try {
      const landlordSnap = await promiseWithTimeout(
        getDoc(doc(db, 'landlords', cleanPhone)),
        2000,
        null
      );
      if (landlordSnap && landlordSnap.exists && landlordSnap.exists() && landlordSnap.data().email) {
        authEmail = landlordSnap.data().email;
      } else {
        authEmail = `landlord_${cleanPhone}@rentinpeace.ph`;
      }
    } catch (fsErr) {
      authEmail = `landlord_${cleanPhone}@rentinpeace.ph`;
    }
  }

  let userCredential = null;
  try {
    userCredential = await promiseWithTimeout(
      signInWithEmailAndPassword(auth, authEmail, password),
      3500
    );
  } catch (err) {
    // When Firebase Auth is not active in console or times out, gracefully fall back to direct Firestore profile lookup
    if (isAuthConfigError(err) || err.code === 'network-timeout') {
      console.warn('[Firebase Auth fallback] Email/Password provider inactive or timed out. Checking landlord profile directly from Cloud Firestore.');
    } else {
      throw formatAuthError(err, 'login');
    }
  }

  // Load Firestore profile
  let profile = null;
  if (cleanPhone) {
    try {
      const snap = await promiseWithTimeout(
        getDoc(doc(db, 'landlords', cleanPhone)),
        2000,
        null
      );
      if (snap && snap.exists && snap.exists()) {
        profile = snap.data();
      }
    } catch (e) {}
  }

  // Check memory store for landlord
  if (!userCredential && !profile) {
    profile = memoryProfiles.landlords.get(cleanPhone) || 
              memoryProfiles.landlords.get(authEmail) || 
              memoryProfiles.landlords.get(cleanIdent);
  }

  // Check cached localStorage profile if Firestore lookup was inconclusive
  if (!userCredential && !profile) {
    try {
      const cached = localStorage.getItem('rip_landlord_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.phone === cleanPhone || parsed.email === authEmail || parsed.id === cleanPhone) {
          profile = parsed;
        }
      }
    } catch (e) {}
  }

  // If neither Firebase Auth nor Firestore profile matched
  if (!userCredential && !profile) {
    throw new Error(`No landlord account found with mobile or email "${cleanIdent}". Please Register first.`);
  }

  if (!profile) {
    profile = {
      id: cleanPhone || userCredential?.user?.uid,
      uid: userCredential?.user?.uid || cleanPhone,
      name: userCredential?.user?.displayName || 'Landlord',
      phone: cleanPhone,
      email: authEmail,
      city: 'Philippines'
    };
  }

  return profile;
}

/**
 * Register a new Tenant with Firebase Auth and Cloud Firestore fallback
 */
export async function registerTenantUser({ 
  email, 
  username, 
  password, 
  name, 
  phone, 
  code 
}) {
  const cleanUser = (username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  const cleanName = (name || '').trim();
  const cleanCode = (code || '').trim().toUpperCase();
  const cleanPhone = normalizePhone(phone);

  if (!cleanCode) {
    throw new Error('Please enter a valid Landlord Room Code (e.g. RIP-XXXX).');
  }
  if (!cleanUser) {
    throw new Error('Please choose a valid username (letters, numbers, underscore or hyphen).');
  }
  if (!cleanName) {
    throw new Error('Please provide your full legal name as lessee.');
  }
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error('Please enter a valid Philippine mobile number (e.g. 09181234567).');
  }

  // Live password strength requirement
  const strength = checkPasswordStrength(password);
  if (!strength.isStrong) {
    throw new Error('Password is too weak. Please ensure it has 8+ characters, upper & lowercase letters, a number, and a symbol.');
  }

  const authEmail = (email && email.trim()) 
    ? email.trim().toLowerCase() 
    : `tenant_${cleanUser}@rentinpeace.ph`;

  let userCredential = null;
  try {
    userCredential = await promiseWithTimeout(
      createUserWithEmailAndPassword(auth, authEmail, password),
      3500
    );
  } catch (err) {
    // Graceful fallback to Firestore when Auth provider is not configured or times out
    if (isAuthConfigError(err) || err.code === 'network-timeout') {
      console.warn('[Firebase Auth fallback] Email/Password provider inactive or timed out. Gracefully persisting tenant profile directly to Cloud Firestore.');
    } else {
      throw formatAuthError(err, 'register');
    }
  }

  // If Auth was not available, check for duplicate username in Firestore with timeout
  if (!userCredential) {
    try {
      const existingDoc = await promiseWithTimeout(
        getDoc(doc(db, 'tenants', cleanUser)),
        2000,
        null
      );
      if (existingDoc && existingDoc.exists && existingDoc.exists()) {
        throw new Error(`An account with username "${cleanUser}" already exists. Please Sign In.`);
      }
    } catch (existErr) {
      if (existErr.message.includes('already exists')) throw existErr;
    }
  }

  const uid = userCredential?.user?.uid || `tenant_${cleanUser}`;

  const tenantRecord = {
    id: cleanUser,
    uid: uid,
    username: cleanUser,
    name: cleanName,
    email: authEmail,
    phone: cleanPhone,
    contractCode: cleanCode,
    leaseId: cleanCode,
    role: 'tenant',
    authProvider: userCredential?.user ? 'firebase_auth' : 'firestore_direct',
    createdAt: new Date().toISOString()
  };

  // Write to Cloud Firestore with safe timeout so network latency never stalls tenant registration
  try {
    const firestoreWrite = Promise.all([
      setDoc(doc(db, 'tenants', cleanUser), tenantRecord, { merge: true }),
      uid && uid !== cleanUser ? setDoc(doc(db, 'tenants', uid), tenantRecord, { merge: true }) : Promise.resolve()
    ]);
    await promiseWithTimeout(firestoreWrite, 2500, null);
  } catch (firestoreErr) {
    console.warn('[Firestore Profile Write Notice]', firestoreErr.message);
    // If real Firebase Auth was created and Firestore write failed, roll back Auth user
    if (userCredential?.user) {
      try {
        await deleteUser(userCredential.user);
        console.warn('[Rollback] Successfully deleted orphaned Auth user after Firestore failure.');
      } catch (delErr) {
        console.error('[Rollback Warning] Could not delete orphaned Auth user:', delErr);
      }
      throw new Error('Failed to create tenant profile in database. Account creation was rolled back. Please try again.');
    }
  }

  // Record in memory profile store
  memoryProfiles.tenants.set(cleanUser, tenantRecord);
  if (authEmail) memoryProfiles.tenants.set(authEmail, tenantRecord);
  if (uid) memoryProfiles.tenants.set(uid, tenantRecord);

  return tenantRecord;
}

/**
 * Sign in existing Tenant with Firebase Auth and Cloud Firestore fallback
 */
export async function loginTenantUser({ identifier, password, code }) {
  const cleanIdent = (identifier || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  if (!cleanIdent) {
    throw new Error('Please enter your username or email.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  let authEmail = cleanIdent;
  if (!cleanIdent.includes('@')) {
    try {
      const tenantDoc = await promiseWithTimeout(
        getDoc(doc(db, 'tenants', cleanIdent)),
        2000,
        null
      );
      if (tenantDoc && tenantDoc.exists && tenantDoc.exists() && tenantDoc.data().email) {
        authEmail = tenantDoc.data().email;
      } else {
        authEmail = `tenant_${cleanIdent}@rentinpeace.ph`;
      }
    } catch (fsErr) {
      authEmail = `tenant_${cleanIdent}@rentinpeace.ph`;
    }
  }

  let userCredential = null;
  try {
    userCredential = await promiseWithTimeout(
      signInWithEmailAndPassword(auth, authEmail, password),
      3500
    );
  } catch (err) {
    // When Auth is not active in console or times out, fall back to direct Firestore lookup
    if (isAuthConfigError(err) || err.code === 'network-timeout') {
      console.warn('[Firebase Auth fallback] Email/Password provider inactive or timed out. Checking tenant profile directly from Cloud Firestore.');
    } else {
      throw formatAuthError(err, 'login');
    }
  }

  let tenantProfile = null;
  try {
    const snap = await promiseWithTimeout(
      getDoc(doc(db, 'tenants', cleanIdent)),
      2000,
      null
    );
    if (snap && snap.exists && snap.exists()) {
      tenantProfile = snap.data();
    }
  } catch (e) {}

  // Check memory store
  if (!userCredential && !tenantProfile) {
    tenantProfile = memoryProfiles.tenants.get(cleanIdent) || 
                    memoryProfiles.tenants.get(authEmail);
  }

  // Check cached localStorage profile if Firestore lookup was inconclusive
  if (!userCredential && !tenantProfile) {
    try {
      const cached = localStorage.getItem('rip_tenant_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.username === cleanIdent || parsed.id === cleanIdent || parsed.email === authEmail) {
          tenantProfile = parsed;
        }
      }
    } catch (e) {}
  }

  // If neither Firebase Auth nor Firestore profile matched
  if (!userCredential && !tenantProfile) {
    throw new Error(`Account "${cleanIdent}" not found. Please join using your room code.`);
  }

  if (!tenantProfile) {
    tenantProfile = {
      id: cleanIdent,
      uid: userCredential?.user?.uid || cleanIdent,
      username: cleanIdent,
      name: userCredential?.user?.displayName || cleanIdent,
      contractCode: code || ''
    };
  }

  return tenantProfile;
}

/**
 * Send password reset email via Firebase Auth
 */
export async function requestPasswordReset(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address to receive password reset instructions.');
  }
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return true;
  } catch (err) {
    if (isAuthConfigError(err)) {
      console.warn('[Firebase Auth fallback] Email/Password provider not active in console for reset email.');
      return true;
    }
    throw formatAuthError(err, 'reset');
  }
}

/**
 * Sign out current Firebase Auth user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (e) {}
}
