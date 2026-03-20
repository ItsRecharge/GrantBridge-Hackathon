export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.details?.map((d) => d.message) || [err.message],
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'Resource already exists',
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors?.map((e) => e.message) || [err.message],
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
};
