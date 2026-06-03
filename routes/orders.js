const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.post('/', orderController.create);
router.get('/', authenticate, orderController.list);
router.get('/:id', authenticate, orderController.getById);

module.exports = router;
