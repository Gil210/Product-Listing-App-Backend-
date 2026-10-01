const { body } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { registerUser, loginUser, safeUser } = require('../services/authService');

const registerRules = [body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'), body('email').isEmail().withMessage('A valid email is required'), body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')];
const loginRules = [body('email').isEmail().withMessage('A valid email is required'), body('password').notEmpty().withMessage('Password is required')];

const register = asyncHandler(async (req, res) => success(res, 201, 'Registration successful', await registerUser(req.body)));
const login = asyncHandler(async (req, res) => success(res, 200, 'Login successful', await loginUser(req.body.email, req.body.password)));
const me = asyncHandler(async (req, res) => success(res, 200, 'Current user retrieved successfully', safeUser(req.user)));

module.exports = { registerRules, loginRules, register, login, me };
