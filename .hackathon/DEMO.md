# Rent in Peace — 2-Minute Live Pitch Demo Script

**Target Audience:** GDG CDO Buildathon Judges & Community  
**Total Time:** 2 Minutes (120 Seconds)  
**Theme:** "Good contracts make good neighbors."

---

## Script & Step-by-Step Walkthrough

### 0:00 – 0:20: The Hook & Welcome Screen
* **Action:** Start on the **Welcome screen** (Screen 01).
* **Say:** 
  > *"In Cagayan de Oro, thousands of small landlords and boarding house owners manage rooms using verbal agreements or outdated paper forms. When misunderstandings happen over utilities or deposits, relationships sour. We built **Rent in Peace**—a mobile-first contract assistant that creates clear, fair agreements in minutes."*
* **Action:** Click **"Create free account"** or **"I already have an account"** (Screen 02 / 03).
* **Say:** 
  > *"Landlords can sign in using their mobile number. No tenant needs to download any app."*

---

### 0:20 – 0:45: Rapid Guided Contract Creation
* **Action:** From the **Dashboard** (Screen 04), tap **"Create a new contract"**.
* **Action:** Select **"Boarding House / Bedspace"** (Screen 05), then click **"Continue"**.
* **Action:** On **Contract Details** (Screen 06):
  * Enter Tenant Name: `Maria Santos`
  * Unit: `Room 3B`
  * Monthly Rent: `3500`
* **Say:** 
  > *"The landlord enters simple terms: rent, deposit, start date, and utility arrangements like sub-meter electricity or shared water."*
* **Action:** Show the **"Scan tenant's ID"** button (Screen 07).
  * *If backend OCR is connected:* Upload sample ID to auto-populate fields.
  * *If backend is unreachable:* Tap **"Type details manually instead"**. 
  * **Say:** 
    > *"For privacy, government ID photos are never stored on the server—they are processed in memory and ID numbers are always masked to the last 4 digits."*

---

### 0:45 – 1:15: Review & In-Browser Contract Paper Editor
* **Action:** Tap **"Review details"** (Screen 08) to show summary.
* **Action:** Tap **"Looks good, create contract"** to enter **Contract Preview** (Screen 09).
* **Say:** 
  > *"Rent in Peace generates a formal agreement formatted in universal Arial for clean printing and signing. But unlike rigid forms, landlords have full freedom."*
* **Action:** Tap **"Edit Paper"**.
  * Modify a clause title or click **"Add custom clause"**.
  * Tap **"Save Edits"**.
* **Say:** 
  > *"Every landlord's house rules are unique. They can tailor terms directly on the paper."*

---

### 1:15 – 1:40: Smart Check (AI Clause Safeguards)
* **Action:** Tap **"Smart Check"** (Screen 10).
* **Say:** 
  > *"Before signing, Smart Check reviews the contract for common community disputes in CDO—such as quiet hours, visitor curfews, and sub-meter payment windows."*
* **Action:** Click **"Add this clause"** on *Utility payment clarity*.
* **Action:** Tap **"Apply selected clauses"** (Returns to Contract Preview with the new terms inserted).
* **Action:** Tap **"Finish & Sign"** (Screen 11).

---

### 1:40 – 2:00: Success, Reminders & Closing
* **Action:** Show the **Success screen** (Screen 11).
* **Say:** 
  > *"The contract is ready! The landlord can tap 'Save PDF' to print physical copies or share the PDF directly via messenger."*
* **Action:** Tap **"Add rent reminder"** or navigate to **"My Tenants"** (Screen 12) and **"Rent Reminders"** (Screen 16).
* **Say:** 
  > *"Rent reminders keep track of upcoming payments without sending unsolicited automated spam to tenants. Landlords stay in control. Rent in Peace: good contracts make good neighbors. Thank you!"*

---

## Contingency Plan: What to Do If the Backend is Unreachable

1. **OCR ID Scanning:**
   * If `VITE_API_BASE_URL` is offline, the ID Scan screen displays: *"Backend service is not connected yet."*
   * **Demo Pivot:** Simply click **"Type details manually instead"**. This shows robustness and real validation handling without interrupting the pitch.
2. **AI Smart Check:**
   * Smart Check falls back to built-in local community rules (guest policies, utility deadlines, move-out notice periods), allowing full demonstration of clause injection without needing cloud network access.
3. **Local Storage:**
   * All contracts and tenant records work 100% offline via local storage, ensuring zero risk of demo crashes on stage.
