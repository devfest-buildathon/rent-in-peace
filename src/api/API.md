# Backend API Specification for Rent in Peace

This document specifies the HTTP endpoints that the frontend expects from the backend service. All endpoints should be prefixed with the base path defined in `VITE_API_BASE_URL` (e.g. `http://localhost:3000/api`).

---

## 1. Read Government ID Photo
Extracts text from an uploaded Philippine government ID or driver's license.

* **Endpoint:** `POST /id/read`
* **Content-Type:** `multipart/form-data`
* **Request Body:**
  * `image`: File (JPEG, PNG, or WebP photo of the ID card)
* **Response:** `200 OK`
```json
{
  "name": "Full Legal Name",
  "address": "Zone or Barangay, City",
  "idType": "PhilID / Driver's License / UMID",
  "idNumber": "CRN-0000-0000000"
}
```
* **Privacy Note:** The server must process the image in memory and discard the photo immediately after optical recognition. Do not persist biometric photos or full ID cards to disk.

---

## 2. Check Contract & Suggest Clauses (Smart Check)
Analyzes draft lease terms and returns recommended community clauses (e.g. quiet hours, sub-meter billing policies, move-out notice periods).

* **Endpoint:** `POST /contracts/check`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "contract": {
    "propertyType": "Boarding House / Bedspace",
    "roomUnit": "Room 2B",
    "monthlyRent": "3500",
    "dueDate": "Every 5th",
    "electricityType": "Sub-meter",
    "waterType": "Shared split",
    "houseRules": "Quiet hours from 10 PM."
  }
}
```
* **Response:** `200 OK`
```json
{
  "suggestions": [
    {
      "id": "sug-1",
      "title": "Utility billing payment window",
      "body": "Clear timelines for settling sub-meter electricity or water bills avoid compounding arrears.",
      "clauseText": "Utility bills must be settled within 5 calendar days of presentation."
    }
  ]
}
```

---

## 3. Explain Contract Terms
Generates a simplified, plain-language summary of standard lease clauses for tenants and boarding house owners.

* **Endpoint:** `POST /contracts/explain`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "contract": {
    "monthlyRent": "3500",
    "securityDeposit": "3500",
    "duration": "6 months"
  },
  "language": "english"
}
```
* **Response:** `200 OK`
```json
{
  "summary": "This lease covers a 6-month stay at ₱3,500/month with one month deposit.",
  "keyPoints": [
    "Rent is due on the 5th of each month.",
    "Deposit is returned upon move-out after room inspection and utility settlement.",
    "30 days notice required before leaving."
  ]
}
```

---

## 4. Save Lease Summary
Stores minimal, non-sensitive rental records for reminders and bookkeeping.

* **Endpoint:** `POST /leases`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "lease": {
    "unit": "Room 4B",
    "rent": 3500,
    "date": "2026-11-01",
    "status": "active"
  }
}
```
* **Response:** `200 OK`
```json
{
  "success": true,
  "lease": {
    "id": "lease-8812",
    "unit": "Room 4B",
    "rent": 3500,
    "date": "2026-11-01",
    "status": "active"
  }
}
```

---

## 5. List Leases / Tenants
Returns non-sensitive metadata for active and upcoming tenancies.

* **Endpoint:** `GET /tenants`
* **Response:** `200 OK`
```json
{
  "tenants": [
    {
      "id": "lease-8812",
      "unit": "Room 4B",
      "rent": 3500,
      "date": "2026-11-01",
      "status": "active"
    }
  ]
}
```

---

## Standard Error Response
In case of validation failures or missing services:
```json
{
  "error": "Detailed description of the issue."
}
```
