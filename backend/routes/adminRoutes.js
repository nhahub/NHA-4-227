const express = require('express');
const { getAdminAnalytics, getAdminSettings } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, authorize('admin'), getAdminAnalytics);
router.get('/settings', protect, authorize('admin'), getAdminSettings);

module.exports = router;
