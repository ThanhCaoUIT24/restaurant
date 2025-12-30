const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const {
	listPOs,
	createPO,
	updatePOStatus,
	createReceipt,
	listSuppliers,
	createSupplier,
	updateSupplier,
	deleteSupplier,
} = require('../controllers/purchase.controller');

router.use(authMiddleware);

// Purchase Order - ThuKho có thể tạo, Manager/Admin duyệt
router.get('/orders', requirePermissions([PERMISSIONS.PO_VIEW]), listPOs);
router.post('/orders', requirePermissions([PERMISSIONS.PO_CREATE]), createPO);
router.patch('/orders/:id/status', requirePermissions([PERMISSIONS.PO_APPROVE]), updatePOStatus);
router.post('/receipts', requirePermissions([PERMISSIONS.STOCK_IMPORT]), createReceipt);
router.get('/suppliers', requirePermissions([PERMISSIONS.PO_VIEW]), listSuppliers);
router.post('/suppliers', requirePermissions([PERMISSIONS.PO_CREATE]), createSupplier);
router.put('/suppliers/:id', requirePermissions([PERMISSIONS.PO_CREATE]), updateSupplier);
router.delete('/suppliers/:id', requirePermissions([PERMISSIONS.PO_CREATE]), deleteSupplier);

module.exports = router;
