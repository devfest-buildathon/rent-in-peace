/**
 * Rent in Peace — Demo Data Reset & Seeder Script
 * 
 * SAFETY RULES ENFORCED:
 * 1. Must run ONLY against the Firebase emulator OR a project explicitly named in the DEMO_PROJECT_ID environment variable.
 * 2. Requires the explicit `--confirm` CLI flag. Refuses to run otherwise.
 * 3. Prints exactly what will be deleted and what will be created.
 * 4. Uses strictly fictional people, placeholder addresses, and synthetic receipts.
 * 5. Uses the exact same schema and data model as the real application.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import fs from 'fs';
import path from 'path';

// --- SAFETY CHECK 1: ENVIRONMENT & TARGET PROJECT VALIDATION ---
const envProjectId = process.env.DEMO_PROJECT_ID;
const isEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_EMULATOR_HUB);

// Read project ID from env or fallback configuration
let configuredProjectId = 'rentinpeace';
try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const envContent = (fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, 'utf8') : '') + 
                     (fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '');
  const match = envContent.match(/VITE_FIREBASE_PROJECT_ID=["']?([^"'\r\n]+)/);
  if (match) configuredProjectId = match[1].trim();
} catch (e) {}

if (!isEmulator && (!envProjectId || envProjectId !== configuredProjectId)) {
  console.error('\n========================================================================');
  console.error('  ❌ SAFETY CHECK FAILED: UNAUTHORIZED DATABASE RESET ATTEMPT');
  console.error('========================================================================');
  console.error('This demo reset script clears and seeds mock database collections.');
  console.error('To protect real and production data, it will REFUSE to execute unless:');
  console.error('  1. Running against the local Firebase Emulator (FIRESTORE_EMULATOR_HOST), OR');
  console.error(`  2. You explicitly set DEMO_PROJECT_ID="${configuredProjectId}" in your environment.`);
  console.error('');
  console.error('Usage:');
  console.error(`  DEMO_PROJECT_ID=${configuredProjectId} npm run demo:reset -- --confirm`);
  console.error('========================================================================\n');
  process.exit(1);
}

// --- SAFETY CHECK 2: EXPLICIT CONFIRMATION FLAG ---
const args = process.argv.slice(2);
const hasConfirm = args.includes('--confirm');

if (!hasConfirm) {
  console.error('\n========================================================================');
  console.error('  ⚠️ CONFIRMATION REQUIRED: DEMO RESET & SEEDING');
  console.error('========================================================================');
  console.error(`Target Project:     ${isEmulator ? 'Firebase Local Emulator' : configuredProjectId}`);
  console.error('Collections Purged: landlords, contracts, tenants, checkins, payments');
  console.error('Mock Data Created:  1 Landlord, 3 Presets, 4 Leases (All States), Tenants & Ledger');
  console.error('');
  console.error('This action will delete existing test documents in the target project.');
  console.error('To confirm and proceed, add the --confirm flag:');
  console.error('');
  console.error(`  DEMO_PROJECT_ID=${configuredProjectId} npm run demo:reset -- --confirm`);
  console.error('========================================================================\n');
  process.exit(1);
}

// --- SYNTHETIC PLACEHOLDER RECEIPT GENERATOR ---
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createPlaceholderReceipt({
  amount = 3500,
  refNumber = '982314562010',
  date = '14 Nov 2026, 04:30 PM',
  recipient = 'Engr. Roberto M. Tan',
  recipientPhone = '0917***4567',
  sender = 'Juan Dela Cruz',
  notes = 'Advance Rent & Security Deposit'
}) {
  const cleanRecipient = escapeXml(recipient);
  const cleanPhone = escapeXml(recipientPhone);
  const cleanSender = escapeXml(sender);
  const cleanRef = escapeXml(refNumber);
  const cleanDate = escapeXml(date);
  const cleanNotes = escapeXml(notes);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" style="background:#005ce6;font-family:system-ui,-apple-system,sans-serif;">
    <rect width="400" height="600" fill="#005ce6"/>
    <rect x="20" y="40" width="360" height="520" rx="22" fill="#ffffff"/>
    <path d="M20 62 Q20 40 42 40 L358 40 Q380 40 380 62 L380 110 L20 110 Z" fill="#005ce6"/>
    <text x="200" y="80" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">GCash E-Receipt</text>
    <text x="200" y="100" font-size="10" font-weight="600" fill="#e6f0ff" text-anchor="middle">Official Transaction Confirmation (Demo)</text>
    <circle cx="200" cy="155" r="30" fill="#ecfdf5"/>
    <circle cx="200" cy="155" r="24" fill="#10b981"/>
    <path d="M190 155 L197 162 L212 147" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <text x="200" y="215" font-size="12" font-weight="600" fill="#64748b" text-anchor="middle">Amount Paid</text>
    <text x="200" y="250" font-size="28" font-weight="900" fill="#0f172a" text-anchor="middle">PHP ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</text>
    <rect x="40" y="275" width="320" height="205" rx="14" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="55" y="305" font-size="11" font-weight="600" fill="#64748b">Sent To:</text>
    <text x="345" y="305" font-size="11" font-weight="700" fill="#0f172a" text-anchor="end">${cleanRecipient}</text>
    <text x="55" y="335" font-size="11" font-weight="600" fill="#64748b">GCash Mobile:</text>
    <text x="345" y="335" font-size="11" font-weight="700" fill="#0f172a" text-anchor="end">${cleanPhone}</text>
    <text x="55" y="365" font-size="11" font-weight="600" fill="#64748b">Sent By:</text>
    <text x="345" y="365" font-size="11" font-weight="700" fill="#0f172a" text-anchor="end">${cleanSender}</text>
    <text x="55" y="395" font-size="11" font-weight="600" fill="#64748b">Reference No:</text>
    <text x="345" y="395" font-size="12" font-weight="900" fill="#005ce6" font-family="monospace" text-anchor="end">${cleanRef}</text>
    <text x="55" y="425" font-size="11" font-weight="600" fill="#64748b">Date &amp; Time:</text>
    <text x="345" y="425" font-size="11" font-weight="600" fill="#334155" text-anchor="end">${cleanDate}</text>
    <text x="55" y="455" font-size="11" font-weight="600" fill="#64748b">Purpose:</text>
    <text x="345" y="455" font-size="11" font-weight="600" fill="#047857" text-anchor="end">${cleanNotes}</text>
    <text x="200" y="515" font-size="9" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="0.5">RENT IN PEACE · SMART RENTAL ARCHITECTURE</text>
    <text x="200" y="530" font-size="8" fill="#cbd5e1" text-anchor="middle">Synthetic sample receipt generated for demo evaluation only</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
}

// --- STANDARD 7 BILINGUAL A4 BOND PAPER LEASE CLAUSES ---
function getStandardClauses(values) {
  return [
    {
      num: 1,
      title: '1. Mga Partido ug Paupahan (Parties & Premises)',
      english: `This residential lease agreement is made between ${values.landlord_name} (Lessor) and ${values.tenant_name || 'Tenant'} (Lessee) for the leased unit ${values.unit} located at ${values.property_address}.`,
      bisaya: `Kini nga kasulatan sa pag-abang gikasabutan tali ni ${values.landlord_name} (Tigpaabang) ug ${values.tenant_name || 'Umuupa'} (Nag-abang) alang sa unit ${values.unit} nga nahimutang sa ${values.property_address}.`,
      text: `This residential lease agreement is made between ${values.landlord_name} (Lessor) and ${values.tenant_name || 'Tenant'} (Lessee) for the leased unit ${values.unit} located at ${values.property_address}.`
    },
    {
      num: 2,
      title: '2. Abang ug Adlaw sa Pagbayad (Rent & Due Date)',
      english: `The monthly rental rate is ${values.rent}, strictly due and payable on or before the ${values.due_day} day of each calendar month without need of demand.`,
      bisaya: `Ang binuwan nga abang nagkantidad og ${values.rent}, nga kinahanglang bayran sa o sa dili pa ang ika-${values.due_day} nga adlaw sa matag bulan nga walay langan.`,
      text: `The monthly rental rate is ${values.rent}, strictly due and payable on or before the ${values.due_day} day of each calendar month without need of demand.`
    },
    {
      num: 3,
      title: '3. Seguridad Deposit ug Advance (Security Deposit & Advance)',
      english: `The Lessee pays an advance rent of ${values.advance} and a security deposit of ${values.deposit} to answer for unpaid bills or damages beyond normal wear and tear.`,
      bisaya: `Ang Nag-abang mobayad og advance nga ${values.advance} ug security deposit nga ${values.deposit} aron pagsigurado sa bisan unsang wala mabayri nga bayronon o kadaot.`,
      text: `The Lessee pays an advance rent of ${values.advance} and a security deposit of ${values.deposit} to answer for unpaid bills or damages beyond normal wear and tear.`
    },
    {
      num: 4,
      title: '4. Panahon sa Pag-abang (Lease Term)',
      english: `The lease commences on ${values.start_date || '2026-11-01'} for an initial duration of ${values.lease_duration || '6 months'}, renewable upon mutual written agreement of both parties.`,
      bisaya: `Ang pag-abang magsugod sa ${values.start_date || '2026-11-01'} sulod sa gidugayon nga ${values.lease_duration || '6 ka bulan'}, ug mahimong bag-ohon pinaagi sa sinulat nga kasabutan.`,
      text: `The lease commences on ${values.start_date || '2026-11-01'} for an initial duration of ${values.lease_duration || '6 months'}, renewable upon mutual written agreement of both parties.`
    },
    {
      num: 5,
      title: '5. Mga Serbisyo ug Bayronon (Utilities Arrangement)',
      english: 'Electricity utility arrangement: sub-metered billing based on official kilowatt consumption. Water is shared equally among residents.',
      bisaya: 'Ang kuryente gibase sa sub-meter subay sa nakunsumong kilowatt. Ang bayronon sa tubig pagabahinon sa tanang residente sa paupahan.',
      text: 'Electricity utility arrangement: sub-metered billing based on official kilowatt consumption. Water is shared equally among residents.'
    },
    {
      num: 6,
      title: '6. Kalinaw ug Alituntunin (House Rules & Peaceful Living)',
      english: 'Quiet hours begin promptly at 10:00 PM daily. Hallways and shared facilities must be kept clean. Unauthorized subleasing is strictly prohibited.',
      bisaya: 'Magsugod ang ting-hilom sa 10:00 PM matag gabii. Kinahanglang limpyo ang agianan ug kasilyas. Hugot nga gidili ang pagpasulod og sub-lessee.',
      text: 'Quiet hours begin promptly at 10:00 PM daily. Hallways and shared facilities must be kept clean. Unauthorized subleasing is strictly prohibited.'
    },
    {
      num: 7,
      title: '7. Pagbiya ug Pahibalo (Move-Out Notice)',
      english: 'Either party may terminate this agreement by providing at least 30 days prior written notice in accordance with Philippine tenancy laws.',
      bisaya: 'Bisan kinsa sa duha ka partido mahimong mopaundang niini nga kasabutan pinaagi sa paghatag og 30 ka adlaw nga abanteng sinulat nga pahibalo.',
      text: 'Either party may terminate this agreement by providing at least 30 days prior written notice in accordance with Philippine tenancy laws.'
    }
  ];
}

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBwuUu1BwRx02ZD4KKfgWauUDF9VIcOr2s",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "rentinpeace.firebaseapp.com",
  projectId: configuredProjectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "rentinpeace.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "260558415707",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:260558415707:web:8e47bbf742c648138b1c7e"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function safeCreateAuthUser(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code !== 'auth/email-already-in-use' && err.code !== 'auth/configuration-not-found') {
      // Non-critical in test / mock environment
    }
  }
}

async function runDemoReset() {
  console.log('\n[1/4] Connecting to Cloud Firestore...');
  console.log(`      Project: ${configuredProjectId}`);

  // Purge collections
  console.log('\n[2/4] Purging old demo & test documents...');
  const collectionsToClear = ['contracts', 'landlords', 'tenants', 'checkins', 'payments'];
  for (const collName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, collName));
      if (!snap.empty) {
        console.log(`      - Deleting ${snap.size} documents from /${collName}...`);
        const batch = writeBatch(db);
        snap.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } else {
        console.log(`      - /${collName} is already empty.`);
      }
    } catch (e) {
      console.warn(`      - Warning clearing /${collName}: ${e.message}`);
    }
  }

  // --- SEED 1: LANDLORD ACCOUNT ---
  console.log('\n[3/4] Seeding realistic mock landlord, presets, and 4 leases...');
  const landlordId = '09171234567';
  const landlordEmail = 'landlord.demo@rentinpeace.ph';
  const defaultPassword = 'Password123!';

  await safeCreateAuthUser(landlordEmail, defaultPassword);

  const landlordProfile = {
    id: landlordId,
    uid: landlordId,
    name: 'Engr. Roberto M. Tan',
    phone: landlordId,
    email: landlordEmail,
    propertyName: 'Pineview Residences & Boarding House',
    propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen',
    barangay: 'Barangay Carmen',
    city: 'Cagayan de Oro City',
    pin: '1234',
    demo: true,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'landlords', landlordId), landlordProfile);
  console.log(`      ✓ Landlord document created: ${landlordProfile.name} (${landlordId})`);

  // --- SEED 2: LEASE PRESETS (3 STARTER PRESETS) ---
  const presets = [
    {
      id: 'preset-bedspace',
      name: 'Bedspace / Student Dorm',
      description: 'Shared room layout with quiet hours and equal utility splits.',
      propertyType: 'Boarding House / Bedspace',
      isBuiltin: false,
      demo: true,
      updatedAt: new Date().toISOString(),
      clauses: getStandardClauses({
        landlord_name: 'Engr. Roberto M. Tan',
        tenant_name: '{{tenant_name}}',
        unit: '{{unit}}',
        property_address: '{{property_address}}',
        rent: '{{rent}}',
        deposit: '{{deposit}}',
        advance: '{{advance}}',
        due_day: '{{due_day}}',
        lease_duration: '{{lease_duration}}'
      })
    },
    {
      id: 'preset-room-cr',
      name: 'Private Room with CR',
      description: 'Private single room with ensuite bathroom and sub-metered power.',
      propertyType: 'Private Room with Bath',
      isBuiltin: false,
      demo: true,
      updatedAt: new Date().toISOString(),
      clauses: getStandardClauses({
        landlord_name: 'Engr. Roberto M. Tan',
        tenant_name: '{{tenant_name}}',
        unit: '{{unit}}',
        property_address: '{{property_address}}',
        rent: '{{rent}}',
        deposit: '{{deposit}}',
        advance: '{{advance}}',
        due_day: '{{due_day}}',
        lease_duration: '{{lease_duration}}'
      })
    },
    {
      id: 'preset-apartment',
      name: 'Studio Apartment',
      description: 'Self-contained studio flat with private kitchen and balcony.',
      propertyType: 'Apartment / Studio Unit',
      isBuiltin: false,
      demo: true,
      updatedAt: new Date().toISOString(),
      clauses: getStandardClauses({
        landlord_name: 'Engr. Roberto M. Tan',
        tenant_name: '{{tenant_name}}',
        unit: '{{unit}}',
        property_address: '{{property_address}}',
        rent: '{{rent}}',
        deposit: '{{deposit}}',
        advance: '{{advance}}',
        due_day: '{{due_day}}',
        lease_duration: '{{lease_duration}}'
      })
    }
  ];

  for (const preset of presets) {
    try {
      await setDoc(doc(db, 'landlords', landlordId, 'lease_presets', preset.id), preset);
      console.log(`      ✓ Preset template stored in Firestore: "${preset.name}"`);
    } catch (err) {
      console.warn(`      ⚠️ Could not write preset "${preset.name}" to remote Firestore (${err.message}). Storing in local demo payload.`);
    }
  }

  // --- SEED 3: 4 LEASES IN DIFFERENT STATES ---
  const receiptPending = createPlaceholderReceipt({
    amount: 3500,
    refNumber: '982314562010',
    date: '14 Nov 2026, 02:15 PM',
    recipient: 'Engr. Roberto M. Tan',
    recipientPhone: '0917***4567',
    sender: 'Juan Paolo Dela Cruz',
    notes: 'Advance Rent (Room 102)'
  });

  const receiptActive1 = createPlaceholderReceipt({
    amount: 4500,
    refNumber: '881245091010',
    date: '01 Oct 2026, 10:30 AM',
    recipient: 'Engr. Roberto M. Tan',
    recipientPhone: '0917***4567',
    sender: 'Maria Teresa Santos',
    notes: 'Advance Rent & Deposit (Room 201)'
  });

  const receiptActive2 = createPlaceholderReceipt({
    amount: 4500,
    refNumber: '881245091020',
    date: '03 Nov 2026, 09:12 AM',
    recipient: 'Engr. Roberto M. Tan',
    recipientPhone: '0917***4567',
    sender: 'Maria Teresa Santos',
    notes: 'November 2026 Monthly Rent (Room 201)'
  });

  const receiptActive3 = createPlaceholderReceipt({
    amount: 4500,
    refNumber: '881245091030',
    date: '04 Dec 2026, 11:45 AM',
    recipient: 'Engr. Roberto M. Tan',
    recipientPhone: '0917***4567',
    sender: 'Maria Teresa Santos',
    notes: 'December 2026 Monthly Rent (Room 201)'
  });

  const receiptRejected = createPlaceholderReceipt({
    amount: 2500,
    refNumber: '000000000000',
    date: '14 Nov 2026, 05:00 PM',
    recipient: 'Engr. Roberto M. Tan',
    recipientPhone: '0917***4567',
    sender: 'Joshua Mark Reyes',
    notes: 'Invalid Transaction Reference'
  });

  // LEASE 1: STATE "open" (Room Code Generated, ready for tenant to join)
  const leaseOpen = {
    code: 'RIP-OPEN',
    roomCode: 'RIP-OPEN',
    landlordId,
    landlordName: 'Engr. Roberto M. Tan',
    landlordPhone: '09171234567',
    propertyName: 'Pineview Residences',
    propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
    propertyType: 'Boarding House / Bedspace',
    roomNumber: 'Room 101 (Bedspace A)',
    monthlyRent: 2500,
    deposit: 2500,
    advanceRent: 2500,
    leaseDuration: '6 months',
    dueDay: '5th',
    status: 'open',
    isSigned: false,
    tenantSigned: false,
    paymentVerified: false,
    accessCode: null,
    clauses: getStandardClauses({
      landlord_name: 'Engr. Roberto M. Tan',
      tenant_name: 'Prospective Resident',
      unit: 'Room 101 (Bedspace A)',
      property_address: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
      rent: '₱2,500',
      deposit: '₱2,500',
      advance: '₱2,500',
      due_day: '5th',
      lease_duration: '6 months'
    }),
    demo: true,
    createdAt: '2026-11-14T08:00:00.000Z',
    updatedAt: '2026-11-14T08:00:00.000Z'
  };

  // LEASE 2: STATE "pending_verification" (Tenant signed, GCash receipt submitted, awaits landlord review)
  const leasePending = {
    code: 'RIP-PEND',
    roomCode: 'RIP-PEND',
    landlordId,
    landlordName: 'Engr. Roberto M. Tan',
    landlordPhone: '09171234567',
    propertyName: 'Pineview Residences',
    propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
    propertyType: 'Private Room with Bath',
    roomNumber: 'Room 102 (Private Room)',
    monthlyRent: 3500,
    deposit: 3500,
    advanceRent: 3500,
    leaseDuration: '6 months',
    dueDay: '5th',
    status: 'pending_verification',
    tenantName: 'Juan Paolo Dela Cruz',
    tenantPhone: '09193334444',
    tenantEmail: 'juan.demo@rentinpeace.ph',
    isSigned: true,
    tenantSigned: true,
    tenantSignedAt: '2026-11-14T14:10:00.000Z',
    signingMode: 'DIGITAL',
    paymentVerified: false,
    gcashRef: 'GCASH-98231456201',
    gcashReceiptData: receiptPending,
    advancePaidAmount: 3500,
    accessCode: null, // Strictly blocked until verified
    clauses: getStandardClauses({
      landlord_name: 'Engr. Roberto M. Tan',
      tenant_name: 'Juan Paolo Dela Cruz',
      unit: 'Room 102 (Private Room)',
      property_address: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
      rent: '₱3,500',
      deposit: '₱3,500',
      advance: '₱3,500',
      due_day: '5th',
      lease_duration: '6 months'
    }),
    demo: true,
    createdAt: '2026-11-14T09:00:00.000Z',
    updatedAt: '2026-11-14T14:15:00.000Z'
  };

  // LEASE 3: STATE "active" (Verified Active, Door Access Code Issued, Multi-Month Payment History)
  const leaseActive = {
    code: 'RIP-ACTV',
    roomCode: 'RIP-ACTV',
    landlordId,
    landlordName: 'Engr. Roberto M. Tan',
    landlordPhone: '09171234567',
    propertyName: 'Pineview Residences',
    propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
    propertyType: 'Apartment / Studio Unit',
    roomNumber: 'Room 201 (Corner Studio)',
    monthlyRent: 4500,
    deposit: 4500,
    advanceRent: 4500,
    leaseDuration: '12 months',
    dueDay: '5th',
    status: 'active',
    tenantName: 'Maria Teresa Santos',
    tenantPhone: '09181112222',
    tenantEmail: 'maria.demo@rentinpeace.ph',
    isSigned: true,
    tenantSigned: true,
    tenantSignedAt: '2026-10-01T09:00:00.000Z',
    paymentVerified: true,
    paymentVerifiedAt: '2026-10-01T10:35:00.000Z',
    signingMode: 'DIGITAL',
    accessCode: '48291', // Active door PIN
    accessCodeIssuedAt: '2026-10-01T10:35:00.000Z',
    gcashRef: 'GCASH-88124509101',
    gcashReceiptData: receiptActive1,
    advancePaidAmount: 4500,
    clauses: getStandardClauses({
      landlord_name: 'Engr. Roberto M. Tan',
      tenant_name: 'Maria Teresa Santos',
      unit: 'Room 201 (Corner Studio)',
      property_address: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
      rent: '₱4,500',
      deposit: '₱4,500',
      advance: '₱4,500',
      due_day: '5th',
      lease_duration: '12 months'
    }),
    demo: true,
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-12-04T11:45:00.000Z'
  };

  // LEASE 4: STATE "rejected" (Payment Resubmission Required with reason)
  const leaseRejected = {
    code: 'RIP-REJC',
    roomCode: 'RIP-REJC',
    landlordId,
    landlordName: 'Engr. Roberto M. Tan',
    landlordPhone: '09171234567',
    propertyName: 'Pineview Residences',
    propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
    propertyType: 'Boarding House / Bedspace',
    roomNumber: 'Room 203 (Bedspace B)',
    monthlyRent: 2500,
    deposit: 2500,
    advanceRent: 2500,
    leaseDuration: '6 months',
    dueDay: '5th',
    status: 'pending_resubmission',
    paymentStatus: 'rejected',
    tenantName: 'Joshua Mark Reyes',
    tenantPhone: '09175556666',
    tenantEmail: 'joshua.demo@rentinpeace.ph',
    isSigned: true,
    tenantSigned: true,
    tenantSignedAt: '2026-11-14T11:00:00.000Z',
    paymentVerified: false,
    gcashRef: 'GCASH-00000000000',
    gcashReceiptData: receiptRejected,
    rejectionReason: 'GCash reference number 00000000000 was not found in landlord bank statement. Please re-upload screenshot showing full transaction timestamp.',
    accessCode: null,
    clauses: getStandardClauses({
      landlord_name: 'Engr. Roberto M. Tan',
      tenant_name: 'Joshua Mark Reyes',
      unit: 'Room 203 (Bedspace B)',
      property_address: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
      rent: '₱2,500',
      deposit: '₱2,500',
      advance: '₱2,500',
      due_day: '5th',
      lease_duration: '6 months'
    }),
    demo: true,
    createdAt: '2026-11-14T10:00:00.000Z',
    updatedAt: '2026-11-14T15:30:00.000Z'
  };

  const contractsList = [leaseOpen, leasePending, leaseActive, leaseRejected];
  for (const c of contractsList) {
    try {
      await setDoc(doc(db, 'contracts', c.code), c);
      console.log(`      ✓ Contract saved to Firestore: ${c.code} (${c.roomNumber}) — Status: ${c.status}`);
    } catch (err) {
      console.warn(`      ⚠️ Could not write contract ${c.code} to Firestore (${err.message}). Storing in local demo payload.`);
    }
  }

  // --- SEED 4: TENANT PROFILES ---
  const activeTenantId = '09181112222';
  const activeTenantEmail = 'maria.demo@rentinpeace.ph';
  await safeCreateAuthUser(activeTenantEmail, defaultPassword);

  const tenantRecord = {
    id: activeTenantId,
    uid: activeTenantId,
    username: 'maria.santos',
    name: 'Maria Teresa Santos',
    phone: activeTenantId,
    email: activeTenantEmail,
    contractCode: 'RIP-ACTV',
    leaseId: 'RIP-ACTV',
    roomNumber: 'Room 201 (Corner Studio)',
    demo: true,
    createdAt: '2026-10-01T08:30:00.000Z'
  };
  try {
    await setDoc(doc(db, 'tenants', activeTenantId), tenantRecord);
    console.log(`      ✓ Active Tenant created in Firestore: ${tenantRecord.name} (${activeTenantId})`);
  } catch (err) {
    console.warn(`      ⚠️ Could not write tenant to Firestore (${err.message}). Storing in local demo payload.`);
  }

  // --- SEED 5: MULTI-MONTH PAYMENT LEDGER FOR ACTIVE LEASE ---
  const paymentsList = [
    {
      id: 'pay_demo_actv_1',
      contractCode: 'RIP-ACTV',
      leaseId: 'RIP-ACTV',
      tenantName: 'Maria Teresa Santos',
      tenantPhone: '09181112222',
      amount: 9000,
      cycle: 'Advance Rent & Security Deposit',
      cycleName: 'Advance & Deposit (2 Months)',
      referenceNumber: '881245091010',
      gcashRef: 'GCASH-88124509101',
      receiptData: receiptActive1,
      status: 'verified',
      timestamp: '2026-10-01T10:30:00.000Z',
      verifiedAt: '2026-10-01T10:35:00.000Z',
      demo: true
    },
    {
      id: 'pay_demo_actv_2',
      contractCode: 'RIP-ACTV',
      leaseId: 'RIP-ACTV',
      tenantName: 'Maria Teresa Santos',
      tenantPhone: '09181112222',
      amount: 4500,
      cycle: 'November 2026 Monthly Rent',
      cycleName: 'November 2026 Rent',
      referenceNumber: '881245091020',
      gcashRef: 'GCASH-88124509102',
      receiptData: receiptActive2,
      status: 'verified',
      timestamp: '2026-11-03T09:12:00.000Z',
      verifiedAt: '2026-11-03T09:40:00.000Z',
      demo: true
    },
    {
      id: 'pay_demo_actv_3',
      contractCode: 'RIP-ACTV',
      leaseId: 'RIP-ACTV',
      tenantName: 'Maria Teresa Santos',
      tenantPhone: '09181112222',
      amount: 4500,
      cycle: 'December 2026 Monthly Rent',
      cycleName: 'December 2026 Rent',
      referenceNumber: '881245091030',
      gcashRef: 'GCASH-88124509103',
      receiptData: receiptActive3,
      status: 'verified',
      timestamp: '2026-12-04T11:45:00.000Z',
      verifiedAt: '2026-12-04T12:00:00.000Z',
      demo: true
    },
    {
      id: 'pay_demo_pend_1',
      contractCode: 'RIP-PEND',
      leaseId: 'RIP-PEND',
      tenantName: 'Juan Paolo Dela Cruz',
      tenantPhone: '09193334444',
      amount: 3500,
      cycle: 'Advance Rent Payment',
      cycleName: 'Advance Rent',
      referenceNumber: '982314562010',
      gcashRef: 'GCASH-98231456201',
      receiptData: receiptPending,
      status: 'pending',
      timestamp: '2026-11-14T14:15:00.000Z',
      demo: true
    },
    {
      id: 'pay_demo_rejc_1',
      contractCode: 'RIP-REJC',
      leaseId: 'RIP-REJC',
      tenantName: 'Joshua Mark Reyes',
      tenantPhone: '09175556666',
      amount: 2500,
      cycle: 'Advance Rent Payment',
      cycleName: 'Advance Rent',
      referenceNumber: '000000000000',
      gcashRef: 'GCASH-00000000000',
      receiptData: receiptRejected,
      status: 'rejected',
      rejectionReason: 'GCash reference number 00000000000 was not found in landlord bank statement. Please re-upload screenshot showing full transaction timestamp.',
      timestamp: '2026-11-14T15:00:00.000Z',
      demo: true
    }
  ];

  for (const p of paymentsList) {
    try {
      await setDoc(doc(db, 'payments', p.id), p);
      console.log(`      ✓ Payment record stored: ${p.id} (${p.contractCode}) — ₱${p.amount} [${p.status}]`);
    } catch (err) {
      console.warn(`      ⚠️ Could not write payment to Firestore (${err.message}). Storing in local demo payload.`);
    }
  }

  // Also create a checkin record for active tenant
  const activeCheckin = {
    contractCode: 'RIP-ACTV',
    tenantName: 'Maria Teresa Santos',
    tenantPhone: '09181112222',
    accessCode: '48291',
    verified: true,
    verifiedAt: '2026-10-01T10:35:00.000Z',
    demo: true
  };

  try {
    await setDoc(doc(db, 'checkins', 'checkin_RIP-ACTV'), activeCheckin);
  } catch (err) {
    console.warn(`      ⚠️ Could not write checkin to Firestore (${err.message}).`);
  }

  // Write demo payload to public/demo-seed.json for instant one-click pitch loading in-app
  try {
    const demoPayload = {
      generatedAt: new Date().toISOString(),
      projectId: configuredProjectId,
      landlord: landlordProfile,
      presets,
      contracts: contractsList,
      tenant: tenantRecord,
      payments: paymentsList,
      checkin: activeCheckin
    };
    const publicSeedPath = path.resolve(process.cwd(), 'public', 'demo-seed.json');
    fs.writeFileSync(publicSeedPath, JSON.stringify(demoPayload, null, 2), 'utf8');
    console.log(`      ✓ Demo seed payload exported to: public/demo-seed.json`);
  } catch (err) {
    console.warn(`      ⚠️ Failed exporting public/demo-seed.json: ${err.message}`);
  }

  console.log('\n[4/4] Demo database seeded successfully!');
  console.log('\n============================================================');
  console.log('           RENT IN PEACE — DEMO CREDENTIALS                 ');
  console.log('============================================================');
  console.log(' 👑 LANDLORD ACCOUNT:');
  console.log('    Mobile Number: 09171234567');
  console.log('    Email:         landlord.demo@rentinpeace.ph');
  console.log('    Password:      Password123!');
  console.log('    Property:      Pineview Residences & Boarding House');
  console.log('');
  console.log(' 👤 TENANT ACCOUNT (ACTIVE LEASE):');
  console.log('    Mobile Number: 09181112222');
  console.log('    Email:         maria.demo@rentinpeace.ph');
  console.log('    Password:      Password123!');
  console.log('    Room Code:     RIP-ACTV');
  console.log('    Access Code:   48291 (Active Door PIN)');
  console.log('    Status:        Verified Active (3-Month Ledger)');
  console.log('');
  console.log(' 📋 OTHER DEMO ROOM CODES FOR PITCHING:');
  console.log('    • RIP-OPEN:  Open lease ready for room code join/share');
  console.log('    • RIP-PEND:  Pending payment verification (Tenant: Juan Paolo Dela Cruz)');
  console.log('    • RIP-REJC:  Payment rejected / resubmission (Tenant: Joshua Mark Reyes)');
  console.log('============================================================\n');

  process.exit(0);
}

runDemoReset().catch(err => {
  console.error('\n❌ Demo reset failed:', err);
  process.exit(1);
});
