function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(error, req, res, next) {
  void req;
  void next;

  const statusCode =
    error.statusCode || (error.code === "LIMIT_FILE_SIZE" ? 400 : 500);
  const message =
    error.code === "LIMIT_FILE_SIZE"
      ? "Image size must be 5 MB or smaller"
      : error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.details ? { details: error.details } : {})
  });
}

module.exports = {
  notFound,
  errorHandler
};
