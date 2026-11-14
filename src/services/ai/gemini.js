// Gemini AI Service - Owned by Agent D per COORDINATION.md
function getGeminiApiKey() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('VITE_GEMINI_API_KEY') || window.localStorage.getItem('gemini_api_key');
    if (stored && stored.trim()) return stored.trim();
  }
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
         (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) || "";
}

// Supported models from the active project quota in priority order:
// 1. Gemini 3.5 Flash Lite (500 RPD, 15 RPM)
// 2. Gemini 3.1 Flash Lite (500 RPD, 15 RPM)
// 3. Gemini 3 Flash Preview (20 RPD, 5 RPM)
// 4. Gemini Flash Lite Latest / Flash Latest
const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-flash-lite-latest",
  "gemini-flash-latest"
];

/**
 * Execute a Gemini generateContent request across the prioritized models.
 * If a model encounters a rate limit (429) or transient error, automatically cascades
 * to the next model in the list. Throws clearly if all attempts fail.
 */
async function callGeminiApi(requestBody) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.');
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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

/**
 * Generate a complete Kasulatan sa Pag-abang from scratch with Gemini AI
 * strictly sized and formatted to fit onto a single A4 bond paper (6 to 8 concise clauses).
 */
export async function generateFullKasulatan(requirements, context = {}) {
  if (!requirements || !requirements.trim()) {
    throw new Error('Please describe the property, house rules, or terms you want in the Kasulatan.');
  }

  const systemInstruction = `You are an expert legal drafting assistant specializing in Philippine residential leases (Kasulatan sa Pag-abang) compliant with Republic Act 386 (Civil Code of the Philippines) and the Rent Control Act.
The landlord wants you to generate a COMPLETE, legally balanced, custom Kasulatan from scratch based on their property details and specific rules.

CRITICAL FORMATTING & LAYOUT REQUIREMENT (A4 BOND PAPER FIT):
The entire contract will be printed on a SINGLE PAGE A4 BOND PAPER.
To prevent multi-page overflow:
1. Generate EXACTLY 6 to 8 concise, well-structured clauses:
   - Clause 1: Contracting Parties & Demised Premises (Lessor, Lessee, Unit, Property Location)
   - Clause 2: Rental Payment & Due Date (Monthly fee, due day, payment method)
   - Clause 3: Security Deposit & Advance Rent (Deposit terms, deduction/refund terms)
   - Clause 4: Utilities & Operating Arrangements (Electricity, water, sub-meter or shared split)
   - Clause 5: House Rules, Curfew & Visitors (Directly incorporating landlord's rules)
   - Clause 6: Care of Premises & Peaceful Living (Maintenance, cleanliness, prohibited acts)
   - Clause 7: Move-Out Notice & Turnover (Written notice duration, clearance inspection)
2. BREVITY: Keep each clause concise: 2 to 3 sentences max, under 35-40 words per language.
3. BILINGUAL: Provide BOTH professional English AND natural Bisaya (Sinugbuanong Binisaya) for EVERY clause.
4. INCORPORATE LANDLORD REQUESTS: Directly integrate the landlord's specific rules, restrictions, and instructions.
5. NO UNVERIFIED CLAIMS: Do not claim clauses are "legally enforceable without exception" or cite bogus legal articles.
6. OUTPUT SCHEMA: Return ONLY valid JSON matching this exact structure:
{
  "title": "Kasulatan sa Pag-abang",
  "summary": "Brief 1-sentence overview of generated agreement",
  "clauses": [
    {
      "num": 1,
      "title": "Parties and Leased Premises",
      "english": "Concise clause text in English...",
      "bisaya": "Mubo nga hubad sa Sinugbuanong Binisaya..."
    }
  ]
}`;

  const userContent = `Landlord Requirements: "${requirements.trim()}"
Rental Context:
- Landlord Name: ${context.landlordName || '[Lessor Name]'}
- Unit / Identifier: ${context.roomNumber || '[Room/Unit]'}
- Location / Address: ${context.propertyAddress || '[Property Address]'}
- Property Type: ${context.propertyType || 'Boarding House / Bedspace'}
- Monthly Rent: ₱${context.monthlyRent || '0'}
- Advance / Deposit: Adv ₱${context.advanceRent || '0'} / Dep ₱${context.deposit || '0'}
- Lease Duration: ${context.leaseDuration || '6 months'}

Generate the 6-8 bilingual A4-fitted clauses now:`;

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
  if (!rawText) throw new Error('Gemini API returned an empty response. Please retry.');
  const cleanJson = rawText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
  const parsed = JSON.parse(cleanJson);
  if (!parsed.clauses || !Array.isArray(parsed.clauses) || parsed.clauses.length === 0) {
    throw new Error('Gemini returned an invalid contract structure.');
  }

  // Format into standard clause schema with combined text for backward compatibility
  const formattedClauses = parsed.clauses.map((c, idx) => {
    const num = c.num || idx + 1;
    const cleanTitle = (c.title || `Clause ${num}`).replace(/^\d+\.\s*/, '');
    const titleWithNum = `${num}. ${cleanTitle}`;
    return {
      num,
      title: titleWithNum,
      english: c.english || '',
      bisaya: c.bisaya || '',
      text: c.english || c.bisaya || '',
      custom: true,
      isCustom: true
    };
  });

  return {
    title: parsed.title || 'Kasulatan sa Pag-abang',
    summary: parsed.summary || 'Custom generated bilingual lease agreement',
    clauses: formattedClauses
  };
}
