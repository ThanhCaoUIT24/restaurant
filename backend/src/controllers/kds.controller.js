const kdsService = require('../services/kds.service');
const { registerClient, removeClient, broadcastSnapshot } = require('../utils/kdsStream');
const { broadcastPosEvent } = require('../utils/posStream');

const listTicketsByStation = async (req, res, next) => {
  try {
    const data = await kdsService.listByStation(req.query.station);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const userPermissions = req.user?.permissions || [];

    // Validate permission based on status transition
    // DANGLAM, HOANTHANH = Chef (DISH_STATUS_UPDATE)
    // DAPHUCVU = Waiter (DISH_SERVE)
    if (['DANGLAM', 'HOANTHANH'].includes(status)) {
      if (!userPermissions.includes('DISH_STATUS_UPDATE')) {
        return res.status(403).json({
          message: 'Chỉ đầu bếp mới được cập nhật trạng thái Đang Làm/Xong',
          code: 'FORBIDDEN',
          required: ['DISH_STATUS_UPDATE']
        });
      }
    } else if (status === 'DAPHUCVU') {
      if (!userPermissions.includes('DISH_SERVE') && !userPermissions.includes('DISH_STATUS_UPDATE')) {
        return res.status(403).json({
          message: 'Chỉ nhân viên phục vụ hoặc đầu bếp mới được đánh dấu Đã Ra',
          code: 'FORBIDDEN',
          required: ['DISH_SERVE']
        });
      }
    }

    const data = await kdsService.updateItemStatus(req.params.id, status);
    res.json(data);
    broadcastSnapshot().catch(() => { });
    if (status === 'HOANTHANH') {
      broadcastPosEvent({ type: 'ITEM_DONE', itemId: req.params.id, station: req.query.station || null }).catch(() => { });
    }
  } catch (err) {
    next(err);
  }
};

const streamKds = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  const clientId = registerClient(res);

  req.on('close', () => {
    removeClient(clientId);
  });
};

module.exports = { listTicketsByStation, updateItemStatus, streamKds };
