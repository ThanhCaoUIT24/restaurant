require('dotenv').config();
const { prisma } = require('./src/config/db');

async function checkUserDetails() {
  console.log('=== KIỂM TRA CHI TIẾT USER ===\n');
  
  // Lấy thông tin account admin
  const account = await prisma.taiKhoanNguoiDung.findUnique({
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
  
  if (!account) {
    console.log('❌ Không tìm thấy account "admin"');
    await prisma.$disconnect();
    return;
  }
  
  console.log('✅ Account:', account.username);
  console.log('✅ Employee:', account.nhanVien.hoTen);
  console.log('✅ Role ID:', account.nhanVien.vaiTroId);
  console.log('✅ Role Name:', account.nhanVien.vaiTro?.ten || 'KHÔNG CÓ ROLE');
  console.log();
  
  // Test login để xem user object
  const authService = require('./src/services/auth.service');
  const loginResult = await authService.login({
    username: 'admin',
    password: 'admin123'
  });
  
  console.log('=== USER OBJECT SAU LOGIN ===');
  console.log('ID:', loginResult.user.id);
  console.log('Username:', loginResult.user.username);
  console.log('Họ tên:', loginResult.user.hoTen);
  console.log('Roles array:', JSON.stringify(loginResult.user.roles));
  console.log('Số lượng permissions:', loginResult.user.permissions.length);
  console.log();
  
  // Kiểm tra role name chính xác
  const roleName = loginResult.user.roles[0];
  console.log('=== KIỂM TRA ROLE NAME ===');
  console.log('Role từ login:', `"${roleName}"`);
  console.log('Role type:', typeof roleName);
  console.log('Role length:', roleName?.length);
  console.log('Expected:', '"Admin"');
  console.log('Match?', roleName === 'Admin' ? '✅ YES' : '❌ NO');
  console.log();
  
  // Kiểm tra requireAdmin middleware
  const { requireAdmin } = require('./src/middleware/rbac');
  const req = {
    user: loginResult.user
  };
  
  let adminPassed = false;
  requireAdmin()(req, {
    status: (code) => ({
      json: (data) => {
        console.log('❌ requireAdmin() FAILED');
        console.log('   Status:', code);
        console.log('   Data:', data);
      }
    })
  }, () => {
    adminPassed = true;
  });
  
  if (adminPassed) {
    console.log('✅ requireAdmin() middleware PASSED');
  }
  console.log();
  
  // Liệt kê một số permissions quan trọng
  console.log('=== PERMISSIONS CỤ THỂ ===');
  const importantPerms = [
    'STOCK_VIEW',
    'STOCK_MANAGE',
    'ACCOUNT_CREATE',
    'ACCOUNT_MANAGE',
    'ACCOUNT_DELETE'
  ];
  
  importantPerms.forEach(perm => {
    const has = loginResult.user.permissions.includes(perm);
    console.log(`${has ? '✅' : '❌'} ${perm}`);
  });
  console.log();
  
  // Kiểm tra xem routes nào bị block
  console.log('=== ROUTES SẼ BỊ BLOCK ===');
  if (!adminPassed) {
    console.log('❌ GET /api/admin/users - requireAdmin()');
    console.log('❌ GET /api/admin/roles - requireAdmin()');
    console.log('❌ GET /api/admin/permissions - requireAdmin()');
    console.log('❌ POST /api/admin/roles - requireAdmin()');
    console.log('❌ PUT /api/admin/roles/:id - requireAdmin()');
    console.log('❌ DELETE /api/admin/roles/:id - requireAdmin()');
    console.log('❌ GET /api/admin/audit - requireAdmin()');
    console.log('❌ GET /api/admin/config - requireAdmin()');
    console.log();
    console.log('VẤN ĐỀ: Role name không phải "Admin" hoặc không có trong roles array!');
  } else {
    console.log('✅ Tất cả routes requireAdmin() sẽ hoạt động');
  }
  
  await prisma.$disconnect();
}

checkUserDetails().catch(console.error);
