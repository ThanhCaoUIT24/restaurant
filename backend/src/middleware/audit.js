const { prisma } = require('../config/db');

// Logs critical actions; call with { action, entity, entityId }
const audit = (action) => async (req, res, next) => {
  res.on('finish', async () => {
    try {
      await prisma.nhatKyHeThong?.create?.({
        data: {
          hanhDong: action || req.originalUrl,
          thongTinBoSung: JSON.stringify({
            method: req.method,
            status: res.statusCode,
            userId: req.user?.id || null,
            body: req.body,
            params: req.params,
          }),
        },
      });
    } catch (err) {
      // silent fail to not block response
    }
  });
  return next();
};

module.exports = { audit };
