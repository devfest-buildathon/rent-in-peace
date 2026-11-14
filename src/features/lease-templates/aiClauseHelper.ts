export const AI_DISCLAIMER_NOTE =
  'The landlord is responsible for reviewing all clauses. Rent in Peace and AI assistance do not claim or guarantee legal enforceability, and this does not constitute legal advice.';

export interface GeneratedClauseDraft {
  title: string;
  english: string;
  bisaya: string;
}

// Supported models from the active project quota in priority order:
// 1. Gemini 3.5 Flash Lite (500 RPD, 15 RPM)
// 2. Gemini 3.1 Flash Lite (500 RPD, 15 RPM)
// 3. Gemini 3 Flash Preview (20 RPD, 5 RPM)
// 4. Gemini 2.5 Flash / 2.0 Flash / 1.5 Flash (General Availability fallbacks)
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Suggests a bilingual (English / Bisaya) lease clause from a landlord's plain text prompt.
 * Conforms strictly to requirements:
 * - Never claims any clause is "legally enforceable"
 * - Does not cite laws as proof of validity
 * - If the call fails, throws a clear error (never returns fake or fabricated fallback text)
 */
export async function suggestClauseWithGemini(userPrompt: string): Promise<GeneratedClauseDraft> {
  const trimmed = userPrompt?.trim();
  if (!trimmed) {
    throw new Error('Please enter a description of the clause you want to draft.');
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please check VITE_GEMINI_API_KEY in your environment.');
  }

  const systemInstruction = `You are a helpful drafting assistant for residential rental leases (Kasulatan sa Pag-abang) in the Philippines.
The landlord wants to draft a custom lease clause.
Generate a clear, respectful, and balanced clause in both English and Bisaya (Cebuano).

CRITICAL CONSTRAINTS:
1. Do NOT claim that any clause is "legally enforceable" or "guaranteed under the law".
2. Do NOT cite laws, statutes, or civil code articles as proof of legal enforceability.
3. You may use standard placeholders where appropriate: {{tenant_name}}, {{landlord_name}}, {{unit}}, {{rent}}, {{deposit}}, {{advance}}, {{property_address}}, {{due_day}}, {{lease_duration}}.
4. Return ONLY a single raw JSON object with no markdown fences, matching this exact schema:
{
  "title": "Short descriptive clause title (e.g. Quiet Hours & Visitors)",
  "english": "The clause text in clear professional English.",
  "bisaya": "The accurate translation of the clause text in conversational Bisaya (Cebuano)."
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: systemInstruction },
          { text: `Landlord's request for clause:\n"${trimmed}"\n\nGenerate the bilingual clause JSON now.` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  };

  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new Error('Gemini API returned an empty response. Please retry.');
        }

        const cleanJson = candidateText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (!parsed.title || (!parsed.english && !parsed.bisaya)) {
          throw new Error('Incomplete clause structure received from AI.');
        }
        return {
          title: parsed.title.trim(),
          english: (parsed.english || '').trim(),
          bisaya: (parsed.bisaya || '').trim()
        };
      }

      const errorText = await response.text();
      let message = errorText;
      try {
        const errJson = JSON.parse(errorText);
        if (errJson?.error?.message) {
          message = errJson.error.message;
        }
      } catch {
        // Keep raw message
      }
      lastError = new Error(`AI generation failed [${model}] (${response.status}): ${message}`);
      console.warn(`[LeaseTemplates AI] Model ${model} failed with ${response.status}. Trying next model...`);
    } catch (err) {
      lastError = err as Error;
      console.warn(`[LeaseTemplates AI] Network error on model ${model}: ${(err as Error).message}. Trying next model...`);
    }
  }

  throw lastError || new Error('All configured Gemini models failed to generate the clause.');
}

export interface FullKasulatanResult {
  title: string;
  summary: string;
  clauses: Array<{
    num: number;
    title: string;
    english: string;
    bisaya: string;
    text: string;
    custom?: boolean;
    isCustom?: boolean;
  }>;
}

/**
 * Generates an entire customized Kasulatan sa Pag-abang from scratch with Gemini AI
 * based on the landlord's entered requirements.
 * 
 * SYSTEM PROMPT ENFORCEMENT:
 * - Designed specifically to fit on a SINGLE A4 BOND PAPER.
 * - Produces 6 to 8 concise, high-impact bilingual clauses.
 * - Each clause is kept concise (2-3 sentences, <40 words).
 * - Incorporates the landlord's specific rules (curfew, visitors, submeter, pets, deposit, etc.).
 */
export async function generateFullKasulatanWithGemini({
  landlordRequirements,
  context = {}
}: {
  landlordRequirements: string;
  context?: {
    landlordName?: string;
    roomNumber?: string;
    propertyAddress?: string;
    propertyType?: string;
    monthlyRent?: string;
    deposit?: string;
    advanceRent?: string;
    leaseDuration?: string;
  };
}): Promise<FullKasulatanResult> {
  const trimmed = landlordRequirements?.trim();
  if (!trimmed) {
    throw new Error('Please describe the property, house rules, or terms you want in the Kasulatan.');
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please check VITE_GEMINI_API_KEY in your environment.');
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

  const userContent = `Landlord Requirements: "${trimmed}"
Rental Context:
- Landlord Name: ${context.landlordName || '[Lessor Name]'}
- Unit / Identifier: ${context.roomNumber || '[Room/Unit]'}
- Location / Address: ${context.propertyAddress || '[Property Address]'}
- Property Type: ${context.propertyType || 'Boarding House / Bedspace'}
- Monthly Rent: ₱${context.monthlyRent || '0'}
- Advance / Deposit: Adv ₱${context.advanceRent || '0'} / Dep ₱${context.deposit || '0'}
- Lease Duration: ${context.leaseDuration || '6 months'}

Generate the 6-8 bilingual A4-fitted clauses now:`;

  const requestBody = {
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
  };

  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new Error('Gemini API returned an empty response. Please retry.');
        }

        const cleanJson = candidateText.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (!parsed.clauses || !Array.isArray(parsed.clauses) || parsed.clauses.length === 0) {
          throw new Error('Incomplete contract structure received from AI.');
        }

        const formattedClauses = parsed.clauses.map((c: any, idx: number) => {
          const num = c.num || idx + 1;
          const cleanTitle = (c.title || `Clause ${num}`).replace(/^\d+\.\s*/, '');
          return {
            num,
            title: `${num}. ${cleanTitle}`,
            english: (c.english || '').trim(),
            bisaya: (c.bisaya || '').trim(),
            text: (c.english || c.bisaya || '').trim(),
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

      const errorText = await response.text();
      let message = errorText;
      try {
        const errJson = JSON.parse(errorText);
        if (errJson?.error?.message) {
          message = errJson.error.message;
        }
      } catch {}
      lastError = new Error(`AI generation failed [${model}] (${response.status}): ${message}`);
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError || new Error('All configured Gemini models failed to generate the Kasulatan.');
}
