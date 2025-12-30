const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const { ORDER_STATUS } = require('../utils/constants');
const { broadcastSnapshot } = require('../utils/kdsStream');

/**
 * Verify manager PIN and check if they have ORDER_VOID_APPROVE permission
 */
const verifyManagerPin = async (managerPin, managerUsername) => {
    if (!managerPin) throw Object.assign(new Error('Cần mã PIN của quản lý'), { status: 400 });

    const managerAccounts = await prisma.taiKhoanNguoiDung.findMany({
        where: {
            ...(managerUsername ? { username: managerUsername } : {}),
            nhanVien: {
                vaiTro: {
                    quyen: {
                        some: { quyen: { ma: 'ORDER_VOID_APPROVE' } },
                    },
                },
            },
        },
        include: { nhanVien: true },
    });

    for (const acc of managerAccounts) {
        const ok = await bcrypt.compare(managerPin, acc.passwordHash);
        if (ok) return acc;
    }
    throw Object.assign(new Error('PIN không hợp lệ hoặc không có quyền'), { status: 401 });
};

/**
 * Create a void request (by waiter)
 */
const createVoidRequest = async (user, payload) => {
    const { orderId, orderItemId, reason } = payload;

    return prisma.$transaction(async (tx) => {
        // Verify order exists
        const order = await tx.donHang.findUnique({
            where: { id: orderId },
            include: { chiTiet: true },
        });
        if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại'), { status: 404 });

        // Verify order item exists and belongs to this order
        const orderItem = await tx.chiTietDonHang.findUnique({
            where: { id: orderItemId },
            include: { monAn: true },
        });
        if (!orderItem || orderItem.donHangId !== orderId) {
            throw Object.assign(new Error('Món không tồn tại trong đơn hàng'), { status: 404 });
        }

        // Check if item is already voided
        if (orderItem.trangThai === ORDER_STATUS.DAHUY) {
            throw Object.assign(new Error('Món đã bị hủy'), { status: 400 });
        }

        // Check if item can be voided (not completed or served)
        if ([ORDER_STATUS.HOANTHANH, ORDER_STATUS.DAPHUCVU].includes(orderItem.trangThai)) {
            throw Object.assign(new Error('Không thể hủy món đã hoàn thành hoặc đã phục vụ'), { status: 400 });
        }

        // Check if there's already a pending void request for this item
        const existingRequest = await tx.yeuCauHuyMon.findFirst({
            where: {
                chiTietDonHangId: orderItemId,
                trangThai: 'PENDING',
            },
        });
        if (existingRequest) {
            throw Object.assign(new Error('Đã có yêu cầu hủy món đang chờ duyệt'), { status: 400 });
        }

        // Create void request
        const voidRequest = await tx.yeuCauHuyMon.create({
            data: {
                donHangId: orderId,
                chiTietDonHangId: orderItemId,
                lyDo: reason,
                nguoiYeuCauId: user?.id || null,
                trangThai: 'PENDING',
            },
            include: {
                donHang: { include: { ban: true } },
                chiTietDonHang: { include: { monAn: true } },
                nguoiYeuCau: true,
            },
        });

        // Log the action
        await tx.nhatKyHeThong.create({
            data: {
                hanhDong: 'CREATE_VOID_REQUEST',
                thongTinBoSung: JSON.stringify({
                    voidRequestId: voidRequest.id,
                    orderId,
                    orderItemId,
                    reason,
                    requestedBy: user?.id || null,
                }),
            },
        });

        return voidRequest;
    });
};

/**
 * List void requests with optional filters
 */
