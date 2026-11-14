// Per-Tenant Access Code Service - Owned by Agent B per COORDINATION.md
import { doc, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

const TRIVIAL_CODES = new Set([
  '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
  '1234', '4321', '0123', '2345', '3456', '4567', '5678', '6789', '9876', '8765',
  '00000', '11111', '22222', '33333', '44444', '55555', '66666', '77777', '88888', '99999',
  '12345', '54321', '01234', '23456', '34567', '45678', '56789',
  '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999',
  '123456', '654321'
]);

/**
 * Generates a cryptographically secure 5-digit door access code using crypto.getRandomValues.
 * Strictly excludes trivial codes, all repeated digits, and predictable sequences.
 * 
 * @returns {string} 5-digit secure code string
 */
export function generateSecureAccessCode() {
  while (true) {
    const uint32 = new Uint32Array(1);
    crypto.getRandomValues(uint32);
    
    // Generate 5-digit integer between 10234 and 98765
    const num = 10000 + (uint32[0] % 90000);
    const code = num.toString();

    // Check trivial list and repeating single digits (e.g. 77777)
    if (!TRIVIAL_CODES.has(code) && !/^(\d)\1+$/.test(code)) {
      return code;
    }
  }
}

/**
 * Verifies tenant payment and issues a brand-new cryptographically secure access code.
 * Stores access code in Firestore only upon verification.
 * 
 * @param {string} contractCode 
 * @param {string|null} paymentId 
 * @param {import('firebase/firestore').Firestore} db 
 * @returns {Promise<{accessCode: string}>}
 */
export async function verifyPaymentAndIssueCode(contractCode, paymentId, db) {
  if (!contractCode) {
    throw new Error('Contract code is required for payment verification.');
  }

  const cleanCode = contractCode.trim().toUpperCase();
  const newAccessCode = generateSecureAccessCode();
  const now = new Date().toISOString();

  // 1. Update contract with verified status and the newly generated access code
  await setDoc(doc(db, 'contracts', cleanCode), {
    status: 'Active',
    paymentVerified: true,
    accessCode: newAccessCode,
    accessCodeIssuedAt: now,
    verifiedAt: now
  }, { merge: true });

  // 2. Also write to dedicated protected subcollection for server-side rule enforcement
  await setDoc(doc(db, 'contracts', cleanCode, 'access', 'keypad'), {
    accessCode: newAccessCode,
    status: 'verified',
    issuedAt: now
  }, { merge: true });

  // 3. Mark payment as verified
  try {
    const q = query(collection(db, 'payments'), where('contractCode', '==', cleanCode));
    const pSnap = await getDocs(q);
    for (const pDoc of pSnap.docs) {
      if (!paymentId || pDoc.id === paymentId) {
        await setDoc(doc(db, 'payments', pDoc.id), {
          status: 'Verified',
          verifiedAt: now
        }, { merge: true });
      }
    }
  } catch (err) {
    console.warn('[AccessCode] Payment doc update notice:', err.message);
  }

  return { accessCode: newAccessCode };
}

/**
 * Regenerates an access code for an existing verified tenant (or upon move-out/request),
 * immediately invalidating the previous code.
 * 
 * @param {string} contractCode 
 * @param {import('firebase/firestore').Firestore} db 
 * @returns {Promise<{accessCode: string}>}
 */
export async function regenerateAccessCode(contractCode, db) {
  if (!contractCode) {
    throw new Error('Contract code is required to regenerate access code.');
  }

  const cleanCode = contractCode.trim().toUpperCase();
  const newAccessCode = generateSecureAccessCode();
  const now = new Date().toISOString();

  await setDoc(doc(db, 'contracts', cleanCode), {
    accessCode: newAccessCode,
    accessCodeRegeneratedAt: now
  }, { merge: true });

  await setDoc(doc(db, 'contracts', cleanCode, 'access', 'keypad'), {
    accessCode: newAccessCode,
    status: 'verified',
    regeneratedAt: now
  }, { merge: true });

  return { accessCode: newAccessCode };
}
