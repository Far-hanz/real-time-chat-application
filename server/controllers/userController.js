const User = require('../models/User');

// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ user: req.user.toProfile() });
};

// @route   PUT /api/users/me
// @access  Private
// Updates name/avatar, and password when currentPassword + newPassword are sent.
const updateMe = async (req, res, next) => {
  try {
    const { name, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword || !(await user.matchPassword(currentPassword))) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();
    res.json({ user: user.toProfile() });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users
// @access  Private
// All users except the requester — used by the chat sidebar to start conversations.
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).sort({ name: 1 });
    res.json({ users: users.map((u) => u.toProfile()) });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: user.toProfile() });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, getUsers, getUserById };
