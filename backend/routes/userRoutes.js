const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  adminCreateUser,
  getSellerPaymentInfo,
  updateSellerPaymentInfo,
  getSavedCard,
  saveCard,
  deleteCard,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/securityMiddleware');
const {
  registerValidator,
  loginValidator,
  adminCreateUserValidator,
  updateProfileValidator,
} = require('../validators/userValidators');

const router = express.Router();

router.post('/register', authLimiter, registerValidator, handleValidationErrors, registerUser);
router.post('/login', authLimiter, loginValidator, handleValidationErrors, loginUser);
router.get('/profile', protect, getUserProfile);
router.put(
  '/profile/edit',
  protect,
  upload.single('profileImage'),
  updateProfileValidator,
  handleValidationErrors,
  updateUserProfile
);
router.get('/wallet', protect, getSavedCard);
router.put('/wallet', protect, saveCard);
router.delete('/wallet', protect, deleteCard);
router.get('/seller/payment-info', protect, authorize('seller'), getSellerPaymentInfo);
router.put('/seller/payment-info', protect, authorize('seller'), updateSellerPaymentInfo);
router.get('/', protect, authorize('admin'), getAllUsers);
router.post(
  '/admin/create',
  protect,
  authorize('admin'),
  adminCreateUserValidator,
  handleValidationErrors,
  adminCreateUser
);

module.exports = router;
