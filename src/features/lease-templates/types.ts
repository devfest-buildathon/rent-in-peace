export interface LeaseClause {
  id: string;
  title: string;
  english: string;
  bisaya: string;
  enabled: boolean;
  category?: 'parties' | 'premises' | 'rent' | 'deposit' | 'utilities' | 'rules' | 'visitors' | 'curfew' | 'termination' | 'custom';
}

export interface LeasePreset {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  landlordId?: string;
  clauses: LeaseClause[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaceholderDefinition {
  key: string;
  placeholder: string;
  label: string;
  description: string;
  sampleValue: string;
}

export type PlaceholderValues = Record<string, string>;

export interface RenderResult {
  success: boolean;
  clauses?: Array<{
    num: number;
    id: string;
    title: string;
    english: string;
    bisaya: string;
    text: string; // Combined or default text for contract compatibility
  }>;
  missingPlaceholders?: string[];
  error?: string;
}
