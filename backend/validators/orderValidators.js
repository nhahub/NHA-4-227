const { body } = require('express-validator');

const createOrderValidator = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('orderItems must be a non-empty array'),
  body('orderItems.*.product')
    .isMongoId()
    .withMessage('Each order item product must be a valid MongoDB ObjectId'),
  body('orderItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each order item quantity must be an integer greater than or equal to 1'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('shippingAddress.fullName is required'),
  body('shippingAddress.address').trim().notEmpty().withMessage('shippingAddress.address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('shippingAddress.city is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('shippingAddress.country is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('shippingAddress.phone is required'),
  body('paymentMethod').trim().notEmpty().withMessage('paymentMethod is required'),
  body('paymentInfo').optional().isObject().withMessage('paymentInfo must be an object'),
];

module.exports = {
  createOrderValidator,
};
