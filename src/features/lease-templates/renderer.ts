import { LeaseClause, LeasePreset, RenderResult, PlaceholderValues } from './types';

const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Extracts all unique placeholder keys found in a string (e.g. ['tenant_name', 'rent'])
 */
export function extractPlaceholders(text: string = ''): string[] {
  if (!text) return [];
  const matches = new Set<string>();
  let match: RegExpExecArray | null;
  const regex = new RegExp(PLACEHOLDER_REGEX);
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      matches.add(match[1]);
    }
  }
  return Array.from(matches);
}

/**
 * Validates whether all placeholders present in enabled clauses have non-empty values provided.
 */
export function validatePlaceholders(
  clauses: LeaseClause[],
  values: PlaceholderValues = {}
): { isValid: boolean; missing: string[] } {
  const missingSet = new Set<string>();
  const enabledClauses = clauses.filter(c => c.enabled !== false);

  for (const clause of enabledClauses) {
    const combinedText = `${clause.title || ''} ${clause.english || ''} ${clause.bisaya || ''}`;
    const keys = extractPlaceholders(combinedText);
    for (const key of keys) {
      const val = values[key];
      if (val === undefined || val === null || String(val).trim() === '') {
        missingSet.add(key);
      }
    }
  }

  const missing = Array.from(missingSet);
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Replaces placeholders in text with provided values.
 * e.g. "Rent is {{rent}}" -> "Rent is ₱3,500"
 */
export function substitutePlaceholders(text: string = '', values: PlaceholderValues = {}): string {
  if (!text) return '';
  return text.replace(PLACEHOLDER_REGEX, (_, key) => {
    const val = values[key];
    return val !== undefined && val !== null ? String(val) : `{{${key}}}`;
  });
}

/**
 * Renders lease content from a preset template and user-provided values.
 * If any placeholder referenced by an enabled clause is missing, it returns an explicit error
 * and blocks lease generation, strictly conforming to the "no hardcoded or missing values" rule.
 */
export function renderLease(preset: LeasePreset, values: PlaceholderValues = {}): RenderResult {
  if (!preset || !Array.isArray(preset.clauses)) {
    return {
      success: false,
      error: 'Invalid preset provided: preset must have a valid clauses array.'
    };
  }

  const enabledClauses = preset.clauses.filter(c => c.enabled !== false);
  if (enabledClauses.length === 0) {
    return {
      success: false,
      error: 'Cannot render lease: Preset does not have any enabled clauses.'
    };
  }

  // Strictly check for missing placeholder values
  const validation = validatePlaceholders(enabledClauses, values);
  if (!validation.isValid) {
    const missingFormatted = validation.missing.map(m => `{{${m}}}`).join(', ');
    return {
      success: false,
      missingPlaceholders: validation.missing,
      error: `Missing required lease parameter(s): ${missingFormatted}. All values must be supplied before creating the lease agreement.`
    };
  }

  // Compile clauses with sequential numbering (1, 2, 3...)
  const renderedClauses = enabledClauses.map((clause, index) => {
    const num = index + 1;
    const titleClean = (clause.title || `Clause ${num}`).replace(/^\d+\.\s*/, '');
    const titleWithNum = `${num}. ${substitutePlaceholders(titleClean, values)}`;
    const englishSubbed = substitutePlaceholders(clause.english || '', values);
    const bisayaSubbed = substitutePlaceholders(clause.bisaya || '', values);

    // Default 'text' field ensures immediate compatibility with existing PrintableContract & KasulatanScreen
    const textCombined = bisayaSubbed
      ? `${englishSubbed}${englishSubbed && bisayaSubbed ? ' ' : ''}[Bisaya: ${bisayaSubbed}]`
      : englishSubbed;

    return {
      num,
      id: clause.id || `clause-${num}`,
      title: titleWithNum,
      english: englishSubbed,
      bisaya: bisayaSubbed,
      text: englishSubbed || bisayaSubbed || textCombined
    };
  });

  return {
    success: true,
    clauses: renderedClauses
  };
}
