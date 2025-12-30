const { prisma } = require('../config/db');
const { registerClient, removeClient, sendInitialData } = require('../utils/notificationStream');

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma.thongBao.findMany({
            where: { nguoiNhanId: userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Count unread
        const unreadCount = await prisma.thongBao.count({
            where: { nguoiNhanId: userId, daDoc: false }
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Lỗi lấy thông báo' });
    }
};

const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const notif = await prisma.thongBao.findUnique({ where: { id } });
        if (!notif) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
        if (notif.nguoiNhanId !== userId) return res.status(403).json({ message: 'Không có quyền' });

        const updated = await prisma.thongBao.update({
            where: { id },
            data: { daDoc: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
    }
};

const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.thongBao.updateMany({
            where: { nguoiNhanId: userId, daDoc: false },
            data: { daDoc: true }
        });
        res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
    }
};

/**
 * SSE Endpoint for real-time notifications
 */
const streamNotifications = async (req, res) => {
    const userId = req.user.id;

    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Register client
    const clientId = registerClient(userId, res);

    // Send initial data
    await sendInitialData(userId, res);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);

    // Cleanup on close
    req.on('close', () => {
        clearInterval(heartbeat);
        removeClient(userId, clientId);
    });
};

module.exports = {
    getMyNotifications,
    markRead,
    markAllRead,
    streamNotifications,
};
