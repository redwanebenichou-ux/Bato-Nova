const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(adminOnly);

router.get('/dashboard', adminController.getDashboard);
router.get('/profile', adminController.getAdminProfile);

router.get('/products', adminController.listProducts);
router.post('/products', upload.array('images', 10), adminController.createProduct);
router.put('/products/:id', upload.array('images', 10), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

router.get('/orders', adminController.listOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/client', adminController.updateOrderClient);
router.get('/orders/new-count', adminController.newOrdersCount);

router.get('/rent-orders', adminController.listRentOrders);
router.put('/rent-orders/:id/status', adminController.updateRentOrderStatus);
router.put('/rent-orders/:id/client', adminController.updateRentOrderClient);

router.get('/clients', adminController.listClients);
router.get('/clients/:id/orders', adminController.getClientOrders);

router.get('/stats', adminController.getStats);

router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);

module.exports = router;
