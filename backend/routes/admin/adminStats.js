const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Club = require('../../models/club');
const Product = require('../../models/sellProduct');
const Report = require('../../models/reportModel');

// GET /admin/stats
router.get('/', async (req, res) => {
    try {
        const [usersCount, clubsCount, productsCount, pendingReports] = await Promise.all([
            User.countDocuments(),
            Club.countDocuments(),
            Product.countDocuments(),
            Report.countDocuments({ status: 'Pending' })
        ]);

        res.json({
            users: usersCount,
            clubs: clubsCount,
            products: productsCount,
            pendingReports: pendingReports
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
