// Notification Stream - SSE for real-time notifications
const { prisma } = require('../config/db');

// Store clients by userId for targeted notifications
const clientsByUser = new Map(); // userId -> [{ id, res }]

/**
 * Register a client for SSE notifications
 * @param {string} userId - The user ID to receive notifications
 * @param {Response} res - Express response object
 * @returns {number} clientId for cleanup
 */
const registerClient = (userId, res) => {
    const clientId = Date.now();

    if (!clientsByUser.has(userId)) {
        clientsByUser.set(userId, []);
    }

    clientsByUser.get(userId).push({ id: clientId, res });

    console.log(`[NotificationStream] Client ${clientId} registered for user ${userId}. Total clients for user: ${clientsByUser.get(userId).length}`);

    return clientId;
};

/**
 * Remove a client when connection closes
 * @param {string} userId 
 * @param {number} clientId 
 */
const removeClient = (userId, clientId) => {
    const clients = clientsByUser.get(userId);
    if (!clients) return;

    const idx = clients.findIndex((c) => c.id === clientId);
    if (idx >= 0) {
        clients.splice(idx, 1);
        console.log(`[NotificationStream] Client ${clientId} removed for user ${userId}. Remaining: ${clients.length}`);
    }

    // Clean up empty user entries
    if (clients.length === 0) {
        clientsByUser.delete(userId);
    }
};

/**
 * Broadcast notification to a specific user
 * @param {string} userId - Target user ID
 * @param {object} notification - Notification data
 */
const broadcastToUser = (userId, notification) => {
    const clients = clientsByUser.get(userId);
    if (!clients || clients.length === 0) return;

    const payload = `data: ${JSON.stringify({ type: 'NEW_NOTIFICATION', notification })}\n\n`;

    clients.forEach((client) => {
        try {
            client.res.write(payload);
        } catch (err) {
            // Client disconnected, will be cleaned up
        }
    });

    console.log(`[NotificationStream] Broadcasted notification to user ${userId} (${clients.length} clients)`);
};

/**
 * Send initial notification count/list to newly connected client
 * @param {string} userId 
 * @param {Response} res 
 */
const sendInitialData = async (userId, res) => {
    try {
        const notifications = await prisma.thongBao.findMany({
            where: { nguoiNhanId: userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        const unreadCount = await prisma.thongBao.count({
            where: { nguoiNhanId: userId, daDoc: false },
        });

        const payload = `data: ${JSON.stringify({ type: 'INITIAL', notifications, unreadCount })}\n\n`;
        res.write(payload);
    } catch (err) {
        console.error('[NotificationStream] Error sending initial data:', err.message);
    }
};

module.exports = {
    registerClient,
    removeClient,
    broadcastToUser,
    sendInitialData,
};
