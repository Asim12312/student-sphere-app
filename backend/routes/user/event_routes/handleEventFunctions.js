const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('./../../../models/event');
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../../cloudinary/cloudinaryConfig');
const Club = require('./../../../models/clubModel');
const User = require('./../../../models/user');
const Notification = require('./../../../models/notificationModel');
router.use(express.json());
// Cloudinary storage config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'banners',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
    },
});
const upload = multer({ storage: storage });

// Create Event Route
router.post('/createEvent', upload.single('image'), async (req, res) => {
    try {
        const {
            title,
            description,
            venue,
            startDate,
            endDate,
            capacity,
            ticketPrice,
            clubId,
            userId
        } = req.body;

        console.log('Received data:', { title, description, venue, startDate, endDate, capacity, ticketPrice, clubId, userId });
        console.log('File:', req.file);

        // Validate clubId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(clubId)) {
            console.log('Invalid clubId:', clubId);
            return res.status(400).json({ message: 'Invalid club ID format' });
        }

        // Validate userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid userId:', userId);
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Cloudinary image URL
        const fullImageURL = req.file?.path || null;
        let thumbnailURL = null;

        if (req.file?.filename) {
            thumbnailURL = cloudinary.url(req.file.filename, {
                width: 600,
                quality: 70,
                crop: "scale",
                fetch_format: "auto"
            });
        }


        const event = new Event({
            title,
            description,
            venue,
            startDate,
            endDate,
            capacity,
            bannerImage: fullImageURL,
            ticketPrice,
            createdInClub: clubId,
            createdBy: userId,
            thumbnailURL
        });

        const club = await Club.findById(clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isOwner = club.createdBy.toString() === userId;
        const isMember = club.members.some(memberId => memberId.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'You must be a member of the club to create an event.' });
        }

        if (isOwner) {
            event.status = "approved";
        }
        else {
            event.status = "pending";
        }
        club.events.push(event._id);
        await club.save();

        await event.save();

        if (event.status === 'pending') {
            const notification = new Notification({
                recipient: club.createdBy,
                sender: userId,
                type: 'EVENT_REQUEST',
                message: `${user.username || 'A member'} requested to create an event: ${title}`,
                relatedId: event._id,
                relatedModel: 'Event'
            });
            await notification.save();
        }

        return res.status(200).json({ message: isOwner ? 'Event created successfully' : 'Event sent for approval to admin' });
    }
    catch (error) {
        console.error("Error creating event:", error.message);
        res.status(500).json({ message: error.message });
    }
});

router.post('/getEvents', async (req, res) => {
    try {
        const { userClubs, userId } = req.body;

        let allClubIds = [];

        // Add joined clubs if provided
        if (Array.isArray(userClubs) && userClubs.length > 0) {
            allClubIds = [...userClubs];
        }

        // If userId is provided, find clubs created by this user
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const createdClubs = await Club.find({ createdBy: userId }).select('_id');
            const createdClubIds = createdClubs.map(club => club._id.toString());
            allClubIds = [...allClubIds, ...createdClubIds];
        }

        // Deduplicate IDs
        allClubIds = [...new Set(allClubIds)];

        if (allClubIds.length === 0) {
            return res.status(200).json({ events: [] });
        }

        const clubs = await Club.find({ _id: { $in: allClubIds } }).populate({
            path: 'events',
            match: { status: 'approved' }
        });

        if (!clubs || clubs.length === 0) {
            return res.status(200).json({ events: [] });
        }

        // Collect all events from all clubs
        const events = clubs.flatMap(club => club.events || []);

        return res.status(200).json({ events });
    } catch (err) {
        console.error("Error fetching events:", err.message);
        return res.status(500).json({ message: err.message });
    }
});


// Get Event Details
router.get('/getEvent/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).populate('createdBy', 'username email profilePicture');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.status(200).json({ success: true, event });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Approve Event
router.post('/approveEvent', async (req, res) => {
    try {
        const { eventId, adminId, notificationId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const club = await Club.findById(event.createdInClub);
        if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

        if (club.createdBy.toString() !== adminId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        event.status = 'approved';
        await event.save();

        // Mark notification as read if provided
        if (notificationId) {
            await Notification.findByIdAndUpdate(notificationId, { read: true });
        }

        // Notify creator
        const notification = new Notification({
            recipient: event.createdBy,
            sender: adminId,
            type: 'EVENT_APPROVED',
            message: `Your event "${event.title}" has been approved!`,
            relatedId: event._id,
            relatedModel: 'Event'
        });
        await notification.save();

        res.status(200).json({ success: true, message: 'Event approved' });
    } catch (error) {
        console.error('Error approving event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Reject Event
router.post('/rejectEvent', async (req, res) => {
    try {
        const { eventId, adminId, notificationId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const club = await Club.findById(event.createdInClub);
        if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

        if (club.createdBy.toString() !== adminId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        event.status = 'rejected';
        await event.save();

        // Mark notification as read if provided
        if (notificationId) {
            await Notification.findByIdAndUpdate(notificationId, { read: true });
        }

        // Notify creator
        const notification = new Notification({
            recipient: event.createdBy,
            sender: adminId,
            type: 'EVENT_REJECTED',
            message: `Your event "${event.title}" was rejected.`,
            relatedId: event._id,
            relatedModel: 'Event'
        });
        await notification.save();

        res.status(200).json({ success: true, message: 'Event rejected' });
    } catch (error) {
        console.error('Error rejecting event:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
