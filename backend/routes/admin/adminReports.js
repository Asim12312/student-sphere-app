const express = require('express');
const router = express.Router();
const Report = require('../../models/reportModel');

// GET /admin/reports - Fetch all pending reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find({ status: 'Pending' })
            .populate('reporterId', 'username userEmail')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /admin/reports/:id/resolve - Mark a report as resolved or dismissed
router.put('/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Resolved' or 'Dismissed'

        if (!['Resolved', 'Dismissed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ message: `Report marked as ${status}`, report });
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
