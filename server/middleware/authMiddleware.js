const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes: expects "Authorization: Bearer <token>".
// Farhan can reuse verifyToken for the Socket.IO handshake.
const verifyToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.id);
};

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const user = await verifyToken(header.split(' ')[1]);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
  }
};

module.exports = { protect, verifyToken };
