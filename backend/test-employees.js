const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    // Get all employees
    const allEmployees = await prisma.nhanVien.findMany({
      select: {
        id: true,
        hoTen: true,
        vaiTro: { select: { ten: true } },
        taiKhoan: { select: { username: true } },
      },
    });

    console.log('=== TẤT CẢ NHÂN VIÊN ===');
    console.log('Tổng số nhân viên:', allEmployees.length);
    
    const withAccount = allEmployees.filter(e => e.taiKhoan);
    const withoutAccount = allEmployees.filter(e => !e.taiKhoan);
    
    console.log('\n✅ Nhân viên ĐÃ có tài khoản:', withAccount.length);
    withAccount.forEach(e => {
      console.log(`  - ${e.hoTen} (${e.vaiTro?.ten}) → @${e.taiKhoan?.username}`);
    });
    
    console.log('\n❌ Nhân viên CHƯA có tài khoản:', withoutAccount.length);
    withoutAccount.forEach(e => {
      console.log(`  - ${e.hoTen} (${e.vaiTro?.ten})`);
    });
    
    if (withoutAccount.length === 0) {
      console.log('\n⚠️ WARNING: KHÔNG CÓ nhân viên nào chưa có tài khoản!');
      console.log('   → Nút "Thêm tài khoản" sẽ bị DISABLED');
      console.log('   → Cần tạo thêm nhân viên mới trong bảng NhanVien');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployees();
