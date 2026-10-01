const success = (res, statusCode, message, data, extra = {}) => res.status(statusCode).json({ success: true, message, ...(data !== undefined ? { data } : {}), ...extra });

module.exports = { success };
