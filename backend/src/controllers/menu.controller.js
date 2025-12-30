const menuService = require('../services/menu.service');

// ==================== CATEGORIES ====================

const listCategories = async (req, res, next) => {
  try {
    const data = await menuService.listCategories();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const data = await menuService.getCategory(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const data = await menuService.createCategory(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const data = await menuService.updateCategory(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const data = await menuService.deleteCategory(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== DISHES ====================

const listDishes = async (req, res, next) => {
  try {
    const data = await menuService.listDishes(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getDish = async (req, res, next) => {
  try {
    const data = await menuService.getDish(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createDish = async (req, res, next) => {
  try {
    const data = await menuService.createDish(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateDish = async (req, res, next) => {
  try {
    const data = await menuService.updateDish(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const updateDishStatus = async (req, res, next) => {
  try {
    const data = await menuService.updateDishStatus(req.params.id, req.body.status);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteDish = async (req, res, next) => {
  try {
    const data = await menuService.deleteDish(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== OPTIONS ====================

const listOptions = async (req, res, next) => {
  try {
    const data = await menuService.listOptions();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createOption = async (req, res, next) => {
  try {
    const data = await menuService.createOption(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateOption = async (req, res, next) => {
  try {
    const data = await menuService.updateOption(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteOption = async (req, res, next) => {
  try {
    const data = await menuService.deleteOption(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
