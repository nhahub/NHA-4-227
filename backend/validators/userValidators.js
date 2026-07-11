const { body } = require('express-validator');

const allowedRoles = ['customer', 'seller', 'admin', 'support'];

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isString()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isString().withMessage('Password is required').notEmpty().withMessage('Password is required'),
];

const adminCreateUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isString()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role').isIn(allowedRoles).withMessage('Role must be one of customer, seller, admin, support'),
];

const updateProfileValidator = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('displayName').optional().isString().withMessage('Display name must be a string'),
  body('address').optional().isString().withMessage('Address must be a string'),
];

module.exports = {
  registerValidator,
  loginValidator,
  adminCreateUserValidator,
  updateProfileValidator,
};
