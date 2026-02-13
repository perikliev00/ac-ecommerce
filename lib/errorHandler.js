/**
 * Global error handling: async wrapper and centralized error middleware.
 * - asyncHandler: wraps async route handlers so rejections are passed to next(err).
 * - notFoundHandler: 404 for unregistered routes.
 * - globalErrorHandler: formats and sends error response (HTML error page or JSON).
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Wraps an async route handler so any thrown error or rejected promise is passed to next(err).
 * Use for routes that don't use try-catch internally.
 * @param {Function} fn - Async (req, res, next) handler
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found – no matching route. Forwards to global error handler with status 404.
 */
function notFoundHandler(req, res, next) {
  const err = new Error('Страницата не е намерена');
  err.status = 404;
  err.code = 'NOT_FOUND';
  next(err);
}

/**
 * Normalize HTTP status from error. Respects err.status (e.g. 404, 400, 503).
 */
function getStatus(err) {
  const status = err.status || err.statusCode;
  if (typeof status === 'number' && status >= 400 && status < 600) return status;
  return 500;
}

/**
 * Safe user-facing message. In production, hide internal details.
 */
function getMessage(err, status) {
  if (err.message && !isProduction) return err.message;
  if (status === 404) return 'Страницата не е намерена.';
  if (status === 503) return 'Услугата временно не е налична. Опитайте отново по-късно.';
  if (status >= 500) return 'Възникна грешка. Моля, опитайте отново по-късно.';
  return err.message || 'Възникна грешка.';
}

/**
 * Whether the request expects JSON (API/cart drawer, etc.).
 */
function wantsJson(req) {
  return req.xhr || /application\/json/i.test(String(req.get && req.get('Accept') || ''));
}

/**
 * Global error handler (4-arg middleware). Must be registered after all routes.
 * - Logs error server-side.
 * - Sends JSON for API requests, otherwise renders error page or redirects to /error.
 */
function globalErrorHandler(err, req, res, next) {
  const status = getStatus(err);
  const message = getMessage(err, status);

  if (!res.headersSent) {
    if (isProduction && status >= 500) {
      console.error('[Error]', status, err.message || err);
      if (err.stack) console.error(err.stack);
    } else {
      console.error('[Error]', status, err.message || err, err.stack || '');
    }
  }

  if (res.headersSent) {
    return next(err);
  }

  if (wantsJson(req)) {
    return res.status(status).json({
      error: true,
      message,
      status,
    });
  }

  res.status(status);
  res.render('error', {
    title: `Грешка ${status} – Несебър Клима`,
    description: message,
    statusCode: status,
    message,
    is404: status === 404,
  });
}

module.exports = {
  asyncHandler,
  notFoundHandler,
  globalErrorHandler,
  getStatus,
  getMessage,
  wantsJson: wantsJson,
};
