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
  posts:{
    type: [mongoose.Schema.Types.ObjectId], // Optional: Reference actual post IDs
    ref: 'Post',
    default: []
  }

});

const Club = mongoose.model('Club', clubCreationSchema);

module.exports = Club;
