require('dotenv').config();

async function testAdminRoutes() {
  console.log('=== TESTING ADMIN ROUTES MISMATCH ===\n');
  
  const authService = require('./src/services/auth.service');
  const { requireAdmin } = require('./src/middleware/rbac');
  const { requirePermissions } = require('./src/middleware/rbac');
  const { PERMISSIONS } = require('./src/utils/permissions');
  
  // Login as admin
  const loginResult = await authService.login({
    username: 'admin',
    password: 'admin123'
  });
  
  console.log('User:', loginResult.user.username);
  console.log('Roles:', loginResult.user.roles);
  console.log('Permissions:', loginResult.user.permissions.length);
  console.log();
  
  const req = { user: loginResult.user };
  
  // Test các routes có vấn đề
  const tests = [
    {
      route: 'GET /api/admin/users',
      backend: 'requireAdmin()',
      frontend: 'isAdmin() + ACCOUNT_CREATE',
      middleware: requireAdmin()
    },
    {
      route: 'GET /api/admin/roles',
      backend: 'requireAdmin()',
      frontend: 'isAdmin() + ACCOUNT_MANAGE',
      middleware: requireAdmin()
    },
    {
      route: 'GET /api/admin/permissions',
      backend: 'requireAdmin()',
      frontend: 'isAdmin()',
      middleware: requireAdmin()
    },
    {
      route: 'POST /api/admin/users',
      backend: 'requirePermissions([ACCOUNT_CREATE])',
      frontend: 'ACCOUNT_CREATE',
      middleware: requirePermissions([PERMISSIONS.ACCOUNT_CREATE])
    },
    {
      route: 'PUT /api/admin/users/:id',
      backend: 'requirePermissions([ACCOUNT_MANAGE])',
      frontend: 'ACCOUNT_MANAGE',
      middleware: requirePermissions([PERMISSIONS.ACCOUNT_MANAGE])
    },
    {
      route: 'GET /api/inventory/materials',
      backend: 'requirePermissions([STOCK_VIEW])',
      frontend: 'STOCK_VIEW',
      middleware: requirePermissions([PERMISSIONS.STOCK_VIEW])
    }
  ];
  
  console.log('BACKEND MIDDLEWARE TESTS:\n');
  
  tests.forEach(test => {
    let passed = false;
    let errorMsg = null;
    
    test.middleware(req, {
      status: (code) => ({
        json: (data) => {
          errorMsg = `Status ${code}: ${data.message}`;
        }
      })
    }, () => {
      passed = true;
    });
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.route}`);
    console.log(`     Backend: ${test.backend}`);
    console.log(`     Frontend: ${test.frontend}`);
    if (!passed) {
      console.log(`     Error: ${errorMsg}`);
    }
    console.log();
  });
  
  // Phân tích vấn đề
  console.log('=== PHÂN TÍCH ===\n');
  
  const hasAdminRole = loginResult.user.roles.includes('Admin');
  const hasAccountCreate = loginResult.user.permissions.includes('ACCOUNT_CREATE');
  const hasAccountManage = loginResult.user.permissions.includes('ACCOUNT_MANAGE');
  const hasStockView = loginResult.user.permissions.includes('STOCK_VIEW');
  
  console.log('User có role "Admin":', hasAdminRole ? '✅ YES' : '❌ NO');
  console.log('User có permission ACCOUNT_CREATE:', hasAccountCreate ? '✅ YES' : '❌ NO');
  console.log('User có permission ACCOUNT_MANAGE:', hasAccountManage ? '✅ YES' : '❌ NO');
  console.log('User có permission STOCK_VIEW:', hasStockView ? '✅ YES' : '❌ NO');
  console.log();
  
  console.log('VẤN ĐỀ TIỀM ẨN:');
  console.log('Frontend menu "Người dùng" check: isAdmin() + ACCOUNT_CREATE');
  console.log('Backend route GET /admin/users check: requireAdmin()');
  console.log();
  console.log('NẾU frontend hiển thị menu nhưng backend từ chối:');
  console.log('→ Frontend check ACCOUNT_CREATE (có) ✅');
  console.log('→ Backend check Admin role (có) ✅');
  console.log('→ NẾU VẪN BỊ TỪ CHỐI: Check token có được gửi không!');
  console.log();
  
  console.log('KHUYẾN NGHỊ:');
  console.log('1. Frontend hiển thị menu items chỉ dựa vào adminOnly + permissions');
  console.log('2. Backend đã check đúng (requireAdmin hoặc requirePermissions)');
  console.log('3. VẤN ĐỀ có thể là:');
  console.log('   - Token không được gửi từ frontend');
  console.log('   - Token hết hạn');
  console.log('   - Request không có Authorization header');
  console.log();
  
  const { prisma } = require('./src/config/db');
  await prisma.$disconnect();
}

testAdminRoutes().catch(console.error);
