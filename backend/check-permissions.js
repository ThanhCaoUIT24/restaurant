const { prisma } = require('./src/config/db');

async function checkPermissions() {
  console.log('=== CHECKING ROLES AND PERMISSIONS ===\n');
  
  const roles = await prisma.vaiTro.findMany({
    include: {
      quyen: {
        include: {
          quyen: true
        }
      }
    }
  });
  
  console.log('Roles in database:');
  roles.forEach(role => {
    console.log(`\n${role.ten} (${role.id}):`);
    console.log(`  Description: ${role.moTa || 'N/A'}`);
    console.log(`  Permissions (${role.quyen.length}):`);
    role.quyen.forEach(vq => {
      console.log(`    - ${vq.quyen.ma} (${vq.quyen.moTa || 'N/A'})`);
    });
  });
  
  console.log('\n=== CHECKING SAMPLE ACCOUNT ===\n');
  
  const account = await prisma.taiKhoanNguoiDung.findFirst({
    include: {
      nhanVien: {
        include: {
          vaiTro: {
            include: {
              quyen: {
                include: {
                  quyen: true
                }
              }
            }
          }
        }
      }
    }
  });
  
  if (account) {
    console.log(`Account: ${account.username}`);
    console.log(`Employee: ${account.nhanVien.hoTen}`);
    console.log(`Role: ${account.nhanVien.vaiTro?.ten || 'No role'}`);
    
    if (account.nhanVien.vaiTro) {
      const permissions = account.nhanVien.vaiTro.quyen.map(vq => vq.quyen.ma);
      console.log(`Permissions (${permissions.length}):`);
      permissions.forEach(p => console.log(`  - ${p}`));
    }
  }
  
  await prisma.$disconnect();
}

checkPermissions().catch(console.error);
