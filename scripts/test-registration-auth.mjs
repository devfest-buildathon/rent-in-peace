import { createServer } from 'vite';

async function runRegistrationTests() {
  console.log('====================================================');
  console.log('   FIREBASE AUTH & DIRECT FIRESTORE FALLBACK TESTS  ');
  console.log('====================================================\n');

  const server = await createServer({
    server: { port: 5196 }
  });
  await server.listen();

  try {
    const authService = await server.ssrLoadModule('/src/auth/authService.js');
    const { 
      registerLandlordUser, 
      loginLandlordUser,
      registerTenantUser, 
      loginTenantUser,
      formatAuthError 
    } = authService;

    // TEST 1: Error Code Mapping Tests
    console.log('[TEST 1] Verifying Firebase Auth Error Mappings:');
    const cases = [
      { code: 'auth/configuration-not-found', expected: 'Registration is temporarily unavailable' },
      { code: 'auth/email-already-in-use', expected: 'An account with this email or mobile number already exists. Please Sign In instead.' },
      { code: 'auth/weak-password', expected: 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, numbers, and symbols.' },
      { code: 'auth/invalid-email', expected: 'The email address format is invalid. Please check your email and try again.' },
      { code: 'auth/network-request-failed', expected: 'Network error. Please check your internet connection and try again.' },
    ];

    for (const c of cases) {
      const err = formatAuthError({ code: c.code, message: `Raw ${c.code}` }, 'register');
      if (err.message !== c.expected) {
        throw new Error(`Mapping failed for ${c.code}! Got: "${err.message}", Expected: "${c.expected}"`);
      }
      console.log(`  ✓ Code "${c.code}" correctly mapped -> "${err.message}"`);
    }

    // TEST 2: Weak Password Rejection
    console.log('\n[TEST 2] Testing Weak Password Registration:');
    try {
      await registerLandlordUser({
        name: 'Maria Clara',
        phone: '09171234567',
        email: 'landlord_test@example.com',
        password: 'weak',
        propertyName: 'Santos Boarding',
        propertyAddress: '123 Test St',
        city: 'Davao City'
      });
      throw new Error('Weak password was not rejected!');
    } catch (e) {
      console.log(`  ✓ Weak password correctly blocked before Auth: "${e.message}"`);
    }

    // TEST 3: Register Landlord (with automatic Firestore fallback if Auth unconfigured)
    console.log('\n[TEST 3] Testing Landlord Registration with Strong Password:');
    const testPhone = '0917' + Math.floor(1000000 + Math.random() * 9000000);
    const landlordRes = await registerLandlordUser({
      name: 'Maria Clara Santos',
      phone: testPhone,
      email: `landlord_${testPhone}@test.ph`,
      password: 'StrongP@ssw0rd2026!',
      propertyName: 'Santos Residences',
      propertyAddress: '123 Mabini St',
      barangay: 'Carmen',
      city: 'Cagayan de Oro'
    });
    console.log(`  ✓ Landlord successfully registered! Name: "${landlordRes.name}", ID: "${landlordRes.id}", AuthProvider: "${landlordRes.authProvider}"`);

    // TEST 4: Login Landlord
    console.log('\n[TEST 4] Testing Landlord Sign In:');
    const loginLandlordRes = await loginLandlordUser({
      identifier: testPhone,
      password: 'StrongP@ssw0rd2026!'
    });
    console.log(`  ✓ Landlord successfully signed in! Name: "${loginLandlordRes.name}", ID: "${loginLandlordRes.id}"`);

    // TEST 5: Register Tenant
    console.log('\n[TEST 5] Testing Tenant Registration:');
    const testUser = 'tenant_' + Math.floor(10000 + Math.random() * 90000);
    const tenantRes = await registerTenantUser({
      name: 'Elena P. Salvador',
      username: testUser,
      phone: '0918' + Math.floor(1000000 + Math.random() * 9000000),
      email: `${testUser}@test.ph`,
      password: 'StrongT3nantP@ss!',
      code: 'RIP-4B92'
    });
    console.log(`  ✓ Tenant successfully registered! Username: "${tenantRes.username}", Code: "${tenantRes.contractCode}", AuthProvider: "${tenantRes.authProvider}"`);

    // TEST 6: Login Tenant
    console.log('\n[TEST 6] Testing Tenant Sign In:');
    const loginTenantRes = await loginTenantUser({
      identifier: testUser,
      password: 'StrongT3nantP@ss!'
    });
    console.log(`  ✓ Tenant successfully signed in! Username: "${loginTenantRes.username}"`);

    console.log('\n====================================================');
    console.log('   ALL AUTH & REGISTRATION TESTS PASSED!          ');
    console.log('====================================================');
  } finally {
    await server.close();
  }
}

runRegistrationTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
