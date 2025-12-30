const hrService = require('../services/hr.service');

// ==================== SHIFTS ====================

const listShifts = async (req, res, next) => {
  try {
    const data = await hrService.listShifts();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createShift = async (req, res, next) => {
  try {
    const data = await hrService.createShift(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateShift = async (req, res, next) => {
  try {
    const data = await hrService.updateShift(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteShift = async (req, res, next) => {
  try {
    const data = await hrService.deleteShift(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== EMPLOYEES ====================

const listEmployees = async (req, res, next) => {
  try {
    const data = await hrService.listEmployees();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const data = await hrService.createEmployee(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const data = await hrService.updateEmployee(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const data = await hrService.deleteEmployee(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== SCHEDULES ====================

const listSchedules = async (req, res, next) => {
  try {
    const data = await hrService.listSchedules(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const data = await hrService.createSchedule(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateSchedule = async (req, res, next) => {
  try {
    const data = await hrService.updateSchedule(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const data = await hrService.deleteSchedule(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createBulkSchedules = async (req, res, next) => {
  try {
    const data = await hrService.createBulkSchedules(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== ATTENDANCE ====================

const checkIn = async (req, res, next) => {
  try {
    const data = await hrService.checkIn(req.user, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const data = await hrService.checkOut(req.user, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const attendanceReport = async (req, res, next) => {
  try {
    const data = await hrService.attendanceReport(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getMyAttendanceRecords = async (req, res, next) => {
  try {
    // Automatically filter by authenticated user's ID
    const data = await hrService.attendanceReport({
      nhanVienId: req.user.id,
      ...req.query
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
