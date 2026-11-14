// Authentication Service using Firebase Auth & Cloud Firestore - Owned by Agent A per COORDINATION.md
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { checkPasswordStrength } from './passwordStrength';

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
 * Register a new Landlord using Firebase Auth & Cloud Firestore
 */
export async function registerLandlordUser({ 
  email, 
  password, 
  name, 
  phone, 
  propertyName, 
  propertyAddress, 
  city 
}) {
  const cleanPhone = normalizePhone(phone);
  const cleanName = (name || '').trim();
  const cleanCity = (city || '').trim();
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

  const authEmail = (email && email.trim()) 
    ? email.trim().toLowerCase() 
    : `landlord_${cleanPhone}@rentinpeace.ph`;

  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      // If auth account already exists, try logging in
      try {
        userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
      } catch (signErr) {
        throw new Error('An account with this email/mobile already exists. Please Sign In.');
      }
    } else {
      throw new Error(`Registration error: ${err.message}`);
    }
  }

  const fullPropertyAddress = cleanAddress 
    ? (cleanCity && !cleanAddress.includes(cleanCity) ? `${cleanAddress}, ${cleanCity}` : cleanAddress)
    : `${cleanPropName || 'Rental Property'}, ${cleanCity || 'Philippines'}`;

  const profileData = {
    id: cleanPhone,
    uid: userCredential.user.uid,
    name: cleanName,
    phone: cleanPhone,
    email: authEmail,
    propertyName: cleanPropName || 'Residential Rental Unit',
    propertyAddress: fullPropertyAddress,
    city: cleanCity || 'Philippines',
    role: 'landlord',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Persist to Cloud Firestore
  await setDoc(doc(db, 'landlords', cleanPhone), profileData, { merge: true });

  return profileData;
}

/**
 * Sign in existing Landlord with Firebase Auth
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
    const landlordSnap = await getDoc(doc(db, 'landlords', cleanPhone));
    if (landlordSnap.exists() && landlordSnap.data().email) {
      authEmail = landlordSnap.data().email;
    } else {
      authEmail = `landlord_${cleanPhone}@rentinpeace.ph`;
    }
  }

  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
  } catch (err) {
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      throw new Error('Incorrect password. Please verify your credentials or reset your password.');
    }
    if (err.code === 'auth/user-not-found') {
      throw new Error('No landlord account found with these credentials. Please Register first.');
    }
    throw new Error(`Sign in failed: ${err.message}`);
  }

  // Load Firestore profile
  let profile = null;
  if (cleanPhone) {
    const snap = await getDoc(doc(db, 'landlords', cleanPhone));
    if (snap.exists()) {
      profile = snap.data();
    }
  }

  if (!profile) {
    profile = {
      id: cleanPhone || userCredential.user.uid,
      uid: userCredential.user.uid,
      name: userCredential.user.displayName || 'Landlord',
      phone: cleanPhone,
      email: authEmail,
      city: 'Philippines'
    };
  }

  return profile;
}

/**
 * Register a new Tenant with Firebase Auth & Cloud Firestore
 */
export async function registerTenantUser({ 
  email, 
  username, 
  password, 
  name, 
  phone, 
  code 
}) {
  const cleanUser = (username || '').trim().toLowerCase().replace(/\s+/g, '');
  const cleanName = (name || '').trim();
  const cleanCode = (code || '').trim().toUpperCase();
  const cleanPhone = normalizePhone(phone);

  if (!cleanCode) {
    throw new Error('Please enter a valid Landlord Room Code (e.g. RIP-XXXX).');
  }
  if (!cleanUser) {
    throw new Error('Please choose a username.');
  }
  if (!cleanName) {
    throw new Error('Please provide your full legal name as lessee.');
  }

  // Live password strength requirement
  const strength = checkPasswordStrength(password);
  if (!strength.isStrong) {
    throw new Error('Password is too weak. Please ensure it has 8+ characters, upper & lowercase letters, a number, and a symbol.');
  }

  const authEmail = (email && email.trim()) 
    ? email.trim().toLowerCase() 
    : `tenant_${cleanUser}@rentinpeace.ph`;

  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      try {
        userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
      } catch (signErr) {
        throw new Error('An account with this username or email already exists. Please Sign In.');
      }
    } else {
      throw new Error(`Tenant registration error: ${err.message}`);
    }
  }

  const tenantRecord = {
    id: cleanUser,
    uid: userCredential.user.uid,
    username: cleanUser,
    name: cleanName,
    email: authEmail,
    phone: cleanPhone,
    contractCode: cleanCode,
    role: 'tenant',
    createdAt: new Date().toISOString()
  };

  // Write to Cloud Firestore
  await setDoc(doc(db, 'tenants', cleanUser), tenantRecord, { merge: true });

  return tenantRecord;
}

/**
 * Sign in existing Tenant with Firebase Auth
 */
export async function loginTenantUser({ identifier, password, code }) {
  const cleanIdent = (identifier || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!cleanIdent) {
    throw new Error('Please enter your username or email.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  let authEmail = cleanIdent;
  if (!cleanIdent.includes('@')) {
    const tenantDoc = await getDoc(doc(db, 'tenants', cleanIdent));
    if (tenantDoc.exists() && tenantDoc.data().email) {
      authEmail = tenantDoc.data().email;
    } else {
      authEmail = `tenant_${cleanIdent}@rentinpeace.ph`;
    }
  }

  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
  } catch (err) {
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      throw new Error('Incorrect password. Please verify and try again.');
    }
    if (err.code === 'auth/user-not-found') {
      throw new Error(`Account "${cleanIdent}" not found. Please join using your room code.`);
    }
    throw new Error(`Login failed: ${err.message}`);
  }

  let tenantProfile = null;
  const snap = await getDoc(doc(db, 'tenants', cleanIdent));
  if (snap.exists()) {
    tenantProfile = snap.data();
  } else {
    tenantProfile = {
      id: cleanIdent,
      uid: userCredential.user.uid,
      username: cleanIdent,
      name: userCredential.user.displayName || cleanIdent,
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
  await sendPasswordResetEmail(auth, cleanEmail);
  return true;
}

/**
 * Sign out current Firebase Auth user
 */
export async function signOutUser() {
  await signOut(auth);
}
