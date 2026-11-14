import { generateClause, auditClauses } from '../src/services/ai/gemini.js';

async function testUpdatedServices() {
  console.log('Testing generateClause with multi-model cascade...');
  try {
    const clause = await generateClause(
      'Tenants must turn off aircon when leaving the room to conserve electricity.',
      [{ num: 1, title: 'Utilities', text: 'Electricity is submetered.' }],
      { propertyAddress: 'Upper Carmen, Cagayan de Oro City', monthlyRent: '4500' }
    );
    console.log('✅ Generated Clause successfully:');
    console.log('Title:', clause.title);
    console.log('Text:', clause.text);
    console.log('Toast:', clause.toast);
  } catch (err) {
    console.error('❌ generateClause failed:', err);
  }

  console.log('\nTesting auditClauses with multi-model cascade...');
  try {
    const audit = await auditClauses([
      { num: 1, title: 'Submetering', text: 'Air conditioning power shall be paid per kWh based on Cepalco billing rate.' }
    ], { propertyAddress: 'Upper Carmen' });
    console.log('✅ Audit successfully returned', audit.length, 'recommendations:');
    audit.forEach((item, idx) => console.log(`  ${idx + 1}. [${item.severity}] ${item.title}: ${item.description}`));
  } catch (err) {
    console.error('❌ auditClauses failed:', err);
  }
}

testUpdatedServices();
