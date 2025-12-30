const { prisma } = require('../config/db');

const mapRoleToUiCode = (roleName) => {
  if (!roleName) return null;
  const s = String(roleName).toLowerCase();
  if (s === 'admin') return 'QUANLY';
  if (s.includes('manager') || s.includes('quanly') || s.includes('quản lý')) return 'QUANLY';
  if (s.includes('thungan') || s.includes('thu ngan')) return 'THUNGAN';
  if (s.includes('phucvu') || s.includes('phục vụ') || s.includes('phuc vu')) return 'PHUCVU';
  if (s.includes('thukho') || s.includes('thủ kho') || s.includes('thu kho')) return 'THUKHO';
  if (s.includes('bep')) return 'BEPCHINH';
  return roleName;
};

// ==================== SHIFTS (Ca làm việc) ====================

const listShifts = async () => {
  const items = await prisma.caLamViec.findMany({
    orderBy: { batDau: 'asc' },
  });
  return {
    items: items.map((s) => ({
      id: s.id,
      ten: s.ten,
      batDau: s.batDau,
      ketThuc: s.ketThuc,
    })),
  };
};

const createShift = async (payload) => {
  const { ten, batDau, ketThuc } = payload;
  if (!ten || !batDau || !ketThuc) {
    throw Object.assign(new Error('Thiếu thông tin ca làm việc'), { status: 400 });
  }
  const shift = await prisma.caLamViec.create({
    data: { ten, batDau, ketThuc },
  });
  return { message: 'Tạo ca làm việc thành công', shift };
};

const updateShift = async (id, payload) => {
  const { ten, batDau, ketThuc } = payload;
  const shift = await prisma.caLamViec.update({
    where: { id },
    data: {
      ...(ten && { ten }),
      ...(batDau && { batDau }),
      ...(ketThuc && { ketThuc }),
    },
  }).catch(() => null);
  if (!shift) throw Object.assign(new Error('Ca làm việc không tồn tại'), { status: 404 });
  return { message: 'Cập nhật ca làm việc thành công', shift };
};

const deleteShift = async (id) => {
  // Check if shift is used in schedules
  const count = await prisma.lichPhanCa.count({ where: { caLamViecId: id } });
  if (count > 0) {
    throw Object.assign(new Error('Không thể xóa ca đang được sử dụng'), { status: 400 });
  }
  await prisma.caLamViec.delete({ where: { id } }).catch(() => null);
  return { message: 'Xóa ca làm việc thành công' };
};

// ==================== EMPLOYEES (Nhân viên) ====================

const listEmployees = async () => {
  const items = await prisma.nhanVien.findMany({
    include: { vaiTro: true },
    orderBy: { hoTen: 'asc' },
  });
  return {
    items: items.map((e) => ({
      id: e.id,
      hoTen: e.hoTen,
      soDienThoai: e.soDienThoai,
      vaiTroId: e.vaiTroId || null,
      chucVu: mapRoleToUiCode(e.vaiTro?.ten),
      trangThai: 'HOATDONG',
    })),
  };
};

const createEmployee = async (payload) => {
  const { hoTen, soDienThoai, vaiTroId, vaiTro } = payload;
  if (!hoTen) throw Object.assign(new Error('Họ tên không được để trống'), { status: 400 });
  if (!soDienThoai) throw Object.assign(new Error('Số điện thoại không được để trống'), { status: 400 });

  let resolvedRoleId = vaiTroId || null;
  if (!resolvedRoleId && vaiTro) {
    const found = await prisma.vaiTro.findFirst({ where: { ten: String(vaiTro) } });
    resolvedRoleId = found?.id || null;
  }

  const employee = await prisma.nhanVien.create({
    data: {
      hoTen,
      soDienThoai,
      ...(resolvedRoleId && { vaiTroId: resolvedRoleId }),
    },
    include: { vaiTro: true },
  });
  return {
    message: 'Thêm nhân viên thành công',
    employee: {
      id: employee.id,
      hoTen: employee.hoTen,
      soDienThoai: employee.soDienThoai,
      vaiTroId: employee.vaiTroId || null,
      chucVu: mapRoleToUiCode(employee.vaiTro?.ten),
      trangThai: 'HOATDONG',
    },
  };
};

const updateEmployee = async (id, payload) => {
  const { hoTen, soDienThoai, vaiTroId, vaiTro } = payload;

  let resolvedRoleId = vaiTroId;
  if (!resolvedRoleId && vaiTro) {
    const found = await prisma.vaiTro.findFirst({ where: { ten: String(vaiTro) } });
    resolvedRoleId = found?.id;
  }

  const employee = await prisma.nhanVien.update({
    where: { id },
    data: {
      ...(hoTen && { hoTen }),
      ...(soDienThoai !== undefined && { soDienThoai: soDienThoai || null }),
      ...(resolvedRoleId !== undefined && { vaiTroId: resolvedRoleId || null }),
    },
    include: { vaiTro: true },
  }).catch(() => null);
  if (!employee) throw Object.assign(new Error('Nhân viên không tồn tại'), { status: 404 });
  return {
    message: 'Cập nhật nhân viên thành công',
    employee: {
      id: employee.id,
      hoTen: employee.hoTen,
      soDienThoai: employee.soDienThoai,
      vaiTroId: employee.vaiTroId || null,
      chucVu: mapRoleToUiCode(employee.vaiTro?.ten),
      trangThai: 'HOATDONG',
    },
  };
};

