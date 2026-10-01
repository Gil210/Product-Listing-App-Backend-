const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) return next(Object.assign(new Error('Authentication token required'), { statusCode: 401 }));
  try {
    const decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) return next(Object.assign(new Error('User is not available'), { statusCode: 401 }));
    next();
  } catch (error) {
    next(Object.assign(new Error('Invalid or expired authentication token'), { statusCode: 401, cause: error }));
  }
};

module.exports = protect;
