const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  addTicketReply,
} = require('../controllers/supportController');

const router = express.Router();

router.post('/tickets', protect, authorize('customer'), createTicket);
router.get('/my-tickets', protect, authorize('customer'), getMyTickets);
router.get('/tickets', protect, authorize('admin', 'support'), getAllTickets);
router.get('/tickets/:id', protect, getTicketById);
router.put('/tickets/:id/status', protect, authorize('admin', 'support'), updateTicketStatus);
router.post('/tickets/:id/replies', protect, addTicketReply);

module.exports = router;
