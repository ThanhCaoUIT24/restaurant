const tablesService = require('../services/tables.service');
const { registerTableClient, removeTableClient, broadcastTables } = require('../utils/tableStream');

// ==================== TABLES ====================

const listTables = async (req, res, next) => {
  try {
    const data = await tablesService.list();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getTable = async (req, res, next) => {
  try {
    const data = await tablesService.getById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createTable = async (req, res, next) => {
  try {
    const data = await tablesService.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const data = await tablesService.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteTable = async (req, res, next) => {
  try {
    const data = await tablesService.remove(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const updateTableStatus = async (req, res, next) => {
  try {
    const data = await tablesService.updateStatus(req.params.id, req.body.status);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const updateTablePosition = async (req, res, next) => {
  try {
    const data = await tablesService.updatePosition(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== MERGE / SPLIT ====================

const mergeTables = async (req, res, next) => {
  try {
    const data = await tablesService.merge(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const splitTable = async (req, res, next) => {
  try {
    const data = await tablesService.split(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const unmergeTables = async (req, res, next) => {
  try {
    const data = await tablesService.unmerge(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== AREAS ====================

const listAreas = async (req, res, next) => {
  try {
    const data = await tablesService.listAreas();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createArea = async (req, res, next) => {
  try {
    const data = await tablesService.createArea(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateArea = async (req, res, next) => {
  try {
    const data = await tablesService.updateArea(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteArea = async (req, res, next) => {
  try {
    const data = await tablesService.deleteArea(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== SSE ====================

const streamTables = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  const id = registerTableClient(res);
  req.on('close', () => removeTableClient(id));
};

module.exports = { 
  listTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  updateTablePosition,
  mergeTables, 
  splitTable,
  unmergeTables,
  listAreas,
  createArea,
  updateArea,
  deleteArea,
  streamTables, 
  broadcastTables,
};
