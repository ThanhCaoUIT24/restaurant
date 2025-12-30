require('dotenv').config();
const { prisma } = require('./src/config/db');

async function checkAdminPermissions() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        KIỂM TRA CHI TIẾT PERMISSIONS CỦA ADMIN           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Lấy tất cả permissions có trong hệ thống
    const allPermissions = await prisma.quyen.findMany({
      orderBy: { ma: 'asc' }
    });
    
    console.log(`📊 Tổng số permissions trong hệ thống: ${allPermissions.length}`);
    console.log('─'.repeat(60));
    allPermissions.forEach((p, i) => {
      console.log(`${(i+1).toString().padStart(2, ' ')}. ${p.ma.padEnd(25, ' ')} - ${p.moTa || 'N/A'}`);
    });
    
    console.log('\n');
    
    // 2. Lấy permissions của Admin role
    const adminRole = await prisma.vaiTro.findFirst({
      where: { ten: 'Admin' },
      include: {
        quyen: {
          include: {
            quyen: true
          }
        }
      }
    });
    
    if (!adminRole) {
      console.log('❌ KHÔNG TÌM THẤY ROLE ADMIN!\n');
      process.exit(1);
    }
    
    const adminPermissions = adminRole.quyen.map(vq => vq.quyen.ma);
    
    console.log(`👑 Admin có ${adminPermissions.length} permissions:`);
    console.log('─'.repeat(60));
    adminPermissions.sort().forEach((p, i) => {
      console.log(`${(i+1).toString().padStart(2, ' ')}. ${p}`);
    });
    
    console.log('\n');
    
    // 3. So sánh - tìm permissions bị thiếu
    const allPermissionCodes = allPermissions.map(p => p.ma);
    const missingPermissions = allPermissionCodes.filter(p => !adminPermissions.includes(p));
    
    if (missingPermissions.length > 0) {
      console.log(`⚠️  ADMIN THIẾU ${missingPermissions.length} PERMISSIONS:`);
      console.log('─'.repeat(60));
      missingPermissions.forEach((p, i) => {
        const permDetail = allPermissions.find(perm => perm.ma === p);
        console.log(`${(i+1).toString().padStart(2, ' ')}. ${p.padEnd(25, ' ')} - ${permDetail?.moTa || 'N/A'}`);
      });
      console.log('\n');
      
      // 4. Gợi ý fix
      console.log('💡 ĐỀ XUẤT SỬA LỖI:');
      console.log('─'.repeat(60));
      console.log('Chạy lệnh sau để thêm tất cả permissions cho Admin:');
      console.log('\nnode fix-admin-permissions.js\n');
      
    } else {
      console.log('✅ ADMIN CÓ ĐẦY ĐỦ TẤT CẢ PERMISSIONS!\n');
    }
    
    // 5. Kiểm tra admin account thực tế
    const adminAccount = await prisma.taiKhoanNguoiDung.findFirst({
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
    
    if (adminAccount) {
      console.log('👤 Admin Account Info:');
      console.log('─'.repeat(60));
      console.log(`Username: ${adminAccount.username}`);
      console.log(`Employee: ${adminAccount.nhanVien?.hoTen}`);
      console.log(`Role: ${adminAccount.nhanVien?.vaiTro?.ten}`);
      console.log(`Permissions: ${adminAccount.nhanVien?.vaiTro?.quyen?.length || 0}`);
      console.log('');
    }
    
    // 6. Test login và kiểm tra JWT token
    console.log('🔐 Testing Login Service:');
    console.log('─'.repeat(60));
    const authService = require('./src/services/auth.service');
    const loginResult = await authService.login({
      username: 'admin',
      password: 'admin123'
    });
    
    console.log(`User permissions in JWT: ${loginResult.user.permissions.length}`);
    console.log(`Match with database? ${loginResult.user.permissions.length === adminPermissions.length ? '✅ YES' : '❌ NO'}`);
    console.log('');
    
    // 7. Tóm tắt
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                        TÓM TẮT                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`Tổng permissions hệ thống: ${allPermissions.length}`);
    console.log(`Admin có: ${adminPermissions.length}`);
    console.log(`Thiếu: ${missingPermissions.length}`);
    console.log(`JWT token: ${loginResult.user.permissions.length}`);
    
    if (missingPermissions.length === 0) {
      console.log('\n✅ HỆ THỐNG HOẠT ĐỘNG CHÍNH XÁC!\n');
    } else {
      console.log('\n⚠️  CẦN SỬA: ADMIN THIẾU PERMISSIONS!\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPermissions();
