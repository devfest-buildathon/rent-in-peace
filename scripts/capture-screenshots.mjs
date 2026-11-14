import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\EdgeCore\\157.0.4341.46\\msedge.exe';
const APP_URL = 'http://localhost:5173';

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.resolve(ROOT_DIR, 'docs');
const SCREENSHOTS_DIR = path.resolve(DOCS_DIR, 'screenshots');
const PITCH_DIR = path.resolve(DOCS_DIR, 'pitch');

// Ensure output directories exist
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(PITCH_DIR, { recursive: true });

// Also mirror to devfest/docs if running from rent-in-peace
const PARENT_DOCS_DIR = path.resolve(ROOT_DIR, '..', 'docs');
try {
  fs.mkdirSync(path.resolve(PARENT_DOCS_DIR, 'screenshots'), { recursive: true });
  fs.mkdirSync(path.resolve(PARENT_DOCS_DIR, 'pitch'), { recursive: true });
} catch (e) {}

const SCREENS_CONFIG = [
  {
    id: '01-welcome-splash',
    stepPill: 'Screen 01 of 18 · Onboarding',
    title: 'Welcome & Legal Foundation',
    subtitle: 'Grounding informal Philippine boarding houses in Civil Code Art. 1356',
    lead: 'A clean, accessible entry point where landlords manage properties and tenants join seamlessly via an 8-character Room Code.',
    bullets: [
      { icon: '⚖️', label: 'Civil Code Art. 1356 Basis', desc: 'Contracts are binding in whatever form, but a written Kasulatan eliminates verbal dispute risks.' },
      { icon: '🚪', label: 'Separate Role Portals', desc: 'Dedicated operational flows for property owners and boarding house residents.' },
      { icon: '📱', label: '100% Mobile-First PWA', desc: 'No app store installation required; runs directly in any mobile browser offline.' }
    ],
    next: 'Landlord taps "I am a Landlord" to authenticate or register.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.resetAppData();
        window.__appContext.setCurrentScreen('SPLASH');
      });
      await new Promise(r => setTimeout(r, 600));
    }
  },
  {
    id: '02-landlord-auth',
    stepPill: 'Screen 02 of 18 · Authentication',
    title: 'Landlord Authentication & Security',
    subtitle: 'Live password entropy scoring with zxcvbn standard',
    lead: 'Robust credential security designed for property owners handling tenant data and financial access credentials.',
    bullets: [
      { icon: '🛡️', label: 'Real-Time Entropy Meter', desc: 'Evaluates password complexity live, guiding landlords toward brute-force resistant passphrases.' },
      { icon: '🔑', label: 'Self-Serve Password Reset', desc: 'Secure email password reset loop prevents lockout from operational accounts.' },
      { icon: '🔒', label: 'Direct Firestore Session', desc: 'Fast, resilient session management with automated network failover.' }
    ],
    next: 'Upon sign-in, the landlord is securely redirected to their operational dashboard.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.setCurrentScreen('LANDLORD_AUTH');
      });
      await new Promise(r => setTimeout(r, 600));
    }
  },
  {
    id: '03-landlord-dashboard',
    stepPill: 'Screen 03 of 18 · Operational Hub',
    title: 'Command Center & Real-Time Rent Roll',
    subtitle: 'Live rental income tracking with high-priority action alerts',
    lead: 'Landlords immediately see total monthly cash flow (₱13,000/mo), active units, and payments awaiting verification.',
    bullets: [
      { icon: '💵', label: 'Live Rent Roll Metrics', desc: 'Instantly view total monthly income across all occupied beds and units.' },
      { icon: '⚠️', label: 'Action Required Queue', desc: 'Amber alert banner highlights unverified GCash receipts with 1-click review.' },
      { icon: '📋', label: 'Room Code Sharing', desc: 'Every lease displays its 8-character room code with a 1-tap copy/share link.' }
    ],
    next: 'Landlord reviews pending payments or taps "+ Create Lease" to add a new room.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('LANDLORD');
        window.__appContext.setSearchQuery('');
        window.__appContext.setCurrentScreen('LANDLORD_HOME');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '04-lease-property-type',
    stepPill: 'Screen 04 of 18 · Lease Wizard Step 1',
    title: 'Property Type Classification',
    subtitle: 'Tailored covenants based on Philippine boarding house setups',
    lead: 'Step 1 of the 3-step lease creation wizard: landlords select the physical arrangement of the demised premises.',
    bullets: [
      { icon: '🛏️', label: 'Bedspace / Dormitory', desc: 'Optimized for shared room settings with community quiet hours and equal utility splits.' },
      { icon: '🚿', label: 'Private Room with Bath', desc: 'Includes dedicated covenants for private restroom sanitation and personal power sub-meters.' },
      { icon: '🏠', label: 'Studio Apartment', desc: 'Comprehensive residential agreement with dedicated utility sub-metering and kitchen rules.' }
    ],
    next: 'Proceeds to configure unit-specific rent and payment terms.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.setCurrentScreen('WIZARD_PROPERTY');
      });
      await new Promise(r => setTimeout(r, 600));
    }
  },
  {
    id: '05-lease-basics-form',
    stepPill: 'Screen 05 of 18 · Lease Wizard Step 2',
    title: 'Lease Terms & Financial Parameters',
    subtitle: 'Automated advance calculation & statutory rent caps',
    lead: 'Landlords input unit identifier, property address, monthly rent, and deposit with automated total move-in balance tally.',
    bullets: [
      { icon: '📍', label: 'Dynamic Address Binding', desc: 'No hardcoded cities or fake names; uses real property coordinates and unit names.' },
      { icon: '💰', label: 'Automated Move-In Tally', desc: 'Calculates 1 month advance + 1 month deposit automatically with zero math errors.' },
      { icon: '📅', label: 'Rent Due Schedule', desc: 'Sets explicit calendar payment day (e.g. Every 5th of the month).' }
    ],
    next: 'Landlord reviews lease summary and Rent Control Act compliance.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.setCurrentScreen('WIZARD_DETAILS');
      });
      await new Promise(r => setTimeout(r, 600));
    }
  },
  {
    id: '06-lease-review-summary',
    stepPill: 'Screen 06 of 18 · Lease Wizard Step 3',
    title: 'Pre-Flight Review & Legal Safeguards',
    subtitle: 'Transparent agreement breakdown before publication',
    lead: 'Full financial breakdown summarizing total move-in balance, payment schedules, and Philippine statutory safeguards.',
    bullets: [
      { icon: '⚖️', label: 'Rent Control Act Safeguard', desc: 'Highlights Philippine Rent Control Act caps (maximum 1 month advance, 2 months deposit).' },
      { icon: '📊', label: 'Financial Transparency', desc: 'Clearly separates advance rent from refundable security deposit.' },
      { icon: '📜', label: 'Instant Agreement Generation', desc: 'One click compiles the formal bilingual Kasulatan agreement.' }
    ],
    next: 'Generates the formal bilingual Kasulatan agreement.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.setCurrentScreen('WIZARD_REVIEW');
      });
      await new Promise(r => setTimeout(r, 600));
    }
  },
  {
    id: '07-kasulatan-bilingual-preview',
    stepPill: 'Screen 07 of 18 · Bilingual Kasulatan',
    title: 'Kasulatan sa Abang (Bilingual A4)',
    subtitle: 'English & Bisaya clauses fitted to a single A4 bond paper',
    lead: 'Interactive Kasulatan with 7 standard clauses, A4 page fit indicator, and Gemini 3 Flash Lite AI for drafting custom house rules.',
    bullets: [
      { icon: '📄', label: 'Single-Page A4 Guarantee', desc: 'Strict brevity budget ensures printed contracts never spill onto a second sheet of bond paper.' },
      { icon: '🇵🇭', label: 'English & Bisaya Side-by-Side', desc: 'Complete bilingual clauses so both owner and tenant understand every house rule.' },
      { icon: '🤖', label: 'Gemini 3 Flash Lite AI Assistant', desc: 'Converts informal house rules into structured, balanced contract clauses in seconds.' }
    ],
    next: 'Landlord signs digitally and saves agreement, triggering room code generation.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.setCurrentScreen('WIZARD_CONTRACT');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '08-customize-lease-presets',
    stepPill: 'Screen 08 of 18 · Preset Customizer',
    title: 'Custom Lease Preset Library',
    subtitle: 'Reusable agreement templates with dynamic variables',
    lead: 'Landlords can design, duplicate, reorder, and persist custom presets (Bedspace, Room with CR, Studio) for their properties.',
    bullets: [
      { icon: '🧩', label: 'Dynamic Placeholders', desc: 'Insert variables like {{rent}}, {{unit}}, {{tenant_name}}, and {{due_day}} that auto-populate.' },
      { icon: '🔄', label: 'Drag & Reorder Clauses', desc: 'Add, remove, or reorder house rules to customize agreements per building.' },
      { icon: '🧊', label: 'Frozen Contract Snapshot', desc: 'Signed leases keep a permanent frozen copy; later preset edits never alter historical contracts.' }
    ],
    next: 'Custom presets are saved to the landlord account for all future rooms.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.setCurrentScreen('CUSTOMIZE_LEASE');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '09-all-done-share-room-code',
    stepPill: 'Screen 09 of 18 · Lease Published',
    title: 'Room Code Generated & Share Ready',
    subtitle: 'Instant onboarding link for prospective residents',
    lead: 'The agreement is sealed. The system generates an 8-character Room Code (RIP-OPEN) and shareable invite link.',
    bullets: [
      { icon: '🎟️', label: 'Unique 8-Char Room Code', desc: 'Simple code format (e.g. RIP-OPEN) easily shared via SMS, Messenger, or printed on room doors.' },
      { icon: '🔗', label: 'One-Click Link Copy', desc: 'Copies full invite URL to clipboard for direct messaging to prospective tenants.' },
      { icon: '⚡', label: 'Instant Status Transition', desc: 'Lease is marked "Open", ready for tenant connection and review.' }
    ],
    next: 'Landlord shares link with prospective resident via SMS or messenger.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.setCurrentScreen('ALL_DONE');
      });
      await new Promise(r => setTimeout(r, 600));
    }
  },
  {
    id: '10-tenant-join-room-code',
    stepPill: 'Screen 10 of 18 · Tenant Onboarding',
    title: 'Tenant Onboarding via Room Code',
    subtitle: 'Zero paperwork join flow with automatic parameter match',
    lead: 'Tenant enters room code (RIP-OPEN). The system automatically pulls up the property address, unit identifier, and rent amount.',
    bullets: [
      { icon: '🔍', label: 'Automated Property Lookup', desc: 'Entering the code immediately verifies the landlord identity and room specifications.' },
      { icon: '👤', label: 'Quick Tenant Registration', desc: 'Fast mobile account setup with full legal name, contact number, and password.' },
      { icon: '🚫', label: 'Zero Mock Data', desc: 'Strict validation requires a real existing room code before allowing the tenant to proceed.' }
    ],
    next: 'Tenant registers their account to inspect and sign the agreement.',
    setup: async (page) => {
      await page.evaluate(async () => {
        window.__appContext.resetAppData();
        window.__appContext.setCurrentScreen('TENANT_AUTH');
      });
      await new Promise(r => setTimeout(r, 600));
    }
  },
  {
    id: '11-tenant-kasulatan-sign',
    stepPill: 'Screen 11 of 18 · Tenant Review & E-Sign',
    title: 'Bilingual Contract Review & E-Sign',
    subtitle: 'One-tap Bisaya translation toggle & touchscreen signature',
    lead: 'Tenants review every clause with full language transparency, confirm understanding, and execute a legally binding digital signature.',
    bullets: [
      { icon: '🇵🇭', label: 'One-Tap Bisaya Toggle', desc: 'Instantly view Bisaya translations for each clause to eliminate language barriers.' },
      { icon: '✍️', label: 'Touchscreen Signature Pad', desc: 'High-resolution digital stylus/finger signing directly on mobile screens.' },
      { icon: '🖨️', label: 'Physical Wet-Ink Option', desc: 'Supports traditional A4 printing and ballpen signing for non-digital tenants.' }
    ],
    next: 'Status transitions to pending payment; tenant uploads GCash payment proof.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('TENANT');
        const openContract = {
          code: 'RIP-OPEN',
          roomCode: 'RIP-OPEN',
          roomNumber: 'Room 201 (Corner Studio)',
          propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
          propertyType: 'Apartment / Studio Unit',
          monthlyRent: 4500,
          advanceRent: 4500,
          deposit: 4500,
          dueDay: '5th',
          status: 'open',
          isSigned: false,
          tenantSigned: false,
          paymentVerified: false,
          accessCode: null
        };
        window.__appContext.setActiveCode('RIP-OPEN');
        window.__appContext.setActiveTenantContract(openContract);
        window.__appContext.setTenantName('Maria Teresa Santos');
        window.__appContext.setTenantHasReadContract(true);
        window.__appContext.setSigningMode('DIGITAL');
        window.__appContext.setSignatureData('data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M 30 75 Q 80 15 130 65 T 230 45 T 270 75" stroke="#14532D" stroke-width="3" fill="none" stroke-linecap="round"/><line x1="30" y1="90" x2="270" y2="90" stroke="#14532D" stroke-width="1.5"/></svg>'));
        window.__appContext.setGcashRefNumber('');
        window.__appContext.setGcashFileData(null);
        window.__appContext.setCurrentScreen('TENANT_PORTAL');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '12-tenant-gcash-proof-upload',
    stepPill: 'Screen 12 of 18 · Payment Proof Submission',
    title: 'GCash Advance Payment Submission',
    subtitle: 'Official e-receipt attachment with reference number check',
    lead: 'Tenant attaches their official GCash transaction screenshot and inputs the 12-digit reference number for automated audit.',
    bullets: [
      { icon: '📸', label: 'E-Receipt Image Attachment', desc: 'Secure image upload with thumbnail preview and client-side compression.' },
      { icon: '🔢', label: '12-Digit Reference Validation', desc: 'Validates reference number syntax to prevent fake or empty transaction entries.' },
      { icon: '🚫', label: 'Duplicate Submission Guard', desc: 'Checks against previous transactions to stop recycled GCash receipts.' }
    ],
    next: 'Submission enters landlord queue for payment verification.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('TENANT');
        const signedContract = {
          code: 'RIP-OPEN',
          roomCode: 'RIP-OPEN',
          roomNumber: 'Room 201 (Corner Studio)',
          propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
          propertyType: 'Apartment / Studio Unit',
          monthlyRent: 4500,
          advanceRent: 4500,
          deposit: 4500,
          dueDay: '5th',
          status: 'pending_payment',
          isSigned: true,
          tenantSigned: true,
          paymentVerified: false,
          gcashRef: null,
          accessCode: null
        };
        const sampleReceiptSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" style="background:#005ce6;font-family:sans-serif;"><text x="150" y="35" fill="#fff" font-weight="900" font-size="14" text-anchor="middle">GCash E-Receipt</text><rect x="15" y="50" width="270" height="110" rx="10" fill="#fff"/><text x="150" y="90" fill="#0f172a" font-weight="900" font-size="18" text-anchor="middle">PHP 4,500.00</text><text x="150" y="120" fill="#005ce6" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">Ref: 881245091010</text><text x="150" y="142" fill="#64748b" font-size="10" text-anchor="middle">Tan Residence</text></svg>');
        window.__appContext.setActiveCode('RIP-OPEN');
        window.__appContext.setActiveTenantContract(signedContract);
        window.__appContext.setTenantName('Maria Teresa Santos');
        window.__appContext.setGcashRefNumber('881245091010');
        window.__appContext.setGcashFileData({
          dataUrl: sampleReceiptSvg,
          name: 'gcash_receipt_advance.png',
          size: 245000
        });
        window.__appContext.setCurrentScreen('TENANT_PORTAL');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '13-tenant-waiting-verification',
    stepPill: 'Screen 13 of 18 · Security Gate',
    title: 'Protected Waiting State (PIN Locked)',
    subtitle: 'Access code strictly masked until landlord approves payment',
    lead: 'Security guarantee: Access PIN remains locked (•••••), preventing premature move-in until the landlord verifies funds.',
    bullets: [
      { icon: '🔒', label: 'Cryptographic Security Gate', desc: 'Door code is masked server-side until payment clearance is explicitly confirmed.' },
      { icon: '⏳', label: 'Real-Time Status Feedback', desc: 'Tenant sees "Verification in Progress" with advance amount and reference number summary.' },
      { icon: '🛡️', label: 'Zero Premature Entry', desc: 'Protects landlords from unauthorized check-ins before bank statement confirmation.' }
    ],
    next: 'Landlord receives notification and opens verification screen.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('TENANT');
        const pendingContract = {
          code: 'RIP-PEND',
          roomCode: 'RIP-PEND',
          roomNumber: 'Room 201 (Corner Studio)',
          propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
          propertyType: 'Apartment / Studio Unit',
          monthlyRent: 4500,
          advanceRent: 4500,
          deposit: 4500,
          dueDay: '5th',
          status: 'pending_verification',
          isSigned: true,
          tenantSigned: true,
          paymentVerified: false,
          gcashRef: 'GCASH-98231456201',
          advancePaidAmount: 4500,
          accessCode: null
        };
        window.__appContext.setActiveCode('RIP-PEND');
        window.__appContext.setActiveTenantContract(pendingContract);
        window.__appContext.setTenantName('Juan Paolo Dela Cruz');
        window.__appContext.setCurrentScreen('TENANT_PORTAL');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '14-landlord-payment-verification',
    stepPill: 'Screen 14 of 18 · Payment Audit Desk',
    title: 'Payment Verification & Audit Desk',
    subtitle: 'Receipt inspection with zoom modal & reference check',
    lead: 'Landlords inspect the uploaded GCash receipt screenshot, verify reference number, and approve check-in or reject with reason.',
    bullets: [
      { icon: '🔍', label: 'Receipt Zoom Inspection', desc: 'Click to open full-resolution receipt modal for granular text and amount audit.' },
      { icon: '✅', label: '1-Click Verification', desc: 'Tapping "Verify Payment" releases the 5-digit door access code to the tenant.' },
      { icon: '❌', label: 'Rejection with Reason', desc: 'Provide clear feedback (e.g. blurred screenshot, mismatched amount) requesting resubmission.' }
    ],
    next: 'System generates cryptographically secure 5-digit door PIN.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('LANDLORD');
        const res = await fetch('/demo-seed.json');
        const seed = await res.json();
        const pendingLease = seed.contracts.find(c => c.code === 'RIP-PEND');

        window.__appContext.setSelectedTenant({
          name: pendingLease.tenantName,
          unit: `${pendingLease.roomNumber} · ${pendingLease.propertyType}`,
          rent: pendingLease.monthlyRent,
          phone: pendingLease.tenantPhone,
          due: pendingLease.dueDay,
          isSigned: true,
          paymentVerified: false,
          code: pendingLease.code,
          gcashRef: pendingLease.gcashRef,
          gcashReceiptData: pendingLease.gcashReceiptData,
          accessCode: null,
          contract: pendingLease
        });
        window.__appContext.setCurrentScreen('TENANT_DETAIL');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '15-landlord-access-code-issued',
    stepPill: 'Screen 15 of 18 · Move-In Access',
    title: 'Keypad Access Code Released',
    subtitle: 'Cryptographic door PIN release without expensive IoT locks',
    lead: 'Payment verified! The platform releases a unique 5-digit door PIN (48291) bound to the contract, enabling contactless move-in.',
    bullets: [
      { icon: '🔑', label: 'Software-Gated Access', desc: 'Door PIN is securely released only after payment clears, eliminating unpaid move-ins.' },
      { icon: '🛡️', label: 'Works with ₱800 Keypad Locks', desc: 'Zero electrical wiring or IoT hubs; works with standard mechanical or digital locks.' },
      { icon: '🔄', label: 'Instant Revoke & Regenerate', desc: 'Landlord can regenerate a fresh PIN or revoke access permanently upon move-out.' }
    ],
    next: 'Tenant receives instant access code on their mobile hub.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('LANDLORD');
        const res = await fetch('/demo-seed.json');
        const seed = await res.json();
        const activeLease = seed.contracts.find(c => c.code === 'RIP-ACTV');

        window.__appContext.setSelectedTenant({
          name: activeLease.tenantName,
          unit: `${activeLease.roomNumber} · ${activeLease.propertyType}`,
          rent: activeLease.monthlyRent,
          phone: activeLease.tenantPhone,
          due: activeLease.dueDay,
          isSigned: true,
          paymentVerified: true,
          code: activeLease.code,
          gcashRef: activeLease.gcashRef,
          gcashReceiptData: activeLease.gcashReceiptData,
          accessCode: '48291',
          contract: activeLease
        });
        window.__appContext.setCurrentScreen('TENANT_DETAIL');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '16-tenant-resident-hub',
    stepPill: 'Screen 16 of 18 · Resident Hub',
    title: 'Tenant Resident Hub & Access PIN',
    subtitle: 'Verified Active home view with digital keypad PIN',
    lead: 'Maria Santos sees her verified active home: room assignment, door PIN (48291), agreement copy, and monthly rent logger.',
    bullets: [
      { icon: '🔑', label: '1-Tap Door Code Copy', desc: 'Copy 5-digit keypad code instantly to clipboard for physical keypad entry.' },
      { icon: '📜', label: 'Digital Kasulatan Access', desc: 'Permanent on-demand access to the signed bilingual agreement copy.' },
      { icon: '💳', label: 'Monthly Rent Logger', desc: 'Submit monthly rent with GCash reference numbers directly from the mobile hub.' }
    ],
    next: 'Tenant uses PIN to unlock boarding house smart lockbox.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('TENANT');
        window.__appContext.setCurrentScreen('TENANT_HOME');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '17-landlord-search-filter',
    stepPill: 'Screen 17 of 18 · Unified Search',
    title: 'Unified Search & Cross-Indexing',
    subtitle: 'Linking code, contract, tenant, and ledger in 1 query',
    lead: 'Instant search filtering across room codes, access PINs, tenant names, and GCash reference numbers.',
    bullets: [
      { icon: '⚡', label: 'Sub-Second Filtering', desc: 'Type any room code, PIN, name, or GCash ref to immediately filter leases.' },
      { icon: '🔗', label: 'Unified Contract Link', desc: 'Links financial transactions, room assignments, and access PINs in one view.' },
      { icon: '📂', label: 'Complete Resident History', desc: 'Tap any result to inspect all payments, receipts, and contract terms.' }
    ],
    next: 'Tap any result to inspect complete contract and payment logs.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('LANDLORD');
        window.__appContext.setSearchQuery('88124509101');
        window.__appContext.setCurrentScreen('LANDLORD_HOME');
      });
      await new Promise(r => setTimeout(r, 800));
    }
  },
  {
    id: '18-landlord-payment-ledger',
    stepPill: 'Screen 18 of 18 · Financial Ledger',
    title: 'Multi-Month Payment Ledger',
    subtitle: 'Chronological accounting audit trail with receipt proofs',
    lead: 'Complete financial audit trail tracking advance rent, security deposit, and subsequent monthly rent cycles with dispute-proof receipts.',
    bullets: [
      { icon: '📅', label: 'Multi-Month Rent Cycles', desc: 'Records advance rent, security deposit, and recurring monthly cycles.' },
      { icon: '🧾', label: 'Attached Proof of Payment', desc: 'Every transaction includes verified GCash reference and zoomable receipt screenshot.' },
      { icon: '🛡️', label: 'Dispute-Proof Record', desc: 'Eliminates "I already paid" disputes with immutable, timestamped ledger records.' }
    ],
    next: 'Landlord can export ledger for tax and accounting records.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('LANDLORD');
        const res = await fetch('/demo-seed.json');
        const seed = await res.json();
        const activeLease = seed.contracts.find(c => c.code === 'RIP-ACTV');

        window.__appContext.setSelectedTenant({
          name: activeLease.tenantName,
          unit: `${activeLease.roomNumber} · ${activeLease.propertyType}`,
          rent: activeLease.monthlyRent,
          phone: activeLease.tenantPhone,
          due: activeLease.dueDay,
          isSigned: true,
          paymentVerified: true,
          code: activeLease.code,
          gcashRef: activeLease.gcashRef,
          gcashReceiptData: activeLease.gcashReceiptData,
          accessCode: '48291',
          contract: activeLease
        });
        window.__appContext.setCurrentScreen('TENANT_DETAIL');
      });
      await new Promise(r => setTimeout(r, 800));
      await page.evaluate(() => {
        window.scrollTo({ top: 900, behavior: 'instant' });
      });
      await new Promise(r => setTimeout(r, 600));
    }
  }
];

