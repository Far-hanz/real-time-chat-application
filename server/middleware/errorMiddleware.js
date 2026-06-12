const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  // Mongoose validation errors -> 400 with the first readable message
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)[0]?.message || 'Invalid data';
    return res.status(400).json({ message });
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `That ${field} is already in use` });
  }

  // Invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }

  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
};

module.exports = { notFound, errorHandler };
