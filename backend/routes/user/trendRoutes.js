const express = require('express');
const router = express.Router();
const Trend = require('../../models/trendModel');
const { awardPoints } = require('../../utils/gamification');

// Helper to extract hashtags
const extractHashtags = (text) => {
    const regex = /#(\w+)/g;
    const matches = text.match(regex);
    return matches ? matches.map(tag => tag.slice(1)) : []; // Remove '#'
};

// Create Trend
router.post('/create', async (req, res) => {
    try {
        const { content, author, mediaURL } = req.body;

        if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

        const hashtags = extractHashtags(content);

        const newTrend = new Trend({
            content,
            author, // expect userId
            hashtags,
            mediaURL
        });

        await newTrend.save();

        // Gamification: Award 5 points for creating a trend
        await awardPoints(author, 'CREATE_TREND');

        res.status(201).json({ success: true, trend: newTrend });
    } catch (error) {
        console.error('Error creating trend:', error);
        res.status(500).json({ success: false, message: 'Failed to create trend' });
    }
});

// Get Feed (All posts for now, can implement pagination)
router.get('/feed', async (req, res) => {
    try {
        const trends = await Trend.find()
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(50); // Limit for performance

        res.status(200).json({ success: true, trends });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch feed' });
    }
});

// Get Trending Hashtags (Last 7 days)
router.get('/trending', async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trends = await Trend.find({ createdAt: { $gte: sevenDaysAgo } });

        const hashtagCounts = {};
        trends.forEach(trend => {
            trend.hashtags.forEach(tag => {
                hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            });
        });

        // Convert to array and sort
        const sortedTrends = Object.entries(hashtagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10

        res.status(200).json({ success: true, trends: sortedTrends });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch trending topics' });
    }
});

// Like Trend
router.post('/like/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const trend = await Trend.findById(req.params.id);

        if (!trend) return res.status(404).json({ success: false, message: 'Trend not found' });

        const index = trend.likes.indexOf(userId);
        if (index === -1) {
            trend.likes.push(userId);
        } else {
            trend.likes.splice(index, 1);
        }

        await trend.save();
        res.status(200).json({ success: true, likes: trend.likes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error liking trend' });
    }
});

module.exports = router;
