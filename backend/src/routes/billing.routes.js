const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { PERMISSIONS } = require('../utils/permissions');
const {
  createInvoice,
  payInvoice,
  listOpenInvoices,
  listPendingOrders,
  openShift,
  currentShift,
  closeShift,
  splitBillByItems,
  splitBillByPeople,
  getInvoiceDetails,
  getInvoicePrintData,
  exportInvoices,
  getDailySalesReport,
  mergeInvoices,
  getZReport,
  exportZReport,
} = require('../controllers/billing.controller');
const { checkoutSchema, paySchema, openShiftSchema, closeShiftSchema, splitByItemsSchema, splitByPeopleSchema, mergeInvoicesSchema } = require('../validation/billing.validation');

router.use(authMiddleware);

router.get('/open', requirePermissions([PERMISSIONS.PAYMENT_VIEW]), listOpenInvoices);
router.get('/pending-orders', requirePermissions([PERMISSIONS.PAYMENT_VIEW, PERMISSIONS.ORDER_VIEW]), listPendingOrders);
router.post('/orders/:orderId/checkout', validate(checkoutSchema), requirePermissions([PERMISSIONS.PAYMENT_VIEW]), createInvoice);
router.get('/invoices/:id', requirePermissions([PERMISSIONS.PAYMENT_VIEW]), getInvoiceDetails);
router.get('/invoices/:id/print', requirePermissions([PERMISSIONS.PAYMENT_VIEW]), getInvoicePrintData);
router.get('/export', requirePermissions([PERMISSIONS.REPORT_VIEW]), exportInvoices);
router.get('/daily-report', requirePermissions([PERMISSIONS.REPORT_VIEW]), getDailySalesReport);
router.post(
  '/invoices/:id/pay',
  validate(paySchema),
  requirePermissions([PERMISSIONS.PAYMENT_EXECUTE]),
  payInvoice,
);
router.post(
  '/invoices/:id/split-by-items',
  validate(splitByItemsSchema),
  requirePermissions([PERMISSIONS.PAYMENT_EXECUTE]),
  splitBillByItems,
);
router.post(
  '/invoices/:id/split-by-people',
  validate(splitByPeopleSchema),
  requirePermissions([PERMISSIONS.PAYMENT_EXECUTE]),
  splitBillByPeople,
);

// Merge multiple open invoices into one (same table)
router.post('/invoices/merge', validate(mergeInvoicesSchema), requirePermissions([PERMISSIONS.PAYMENT_EXECUTE]), mergeInvoices);

// Z-Report endpoints
router.get('/shifts/:id/zreport', requirePermissions([PERMISSIONS.SHIFT_MANAGE, PERMISSIONS.REPORT_VIEW]), getZReport);
router.get('/shifts/:id/zreport/export', requirePermissions([PERMISSIONS.SHIFT_MANAGE, PERMISSIONS.REPORT_VIEW]), exportZReport);

router.post('/shifts/open', validate(openShiftSchema), requirePermissions([PERMISSIONS.SHIFT_OPEN]), openShift);
router.get('/shifts/current', requirePermissions([PERMISSIONS.SHIFT_MANAGE]), currentShift);
router.post('/shifts/:id/close', validate(closeShiftSchema), requirePermissions([PERMISSIONS.SHIFT_CLOSE]), closeShift);

module.exports = router;
