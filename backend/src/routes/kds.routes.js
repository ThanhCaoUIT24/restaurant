const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const { listTicketsByStation, updateItemStatus, streamKds } = require('../controllers/kds.controller');

router.use(authMiddleware);

// KDS access requires KDS_VIEW permission (Bep, Manager, Admin)
router.get('/stream', requirePermissions([PERMISSIONS.KDS_VIEW]), streamKds);
router.get('/', requirePermissions([PERMISSIONS.KDS_VIEW]), listTicketsByStation);
router.patch('/items/:id/status', requirePermissions([PERMISSIONS.DISH_STATUS_UPDATE, PERMISSIONS.DISH_SERVE], { requireAll: false }), updateItemStatus);

module.exports = router;
