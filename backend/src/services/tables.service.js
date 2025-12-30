const { TABLE_STATUS } = require('../utils/constants');
const { prisma } = require('../config/db');

const mapTable = (table, area) => ({
  id: table.id,
  ten: table.ten,
  soGhe: table.soGhe ?? 4,
  trangThai: table.trangThai,
  posX: table.posX ?? null,
  posY: table.posY ?? null,
  width: table.width ?? 120,
  height: table.height ?? 120,
  shape: table.shape || 'rect',
  khuVuc: area ? { id: area.id, ten: area.ten } : null,
  mergedFrom: table.mergedFrom || null, // Track merged tables
});

const list = async () => {
  const areas = await prisma.khuVucBan.findMany({
    include: {
      ban: { orderBy: { ten: 'asc' } },
    },
    orderBy: { ten: 'asc' },
  });

  const standaloneTables = await prisma.ban.findMany({
    where: { khuVucId: null },
    orderBy: { ten: 'asc' },
  });
  const areaList = [...areas];
  if (standaloneTables.length) {
    areaList.push({ id: 'ungrouped', ten: 'Khu vực chung', ban: standaloneTables });
  }

  const tables = areaList.flatMap((area) => area.ban.map((table) => mapTable(table, area)));

  return { items: tables, areas: areaList.map((a) => ({ ...a, ban: a.ban.map((b) => mapTable(b, a)) })) };
};

const getById = async (id) => {
  const table = await prisma.ban.findUnique({
    where: { id },
    include: { khuVuc: true },
  });
  if (!table) throw Object.assign(new Error('Bàn không tồn tại'), { status: 404 });
  return mapTable(table, table.khuVuc);
};

const create = async (payload) => {
  const { ten, soGhe, khuVucId, posX, posY, width, height, shape } = payload;
  if (!ten) throw Object.assign(new Error('Tên bàn là bắt buộc'), { status: 400 });

  const table = await prisma.ban.create({
    data: {
      ten,
      soGhe: soGhe || 4, // Default 4 seats
      khuVucId: khuVucId || null,
      posX: posX || null,
      posY: posY || null,
      width: width || 120,
      height: height || 120,
      shape: shape || 'rect',
      trangThai: 'TRONG',
    },
    include: { khuVuc: true },
  });

  await broadcastTables();
  return { message: 'Tạo bàn thành công', table: mapTable(table, table.khuVuc) };
};

const update = async (id, payload) => {
  const { ten, soGhe, khuVucId, posX, posY, width, height, shape } = payload;

  const table = await prisma.ban.update({
    where: { id },
    data: {
      ...(ten && { ten }),
      ...(soGhe !== undefined && { soGhe }),
      ...(khuVucId !== undefined && { khuVucId: khuVucId || null }),
      ...(posX !== undefined && { posX }),
      ...(posY !== undefined && { posY }),
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),
      ...(shape !== undefined && { shape }),
    },
    include: { khuVuc: true },
  }).catch(() => null);

  if (!table) throw Object.assign(new Error('Bàn không tồn tại'), { status: 404 });
  await broadcastTables();
  return { message: 'Cập nhật bàn thành công', table: mapTable(table, table.khuVuc) };
};

const remove = async (id) => {
  // Check if table exists
  const table = await prisma.ban.findUnique({ where: { id } });
  if (!table) {
    throw Object.assign(new Error('Bàn không tồn tại'), { status: 404 });
  }

  // Check table status - không cho xóa bàn đang có khách hoặc đã đặt
  if (table.trangThai === 'DADAT') {
    throw Object.assign(new Error('Không thể xóa bàn đã được đặt trước'), { status: 400 });
  }
  if (table.trangThai === 'COKHACH') {
    throw Object.assign(new Error('Không thể xóa bàn đang có khách'), { status: 400 });
  }

  // Disconnect orders from table (keep history) - set banId = null
  await prisma.donHang.updateMany({
    where: { banId: id },
    data: { banId: null }
  });

  // Disconnect reservations (banId is optional in DatBan)
  await prisma.datBan.updateMany({
    where: { banId: id },
    data: { banId: null }
  });

  await prisma.ban.delete({ where: { id } });
  await broadcastTables();
  return { message: 'Xóa bàn thành công' };
};


