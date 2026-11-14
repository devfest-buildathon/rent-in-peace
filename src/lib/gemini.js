// Bridge export to src/services/ai for backwards compatibility
import { generateClause, auditClauses } from '../services/ai/gemini';

export const generateClauseWithGemini = generateClause;
export const auditClausesWithGemini = auditClauses;
