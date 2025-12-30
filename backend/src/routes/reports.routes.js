const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const { dashboard, salesReport, menuPerformance, inventoryReport, attendanceReport } = require('../controllers/reports.controller');

router.use(authMiddleware);

// Dashboard - require REPORT_VIEW permission (Manager/Admin only)
router.get('/dashboard', requirePermissions([PERMISSIONS.REPORT_VIEW]), dashboard);

// Detailed reports - require REPORT_VIEW permission (Manager/Admin only)
router.get('/sales', requirePermissions([PERMISSIONS.REPORT_VIEW]), salesReport);
router.get('/menu-performance', requirePermissions([PERMISSIONS.REPORT_VIEW]), menuPerformance);
router.get('/inventory', requirePermissions([PERMISSIONS.REPORT_VIEW]), inventoryReport);
router.get('/attendance', requirePermissions([PERMISSIONS.REPORT_VIEW]), attendanceReport);

module.exports = router;
