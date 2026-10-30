# Rent in Peace

> *"Good contracts make good neighbors."*

A mobile-first rental contract helper and tenancy manager designed specifically for small landlords, boarding house operators, and bedspace owners in Cagayan de Oro, Philippines.

---

## Run Locally

### Prerequisites
* **Node.js**: v20 or higher (v22/v24 recommended)
* **npm**: v10+

### Setup & Launch
```bash
# 1. Clone or open the repository
cd rent-in-peace

# 2. Copy the example environment file
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Run the development server
npm run dev
```

The Vite development server will start at `http://localhost:5173` (or the port specified by `$PORT`).

### Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL pointing to the backend API service | `http://localhost:3000/api` |

---

## How to Use (Step-by-Step Walkthrough)

1. **Sign Up or Sign In:**
   * Enter your name and 11-digit mobile number (e.g. `09171234567`).
   * Passwords require at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
   * Enable *"Save account on this device"* to bypass repeated logins on returning visits.
2. **Create a Rental Contract:**
   * From the Dashboard, tap **"Create a new contract"**.
   * Select a property type (e.g. *Boarding House / Bedspace*, *Apartment Unit*).
   * Enter the tenant's legal name, unit (e.g. `Room 3B`), monthly rent, deposit, and utilities (sub-meter electricity and water sharing).
3. **Review & Edit the Contract Paper:**
   * Review all agreed terms.
   * On the **Contract Preview** screen, view the contract rendered in universal Arial typography.
   * Tap **"Edit Paper"** to modify clause titles, customize house rules, or add new sections directly.
4. **Smart Check (Safety Review):**
   * Tap **"Smart Check"** to review recommendations tailored for Cagayan de Oro rentals (guest curfews, sub-meter billing deadlines, move-out notice periods).
   * Tap **"Add this clause"** to automatically insert safeguards into the lease.
5. **Save PDF & Share:**
   * Tap **"Save PDF"** to trigger a clean printout or save as PDF with all app UI stripped away via `@media print`.
   * Enable **Monthly Rent Reminders** to keep track of payment cycles on your dashboard.

---

## Status: What is Working & What is Not Connected Yet

### Currently Working (100% Functional in Frontend):
* Complete 16-screen interactive mobile flow (390px mobile-first with desktop interactive prototype switcher).
* Client-side form validation (Philippine 11-digit phone numbers, password complexity checks, letters-only name fields).
* Dynamic contract drafting with customizable clauses.
* Interactive in-browser contract paper editor.
* Save PDF stylesheet (`@media print`) rendering clean physical paper agreements.
* Local session persistence and contract storage via `localStorage`.
* Rent reminder toggles and payment record tracking per tenant.
* Automated ID masking (always hides sensitive ID characters, revealing only the last 4 digits).

### Not Connected Yet (Awaiting Backend Deployment):
* **OCR ID Scanner (`/id/read`):** The optical recognition service for automatic driver's license/PhilID extraction requires the backend service. When offline, the UI shows a clear *"Backend service is not connected yet"* state with a fallback to manual typing.
* **Backend AI Suggestions (`/contracts/check`):** Smart Check currently utilizes built-in local community rules while awaiting the cloud AI endpoint.
* **Cloud Database Sync (`/leases`, `/tenants`):** Lease records are saved locally; server-side database syncing will activate once the backend endpoint is reached.
* **Google OAuth Sign-In:** Displays an honest connection alert until the backend auth exchange is configured.

---

## Privacy & Security

* **No Biometric or ID Photo Storage:** Government ID photos uploaded for scanning are processed in memory and are **never saved** to persistent storage or local caches.
* **Automatic ID Masking:** Identification numbers are strictly masked across all screens (e.g. `•••• •••• 9201`), showing only the last 4 characters.
* **No Secrets in Code:** Zero hardcoded API keys or secrets in the client codebase. The only configuration is `VITE_API_BASE_URL`.
* **Tenant Independence:** Tenants are not forced to register accounts or install apps; they receive clean, portable PDF summaries.

---

## File Tree & Purpose

