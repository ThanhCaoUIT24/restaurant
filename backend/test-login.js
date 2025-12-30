const authService = require('./src/services/auth.service');

async function testLogin() {
  try {
    console.log('Testing login with admin/admin123...');
    const result = await authService.login({
      username: 'admin',
      password: 'admin123',
    });
    
    console.log('\n=== LOGIN RESULT ===');
    console.log('Username:', result.user.username);
    console.log('Full Name:', result.user.hoTen);
    console.log('Roles:', result.user.roles);
    console.log('Permissions Count:', result.user.permissions?.length || 0);
    console.log('Has ACCOUNT_CREATE:', result.user.permissions?.includes('ACCOUNT_CREATE'));
    
    if (result.user.permissions && result.user.permissions.length > 0) {
      console.log('\n=== FIRST 15 PERMISSIONS ===');
      result.user.permissions.slice(0, 15).forEach((perm, idx) => {
        console.log(`${idx + 1}. ${perm}`);
      });
    } else {
      console.log('\n⚠️ NO PERMISSIONS IN USER OBJECT!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLogin();
