# 🏠 Rent in Peace (RIP)
**Autonomous Legal Lease & In-App Rental Ledger Platform**  
*Built for the Google Developer Group (GDG) Cagayan de Oro Buildathon (Road to DevFest 2026)*

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Clause%20Assistant-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

> **"Good contracts make good neighbors."**  
> Rent in Peace bridges the gap between informal Philippine boarding house arrangements and legally grounded, frictionless lease agreements. It combines **Google Cloud Firestore**, **Gemini Multimodal AI**, and **in-app contactless key handover** into a seamless, mobile-first Progressive Web App.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

### 2. Clone the Repository
```bash
git clone https://github.com/devfest-buildathon/rent-in-peace.git
cd rent-in-peace
```

### 3. Switch to the Working Branch
```bash
git checkout database-ai-stuff-yeah
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Populate your Firebase and Gemini credentials:
```env
# Firebase Cloud Firestore Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini AI API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
```
*(Note: A fallback demo key is included in development mode for evaluation).*

### 6. Run the Local Development Server
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser or mobile emulator.

### 7. Build for Production
```bash
npm run build
npm run preview
```

---

## 🌟 Key Application Features

### 🏢 1. Landlord Lease Studio
- **Guided Contract Wizard**: Step-by-step drafting for Boarding Houses, Bedspaces, and Apartments in Cagayan de Oro.
- **Gemini AI Legal Clause Assistant**: Type natural language prompts (e.g. *"Strict curfew at 10 PM with ₱500 penalty"*, *"Translate rules into Bisaya"*, or *"Add sub-meter billing at ₱15/kWh"*). Gemini synthesizes enforceable, professional clauses adhering to Philippine Civil Code standards.
- **Persistent Single-Use Room Codes**: Generates persistent unique room links (e.g. `?code=RIP-4B92`) that remain stable across edits and sessions.
- **Real-Time Cloud Firestore Sync**: Changes to contracts and payment statuses sync instantly across all devices.

### 🔑 2. Seamless Tenant Onboarding & Registration
- **No Complex Forms for Tenants**: The landlord pre-fills the tenant's legal name, unit number, and rent amount. The tenant only needs to set up a **Username** and **Password** to register.
- **Direct Login to Dashboard**: Logging in takes the tenant straight to their **Tenant Dashboard** (`TENANT_HOME`) without forcing them through repetitive onboarding or setup flows.

### 💳 3. In-App Rent Payments & Ledger
- **GCash QR Ph Integration**: Tenants can view the landlord's GCash number, attach transfer receipt screenshots, and enter their GCash reference number directly in-app.
- **Rent Schedule & Countdown Progress Tracker**: 
  - Clear visual tracking of total payments (e.g., `6-month schedule: 1 of 6 payments completed · 5 remaining`).
  - Next due date indicator (`Due every 5th of each month`).
- **Live Transaction Ledger**: Both landlord and tenant see an immutable record of all submitted payments, cycles, and approval statuses (`Pending Verification` vs `Verified ✅`).

### 🛡️ 4. Payment Verification & Smart Lockbox Key Access
- **Locked Key PIN During Review**: When advance rent is submitted, the tenant's app displays an amber indicator: `⏳ Awaiting Landlord Verification`, keeping the physical door PIN masked (`● ● ● ●`).
- **Landlord Review UI**: The landlord receives an action banner with the tenant's GCash reference number and receipt image.
- **1-Click Key Release**: The landlord clicks **"Verify Payment & Grant Room Key Access"**. This instantly updates the cloud state and reveals the 4-digit Smart Lockbox PIN (**`5829`**) on the tenant's screen for contactless move-in.

### 📜 5. Official Legal Standard (Kasulatan sa Pag-Abang)
- **Compact Standard A4 Document**: Formatted cleanly to fit standard A4 paper with zero overflow.
- **Dual-Signing Mode**: Supports digital on-screen stylus signatures as well as wet-ink physical signing under **Philippine Civil Code Art. 1356**.
- **Notarial Acknowledgment**: Includes certified notarial block for Barangay Lupon or judicial proceedings.

---

## 🏛️ Legal & Compliance Architecture

| Legal Framework | Implementation in Rent in Peace |
|---|---|
| **RA 386 (Civil Code Art. 1356)** | Customary residential lease format enforceable for barangay proceedings and informal dispute resolutions. |
| **Civil Code Art. 1654 & 1687** | Prescribed statutory landlord maintenance covenants and 30-day move-out notification periods. |
| **Rent Control Act of the Philippines** | Deposit caps (1 month advance, 1 to 2 months security deposit) automatically enforced in the wizard. |
| **RA 8792 (E-Commerce Act)** | Electronic signatures recorded with cryptographic timestamps and PhilSys-verified legal name binding. |
| **RA 10173 (Data Privacy Act)** | Strict isolation ensures co-tenants cannot view other tenants' balances, receipts, or contracts. |

---

## 🗄️ Database Collections (Cloud Firestore)

- **`contracts/`**: Holds lease agreements, clause lists, room metadata, lockbox PINs, and verification flags (`paymentVerified: boolean`).
- **`tenants/`**: Tenant credentials (username, password hash/pin), full legal names, and linked contract codes.
- **`landlords/`**: Landlord profiles, registered phone numbers, property locations, and PINs.
- **`payments/`**: Ledger entries with contract codes, cycle names, amounts, GCash reference numbers, and receipt image attachments.
- **`checkins/`**: Audit trail of digital signatures, check-in timestamps, and tenant IDs.

---

## 🧪 Testing the Live Demo

1. **Landlord Flow:**
   - On the Splash Screen, click **Landlord Portal** -> **Create Account** or **Sign In**.
   - Tap **"Create a new contract"**, fill out unit details (e.g. Unit 4, ₱3,500/mo), customize clauses with Gemini AI, and save.
   - Share the room code (e.g. `RIP-XXXX`) or copy the invite link.
2. **Tenant Flow:**
   - Open the link with `?code=RIP-XXXX` or click **Tenant Portal** -> **Register**.
   - Input your username and password.
   - Land directly on your **Tenant Dashboard**: view your contract, pay rent via GCash, track your monthly schedule, and view lockbox status.
3. **Verification Flow:**
   - Tenant submits rent with a GCash ref.
   - Landlord dashboard shows **"Action Required: Tenant Payment Pending"**.
   - Landlord clicks **"Verify Payment & Grant Room Key Access"**.
   - Tenant dashboard instantly unlocks Smart Keybox PIN `5829`!

---

## 👥 The Team Behind Rent in Peace (GDG CDO Buildathon 2026)

| Member | Role | Responsibilities & Contributions |
|---|---|---|
| **Danlord Farell Soriano (Daf)** | **Team Lead & System Architect** | System prompts, stage pitch presenter, Phygital dual-signing architecture, feature orchestration |
| **Pia Paña** (@pyuuh) | **Lead UI/UX Designer** | Figma 10-screen design system, branding, color palette, typography |
| **Justine Roy Salva** (@jrsstuff) | **Lead Backend & AI Engineer** | Google Gemini Flash integration, Cloud Firestore schemas, in-app GCash logic |
| **John Kurt** | **Co-Developer & DevOps** | Deployment, persistence validation, PWA caching |

---

## 📄 License
Licensed under the [MIT License](LICENSE).
