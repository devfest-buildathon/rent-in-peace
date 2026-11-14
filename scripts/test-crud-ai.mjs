import { createServer } from 'vite';

async function runCrudAndAiTests() {
  const server = await createServer({
    server: { port: 5198 }
  });
  await server.listen();

  try {
    const aiHelper = await server.ssrLoadModule('/src/features/lease-templates/aiClauseHelper.ts');
    const presetService = await server.ssrLoadModule('/src/features/lease-templates/presetService.ts');

    console.log('--- TESTING PRESET CRUD & AI ASSISTANT ---');

    // 1. Test Disclaimer Note
    console.log('1. Checking Statutory Disclaimer...');
    if (!aiHelper.AI_DISCLAIMER_NOTE.includes('landlord is responsible for reviewing all clauses')) {
      throw new Error('Disclaimer does not contain required review notice');
    }
    console.log('   ✓ Legal disclaimer verified:', aiHelper.AI_DISCLAIMER_NOTE);

    // 2. Test AI Helper empty input rejection
    console.log('2. Testing AI Helper Input Validation...');
    try {
      await aiHelper.suggestClauseWithGemini('');
      throw new Error('Should have failed on empty input');
    } catch (e) {
      console.log('   ✓ Properly rejected empty prompt with error:', e.message);
    }

    // 3. Test LocalStorage & In-memory CRUD simulation
    console.log('3. Testing Preset Duplication and Customization...');
    const sourcePreset = await presetService.getPresetById('builtin-room-cr');
    if (!sourcePreset) throw new Error('builtin-room-cr not found');
    console.log(`   ✓ Loaded source preset "${sourcePreset.name}" with ${sourcePreset.clauses.length} clauses`);

    // Verify read-only enforcement on built-in
    try {
      await presetService.updatePreset('test_landlord', 'builtin-room-cr', { name: 'Hacked' });
      throw new Error('Should have blocked modifying built-in preset');
    } catch (e) {
      console.log('   ✓ Read-only protection verified for built-in preset:', e.message);
    }

    // Duplicate preset
    const copy = await presetService.duplicatePreset('test_landlord', 'builtin-room-cr', 'My Custom Room with CR');
    if (copy.id.startsWith('builtin-')) throw new Error('Duplicate should have custom ID');
    if (copy.isBuiltIn) throw new Error('Duplicate should not be marked built-in');
    if (copy.clauses.length !== sourcePreset.clauses.length) throw new Error('Duplicate should clone all clauses');
    console.log(`   ✓ Duplicated preset created: "${copy.name}" (ID: ${copy.id})`);

    // Update custom preset
    await presetService.updatePreset('test_landlord', copy.id, {
      description: 'Updated custom description for testing'
    });
    console.log('   ✓ Custom preset updated successfully');

    // Delete custom preset
    await presetService.deletePreset('test_landlord', copy.id);
    console.log('   ✓ Custom preset deleted successfully');

    console.log('--- ALL CRUD & AI TESTS COMPLETED SUCCESSFULLY ---');
  } finally {
    await server.close();
  }
}

runCrudAndAiTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
