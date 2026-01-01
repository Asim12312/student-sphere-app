const express = require('express');
const router = express.Router();
const Trend = require('../../models/trendModel');
const { awardPoints } = require('../../utils/gamification');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../cloudinary/cloudinaryConfig');

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'trends',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
        resource_type: 'image'
    },
});

const upload = multer({ storage });

// Helper to extract hashtags
const extractHashtags = (text) => {
    const regex = /#(\w+)/g;
    const matches = text.match(regex);
    return matches ? matches.map(tag => tag.slice(1)) : []; // Remove '#'
};

// Create Trend (with optional image)
router.post('/create', upload.single('image'), async (req, res) => {
    try {
        const { content, author } = req.body;
        // If image uploaded, get URL
        const mediaURL = req.file ? req.file.path : '';

        if (!content && !mediaURL) return res.status(400).json({ success: false, message: 'Content or Image is required' });

        const hashtags = extractHashtags(content || '');

        const newTrend = new Trend({
            content: content || '',
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

// Repost a Trend
router.post('/repost/:id', async (req, res) => {
    try {
        const { userId, content } = req.body; // Optional content for quote repost
        const originalTrendId = req.params.id;

        const originalTrend = await Trend.findById(originalTrendId);
        if (!originalTrend) return res.status(404).json({ success: false, message: 'Trend not found' });

        const newTrend = new Trend({
            content: content || '', // Quote content (optional)
            author: userId,
            originalTrend: originalTrendId,
            isRepost: true,
            hashtags: extractHashtags(content || '')
        });

        await newTrend.save();

        // Award points even for reposts? Maybe less points or none. Let's keep it simple for now.

        res.status(201).json({ success: true, trend: newTrend });
    } catch (error) {
        console.error('Error reposting:', error);
        res.status(500).json({ success: false, message: 'Failed to repost' });
    }
});

// Comment on a Trend
router.post('/comment/:id', async (req, res) => {
    try {
        const { userId, text } = req.body;
        const trend = await Trend.findById(req.params.id);

        if (!trend) return res.status(404).json({ success: false, message: 'Trend not found' });

        const comment = {
            user: userId,
            text,
            createdAt: new Date()
        };

        trend.comments.push(comment);
        await trend.save();

        // Populate the user in the new comment to return it
        const populatedTrend = await Trend.findById(req.params.id).populate('comments.user', 'username profilePicture');
        // Return only the last comment usually, but here returning the list of comments or the updated trend
        const addedComment = populatedTrend.comments[populatedTrend.comments.length - 1];

        res.status(201).json({ success: true, comment: addedComment });
    } catch (error) {
        console.error('Error commenting:', error);
        res.status(500).json({ success: false, message: 'Failed to comment' });
    }
});

// Get Feed (All posts for now, can implement pagination)
router.get('/feed', async (req, res) => {
    try {
        const trends = await Trend.find()
            .populate('author', 'username profilePicture')
            .populate({
                path: 'originalTrend',
                populate: { path: 'author', select: 'username profilePicture' }
            })
            .populate('comments.user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(50); // Limit for performance

        res.status(200).json({ success: true, trends });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch feed' });
    }
});

// Get Trending Hashtags (Enhanced - considers engagement)
router.get('/trending', async (req, res) => {
    try {
        const { getTrendingTopics } = require('../../utils/trendingAlgorithm');
        const trendingTopics = await getTrendingTopics(10);
        res.status(200).json({ success: true, trends: trendingTopics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch trending topics' });
    }
});

// Get Trending Posts (NEW - engagement-based)
router.get('/trending-posts', async (req, res) => {
    try {
        const { getTrendingPosts } = require('../../utils/trendingAlgorithm');
        const trendingPosts = await getTrendingPosts(10);
        res.status(200).json({ success: true, trends: trendingPosts });
    } catch (error) {
        console.error('Error fetching trending posts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch trending posts' });
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
