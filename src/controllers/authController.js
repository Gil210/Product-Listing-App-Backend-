const { body } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');

// Validation Rules
const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user'
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. You can now sign in.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Current User Profile
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  return success(res, 200, 'Current user retrieved successfully', user);
});

module.exports = {
  registerRules,
  loginRules,
  register,
  login,
  me
};