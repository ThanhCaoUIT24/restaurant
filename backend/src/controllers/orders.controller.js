const ordersService = require('../services/orders.service');
const { registerPosClient, removePosClient } = require('../utils/posStream');

const listOrders = async (req, res, next) => {
  try {
    const data = await ordersService.list(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const data = await ordersService.create(req.user, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const data = await ordersService.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const sendToKitchen = async (req, res, next) => {
  try {
    const data = await ordersService.sendToKitchen(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const voidItem = async (req, res, next) => {
  try {
    const data = await ordersService.voidItem(req.params.id, req.body, req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const streamNotifications = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  const id = registerPosClient(res);
  req.on('close', () => removePosClient(id));
};

module.exports = { listOrders, createOrder, updateOrder, sendToKitchen, voidItem, streamNotifications };
