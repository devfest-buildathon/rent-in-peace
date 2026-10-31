import test from "node:test"
import assert from "node:assert/strict"
import { formatPesos, maskIdNumber, validateName, validateMobile, validatePassword } from "../src/lib/formatters.ts"
import { createEmptyContract, getContractSections } from "../src/lib/constants.ts"

test("formatPesos formats currency accurately", () => {
  assert.equal(formatPesos(3500), "₱3,500")
  assert.equal(formatPesos("7000"), "₱7,000")
  assert.equal(formatPesos(0), "₱0")
  assert.equal(formatPesos(""), "₱0")
})

test("maskIdNumber protects personal identification numbers", () => {
  assert.equal(maskIdNumber("CRN-1984-2849201"), "•••• •••• 9201")
  assert.equal(maskIdNumber("12345678"), "•••• •••• 5678")
  assert.equal(maskIdNumber("1234"), "1234")
  assert.equal(maskIdNumber(""), "")
})

test("validateName ensures valid legal names without numbers", () => {
  assert.equal(validateName("Juan Dela Cruz").isValid, true)
  assert.equal(validateName("Juan123").isValid, false)
  assert.equal(validateName("").isValid, false)
})

test("validateMobile checks 11 digit Philippine mobile format", () => {
  assert.equal(validateMobile("09171234567").isValid, true)
  assert.equal(validateMobile("0917").isValid, false)
  assert.equal(validateMobile("0917abcde").isValid, false)
})

test("validatePassword enforces 8+ chars, upper, lower, number, special char", () => {
  assert.equal(validatePassword("SecureP@ss1").isValid, true)
  assert.equal(validatePassword("short1!").isValid, false)
  assert.equal(validatePassword("nouppercase1!").isValid, false)
  assert.equal(validatePassword("NOLOWERCASE1!").isValid, false)
  assert.equal(validatePassword("NoNumber!").isValid, false)
  assert.equal(validatePassword("NoSpecial1").isValid, false)
})

test("contract flow generates valid initial sections without mock data", () => {
  const contract = createEmptyContract({ name: "Elena Santos", mobile: "09171234567" })
  assert.equal(contract.landlordName, "Elena Santos")
  assert.equal(contract.tenantName, "")
  assert.equal(contract.monthlyRent, "")

  const sections = getContractSections(contract)
  assert.ok(sections.length >= 8)
  assert.ok(sections[0][0].includes("Parties"))
  assert.ok(sections[0][1].includes("Elena Santos"))
})

import { parseRoute, isRouteAuthorized } from "../src/lib/router.ts"

test("parseRoute parses hash, routes, and query parameters correctly", () => {
  const parsed1 = parseRoute("#/tenant/join?code=CDO-9988")
  assert.equal(parsed1.path, "/tenant/join")
  assert.equal(parsed1.params.code, "CDO-9988")
  assert.equal(parsed1.isValid, true)
  assert.equal(parsed1.requiredRole, "tenant")

  const parsed2 = parseRoute("#/unknown/route")
  assert.equal(parsed2.path, "/not-found")
  assert.equal(parsed2.isValid, false)
})

test("isRouteAuthorized enforces strict role boundaries between landlord and tenant", () => {
  const landlordRoute = parseRoute("/landlord/dashboard")
  const tenantRoute = parseRoute("/tenant/join")
  const publicRoute = parseRoute("/welcome")

  // Public routes allowed for everyone
  assert.equal(isRouteAuthorized(publicRoute, null), true)
  assert.equal(isRouteAuthorized(publicRoute, "landlord"), true)
  assert.equal(isRouteAuthorized(publicRoute, "tenant"), true)

  // Landlord routes allowed for landlord, forbidden for tenant
  assert.equal(isRouteAuthorized(landlordRoute, "landlord"), true)
  assert.equal(isRouteAuthorized(landlordRoute, "tenant"), false)

  // Tenant routes allowed for tenant, forbidden for landlord
  assert.equal(isRouteAuthorized(tenantRoute, "tenant"), true)
  assert.equal(isRouteAuthorized(tenantRoute, "landlord"), false)
})
