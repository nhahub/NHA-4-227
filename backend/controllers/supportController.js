const mongoose = require('mongoose');
const SupportTicket = require('../models/SupportTicket');
const { createNotification } = require('./notificationController');

const isStaff = (role) => role === 'admin' || role === 'support';

const validateTicketId = (id) => mongoose.Types.ObjectId.isValid(id);

const createTicket = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can create support tickets' });
    }

    const { subject, message, category, priority } = req.body;

    if (!String(subject || '').trim() || !String(message || '').trim()) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject: String(subject).trim(),
      message: String(message).trim(),
      category,
      priority,
    });

    return res.status(201).json(ticket);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create ticket', error: error.message });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email role');

    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your tickets', error: error.message });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email role')
      .populate('replies.user', 'name email role');

    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateTicketId(id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }

    const ticket = await SupportTicket.findById(id)
      .populate('user', 'name email role')
      .populate('replies.user', 'name email role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const isOwner = String(ticket.user?._id || ticket.user) === String(req.user._id);
    if (!isOwner && !isStaff(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validateTicketId(id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }

    const allowedStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    const updatedTicket = await ticket.save();
    return res.json(updatedTicket);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update ticket status', error: error.message });
  }
};

const addTicketReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!validateTicketId(id)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }

    const safeMessage = String(message || '').trim();
    if (!safeMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const isOwner = String(ticket.user) === String(req.user._id);
    if (!isOwner && !isStaff(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    ticket.replies.push({
      user: req.user._id,
      message: safeMessage,
    });

    await ticket.save();

    if (!isOwner) {
      await createNotification({
        user: ticket.user,
        title: 'Support Reply',
        message: 'Your support ticket has a new reply.',
        type: 'support',
        link: `/support/tickets/${ticket._id}`,
      });
    }

    const populatedTicket = await SupportTicket.findById(id)
      .populate('user', 'name email role')
      .populate('replies.user', 'name email role');

    return res.status(201).json(populatedTicket);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add reply', error: error.message });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  addTicketReply,
};
