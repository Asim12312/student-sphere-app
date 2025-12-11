const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./../models/user');

router.post('/signup', async (req, res) => {
  try {
    const data = req.body;
    const newUser = new User(data);
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword;
    const response = await newUser.save();
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { userEmail, password } = req.body;
    if (!userEmail || !password) {
      return res.status(400).json({ error: 'userEmail and password are required' });
    }
    const user = await User.findOne({ userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, "asim123");

    res.json({
      token,
      userId: user._id,
      role: user.role,
      username: user.username,
      email: user.userEmail,
      gender: user.gender
    });

  } catch (error) {
    console.log('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

router.put("/update", async (req, res) => {
  try {
    const userId = req.header('id');
    const updatedData = {
      username: req.body.username,
      userEmail: req.body.userEmail,
      gender: req.body.gender,
      password: req.body.password,
    };

    // Hash password only if provided
    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    } else {
      delete updatedData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    if (updatedUser) {
      const payload = { id: updatedUser._id, role: updatedUser.role };
      const token = jwt.sign(payload, "asim123");

      res.json({
        token,
        userId: updatedUser._id,
        role: updatedUser.role,
        username: updatedUser.username,
        email: updatedUser.userEmail,
        gender: updatedUser.gender
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getUserClubs", async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const clubs = user.joinedClubs;
    if (!clubs) {
      return res.status(404).json({ error: "Clubs not found" });
    }
    res.json(clubs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
})

module.exports = router;
