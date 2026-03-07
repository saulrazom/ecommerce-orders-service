const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

router.post('/', orderController.postOrder);
router.put('/:id/status', orderController.putOrder);

module.exports = router;