const Joi = require('joi');

const checkoutSchema = Joi.object({
  params: Joi.object({ orderId: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    discount: Joi.number().min(0).optional(),
    discountNote: Joi.string().allow('', null),
    managerPin: Joi.string().when('discount', {
      is: Joi.number().greater(0),
      then: Joi.required().messages({ 'any.required': 'Cần mã PIN quản lý để áp dụng giảm giá' }),
      otherwise: Joi.optional(),
    }),
    managerUsername: Joi.string().optional(),
  }).default({}),
});

const paySchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    payments: Joi.array()
      .items(
        Joi.object({
          method: Joi.string().valid('TienMat', 'The', 'QR', 'Diem').required(),
          amount: Joi.number().min(0).required(),
          note: Joi.string().allow('', null),
        }),
      )
      .min(1)
      .required(),
    usePoints: Joi.number().integer().min(0).optional(),
    khachHangId: Joi.string().uuid().optional().allow(null), // QĐ-LOYALTY: Link customer for points
  }).required(),
});

const openShiftSchema = Joi.object({
  params: Joi.object({}).unknown(true),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    openingCash: Joi.number().min(0).required(),
  }).required(),
});

const closeShiftSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    actualCash: Joi.number().min(0).required(),
  }).required(),
});

const mergeInvoicesSchema = Joi.object({
  params: Joi.object({}).unknown(true),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    invoiceIds: Joi.array().items(Joi.string().uuid()).min(2).required(),
  }).required(),
});

const splitByItemsSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    itemIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }).required(),
});

const splitByPeopleSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  query: Joi.object({}).unknown(true),
  body: Joi.object({
    numPeople: Joi.number().integer().min(2).max(50).required(),
  }).required(),
});

module.exports = { checkoutSchema, paySchema, openShiftSchema, closeShiftSchema, splitByItemsSchema, splitByPeopleSchema };
