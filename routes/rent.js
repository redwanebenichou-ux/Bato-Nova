const express = require('express');
const router = express.Router();
const rentController = require('../controllers/rentController');
const { authenticate } = require('../middleware/auth');

router.post('/', rentController.create);
router.get('/', authenticate, rentController.list);
router.get('/check-availability', rentController.checkAvailability);

module.exports = router;
