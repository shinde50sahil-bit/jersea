const { ApiError } = require("../utils/apiError");

function validate(schema) {
  return async (req, res, next) => {
    void res;

    const parsed = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      const fieldErrors = Object.entries(flattened.fieldErrors)
        .flatMap(([field, errors]) =>
          (errors || []).map((message) => `${field}: ${message}`)
        )
        .join(", ");

      return next(
        new ApiError(
          400,
          fieldErrors ? `Validation failed: ${fieldErrors}` : "Validation failed",
          flattened
        )
      );
    }

    req.validated = parsed.data;
    next();
  };
}

module.exports = { validate };
