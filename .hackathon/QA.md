# Quality Assurance (QA) Report

## Project: Rent in Peace (Frontend)
**Date:** October 30, 2026  
**Target:** Mobile-First Responsive Web Application (390px base, tested from 320px to 1440px)

---

## 1. Commands Run & Results

| Command | Purpose | Result |
| :--- | :--- | :--- |
| `npx tsc --noEmit` | TypeScript type-checking across all components, screens, and types | **PASS** (0 errors, 0 warnings) |
| `npm run build` | Vite production asset bundling | **PASS** (50 modules transformed, build time ~500ms) |
| `npm test` | Automated smoke tests for formatters, validation, and contract generation | **PASS** (6/6 tests passing) |

---

## 2. Issues Fixed During Refactor

1. **Monolithic Codebase (`src/App.tsx`):**
   * *Before:* 2,808 lines in a single file housing all components, screens, constants, and models.
   * *After:* Clean, modular structure separating `components/`, `screens/`, `hooks/`, `lib/`, `api/`, `types/`, and `assets/`. `src/App.tsx` is now only 240 lines dedicated to layout and navigation.

2. **TypeScript Property Errors TS2322 in `Button`:**
   * *Before:* `<Button>` received inline `style={{ ... }}` causing TypeScript compile errors at lines 2259 and 2290.
   * *After:* Extended `ButtonProps` to accept `style?: CSSProperties`, `className?: string`, and dedicated `variant="danger"`, removing unsafe hacks.

3. **Leftover Hardcoded Mock Data (Hard Rule 5):**
   * *Before:* Hardcoded mock identity "Juan Carlos Ramos" and "CRN-1984-2849201" in the ID scanner, plus fake landlord credentials `{ name: "Landlord", mobile: "09170000000" }` in Google Sign-In.
   * *After:* Removed all hardcoded fixtures. The app starts with clean empty states. "Continue with Google" and "Scan ID" interact with the typed API layer and display honest "not connected yet" messaging when backend services are offline.

4. **Data Privacy & ID Masking (Hard Rule 6):**
   * *Before:* Government identification numbers were exposed as plain text in contract review and previews.
   * *After:* Added `maskIdNumber()` helper. All displayed identification numbers show only the last 4 characters (e.g. `•••• •••• 9201`).

5. **Legal & Compliance Claims (Hard Rule 8):**
   * *Before:* Inconsistent wording on contracts.
   * *After:* Unified across all screens to explicitly state: `"Template for review, not legal advice."`

6. **Lockfile & Git Hygiene:**
   * Removed conflicting `pnpm-lock.yaml` (since system environment uses `npm` v11.9.0 and `package-lock.json`).
   * Updated `.gitignore` with comprehensive rules for `node_modules`, `dist`, `.env*`, OS files, and editor caches.
   * Added `.env.example` defining `VITE_API_BASE_URL`.

---

## 3. Responsive & Print Verification

* **Mobile Viewports (320px, 360px, 375px, 390px, 430px):**
  * Fluid horizontal constraints ensure zero horizontal overflow (`overflow-x: hidden`).
  * Inputs and buttons adhere to mobile touch targets (min 44px–50px height).
* **Tablet & Desktop (768px, 1440px):**
  * Desktop presentation centers the mobile phone frame alongside an interactive screen navigation switcher.
* **Print Support:**
  * `@media print` rule hides application headers, mobile shell navigation, action toolbars, and toasts. Only the formatted, Arial-styled contract paper is printed.

---

## 4. Known Limitations & Backend Dependencies

1. **Backend Integration:**
   * OCR ID reading (`/id/read`), AI Smart Check suggestion generation (`/contracts/check`), and server-side lease persistence (`/leases`) require an active HTTP backend as defined in `src/api/API.md`.
   * When `VITE_API_BASE_URL` is unconfigured or unreachable, the frontend displays clear, user-friendly offline notifications.
2. **Local Session Persistence:**
   * Landlord profiles, contracts, and reminder preferences are saved to client-side `localStorage` until the backend database synchronization is connected.
