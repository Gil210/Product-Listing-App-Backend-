const notFound = (req, _res, next) => next(Object.assign(new Error(`Route not found: ${req.method} ${req.originalUrl}`), { statusCode: 404 }));

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  if (error.name === 'ValidationError') { statusCode = 400; message = Object.values(error.errors).map((item) => item.message).join(', '); }
  if (error.name === 'CastError') { statusCode = 400; message = 'Invalid resource ID'; }
  if (error.code === 11000) { statusCode = 409; message = 'A record with that value already exists'; }
  if (error.name === 'MulterError') { statusCode = 400; message = error.message; }
  res.status(statusCode).json({ success: false, message, ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}) });
};

module.exports = { notFound, errorHandler };
