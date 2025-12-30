const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createBulkSchedules,
  checkIn,
  checkOut,
  attendanceReport,
  getMyAttendanceRecords,
} = require('../controllers/hr.controller');

router.use(authMiddleware);

// Shifts - Read: HR_VIEW, Write: HR_MANAGE
router.get('/shifts', requirePermissions([PERMISSIONS.HR_VIEW]), listShifts);
router.post('/shifts', requirePermissions([PERMISSIONS.HR_MANAGE]), createShift);
router.put('/shifts/:id', requirePermissions([PERMISSIONS.HR_MANAGE]), updateShift);
router.delete('/shifts/:id', requirePermissions([PERMISSIONS.HR_MANAGE]), deleteShift);

// Employees - All actions require HR_MANAGE
router.get('/employees', requirePermissions([PERMISSIONS.HR_VIEW]), listEmployees);
router.post('/employees', requirePermissions([PERMISSIONS.HR_MANAGE]), createEmployee);
router.put('/employees/:id', requirePermissions([PERMISSIONS.HR_MANAGE]), updateEmployee);
router.delete('/employees/:id', requirePermissions([PERMISSIONS.HR_MANAGE]), deleteEmployee);

// Schedules - Read: HR_VIEW, Write: HR_MANAGE
router.get('/schedules', requirePermissions([PERMISSIONS.HR_VIEW]), listSchedules);
router.post('/schedules', requirePermissions([PERMISSIONS.HR_MANAGE]), createSchedule);
router.post('/schedules/bulk', requirePermissions([PERMISSIONS.HR_MANAGE]), createBulkSchedules);
router.put('/schedules/:id', requirePermissions([PERMISSIONS.HR_MANAGE]), updateSchedule);
router.delete('/schedules/:id', requirePermissions([PERMISSIONS.HR_MANAGE]), deleteSchedule);

// Attendance - Check-in/out: all authenticated (for self), Report: HR_VIEW
router.post('/attendance/checkin', checkIn);
router.post('/attendance/checkout', checkOut);
router.get('/attendance/my-records', getMyAttendanceRecords); // New: view own records without HR_VIEW
router.get('/attendance/report', requirePermissions([PERMISSIONS.HR_VIEW]), attendanceReport);

module.exports = router;