const deleteEmployee = async (id) => {
  // Check if employee exists
  const employee = await prisma.nhanVien.findUnique({ where: { id } });
  if (!employee) {
    throw Object.assign(new Error('Nhân viên không tồn tại'), { status: 404 });
  }

  // Check if employee has user account
  const accountCount = await prisma.taiKhoanNguoiDung.count({ where: { nhanVienId: id } });
  if (accountCount > 0) {
    throw Object.assign(new Error('Không thể xóa nhân viên đang có tài khoản. Hãy xóa tài khoản trước'), { status: 400 });
  }

  // Check if employee has schedules
  const scheduleCount = await prisma.lichPhanCa.count({ where: { nhanVienId: id } });
  if (scheduleCount > 0) {
    throw Object.assign(new Error('Không thể xóa nhân viên đang có lịch phân ca'), { status: 400 });
  }

  // Check if employee has orders
  const orderCount = await prisma.donHang.count({ where: { nhanVienId: id } });
  if (orderCount > 0) {
    throw Object.assign(new Error('Không thể xóa nhân viên đã tạo đơn hàng'), { status: 400 });
  }

  // Check if employee has cashier shifts
  const shiftCount = await prisma.caThuNgan.count({ where: { nhanVienId: id } });
  if (shiftCount > 0) {
    throw Object.assign(new Error('Không thể xóa nhân viên đã có ca thu ngân'), { status: 400 });
  }

  // Check if employee has import receipts
  const importCount = await prisma.phieuNhapKho.count({ where: { nhanVienId: id } });
  if (importCount > 0) {
    throw Object.assign(new Error('Không thể xóa nhân viên đã tạo phiếu nhập kho'), { status: 400 });
  }

  // Check if employee has void requests
  const voidRequestCount = await prisma.yeuCauHuyMon.count({
    where: { OR: [{ nguoiYeuCauId: id }, { nguoiDuyetId: id }] },
  });
  if (voidRequestCount > 0) {
    throw Object.assign(new Error('Không thể xóa nhân viên có yêu cầu hủy món liên kết'), { status: 400 });
  }

  await prisma.nhanVien.delete({ where: { id } });
  return { message: 'Xóa nhân viên thành công' };
};

// ==================== SCHEDULES (Lịch phân ca) ====================

const listSchedules = async (query = {}) => {
  const where = {};

  // Filter by date range
  if (query.startDate || query.endDate) {
    where.ngay = {};
    if (query.startDate) where.ngay.gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.ngay.lte = end;
    }
  }

  // Filter by employee
  if (query.nhanVienId) where.nhanVienId = query.nhanVienId;

  const items = await prisma.lichPhanCa.findMany({
    where,
    include: {
      nhanVien: true,
      caLamViec: true,
      chamCong: true,
    },
    orderBy: { ngay: 'desc' },
  });

  return {
    items: items.map((s) => ({
      id: s.id,
      ngay: s.ngay,
      nhanVien: s.nhanVien ? { id: s.nhanVien.id, hoTen: s.nhanVien.hoTen } : null,
      caLamViec: s.caLamViec ? { id: s.caLamViec.id, ten: s.caLamViec.ten, batDau: s.caLamViec.batDau, ketThuc: s.caLamViec.ketThuc } : null,
      chamCong: s.chamCong.map((c) => ({
        id: c.id,
        thoiGianVao: c.thoiGianVao,
        thoiGianRa: c.thoiGianRa,
        trangThai: c.trangThai,
      })),
    })),
  };
};

const createSchedule = async (payload) => {
  const { nhanVienId, caLamViecId, ngay } = payload;

  if (!nhanVienId || !caLamViecId || !ngay) {
    throw Object.assign(new Error('Thiếu thông tin phân ca'), { status: 400 });
  }

  // Check if employee already has schedule for this day and shift
  const existing = await prisma.lichPhanCa.findFirst({
    where: {
      nhanVienId,
      caLamViecId,
      ngay: new Date(ngay),
    },
  });
  if (existing) {
    throw Object.assign(new Error('Nhân viên đã có lịch cho ca này'), { status: 400 });
  }

  const sched = await prisma.lichPhanCa.create({
    data: { nhanVienId, caLamViecId, ngay: new Date(ngay) },
    include: { nhanVien: true, caLamViec: true },
  });
  return { message: 'Tạo lịch phân ca thành công', schedule: sched };
};

