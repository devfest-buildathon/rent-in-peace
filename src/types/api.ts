import type { ContractData } from "./contract"

// 1. readIdPhoto
export interface ReadIdPhotoRequest {
  imageFile?: File
  imageBase64?: string
}

export interface ReadIdPhotoResponse {
  name: string
  address: string
  idType: string
  idNumber: string
}

// 2. checkContract
export interface CheckContractRequest {
  contract: Partial<ContractData>
}

export interface ContractSuggestionItem {
  id: string
  title: string
  body: string
  clauseText: string
}

export interface CheckContractResponse {
  suggestions: ContractSuggestionItem[]
}

// 3. explainContract
export interface ExplainContractRequest {
  contract: Partial<ContractData>
  language?: "english" | "tagalog" | "cebuano"
}

export interface ExplainContractResponse {
  summary: string
  keyPoints: string[]
}

// 4. saveLease & listTenants (non-sensitive fields only)
export interface LeaseRecord {
  id: string
  unit: string
  rent: number
  date: string
  status: "active" | "draft" | "terminated"
}

export interface SaveLeaseRequest {
  lease: Omit<LeaseRecord, "id"> & { id?: string }
}

export interface SaveLeaseResponse {
  success: boolean
  lease: LeaseRecord
}

export interface ListTenantsResponse {
  tenants: LeaseRecord[]
}
