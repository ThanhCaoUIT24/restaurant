const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.taiKhoanNguoiDung.findMany({
        include: { nhanVien: true }
    });
    console.log('Users found:', users.length);
    users.forEach(u => {
        console.log(`- ${u.username} (Role: ${u.nhanVien?.vaiTroId})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
