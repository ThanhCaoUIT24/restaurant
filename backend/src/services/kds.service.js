const { prisma } = require('../config/db');
const { ORDER_STATUS } = require('../utils/constants');

const listByStation = async (station) => {
  const items = await prisma.chiTietDonHang.findMany({
    where: {
      // Include DAHUY items to show them with visual indicators
      // Only exclude DAPHUCVU (already served)
      trangThai: { not: ORDER_STATUS.DAPHUCVU },
      donHang: { trangThai: 'SENT' },
      monAn: station ? { tramCheBien: station } : undefined,
    },
    include: {
      monAn: true,
      donHang: { include: { ban: true } },
      tuyChon: { include: { tuyChonMon: true } },
    },
    orderBy: [{ donHang: { createdAt: 'asc' } }, { id: 'asc' }],
  });

  // Group by order ticket
  const byOrder = new Map();
  items.forEach((item) => {
    const key = item.donHangId;
    if (!byOrder.has(key)) {
      byOrder.set(key, {
        id: key,
        ban: item.donHang?.ban,
        table: item.donHang?.ban?.ten,
        createdAt: item.donHang?.createdAt,
        items: [],
      });
    }
    byOrder.get(key).items.push(item);
  });

  // remove tickets that are fully served (all items DAPHUCVU)
  // Keep HOANTHANH items visible so waiters can click "Đã Ra" to mark as served
  const tickets = Array.from(byOrder.values()).filter((t) =>
    t.items.some((i) => i.trangThai !== ORDER_STATUS.DAPHUCVU),
  );

  // ensure FIFO by created time
  tickets.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

  return { tickets, station };
};

const updateItemStatus = async (itemId, status) => {
  // Get current item status first
  const currentItem = await prisma.chiTietDonHang.findUnique({
    where: { id: itemId },
    select: { trangThai: true }
  });

  if (!currentItem) {
    throw Object.assign(new Error('Không tìm thấy món'), { status: 404 });
  }

  // Validate status transitions
  // DAPHUCVU (Đã ra) can only be set if current status is HOANTHANH (Xong)
  if (status === ORDER_STATUS.DAPHUCVU && currentItem.trangThai !== ORDER_STATUS.HOANTHANH) {
    throw Object.assign(
      new Error('Chỉ có thể đánh dấu "Đã ra" khi món đã hoàn thành (Xong)'),
      { status: 400 }
    );
  }

  const updated = await prisma.chiTietDonHang.update({
    where: { id: itemId },
    data: { trangThai: status },
  });
  return { message: 'Item status updated', itemId, status: updated.trangThai };
};

module.exports = { listByStation, updateItemStatus };
