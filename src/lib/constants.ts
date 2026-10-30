import type { ContractData, ContractSection } from "../types/contract"
import type { UserProfile } from "../types/user"

export const SCREENS = [
  "Welcome",
  "Sign In",
  "Create Account",
  "Dashboard",
  "Property Type",
  "Contract Details",
  "ID Scan",
  "Review & Confirm",
  "Contract Preview",
  "Smart Check",
  "Success",
  "My Tenants",
  "Tenant Detail",
  "Privacy & Help",
  "Account & Settings",
  "Rent Reminders",
] as const

export const LEGAL_DISCLAIMER = "Template for review, not legal advice."

export const PROPERTY_TYPES = [
  {
    type: "Boarding House / Bedspace",
    desc: "Single bed or shared room with common kitchen and CR.",
    icon: "home" as const,
  },
  {
    type: "Apartment / Unit",
    desc: "Independent unit with own door, kitchen, and private bathroom.",
    icon: "house" as const,
  },
  {
    type: "Commercial Space",
    desc: "Storefront, food stall, or small office space in Cagayan de Oro.",
    icon: "handshake" as const,
  },
  {
    type: "House & Lot",
    desc: "Entire residential house and grounds leased to one household.",
    icon: "shield" as const,
  },
]

export const DEFAULT_SUGGESTIONS = [
  [
    "Guest policy & overnight stay",
    "Specify when visitors must leave and whether overnight guests require prior landlord permission.",
    "Visitors are allowed until 9:00 PM. Overnight guests require prior notice and approval from the landlord.",
  ],
  [
    "Utility billing payment window",
    "Clear timelines for settling sub-meter electricity or water bills avoid compounding arrears.",
    "Utility bills must be settled within 5 calendar days of presentation.",
  ],
  [
    "Move-out notice period",
    "Set a clear notice period before moving out to ensure smooth turnover and deposit audit.",
    "Tenant must provide at least thirty (30) days written notice before vacating.",
  ],
] as const

export const createEmptyContract = (user?: UserProfile | null): ContractData => ({
  id: `contract-${Date.now()}`,
  propertyType: "Boarding House / Bedspace",
  roomUnit: "",
  propertyAddress: "",
  landlordName: user?.name || "",
  landlordContact: user?.mobile || "",
  tenantName: "",
  tenantAddress: "",
  tenantContact: "",
  tenantIdNumber: "",
  monthlyRent: "",
  securityDeposit: "",
  advanceRent: "",
  duration: "6 months",
  startDate: new Date().toISOString().split("T")[0],
  dueDate: "Every 5th",
  electricityType: "Sub-meter",
  meterReading: "",
  waterType: "Shared split",
  houseRules: "Quiet hours from 10 PM. Clean common areas. No subleasing.",
  status: "Active",
  createdAt: new Date().toISOString(),
  title: "KASULATAN SA PAG-ABANG",
})

export function getContractSections(c: ContractData): ContractSection[] {
  if (c.customSections && c.customSections.length > 0) {
    return c.customSections
  }

  const peso = (n: string | number) =>
    "₱" + Number(n || 0).toLocaleString("en-PH")

  return [
    [
      "1. Parties",
      `This residential lease agreement is entered into by ${c.landlordName || "The Landlord"} (Lessor) and ${c.tenantName || "The Tenant"} (Lessee)${c.tenantIdNumber ? `, holder of ID No. ${c.tenantIdNumber}` : ""}.`,
    ],
    [
      "2. Leased Premises",
      `The Lessor leases ${c.roomUnit || "the designated room"} situated at ${c.propertyAddress || "Cagayan de Oro City"} (${c.propertyType || "Residential Accommodation"}) strictly for residential dwelling.`,
    ],
    [
      "3. Rent and Security Deposit",
      `Monthly rent is ${peso(c.monthlyRent)}, due on or before ${c.dueDate || "Every 5th"}. A security deposit of ${peso(c.securityDeposit)} and advance rent of ${peso(c.advanceRent || 0)} are due upon contract signing.`,
    ],
    [
      "4. Term of Lease",
      `The lease begins on ${c.startDate || "the agreed date"} for an initial duration of ${c.duration || "6 months"}.`,
    ],
    [
      "5. Utilities and Operating Expenses",
      `Electricity billing is arranged via ${c.electricityType || "sub-meter"}. Water utility is arranged via ${c.waterType || "shared split"}.`,
    ],
    [
      "6. House Rules & Quiet Hours",
      c.houseRules || "Tenants agree to keep shared areas clean, observe quiet hours from 10:00 PM, and refrain from unauthorized subleasing.",
    ],
    [
      "7. Maintenance & Repairs",
      "The tenant shall maintain the premises in tenantable condition and promptly notify the landlord of any needed repairs.",
    ],
    [
      "8. Termination & Notice",
      "Either party may terminate or request non-renewal of this lease agreement by providing thirty (30) days prior written notice.",
    ],
  ]
}
