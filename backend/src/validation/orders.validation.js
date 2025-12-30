const Joi = require('joi');

const orderItemSchema = Joi.object({
  monAnId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
  note: Joi.string().allow('', null),
  options: Joi.array().items(Joi.string().uuid()).default([]),
});

const createOrderSchema = Joi.object({
  params: Joi.object({}).unknown(true),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    tableId: Joi.string().uuid().required(),
    note: Joi.string().allow('', null),
    items: Joi.array().items(orderItemSchema).min(1).required(),
  }).required(),
});

const updateOrderSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    note: Joi.string().allow('', null),
    addItems: Joi.array().items(orderItemSchema),
    removeItemIds: Joi.array().items(Joi.string().uuid()),
  }).min(1),
});

const sendOrderSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({}).unknown(true),
});

const voidItemSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    orderItemId: Joi.string().uuid().required(),
    reason: Joi.string().allow('', null),
    managerPin: Joi.string().min(4).required(),
    managerUsername: Joi.string().allow('', null),
  }).required(),
});

const createVoidRequestSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    orderItemId: Joi.string().uuid().required(),
    reason: Joi.string().allow('', null),
  }).required(),
});

const voidRequestActionSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    approverNote: Joi.string().allow('', null),
  }).required(),
});

module.exports = { createOrderSchema, updateOrderSchema, sendOrderSchema, voidItemSchema, createVoidRequestSchema, voidRequestActionSchema };
