const purchaseService = require('../services/purchase.service');
const { prisma } = require('../config/db');
const { PERMISSIONS } = require('../utils/permissions');

const listPOs = async (req, res, next) => {
  try {
    const data = await purchaseService.list(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createPO = async (req, res, next) => {
  try {
    const data = await purchaseService.create({ ...req.body, nguoiTaoId: req.user.id });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updatePOStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { user } = req;

    // Security check: Only allow PO_APPROVE users to approve (DADUYET)
    // If status is DADUYET (Approve), user MUST have PO_APPROVE role
    if (status === 'DADUYET') {
      if (!user.permissions.includes(PERMISSIONS.PO_APPROVE)) {
        return res.status(403).json({
          message: 'Forbidden - Bạn không có quyền duyệt đơn hàng',
          code: 'FORBIDDEN'
        });
      }
    }

    // For other statuses (DAGUI, DAHUY), standard permissions (PO_CREATE or PO_APPROVE) from route apply

    const data = await purchaseService.updateStatus(req.params.id, status);

    // ==================== NOTIFICATIONS ====================
    try {
      const poId = req.params.id;

      // 1. Notify Manager when Stock Keeper sends for approval (DAGUI)
      if (status === 'DAGUI') {
        // Find employees whose role has PO_APPROVE permission
        const managers = await prisma.nhanVien.findMany({
          where: {
            vaiTro: {
              quyen: {
                some: {
                  quyen: {
                    ma: PERMISSIONS.PO_APPROVE
                  }
                }
              }
            }
          }
        });

        console.log('Found managers to notify:', managers.length);

        for (const manager of managers) {
          if (manager.id !== req.user.id) { // Don't notify self
            const notif = await prisma.thongBao.create({
              data: {
                nguoiNhanId: manager.id,
                tieuDe: 'Đơn hàng mới cần duyệt',
                noiDung: `Đơn hàng ${poId.slice(0, 8)} đang chờ bạn duyệt.`,
                loai: 'PO',
                lienKet: '/purchase/orders',
              }
            });
            broadcastToUser(manager.id, notif);
          }
        }
      }

      // 2. Notify Stock Keeper (Creator) when Approved (DADUYET) or Cancelled (DAHUY)
      if (['DADUYET', 'DAHUY'].includes(status)) {
        // Fetch PO to get creator
        const po = await prisma.donMuaHang.findUnique({
          where: { id: poId },
          include: { nguoiTao: true }
        });

        if (po && po.nguoiTaoId && po.nguoiTaoId !== req.user.id) {
          const action = status === 'DADUYET' ? 'được duyệt' : 'bị hủy';
          const notif = await prisma.thongBao.create({
            data: {
              nguoiNhanId: po.nguoiTaoId,
              tieuDe: `Đơn hàng đã ${action}`,
              noiDung: `Đơn hàng ${poId.slice(0, 8)} của bạn đã ${action} bởi quản lý.`,
              loai: 'PO',
              lienKet: '/purchase/suppliers',
            }
          });
          broadcastToUser(po.nguoiTaoId, notif);
        }
      }
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
      // Suppress error so we don't fail the main request
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createReceipt = async (req, res, next) => {
  try {
    const data = await purchaseService.createReceipt(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const listSuppliers = async (req, res, next) => {
  try {
    const data = await purchaseService.listSuppliers();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const data = await purchaseService.createSupplier(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const data = await purchaseService.updateSupplier(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const data = await purchaseService.deleteSupplier(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPOs,
  createPO,
  updatePOStatus,
  createReceipt,
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
