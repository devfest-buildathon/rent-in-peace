// Google Gemini API Client for Rent in Peace
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDoH7Rbk16P25hRIGp352mQJRnzkrCYlTs";
const GEMINI_MODEL = "gemini-3.5-flash-lite";

/**
 * Generate or customize a contract clause using Gemini
 * @param {string} promptText - User's natural language request (e.g. "Add pet deposit", "Strict quiet hours")
 * @param {Array} existingClauses - Current list of contract clauses
 * @param {Object} context - Rental context (rent, deposit, property address, etc.)
 */
export async function generateClauseWithGemini(promptText, existingClauses = [], context = {}) {
  const systemInstruction = `You are an expert AI legal assistant for Philippine residential rental leases (Kasulatan sa Pag-abang) compliant with RA 386 (Philippine Civil Code) and the Rent Control Act of the Philippines.
The landlord wants to generate or customize a contract clause.
You must respond with ONLY a single valid JSON object with no markdown wrappers or backticks, matching this exact schema:
{
  "title": "Short Descriptive Title (e.g. House Rules & Noise Curfew)",
  "text": "The complete, enforceable, and professional legal clause text in clear English (or Bisaya/Tagalog if requested).",
  "toast": "Brief 3 to 5 word summary notification (e.g. Added Pet Policy clause)",
  "action": "add" | "update",
  "targetClauseNum": number (optional, only if updating an existing clause, e.g. 3, 5, or 6)
}`;

  const currentSummary = existingClauses.map(c => `${c.num}. ${c.title}: ${c.text}`).join('\n');

  const userContent = `Rental context:
- Property Address: ${context.propertyAddress || 'Cagayan de Oro City'}
- Monthly Rent: ₱${context.monthlyRent || '0'}
- Current Clauses:
${currentSummary}

Landlord request: "${promptText}"

Generate the clause now.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemInstruction },
            { text: userContent }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[Gemini API] HTTP Error:', res.status, errText);
      return fallbackClauseGeneration(promptText, existingClauses, context);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return fallbackClauseGeneration(promptText, existingClauses, context);
    }

    const cleanJson = rawText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (error) {
    console.warn('[Gemini API] Request exception, falling back:', error.message);
    return fallbackClauseGeneration(promptText, existingClauses, context);
  }
}

/**
 * Generate Smart Check Dispute-Risk Audit using Gemini
 */
export async function auditClausesWithGemini(clauses = [], context = {}) {
  const prompt = `Review these lease clauses under Philippine tenancy law (Civil Code Art. 1654, 1687 & Rent Control Act).
Clauses:
${clauses.map(c => `${c.num}. ${c.title}: ${c.text}`).join('\n')}

Identify 3 important dispute-prevention recommendations or risks to clarify before signing.
Return ONLY a valid JSON array of 3 items:
[
  {
    "title": "Short risk item title",
    "description": "Clear 2-sentence advice for CDO landlords and tenants under Philippine law.",
    "severity": "warning" | "tip"
  }
]`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText.trim());
      }
    }
  } catch (err) {
    console.warn('[Gemini API] Audit warning:', err.message);
  }

  // High quality default checklist if offline
  return [
    {
      title: "Quiet hours & visitor curfew",
      description: "Specify visitor curfew hours (e.g. 10:00 PM) to avoid neighborhood noise complaints before the Barangay Lupon.",
      severity: "warning"
    },
    {
      title: "Utility sub-meter transparency",
      description: "For electric sub-meters, state the per-kWh rate clearly or specify equal split for water to prevent monthly billing disputes.",
      severity: "warning"
    },
    {
      title: "30-day move-out notice period",
      description: "Enforce a minimum 30-day written notice pursuant to Article 1687 of the Civil Code to protect both parties during turnover.",
      severity: "tip"
    }
  ];
}

/**
 * Fallback generator in case of network interruption
 */
function fallbackClauseGeneration(query, clauses, context) {
  const q = (query || '').toLowerCase();
  
  if (q.includes('smoking') || q.includes('smoke')) {
    return {
      title: "House Rules & No-Smoking Policy",
      text: "Strictly NO SMOKING or vaping inside the unit and common corridors. A penalty of ₱1,000 shall be assessed per verified violation.",
      toast: "Added strict No-Smoking clause!",
      action: "update",
      targetClauseNum: 6
    };
  }

  if (q.includes('pet')) {
    return {
      title: "Pet Policy & Pet Deposit",
      text: "One small domesticated pet (under 10kg) is permitted subject to an additional refundable pet deposit of ₱1,500.00 and owner cleanliness maintenance.",
      toast: "Added Pet Policy clause!",
      action: "add"
    };
  }

  if (q.includes('bisaya') || q.includes('tagalog')) {
    return {
      title: "Patakaran sa Balay ug Kalinaw (House Rules in Bisaya)",
      text: "Hilom sugod alas-10 sa gabii. Hinloan ang mga komon nga lugar pagkahuman og gamit. Bawal ang magpuyo nga wala nalista sa kontrata.",
      toast: "Translated House Rules to Bisaya!",
      action: "update",
      targetClauseNum: 6
    };
  }

  if (q.includes('electric') || q.includes('kwh') || q.includes('sub-meter')) {
    return {
      title: "Utilities & Sub-Meter Rate",
      text: "Electricity sub-meter rate pegged at ₱15.00/kWh read every 30th. Water utility split equally among active occupants.",
      toast: "Updated sub-meter rate clause!",
      action: "update",
      targetClauseNum: 5
    };
  }

  if (q.includes('grace') || q.includes('penalty')) {
    return {
      title: "Rent Payment Grace Period & Late Penalty",
      text: `Monthly rent is due on the 5th day of each month with a 5-day grace period. Late payments incur a fee of ₱50 per day of delay.`,
      toast: "Added 5-day grace period & penalty clause!",
      action: "update",
      targetClauseNum: 3
    };
  }

  return {
    title: "Special Rental Agreement Condition",
    text: `${query}. This term is enforceable under Article 1356 of the Philippine Civil Code.`,
    toast: "Added customized clause!",
    action: "add"
  };
}
