const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addNewEmployees() {
  try {
    // Get role IDs
    const phucVuRole = await prisma.vaiTro.findFirst({ where: { ten: 'PhucVu' } });
    const bepRole = await prisma.vaiTro.findFirst({ where: { ten: 'Bep' } });
    
    // Add 3 new employees without accounts
    const newEmployees = await prisma.nhanVien.createMany({
      data: [
        {
          hoTen: 'Nguyễn Văn Phục Vụ 3',
          soDienThoai: '0901234567',
          vaiTroId: phucVuRole.id,
        },
        {
          hoTen: 'Trần Thị Phục Vụ 4',
          soDienThoai: '0902234567',
          vaiTroId: phucVuRole.id,
        },
        {
          hoTen: 'Lê Văn Bếp 3',
          soDienThoai: '0903234567',
          vaiTroId: bepRole.id,
        },
      ],
    });
    
    console.log('✅ Đã thêm', newEmployees.count, 'nhân viên mới');
    console.log('→ Bây giờ có thể tạo tài khoản cho họ!');
    
    // List all employees without accounts
    const withoutAccount = await prisma.nhanVien.findMany({
      where: { taiKhoan: null },
      select: { id: true, hoTen: true, vaiTro: { select: { ten: true } } },
    });
    
    console.log('\n📋 Nhân viên chưa có tài khoản:');
    withoutAccount.forEach(e => {
      console.log(`  - ${e.hoTen} (${e.vaiTro?.ten})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addNewEmployees();
