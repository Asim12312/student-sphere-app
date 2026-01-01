const express = require('express');
const router = express.Router();
const ProfilePost = require('../../models/profilePostModel');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../cloudinary/cloudinaryConfig');

// Configure Cloudinary for post media
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile-posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4'],
        resource_type: 'auto'
    },
});

const upload = multer({ storage });

// Create a profile post
router.post('/create', upload.array('media', 5), async (req, res) => {
    try {
        const { author, content, visibility } = req.body;

        const mediaUrls = req.files ? req.files.map(file => file.path) : [];

        if (!content && mediaUrls.length === 0) {
            return res.status(400).json({ success: false, message: 'Post must have content or media' });
        }

        const newPost = new ProfilePost({
            author,
            content: content || '',
            media: mediaUrls,
            visibility: visibility || 'public'
        });

        await newPost.save();

        const populatedPost = await ProfilePost.findById(newPost._id)
            .populate('author', 'username profilePicture');

        res.status(201).json({ success: true, post: populatedPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
});

// Get posts by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await ProfilePost.find({ author: req.params.userId })
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, posts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
});

// Like/Unlike a post
router.post('/like/:postId', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await ProfilePost.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const index = post.likes.indexOf(userId);
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json({ success: true, likes: post.likes });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ success: false, message: 'Failed to like post' });
    }
});

// Comment on a post
router.post('/comment/:postId', async (req, res) => {
    try {
        const { userId, text } = req.body;
        const post = await ProfilePost.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const comment = {
            user: userId,
            text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        const populatedPost = await ProfilePost.findById(req.params.postId)
            .populate('comments.user', 'username profilePicture');

        const addedComment = populatedPost.comments[populatedPost.comments.length - 1];

        res.status(201).json({ success: true, comment: addedComment });
    } catch (error) {
        console.error('Error commenting:', error);
        res.status(500).json({ success: false, message: 'Failed to comment' });
    }
});

// Delete a post
router.delete('/:postId', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await ProfilePost.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check ownership
        if (post.author.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await ProfilePost.findByIdAndDelete(req.params.postId);
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
});

// Get feed (posts from followed users)
router.get('/feed/:userId', async (req, res) => {
    try {
        const User = require('../../models/user');
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get posts from user's following list + own posts
        const followingIds = [...user.following, user._id];

        const posts = await ProfilePost.find({
            author: { $in: followingIds },
            visibility: { $in: ['public', 'followers'] }
        })
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, posts });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch feed' });
    }
});

module.exports = router;
