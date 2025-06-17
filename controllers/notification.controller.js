const { User, Notification } = require('../models');
const { Op } = require('sequelize');
const remita = require('../utils/remita');
const { v4: uuidv4 } = require('uuid');

exports.sendPushNotification = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'user not found' });
    const subject = "You've received a new notification"
    
    const notification = await Notification.create({
        UserId: userId,
        message,
        subject
    });
    if (!notification) {
        return res.status(500).json({ error: 'Failed to send notification' });
    } else { 
        return res.status(201).json({ message: 'Notification sent successfully', notification });
    }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { UserId: userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id: notificationId, UserId: userId }
    });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getNotificationById = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;
    
        const notification = await Notification.findOne({
        where: { id: notificationId, UserId: userId }
        });
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
    
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
