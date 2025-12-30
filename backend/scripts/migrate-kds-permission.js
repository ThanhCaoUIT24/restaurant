/*
  Migrate permission 'KDS_ACCESS' -> 'KDS_VIEW'
  Usage: node backend/scripts/migrate-kds-permission.js
*/
const { prisma } = require('../src/config/db');

async function main() {
  const oldMa = 'KDS_ACCESS';
  const newMa = 'KDS_VIEW';

  const oldPerm = await prisma.quyen.findUnique({ where: { ma: oldMa } });
  if (!oldPerm) {
    console.log(`No existing permission with ma='${oldMa}' found. Nothing to migrate.`);
    return;
  }

  // Create or find the new permission
  let newPerm = await prisma.quyen.findUnique({ where: { ma: newMa } });
  if (!newPerm) {
    newPerm = await prisma.quyen.create({ data: { ma: newMa, moTa: `${newMa} (migrated)` } });
    console.log(`Created new permission '${newMa}' (id=${newPerm.id}).`);
  } else {
    console.log(`Found existing permission '${newMa}' (id=${newPerm.id}).`);
  }

  // Move role-permission links from oldPerm to newPerm
  const updated = await prisma.vaiTroQuyen.updateMany({
    where: { quyenId: oldPerm.id },
    data: { quyenId: newPerm.id },
  });

  console.log(`Updated ${updated.count} role-permission links to use '${newMa}'.`);

  // Delete the old permission row
  try {
    await prisma.quyen.delete({ where: { id: oldPerm.id } });
    console.log(`Deleted old permission '${oldMa}' (id=${oldPerm.id}).`);
  } catch (err) {
    console.warn(`Failed to delete old permission (it may have been removed already): ${err.message}`);
  }

  console.log('Migration finished. You may re-run the seed to ensure all roles contain the canonical permission.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
