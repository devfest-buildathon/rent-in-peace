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
    title: '1. Welcome & Legal Foundation',
    caption: 'Clean, approachable onboarding screen grounded in the Philippine Civil Code (Art. 1356). Landlords and tenants select their respective dedicated portals.',
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
    title: '2. Landlord Authentication & Password Strength',
    caption: 'Landlord sign-up and sign-in featuring live password strength scoring (zxcvbn entropy standard) with clear requirement badges.',
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
    title: '3. Landlord Dashboard & Real-Time Rent Roll',
    caption: 'Operational hub displaying total monthly rent volume (₱13,000/mo), 4 active leases, an Action Required alert for unverified GCash receipts, and room code sharing.',
    next: 'Landlord can review pending payments or tap "Create Lease" to start a new agreement.',
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
    title: '4. Property Type Classification',
    caption: 'Step 1 of the lease wizard: landlords choose between Boarding House / Bedspace, Private Room with Bath, or Apartment / Studio Unit.',
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
    title: '5. Lease Terms & Financial Parameters',
    caption: 'Parameters configuration: room identifier, property address, monthly rent, and security deposit with automated advance calculation.',
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
    title: '6. Review Summary & Legal Safeguards',
    caption: 'Pre-flight lease validation showing total move-in balance, rent due schedule, and statutory compliance note under Philippine tenancy laws.',
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
    title: '7. Kasulatan sa Abang (Bilingual A4)',
    caption: 'Live bilingual agreement (English & Bisaya) with 7 standard clauses, A4 bond paper fit validation, and dual-signing mode selection (Digital vs Wet-Ink).',
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
    title: '8. Custom Lease Preset Library & Editor',
    caption: 'Preset manager: landlords can design reusable lease templates (Bedspace, Private Room, Studio), edit/reorder clauses, and insert dynamic variables ({{rent}}, {{unit}}).',
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
    title: '9. Lease Published & Room Code Generated',
    caption: 'Agreement saved. The system generates an 8-character Room Code (e.g. RIP-OPEN) and instant share link for tenant onboarding.',
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
    title: '10. Tenant Onboarding via Room Code',
    caption: 'Tenant enters or receives room code (RIP-PEND). The system automatically matches and displays the landlord property and unit details.',
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
    title: '11. Bilingual Contract Review & Digital E-Signature',
    caption: 'Tenant reviews every clause with instant English/Bisaya explanation toggle, confirms statutory compliance, and draws digital signature.',
    next: 'Status transitions to pending payment; tenant uploads GCash payment proof.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('TENANT');
        const openContract = {
          code: 'RIP-OPEN',
          roomCode: 'RIP-OPEN',
          roomNumber: 'Room 101 (Bedspace A)',
          propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
          propertyType: 'Boarding House / Bedspace',
          monthlyRent: 2500,
          advanceRent: 2500,
          deposit: 2500,
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
    title: '12. GCash Advance Payment Submission',
    caption: 'Tenant attaches official GCash e-receipt screenshot and inputs the 12-digit reference number for automated cross-checking.',
    next: 'Submission enters landlord queue for payment verification.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('TENANT');
        const signedContract = {
          code: 'RIP-OPEN',
          roomCode: 'RIP-OPEN',
          roomNumber: 'Room 101 (Bedspace A)',
          propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
          propertyType: 'Boarding House / Bedspace',
          monthlyRent: 2500,
          advanceRent: 2500,
          deposit: 2500,
          dueDay: '5th',
          status: 'pending_payment',
          isSigned: true,
          tenantSigned: true,
          paymentVerified: false,
          gcashRef: null,
          accessCode: null
        };
        const sampleReceiptSvg = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" style="background:#005ce6;font-family:sans-serif;"><text x="150" y="35" fill="#fff" font-weight="900" font-size="14" text-anchor="middle">GCash E-Receipt</text><rect x="15" y="50" width="270" height="110" rx="10" fill="#fff"/><text x="150" y="90" fill="#0f172a" font-weight="900" font-size="18" text-anchor="middle">PHP 2,500.00</text><text x="150" y="120" fill="#005ce6" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">Ref: 982314562010</text><text x="150" y="142" fill="#64748b" font-size="10" text-anchor="middle">Pineview Residences</text></svg>');
        window.__appContext.setActiveCode('RIP-OPEN');
        window.__appContext.setActiveTenantContract(signedContract);
        window.__appContext.setTenantName('Maria Teresa Santos');
        window.__appContext.setGcashRefNumber('982314562010');
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
    title: '13. Protected Waiting State (Door PIN Locked)',
    caption: 'Security guarantee: Access code remains strictly locked until the landlord verifies receipt. Prevents unauthorized entry before funds clear.',
    next: 'Landlord receives notification and opens verification screen.',
    setup: async (page) => {
      await page.evaluate(async () => {
        await window.__appContext.loadDemoPitchData('TENANT');
        const pendingContract = {
          code: 'RIP-PEND',
          roomCode: 'RIP-PEND',
          roomNumber: 'Room 102 (Private Room)',
          propertyAddress: 'Block 4, Lot 12, Mahogany Avenue, Carmen, Cagayan de Oro City',
          propertyType: 'Private Room with Bath',
          monthlyRent: 3500,
          advanceRent: 3500,
          deposit: 3500,
          dueDay: '5th',
          status: 'pending_verification',
          isSigned: true,
          tenantSigned: true,
          paymentVerified: false,
          gcashRef: 'GCASH-98231456201',
          advancePaidAmount: 3500,
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
    title: '14. Landlord Payment Verification & Audit',
    caption: 'Landlord inspects GCash e-receipt with zoom capability, compares reference numbers against bank statement, and clicks "Verify & Issue Code".',
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
    title: '15. Keypad Access Code Released',
    caption: 'Door PIN (48291) generated and bound to resident contract. Landlord can regenerate or revoke access at any time upon move-out.',
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
    title: '16. Tenant Resident Hub & Door Access PIN',
    caption: 'Verified Active home view: Maria Santos sees her room assignment, active door PIN (48291), official agreement copy, and monthly rent logger.',
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
    title: '17. Unified Search: Linked Code + Contract + Ledger',
    caption: 'Instant search filtering across room codes, access PINs, tenant names, and GCash reference numbers, linking every transaction to its source contract.',
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
    title: '18. Multi-Month Payment Ledger & Audit Trail',
    caption: 'Historical ledger tracking advance rent, security deposit, and subsequent monthly rent payments with GCash transaction timestamps.',
    next: 'Landlord maintains permanent, dispute-free digital rental records.',
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
  }
];

async function captureAll() {
  console.log('\n========================================================');
  console.log('   RENT IN PEACE — AUTOMATED HIGH-RES SCREENSHOT SUITE   ');
  console.log('========================================================');
  console.log(`Target:      ${APP_URL}`);
  console.log(`Viewport:    390 x 844 (DPR: 2.0)`);
  console.log(`Output Dir:  ${SCREENSHOTS_DIR}`);
  console.log(`Pitch Dir:   ${PITCH_DIR}\n`);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  // Navigate to app
  console.log('[1/4] Navigating to app...');
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__appContext !== undefined, { timeout: 10000 });
  console.log('      ✓ Connected to Rent in Peace client environment\n');

  // Capture each screen
  console.log('[2/4] Capturing 18 mobile screenshots...');
  const capturedScreens = [];

  for (const config of SCREENS_CONFIG) {
    process.stdout.write(`      📸 Capturing ${config.id}... `);
    await config.setup(page);
    
    // Smooth settle
    await new Promise(r => setTimeout(r, 400));

    const filename = `${config.id}.png`;
    const filepath = path.resolve(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filepath, type: 'png' });

    // Copy to devfest/docs/screenshots if exists
    try {
      const mirrorPath = path.resolve(PARENT_DOCS_DIR, 'screenshots', filename);
      fs.copyFileSync(filepath, mirrorPath);
    } catch (e) {}

    capturedScreens.push({
      ...config,
      filename,
      filepath
    });
    console.log('DONE');
  }

  // --- PART 2: MAKE PRESENTATION VERSIONS WITH PHONE FRAME & BRAND PALETTE ---
  console.log('\n[3/4] Generating enhanced pitch presentation cards in docs/pitch/...');
  const presentationPage = await browser.newPage();
  await presentationPage.setViewport({ width: 840, height: 1280, deviceScaleFactor: 2 });

  for (const item of capturedScreens) {
    process.stdout.write(`      🎨 Framing ${item.id}... `);
    const imgDataUrl = `data:image/png;base64,${fs.readFileSync(item.filepath).toString('base64')}`;

    const pitchHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 840px;
            height: 1280px;
            background: radial-gradient(circle at 15% 15%, #185e38 0%, #0f3d23 45%, #082314 90%);
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 42px 46px;
            overflow: hidden;
            position: relative;
          }
          /* High-tech architectural dot matrix grid */
          .bg-grid {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px);
            background-size: 28px 28px;
            pointer-events: none;
            opacity: 0.65;
          }
          /* Ambient glowing lights */
          .halo-gold {
            position: absolute;
            top: -100px;
            right: -100px;
            width: 420px;
            height: 420px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(241,174,23,0.28) 0%, rgba(241,174,23,0) 70%);
            pointer-events: none;
          }
          .halo-emerald {
            position: absolute;
            bottom: -120px;
            left: -120px;
            width: 480px;
            height: 480px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(68,149,103,0.35) 0%, rgba(68,149,103,0) 70%);
            pointer-events: none;
          }
          /* Top bar */
          .header {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 10;
          }
          .brand-tag {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand-logo-text {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: -0.4px;
          }
          .brand-logo-text span { color: #F1AE17; }
          .step-badge {
            background: #F1AE17;
            color: #0F172A;
            font-size: 12px;
            font-weight: 900;
            padding: 6px 18px;
            border-radius: 999px;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            box-shadow: 0 4px 14px rgba(241,174,23,0.4);
          }
          /* Title */
          .title-area {
            width: 100%;
            text-align: center;
            margin-top: 10px;
            margin-bottom: 14px;
            z-index: 10;
          }
          .screen-title {
            font-size: 26px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: -0.5px;
            line-height: 1.25;
            text-shadow: 0 4px 16px rgba(0,0,0,0.5);
          }
          /* Realistic phone mockup */
          .phone-mockup {
            width: 370px;
            height: 790px;
            background: #0f172a;
            border-radius: 48px;
            padding: 11px;
            box-shadow: 0 32px 75px rgba(0, 0, 0, 0.65), 0 0 0 2.5px rgba(255,255,255,0.22);
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .phone-notch {
            position: absolute;
            top: 16px;
            width: 95px;
            height: 19px;
            background: #000000;
            border-radius: 12px;
            z-index: 30;
          }
          .phone-screen {
            width: 100%;
            height: 100%;
            border-radius: 38px;
            overflow: hidden;
            background: #E4EFE9;
            display: flex;
          }
          .phone-screen img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top center;
          }
          /* Bottom Caption Card */
          .caption-card {
            width: 100%;
            background: #ffffff;
            color: #0F172A;
            border-radius: 24px;
            padding: 20px 26px;
            box-shadow: 0 18px 40px rgba(0,0,0,0.35);
            margin-top: 14px;
            z-index: 10;
          }
          .caption-text {
            font-size: 15px;
            line-height: 1.5;
            color: #1E293B;
            font-weight: 600;
          }
          .next-action {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1.5px solid #E2E8F0;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
            color: #144C2E;
            font-weight: 800;
          }
          .next-bullet {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #F1AE17;
            box-shadow: 0 0 8px #F1AE17;
          }
        </style>
      </head>
      <body>
        <div class="bg-grid"></div>
        <div class="halo-gold"></div>
        <div class="halo-emerald"></div>

        <div class="header">
          <div class="brand-tag">
            <div class="brand-logo-text">Rent in <span>Peace</span></div>
          </div>
          <div class="step-badge">Stage Pitch Deck</div>
        </div>

        <div class="title-area">
          <h1 class="screen-title">${item.title}</h1>
        </div>

        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <img src="${imgDataUrl}" alt="${item.title}">
          </div>
        </div>

        <div class="caption-card">
          <p class="caption-text">${item.caption}</p>
          <div class="next-action">
            <div class="next-bullet"></div>
            <span>Next: ${item.next}</span>
          </div>
        </div>
      </body>
      </html>
    `;

    await presentationPage.setContent(pitchHtml, { waitUntil: 'load' });
    const pitchFilepath = path.resolve(PITCH_DIR, `${item.id}-framed.png`);
    await presentationPage.screenshot({ path: pitchFilepath, type: 'png' });

    try {
      fs.copyFileSync(pitchFilepath, path.resolve(PARENT_DOCS_DIR, 'pitch', `${item.id}-framed.png`));
    } catch (e) {}

    console.log('DONE');
  }

  // --- PART 3: GENERATE 2 SIDE-BY-SIDE FLOW IMAGES: LANDLORD FLOW & TENANT FLOW ---
  console.log('\n[4/4] Assembling enhanced widescreen composite flow maps...');

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
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1560px;
          height: 740px;
          background: radial-gradient(circle at 10% 20%, #175e37 0%, #0e3b22 55%, #072213 100%);
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
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

  await presentationPage.setViewport({ width: 1560, height: 740, deviceScaleFactor: 2 });
  await presentationPage.setContent(landlordFlowHtml, { waitUntil: 'load' });
  const landlordFlowPath = path.resolve(PITCH_DIR, 'landlord-flow.png');
  await presentationPage.screenshot({ path: landlordFlowPath, type: 'png' });
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
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1560px;
          height: 740px;
          background: radial-gradient(circle at 10% 20%, #175e37 0%, #0e3b22 55%, #072213 100%);
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
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

  await presentationPage.setContent(tenantFlowHtml, { waitUntil: 'load' });
  const tenantFlowPath = path.resolve(PITCH_DIR, 'tenant-flow.png');
  await presentationPage.screenshot({ path: tenantFlowPath, type: 'png' });
  try {
    fs.copyFileSync(tenantFlowPath, path.resolve(PARENT_DOCS_DIR, 'pitch', 'tenant-flow.png'));
  } catch (e) {}
  console.log('      ✓ Generated docs/pitch/tenant-flow.png');

  await browser.close();
  console.log('\n🎉 Screenshot suite completed successfully!');
  console.log(`   Total Raw Screenshots: 18 (in docs/screenshots/)`);
  console.log(`   Framed Pitch Cards:    18 (in docs/pitch/)`);
  console.log(`   Composite Flow Maps:    2 (landlord-flow.png, tenant-flow.png)`);
}

captureAll().catch((err) => {
  console.error('\n❌ Screenshot capture error:', err);
  process.exit(1);
});
