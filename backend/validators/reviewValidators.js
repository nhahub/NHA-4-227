const { body } = require('express-validator');

const createReviewValidator = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Comment must be at least 3 characters'),
];

module.exports = {
  createReviewValidator,
};
