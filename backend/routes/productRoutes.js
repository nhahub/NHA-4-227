const express = require('express');
const {
  getProducts,
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getMySellerProducts,
  updateProductStatus,
} = require('../controllers/productController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const { productCreateValidator, productUpdateValidator } = require('../validators/productValidators');
const { createReviewValidator } = require('../validators/reviewValidators');

const router = express.Router();

router
  .route('/')
  .get(optionalProtect, getProducts)
  .post(
    protect,
    authorize('admin', 'seller'),
    productCreateValidator,
    handleValidationErrors,
    createProduct
  );
router.get('/categories', getProductCategories);
router.get('/seller/my-products', protect, authorize('seller'), getMySellerProducts);
router.post('/upload-image', protect, authorize('admin', 'seller'), upload.single('productImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file' });
  }

  return res.json({ image: `/uploads/${req.file.filename}` });
});
router.put('/:id/status', protect, authorize('admin'), updateProductStatus);
router.post('/:id/reviews', protect, createReviewValidator, handleValidationErrors, createProductReview);
router
  .route('/:id')
  .get(getProductById)
  .put(
    protect,
    authorize('admin', 'seller'),
    productUpdateValidator,
    handleValidationErrors,
    updateProduct
  )
  .delete(protect, authorize('admin', 'seller'), deleteProduct);

module.exports = router;
