const express = require('express');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const controller = require('../controllers/userController');

const router = express.Router();
router.get('/profile', protect, controller.getProfile);
router.put('/profile', protect, controller.updateProfile);
router.put('/change-password', protect, controller.changePassword);
router.get('/', protect, authorize('admin'), controller.listUsers);
router.get('/:id', protect, authorize('admin'), controller.getUser);
router.delete('/:id', protect, authorize('admin'), controller.deleteUser);
router.patch('/:id/status', protect, authorize('admin'), controller.updateUserStatus);
module.exports = router;
