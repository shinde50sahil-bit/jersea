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
      return next(
        new ApiError(400, "Validation failed", parsed.error.flatten())
      );
    }

    req.validated = parsed.data;
    next();
  };
}

module.exports = { validate };
