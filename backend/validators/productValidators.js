const { body } = require('express-validator');

const productCreateValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
  body('image').trim().notEmpty().withMessage('Image is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('countInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Count in stock must be an integer greater than or equal to 0'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a number between 0 and 5'),
];

const productUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('image').optional().trim().notEmpty().withMessage('Image cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('countInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Count in stock must be an integer greater than or equal to 0'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a number between 0 and 5'),
];

module.exports = {
  productCreateValidator,
  productUpdateValidator,
};
