const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const { 
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
} = require('../controllers/tables.controller');

router.use(authMiddleware);

// Tables - Read: TABLE_VIEW, Create/Update/Delete: TABLE_MANAGE
router.get('/', requirePermissions([PERMISSIONS.TABLE_VIEW]), listTables);
router.get('/stream', requirePermissions([PERMISSIONS.TABLE_VIEW]), streamTables);
router.get('/:id', requirePermissions([PERMISSIONS.TABLE_VIEW]), getTable);
router.post('/', requirePermissions([PERMISSIONS.TABLE_MANAGE]), createTable);
router.put('/:id', requirePermissions([PERMISSIONS.TABLE_MANAGE]), updateTable);
router.delete('/:id', requirePermissions([PERMISSIONS.TABLE_MANAGE]), deleteTable);
// Status update: TABLE_VIEW (POS/waiter needs to change status)
router.patch('/:id/status', requirePermissions([PERMISSIONS.TABLE_VIEW]), updateTableStatus);
// Position update: TABLE_MANAGE (table layout editor)
router.patch('/:id/position', requirePermissions([PERMISSIONS.TABLE_MANAGE]), updateTablePosition);

// Merge / Split - TABLE_MANAGE only
router.post('/merge', requirePermissions([PERMISSIONS.TABLE_MANAGE]), mergeTables);
router.post('/split', requirePermissions([PERMISSIONS.TABLE_MANAGE]), splitTable);
router.post('/unmerge', requirePermissions([PERMISSIONS.TABLE_MANAGE]), unmergeTables);

// Areas - Read: TABLE_VIEW, Write: TABLE_MANAGE
router.get('/areas/list', requirePermissions([PERMISSIONS.TABLE_VIEW]), listAreas);
router.post('/areas', requirePermissions([PERMISSIONS.TABLE_MANAGE]), createArea);
router.put('/areas/:id', requirePermissions([PERMISSIONS.TABLE_MANAGE]), updateArea);
router.delete('/areas/:id', requirePermissions([PERMISSIONS.TABLE_MANAGE]), deleteArea);

module.exports = router;
