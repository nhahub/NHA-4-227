const express = require('express');
const {
  createOrder,
  getOrderById,
  markOrderAsPaid,
  payOrderSimulated,
  markOrderAsDelivered,
  cancelOrder,
  getAllOrders,
  getMyOrders,
  getSellerOrders,
  updateSellerFulfillment,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const { createOrderValidator } = require('../validators/orderValidators');

const router = express.Router();

router
  .route('/')
  .post(protect, createOrderValidator, handleValidationErrors, createOrder)
  .get(protect, authorize('admin'), getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/seller/my-orders', protect, authorize('seller'), getSellerOrders);
router.put('/:id/fulfillment', protect, authorize('seller'), updateSellerFulfillment);
router.put('/:id/pay', protect, authorize('admin'), markOrderAsPaid);
router.put('/:id/pay-simulated', protect, payOrderSimulated);
router.put('/:id/deliver', protect, authorize('admin'), markOrderAsDelivered);
router.put('/:id/cancel', protect, authorize('admin'), cancelOrder);
router.route('/:id').get(protect, getOrderById);

module.exports = router;