const updateSchedule = async (id, payload) => {
  const { nhanVienId, caLamViecId, ngay } = payload;

  const existing = await prisma.lichPhanCa.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Lịch phân ca không tồn tại'), { status: 404 });

  const sched = await prisma.lichPhanCa.update({
    where: { id },
    data: {
      ...(nhanVienId && { nhanVienId }),
      ...(caLamViecId && { caLamViecId }),
      ...(ngay && { ngay: new Date(ngay) }),
    },
    include: { nhanVien: true, caLamViec: true },
  });
  return { message: 'Cập nhật lịch phân ca thành công', schedule: sched };
};

const deleteSchedule = async (id) => {
  // Delete related attendance records first
  await prisma.chamCong.deleteMany({ where: { lichPhanCaId: id } });
  await prisma.lichPhanCa.delete({ where: { id } }).catch(() => null);
  return { message: 'Xóa lịch phân ca thành công' };
};

// Bulk create schedules for a week
const createBulkSchedules = async (payload) => {
  const { nhanVienId, caLamViecId, startDate, endDate } = payload;

  if (!nhanVienId || !caLamViecId || !startDate || !endDate) {
    throw Object.assign(new Error('Thiếu thông tin'), { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const schedules = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const existing = await prisma.lichPhanCa.findFirst({
      where: { nhanVienId, caLamViecId, ngay: new Date(dateStr) },
    });
    if (!existing) {
      schedules.push({ nhanVienId, caLamViecId, ngay: new Date(dateStr) });
    }
  }

  if (schedules.length > 0) {
    await prisma.lichPhanCa.createMany({ data: schedules });
  }

  return { message: `Đã tạo ${schedules.length} lịch phân ca`, count: schedules.length };
};

// ==================== ATTENDANCE (Chấm công) ====================

const checkIn = async (user) => {
  if (!user?.id) throw Object.assign(new Error('Thiếu thông tin nhân viên'), { status: 400 });
  const today = new Date();
  const startOfDay = new Date(today.toDateString());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  // Check for existing open check-in
  const existing = await prisma.chamCong.findFirst({
    where: {
      lichPhanCa: {
        nhanVienId: user.id,
        ngay: { gte: startOfDay, lt: endOfDay },
      },
      thoiGianRa: null,
    },
    orderBy: { thoiGianVao: 'desc' },
  });
  if (existing) return existing;

  // Find or create schedule for today
  let schedule = await prisma.lichPhanCa.findFirst({
    where: {
      nhanVienId: user.id,
      ngay: { gte: startOfDay, lt: endOfDay },
    },
  });

  if (!schedule) {
    // Get default shift or first shift
    const defaultShift = await prisma.caLamViec.findFirst();
    schedule = await prisma.lichPhanCa.create({
      data: {
        nhanVienId: user.id,
        caLamViecId: defaultShift?.id || null,
        ngay: startOfDay,
      },
    });
  }

  const record = await prisma.chamCong.create({
    data: {
      lichPhanCaId: schedule.id,
      thoiGianVao: new Date(),
      trangThai: 'LAMVIEC',
    },
  });
  return record;
};

const checkOut = async (user) => {
  if (!user?.id) throw Object.assign(new Error('Thiếu thông tin nhân viên'), { status: 400 });

  const record = await prisma.chamCong.findFirst({
    where: {
      lichPhanCa: { nhanVienId: user.id },
      thoiGianRa: null,
    },
    orderBy: { thoiGianVao: 'desc' },
  });

  if (!record) throw Object.assign(new Error('Chưa check-in'), { status: 400 });

  const updated = await prisma.chamCong.update({
    where: { id: record.id },
    data: { thoiGianRa: new Date(), trangThai: 'DAXONG' },
  });
  return updated;
};

const attendanceReport = async (query = {}) => {
  const where = {};

  if (query.nhanVienId) {
    where.lichPhanCa = { nhanVienId: query.nhanVienId };
  }

  if (query.startDate || query.endDate) {
    where.thoiGianVao = {};
    if (query.startDate) where.thoiGianVao.gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.thoiGianVao.lte = end;
    }
  }

  const items = await prisma.chamCong.findMany({
    where,
    include: { lichPhanCa: { include: { nhanVien: true, caLamViec: true } } },
    orderBy: { thoiGianVao: 'desc' },
  });

  return {
    items: items.map((r) => {
      const hours = r.thoiGianVao && r.thoiGianRa
        ? (new Date(r.thoiGianRa) - new Date(r.thoiGianVao)) / 3600000
        : null;
      return {
        id: r.id,
        thoiGianVao: r.thoiGianVao,
        thoiGianRa: r.thoiGianRa,
        trangThai: r.trangThai,
        hours,
        lichPhanCa: r.lichPhanCa ? {
          ngay: r.lichPhanCa.ngay,
          nhanVien: r.lichPhanCa.nhanVien ? { id: r.lichPhanCa.nhanVien.id, hoTen: r.lichPhanCa.nhanVien.hoTen } : null,
          caLamViec: r.lichPhanCa.caLamViec ? { ten: r.lichPhanCa.caLamViec.ten } : null,
        } : null,
      };
    }),
  };
};

module.exports = {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createBulkSchedules,
  checkIn,
  checkOut,
  attendanceReport,
};