const listVoidRequests = async (query = {}) => {
    const where = {};

    if (query.status) {
        where.trangThai = query.status;
    }

    if (query.orderId) {
        where.donHangId = query.orderId;
    }

    const voidRequests = await prisma.yeuCauHuyMon.findMany({
        where,
        include: {
            donHang: { include: { ban: true } },
            chiTietDonHang: { include: { monAn: true } },
            nguoiYeuCau: true,
            nguoiDuyet: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return { items: voidRequests };
};

/**
 * Approve void request (by manager with PIN)
 */
const approveVoidRequest = async (id, payload, user) => {
    const { managerPin, managerUsername, note } = payload;

    // Verify manager PIN
    const approver = await verifyManagerPin(managerPin, managerUsername);

    return prisma.$transaction(async (tx) => {
        // Get void request
        const voidRequest = await tx.yeuCauHuyMon.findUnique({
            where: { id },
            include: {
                chiTietDonHang: true,
                donHang: true,
            },
        });

        if (!voidRequest) {
            throw Object.assign(new Error('Yêu cầu hủy món không tồn tại'), { status: 404 });
        }

        if (voidRequest.trangThai !== 'PENDING') {
            throw Object.assign(new Error('Yêu cầu đã được xử lý'), { status: 400 });
        }

        // Update void request status
        const updatedRequest = await tx.yeuCauHuyMon.update({
            where: { id },
            data: {
                trangThai: 'APPROVED',
                nguoiDuyetId: approver.nhanVienId,
                ghiChuDuyet: note || null,
                updatedAt: new Date(),
            },
            include: {
                donHang: { include: { ban: true } },
                chiTietDonHang: { include: { monAn: true } },
                nguoiYeuCau: true,
                nguoiDuyet: true,
            },
        });

        // Update order item status to DAHUY
        await tx.chiTietDonHang.update({
            where: { id: voidRequest.chiTietDonHangId },
            data: { trangThai: ORDER_STATUS.DAHUY },
        });

        // Log the approval
        await tx.nhatKyHeThong.create({
            data: {
                hanhDong: 'APPROVE_VOID_REQUEST',
                thongTinBoSung: JSON.stringify({
                    voidRequestId: id,
                    orderId: voidRequest.donHangId,
                    orderItemId: voidRequest.chiTietDonHangId,
                    approvedBy: approver.nhanVienId,
                    approvedUsername: approver.username,
                    note,
                }),
            },
        });

        // Broadcast to KDS and POS for real-time updates
        await broadcastSnapshot().catch(() => { });

        return updatedRequest;
    });
};

/**
 * Reject void request (by manager)
 */
const rejectVoidRequest = async (id, payload, user) => {
    const { reason } = payload;

    return prisma.$transaction(async (tx) => {
        // Get void request
        const voidRequest = await tx.yeuCauHuyMon.findUnique({
            where: { id },
        });

        if (!voidRequest) {
            throw Object.assign(new Error('Yêu cầu hủy món không tồn tại'), { status: 404 });
        }

        if (voidRequest.trangThai !== 'PENDING') {
            throw Object.assign(new Error('Yêu cầu đã được xử lý'), { status: 400 });
        }

        // Update void request status
        const updatedRequest = await tx.yeuCauHuyMon.update({
            where: { id },
            data: {
                trangThai: 'REJECTED',
                nguoiDuyetId: user?.id || null,
                ghiChuDuyet: reason || null,
                updatedAt: new Date(),
            },
            include: {
                donHang: { include: { ban: true } },
                chiTietDonHang: { include: { monAn: true } },
                nguoiYeuCau: true,
                nguoiDuyet: true,
            },
        });

        // Log the rejection
        await tx.nhatKyHeThong.create({
            data: {
                hanhDong: 'REJECT_VOID_REQUEST',
                thongTinBoSung: JSON.stringify({
                    voidRequestId: id,
                    orderId: voidRequest.donHangId,
                    orderItemId: voidRequest.chiTietDonHangId,
                    rejectedBy: user?.id || null,
                    reason,
                }),
            },
        });

        return updatedRequest;
    });
};

/**
 * Broadcast KDS update after void approval
 */
const notifyKdsAfterApproval = async () => {
    await broadcastSnapshot().catch(() => { });
};

module.exports = {
    createVoidRequest,
    listVoidRequests,
    approveVoidRequest,
    rejectVoidRequest,
    notifyKdsAfterApproval,
};
