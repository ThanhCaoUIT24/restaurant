const customersService = require('../services/customers.service');

const listCustomers = async (req, res, next) => {
  try {
    const data = await customersService.list(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const data = await customersService.getById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const findByPhone = async (req, res, next) => {
  try {
    const data = await customersService.findByPhone(req.params.phone);
    res.json(data || { found: false });
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const data = await customersService.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const data = await customersService.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const data = await customersService.remove(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getCustomerPoints = async (req, res, next) => {
  try {
    const data = await customersService.getPoints(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const addPoints = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const data = await customersService.addPoints(req.params.id, amount, description);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const usePoints = async (req, res, next) => {
  try {
    const { points, description } = req.body;
    const data = await customersService.usePoints(req.params.id, points, description);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getMembershipTiers = async (req, res, next) => {
  try {
    const data = customersService.getMembershipTiers();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  listCustomers, 
  getCustomer,
  findByPhone,
  createCustomer, 
  updateCustomer,
  deleteCustomer,
  getCustomerPoints, 
  addPoints,
  usePoints,
  getMembershipTiers,
};
