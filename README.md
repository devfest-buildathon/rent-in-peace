# 🏠 Rent in Peace (RIP)
**Autonomous AI Lease & Rent Ledger Generator**  
*Built for GDG Cagayan de Oro Buildathon 2026 (Road to DevFest 2026)*

> **Core Philosophy:** *"Your tenant does NOT need the app."*  
> Inspired by self-check-in kiosks (e.g. D'Morvie Suites) and Jhon Lloyd Cabahug's "Sertipiko".

---

## 🚀 Quick Start

### 1. Clone or open the repository
```bash
cd rent-in-peace
```

### 2. Copy the example environment file
```bash
cp .env.example .env
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run the development server
```bash
npm run dev
```

Then open your browser to **http://localhost:5173/**.

---

## 🌟 Key Features

1. **Zero Tenant Account Creation:**
   - Only the Landlord creates an account.
   - Tenants receive a 6-digit Room Code (e.g. `RIP-4B92`) via SMS/Messenger.
   - Strict data isolation prevents co-tenants from seeing each other's data or balances.

2. **Gemini 1.5 Flash Multimodal Vision:**
   - **ID Extraction & Biometrics:** Extracts Name, ID No., and Address from Philippine IDs (PhilSys, Driver's, Student ID) and matches face with live selfie in-memory (**RA 10173 Data Privacy Compliant**).
   - **Smart Check Risk Audit:** Audits custom conditions against the Philippine Civil Code (RA 386) to prevent disputes over sub-meters, curfews, or deposit refunds.
   - **Explain in Bisaya:** Translates formal English legal clauses into plain-language Bisaya text and audio for elderly landlords and students.

3. **Phygital Dual-Signing (Digital + Wet-Ink):**
   - **E-Signature:** Digitally signed on-screen under **RA 8792 (E-Commerce Act)**.
   - **Wet-Ink Ballpen:** 1-click printable copy with blank signature lines for physical signing under **Art. 1356 of the Philippine Civil Code**.
   - Includes official **Notarial Acknowledgment Block** for Barangay Lupon or court filings.

4. **Anti-Scam GCash Payment Verification:**
   - Landlord uploads their personal GCash QR Ph.
   - Tenant uploads transfer receipt screenshot; Gemini parses the Reference Number and Amount.
   - Landlord confirms via `[ ✅ YES, RECEIVED ]` after checking their own GCash balance.

5. **D'Morvie Contactless Key Handover:**
   - A unique 4-digit mailbox lockbox PIN (`🔑 5829`) is released digitally to the tenant upon verified payment, eliminating the need for physical meetups.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React
- **AI Engine:** Google Gemini 1.5 Flash Multimodal Vision
- **Cloud Ledger:** Google Apps Script Webhook syncing to Google Sheets
- **Legal Compliance:** RA 8792 (E-Commerce Act), RA 10173 (Data Privacy Act), RA 386 (Civil Code)
