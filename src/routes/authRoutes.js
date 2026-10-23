const express = require('express');
const { registerRules, loginRules, register, login, me } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

const router = express.Router();
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, me);
module.exports = router;
