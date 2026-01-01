const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../cloudinary/cloudinaryConfig');

// Configure Cloudinary for cover photos
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cover-photos',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        resource_type: 'image'
    },
});

const upload = multer({ storage });

// Get user profile by username or ID
router.get('/profile/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;

        // Try to find by username first, then by ID
        let user = await User.findOne({ username: identifier })
            .select('-password')
            .populate('followers', 'username profilePicture')
            .populate('following', 'username profilePicture');

        if (!user) {
            user = await User.findById(identifier)
                .select('-password')
                .populate('followers', 'username profilePicture')
                .populate('following', 'username profilePicture');
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// Update profile info
router.put('/profile/update', async (req, res) => {
    try {
        const { userId, bio, location, website, birthdate, privacy } = req.body;

        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (website !== undefined) updateData.website = website;
        if (birthdate !== undefined) updateData.birthdate = birthdate;
        if (privacy !== undefined) updateData.privacy = privacy;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// Upload cover photo
router.post('/profile/upload-cover', upload.single('cover'), async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { coverPhoto: req.file.path },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, coverPhoto: user.coverPhoto });
    } catch (error) {
        console.error('Error uploading cover photo:', error);
        res.status(500).json({ success: false, message: 'Failed to upload cover photo' });
    }
});

// Upload profile picture
router.post('/profile/upload-picture', upload.single('picture'), async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { profilePicture: req.file.path },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
    }
});

// Follow a user
router.post('/follow/:targetUserId', async (req, res) => {
    try {
        const { userId } = req.body; // Current user
        const { targetUserId } = req.params; // User to follow

        if (userId === targetUserId) {
            return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
        }

        // Add to following list
        const currentUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { following: targetUserId } },
            { new: true }
        );

        // Add to followers list
        const targetUser = await User.findByIdAndUpdate(
            targetUserId,
            { $addToSet: { followers: userId } },
            { new: true }
        );

        if (!currentUser || !targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            followingCount: currentUser.following.length,
            followersCount: targetUser.followers.length
        });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ success: false, message: 'Failed to follow user' });
    }
});

// Unfollow a user
router.post('/unfollow/:targetUserId', async (req, res) => {
    try {
        const { userId } = req.body;
        const { targetUserId } = req.params;

        // Remove from following list
        const currentUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { following: targetUserId } },
            { new: true }
        );

        // Remove from followers list
        const targetUser = await User.findByIdAndUpdate(
            targetUserId,
            { $pull: { followers: userId } },
            { new: true }
        );

        if (!currentUser || !targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            followingCount: currentUser.following.length,
            followersCount: targetUser.followers.length
        });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ success: false, message: 'Failed to unfollow user' });
    }
});

// Get followers list
router.get('/followers/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('followers', 'username profilePicture bio');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, followers: user.followers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch followers' });
    }
});

// Get following list
router.get('/following/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('following', 'username profilePicture bio');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, following: user.following });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch following' });
    }
});

// Get friend suggestions (users in same clubs, mutual connections)
router.get('/suggestions/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('clubsJoined');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find users in same clubs
        const clubIds = user.clubsJoined.map(club => club._id);
        const usersInSameClubs = await User.find({
            clubsJoined: { $in: clubIds },
            _id: { $ne: user._id, $nin: user.following }
        })
            .select('username profilePicture bio')
            .limit(10);

        res.json({ success: true, suggestions: usersInSameClubs });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch suggestions' });
    }
});

module.exports = router;
