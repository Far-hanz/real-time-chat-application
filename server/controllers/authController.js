const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, avatar, isOnline: true });

    res.status(201).json({
      token: generateToken(user._id),
      user: user.toProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.isOnline = true;
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: user.toProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout };
