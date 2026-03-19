const express = require('express');
const router = express.Router();
const Report = require('../../models/reportModel');

// POST /report - Create a new report
router.post('/', async (req, res) => {
    try {
        const { reporterId, itemType, itemId, reason } = req.body;

        if (!reporterId || !itemType || !itemId || !reason) {
            return res.status(400).json({ error: 'Missing required report fields' });
        }

        const newReport = new Report({
            reporterId,
            itemType,
            itemId,
            reason
        });

        await newReport.save();
        res.status(201).json({ message: 'Report submitted successfully', report: newReport });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
