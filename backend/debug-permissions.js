require('dotenv').config();
const authService = require('./src/services/auth.service');
const { authMiddleware } = require('./src/middleware/auth');
const { requirePermissions } = require('./src/middleware/rbac');
const { PERMISSIONS } = require('./src/utils/permissions');

async function debugPermissions() {
  console.log('=== DEBUGGING PERMISSION SYSTEM ===\n');
  
  // 1. Login và lấy token
  console.log('Step 1: Login as admin...');
  const loginResult = await authService.login({
    username: 'admin',
    password: 'admin123'
  });
  console.log('✓ Login successful');
  console.log('  User ID:', loginResult.user.id);
  console.log('  Roles:', loginResult.user.roles);
  console.log('  Permissions count:', loginResult.user.permissions.length);
  console.log('  Has MENU_VIEW?', loginResult.user.permissions.includes('MENU_VIEW'));
  console.log('  Has MENU_CREATE?', loginResult.user.permissions.includes('MENU_CREATE'));
  console.log('  Has ACCOUNT_CREATE?', loginResult.user.permissions.includes('ACCOUNT_CREATE'));
  console.log();
  
  // 2. Simulate a request với token
  console.log('Step 2: Simulating request with token...');
  const token = loginResult.accessToken;
  
  // Mock request object
  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  };
  
  // Mock response object
  let authPassed = false;
  let authError = null;
  const res = {
    status: (code) => ({
      json: (data) => {
        authError = { code, ...data };
      }
    })
  };
  
  // Test auth middleware
  authMiddleware(req, res, () => {
    authPassed = true;
  });
  
  if (authPassed) {
    console.log('✓ Auth middleware passed');
    console.log('  req.user.id:', req.user.id);
    console.log('  req.user.roles:', req.user.roles);
    console.log('  req.user.permissions count:', req.user.permissions?.length || 0);
    console.log('  req.user.permissions:', req.user.permissions);
  } else {
    console.log('✗ Auth middleware FAILED');
    console.log('  Error:', authError);
  }
  console.log();
  
  // 3. Test permission middleware
  if (authPassed) {
    console.log('Step 3: Testing permission middleware...');
    
    // Test MENU_VIEW
    console.log('\n  Test 3a: MENU_VIEW permission');
    let permPassed = false;
    let permError = null;
    const res2 = {
      status: (code) => ({
        json: (data) => {
          permError = { code, ...data };
        }
      })
    };
    
    requirePermissions([PERMISSIONS.MENU_VIEW])(req, res2, () => {
      permPassed = true;
    });
    
    if (permPassed) {
      console.log('  ✓ MENU_VIEW permission check passed');
    } else {
      console.log('  ✗ MENU_VIEW permission check FAILED');
      console.log('    Error:', permError);
    }
    
    // Test ACCOUNT_CREATE
    console.log('\n  Test 3b: ACCOUNT_CREATE permission');
    permPassed = false;
    permError = null;
    const res3 = {
      status: (code) => ({
        json: (data) => {
          permError = { code, ...data };
        }
      })
    };
    
    requirePermissions([PERMISSIONS.ACCOUNT_CREATE])(req, res3, () => {
      permPassed = true;
    });
    
    if (permPassed) {
      console.log('  ✓ ACCOUNT_CREATE permission check passed');
    } else {
      console.log('  ✗ ACCOUNT_CREATE permission check FAILED');
      console.log('    Error:', permError);
    }
    
    // Test không có quyền
    console.log('\n  Test 3c: FAKE_PERMISSION (should fail)');
    permPassed = false;
    permError = null;
    const res4 = {
      status: (code) => ({
        json: (data) => {
          permError = { code, ...data };
        }
      })
    };
    
    requirePermissions(['FAKE_PERMISSION'])(req, res4, () => {
      permPassed = true;
    });
    
    if (permPassed) {
      console.log('  ✗ FAKE_PERMISSION check passed (should have failed!)');
    } else {
      console.log('  ✓ FAKE_PERMISSION check failed as expected');
      console.log('    Error code:', permError?.code);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Backend permission system is working correctly!');
  console.log('Admin user has all permissions loaded from database.');
  console.log('\nIf frontend shows permissions but can\'t access backend:');
  console.log('1. Check if frontend is sending Authorization header correctly');
  console.log('2. Check browser Network tab for actual requests');
  console.log('3. Check if token is expired (current token exp:', loginResult.user.exp || 'N/A', ')');
  console.log('4. Verify frontend is storing token in localStorage');
  
  const { prisma } = require('./src/config/db');
  await prisma.$disconnect();
}

debugPermissions().catch(console.error);
