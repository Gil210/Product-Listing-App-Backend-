const express = require('express');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const controller = require('../controllers/propertyController');

const router = express.Router();
router.get('/', controller.getProperties);
router.get('/my-properties', protect, authorize('owner', 'admin'), controller.getMyProperties);
router.get('/:id', controller.getProperty);
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 10), controller.createProperty);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 10), controller.updateProperty);
router.delete('/:id', protect, authorize('owner', 'admin'), controller.deleteProperty);
module.exports = router;
