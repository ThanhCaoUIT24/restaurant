const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { PERMISSIONS } = require('../utils/permissions');
const {
    createVoidRequest,
    listVoidRequests,
    approveVoidRequest,
    rejectVoidRequest,
} = require('../controllers/voidRequests.controller');
const {
    createVoidRequestSchema,
    approveVoidRequestSchema,
    rejectVoidRequestSchema,
} = require('../validation/voidRequests.validation');

router.use(authMiddleware);

// Create void request: ORDER_UPDATE (waiters can create)
router.post(
    '/',
    (req, res, next) => {
        console.log('🟢 POST /void-requests received');
        console.log('🟢 Body:', req.body);
        console.log('🟢 User:', req.user);
        next();
    },
    validate(createVoidRequestSchema),
    (req, res, next) => {
        console.log('✅ Validation passed');
        next();
    },
    requirePermissions([PERMISSIONS.ORDER_UPDATE]),
    (req, res, next) => {
        console.log('✅ Permission check passed');
        next();
    },
    createVoidRequest
);

// List void requests: ORDER_VOID_APPROVE (managers only)
router.get(
    '/',
    requirePermissions([PERMISSIONS.ORDER_VOID_APPROVE]),
    listVoidRequests
);

// Approve void request: ORDER_VOID_APPROVE (managers only)
router.post(
    '/:id/approve',
    validate(approveVoidRequestSchema),
    requirePermissions([PERMISSIONS.ORDER_VOID_APPROVE]),
    approveVoidRequest
);

// Reject void request: ORDER_VOID_APPROVE (managers only)
router.post(
    '/:id/reject',
    validate(rejectVoidRequestSchema),
    requirePermissions([PERMISSIONS.ORDER_VOID_APPROVE]),
    rejectVoidRequest
);

module.exports = router;
