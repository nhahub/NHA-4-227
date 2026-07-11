const mongoose = require('mongoose');
const Notification = require('../models/Notification');

const createNotification = async ({ user, title, message, type = 'system', link = '' }) => {
  if (!user || !title || !message) {
    return null;
  }

  return Notification.create({
    user,
    title: String(title).trim(),
    message: String(message).trim(),
    type,
    link: String(link || '').trim(),
  });
};

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (String(notification.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden: you can only update your notifications' });
    }

    notification.isRead = true;
    await notification.save();

    return res.json(notification);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
};
