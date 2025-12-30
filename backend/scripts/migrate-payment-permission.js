/*
  Script to migrate legacy permission code PAYMENT_PROCESS -> PAYMENT_EXECUTE
  Usage: node scripts/migrate-payment-permission.js
*/
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration: PAYMENT_PROCESS -> PAYMENT_EXECUTE');

  const old = await prisma.quyen.findUnique({ where: { ma: 'PAYMENT_PROCESS' } });
  const neu = await prisma.quyen.findUnique({ where: { ma: 'PAYMENT_EXECUTE' } });

  if (!old) {
    console.log('No legacy permission PAYMENT_PROCESS found - nothing to do.');
    return;
  }

  if (!neu) {
    // Safe to rename
    await prisma.quyen.update({ where: { id: old.id }, data: { ma: 'PAYMENT_EXECUTE', moTa: old.moTa || 'PAYMENT_EXECUTE' } });
    console.log('Renamed PAYMENT_PROCESS to PAYMENT_EXECUTE');
    return;
  }

  // Both exist: move associations from old -> neu, then delete old
  const oldId = old.id;
  const newId = neu.id;

  // Find any role-permission links pointing to oldId
  const links = await prisma.vaiTroQuyen.findMany({ where: { quyenId: oldId } });
  console.log(`Found ${links.length} role-permission links to PAYMENT_PROCESS; moving to PAYMENT_EXECUTE`);

  for (const link of links) {
    // Upsert a link for the same role -> newId if not exists
    await prisma.vaiTroQuyen.upsert({
      where: { vaiTroId_quyenId: { vaiTroId: link.vaiTroId, quyenId: newId } },
      update: {},
      create: { vaiTroId: link.vaiTroId, quyenId: newId },
    });
    // Remove old link
    await prisma.vaiTroQuyen.delete({ where: { id: link.id } });
  }

  // Remove the old permission record
  await prisma.quyen.delete({ where: { id: oldId } });
  console.log('Migration completed: legacy PAYMENT_PROCESS removed and associations moved.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