function getSlideHtml(item, imgDataUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1440px;
          height: 860px;
          background: radial-gradient(circle at 15% 20%, #155530 0%, #0d381f 45%, #071f11 100%);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #ffffff;
          padding: 40px 60px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 28px 28px, 112px 112px, 112px 112px;
          pointer-events: none;
        }
        .halo-gold {
          position: absolute;
          top: -120px;
          right: 360px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(241,174,23,0.18) 0%, rgba(241,174,23,0) 70%);
          pointer-events: none;
        }
        .halo-emerald {
          position: absolute;
          bottom: -150px;
          right: 40px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(22,163,74,0.22) 0%, rgba(22,163,74,0) 70%);
          pointer-events: none;
        }

        /* Left Column: Pitch Explanation */
        .narrative-col {
          width: 760px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
          z-index: 10;
        }
        .top-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: -0.2px;
        }
        .brand-pill span { color: #F1AE17; }
        .step-pill {
          background: #F1AE17;
          color: #0F172A;
          font-size: 11px;
          font-weight: 900;
          padding: 6px 14px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          box-shadow: 0 4px 12px rgba(241,174,23,0.3);
        }
        .slide-title {
          font-size: 34px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -0.6px;
        }
        .slide-subtitle {
          font-size: 17px;
          font-weight: 700;
          color: #F1AE17;
          letter-spacing: -0.2px;
        }
        .lead-caption {
          font-size: 15px;
          line-height: 1.6;
          color: #E4EFE9;
          font-weight: 500;
        }
        .info-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 20px;
          padding: 20px 24px;
          backdrop-filter: blur(8px);
        }
        .key-points {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .point-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 14px;
          line-height: 1.5;
          color: #F4F8F5;
        }
        .point-icon {
          font-size: 16px;
          line-height: 1.2;
        }
        .point-label {
          font-weight: 800;
          color: #ffffff;
        }
        .next-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(20, 76, 46, 0.6);
          border: 1px solid rgba(68, 149, 103, 0.4);
          padding: 12px 18px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          color: #A7F3D0;
        }
        .next-label {
          color: #F1AE17;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.6px;
        }

        /* Right Column: Phone Mockup */
        .phone-col {
          width: 480px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }
        .phone-frame {
          width: 390px;
          height: 780px;
          background: #0f172a;
          border-radius: 46px;
          padding: 10px;
          box-shadow: 
            0 30px 70px rgba(0, 0, 0, 0.75),
            0 0 0 2.5px rgba(255, 255, 255, 0.22);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .phone-notch {
          position: absolute;
          top: 15px;
          width: 90px;
          height: 18px;
          background: #000000;
          border-radius: 12px;
          z-index: 30;
        }
        .phone-screen {
          width: 100%;
          height: 100%;
          border-radius: 36px;
          overflow: hidden;
          background: #E4EFE9;
        }
        .phone-screen img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
        }
      </style>
    </head>
    <body>
      <div class="bg-grid"></div>
      <div class="halo-gold"></div>
      <div class="halo-emerald"></div>

      <div class="narrative-col">
        <div class="top-meta">
          <div class="brand-pill">
            <div>Rent in <span>Peace</span></div>
          </div>
          <div class="step-pill">${item.stepPill}</div>
        </div>

        <div>
          <h1 class="slide-title">${item.title}</h1>
          <p class="slide-subtitle">${item.subtitle}</p>
        </div>

        <p class="lead-caption">${item.lead}</p>

        <div class="info-card">
          <div class="key-points">
            ${item.bullets.map(b => `
              <div class="point-item">
                <span class="point-icon">${b.icon}</span>
                <div><span class="point-label">${b.label}:</span> ${b.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="next-box">
          <span class="next-label">Next in Flow:</span>
          <span>${item.next}</span>
        </div>
      </div>

      <div class="phone-col">
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <img src="${imgDataUrl}" alt="${item.title}">
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function captureAll() {
  console.log('========================================================================');
  console.log('  📸 CAPTURING ALL 18 HIGH-RES SCREENS & WIDESCREEN PRESENTATION SLIDES');
  console.log('========================================================================');
  console.log(`Target URL:     ${APP_URL}`);
  console.log(`Mobile Screen:  390 x 844 (DPR 2.0)`);
  console.log(`Pitch Slide:    1440 x 860 Widescreen (DPR 2.0 -> 2880 x 1720 Retina)`);
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // -------------------------------------------------------------
  // PASS 1: CAPTURE ALL 18 RAW MOBILE SCREENSHOTS (390 x 844)
  // -------------------------------------------------------------
  console.log('[1/3] Capturing 18 raw mobile screenshots...');
  const appPage = await browser.newPage();
  await appPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await appPage.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await appPage.waitForFunction(() => window.__appContext !== undefined);

  for (let i = 0; i < SCREENS_CONFIG.length; i++) {
    const item = SCREENS_CONFIG[i];
    process.stdout.write(`  [${i + 1}/${SCREENS_CONFIG.length}] ${item.id}... `);

    await item.setup(appPage);
    const screenshotPath = path.resolve(SCREENSHOTS_DIR, `${item.id}.png`);
    await appPage.screenshot({ path: screenshotPath, type: 'png' });

    try {
      fs.copyFileSync(screenshotPath, path.resolve(PARENT_DOCS_DIR, 'screenshots', `${item.id}.png`));
    } catch (e) {}

    console.log('DONE');
  }
  await appPage.close();

  // -------------------------------------------------------------
  // PASS 2: GENERATE 18 WIDESCREEN PRESENTATION SLIDES (1440 x 860)
  // -------------------------------------------------------------
  console.log('\n[2/3] Generating 18 widescreen presentation slides in docs/pitch/...');
  const slidePage = await browser.newPage();
  await slidePage.setViewport({ width: 1440, height: 860, deviceScaleFactor: 2 });

  for (let i = 0; i < SCREENS_CONFIG.length; i++) {
    const item = SCREENS_CONFIG[i];
    process.stdout.write(`  [${i + 1}/${SCREENS_CONFIG.length}] Slide: ${item.id}... `);

    const screenshotPath = path.resolve(SCREENSHOTS_DIR, `${item.id}.png`);
    const rawScreenshotBuf = fs.readFileSync(screenshotPath);
    const imgDataUrl = `data:image/png;base64,${rawScreenshotBuf.toString('base64')}`;

    const pitchHtml = getSlideHtml(item, imgDataUrl);
    await slidePage.setContent(pitchHtml, { waitUntil: 'domcontentloaded' });
    const pitchFilepath = path.resolve(PITCH_DIR, `${item.id}-framed.png`);
    await slidePage.screenshot({ path: pitchFilepath, type: 'png' });

    try {
      fs.copyFileSync(pitchFilepath, path.resolve(PARENT_DOCS_DIR, 'pitch', `${item.id}-framed.png`));
    } catch (e) {}

    console.log('DONE');
  }

  // -------------------------------------------------------------
  // PASS 3: GENERATE 2 COMPOSITE FLOW MAPS (1560 x 740)
  // -------------------------------------------------------------
  console.log('\n[3/3] Generating 2 widescreen composite flow maps...');

  // 1. Landlord Flow Composite
  const landlordScreens = [
    { title: '1. Register & Login', file: '02-landlord-auth.png' },
    { title: '2. Dashboard & Leases', file: '03-landlord-dashboard.png' },
    { title: '3. A4 Kasulatan', file: '07-kasulatan-bilingual-preview.png' },
    { title: '4. Verify GCash Proof', file: '14-landlord-payment-verification.png' },
    { title: '5. Access Code Released', file: '15-landlord-access-code-issued.png' }
  ];

  const landlordFlowHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1560px;
          height: 740px;
          background: radial-gradient(circle at 10% 20%, #175e37 0%, #0e3b22 55%, #072213 100%);
          font-family: system-ui, -apple-system, sans-serif;
          color: #ffffff;
          padding: 36px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px);
          background-size: 26px 26px;
          pointer-events: none;
        }
        .halo {
          position: absolute;
          top: -120px;
          right: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(241,174,23,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid rgba(255,255,255,0.18);
          padding-bottom: 16px;
          z-index: 10;
        }
        .header h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
        .header h1 span { color: #F1AE17; }
        .header p { font-size: 14px; color: #E4EFE9; font-weight: 600; margin-top: 4px; }
        .screens-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 18px;
          z-index: 10;
        }
        .flow-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .flow-step-num {
          font-size: 13px;
          font-weight: 900;
          color: #0F172A;
          background: #F1AE17;
          padding: 5px 16px;
          border-radius: 999px;
          margin-bottom: 10px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(241,174,23,0.35);
        }
        .mockup-frame {
          width: 100%;
          max-width: 250px;
          height: 480px;
          border-radius: 30px;
          background: #0f172a;
          padding: 8px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.15);
          overflow: hidden;
        }
        .mockup-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 22px;
        }
        .arrow {
          font-size: 32px;
          color: #F1AE17;
          font-weight: 900;
          text-shadow: 0 0 16px rgba(241,174,23,0.6);
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="bg-grid"></div>
      <div class="halo"></div>
      <div class="header">
        <div>
          <h1>Rent in <span>Peace</span> · Landlord End-to-End Operation Flow</h1>
          <p>Registration ➔ Lease Creation ➔ Bilingual Kasulatan ➔ Payment Audit ➔ Door PIN Release</p>
        </div>
        <div style="font-size:13px;font-weight:900;background:rgba(255,255,255,0.15);color:#F1AE17;padding:8px 18px;border-radius:14px;border:1px solid rgba(241,174,23,0.4);">
          5 Operational Steps
        </div>
      </div>
      <div class="screens-row">
        ${landlordScreens.map((s, idx) => `
          <div class="flow-card">
            <div class="flow-step-num">${s.title}</div>
            <div class="mockup-frame">
              <img src="data:image/png;base64,${fs.readFileSync(path.resolve(SCREENSHOTS_DIR, s.file)).toString('base64')}">
            </div>
          </div>
          ${idx < landlordScreens.length - 1 ? '<div class="arrow">➔</div>' : ''}
        `).join('')}
      </div>
    </body>
    </html>
  `;

  await slidePage.setViewport({ width: 1560, height: 740, deviceScaleFactor: 2 });
  await slidePage.setContent(landlordFlowHtml, { waitUntil: 'domcontentloaded' });
  const landlordFlowPath = path.resolve(PITCH_DIR, 'landlord-flow.png');
  await slidePage.screenshot({ path: landlordFlowPath, type: 'png' });
  try {
    fs.copyFileSync(landlordFlowPath, path.resolve(PARENT_DOCS_DIR, 'pitch', 'landlord-flow.png'));
  } catch (e) {}
  console.log('      ✓ Generated docs/pitch/landlord-flow.png');

  // 2. Tenant Flow Composite
  const tenantScreens = [
    { title: '1. Join via Room Code', file: '10-tenant-join-room-code.png' },
    { title: '2. Review & E-Sign', file: '11-tenant-kasulatan-sign.png' },
    { title: '3. GCash Proof Upload', file: '12-tenant-gcash-proof-upload.png' },
    { title: '4. PIN Locked Gate', file: '13-tenant-waiting-verification.png' },
    { title: '5. Door PIN Released', file: '16-tenant-resident-hub.png' }
  ];

  const tenantFlowHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1560px;
          height: 740px;
          background: radial-gradient(circle at 10% 20%, #175e37 0%, #0e3b22 55%, #072213 100%);
          font-family: system-ui, -apple-system, sans-serif;
          color: #ffffff;
          padding: 36px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px);
          background-size: 26px 26px;
          pointer-events: none;
        }
        .halo {
          position: absolute;
          top: -120px;
          right: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(241,174,23,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid rgba(255,255,255,0.18);
          padding-bottom: 16px;
          z-index: 10;
        }
        .header h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
        .header h1 span { color: #F1AE17; }
        .header p { font-size: 14px; color: #E4EFE9; font-weight: 600; margin-top: 4px; }
        .screens-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 18px;
          z-index: 10;
        }
        .flow-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .flow-step-num {
          font-size: 13px;
          font-weight: 900;
          color: #0F172A;
          background: #F1AE17;
          padding: 5px 16px;
          border-radius: 999px;
          margin-bottom: 10px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(241,174,23,0.35);
        }
        .mockup-frame {
          width: 100%;
          max-width: 250px;
          height: 480px;
          border-radius: 30px;
          background: #0f172a;
          padding: 8px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.15);
          overflow: hidden;
        }
        .mockup-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 22px;
        }
        .arrow {
          font-size: 32px;
          color: #F1AE17;
          font-weight: 900;
          text-shadow: 0 0 16px rgba(241,174,23,0.6);
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="bg-grid"></div>
      <div class="halo"></div>
      <div class="header">
        <div>
          <h1>Rent in <span>Peace</span> · Tenant Resident Onboarding Journey</h1>
          <p>Join Unit ➔ Read Bilingual Terms ➔ E-Sign ➔ Submit GCash ➔ Instant Smart Lockbox PIN</p>
        </div>
        <div style="font-size:13px;font-weight:900;background:rgba(255,255,255,0.15);color:#F1AE17;padding:8px 18px;border-radius:14px;border:1px solid rgba(241,174,23,0.4);">
          5 Resident Steps
        </div>
      </div>
      <div class="screens-row">
        ${tenantScreens.map((s, idx) => `
          <div class="flow-card">
            <div class="flow-step-num">${s.title}</div>
            <div class="mockup-frame">
              <img src="data:image/png;base64,${fs.readFileSync(path.resolve(SCREENSHOTS_DIR, s.file)).toString('base64')}">
            </div>
          </div>
          ${idx < tenantScreens.length - 1 ? '<div class="arrow">➔</div>' : ''}
        `).join('')}
      </div>
    </body>
    </html>
  `;

  await slidePage.setContent(tenantFlowHtml, { waitUntil: 'domcontentloaded' });
  const tenantFlowPath = path.resolve(PITCH_DIR, 'tenant-flow.png');
  await slidePage.screenshot({ path: tenantFlowPath, type: 'png' });
  try {
    fs.copyFileSync(tenantFlowPath, path.resolve(PARENT_DOCS_DIR, 'pitch', 'tenant-flow.png'));
  } catch (e) {}
  console.log('      ✓ Generated docs/pitch/tenant-flow.png');

  await browser.close();
  console.log('\n========================================================================');
  console.log('  🎉 COMPLETE: ALL 18 SCREENS + 18 SLIDES + 2 FLOWS GENERATED!');
  console.log('========================================================================\n');
}

captureAll().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
