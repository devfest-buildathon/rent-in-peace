import { createServer } from 'vite';

async function runTests() {
  const server = await createServer({
    server: { port: 5199 }
  });
  await server.listen();
  console.log('Vite test server listening on port 5199');

  // SSR load module to test directly
  try {
    const constants = await server.ssrLoadModule('/src/features/lease-templates/constants.ts');
    const renderer = await server.ssrLoadModule('/src/features/lease-templates/renderer.ts');
    const presetService = await server.ssrLoadModule('/src/features/lease-templates/presetService.ts');

    console.log('--- EXECUTING REAL LEASE TEMPLATES TEST SUITE ---');

    // Test 1: Built-in presets
    console.log('1. Testing Built-in Presets...');
    const presets = constants.BUILTIN_PRESETS;
    if (presets.length !== 3) throw new Error(`Expected 3 presets, found ${presets.length}`);
    for (const p of presets) {
      if (!p.isBuiltIn) throw new Error(`${p.name} isBuiltIn is false`);
      if (p.clauses.length < 5) throw new Error(`${p.name} has fewer than 5 clauses`);
      for (const c of p.clauses) {
        if (!c.english || !c.bisaya) throw new Error(`Clause ${c.title} missing bilingual text`);
      }
    }
    console.log('   ✓ 3 Built-in presets verified (Bedspace, Room with CR, Apartment) with bilingual text');

    // Test 2: Placeholder extraction & Available placeholders
    console.log('2. Testing Available Placeholders...');
    const placeholders = constants.AVAILABLE_PLACEHOLDERS;
    const requiredKeys = ['tenant_name', 'unit', 'rent', 'advance', 'deposit', 'property_address', 'landlord_name', 'due_day'];
    for (const k of requiredKeys) {
      if (!placeholders.some(p => p.key === k)) throw new Error(`Missing placeholder: ${k}`);
    }
    console.log('   ✓ All required placeholders present:', requiredKeys.join(', '));

    // Test 3: Validation blocking missing values
    console.log('3. Testing Validation & Missing Placeholder Blocking...');
    const testClause = [{ id: '1', title: 'Rent', english: 'Pay {{rent}} for {{unit}}', bisaya: 'Bayad {{rent}} sa {{unit}}', enabled: true }];
    const validCheckFail = renderer.validatePlaceholders(testClause, { rent: '₱2,500' }); // unit missing
    if (validCheckFail.isValid) throw new Error('Validation should have blocked missing unit');
    if (!validCheckFail.missing.includes('unit')) throw new Error('Unit should be in missing list');

    const renderFail = renderer.renderLease({ id: 't', name: 'T', clauses: testClause }, { rent: '₱2,500' });
    if (renderFail.success) throw new Error('renderLease should fail when placeholder has no value');
    if (!renderFail.error.includes('unit')) throw new Error('Error message must mention missing placeholder');
    console.log('   ✓ renderLease blocked missing values with error:', renderFail.error);

    // Test 4: Successful rendering with complete values
    console.log('4. Testing Successful Substitution...');
    const renderSuccess = renderer.renderLease({ id: 't', name: 'T', clauses: testClause }, { rent: '₱2,500', unit: 'Room 101' });
    if (!renderSuccess.success) throw new Error(`renderLease failed: ${renderSuccess.error}`);
    if (renderSuccess.clauses[0].english !== 'Pay ₱2,500 for Room 101') {
      throw new Error(`Unexpected substitution result: ${renderSuccess.clauses[0].english}`);
    }
    if (renderSuccess.clauses[0].bisaya !== 'Bayad ₱2,500 sa Room 101') {
      throw new Error(`Unexpected substitution result: ${renderSuccess.clauses[0].bisaya}`);
    }
    console.log('   ✓ renderLease substituted both English and Bisaya cleanly without hardcoded values');

    // Test 5: Reordering and Toggle
    console.log('5. Testing Clause Toggle & Custom Preset Creation...');
    const customPreset = {
      id: 'custom-1',
      name: 'My Boarding House',
      clauses: [
        { id: 'c1', title: 'A', english: 'Rule A', bisaya: 'Patakaran A', enabled: true },
        { id: 'c2', title: 'B', english: 'Rule B {{rent}}', bisaya: 'Patakaran B', enabled: false }
      ]
    };
    // Disabled clause with missing placeholder should NOT block rendering
    const renderWithDisabled = renderer.renderLease(customPreset, {});
    if (!renderWithDisabled.success) throw new Error('Disabled clause should not block rendering');
    if (renderWithDisabled.clauses.length !== 1) throw new Error('Only enabled clauses should be rendered');
    console.log('   ✓ Disabled clauses excluded from render output');

    // Test 6: Preset Service Interface - getPresetClauses
    console.log('6. Testing Preset Service getPresetClauses Interface...');
    const bedspaceClauses = await presetService.getPresetClauses('builtin-bedspace');
    if (!Array.isArray(bedspaceClauses) || bedspaceClauses.length !== 8) {
      throw new Error(`getPresetClauses returned invalid clauses count: ${bedspaceClauses?.length}`);
    }
    console.log(`   ✓ getPresetClauses('builtin-bedspace') returned ${bedspaceClauses.length} active clauses`);

    console.log('--- ALL 6 TEST SUITES PASSED SUCCESSFULLY ---');
  } finally {
    await server.close();
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
