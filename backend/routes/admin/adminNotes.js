const express = require('express');
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./../../cloudinary/cloudinaryConfig');
const Note = require('./../../models/note');

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'notes',
    resource_type: 'raw',
    use_filename: true,
    unique_filename: false,
  },
});

const upload = multer({ storage });

// Upload new note
router.post('/upload', upload.single('file'), async (req, res) => {
  const { title, course, userId } = req.body;

  try {
    // Validation
    if (!title || !course || !req.file || !userId) {
      return res.status(400).json({ 
        message: 'Title, course, file, and userId are required' 
      });
    }

    const originalName = req.file.originalname;
    // Store extension without leading dot
    const extension = path.extname(originalName).replace(/^\./, '');
    const downloadUrl = req.file.path.replace('/upload/', '/upload/fl_attachment/');

    const note = new Note({
      title,
      course,
      fileUrl: downloadUrl,
      originalName,
      extension,
      uploadedBy: userId
    });

    await note.save();
    res.status(201).json({ message: 'Note uploaded successfully', note });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Get all notes
router.get('/notes', async (req, res) => {
  try {
    let notes = await Note.find().sort({ uploadedAt: -1 });
    // Filter out notes missing required fields
    const validNotes = notes.filter(note => note.title && note.course && note.uploadedBy);
    if (validNotes.length !== notes.length) {
      console.warn('Some notes are missing required fields and were excluded from the response.');
    }
    res.json(validNotes);
  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ message: 'Could not fetch notes', error: error.message });
  }
});

// Update note (PUT /notes/:id)
router.put('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, course } = req.body;

    // Validation
    if (!title || !course) {
      return res.status(400).json({ 
        message: 'Title and course are required' 
      });
    }

    // Check if note exists
    const existingNote = await Note.findById(id);
    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Update the note
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { 
        title: title.trim(), 
        course: course.trim(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: 'Note updated successfully', 
      note: updatedNote 
    });

  } catch (error) {
    console.error('Update error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete note (DELETE /notes/:id)
router.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if note exists
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Delete file from Cloudinary
    try {
      // Extract public_id from the file URL
      const urlParts = note.fileUrl.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = `notes/${publicIdWithExtension.split('.')[0]}`;
      
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (cloudinaryError) {
      console.warn('Failed to delete file from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete note from database
    await Note.findByIdAndDelete(id);

    res.status(200).json({ 
      message: 'Note deleted successfully',
      deletedNoteId: id 
    });

  } catch (error) {
    console.error('Delete error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get single note by ID (optional - for future use)
router.get('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Search notes (optional - for advanced search functionality)
router.get('/search', async (req, res) => {
  try {
    const { title, course } = req.query;
    let query = {};
    
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    
    if (course) {
      query.course = course;
    }
    
    const notes = await Note.find(query).sort({ uploadedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

// Get notes uploaded by a specific user
router.get('/user-notes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notes = await Note.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Fetch user notes error:', error);
    res.status(500).json({ message: 'Could not fetch user notes', error: error.message });
  }
});

module.exports = router;