const authService = require('./src/services/auth.service');

async function testLogin() {
  try {
    console.log('=== TESTING LOGIN ===\n');
    
    const result = await authService.login({
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Login successful!\n');
    console.log('User object returned:');
    console.log(JSON.stringify(result.user, null, 2));
    
    console.log('\n\nAccess Token payload (decoded):');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(result.accessToken);
    console.log(JSON.stringify(decoded, null, 2));
    
  } catch (err) {
    console.error('Login failed:', err.message);
  }
  
  const { prisma } = require('./src/config/db');
  await prisma.$disconnect();
}

testLogin();
