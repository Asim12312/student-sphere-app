const express = require('express');
const Notification = require('../../models/notificationModel');
const router = express.Router();

// GET NOTIFICATIONS FOR USER
router.get('/get/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username profilePicture') // Populate sender info
            .populate({
                path: 'relatedId',
                select: 'name privacy'
                // We might need dynamic ref here but for now mainly Club names are needed. 
                // Mongoose doesn't support dynamic ref in populate easily without refPath, 
                // but 'relatedId' in model didn't use refPath. 
                // We can just send the ID and let frontend handle or rely on message.
                // Let's rely on message for now to be safe or try populating if model supports it.
                // In notificationModel, relatedId doesn't have a ref. So populate won't work directly unless we specify model.
            });

        // Since relatedId doesn't have a ref in schema, we can't auto-populate it easily without knowing the model.
        // However, for typical list display, the 'message' field is sufficient.

        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
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
