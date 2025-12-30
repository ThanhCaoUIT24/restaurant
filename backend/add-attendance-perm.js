/* Script to add ATTENDANCE_VIEW permission to all staff roles */
require('dotenv').config();
const { prisma } = require('./src/config/db');

async function addAttendancePermission() {
    console.log('🔧 Adding ATTENDANCE_VIEW to staff roles...\n');

    // 1. Get or create ATTENDANCE_VIEW permission
    let attendancePermission = await prisma.quyen.findFirst({
        where: { ma: 'ATTENDANCE_VIEW' }
    });

    if (!attendancePermission) {
        attendancePermission = await prisma.quyen.create({
            data: { ma: 'ATTENDANCE_VIEW', moTa: 'Xem chấm công' }
        });
        console.log('✅ Created ATTENDANCE_VIEW permission');
    } else {
        console.log('✅ ATTENDANCE_VIEW permission exists');
    }

    // 2. Get staff roles
    const staffRoles = ['ThuNgan', 'PhucVu', 'Bep', 'ThuKho'];

    for (const roleName of staffRoles) {
        const role = await prisma.vaiTro.findFirst({
            where: { ten: roleName }
        });

        if (!role) {
            console.log(`⚠️ Role ${roleName} not found, skipping...`);
            continue;
        }

        // Check if already has permission
        const existing = await prisma.vaiTroQuyen.findFirst({
            where: {
                vaiTroId: role.id,
                quyenId: attendancePermission.id
            }
        });

        if (existing) {
            console.log(`✅ ${roleName} already has ATTENDANCE_VIEW`);
        } else {
            await prisma.vaiTroQuyen.create({
                data: {
                    vaiTroId: role.id,
                    quyenId: attendancePermission.id
                }
            });
            console.log(`✅ Added ATTENDANCE_VIEW to ${roleName}`);
        }
    }

    console.log('\n🎉 Done! Please log out and log in again to see the changes.');
}

addAttendancePermission()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
