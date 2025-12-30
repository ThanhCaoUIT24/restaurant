#!/usr/bin/env node
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

async function runDiagnostics() {
  log(colors.bright + colors.cyan, '\n╔════════════════════════════════════════════════════════════╗');
  log(colors.bright + colors.cyan, '║     RESTAURANT MANAGEMENT - PERMISSION DIAGNOSTICS      ║');
  log(colors.bright + colors.cyan, '╚════════════════════════════════════════════════════════════╝\n');

  const { prisma } = require('./src/config/db');
  const authService = require('./src/services/auth.service');
  let allPassed = true;

  try {
    // Test 1: Database Connection
    log(colors.bright, '📊 Test 1: Database Connection');
    try {
      await prisma.$connect();
      log(colors.green, '   ✓ Database connected successfully\n');
    } catch (err) {
      log(colors.red, '   ✗ Database connection failed:', err.message);
      allPassed = false;
      return;
    }

    // Test 2: Roles and Permissions in DB
    log(colors.bright, '📋 Test 2: Roles and Permissions in Database');
    const roles = await prisma.vaiTro.findMany({
      include: {
        quyen: {
          include: { quyen: true }
        }
      }
    });
    
    if (roles.length === 0) {
      log(colors.red, '   ✗ No roles found in database!');
      allPassed = false;
    } else {
      log(colors.green, `   ✓ Found ${roles.length} roles`);
      
      const adminRole = roles.find(r => r.ten === 'Admin');
      if (adminRole) {
        log(colors.green, `   ✓ Admin role exists with ${adminRole.quyen.length} permissions`);
      } else {
        log(colors.yellow, '   ⚠ Admin role not found!');
        allPassed = false;
      }
    }
    console.log();

    // Test 3: Admin Account
    log(colors.bright, '👤 Test 3: Admin Account');
    const adminAccount = await prisma.taiKhoanNguoiDung.findUnique({
      where: { username: 'admin' },
      include: {
        nhanVien: {
          include: {
            vaiTro: {
              include: {
                quyen: {
                  include: { quyen: true }
                }
              }
            }
          }
        }
      }
    });

    if (!adminAccount) {
      log(colors.yellow, '   ⚠ Admin account not found');
      log(colors.yellow, '   → Try creating one or use a different username');
      allPassed = false;
    } else {
      log(colors.green, '   ✓ Admin account exists');
      log(colors.green, `   ✓ Employee: ${adminAccount.nhanVien.hoTen}`);
      log(colors.green, `   ✓ Role: ${adminAccount.nhanVien.vaiTro?.ten || 'N/A'}`);
      
      const permCount = adminAccount.nhanVien.vaiTro?.quyen?.length || 0;
      if (permCount > 0) {
        log(colors.green, `   ✓ Has ${permCount} permissions`);
      } else {
        log(colors.red, '   ✗ No permissions assigned!');
        allPassed = false;
      }
    }
    console.log();

    // Test 4: Login Service
    log(colors.bright, '🔐 Test 4: Login Service');
    try {
      const loginResult = await authService.login({
        username: 'admin',
        password: 'admin123'
      });
      
      log(colors.green, '   ✓ Login successful');
      log(colors.green, `   ✓ User ID: ${loginResult.user.id}`);
      log(colors.green, `   ✓ Roles: [${loginResult.user.roles.join(', ')}]`);
      log(colors.green, `   ✓ Permissions count: ${loginResult.user.permissions.length}`);
      
      if (loginResult.user.permissions.length === 0) {
        log(colors.red, '   ✗ User has NO permissions!');
        allPassed = false;
      }
      
      // Check some key permissions
      const keyPerms = ['MENU_VIEW', 'MENU_CREATE', 'ORDER_VIEW', 'ACCOUNT_MANAGE'];
      const hasAllKey = keyPerms.every(p => loginResult.user.permissions.includes(p));
      
      if (hasAllKey) {
        log(colors.green, '   ✓ Has all key permissions');
      } else {
        log(colors.yellow, '   ⚠ Missing some key permissions');
        const missing = keyPerms.filter(p => !loginResult.user.permissions.includes(p));
        log(colors.yellow, `     Missing: ${missing.join(', ')}`);
      }
    } catch (err) {
      log(colors.red, '   ✗ Login failed:', err.message);
      allPassed = false;
    }
    console.log();

    // Test 5: JWT Token
    log(colors.bright, '🎫 Test 5: JWT Token Generation');
    try {
      const loginResult = await authService.login({
        username: 'admin',
        password: 'admin123'
      });
      
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(loginResult.accessToken);
      
      if (decoded && decoded.permissions && Array.isArray(decoded.permissions)) {
        log(colors.green, '   ✓ Token contains permissions array');
        log(colors.green, `   ✓ Token permissions count: ${decoded.permissions.length}`);
        
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp > now) {
          const ttl = Math.floor((decoded.exp - now) / 60);
          log(colors.green, `   ✓ Token is valid (expires in ${ttl} minutes)`);
        } else {
          log(colors.red, '   ✗ Token is expired or has no expiry!');
          allPassed = false;
        }
      } else {
        log(colors.red, '   ✗ Token does not contain permissions!');
        allPassed = false;
      }
    } catch (err) {
      log(colors.red, '   ✗ Token generation failed:', err.message);
      allPassed = false;
    }
    console.log();

    // Test 6: Middleware
    log(colors.bright, '🛡️  Test 6: Auth & RBAC Middleware');
    try {
      const { authMiddleware } = require('./src/middleware/auth');
      const { requirePermissions } = require('./src/middleware/rbac');
      
      const loginResult = await authService.login({
        username: 'admin',
        password: 'admin123'
      });
      
      const token = loginResult.accessToken;
      
      // Test auth middleware
      const req = {
        headers: { authorization: `Bearer ${token}` }
      };
      
      let authPassed = false;
      authMiddleware(req, {
        status: () => ({ json: () => {} })
      }, () => {
        authPassed = true;
      });
      
      if (authPassed && req.user && req.user.permissions) {
        log(colors.green, '   ✓ Auth middleware works correctly');
        log(colors.green, `   ✓ req.user populated with ${req.user.permissions.length} permissions`);
      } else {
        log(colors.red, '   ✗ Auth middleware failed');
        allPassed = false;
      }
      
      // Test RBAC middleware
      let rbacPassed = false;
      requirePermissions(['MENU_VIEW'])(req, {
        status: () => ({ json: () => {} })
      }, () => {
        rbacPassed = true;
      });
      
      if (rbacPassed) {
        log(colors.green, '   ✓ RBAC middleware works correctly');
      } else {
        log(colors.red, '   ✗ RBAC middleware failed');
        allPassed = false;
      }
    } catch (err) {
      log(colors.red, '   ✗ Middleware test failed:', err.message);
      allPassed = false;
    }
    console.log();

    // Summary
    log(colors.bright + colors.cyan, '═══════════════════════════════════════════════════════════');
    if (allPassed) {
      log(colors.bright + colors.green, '✓ ALL TESTS PASSED - BACKEND IS WORKING CORRECTLY!');
      log(colors.bright + colors.green, '═══════════════════════════════════════════════════════════\n');
      
      log(colors.bright, 'Backend permission system is functioning properly.');
      log(colors.bright, 'If you still have issues:');
      console.log('  1. Check frontend Console for errors');
      console.log('  2. Check Network tab for failed requests');
      console.log('  3. Clear localStorage and login again');
      console.log('  4. Check backend logs when making requests\n');
    } else {
      log(colors.bright + colors.red, '✗ SOME TESTS FAILED - ISSUES DETECTED');
      log(colors.bright + colors.red, '═══════════════════════════════════════════════════════════\n');
      
      log(colors.bright, 'Please review the errors above and:');
      console.log('  1. Ensure database is properly seeded');
      console.log('  2. Check .env file configuration');
      console.log('  3. Run: npx prisma migrate dev');
      console.log('  4. Run: node prisma/seed-full.js\n');
    }

  } catch (err) {
    log(colors.red, '\n✗ Diagnostic failed with error:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

// Run diagnostics
runDiagnostics().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
