const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/stats', homeController.stats);
router.post('/visit', homeController.recordVisit);
router.get('/settings', homeController.settings);

module.exports = router;
