import { BUILTIN_PRESETS, SAMPLE_PLACEHOLDER_VALUES } from '../src/features/lease-templates/constants.js';
import { extractPlaceholders, validatePlaceholders, renderLease } from '../src/features/lease-templates/renderer.js';

console.log('--- Starting Lease Templates Unit Tests ---');

// Test 1: Built-in presets exist and have valid structure
console.log('Test 1: Verify built-in starter presets');
if (BUILTIN_PRESETS.length !== 3) {
  throw new Error(`Expected 3 built-in presets, got ${BUILTIN_PRESETS.length}`);
}
for (const p of BUILTIN_PRESETS) {
  if (!p.id || !p.name || !p.clauses || p.clauses.length === 0) {
    throw new Error(`Preset ${p.id} has invalid structure`);
  }
  if (!p.isBuiltIn) {
    throw new Error(`Preset ${p.id} should have isBuiltIn=true`);
  }
  // Check that every clause has both English and Bisaya
  for (const c of p.clauses) {
    if (!c.english || !c.bisaya) {
      throw new Error(`Preset ${p.name} clause ${c.title} is missing english or bisaya text`);
    }
  }
  console.log(`  ✓ Built-in Preset: "${p.name}" (${p.clauses.length} bilingual clauses)`);
}

// Test 2: Placeholder extraction
console.log('Test 2: Placeholder extraction');
const testClauseText = 'Monthly rent of {{rent}} is due on day {{due_day}} of each month by {{tenant_name}}.';
const extracted = extractPlaceholders(testClauseText);
console.log('  Extracted placeholders:', extracted);
if (!extracted.includes('rent') || !extracted.includes('due_day') || !extracted.includes('tenant_name')) {
  throw new Error('Placeholder extraction failed to find expected keys');
}
console.log('  ✓ Placeholder extraction verified');

// Test 3: Placeholder validation blocks missing values
console.log('Test 3: Missing placeholder blocking');
const dummyClauses = [
  { id: '1', title: 'Rent', english: 'Rent is {{rent}}', bisaya: 'Abang {{rent}}', enabled: true },
  { id: '2', title: 'Tenant', english: 'Tenant: {{tenant_name}}', bisaya: 'Umuupa: {{tenant_name}}', enabled: true },
  { id: '3', title: 'Disabled', english: 'Deposit: {{deposit}}', bisaya: 'Dep: {{deposit}}', enabled: false }
];
const valResult = validatePlaceholders(dummyClauses, { rent: '₱3,000' }); // tenant_name missing
if (valResult.isValid) {
  throw new Error('Validation should have failed for missing tenant_name');
}
if (!valResult.missing.includes('tenant_name')) {
  throw new Error('Expected tenant_name in missing list');
}
if (valResult.missing.includes('deposit')) {
  throw new Error('Disabled clause placeholder should NOT be marked missing');
}
console.log('  ✓ Missing placeholder properly detected and blocked:', valResult.missing);

// Test 4: renderLease returns error when values are missing
console.log('Test 4: renderLease error handling');
const testPreset = {
  id: 'test-preset',
  name: 'Test Preset',
  description: 'Test',
  isBuiltIn: false,
  clauses: dummyClauses
};
const failedRender = renderLease(testPreset, { rent: '₱3,000' });
if (failedRender.success) {
  throw new Error('renderLease should have failed due to missing tenant_name');
}
console.log('  ✓ renderLease blocked with message:', failedRender.error);

// Test 5: renderLease succeeds with full values and substitutes cleanly
console.log('Test 5: renderLease successful substitution');
const successRender = renderLease(testPreset, { rent: '₱3,000', tenant_name: 'Juan dela Cruz' });
if (!successRender.success || !successRender.clauses) {
  throw new Error('renderLease should have succeeded');
}
if (successRender.clauses[0].english !== 'Rent is ₱3,000') {
  throw new Error(`Unexpected substitution: ${successRender.clauses[0].english}`);
}
if (successRender.clauses[1].english !== 'Tenant: Juan dela Cruz') {
  throw new Error(`Unexpected substitution: ${successRender.clauses[1].english}`);
}
console.log('  ✓ renderLease substituted clauses successfully');

// Test 6: renderLease with Bedspace Starter Preset & Sample Values
console.log('Test 6: Render built-in preset with sample values');
const bedspaceRender = renderLease(BUILTIN_PRESETS[0], SAMPLE_PLACEHOLDER_VALUES);
if (!bedspaceRender.success || bedspaceRender.clauses.length !== 8) {
  throw new Error('Expected 8 rendered clauses for Bedspace');
}
for (const c of bedspaceRender.clauses) {
  if (c.english.includes('{{') || c.bisaya.includes('{{')) {
    throw new Error(`Unresolved placeholder in clause ${c.title}`);
  }
}
console.log('  ✓ All 8 Bedspace clauses rendered without unresolved placeholders');

console.log('--- ALL UNIT TESTS PASSED ---');
