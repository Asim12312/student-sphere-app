const express = require('express');
const router = express.Router();
const Message = require('../../../models/messageModel');

// Get Chat History for a Club
router.get('/:clubId', async (req, res) => {
    try {
        const { clubId } = req.params;
        const messages = await Message.find({ clubId })
            .populate('sender', 'username profilePicture')
            .sort({ createdAt: 1 }); // Oldest first

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
});

module.exports = router;
