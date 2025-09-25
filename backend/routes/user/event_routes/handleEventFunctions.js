const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('./../../../models/event');
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../../cloudinary/cloudinaryConfig');

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

        await event.save();
        return res.status(200).json({ message: 'Event sent for approval to admin' });
    }
    catch (error) {
        console.error("Error creating event:", error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