```text
rent-in-peace/
├── .env.example                     # Sample environment file (VITE_API_BASE_URL)
├── .gitignore                       # Git ignore rules for node_modules, dist, and env files
├── package.json                     # Scripts and project dependencies
├── package-lock.json                # Single deterministic npm lockfile
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler configuration with React and Tailwind CSS
├── src/
│   ├── main.tsx                     # Application entry point
│   ├── App.tsx                      # Navigation coordinator and responsive prototype shell
│   ├── index.css                    # Tailwind CSS v4 directives, responsive rules, and print styles
│   ├── vite-env.d.ts                # Vite environment type declarations
│   ├── api/
│   │   ├── client.ts                # HTTP fetch client using VITE_API_BASE_URL
│   │   ├── leaseApi.ts              # Typed API methods (readIdPhoto, checkContract, saveLease, etc.)
│   │   └── API.md                   # Formal API specification for backend teammate
│   ├── assets/
│   │   ├── logo.svg                 # SVG brand mark
│   │   └── fonts/
│   │       ├── OFL.txt              # SIL Open Font License v1.1
│   │       └── README.md            # Font documentation (Inter & Arial)
│   ├── components/
│   │   ├── index.ts                 # Re-export barrel for components
│   │   ├── Icons.tsx                # SVG icon dictionary
│   │   ├── Logo.tsx                 # Brand monogram and logotype
│   │   ├── Button.tsx               # Accessible button supporting primary, secondary, soft, danger
│   │   ├── Input.tsx                # Field, SelectField, AuthInput, and Section components
│   │   ├── Card.tsx                 # MiniCard, SelectCard, TenantCard, and ReminderCard
│   │   ├── Chip.tsx                 # Status indicator chips
│   │   ├── Banner.tsx               # Informational alert banners
│   │   ├── Stepper.tsx              # 4-stage wizard progress stepper
│   │   ├── TopBar.tsx               # Header with back navigation and contextual actions
│   │   ├── TabBar.tsx               # Fixed mobile bottom navigation
│   │   └── ContractSheet.tsx        # Printable Arial lease document with live editing
│   ├── hooks/
│   │   ├── useNotice.ts             # Toast notification state and auto-dismiss timer
│   │   └── useLocalStorage.ts       # Type-safe browser storage hook
│   ├── lib/
│   │   ├── formatters.ts            # Currency (₱), date, ID masking, and form validation
│   │   └── constants.ts             # Property types, default clauses, and disclaimer
│   ├── screens/
│   │   ├── index.ts                 # Re-export barrel for screens
│   │   ├── Welcome.tsx              # Landing screen with value proposition
│   │   ├── SignIn.tsx               # Mobile + password login with "remember me"
│   │   ├── SignUp.tsx               # Account creation with validation rules
│   │   ├── Dashboard.tsx            # Landlord home, upcoming rent, quick actions
│   │   ├── PropertyType.tsx         # Property category selection
│   │   ├── ContractDetails.tsx      # Comprehensive lease terms form
│   │   ├── IdScan.tsx               # Government ID photo reader with honest status
│   │   ├── Review.tsx               # Pre-generation summary review
│   │   ├── ContractPreview.tsx      # In-browser contract viewer and paper editor
│   │   ├── SmartCheck.tsx           # AI-powered clause suggestion cards
│   │   ├── Success.tsx              # Confirmation, print trigger, reminder link
│   │   ├── MyTenants.tsx            # Searchable and filterable tenant list
│   │   ├── TenantDetail.tsx         # Individual tenancy record, history, and options
│   │   ├── PrivacyHelp.tsx          # Privacy guarantees and landlord FAQ
│   │   ├── AccountSettings.tsx      # Profile settings and sign-out controls
│   │   └── RentReminders.tsx        # Monthly reminder management
│   └── types/
│       ├── index.ts                 # Re-export barrel for types
│       ├── contract.ts              # ContractData, PropertyType, Suggestion definitions
│       ├── user.ts                  # UserProfile definition
│       └── api.ts                   # Request/response interfaces for backend API
├── tests/
│   └── smoke.test.ts                # Smoke tests for formatting, masking, and contract logic
└── .hackathon/
    ├── QA.md                        # Verification results, fixes, and limitations
    ├── DEMO.md                      # 2-minute live presentation script and fallback plan
    └── screenshots/
        └── README.md                # Viewport and breakpoint documentation (375, 390, 1440px)
```

---

## Verification & Test Results

* **TypeScript Type Check (`npx tsc --noEmit`):**
  * `0 errors`, `0 warnings`.
* **Production Build (`npm run build`):**
  * Built successfully in `~500ms` with 50 transformed modules.
* **Automated Smoke Test (`npm test`):**
  * `6 / 6` tests passing:
    * `formatPesos` formats currency accurately
    * `maskIdNumber` protects personal identification numbers
    * `validateName` ensures valid legal names without numbers
    * `validateMobile` checks 11-digit Philippine mobile format
    * `validatePassword` enforces 8+ chars, upper, lower, number, special char
    * `contract flow` generates valid initial sections without mock data

---

## Credits & AI Disclosure

* **Design & Prototyping:** Scaffolded with Figma Make.
* **Development & Refactoring:** Pair-programmed and vibe-coded with Google DeepMind's **Antigravity**.
* **Typography:**
  * Inter: Rasmus Andersson (Licensed under SIL Open Font License v1.1).
  * Arial: Universal system font for reliable cross-device physical document printing.
* **Compliance Statement:** *"Template for review, not legal advice."*
