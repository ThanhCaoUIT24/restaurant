const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  listDishes,
  getDish,
  createDish,
  updateDish,
  updateDishStatus,
  deleteDish,
  listOptions,
  createOption,
  updateOption,
  deleteOption,
} = require('../controllers/menu.controller');

router.use(authMiddleware);

// Categories - Read: MENU_VIEW, Write: MENU_MANAGE
router.get('/categories', requirePermissions([PERMISSIONS.MENU_VIEW]), listCategories);
router.get('/categories/:id', requirePermissions([PERMISSIONS.MENU_VIEW]), getCategory);
router.post('/categories', requirePermissions([PERMISSIONS.MENU_CREATE]), createCategory);
router.put('/categories/:id', requirePermissions([PERMISSIONS.MENU_UPDATE]), updateCategory);
router.delete('/categories/:id', requirePermissions([PERMISSIONS.MENU_DELETE]), deleteCategory);

// Dishes - Read: MENU_VIEW, Write: MENU_MANAGE  
router.get('/dishes', requirePermissions([PERMISSIONS.MENU_VIEW]), listDishes);
router.get('/dishes/:id', requirePermissions([PERMISSIONS.MENU_VIEW]), getDish);
router.post('/dishes', requirePermissions([PERMISSIONS.MENU_CREATE]), createDish);
router.put('/dishes/:id', requirePermissions([PERMISSIONS.MENU_UPDATE]), updateDish);
router.patch('/dishes/:id/status', requirePermissions([PERMISSIONS.MENU_UPDATE]), updateDishStatus);
router.delete('/dishes/:id', requirePermissions([PERMISSIONS.MENU_DELETE]), deleteDish);

// Options - Read: MENU_VIEW, Write: MENU_MANAGE
router.get('/options', requirePermissions([PERMISSIONS.MENU_VIEW]), listOptions);
router.post('/options', requirePermissions([PERMISSIONS.MENU_MANAGE]), createOption);
router.put('/options/:id', requirePermissions([PERMISSIONS.MENU_MANAGE]), updateOption);
router.delete('/options/:id', requirePermissions([PERMISSIONS.MENU_MANAGE]), deleteOption);

module.exports = router;
