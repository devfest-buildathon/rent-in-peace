export type PropertyType =
  | "Boarding House / Bedspace"
  | "Apartment / Unit"
  | "Commercial Space"
  | "House & Lot"

export type ContractSection = [string, string]

export interface ContractData {
  id: string
  propertyType: string
  roomUnit: string
  propertyAddress: string
  landlordName: string
  landlordContact: string
  tenantName: string
  tenantAddress: string
  tenantContact: string
  tenantIdNumber: string
  monthlyRent: string
  securityDeposit: string
  advanceRent: string
  duration: string
  startDate: string
  dueDate: string
  electricityType: string
  meterReading: string
  waterType: string
  houseRules: string
  status: string
  createdAt: string
  customSections?: ContractSection[]
  title?: string
}

export interface Suggestion {
  id: string
  title: string
  body: string
  clauseText: string
}
