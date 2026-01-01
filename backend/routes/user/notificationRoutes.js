const express = require('express');
const Notification = require('../../models/notificationModel');
const router = express.Router();

// GET NOTIFICATIONS FOR USER
router.get('/get/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`🔍 [GET NOTIFICATIONS] Fetching for user: ${userId}`);
        console.log(`   - userId type: ${typeof userId}`);
        console.log(`   - userId length: ${userId.length}`);

        // Check total notifications in DB first
        const allNotifications = await Notification.find({});
        console.log(`   - Total notifications in DB: ${allNotifications.length}`);

        // Try to find notifications for this recipient
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username profilePicture') // Populate sender info
            .populate({
                path: 'relatedId',
                // The schema uses refPath: 'relatedModel', so Mongoose will automatically
                // use the value in relatedModel field to determine which model to populate
                select: 'name privacy'
            });

        console.log(`   - Found ${notifications.length} notifications for user ${userId}`);

        // Debug: Show all recipient IDs in database
        if (notifications.length === 0 && allNotifications.length > 0) {
            console.log('   - Sample recipient IDs from DB:');
            allNotifications.slice(0, 5).forEach((n, idx) => {
                console.log(`     [${idx}] ${n.recipient} (type: ${typeof n.recipient})`);
            });
        }

        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        console.error('Error details:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
});

// MARK AS READ
router.post('/markAsRead', async (req, res) => {
    try {
        const { notificationId } = req.body;
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error marking as read' });
    }
});

module.exports = router;
