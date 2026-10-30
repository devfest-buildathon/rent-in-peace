import { apiClient } from "./client"
import type {
  ReadIdPhotoResponse,
  CheckContractRequest,
  CheckContractResponse,
  ExplainContractRequest,
  ExplainContractResponse,
  SaveLeaseRequest,
  SaveLeaseResponse,
  ListTenantsResponse,
} from "../types/api"

/**
 * 1. readIdPhoto
 * Sends an ID image (multipart/form-data or json) and receives extracted name, address, ID type, and ID number.
 */
export async function readIdPhoto(file: File): Promise<ReadIdPhotoResponse> {
  const formData = new FormData()
  formData.append("image", file)

  return apiClient<ReadIdPhotoResponse>("/id/read", {
    method: "POST",
    body: formData,
  })
}

/**
 * 2. checkContract
 * Sends the contract details and receives recommended clauses or missing safeguards.
 */
export async function checkContract(
  data: CheckContractRequest
): Promise<CheckContractResponse> {
  return apiClient<CheckContractResponse>("/contracts/check", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * 3. explainContract
 * Sends the contract details and desired language to receive a simplified explanation.
 */
export async function explainContract(
  data: ExplainContractRequest
): Promise<ExplainContractResponse> {
  return apiClient<ExplainContractResponse>("/contracts/explain", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * 4. saveLease
 * Saves minimal, non-sensitive lease summary (unit, rent, date, status).
 */
export async function saveLease(
  data: SaveLeaseRequest
): Promise<SaveLeaseResponse> {
  return apiClient<SaveLeaseResponse>("/leases", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * 5. listTenants
 * Retrieves non-sensitive tenant / lease listings from the backend.
 */
export async function listTenants(): Promise<ListTenantsResponse> {
  return apiClient<ListTenantsResponse>("/tenants", {
    method: "GET",
  })
}
