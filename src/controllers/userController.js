const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { safeUser } = require('../services/authService');

const getProfile = asyncHandler(async (req, res) => success(res, 200, 'Profile retrieved successfully', safeUser(req.user)));
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'profileImage'];
  allowed.forEach((field) => { if (req.body[field] !== undefined) req.user[field] = req.body[field]; });
  await req.user.save();
  success(res, 200, 'Profile updated successfully', safeUser(req.user));
});
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword || ''))) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 401 });
  if (!req.body.newPassword || req.body.newPassword.length < 8) throw Object.assign(new Error('New password must be at least 8 characters'), { statusCode: 400 });
  user.password = req.body.newPassword;
  await user.save();
  success(res, 200, 'Password changed successfully');
});
const listUsers = asyncHandler(async (_req, res) => success(res, 200, 'Users retrieved successfully', await User.find().select('-password')));
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  success(res, 200, 'User retrieved successfully', user);
});
const deleteUser = asyncHandler(async (req, res) => { const user = await User.findByIdAndDelete(req.params.id); if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 }); success(res, 200, 'User deleted successfully'); });
const updateUserStatus = asyncHandler(async (req, res) => { const user = await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.isActive) }, { new: true }).select('-password'); if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 }); success(res, 200, 'User status updated successfully', user); });
module.exports = { getProfile, updateProfile, changePassword, listUsers, getUser, deleteUser, updateUserStatus};
