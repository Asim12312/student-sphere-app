const express = require('express');
const router = express.Router();
const Event = require('../../models/event');

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'username email')
      .populate('createdInClub', 'name')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET pending events
router.get('/pending', async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('createdBy', 'username email')
      .populate('createdInClub', 'name')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching pending events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update event status (approve/reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status specified.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('createdBy', 'username').populate('createdInClub', 'name');

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event successfully deleted.', deletedId: id });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
