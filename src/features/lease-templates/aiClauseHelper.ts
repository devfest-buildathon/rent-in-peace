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
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview'
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
