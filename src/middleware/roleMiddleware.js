const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(Object.assign(new Error('You are not authorized to perform this action'), { statusCode: 403 }));
  next();
};

module.exports = authorize;
