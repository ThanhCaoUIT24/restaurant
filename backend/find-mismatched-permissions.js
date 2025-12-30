require('dotenv').config();
const { prisma } = require('./src/config/db');

async function findMismatchedPermissions() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     TÌM PERMISSIONS KHÔNG KHỚP GIỮA FRONTEND-BACKEND     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Permissions frontend đang dùng trong routes
  const frontendPermissions = [
    'TABLE_VIEW',
    'MENU_MANAGE',
    'ORDER_CREATE',
    'ORDER_VIEW', 
    'INVENTORY_ADJUST',  // ❌ Không tồn tại
    'PURCHASE_APPROVE',  // ❌ Backend có PO_APPROVE
    'HR_MANAGE',
    'REPORT_VIEW',
    'ORDER_VOID_APPROVE',
    'ADMIN_MANAGE',      // ❌ Không tồn tại
  ];

  // Permissions trong database
  const dbPermissions = await prisma.quyen.findMany({
    select: { ma: true }
  });
  const dbPermissionCodes = dbPermissions.map(p => p.ma);

  console.log('📋 Permissions Frontend đang dùng trong routes:');
  console.log('─'.repeat(60));
  frontendPermissions.forEach(p => {
    const exists = dbPermissionCodes.includes(p);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${p}`);
  });

  console.log('\n');
  console.log('🔍 Permissions KHÔNG TỒN TẠI trong Backend:');
  console.log('─'.repeat(60));
  
  const missing = frontendPermissions.filter(p => !dbPermissionCodes.includes(p));
  if (missing.length === 0) {
    console.log('✅ Không có permission nào thiếu!');
  } else {
    missing.forEach(p => {
      console.log(`❌ ${p}`);
      
      // Gợi ý thay thế
      if (p === 'INVENTORY_ADJUST') {
        console.log('   → Thay bằng: STOCK_MANAGE hoặc STOCK_VIEW');
      } else if (p === 'PURCHASE_APPROVE') {
        console.log('   → Thay bằng: PO_APPROVE');
      } else if (p === 'ADMIN_MANAGE') {
        console.log('   → Thay bằng: ACCOUNT_MANAGE');
      }
    });
  }

  console.log('\n');
  console.log('💡 GIẢI PHÁP:');
  console.log('─'.repeat(60));
  console.log('1. SỬA FRONTEND routes.jsx:');
  console.log('   - INVENTORY_ADJUST → STOCK_VIEW');
  console.log('   - PURCHASE_APPROVE → PO_APPROVE');
  console.log('   - ADMIN_MANAGE → ACCOUNT_MANAGE');
  console.log('');
  console.log('2. HOẶC THÊM VÀO DATABASE (không khuyến khích):');
  console.log('   - Thêm INVENTORY_ADJUST, PURCHASE_APPROVE, ADMIN_MANAGE');
  console.log('');

  await prisma.$disconnect();
}

findMismatchedPermissions();
