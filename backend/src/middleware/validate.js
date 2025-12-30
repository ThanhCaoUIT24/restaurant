const validate = (schema) => async (req, res, next) => {
  try {
    if (!schema) return next();

    console.log('🔵 Validation middleware - Input:', {
      body: req.body,
      params: req.params,
      query: req.query,
    });

    const value = await schema.validateAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    }, { abortEarly: false });

    console.log('🔵 Validation passed!');
    req.validated = value;
    return next();
  } catch (err) {
    console.error('❌ Validation failed:', err.message);
    console.error('❌ Details:', err.details);
    return res.status(400).json({ message: 'Validation error', details: err.details });
  }
};

module.exports = { validate };
