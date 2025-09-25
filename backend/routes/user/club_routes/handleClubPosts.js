const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Post = require('../../../models/clubPosts');
const User = require('../../../models/user');
const Club = require('../../../models/clubModel');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../../cloudinary/cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'posts',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
    },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { description, clubId, userId, likes, comments } = req.body;

        if (!clubId || !userId || !description) {
            return res.status(400).json({ message: 'Club ID, User ID, and description are required' });
        }

        const user = await User.findById(userId);
        const club = await Club.findById(clubId);
        if (!user || !club) {
            return res.status(404).json({ message: 'Club or User not found' });
        }

        if (!club.members.includes(user._id)) {
            return res.status(403).json({ message: 'You are not a club member' });
        }

        // Cloudinary original file path
        const fullImageURL = req.file?.path || null;

        // Create a thumbnail URL from Cloudinary (width: 600px, quality: 70)
        let thumbnailURL = null;
        if (req.file?.filename) {
            thumbnailURL = cloudinary.url(req.file.filename, {
                folder: "posts",
                width: 600,
                quality: 70,
                crop: "scale",
                fetch_format: "auto"
            });
        }

        const post = new Post({
            description,
            clubId,
            userId,
            username: user.username,
            likes: likes || 0,
            comments: comments || [],
            imageURL: fullImageURL,
            thumbnailURL: thumbnailURL || fullImageURL // fallback if thumb not generated
        });

        await post.save();

        club.posts.push(post._id);
        await club.save();

        return res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/addComment', async (req, res) => {
    try {
        const { postId, userId, text } = req.body;

        const user = await User.findById(userId);
        const post = await Post.findById(postId);

        if (!user || !post) {
            return res.status(404).json({ message: 'User or post not found' });
        }

        const comment = {
            userId: userId,
            username: user.username,
            text: text,
            createdAt: new Date()
        };

        post.comments.push(comment);

        await post.save();

        return res.status(201).json({
            message: 'Comment added successfully',
            comment
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(400).json({ message: 'Invalid request' });
    }
});


router.post('/getPosts', async (req, res) => {
    try {
        const { clubId } = req.body; // destructure correctly

        if (!clubId) {
            return res.status(400).json({ message: 'Club ID is required' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ clubId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ posts });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Rate limiting middleware for reactions
const reactionCooldown = new Map();

const checkReactionCooldown = (req, res, next) => {
    const { userId } = req.body;
    const lastReaction = reactionCooldown.get(userId);
    
    if (lastReaction && Date.now() - lastReaction < 2000) { // 2 second cooldown
        return res.status(429).json({ 
            message: 'Please wait before reacting again',
            cooldown: 2000 - (Date.now() - lastReaction)
        });
    }
    
    next();
};

router.post('/likeUnlikePost', checkReactionCooldown, async (req, res) => {
    try {
        const { postId, userId, action } = req.body;

        if (!postId || !userId || !action) {
            return res.status(400).json({ message: 'Post ID, User ID, and action are required' });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userLiked = post.likedBy.includes(userId);
        const userDisliked = post.dislikedBy.includes(userId);

        if (action === 'like') {
            if (userLiked) {
                // Unlike: remove from likedBy and decrement likes
                post.likedBy.pull(userId);
                post.likes = Math.max(0, post.likes - 1);
            } else {
                // Like: add to likedBy and increment likes
                post.likedBy.push(userId);
                post.likes += 1;

                // Remove from disliked if exists
                if (userDisliked) {
                    post.dislikedBy.pull(userId);
                    post.dislikes = Math.max(0, post.dislikes - 1);
                }
            }
        } else if (action === 'dislike') {
            if (userDisliked) {
                // Undislike: remove from dislikedBy and decrement dislikes
                post.dislikedBy.pull(userId);
                post.dislikes = Math.max(0, post.dislikes - 1);
            } else {
                // Dislike: add to dislikedBy and increment dislikes
                post.dislikedBy.push(userId);
                post.dislikes += 1;

                // Remove from liked if exists
                if (userLiked) {
                    post.likedBy.pull(userId);
                    post.likes = Math.max(0, post.likes - 1);
                }
            }
        }

        await post.save();
        
        // Update cooldown
        reactionCooldown.set(userId, Date.now());
        
        // Clean up old entries (optional: prevent memory leak)
        setTimeout(() => reactionCooldown.delete(userId), 5000);

        // Return updated post data
        const updatedPost = await Post.findById(postId)
            .populate('likedBy', 'username')
            .populate('dislikedBy', 'username');

        return res.status(200).json({
            message: 'Action completed successfully',
            post: {
                ...updatedPost.toObject(),
                userLiked: updatedPost.likedBy.some(user => user._id.toString() === userId),
                userDisliked: updatedPost.dislikedBy.some(user => user._id.toString() === userId)
            }
        });
    }
    catch (error) {
        console.error('Error liking/disliking post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// New endpoint to get post reactions for a user
router.post('/getPostReactions', async (req, res) => {
    try {
        const { postIds, userId } = req.body;

        if (!postIds || !userId) {
            return res.status(400).json({ message: 'Post IDs and User ID are required' });
        }

        const posts = await Post.find({ _id: { $in: postIds } })
            .select('likes dislikes likedBy dislikedBy');

        const reactions = posts.map(post => ({
            postId: post._id,
            likes: post.likes,
            dislikes: post.dislikes,
            userLiked: post.likedBy.includes(userId),
            userDisliked: post.dislikedBy.includes(userId)
        }));

        return res.status(200).json({ reactions });
    } catch (error) {
        console.error('Error fetching post reactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})   

router.get('/feedPosts', async (req, res) => {
    try {
        const { userId, page = 1, limit = 10, fetchLimit = 100 } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        // Get user's joined clubs
        const user = await User.findById(userId).select('joinedClubs').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has joined any clubs
        if (!user.joinedClubs || user.joinedClubs.length === 0) {
            return res.status(200).json({ posts: [] });
        }

        // Convert string IDs to ObjectId safely
        const clubObjectIds = user.joinedClubs
            .filter(id => mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id));

        if (clubObjectIds.length === 0) {
            return res.status(200).json({ posts: [] });
        }

        // Aggregation: calculate engagement and sort
        const posts = await Post.aggregate([
            {
                $match: {
                    clubId: { $in: clubObjectIds }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    engagementScore: {
                        $add: [
                            { $ifNull: ["$likes", 0] },
                            { $multiply: [{ $size: { $ifNull: ["$comments", []] } }, 2] }
                        ]
                    },
                    profilePic: "$user.profilePicture"
                }
            },
            { $sort: { engagementScore: -1, created_at: -1 } },
            { $limit: parseInt(fetchLimit) },
            {
                $project: {
                    description: 1,
                    imageURL: 1,
                    username: 1,
                    likes: 1,
                    dislikes: 1,
                    likedBy: 1,
                    dislikedBy: 1,
                    createdAt: "$created_at",
                    comments: 1,
                    thumbnailURL: 1,
                    clubId: 1,
                    userId: 1,
                    profilePic: 1
                }
            }
        ]);

        // Paginate
        const startIndex = (page - 1) * parseInt(limit);
        const paginatedPosts = posts.slice(startIndex, startIndex + parseInt(limit));

        return res.status(200).json({ posts: paginatedPosts });
    } catch (error) {
        console.error('Error fetching post feed:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});




module.exports = router;
