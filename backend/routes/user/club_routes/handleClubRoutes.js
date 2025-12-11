const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../../cloudinary/cloudinaryConfig');
const Club = require('../../../models/clubModel');

const router = express.Router();

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clubs',
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
  },
});

// Multer setup
const upload = multer({ storage });

// Route to create club
router.post('/createClub', upload.single('image'), async (req, res) => {
  try {
    const { name, description, createdBy, privacy } = req.body;

    if (!name || !description || !createdBy) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const imageURL = req.file?.path;
    if (!imageURL) {
      return res.status(400).json({ message: 'Club image is required' });
    }

    const club = new Club({
      name,
      description,
      imageURL,
      createdBy,
      privacy: privacy || 'public'
    });

    await club.save();
    res.status(201).json({ message: 'Club created successfully', club });

  } catch (error) {
    console.error('Club creation error:', error);
    res.status(500).json({ message: 'Club creation failed', error: error.message });
  }
});

// Get clubs created by user
router.get('/getClubs/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const clubs = await Club.find({ createdBy: userId }).populate('createdBy', 'imageURL description name email');
    const members = clubs.reduce((total, club) => total + (club.members?.length || 0), 0);

    res.status(200).json({ clubs, members });

  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Failed to fetch clubs', error: error.message });
  }
});

router.post('/getJoinedClubs', async (req, res) => {
  const { clubIds } = req.body;

  try {
    const clubs = await Club.find({ _id: { $in: clubIds } });
    res.json({ success: true, clubs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.post('/getAllClubs', async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const skip = (page - 1) * limit;

    const clubs = await Club.find({ createdBy: { $ne: userId } })
      .populate('createdBy', 'name email imageURL')
      .skip(skip)
      .limit(limit);

    const totalClubs = await Club.countDocuments({ createdBy: { $ne: userId } });

    res.status(200).json({
      total: totalClubs,
      page,
      totalPages: Math.ceil(totalClubs / limit),
      clubs,
    });

  } catch (err) {
    console.error('Error fetching clubs:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/specificClub/:id', async (req, res) => {
  try {
    const clubId = req.params.id;
    if (!clubId) {
      return res.status(400).json({ message: 'Club ID is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.status(200).json(club);

  } catch (error) {
    console.error('Error fetching specific club:', error);
    res.status(500).json({ message: 'Failed to fetch club', error: error.message });
  }
});

router.delete('/deleteClub/:id', async (req, res) => {
  try {
    const clubId = req.params.id;
    if (!clubId) {
      return res.status(400).json({ message: 'Club ID is required' });
    }

    const club = await Club.findByIdAndDelete(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.status(200).json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ message: 'Failed to delete club', error: error.message });
  }
});

router.post('/editClub/:id', upload.single('image'), async (req, res) => {
  try {
    const clubId = req.params.id;
    const { name, description } = req.body;

    if (!clubId) {
      return res.status(400).json({ message: 'Club ID required' });
    }

    const updateData = { name, description };
    if (req.file) {
      updateData.imageURL = req.file.path;
    }

    const updatedClub = await Club.findByIdAndUpdate(clubId, updateData, { new: true });
    if (!updatedClub) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.status(200).json({ message: 'Club updated successfully', club: updatedClub });
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ message: 'Failed to update club', error: error.message });
  }
});

module.exports = router;
