const mongoose = require('mongoose');

const clubCreationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  imageURL: {
    type: String,
    required: [true, 'Image URL is required']
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId], // Optional: Reference actual user IDs
    ref: 'User',
    default: []
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId], // Optional: Reference actual post IDs
    ref: 'Post',
    default: []
  },
  events: {
    type: [mongoose.Schema.Types.ObjectId], // Optional: Reference actual post IDs
    ref: 'Event',
    default: []
  }

});

const Club = mongoose.model('Club', clubCreationSchema);

module.exports = Club;
