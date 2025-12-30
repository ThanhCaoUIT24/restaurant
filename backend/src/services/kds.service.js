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
  const updated = await prisma.chiTietDonHang.update({
    where: { id: itemId },
    data: { trangThai: status },
  });
  return { message: 'Item status updated', itemId, status: updated.trangThai };
};

module.exports = { listByStation, updateItemStatus };
