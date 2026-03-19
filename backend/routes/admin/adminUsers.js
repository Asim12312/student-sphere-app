const express = require('express');
const router = express.Router();
const User = require('../../models/user');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT change user role
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT toggle ban status
router.put('/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle the status
    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: user.isBanned ? 'User has been banned.' : 'User ban lifted.',
      isBanned: user.isBanned,
      user: {
        _id: user._id,
        username: user.username,
        userEmail: user.userEmail,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    console.error('Error toggling ban status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
