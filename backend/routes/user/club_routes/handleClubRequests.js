const express = require('express');
const Club = require('../../../models/clubModel');
const User = require('../../../models/user');
const Notification = require('../../../models/notificationModel');
const router = express.Router();

// APPROVE JOIN REQUEST
router.post('/approveRequest', async (req, res) => {
    try {
        const { clubId, userId, adminId } = req.body;

        const club = await Club.findById(clubId);

        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }

        // Verify admin
        if (club.createdBy.toString() !== adminId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const requestIndex = club.joinRequests.findIndex(
            r => r.user.toString() === userId && r.status === 'pending'
        );

        if (requestIndex === -1) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Approve logic
        club.joinRequests[requestIndex].status = 'approved';
        club.members.push(userId);

        // Add club to user's joinedClubs
        const user = await User.findById(userId);
        if (user) {
            user.joinedClubs.push(clubId);
            await user.save();
        }

        // Remove from joinRequests array (optional, or keep history)
        // club.joinRequests.splice(requestIndex, 1); 
        // Keeping it but marked as approved is better for history, but let's remove to keep array clean or filter pending
        club.joinRequests = club.joinRequests.filter(r => r.user.toString() !== userId);

        await club.save();

        // Create notification for user
        const notification = new Notification({
            recipient: userId,
            sender: adminId,
            type: 'REQUEST_APPROVED',
            message: `Your request to join ${club.name} was approved!`,
            relatedId: club._id,
            relatedModel: 'Club'
        });
        await notification.save();

        res.status(200).json({ success: true, message: 'Request approved' });

    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// REJECT JOIN REQUEST
router.post('/rejectRequest', async (req, res) => {
    try {
        const { clubId, userId, adminId } = req.body;

        const club = await Club.findById(clubId);

        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }

        // Verify admin
        if (club.createdBy.toString() !== adminId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const requestIndex = club.joinRequests.findIndex(
            r => r.user.toString() === userId && r.status === 'pending'
        );

        if (requestIndex === -1) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Reject logic
        // Remove from array
        club.joinRequests = club.joinRequests.filter(r => r.user.toString() !== userId);
        await club.save();

        // Create notification for user
        const notification = new Notification({
            recipient: userId,
            sender: adminId,
            type: 'REQUEST_REJECTED',
            message: `Your request to join ${club.name} was rejected.`,
            relatedId: club._id,
            relatedModel: 'Club'
        });
        await notification.save();

        res.status(200).json({ success: true, message: 'Request rejected' });

    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
