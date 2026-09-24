// Express 4 doesn't catch rejected promises from async route handlers —
// this forwards them to the error middleware instead of crashing the process.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { asyncHandler };
