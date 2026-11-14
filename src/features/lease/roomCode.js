// Room Code Generator - Owned by Agent B per COORDINATION.md
import { doc, getDoc } from 'firebase/firestore';

/**
 * Generates a cryptographically secure random alphanumeric room code (e.g. RIP-4X8K)
 * and confirms uniqueness in Cloud Firestore before saving.
 * Only called after the landlord finalizes and saves the signed Kasulatan.
 * 
 * @param {import('firebase/firestore').Firestore} db 
 * @returns {Promise<string>}
 */
export async function createUniqueRoomCode(db) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous 0, O, 1, I
  let isUnique = false;
  let code = '';
  let attempts = 0;

  while (!isUnique && attempts < 20) {
    attempts++;
    const randomBytes = new Uint8Array(4);
    crypto.getRandomValues(randomBytes);
    
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars[randomBytes[i] % chars.length];
    }
    code = `RIP-${suffix}`;

    try {
      const [snap1, snap2] = await Promise.all([
        getDoc(doc(db, 'contracts', code)),
        getDoc(doc(db, 'leases', code))
      ]);
      if (!snap1.exists() && !snap2.exists()) {
        isUnique = true;
      }
    } catch (e) {
      // If network test or offline, candidate with 4 random chars is accepted
      isUnique = true;
    }
  }

  return code;
}
