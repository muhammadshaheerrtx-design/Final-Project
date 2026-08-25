function sendSuccess(res, statusCode, data, extra = {}) {
  res.status(statusCode).json({ success: true, data, ...extra });
}

function sendError(res, statusCode, message, details) {
  const body = { success: false, error: message };
  if (details) body.details = details;
  res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