const updateStatus = async (id, status) => {
  if (!status || !TABLE_STATUS[status]) throw Object.assign(new Error('Trạng thái không hợp lệ'), { status: 400 });
  const updated = await prisma.ban.update({
    where: { id },
    data: { trangThai: status },
  }).catch(() => null);
  if (!updated) throw Object.assign(new Error('Bàn không tồn tại'), { status: 404 });
  await broadcastTables();
  return { message: 'Cập nhật trạng thái thành công', id, status };
};

const updatePosition = async (id, position) => {
  const { posX, posY } = position;
  const updated = await prisma.ban.update({
    where: { id },
    data: { posX, posY },
  }).catch(() => null);
  if (!updated) throw Object.assign(new Error('Bàn không tồn tại'), { status: 404 });
  await broadcastTables();
  return { message: 'Cập nhật vị trí thành công', id, posX, posY };
};

// ==================== MERGE TABLES ====================
// Merge multiple tables into one "virtual" merged table
// Orders from source tables are moved to the target table
const merge = async (payload) => {
  const { sourceTableIds, targetTableId } = payload;

  if (!sourceTableIds || sourceTableIds.length === 0) {
    throw Object.assign(new Error('Cần chọn ít nhất một bàn nguồn'), { status: 400 });
  }
  if (!targetTableId) {
    throw Object.assign(new Error('Cần chọn bàn đích'), { status: 400 });
  }

  // Get all tables
  const allTableIds = [...sourceTableIds, targetTableId];
  const tables = await prisma.ban.findMany({
    where: { id: { in: allTableIds } },
    include: { donHang: { where: { trangThai: 'open' } } },
  });

  if (tables.length !== allTableIds.length) {
    throw Object.assign(new Error('Một số bàn không tồn tại'), { status: 404 });
  }

  const targetTable = tables.find((t) => t.id === targetTableId);
  const sourceTables = tables.filter((t) => t.id !== targetTableId);

  // Move all open orders from source tables to target table
  await prisma.$transaction(async (tx) => {
    // Move orders
    for (const source of sourceTables) {
      await tx.donHang.updateMany({
        where: { banId: source.id, trangThai: 'open' },
        data: { banId: targetTableId },
      });
    }

    // Mark source tables as merged (change status or hide)
    await tx.ban.updateMany({
      where: { id: { in: sourceTableIds } },
      data: { trangThai: 'GHEP' }, // Merged status
    });

    // Update target table status
    await tx.ban.update({
      where: { id: targetTableId },
      data: { trangThai: 'DANGPHUCVU' },
    });
  });

  await broadcastTables();

  return {
    message: `Đã gộp ${sourceTables.map((t) => t.ten).join(', ')} vào ${targetTable.ten}`,
    targetTableId,
    sourceTableIds,
  };
};

