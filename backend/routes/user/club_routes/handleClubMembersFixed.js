const express = require('express');
const Club = require('../../../models/clubModel');
const User = require('../../../models/user')
const router = express.Router();

// GET ALL MEMBERS OF A SPECIFIC CLUB WITH PROPER POPULATION
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
      select: 'username email profileImage fullName createdAt',
      model: User
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Format members data with proper role assignment
    const members = club.members.map(member => ({
      id: member._id,
      username: member.username,
      email: member.email,
      profileImage: member.profileImage || '/male default avatar.png',
      fullName: member.fullName || member.username,
      role: club.createdBy.toString() === member._id.toString() ? 'admin' : 'member',
      joinedDate: new Date()
    }));

    res.status(200).json({
      success: true,
      members,
      totalMembers: members.length,
      clubName: club.name
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

// GET MEMBERS COUNT FOR MULTIPLE CLUBS
router.post('/clubMembersCount', async (req, res) => {
  try {
    const { clubs } = req.body;
    
    if (!clubs || !Array.isArray(clubs)) {
      return res.status(400).json({
        success: false,
        message: 'Clubs array is required'
      });
    }

    const clubIds = clubs.map(club => club._id || club.id);
    
    const clubDocs = await Club.find({ _id: { $in: clubIds } })
      .select('_id members name')
      .populate('members', 'username email profileImage fullName');

    const membersCount = clubDocs.map(club => ({
      clubId: club._id,
      clubName: club.name,
      count: club.members.length,
      members: club.members.slice(0, 3) // Return first 3 members for preview
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

// GET MEMBER COUNT FOR SINGLE CLUB
router.get('/clubMemberCount/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required'
      });
    }

    const club = await Club.findById(clubId).populate('members', 'username email profileImage fullName');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    res.status(200).json({
      success: true,
      clubId,
      memberCount: club.members.length,
      members: club.members
    });
  } catch (error) {
    console.error('Error fetching club member count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch club member count',
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

    if (!club || !user) {
      return res.status(404).json({
        success: false,
        message: 'Club or User not found'
      });
    }

    if (club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User already a member of this club'
      });
    }

    club.members.push(userId);
    user.joinedClubs.push(clubId);
    await user.save();
    await club.save();

    const updatedClub = await Club.findById(clubId).populate('members', 'username email profileImage fullName');

    res.status(200).json({
      success: true,
      message: 'Successfully joined the club',
      club: updatedClub,
      memberCount: updatedClub.members.length
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

    if (!club.members.includes(userId) || !user.joinedClubs.includes(clubId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this club'
      });
    }

    club.members = club.members.filter(member => member.toString() !== userId);
    user.joinedClubs = user.joinedClubs.filter(joinedClub => joinedClub.toString() !== clubId);

    await club.save();
    await user.save();

    const updatedClub = await Club.findById(clubId).populate('members', 'username email profileImage fullName');

    res.status(200).json({
      success: true,
      message: 'Successfully left the club',
      club: updatedClub,
      memberCount: updatedClub.members.length
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

module.exports = router;
