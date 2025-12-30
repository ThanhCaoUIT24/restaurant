const Joi = require('joi');

const registerSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
      'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự',
      'string.max': 'Tên đăng nhập không được quá 50 ký tự',
      'any.required': 'Vui lòng nhập tên đăng nhập',
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'string.max': 'Mật khẩu không được quá 100 ký tự',
      'any.required': 'Vui lòng nhập mật khẩu',
    }),
    hoTen: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được quá 100 ký tự',
      'any.required': 'Vui lòng nhập họ tên',
    }),
    soDienThoai: Joi.string().pattern(/^[0-9]{10,11}$/).optional().allow('', null).messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 chữ số)',
    }),
  }).required(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
});

const loginSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).required(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
});

const refreshSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }).required(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional(),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
