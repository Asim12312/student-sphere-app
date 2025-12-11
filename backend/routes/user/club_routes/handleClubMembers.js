const express = require('express');
const Club = require('../../../models/clubModel');
const User = require('../../../models/user')
const router = express.Router();

// CHECK MEMBERSHIP STATUS
router.get('/checkMembership/:userId/:clubId', async (req, res) => {
  try {
    const { userId, clubId } = req.params;

    if (!userId || !clubId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Club ID are required'
      });
    }

    const club = await Club.findById(clubId);
    const user = await User.findById(userId);

    if (!club || !user) {
      return res.status(404).json({
        success: false,
        message: 'Club or User not found'
      });
    }

    const isMember = club.members.some(m => m.toString() === userId.toString()) && user.joinedClubs.some(c => c.toString() === clubId.toString());

    res.status(200).json({
      success: true,
      isMember
    });
  } catch (error) {
    console.error('Error checking membership:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check membership',
      error: error.message
    });
  }
});

// JOIN CLUB
router.post('/joinClub', async (req, res) => {
  try {
    const { clubId, userId } = req.body;

    if (!clubId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID and User ID are required'
      });
    }

    const club = await Club.findById(clubId);
    const user = await User.findById(userId);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a member
    if (club.members.some(m => m.toString() === userId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'User already a member of this club'
      });
    }

    // Check if it's a private club
    if (club.privacy === 'private') {
      // Check if request already exists
      const existingRequest = club.joinRequests.find(
        req => req.user.toString() === userId.toString() && req.status === 'pending'
      );

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Join request already sent'
        });
      }

      // Add to join requests
      club.joinRequests.push({ user: userId });
      await club.save();

      const Notification = require('../../../models/notificationModel');
      const notification = new Notification({
        recipient: club.createdBy,
        sender: userId,
        type: 'JOIN_REQUEST',
        message: `${user.username} requested to join your club ${club.name}`,
        relatedId: club._id,
        relatedModel: 'Club'
      });
      const savedNotif = await notification.save();
      console.log('Notification saved:', savedNotif);

      return res.status(200).json({
        success: true,
        message: 'Join request sent successfully',
        club
      });
    }

    // Public club - Join directly
    club.members.push(userId);
    user.joinedClubs.push(clubId);
    await user.save();
    await club.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the club',
      club
    });
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join club',
      error: error.message
    });
  }
});

// LEAVE CLUB
router.post('/leaveClub', async (req, res) => {
  try {
    const { clubId, userId } = req.body;
    if (!clubId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID and User ID are required'
      });
    }

    const club = await Club.findById(clubId);
    const user = await User.findById(userId);

    if (!club || !user) {
      return res.status(404).json({
        success: false,
        message: 'Club or User not found'
      });
    }

    if (!club.members.some(m => m.toString() === userId.toString()) || !user.joinedClubs.some(c => c.toString() === clubId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this club'
      });
    }

    // Remove user from club members
    club.members = club.members.filter(member => member.toString() !== userId);

    // Remove club from user's joined clubs
    user.joinedClubs = user.joinedClubs.filter(joinedClub => joinedClub.toString() !== clubId);

    await club.save();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the club',
      club
    });
  } catch (error) {
    console.error('Error leaving club:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave club',
      error: error.message
    });
  }
});

// GET USER'S JOINED CLUBS
router.post('/userJoinedClubs', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId).populate('joinedClubs');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      joinedClubs: user.joinedClubs
    });
  } catch (error) {
    console.error('Error fetching user joined clubs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.post('/clubMembersCount', async (req, res) => {
  try {
    const { clubs } = req.body; // clubs is an array of club objects or at least contains _id
    const clubIds = clubs.map(club => club._id); // extract only _id

    const clubDocs = await Club.find({ _id: { $in: clubIds } });

    const membersCount = clubDocs.map(club => ({
      clubId: club._id,
      count: club.members.length
    }));

    res.status(200).json({
      success: true,
      membersCount: membersCount
    });
  } catch (error) {
    console.error('Error fetching club members count:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


// GET ALL MEMBERS OF A SPECIFIC CLUB
router.get('/clubMembers/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required'
      });
    }

    const club = await Club.findById(clubId).populate({
      path: 'members',
      select: 'username email profileImage username role',
      model: User
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Format members data
    const members = club.members.map(member => ({
      id: member._id,
      username: member.username,
      email: member.email,
      profileImage: member.profileImage || '/default-avatar.png',
      fullName: member.fullName || member.username,
      role: club.createdBy.toString() === member._id.toString() ? 'admin' : 'member',
      joinedDate: club.members.find(m => m._id.toString() === member._id.toString())?.joinedDate || new Date()
    }));

    res.status(200).json({
      success: true,
      members,
      totalMembers: members.length
    });
  } catch (error) {
    console.error('Error fetching club members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch club members',
      error: error.message
    });
  }
});

module.exports = router
