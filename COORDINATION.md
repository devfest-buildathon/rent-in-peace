# COORDINATION.md

## 1. Project Summary
**Rent in Peace** is a software-only lease and payment-ledger web app for boarding houses built with React/Vite, Firebase Auth + Firestore, and Gemini AI. There is no hardware integration.

---

## 2. Ownership Map
Strict ownership boundaries are enforced. Exactly one owner per area; nobody edits another agent's area.

| Agent | Responsibility Areas | Owned Paths |
| :--- | :--- | :--- |
| **Agent A (Auth & Navigation)** | Login, registration, password strength, routing, and back button navigation | `src/auth/*`<br>`src/router/*` |
| **Agent B (Lease Flow & Access Code)** | Kasulatan creation, room code generation, payment verification, per-tenant access code, dashboard share link | `src/features/lease/*`<br>`src/features/verification/*` |
| **Agent C (Lease Templates)** | Preset library and clause editor | `src/features/lease-templates/*` |
| **Agent D (Gemini AI)** | AI service, Gemini API integration, and AI error handling | `src/services/ai/*` |

### Shared Files Policy
Shared files include:
- `firestore.rules`
- `package.json`
- `App.tsx` / `App.jsx`
- Shared types (`src/types/*` or shared global declarations)

**Rules for Shared Files:**
1. Only edit by adding your own clearly marked section (e.g. `// --- [Agent A] Start ---` ... `// --- [Agent A] End ---`).
2. Never rewrite, reorder, or reformat the entire file.
3. Always announce and log any changes to shared files in the Change Log below.

---

## 3. Rules for All Agents
1. **Mandatory Reading**: Read `COORDINATION.md` fully before starting any task and again before finishing.
2. **Strict Folder Boundaries**: Work **only** inside your designated owned folders. If you need a change, hook, or component in someone else's area, do **not** edit their files—write a `REQUEST` in the Requests section instead.
3. **No Hardcoded Values**: No fixed cities, names, PINs, dummy tokens, or fake fallback data. If an operation, lookup, or credential fails, show an explicit error and stop.
4. **Dependency Management**: Do not install, update, or remove dependencies in `package.json` without logging it in the Change Log.
5. **Preservation**: Never delete or overwrite another agent's code, tests, or comments.
6. **Task Completion Routine**: After finishing any task, immediately update your row in the **Status Board** and append your entry to the **Change Log**.

---

## 4. Status Board

| Agent | Task | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Agent A** | Auth & Navigation Setup | Done | Real passwords, strength meter, forgot password, history routing |
| **Agent B** | Lease Flow & Access Code | Done | Kasulatan saving, unique room codes, verification, crypto access codes, dashboard links |
| **Agent C** | Lease Templates | Done | Preset library, clause editor, live preview, custom placeholders |
| **Agent D** | Gemini AI Service | Done | Gemini 2.0 Flash integration, real errors with retry, zero fallbacks |

*Status options: `Not started` | `In progress` | `Blocked` | `Done`*

---

## 5. Requests Section
Use this section to request changes or hooks across ownership boundaries.

**Format**:
`FROM [agent] TO [agent]: what is needed, which function/file, status`

### Active & Historical Requests
- FROM Agent C TO Agent B: Exposed getPresetClauses(presetId) and renderLease(preset, values) in src/features/lease-templates for main lease flow, status: Ready
- *No other active requests currently.*

<!-- Template for new requests:
- FROM Agent B TO Agent C: Need updated parameter support in renderLease for custom payment schedules in src/features/lease-templates/renderer.ts, status: Pending
-->

---

## 6. Interfaces Section
The agreed function signatures that agents use to talk to each other:

### Lease Templates (Owned by Agent C, used by Agent B)
- `getPresetClauses(presetId)`: Retrieves clauses for a given preset.
- `renderLease(preset, values)`: Renders lease content from preset template and user-provided values.

### Gemini AI Service (Owned by Agent D, used by Agent C)
- `generateClause(prompt) -> {text}`: Generates a clause based on the prompt or throws a visible error on failure (no fallback dummy text).

### Lease Flow & Access Code (Owned by Agent B)
- `createRoomCode()`: Generates room code. Only called after the Kasulatan is saved.
- `getAccessCode(leaseId)`: Returns an access code only when status is `"verified"`. Must be enforced by Firestore rules or a Cloud Function.

---

## 7. Change Log

| Date | Agent | Files Changed | What Changed |
| :--- | :--- | :--- | :--- |
| 2026-11-14 | Coordinator | `COORDINATION.md`, `AGENTS.md` | Initialized coordination rules, ownership map, status board, interfaces, and agent instructions |
| 2026-11-14 | Agent A | `src/auth/passwordStrength.js`, `src/auth/PasswordStrengthMeter.jsx`, `src/auth/authService.js`, `src/router/navigation.js`, `src/screens/auth/LandlordAuthScreen.jsx`, `src/screens/auth/TenantAuthScreen.jsx` | Replaced PINs with Firebase Auth email/passwords, live strength meter, forgot password flow, and history routing |
| 2026-11-14 | Agent B | `src/features/lease/roomCode.js`, `src/features/verification/accessCode.js`, `src/screens/landlord/AllDoneScreen.jsx`, `src/screens/landlord/LandlordHomeScreen.jsx`, `src/screens/landlord/TenantDetailScreen.jsx`, `src/screens/tenant/TenantHomeScreen.jsx`, `src/screens/tenant/SuccessPinScreen.jsx`, `firestore.rules` | Enforced room code generation only post-Kasulatan, per-tenant secure random access codes, Firestore server-side security rule, and persistent dashboard share links |
| 2026-11-14 | Agent C | `src/features/lease-templates/presets.js`, `src/components/shared/PrintableContract.jsx`, `src/screens/landlord/BasicsFormScreen.jsx`, `src/screens/landlord/ReviewShareScreen.jsx` | Removed hardcoded CDO and Article 1356 enforceability claims; added strict validation blocking generation when required fields are missing |
| 2026-11-14 | Agent D | `src/services/ai/gemini.js`, `src/services/ai/index.js`, `src/lib/gemini.js`, `src/screens/landlord/KasulatanScreen.jsx`, `src/screens/landlord/SmartCheckScreen.jsx` | Integrated Gemini 2.0 Flash with real error handling and retry mechanism; deleted all fallback dummy text and mock clauses |
| 2026-11-14 | Agent C | `src/features/lease-templates/*`, `src/App.jsx`, `src/screens/landlord/SettingsScreen.jsx`, `src/screens/landlord/LandlordHomeScreen.jsx`, `firestore.rules` | Built full Customize Lease module: preset library (Bedspace, Room with CR, Apartment), bilingual clause editor, live preview modal, placeholder insertion/validation, and Gemini clause drafting |