// ==================== SPLIT TABLE ====================
// Split a table by moving some order items to a new table
const split = async (payload) => {
  const { sourceTableId, newTableId, orderItemIds } = payload;

  if (!sourceTableId) {
    throw Object.assign(new Error('Cần chọn bàn nguồn'), { status: 400 });
  }
  if (!newTableId) {
    throw Object.assign(new Error('Cần chọn bàn đích'), { status: 400 });
  }
  if (!orderItemIds || orderItemIds.length === 0) {
    throw Object.assign(new Error('Cần chọn ít nhất một món để chuyển'), { status: 400 });
  }

  // Get source table and its orders
  const sourceTable = await prisma.ban.findUnique({
    where: { id: sourceTableId },
    include: {
      donHang: {
        where: { trangThai: 'open' },
        include: { chiTiet: true },
      },
    },
  });

  if (!sourceTable) {
    throw Object.assign(new Error('Bàn nguồn không tồn tại'), { status: 404 });
  }

  const newTable = await prisma.ban.findUnique({ where: { id: newTableId } });
  if (!newTable) {
    throw Object.assign(new Error('Bàn đích không tồn tại'), { status: 404 });
  }

  // Check if new table has an open order
  let newOrder = await prisma.donHang.findFirst({
    where: { banId: newTableId, trangThai: 'open' },
  });

  await prisma.$transaction(async (tx) => {
    // Create new order on target table if needed
    if (!newOrder) {
      const sourceOrder = sourceTable.donHang[0];
      newOrder = await tx.donHang.create({
        data: {
          banId: newTableId,
          nhanVienId: sourceOrder?.nhanVienId || null,
          trangThai: 'open',
        },
      });
    }

    // Move selected order items to new order
    await tx.chiTietDonHang.updateMany({
      where: { id: { in: orderItemIds } },
      data: { donHangId: newOrder.id },
    });

    // Update table statuses
    await tx.ban.update({
      where: { id: newTableId },
      data: { trangThai: 'DANGPHUCVU' },
    });

    // Check if source table still has items
    const remainingItems = await tx.chiTietDonHang.count({
      where: {
        donHang: { banId: sourceTableId, trangThai: 'open' },
      },
    });

    if (remainingItems === 0) {
      // Close empty orders on source table
      await tx.donHang.updateMany({
        where: { banId: sourceTableId, trangThai: 'open' },
        data: { trangThai: 'split' },
      });
      await tx.ban.update({
        where: { id: sourceTableId },
        data: { trangThai: 'TRONG' },
      });
    }
  });

  await broadcastTables();

  return {
    message: `Đã chuyển ${orderItemIds.length} món từ ${sourceTable.ten} sang ${newTable.ten}`,
    sourceTableId,
    newTableId,
    movedItems: orderItemIds.length,
  };
};

// ==================== UNMERGE TABLE ====================
// Restore previously merged tables
const unmerge = async (payload) => {
  const { tableIds } = payload;

  if (!tableIds || tableIds.length === 0) {
    throw Object.assign(new Error('Cần chọn bàn để tách'), { status: 400 });
  }

  await prisma.ban.updateMany({
    where: { id: { in: tableIds }, trangThai: 'GHEP' },
    data: { trangThai: 'TRONG' },
  });

  await broadcastTables();

  return { message: `Đã tách ${tableIds.length} bàn`, tableIds };
};

// ==================== AREAS ====================

const listAreas = async () => {
  const areas = await prisma.khuVucBan.findMany({
    include: { _count: { select: { ban: true } } },
    orderBy: { ten: 'asc' },
  });
  return { items: areas.map((a) => ({ id: a.id, ten: a.ten, soBan: a._count.ban })) };
};

const createArea = async (payload) => {
  const { ten } = payload;
  if (!ten) throw Object.assign(new Error('Tên khu vực là bắt buộc'), { status: 400 });
  const area = await prisma.khuVucBan.create({ data: { ten } });
  return { message: 'Tạo khu vực thành công', area };
};

const updateArea = async (id, payload) => {
  const { ten } = payload;
  const area = await prisma.khuVucBan.update({
    where: { id },
    data: { ten },
  }).catch(() => null);
  if (!area) throw Object.assign(new Error('Khu vực không tồn tại'), { status: 404 });
  return { message: 'Cập nhật khu vực thành công', area };
};

const deleteArea = async (id) => {
  // Move tables to ungrouped first
  await prisma.ban.updateMany({
    where: { khuVucId: id },
    data: { khuVucId: null },
  });
  await prisma.khuVucBan.delete({ where: { id } }).catch(() => null);
  await broadcastTables();
  return { message: 'Xóa khu vực thành công' };
};

// Helper to broadcast table updates
const broadcastTables = async () => {
  try {
    const { broadcastTables: broadcast } = require('../utils/tableStream');
    await broadcast();
  } catch (err) {
    console.error('Broadcast tables error:', err);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  updateStatus,
  updatePosition,
  merge,
  split,
  unmerge,
  listAreas,
  createArea,
  updateArea,
  deleteArea,
};
