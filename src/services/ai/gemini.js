// Gemini AI Service - Owned by Agent D per COORDINATION.md
const GEMINI_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) || "";

// Supported models from the active project quota in priority order:
// 1. Gemini 3.5 Flash Lite (500 RPD, 15 RPM)
// 2. Gemini 3.1 Flash Lite (500 RPD, 15 RPM)
// 3. Gemini 3 Flash Preview (20 RPD, 5 RPM)
const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview"
];

/**
 * Execute a Gemini generateContent request across the prioritized models.
 * If a model encounters a rate limit (429) or transient error, automatically cascades
 * to the next model in the list. Throws clearly if all attempts fail.
 */
async function callGeminiApi(requestBody) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.');
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        const data = await res.json();
        return { model, data };
      }

      const errorBody = await res.text();
      let detail = errorBody;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed?.error?.message) {
          detail = parsed.error.message;
        }
      } catch (_) {}

      lastError = new Error(`Gemini API Error [${model}] (${res.status}): ${detail}`);
      console.warn(`[Gemini AI] Model ${model} returned ${res.status}: ${detail}. Trying next model...`);
    } catch (networkErr) {
      lastError = networkErr;
      console.warn(`[Gemini AI] Network error on model ${model}: ${networkErr.message}. Trying next model...`);
    }
  }

  throw lastError || new Error('All configured Gemini models failed to respond.');
}

/**
 * Generate or customize a contract clause using Google Gemini API.
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

  const { data } = await callGeminiApi({
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
  });

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
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

  const { data } = await callGeminiApi({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return [];

  const cleanJson = rawText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleanJson);
}
