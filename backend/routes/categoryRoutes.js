const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(optionalProtect, getCategories).post(protect, authorize('admin'), createCategory);
router
  .route('/:id')
  .get(optionalProtect, getCategoryById)
  .put(protect, authorize('admin'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;

