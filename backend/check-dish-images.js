// Script để kiểm tra hình ảnh món ăn trong database
const { prisma } = require('./src/config/db');

async function checkDishImages() {
  try {
    const dishes = await prisma.monAn.findMany({
      select: { id: true, ten: true, hinhAnh: true },
      orderBy: { ten: 'asc' },
    });

    console.log('=== DANH SÁCH HÌNH ẢNH MÓN ĂN ===\n');
    console.log(`Tổng số món: ${dishes.length}\n`);

    let withImage = 0;
    let withoutImage = 0;

    dishes.forEach((dish) => {
      if (dish.hinhAnh) {
        withImage++;
        console.log(`✓ ${dish.ten}: ${dish.hinhAnh}`);
      } else {
        withoutImage++;
        console.log(`✗ ${dish.ten}: KHÔNG CÓ HÌNH`);
      }
    });

    console.log(`\n=== THỐNG KÊ ===`);
    console.log(`Có hình: ${withImage}`);
    console.log(`Không có hình: ${withoutImage}`);

  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDishImages();
