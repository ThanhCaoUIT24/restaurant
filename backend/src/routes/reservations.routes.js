const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const { listReservations, createReservation, updateReservationStatus } = require('../controllers/reservations.controller');

router.use(authMiddleware);

// Reservations - Read/Create: RESERVATION_VIEW/CREATE, Manage: RESERVATION_MANAGE
router.get('/', requirePermissions([PERMISSIONS.RESERVATION_VIEW]), listReservations);
router.post('/', requirePermissions([PERMISSIONS.RESERVATION_CREATE]), createReservation);
router.patch('/:id/status', requirePermissions([PERMISSIONS.RESERVATION_MANAGE]), updateReservationStatus);

module.exports = router;
