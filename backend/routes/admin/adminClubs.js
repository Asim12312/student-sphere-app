const express = require('express');
const router = express.Router();
const Club = require('../../models/clubModel');

// GET all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate('createdBy', 'username userEmail')
      .sort({ createdAt: -1 });
    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE club
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClub = await Club.findByIdAndDelete(id);

    if (!deletedClub) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json({ message: 'Club successfully deleted.', deletedId: id });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
