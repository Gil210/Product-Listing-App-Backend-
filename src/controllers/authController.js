const { body } = require('express-validator');
const User = require('../models/User');
const sendMail = require('../utils/sendMail');
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

// Register User + Send OTP
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate 6-digit OTP & 7-minute expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 7 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      otp,
      otpExpiresAt,
      isVerified: false
    });

    // Email template
    const message = `
      <h1>Verify your Email</h1>
      <p>Thank you for registering! Your 6-digit OTP code is:</p>
      <h2>${otp}</h2> 
      <p>This code will expire in 7 minutes.</p>
    `;

    await sendMail({
      email: user.email,
      subject: 'Email Verification - Haven',
      html: message
    });

    return res.status(201).json({
      success: true,
      message: 'User registered. Please check your email for the verification code.'
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

    // Block login if unverified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Verify your email before logging in!'
      });
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

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerRules,
  loginRules,
  register,
  login,
  me,
  verifyOTP
};