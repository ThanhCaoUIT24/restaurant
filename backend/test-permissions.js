const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.taiKhoanNguoiDung.findUnique({
      where: { username: 'admin' },
      include: {
        nhanVien: {
          include: {
            vaiTro: {
              include: {
                quyen: {
                  include: { quyen: true },
                },
              },
            },
          },
        },
      },
    });

    console.log('=== ADMIN USER ===');
    console.log('Username:', admin?.username);
    console.log('Employee:', admin?.nhanVien?.hoTen);
    console.log('Role:', admin?.nhanVien?.vaiTro?.ten);
    console.log('VaiTroQuyen count:', admin?.nhanVien?.vaiTro?.quyen?.length || 0);
    
    if (admin?.nhanVien?.vaiTro?.quyen && admin.nhanVien.vaiTro.quyen.length > 0) {
      console.log('\n=== PERMISSIONS ===');
      admin.nhanVien.vaiTro.quyen.slice(0, 10).forEach((vq, idx) => {
        console.log(`${idx + 1}. ${vq.quyen?.ma || 'NULL'}`);
      });
      if (admin.nhanVien.vaiTro.quyen.length > 10) {
        console.log(`... and ${admin.nhanVien.vaiTro.quyen.length - 10} more`);
      }
    } else {
      console.log('\n⚠️ NO PERMISSIONS FOUND IN DATABASE!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
