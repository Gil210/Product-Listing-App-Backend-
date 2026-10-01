const express = require('express');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const controller = require('../controllers/messageController');

const router = express.Router();
router.use(protect);
router.post('/', controller.createMessageRules, validate, controller.createMessage);
router.get('/sent', controller.sentMessages);
router.get('/received', controller.receivedMessages);
router.get('/:id', controller.getMessage);
router.patch('/:id/read', controller.markRead);
module.exports = router;
