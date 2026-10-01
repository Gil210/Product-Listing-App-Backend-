const { validationResult } = require('express-validator');

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(Object.assign(new Error(errors.array().map((item) => item.msg).join(', ')), { statusCode: 400 }));
  next();
};

module.exports = validate;
