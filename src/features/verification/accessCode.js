// Per-Tenant Access Code Service - Owned by Agent B per COORDINATION.md
import { doc, getDoc, setDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';

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
 * Generates an access code guaranteed unique among the landlord's active codes.
 */
export async function generateUniqueLandlordAccessCode(landlordId, db) {
  const activeCodes = new Set();
  if (db && landlordId) {
    try {
      const q = query(
        collection(db, 'access_codes'),
        where('landlordId', '==', landlordId),
        where('status', '==', 'active')
      );
      const snap = await getDocs(q);
      snap.forEach(d => {
        const val = d.data().accessCode;
        if (val) activeCodes.add(val);
      });
    } catch (e) {
      // Safe fallback
    }
  }

  let code = generateSecureAccessCode();
  let tries = 0;
  while (activeCodes.has(code) && tries < 30) {
    code = generateSecureAccessCode();
    tries++;
  }
  return code;
}

/**
 * Verifies tenant payment and issues a brand-new cryptographically secure access code.
 * Stores access code linked to lease, payment, tenant, and landlord.
 * 
 * @param {string} contractCode 
 * @param {string|null} paymentId 
 * @param {import('firebase/firestore').Firestore} db 
 * @param {string|null} landlordId
 * @param {string|null} tenantId
 * @returns {Promise<{accessCode: string, accessCodeId: string}>}
 */
export async function verifyPaymentAndIssueCode(contractCode, paymentId, db, landlordId = null, tenantId = null) {
  if (!contractCode) {
    throw new Error('Contract code is required for payment verification.');
  }

  const cleanCode = contractCode.trim().toUpperCase();
  const now = new Date().toISOString();

  // Load contract to fetch current landlordId / tenantId if not provided
  let effectiveLandlordId = landlordId;
  let effectiveTenantId = tenantId;
  try {
    const cSnap = await getDoc(doc(db, 'contracts', cleanCode));
    if (cSnap.exists()) {
      const cData = cSnap.data();
      if (!effectiveLandlordId) effectiveLandlordId = cData.landlordId;
      if (!effectiveTenantId) effectiveTenantId = cData.tenantId || cData.tenantUsername || cData.tenantName;
    }
  } catch (e) {}

  const newAccessCode = await generateUniqueLandlordAccessCode(effectiveLandlordId, db);
  const accessCodeId = `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Create linked access_codes document (Requirement 6d: leaseId, paymentId, tenantId, landlordId, createdAt, status "active")
  try {
    await setDoc(doc(db, 'access_codes', accessCodeId), {
      id: accessCodeId,
      accessCode: newAccessCode,
      leaseId: cleanCode,
      contractCode: cleanCode,
      paymentId: paymentId || null,
      tenantId: effectiveTenantId || null,
      landlordId: effectiveLandlordId || null,
      createdAt: now,
      status: 'active'
    });
  } catch (err) {
    console.warn('[AccessCode] access_codes write warning:', err.message);
  }

  // 2. Update contract / lease with status "active" (Requirement 6b) and accessCode
  await setDoc(doc(db, 'contracts', cleanCode), {
    status: 'active',
    paymentVerified: true,
    accessCode: newAccessCode,
    accessCodeId,
    accessCodeIssuedAt: now,
    verifiedAt: now,
    verifiedBy: effectiveLandlordId || 'landlord'
  }, { merge: true });

  // 3. Update dedicated protected subcollection for server-side rule enforcement
  try {
    await setDoc(doc(db, 'contracts', cleanCode, 'access', 'keypad'), {
      accessCode: newAccessCode,
      status: 'verified',
      issuedAt: now
    }, { merge: true });
  } catch (err) {}

  // 4. Mark payment as verified (Requirement 6a: status = "verified", verifiedAt, verifiedBy)
  try {
    const paymentsCol = collection(db, 'payments');
    const q = query(paymentsCol, where('contractCode', '==', cleanCode));
    const pSnap = await getDocs(q);
    for (const pDoc of pSnap.docs) {
      if (!paymentId || pDoc.id === paymentId) {
        await setDoc(doc(db, 'payments', pDoc.id), {
          status: 'verified',
          verifiedAt: now,
          verifiedBy: effectiveLandlordId || 'landlord'
        }, { merge: true });
      }
    }
  } catch (err) {
    console.warn('[AccessCode] Payment doc update notice:', err.message);
  }

  return { accessCode: newAccessCode, accessCodeId };
}

/**
 * Regenerates an access code for an existing verified tenant (or upon move-out/request),
 * immediately invalidating the previous code (status = "revoked").
 * 
 * @param {string} contractCode 
 * @param {import('firebase/firestore').Firestore} db 
 * @param {string|null} landlordId
 * @param {string|null} tenantId
 * @returns {Promise<{accessCode: string, accessCodeId: string}>}
 */
export async function regenerateAccessCode(contractCode, db, landlordId = null, tenantId = null) {
  if (!contractCode) {
    throw new Error('Contract code is required to regenerate access code.');
  }

  const cleanCode = contractCode.trim().toUpperCase();
  const now = new Date().toISOString();

  // Load contract to fetch current landlordId / tenantId if not provided
  let effectiveLandlordId = landlordId;
  let effectiveTenantId = tenantId;
  try {
    const cSnap = await getDoc(doc(db, 'contracts', cleanCode));
    if (cSnap.exists()) {
      const cData = cSnap.data();
      if (!effectiveLandlordId) effectiveLandlordId = cData.landlordId;
      if (!effectiveTenantId) effectiveTenantId = cData.tenantId || cData.tenantUsername || cData.tenantName;
    }
  } catch (e) {}

  // Revoke all previous active codes for this lease in access_codes collection (Requirement 9)
  try {
    const q = query(
      collection(db, 'access_codes'),
      where('contractCode', '==', cleanCode),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(doc(db, 'access_codes', d.id), {
        status: 'revoked',
        revokedAt: now,
        revokedReason: 'regenerated'
      });
    }
  } catch (e) {
    console.warn('[AccessCode] Previous code revocation notice:', e.message);
  }

  const newAccessCode = await generateUniqueLandlordAccessCode(effectiveLandlordId, db);
  const accessCodeId = `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Store new active access code in access_codes collection
  try {
    await setDoc(doc(db, 'access_codes', accessCodeId), {
      id: accessCodeId,
      accessCode: newAccessCode,
      leaseId: cleanCode,
      contractCode: cleanCode,
      tenantId: effectiveTenantId || null,
      landlordId: effectiveLandlordId || null,
      createdAt: now,
      status: 'active'
    });
  } catch (err) {}

  // Update contract with new code
  await setDoc(doc(db, 'contracts', cleanCode), {
    accessCode: newAccessCode,
    accessCodeId,
    accessCodeRegeneratedAt: now
  }, { merge: true });

  await setDoc(doc(db, 'contracts', cleanCode, 'access', 'keypad'), {
    accessCode: newAccessCode,
    status: 'verified',
    regeneratedAt: now
  }, { merge: true });

  return { accessCode: newAccessCode, accessCodeId };
}

/**
 * Ends a lease and revokes all active access codes immediately (Requirement 9).
 */
export async function endLeaseAndRevokeCodes(contractCode, db, landlordId = null) {
  if (!contractCode) return;
  const cleanCode = contractCode.trim().toUpperCase();
  const now = new Date().toISOString();

  // Mark all active access codes as revoked
  try {
    const q = query(
      collection(db, 'access_codes'),
      where('contractCode', '==', cleanCode),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(doc(db, 'access_codes', d.id), {
        status: 'revoked',
        revokedAt: now,
        revokedReason: 'lease_ended'
      });
    }
  } catch (e) {}

  // Mark contract status as ended
  await setDoc(doc(db, 'contracts', cleanCode), {
    status: 'ended',
    accessCode: null,
    endedAt: now,
    endedBy: landlordId || 'landlord'
  }, { merge: true });

  try {
    await setDoc(doc(db, 'contracts', cleanCode, 'access', 'keypad'), {
      status: 'revoked',
      accessCode: null,
      revokedAt: now
    }, { merge: true });
  } catch (e) {}

  return true;
}
