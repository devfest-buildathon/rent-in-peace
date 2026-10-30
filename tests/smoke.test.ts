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
