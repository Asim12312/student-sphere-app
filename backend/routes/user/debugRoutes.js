const express = require('express');
const Notification = require('../../models/notificationModel');
const Club = require('../../models/clubModel');
const router = express.Router();

// DEBUG ENDPOINT - Check notifications in DB
router.get('/debug-notifications', async (req, res) => {
    try {
        const { userId } = req.query;

        // Get all notifications
        const allNotifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(20);

        console.log('=== DEBUG NOTIFICATIONS ===');
        console.log('Total notifications in DB:', allNotifications.length);

        const result = {
            totalNotifications: allNotifications.length,
            allNotifications: allNotifications.map(n => ({
                id: n._id.toString(),
                recipient: n.recipient.toString(),
                sender: n.sender.toString(),
                type: n.type,
                message: n.message,
                read: n.read,
                createdAt: n.createdAt
            }))
        };

        if (userId) {
            const userNotifications = await Notification.find({ recipient: userId });
            result.userNotifications = userNotifications.map(n => ({
                id: n._id.toString(),
                recipient: n.recipient.toString(),
                sender: n.sender.toString(),
                type: n.type,
                message: n.message,
                read: n.read
            }));
            result.userNotificationCount = userNotifications.length;

            console.log(`Notifications for user ${userId}:`, userNotifications.length);
        }

        // Get all clubs and their creators
        const clubs = await Club.find({}).select('name createdBy privacy');
        result.clubs = clubs.map(c => ({
            id: c._id.toString(),
            name: c.name,
            createdBy: c.createdBy.toString(),
            privacy: c.privacy
        }));

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
