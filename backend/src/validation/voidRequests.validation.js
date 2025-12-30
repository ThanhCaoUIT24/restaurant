const Joi = require('joi');

const createVoidRequestSchema = Joi.object({
    body: Joi.object({
        orderId: Joi.string().required(),
        orderItemId: Joi.string().required(),
        reason: Joi.string().min(5).max(500).required(),
    }),
}).unknown(true);

const approveVoidRequestSchema = Joi.object({
    body: Joi.object({
        managerPin: Joi.string().required(),
        managerUsername: Joi.string().optional(),
        note: Joi.string().max(500).optional(),
    }),
}).unknown(true);

const rejectVoidRequestSchema = Joi.object({
    body: Joi.object({
        reason: Joi.string().max(500).optional(),
    }),
}).unknown(true);

module.exports = {
    createVoidRequestSchema,
    approveVoidRequestSchema,
    rejectVoidRequestSchema,
};
