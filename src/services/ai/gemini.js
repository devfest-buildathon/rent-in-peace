// Gemini AI Service - Owned by Agent D per COORDINATION.md
const GEMINI_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || "";
const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Generate or customize a contract clause using Google Gemini API
 * Strictly throws on failure. Does not insert fake/mock/fallback text or unsupported legal claims.
 * 
 * @param {string} promptText - Landlord request (e.g. "Add pet deposit", "Strict quiet hours")
 * @param {Array} existingClauses - List of current clauses
 * @param {Object} context - Rental context (rent, deposit, property address)
 * @returns {Promise<{title: string, text: string, toast: string, action: string, targetClauseNum?: number}>}
 */
export async function generateClause(promptText, existingClauses = [], context = {}) {
  if (!promptText || !promptText.trim()) {
    throw new Error('Clause prompt cannot be empty.');
  }

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.');
  }

  const systemInstruction = `You are a professional legal drafting assistant for Philippine residential rental leases (Kasulatan sa Pag-abang) compliant with RA 386 (Civil Code of the Philippines) and the Rent Control Act.
Draft or revise the requested lease clause in clear, enforceable Philippine legal English.
Do NOT make unverified claims of enforceability under specific articles (e.g. do NOT say "this term is enforceable under Article 1356").
Respond with ONLY a single valid JSON object with NO markdown code fences or backticks:
{
  "title": "Short Descriptive Title",
  "text": "The complete legal clause text.",
  "toast": "Brief notification summary (3-5 words)",
  "action": "add" | "update",
  "targetClauseNum": number (optional, only if modifying an existing numbered clause)
}`;

  const currentSummary = existingClauses.map(c => `${c.num}. ${c.title}: ${c.text}`).join('\n');
  const userContent = `Rental context:
- Property Address: ${context.propertyAddress || 'Specified Leased Premises'}
- Monthly Rent: ₱${context.monthlyRent || '0'}
- Current Clauses:
${currentSummary}

Landlord request: "${promptText.trim()}"

Generate clause now:`;

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
        temperature: 0.2
      }
    })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let detail = errorBody;
    try {
      const parsedErr = JSON.parse(errorBody);
      if (parsedErr?.error?.message) {
        detail = parsedErr.error.message;
      }
    } catch (_) {}
    throw new Error(`Gemini API Error (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned an empty response. Please retry.');
  }

  try {
    const cleanJson = rawText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    throw new Error(`Failed to parse AI clause response: ${err.message}`);
  }
}

/**
 * Perform Smart Check dispute audit on clauses
 */
export async function auditClauses(clauses = [], context = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured for Smart Check audit.');
  }

  const prompt = `Review these lease clauses under Philippine tenancy law (Civil Code Art. 1654, 1687 & Rent Control Act).
Property Location: ${context.propertyAddress || 'Philippines'}
Clauses:
${clauses.map(c => `${c.num}. ${c.title}: ${c.text}`).join('\n')}

Identify 3 important dispute-prevention recommendations or risks to clarify before signing.
Return ONLY a valid JSON array of 3 items:
[
  {
    "title": "Short risk item title",
    "description": "Clear 2-sentence advice for landlords and tenants under Philippine law.",
    "severity": "warning" | "tip"
  }
]`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Audit Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return [];

  const cleanJson = rawText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleanJson);
}
